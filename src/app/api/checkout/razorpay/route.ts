import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getRazorpayClient } from '@/lib/razorpay';
import { resolveAuthenticatedBusinessUser } from '@/app/actions/billing';
import { PlanKey, BillingInterval, PLANS_CONFIG } from '@/lib/billing/types';
import { ProductionLogger } from '@/lib/monitoring/logger';

// Derived dynamically from PLANS_CONFIG single source of truth
export const SAAS_PLAN_PRICING: Record<
  'INR' | 'USD',
  Record<PlanKey, { monthly: number; annual: number }>
> = {
  INR: {
    Starter: { monthly: PLANS_CONFIG.Starter.pricing.INR.monthly, annual: PLANS_CONFIG.Starter.pricing.INR.annualTotal },
    Professional: { monthly: PLANS_CONFIG.Professional.pricing.INR.monthly, annual: PLANS_CONFIG.Professional.pricing.INR.annualTotal },
    Enterprise: { monthly: PLANS_CONFIG.Enterprise.pricing.INR.monthly, annual: PLANS_CONFIG.Enterprise.pricing.INR.annualTotal },
  },
  USD: {
    Starter: { monthly: PLANS_CONFIG.Starter.pricing.USD.monthly, annual: PLANS_CONFIG.Starter.pricing.USD.annualTotal },
    Professional: { monthly: PLANS_CONFIG.Professional.pricing.USD.monthly, annual: PLANS_CONFIG.Professional.pricing.USD.annualTotal },
    Enterprise: { monthly: PLANS_CONFIG.Enterprise.pricing.USD.monthly, annual: PLANS_CONFIG.Enterprise.pricing.USD.annualTotal },
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const requestedBusinessId = body.businessId || body.business_id;

    const supabase = await createServerSupabaseClient();
    let authContext;
    try {
      authContext = await resolveAuthenticatedBusinessUser(supabase, requestedBusinessId);
    } catch (authErr: unknown) {
      const msg = authErr instanceof Error ? authErr.message : 'Authentication required to initiate checkout.';
      return NextResponse.json(
        { error: msg },
        { status: 401 }
      );
    }

    const { user, businessId } = authContext;

    const plan: PlanKey = body.plan || 'Professional';
    const billingCycle: BillingInterval = body.billingCycle === 'annual' ? 'annual' : 'monthly';
    const currency: 'INR' | 'USD' = body.currency === 'USD' ? 'USD' : 'INR';

    if (!PLANS_CONFIG[plan]) {
      return NextResponse.json(
        { error: `Invalid plan specified: ${plan}` },
        { status: 400 }
      );
    }

    const razorpay = getRazorpayClient();
    if (!razorpay.isConfigured) {
      ProductionLogger.error('BILLING', 'Razorpay checkout requested but credentials are not configured');
      return NextResponse.json(
        { error: 'Razorpay payment gateway is not configured on the server.' },
        { status: 503 }
      );
    }

    const price = SAAS_PLAN_PRICING[currency][plan][billingCycle];
    // Razorpay requires the smallest currency unit: paise for INR, cents for USD
    const amountInSmallestUnit = Math.round(price * 100);

    const receiptId = `rcpt_${user.id.slice(0, 6)}_${Date.now()}`;

    // Create Razorpay Order
    const order = await razorpay.createOrder({
      amount: amountInSmallestUnit,
      currency,
      receipt: receiptId,
      notes: {
        user_id: user.id,
        business_id: businessId,
        plan,
        billing_cycle: billingCycle,
        customer_email: user.email || '',
      },
    });

    // Record checkout_started in Supabase with explicit user_id of the paying user
    const adminSupabase = createAdminClient();
    await adminSupabase.from('subscriptions').upsert(
      {
        business_id: businessId,
        user_id: user.id, // Explicit paying user
        plan,
        billing_cycle: billingCycle,
        status: 'checkout_started',
        provider: 'razorpay',
        checkout_session_id: order.id,
        price_amount: price,
        currency,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'business_id' }
    );

    ProductionLogger.info(
      'BILLING',
      `Razorpay checkout initiated: Order ${order.id} for user ${user.id} (Plan: ${plan}, ${currency} ${price})`
    );

    return NextResponse.json({
      success: true,
      orderId: order.id,
      keyId: razorpay.getKeyId(),
      amount: order.amount,
      currency: order.currency,
      plan,
      billingCycle,
      businessId,
      customer: {
        id: user.id,
        email: user.email || '',
        name: (user.user_metadata?.name as string) || user.email?.split('@')[0] || 'Business Owner',
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to initialize Razorpay checkout order.';
    ProductionLogger.error('BILLING', 'Razorpay checkout creation failed', error);
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
