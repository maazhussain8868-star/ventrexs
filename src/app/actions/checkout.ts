'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { BillingService } from '@/lib/billing/billing-service';
import { PlanKey, BillingInterval, PLANS_CONFIG } from '@/lib/billing/types';
import { ProductionLogger } from '@/lib/monitoring/logger';
import { resolveAuthenticatedBusinessUser } from './billing';
import { resolveAppUrl } from '@/lib/supabase/services/auth';

export interface CreateCheckoutSessionActionParams {
  businessId?: string;
  userId?: string;
  plan: PlanKey;
  billingCycle: BillingInterval;
  customerEmail?: string;
  customerName?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreateCheckoutSessionActionResult {
  success: boolean;
  businessId?: string;
  /** Full redirect URL to the payment provider's checkout page */
  checkoutUrl?: string;
  sessionId?: string;
  /** For Razorpay: key_id needed on the client to open Razorpay modal */
  razorpayKeyId?: string;
  /** Razorpay order details for client-side Razorpay.js */
  razorpayOrder?: {
    orderId: string;
    amount: number;
    currency: string;
  };
  error?: string;
}

/**
 * SERVER-SIDE CHECKOUT SESSION CREATION
 *
 * Uses service-role admin client so no secret keys ever reach the browser.
 * Marks subscription as 'checkout_started' in DB to prevent unauthorized workspace access
 * before payment is confirmed.
 *
 * Supports both Razorpay (primary) and Stripe.
 */
export async function createCheckoutSessionAction(
  params: CreateCheckoutSessionActionParams
): Promise<CreateCheckoutSessionActionResult> {
  try {
    const supabase = await createServerSupabaseClient();
    const { user, businessId } = await resolveAuthenticatedBusinessUser(supabase, params.businessId);

    // Validate plan server-side — clients cannot manipulate the plan key
    const planConfig = PLANS_CONFIG[params.plan];
    if (!planConfig) {
      return { success: false, error: `Invalid plan: ${params.plan}` };
    }

    const adminSupabase = createAdminClient();
    const billingService = new BillingService(adminSupabase);

    // Server-authoritative price — never trust client amounts
    const price = params.billingCycle === 'annual' ? planConfig.priceAnnual : planConfig.priceMonthly;
    const appUrl = resolveAppUrl();

    const { data: profile } = await supabase
      .from('profiles')
      .select('email, name')
      .eq('id', user.id)
      .maybeSingle();

    const { data: existingSub } = await adminSupabase
      .from('subscriptions')
      .select('status, plan')
      .eq('business_id', businessId)
      .maybeSingle();

    const result = await billingService.createCheckoutSession({
      businessId,
      plan: params.plan,
      interval: params.billingCycle,
      customerEmail: params.customerEmail || profile?.email || user.email || 'billing@ventrexs.com',
      customerName: params.customerName || profile?.name || 'Business Owner',
      successUrl: params.successUrl || `${appUrl}/billing/success?plan=${params.plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: params.cancelUrl || `${appUrl}/billing?cancelled=true`,
      userId: user.id,
    });

    const provider = (process.env.BILLING_PROVIDER || process.env.SAAS_PAYMENT_PROVIDER || 'razorpay').toLowerCase();

    // Mark subscription as checkout_started
    await adminSupabase.from('subscriptions').upsert(
      {
        business_id: businessId,
        plan: params.plan,
        billing_cycle: params.billingCycle,
        status: 'checkout_started',
        selected_plan: params.plan,
        selected_billing_cycle: params.billingCycle,
        checkout_session_id: result.sessionId,
        price_amount: price,
        currency: 'USD',
        provider: provider as any,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'business_id' }
    );

    // Sanitized server-side audit log
    console.log('[CHECKOUT_ACTION_SUCCESS]', {
      userId: user.id,
      resolvedBusinessId: businessId,
      selectedPlan: params.plan,
      billingInterval: params.billingCycle,
      subscriptionStatus: existingSub?.status || 'none',
      checkoutCreationResult: result.sessionId ? 'success' : 'failed',
    });

    ProductionLogger.info('BILLING', `Checkout session created for business ${businessId}: ${result.sessionId}`);

    return {
      success: true,
      businessId,
      checkoutUrl: result.checkoutUrl,
      sessionId: result.sessionId,
    };
  } catch (err: any) {
    const msg = err?.message || 'Failed to create checkout session.';
    ProductionLogger.error('BILLING', 'Checkout session creation failed', err);

    console.error('[CHECKOUT_ACTION_ERROR]', {
      selectedPlan: params.plan,
      billingInterval: params.billingCycle,
      error: msg,
    });

    if (
      msg.includes('not configured') ||
      msg.includes('STRIPE_SECRET_KEY') ||
      msg.includes('RAZORPAY_KEY_ID') ||
      msg.includes('BILLING_PROVIDER') ||
      msg.includes('SAAS_PAYMENT_PROVIDER')
    ) {
      return {
        success: false,
        error: 'Payment provider is not yet configured. Please contact support or try again later.',
      };
    }
    return { success: false, error: msg };
  }
}

export interface SaveSelectedPlanActionParams {
  businessId?: string;
  plan: PlanKey;
  billingCycle: BillingInterval;
}

/**
 * Saves plan selection to DB with status=pending before initiating checkout.
 * 'pending' = plan chosen, user has not yet completed payment.
 * Prevents workspace access until payment webhook confirms activation.
 */
export async function saveSelectedPlanAction(
  params: SaveSelectedPlanActionParams
): Promise<{ success: boolean; businessId?: string; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { user, businessId } = await resolveAuthenticatedBusinessUser(supabase, params.businessId);

    // Server-side plan validation
    if (!PLANS_CONFIG[params.plan]) {
      return { success: false, error: `Invalid plan: ${params.plan}` };
    }

    const adminSupabase = createAdminClient();
    const provider = (process.env.BILLING_PROVIDER || process.env.SAAS_PAYMENT_PROVIDER || 'razorpay').toLowerCase();
    const planConfig = PLANS_CONFIG[params.plan];
    const price = params.billingCycle === 'annual' ? planConfig.priceAnnual : planConfig.priceMonthly;

    await adminSupabase.from('subscriptions').upsert(
      {
        business_id: businessId,
        plan: params.plan,
        billing_cycle: params.billingCycle,
        status: 'pending',
        selected_plan: params.plan,
        selected_billing_cycle: params.billingCycle,
        price_amount: price,
        currency: 'USD',
        provider: provider as any,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'business_id' }
    );

    console.log('[SAVE_SELECTED_PLAN]', {
      userId: user.id,
      resolvedBusinessId: businessId,
      selectedPlan: params.plan,
      billingInterval: params.billingCycle,
    });

    return { success: true, businessId };
  } catch (err: any) {
    console.error('[SAVE_SELECTED_PLAN_ERROR]', {
      selectedPlan: params.plan,
      error: err?.message,
    });
    return { success: false, error: err?.message || 'Failed to save plan selection.' };
  }
}
