'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { BillingService } from '@/lib/billing/billing-service';
import { PlanKey, BillingInterval, PLANS_CONFIG } from '@/lib/billing/types';
import { ProductionLogger } from '@/lib/monitoring/logger';

export interface CreateCheckoutSessionActionParams {
  businessId: string;
  userId: string;
  plan: PlanKey;
  billingCycle: BillingInterval;
  customerEmail: string;
  customerName?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionActionResult {
  success: boolean;
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
 * Marks subscription as 'checkout_started' in DB to prevent workspace access
 * before payment is confirmed.
 *
 * Supports both Razorpay (primary, India/UPI) and Stripe (international).
 * Provider is selected from BILLING_PROVIDER env var.
 */
export async function createCheckoutSessionAction(
  params: CreateCheckoutSessionActionParams
): Promise<CreateCheckoutSessionActionResult> {
  try {
    // Validate plan server-side — clients cannot manipulate the plan key
    const planConfig = PLANS_CONFIG[params.plan];
    if (!planConfig) {
      return { success: false, error: `Invalid plan: ${params.plan}` };
    }

    const adminSupabase = createAdminClient();
    const billingService = new BillingService(adminSupabase);

    // Server-authoritative price — never trust client amounts
    const price = params.billingCycle === 'annual' ? planConfig.priceAnnual : planConfig.priceMonthly;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const result = await billingService.createCheckoutSession({
      businessId: params.businessId,
      plan: params.plan,
      interval: params.billingCycle,
      customerEmail: params.customerEmail,
      customerName: params.customerName,
      successUrl: params.successUrl || `${appUrl}/billing/success?plan=${params.plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: params.cancelUrl || `${appUrl}/billing?cancelled=true`,
      userId: params.userId,
    });

    // Mark subscription as checkout_started so middleware blocks workspace access
    // until webhook confirms payment
    await adminSupabase.from('subscriptions').upsert(
      {
        business_id: params.businessId,
        plan: params.plan,
        billing_cycle: params.billingCycle,
        status: 'checkout_started',
        selected_plan: params.plan,
        selected_billing_cycle: params.billingCycle,
        checkout_session_id: result.sessionId,
        price_amount: price,
        currency: 'USD',
        provider: (process.env.BILLING_PROVIDER || 'stripe').toLowerCase() as any,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'business_id' }
    );

    ProductionLogger.info('BILLING', `Checkout session created for business ${params.businessId}: ${result.sessionId}`);

    return {
      success: true,
      checkoutUrl: result.checkoutUrl,
      sessionId: result.sessionId,
    };
  } catch (err: any) {
    const msg = err?.message || 'Failed to create checkout session.';
    ProductionLogger.error('BILLING', 'Checkout session creation failed', err);

    if (
      msg.includes('not configured') ||
      msg.includes('STRIPE_SECRET_KEY') ||
      msg.includes('RAZORPAY_KEY_ID') ||
      msg.includes('BILLING_PROVIDER')
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
  businessId: string;
  plan: PlanKey;
  billingCycle: BillingInterval;
}

/**
 * Saves plan selection to DB with status=pending before initiating checkout.
 * 'pending' = plan chosen, user has not yet been redirected to payment.
 * Prevents workspace access until payment webhook confirms activation.
 * Safe to call multiple times (upsert idempotent).
 */
export async function saveSelectedPlanAction(
  params: SaveSelectedPlanActionParams
): Promise<{ success: boolean; error?: string }> {
  try {
    // Server-side plan validation
    if (!PLANS_CONFIG[params.plan]) {
      return { success: false, error: `Invalid plan: ${params.plan}` };
    }

    const adminSupabase = createAdminClient();
    const provider = (process.env.BILLING_PROVIDER || 'stripe').toLowerCase();
    const planConfig = PLANS_CONFIG[params.plan];
    const price = params.billingCycle === 'annual' ? planConfig.priceAnnual : planConfig.priceMonthly;

    await adminSupabase.from('subscriptions').upsert(
      {
        business_id: params.businessId,
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

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save plan selection.' };
  }
}
