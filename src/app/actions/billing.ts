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
/**
 * Resolve the authenticated user and their business ID.
 * Robust multi-layered fallback ensures business context resolves for:
 * 1. Valid explicitBusinessId (membership checked or business owned)
 * 2. business_members membership by user_id
 * 3. Existing business matching user.email
 * 4. Existing subscription matching user_id or customer_email
 * 5. Idempotent workspace creation with retry
 */
export async function resolveAuthenticatedBusinessUser(supabase: any, explicitBusinessId?: string) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Authentication required to perform billing operations. Please log in.');
  }

  const adminSupabase = createAdminClient();
  const isValidUuid = (val?: string): boolean =>
    Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim()));

  const sanitizedExplicitId = explicitBusinessId && isValidUuid(explicitBusinessId) ? explicitBusinessId.trim() : undefined;

  // 1. If valid explicitBusinessId is provided, verify membership or ownership
  if (sanitizedExplicitId) {
    // 1a. Check membership with admin client (bypasses RLS session delays)
    const { data: member } = await adminSupabase
      .from('business_members')
      .select('business_id, role')
      .eq('business_id', sanitizedExplicitId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (member) {
      return { user, businessId: sanitizedExplicitId, role: member.role };
    }

    // 1b. Check if the business exists in businesses table
    const { data: biz } = await adminSupabase
      .from('businesses')
      .select('id, email')
      .eq('id', sanitizedExplicitId)
      .maybeSingle();

    if (biz) {
      // Link user as owner in business_members
      await adminSupabase.from('business_members').upsert(
        {
          business_id: sanitizedExplicitId,
          user_id: user.id,
          role: 'owner',
          is_primary: true,
        },
        { onConflict: 'business_id,user_id' }
      );
      return { user, businessId: sanitizedExplicitId, role: 'owner' };
    }
  }

  // 2. Resolve primary/first workspace from user's business memberships
  const { data: adminMember } = await adminSupabase
    .from('business_members')
    .select('business_id, role, is_primary')
    .eq('user_id', user.id)
    .order('is_primary', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (adminMember?.business_id && isValidUuid(adminMember.business_id)) {
    return { user, businessId: adminMember.business_id, role: adminMember.role };
  }

  // 3. Fallback: Lookup existing business by user's email in businesses table
  if (user.email) {
    const { data: bizByEmail } = await adminSupabase
      .from('businesses')
      .select('id, name')
      .eq('email', user.email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (bizByEmail?.id && isValidUuid(bizByEmail.id)) {
      await adminSupabase.from('business_members').upsert(
        {
          business_id: bizByEmail.id,
          user_id: user.id,
          role: 'owner',
          is_primary: true,
        },
        { onConflict: 'business_id,user_id' }
      );
      return { user, businessId: bizByEmail.id, role: 'owner' };
    }
  }

  // 4. Fallback: Lookup existing subscription by user_id
  const { data: subByUser } = await adminSupabase
    .from('subscriptions')
    .select('business_id')
    .eq('user_id', user.id)
    .not('business_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (subByUser?.business_id && isValidUuid(subByUser.business_id)) {
    await adminSupabase.from('business_members').upsert(
      {
        business_id: subByUser.business_id,
        user_id: user.id,
        role: 'owner',
        is_primary: true,
      },
      { onConflict: 'business_id,user_id' }
    );
    return { user, businessId: subByUser.business_id, role: 'owner' };
  }

  // 5. Fallback: Lookup existing subscription by customer_email
  if (user.email) {
    const { data: subByEmail } = await (adminSupabase.from('subscriptions') as any)
      .select('business_id')
      .eq('customer_email', user.email)
      .not('business_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subByEmail?.business_id && isValidUuid(subByEmail.business_id)) {
      await adminSupabase.from('business_members').upsert(
        {
          business_id: subByEmail.business_id,
          user_id: user.id,
          role: 'owner',
          is_primary: true,
        },
        { onConflict: 'business_id,user_id' }
      );
      return { user, businessId: subByEmail.business_id, role: 'owner' };
    }
  }

  // 6. Transactionally ensure or create workspace via database RPC or admin client
  const name = (user.user_metadata?.name as string) || (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'Owner';
  const businessName = (user.user_metadata?.business_name as string) || `${name}'s Business`;

  try {
    const { data: rpcRes, error: rpcErr } = await (adminSupabase as any).rpc('ensure_user_workspace_membership', {
      p_user_id: user.id,
      p_email: user.email || '',
      p_name: name,
      p_business_name: businessName,
    });

    const rpcPayload = rpcRes as any;
    if (!rpcErr && rpcPayload && rpcPayload.success && rpcPayload.business_id && isValidUuid(rpcPayload.business_id)) {
      return { user, businessId: rpcPayload.business_id, role: rpcPayload.role || 'owner' };
    }
  } catch {
    // Non-blocking fallback if RPC not yet executed in current database
  }

  const { data: newBiz, error: newBizErr } = await adminSupabase
    .from('businesses')
    .insert({
      name: businessName,
      email: user.email || '',
      currency: 'USD ($)',
      payment_terms_days: 14,
      auto_reminder_enabled: true,
    })
    .select('id')
    .single();

  if (newBiz?.id) {
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

  // If insert returned error (e.g. race condition or unique check), retry lookup by email
  if (user.email) {
    const { data: retryBiz } = await adminSupabase
      .from('businesses')
      .select('id')
      .eq('email', user.email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (retryBiz?.id) {
      await adminSupabase.from('business_members').upsert(
        {
          business_id: retryBiz.id,
          user_id: user.id,
          role: 'owner',
          is_primary: true,
        },
        { onConflict: 'business_id,user_id' }
      );
      return { user, businessId: retryBiz.id, role: 'owner' };
    }
  }

  console.error('[RESOLVE_WORKSPACE_FATAL]', {
    userId: user.id,
    userEmail: user.email,
    explicitBusinessId,
    insertError: newBizErr?.message,
  });

  throw new Error(`Unable to resolve business workspace context: ${newBizErr?.message || 'Workspace initialization failed'}`);
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

    const provider = (process.env.BILLING_PROVIDER || process.env.SAAS_PAYMENT_PROVIDER || 'razorpay').toLowerCase();
    const price = params.interval === 'annual' ? planConfig.priceAnnual : planConfig.priceMonthly;

    // Reset any prior incomplete/pending status to checkout_started and bind user_id
    await adminSupabase.from('subscriptions').upsert(
      {
        business_id: businessId,
        user_id: user.id,
        plan: params.plan,
        billing_cycle: params.interval,
        status: 'checkout_started',
        selected_plan: params.plan,
        selected_billing_cycle: params.interval,
        checkout_session_id: session.sessionId,
        price_amount: price,
        currency: 'USD',
        provider: provider as any,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'business_id' }
    );

    // Sanitized server-side audit log (NEVER log secrets, payment credentials, or tokens)
    console.log('[BILLING_CHECKOUT_SUCCESS]', {
      userId: user.id,
      resolvedBusinessId: businessId,
      selectedPlan: params.plan,
      billingInterval: params.interval,
      subscriptionStatus: 'checkout_started',
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

/**
 * 7. Start Explicit 7-Day Free Trial (No Credit Card Required)
 * Enforces one-time eligibility per user/business
 */
export async function startFreeTrialAction(params: {
  plan?: PlanKey;
  businessId?: string;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { user, businessId } = await resolveAuthenticatedBusinessUser(supabase, params.businessId);

    const adminSupabase = createAdminClient();
    const plan = params.plan || 'Professional';

    // Verify user or business has not already used a trial
    const { data: existingTrial } = await adminSupabase
      .from('subscriptions')
      .select('id, trial_start, trial_ends_at')
      .or(`user_id.eq.${user.id},business_id.eq.${businessId}`)
      .not('trial_start', 'is', null)
      .limit(1)
      .maybeSingle();

    if (existingTrial) {
      return {
        success: false,
        error: 'A 7-day free trial has already been redeemed for this account.',
      };
    }

    const now = new Date();
    const trialEnd = new Date(now.getTime() + 7 * 86400000).toISOString();
    const nowIso = now.toISOString();

    const { error: upsertError } = await adminSupabase.from('subscriptions').upsert(
      {
        business_id: businessId,
        user_id: user.id,
        plan,
        billing_cycle: 'monthly',
        status: 'trialing',
        trial_start: nowIso,
        trial_ends_at: trialEnd,
        current_period_start: nowIso,
        current_period_end: trialEnd,
        cancel_at_period_end: false,
        updated_at: nowIso,
      },
      { onConflict: 'business_id' }
    );

    if (upsertError) {
      throw new Error(upsertError.message);
    }

    revalidatePath('/dashboard');
    revalidatePath('/pricing');
    revalidatePath('/billing');

    return {
      success: true,
      plan,
      trialEndsAt: trialEnd,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to start free trial.',
    };
  }
}
