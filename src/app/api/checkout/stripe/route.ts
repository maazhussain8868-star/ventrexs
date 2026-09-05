import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripeClient } from '@/lib/stripe';
import { resolveAuthenticatedBusinessUser } from '@/app/actions/billing';
import { PlanKey, BillingInterval, PLANS_CONFIG } from '@/lib/billing/types';
import { resolveAppUrl } from '@/lib/supabase/services/auth';
import { ProductionLogger } from '@/lib/monitoring/logger';

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

    if (!PLANS_CONFIG[plan]) {
      return NextResponse.json(
        { error: `Invalid plan specified: ${plan}` },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();
    if (!stripe.isConfigured) {
      ProductionLogger.error('BILLING', 'Stripe checkout requested but credentials are not configured');
      return NextResponse.json(
        { error: 'Stripe payment gateway is not configured on the server.' },
        { status: 503 }
      );
    }

    const origin = req.headers.get('origin') || resolveAppUrl();
    const successUrl =
      body.successUrl ||
      `${origin}/billing/success?plan=${encodeURIComponent(plan)}&cycle=${billingCycle}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = body.cancelUrl || `${origin}/pricing?cancelled=true`;

    const planConfig = PLANS_CONFIG[plan];
    const price = billingCycle === 'annual' ? planConfig.pricing.USD.annualTotal : planConfig.pricing.USD.monthly;
    const priceInCents = Math.round(price * 100);

    // Create Stripe Hosted Checkout Session
    const session = await stripe.createCheckoutSession({
      customerEmail: user.email,
      plan,
      billingCycle,
      priceInCents,
      currency: 'usd',
      successUrl,
      cancelUrl,
      clientReferenceId: user.id,
      metadata: {
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
        provider: 'stripe',
        checkout_session_id: session.id,
        price_amount: price,
        currency: 'USD',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'business_id' }
    );

    ProductionLogger.info(
      'BILLING',
      `Stripe checkout session created: ${session.id} for user ${user.id} (Plan: ${plan}, USD ${price})`
    );

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to initialize Stripe hosted checkout session.';
    ProductionLogger.error('BILLING', 'Stripe checkout session creation failed', error);
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
