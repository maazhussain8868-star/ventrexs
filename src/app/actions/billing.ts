'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { BillingService } from '@/lib/billing/billing-service';
import { EntitlementService } from '@/lib/billing/entitlements';
import { PlanKey, BillingInterval, PLANS_CONFIG } from '@/lib/billing/types';

/**
 * Helper to verify authenticated business access
 */
async function assertUserBelongsToBusiness(supabase: any, businessId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to perform billing operations.');
  }

  const { data: member, error } = await supabase
    .from('business_members')
    .select('role')
    .eq('business_id', businessId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !member) {
    throw new Error('Unauthorized: You do not belong to this business organization.');
  }

  return { user, role: member.role };
}

/**
 * 1. Create Checkout Session Server Action
 */
export async function createSubscriptionCheckoutAction(params: {
  businessId: string;
  plan: PlanKey;
  interval: BillingInterval;
  successUrl?: string;
  cancelUrl?: string;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { user } = await assertUserBelongsToBusiness(supabase, params.businessId);

    // Secure server-side resolution of plan config
    const planConfig = PLANS_CONFIG[params.plan];
    if (!planConfig) {
      return { success: false, error: `Invalid subscription plan "${params.plan}" requested.` };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('email, name')
      .eq('id', user.id)
      .maybeSingle();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ventrexs.com';
    const successUrl = params.successUrl || `${baseUrl}/settings/billing?status=success&plan=${params.plan}`;
    const cancelUrl = params.cancelUrl || `${baseUrl}/pricing?status=cancelled`;

    const adminSupabase = createAdminClient();
    const billingService = new BillingService(adminSupabase);

    const session = await billingService.createCheckoutSession({
      businessId: params.businessId,
      plan: params.plan,
      interval: params.interval,
      customerEmail: profile?.email || user.email || 'billing@ventrexs.com',
      customerName: profile?.name || 'Business Owner',
      successUrl,
      cancelUrl,
      userId: user.id,
    });

    revalidatePath('/settings/billing');
    revalidatePath('/pricing');

    return {
      success: true,
      sessionId: session.sessionId,
      checkoutUrl: session.checkoutUrl,
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to initiate checkout session' };
  }
}

/**
 * 2. Create Stripe Customer Billing Portal Session
 */
export async function createCustomerPortalSessionAction(params: {
  businessId: string;
  returnUrl?: string;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { user } = await assertUserBelongsToBusiness(supabase, params.businessId);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ventrexs.com';
    const returnUrl = params.returnUrl || `${baseUrl}/settings/billing`;

    const adminSupabase = createAdminClient();
    const billingService = new BillingService(adminSupabase);

    const portal = await billingService.createCustomerPortalSession({
      businessId: params.businessId,
      returnUrl,
      userId: user.id,
    });

    return {
      success: true,
      portalUrl: portal.portalUrl,
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to open billing portal' };
  }
}

/**
 * 3. Get Current Business Subscription and Entitlements
 */
export async function getBusinessSubscriptionAction(businessId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    await assertUserBelongsToBusiness(supabase, businessId);

    const entitlementService = new EntitlementService(supabase);
    const details = await entitlementService.getEffectivePlan(businessId);

    return { success: true, data: details };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to retrieve subscription details' };
  }
}

/**
 * 4. Get Business Usage Metrics vs Plan Caps
 */
export async function getBusinessUsageAction(businessId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    await assertUserBelongsToBusiness(supabase, businessId);

    const entitlementService = new EntitlementService(supabase);
    const usage = await entitlementService.getAllUsage(businessId);

    return { success: true, data: usage };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to retrieve usage statistics' };
  }
}

/**
 * 5. Cancel Subscription Server Action
 */
export async function cancelSubscriptionAction(params: {
  businessId: string;
  cancelAtPeriodEnd?: boolean;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { user } = await assertUserBelongsToBusiness(supabase, params.businessId);

    const adminSupabase = createAdminClient();
    const billingService = new BillingService(adminSupabase);

    const result = await billingService.cancelSubscription({
      businessId: params.businessId,
      cancelAtPeriodEnd: params.cancelAtPeriodEnd ?? true,
      userId: user.id,
    });

    revalidatePath('/settings/billing');
    revalidatePath('/pricing');

    return { success: true, status: result.status };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to cancel subscription' };
  }
}

/**
 * 6. Reactivate Subscription Server Action
 */
export async function reactivateSubscriptionAction(params: {
  businessId: string;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { user } = await assertUserBelongsToBusiness(supabase, params.businessId);

    const adminSupabase = createAdminClient();
    const billingService = new BillingService(adminSupabase);

    const result = await billingService.reactivateSubscription({
      businessId: params.businessId,
      userId: user.id,
    });

    revalidatePath('/settings/billing');
    revalidatePath('/pricing');

    return { success: true, status: result.status };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to reactivate subscription' };
  }
}
