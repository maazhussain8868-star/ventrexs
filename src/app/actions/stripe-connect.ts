'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { assertUserBelongsToBusiness } from '@/lib/auth/server-authorization';
import { revalidatePath } from 'next/cache';
import { resolveAppUrl } from '@/lib/supabase/services/auth';

function getStripeSecretKey(): string {
  return process.env.STRIPE_SECRET_KEY || '';
}

/**
 * 1. Initiate Stripe Connect Express Onboarding Flow
 */
export async function createStripeConnectAccountAction(businessId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    await assertUserBelongsToBusiness(supabase, businessId);

    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id, name, email, stripe_account_id, stripe_connected')
      .eq('id', businessId)
      .single();

    if (bizError || !business) {
      return { success: false, error: 'Business entity record not found.' };
    }

    const secretKey = getStripeSecretKey();
    const isMock = !secretKey || secretKey.startsWith('sk_test_mock') || secretKey === 'sk_test_paypilot_local';
    const origin = resolveAppUrl();

    let accountId = business.stripe_account_id;

    // Simulated offline/demo mode handler
    if (isMock) {
      if (!accountId) {
        accountId = `acct_express_sim_${Date.now()}`;
        await supabase
          .from('businesses')
          .update({
            stripe_account_id: accountId,
            stripe_connected: true,
            stripe_details_submitted: true,
            stripe_charges_enabled: true,
            stripe_payouts_enabled: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', businessId);
      }

      revalidatePath('/settings');
      return {
        success: true,
        isSimulated: true,
        accountId,
        onboardingUrl: `${origin}/settings?stripe_connect=return&simulated=true`,
      };
    }

    // Real Stripe Accounts API
    if (!accountId) {
      const createAccountRes = await fetch('https://api.stripe.com/v1/accounts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          type: 'express',
          country: 'US',
          email: business.email || '',
          'capabilities[card_payments][requested]': 'true',
          'capabilities[transfers][requested]': 'true',
          'business_profile[name]': business.name || 'Ventrexs Merchant',
          'metadata[business_id]': businessId,
        }),
      });

      const accountData = await createAccountRes.json();
      if (!createAccountRes.ok || accountData.error) {
        return {
          success: false,
          error: accountData.error?.message || 'Failed to create Stripe Express account.',
        };
      }

      accountId = accountData.id;

      // Save Stripe account ID immediately to business record
      await supabase
        .from('businesses')
        .update({
          stripe_account_id: accountId,
          stripe_connected: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', businessId);
    }

    if (!accountId) {
      return {
        success: false,
        error: 'Stripe account identifier could not be determined.',
      };
    }

    // Generate Account Link for hosted onboarding
    const refreshUrl = `${origin}/settings?stripe_connect=refresh`;
    const returnUrl = `${origin}/settings?stripe_connect=return`;

    const accountLinkRes = await fetch('https://api.stripe.com/v1/account_links', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      }),
    });

    const linkData = await accountLinkRes.json();
    if (!accountLinkRes.ok || linkData.error) {
      return {
        success: false,
        error: linkData.error?.message || 'Failed to generate Stripe onboarding link.',
      };
    }

    return {
      success: true,
      onboardingUrl: linkData.url,
      accountId,
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Stripe Connect initialization failed.' };
  }
}

/**
 * 2. Verify and Synchronize Stripe Connect Express Account Status
 */
export async function syncStripeConnectStatusAction(businessId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    await assertUserBelongsToBusiness(supabase, businessId);

    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id, stripe_account_id')
      .eq('id', businessId)
      .single();

    if (bizError || !business || !business.stripe_account_id) {
      return { success: false, error: 'No Stripe account linked to this business.' };
    }

    const secretKey = getStripeSecretKey();
    const isMock = !secretKey || secretKey.startsWith('sk_test_mock') || secretKey === 'sk_test_paypilot_local';

    if (isMock) {
      await supabase
        .from('businesses')
        .update({
          stripe_connected: true,
          stripe_details_submitted: true,
          stripe_charges_enabled: true,
          stripe_payouts_enabled: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', businessId);

      revalidatePath('/settings');
      return {
        success: true,
        connected: true,
        detailsSubmitted: true,
        chargesEnabled: true,
        payoutsEnabled: true,
      };
    }

    const res = await fetch(`https://api.stripe.com/v1/accounts/${business.stripe_account_id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    const account = await res.json();
    if (!res.ok || account.error) {
      return {
        success: false,
        error: account.error?.message || 'Failed to fetch Stripe account status.',
      };
    }

    const detailsSubmitted = Boolean(account.details_submitted);
    const chargesEnabled = Boolean(account.charges_enabled);
    const payoutsEnabled = Boolean(account.payouts_enabled);
    const isConnected = detailsSubmitted || chargesEnabled;

    await supabase
      .from('businesses')
      .update({
        stripe_connected: isConnected,
        stripe_details_submitted: detailsSubmitted,
        stripe_charges_enabled: chargesEnabled,
        stripe_payouts_enabled: payoutsEnabled,
        updated_at: new Date().toISOString(),
      })
      .eq('id', businessId);

    revalidatePath('/settings');
    return {
      success: true,
      connected: isConnected,
      detailsSubmitted,
      chargesEnabled,
      payoutsEnabled,
      accountId: business.stripe_account_id,
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to sync Stripe status.' };
  }
}

/**
 * 3. Generate Single-Sign-On Link to Stripe Express Dashboard
 */
export async function createStripeDashboardLinkAction(businessId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    await assertUserBelongsToBusiness(supabase, businessId);

    const { data: business } = await supabase
      .from('businesses')
      .select('stripe_account_id')
      .eq('id', businessId)
      .single();

    if (!business?.stripe_account_id) {
      return { success: false, error: 'No Stripe Connect account found for this business.' };
    }

    const secretKey = getStripeSecretKey();
    const isMock = !secretKey || secretKey.startsWith('sk_test_mock') || secretKey === 'sk_test_paypilot_local';

    if (isMock) {
      return {
        success: true,
        url: `https://dashboard.stripe.com/test/express/${business.stripe_account_id}`,
      };
    }

    const res = await fetch(`https://api.stripe.com/v1/accounts/${business.stripe_account_id}/login_links`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || 'Could not generate Stripe Express dashboard link.',
      };
    }

    return {
      success: true,
      url: data.url,
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Stripe Dashboard link creation failed.' };
  }
}
