'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { BillingService } from '@/lib/billing/billing-service';
import { EntitlementService } from '@/lib/billing/entitlements';
import { PlanKey, BillingInterval, PLANS_CONFIG } from '@/lib/billing/types';
import { resolveAppUrl } from '@/lib/supabase/services/auth';

/**
 * Robust server-side authenticated user and business workspace resolver.
 * Validates any client-provided businessId against Supabase auth.users & business_members,
 * or automatically resolves the active workspace from the database.
 */
export async function resolveAuthenticatedBusinessUser(supabase: any, explicitBusinessId?: string) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Authentication required to perform billing operations. Please log in.');
  }

  const adminSupabase = createAdminClient();

  // 1. If explicitBusinessId is provided, verify membership
  if (explicitBusinessId && explicitBusinessId.trim()) {
    const { data: member } = await supabase
      .from('business_members')
      .select('business_id, role')
      .eq('business_id', explicitBusinessId.trim())
      .eq('user_id', user.id)
      .maybeSingle();

    if (member) {
      return { user, businessId: explicitBusinessId.trim(), role: member.role };
    }
  }

  // 2. Resolve primary/first workspace from user's business memberships
  const { data: primaryMember } = await supabase
    .from('business_members')
    .select('business_id, role, is_primary')
    .eq('user_id', user.id)
    .order('is_primary', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (primaryMember?.business_id) {
    return { user, businessId: primaryMember.business_id, role: primaryMember.role };
  }

  // 3. Check business_members with admin client to bypass any potential RLS visibility delays
  const { data: adminMember } = await adminSupabase
    .from('business_members')
    .select('business_id, role, is_primary')
    .eq('user_id', user.id)
    .order('is_primary', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (adminMember?.business_id) {
    return { user, businessId: adminMember.business_id, role: adminMember.role };
  }

  // 4. Idempotently create workspace if user has none
  const name = (user.user_metadata?.name as string) || user.email?.split('@')[0] || 'Owner';
  const businessName = (user.user_metadata?.business_name as string) || `${name}'s Business`;

  const { data: newBiz, error: newBizErr } = await adminSupabase
    .from('businesses')
    .insert({
      name: businessName,
      email: user.email || '',
      currency: 'USD ($)',
      payment_terms_days: 14,
      auto_reminder_enabled: true,
    })
    .select()
    .single();

  if (newBizErr || !newBiz) {
    throw new Error('Unable to resolve business workspace context.');
  }

  await adminSupabase.from('business_members').upsert(
    {
      business_id: newBiz.id,
      user_id: user.id,
      role: 'owner',
      is_primary: true,
    },
    { onConflict: 'business_id,user_id' }
  );

  return { user, businessId: newBiz.id, role: 'owner' };
}

/**
 * 1. Create Checkout Session Server Action
 */
export async function createSubscriptionCheckoutAction(params: {
  businessId?: string;
  plan: PlanKey;
  interval: BillingInterval;
  successUrl?: string;
  cancelUrl?: string;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { user, businessId } = await resolveAuthenticatedBusinessUser(supabase, params.businessId);

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

    const baseUrl = resolveAppUrl();
    const successUrl = params.successUrl || `${baseUrl}/settings/billing?status=success&plan=${params.plan}`;
    const cancelUrl = params.cancelUrl || `${baseUrl}/pricing?status=cancelled`;

    const adminSupabase = createAdminClient();
    const billingService = new BillingService(adminSupabase);

    // Query existing subscription status for audit logging
    const { data: existingSub } = await adminSupabase
      .from('subscriptions')
      .select('status, plan')
      .eq('business_id', businessId)
      .maybeSingle();

    const session = await billingService.createCheckoutSession({
      businessId,
      plan: params.plan,
      interval: params.interval,
      customerEmail: profile?.email || user.email || 'billing@ventrexs.com',
      customerName: profile?.name || 'Business Owner',
      successUrl,
      cancelUrl,
      userId: user.id,
    });

    // Sanitized server-side audit log (NEVER log secrets, payment credentials, or tokens)
    console.log('[BILLING_CHECKOUT_SUCCESS]', {
      userId: user.id,
      resolvedBusinessId: businessId,
      selectedPlan: params.plan,
      billingInterval: params.interval,
      subscriptionStatus: existingSub?.status || 'none',
      checkoutCreationResult: session.sessionId ? 'success' : 'failed',
    });

    revalidatePath('/settings/billing');
    revalidatePath('/pricing');
    revalidatePath('/billing');

    return {
      success: true,
      businessId,
      sessionId: session.sessionId,
      checkoutUrl: session.checkoutUrl,
    };
  } catch (error: any) {
    console.error('[BILLING_CHECKOUT_ERROR]', {
      selectedPlan: params.plan,
      billingInterval: params.interval,
      error: error?.message,
    });
    return { success: false, error: error.message || 'Failed to initiate checkout session' };
  }
}

/**
 * 2. Create Stripe Customer Billing Portal Session
 */
export async function createCustomerPortalSessionAction(params: {
  businessId?: string;
  returnUrl?: string;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { user, businessId } = await resolveAuthenticatedBusinessUser(supabase, params.businessId);

    const baseUrl = resolveAppUrl();
    const returnUrl = params.returnUrl || `${baseUrl}/settings/billing`;

    const adminSupabase = createAdminClient();
    const billingService = new BillingService(adminSupabase);

    const portal = await billingService.createCustomerPortalSession({
      businessId,
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
export async function getBusinessSubscriptionAction(businessId?: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { businessId: resolvedId } = await resolveAuthenticatedBusinessUser(supabase, businessId);

    const entitlementService = new EntitlementService(supabase);
    const details = await entitlementService.getEffectivePlan(resolvedId);

    return { success: true, data: details };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to retrieve subscription details' };
  }
}

/**
 * 4. Get Business Usage Metrics vs Plan Caps
 */
export async function getBusinessUsageAction(businessId?: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { businessId: resolvedId } = await resolveAuthenticatedBusinessUser(supabase, businessId);

    const entitlementService = new EntitlementService(supabase);
    const usage = await entitlementService.getAllUsage(resolvedId);

    return { success: true, data: usage };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to retrieve usage statistics' };
  }
}

/**
 * 5. Cancel Subscription Server Action
 */
export async function cancelSubscriptionAction(params: {
  businessId?: string;
  cancelAtPeriodEnd?: boolean;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { user, businessId } = await resolveAuthenticatedBusinessUser(supabase, params.businessId);

    const adminSupabase = createAdminClient();
    const billingService = new BillingService(adminSupabase);

    const result = await billingService.cancelSubscription({
      businessId,
      cancelAtPeriodEnd: params.cancelAtPeriodEnd ?? true,
      userId: user.id,
    });

    revalidatePath('/settings/billing');
    revalidatePath('/pricing');
    revalidatePath('/billing');

    return { success: true, status: result.status };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to cancel subscription' };
  }
}

/**
 * 6. Reactivate Subscription Server Action
 */
export async function reactivateSubscriptionAction(params: {
  businessId?: string;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { user, businessId } = await resolveAuthenticatedBusinessUser(supabase, params.businessId);

    const adminSupabase = createAdminClient();
    const billingService = new BillingService(adminSupabase);

    const result = await billingService.reactivateSubscription({
      businessId,
      userId: user.id,
    });

    revalidatePath('/settings/billing');
    revalidatePath('/pricing');
    revalidatePath('/billing');

    return { success: true, status: result.status };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to reactivate subscription' };
  }
}
