import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { PLANS_CONFIG } from '@/lib/billing/types';
import { ProductionLogger } from '@/lib/monitoring/logger';
import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { resolveAppUrl } from '@/lib/supabase/services/auth';

/**
 * /api/billing/verify — SERVER-SIDE RAZORPAY PAYMENT VERIFICATION
 *
 * Called after Razorpay payment modal closes with success.
 * This route:
 * 1. Validates HMAC-SHA256 signature using RAZORPAY_KEY_SECRET (server-only)
 * 2. Checks the business belongs to the logged-in user
 * 3. Activates the subscription in Supabase
 * 4. Logs SaaS revenue record
 * 5. Redirects to the success URL or /billing/success on failure
 *
 * SECURITY: The keySecret never reaches the browser. All verification is server-side.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const appUrl = resolveAppUrl();

  const paymentId = searchParams.get('razorpay_payment_id') || '';
  const orderId = searchParams.get('razorpay_order_id') || '';
  const signature = searchParams.get('razorpay_signature') || '';
  const plan = searchParams.get('plan') || '';
  const billingCycle = searchParams.get('billing_cycle') || 'monthly';
  let businessId = searchParams.get('business_id') || '';
  const successUrl = searchParams.get('success_url') || `${appUrl}/billing/success`;
  const failUrl = `${appUrl}/billing?failed=true`;

  // 1. Basic parameter validation
  if (!paymentId || !orderId || !signature || !businessId) {
    ProductionLogger.warn('BILLING', 'Missing required parameters', { paymentId, orderId, businessId });
    return NextResponse.redirect(new URL(failUrl, appUrl));
  }

  // 2. Validate plan server-side (prevent tampered plan in query string)
  if (!plan || !(plan in PLANS_CONFIG)) {
    ProductionLogger.warn('BILLING', `Invalid plan in verify request: ${plan}`);
    return NextResponse.redirect(new URL(failUrl, appUrl));
  }

  // 3. Verify the Razorpay payment signature (HMAC-SHA256)
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    ProductionLogger.error('BILLING', 'RAZORPAY_KEY_SECRET is not configured');
    return NextResponse.redirect(new URL(failUrl, appUrl));
  }

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const isSignatureValid = (() => {
    try {
      const a = Buffer.from(expectedSignature, 'utf8');
      const b = Buffer.from(signature, 'utf8');
      if (a.length !== b.length) return false;
      return crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  })();

  if (!isSignatureValid) {
    ProductionLogger.warn('BILLING', 'Razorpay signature verification failed', {
      orderId,
      paymentId,
      businessId,
    });
    return NextResponse.redirect(new URL(failUrl, appUrl));
  }

  ProductionLogger.info('BILLING', 'Signature verified', { orderId, paymentId, businessId });

  // 4. Verify the authenticated user owns this businessId
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let authenticatedUserId: string | null = null;
  if (supabaseUrl && supabaseAnonKey) {
    let response = NextResponse.next();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) { return req.cookies.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      authenticatedUserId = user.id;
      const adminSupabase = createAdminClient();
      const { data: membership } = await adminSupabase
        .from('business_members')
        .select('id')
        .eq('business_id', businessId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!membership) {
        const { data: userBiz } = await adminSupabase
          .from('business_members')
          .select('business_id')
          .eq('user_id', user.id)
          .order('is_primary', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (userBiz?.business_id) {
          businessId = userBiz.business_id;
        } else if (user.email) {
          // Fallback: check businesses table by user email
          const { data: bizByEmail } = await adminSupabase
            .from('businesses')
            .select('id')
            .eq('email', user.email)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (bizByEmail?.id) {
            businessId = bizByEmail.id;
            await adminSupabase.from('business_members').upsert(
              {
                business_id: bizByEmail.id,
                user_id: user.id,
                role: 'owner',
                is_primary: true,
              },
              { onConflict: 'business_id,user_id' }
            );
          } else {
            ProductionLogger.warn('BILLING', 'User does not belong to this business', {
              userId: user.id,
              businessId,
            });
            return NextResponse.redirect(new URL(failUrl, appUrl));
          }
        } else {
          ProductionLogger.warn('BILLING', 'User does not belong to this business', {
            userId: user.id,
            businessId,
          });
          return NextResponse.redirect(new URL(failUrl, appUrl));
        }
      }
    }
  }

  // 5. Idempotency: check if this payment was already processed
  const adminSupabase = createAdminClient();
  const idempotencyKey = `verify_rzp_${orderId}_${paymentId}`;

  const { data: existing } = await adminSupabase
    .from('audit_logs')
    .select('id')
    .eq('action', 'PAYMENT_VERIFIED')
    .eq('entity', 'subscription')
    .filter('metadata->idempotency_key', 'eq', idempotencyKey)
    .maybeSingle();

  if (existing) {
    ProductionLogger.info('BILLING', `Payment already processed (idempotent): ${idempotencyKey}`);
    return NextResponse.redirect(new URL(successUrl, appUrl));
  }

  // 6. Activate subscription
  const planConfig = PLANS_CONFIG[plan as keyof typeof PLANS_CONFIG];
  const price = billingCycle === 'annual' ? planConfig.priceAnnual : planConfig.priceMonthly;
  const now = new Date();
  const periodEnd = new Date(now);
  if (billingCycle === 'annual') {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  try {
    const { error: subError } = await adminSupabase.from('subscriptions').upsert(
      {
        business_id: businessId,
        ...(authenticatedUserId ? { user_id: authenticatedUserId } : {}),
        plan: plan as any,
        billing_cycle: billingCycle as any,
        status: 'active',
        selected_plan: plan as any,
        selected_billing_cycle: billingCycle as any,
        checkout_session_id: orderId,
        price_amount: price,
        currency: 'INR',
        provider: 'razorpay' as any,
        provider_subscription_id: paymentId,
        provider_customer_id: null,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false,
        updated_at: now.toISOString(),
      },
      { onConflict: 'business_id' }
    );

    if (subError) {
      ProductionLogger.error('BILLING', 'Failed to activate subscription', subError);
      return NextResponse.redirect(new URL(failUrl, appUrl));
    }

    // 7. Record subscription event
    try {
      await adminSupabase.from('subscription_events').insert({
        business_id: businessId,
        event_type: 'SUBSCRIPTION_ACTIVATED',
        to_plan: plan,
        metadata: {
          provider: 'razorpay',
          payment_id: paymentId,
          order_id: orderId,
          billing_cycle: billingCycle,
          amount: price,
          currency: 'USD',
        },
      });
    } catch {
      // Non-blocking
    }

    // 8. Record in audit log with idempotency key
    try {
      await adminSupabase.from('audit_logs').insert({
        business_id: businessId,
        action: 'PAYMENT_VERIFIED',
        entity: 'subscription',
        metadata: {
          idempotency_key: idempotencyKey,
          payment_id: paymentId,
          order_id: orderId,
          plan,
          billing_cycle: billingCycle,
          amount: price,
          currency: 'USD',
          provider: 'razorpay',
          verified_at: now.toISOString(),
        },
      });
    } catch {
      // Non-blocking
    }

    ProductionLogger.info('BILLING', `Subscription activated successfully for business ${businessId}`, {
      plan,
      billingCycle,
      paymentId,
    });

    return NextResponse.redirect(new URL(`${successUrl}?plan=${plan}&activated=true`, appUrl));
  } catch (err: any) {
    ProductionLogger.error('BILLING', 'Exception during subscription activation', err);
    return NextResponse.redirect(new URL(failUrl, appUrl));
  }
}
