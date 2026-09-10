'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { resolveAppUrl } from '@/lib/supabase/services/auth';

// Server-side in-memory resend cooldown registry (email -> timestamp)
// Prevents rapid repeated hits to Supabase Auth SMTP service
const resendCooldownMap = new Map<string, number>();

const COOLDOWN_SECONDS = 60;

export async function resendVerificationEmailAction(rawEmail: string, origin?: string) {
  const email = (rawEmail || '').trim().toLowerCase();

  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please provide a valid email address.' };
  }

  const now = Date.now();
  const lastSent = resendCooldownMap.get(email);

  if (lastSent) {
    const elapsedSeconds = Math.floor((now - lastSent) / 1000);
    if (elapsedSeconds < COOLDOWN_SECONDS) {
      const remaining = COOLDOWN_SECONDS - elapsedSeconds;
      return {
        success: false,
        error: `A verification email was already dispatched recently. Please wait ${remaining}s before requesting another.`,
        cooldownRemaining: remaining,
        alreadySent: true,
      };
    }
  }

  // Production-safe App URL
  const appUrl = resolveAppUrl(origin);
  const emailRedirectTo = `${appUrl}/auth/callback?next=/onboarding`;

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo,
      },
    });

    if (error) {
      const msg = (error.message || '').toLowerCase();
      if (
        msg.includes('rate limit') ||
        msg.includes('over_email_send_rate_limit') ||
        msg.includes('too many requests') ||
        (error as any).status === 429
      ) {
        // Record cooldown even on 429 to protect future requests
        resendCooldownMap.set(email, now);
        return {
          success: false,
          error:
            'A verification email was recently requested for this address. Please check your inbox (and spam folder) or wait 60 seconds before requesting another.',
          cooldownRemaining: 60,
        };
      }

      if (msg.includes('already confirmed') || msg.includes('user already confirmed')) {
        return {
          success: false,
          error: 'This account email is already confirmed. You can sign in directly.',
          alreadyConfirmed: true,
        };
      }

      return {
        success: false,
        error: error.message || 'Unable to dispatch verification email.',
      };
    }

    // Set cooldown on successful send
    resendCooldownMap.set(email, now);

    return {
      success: true,
      message: `A fresh verification email has been dispatched to ${email}.`,
      cooldownRemaining: COOLDOWN_SECONDS,
    };
  } catch (err: any) {
    const msg = (err?.message || '').toLowerCase();
    if (msg.includes('rate limit') || msg.includes('429')) {
      resendCooldownMap.set(email, now);
      return {
        success: false,
        error:
          'A verification email was recently requested for this address. Please check your inbox (and spam folder) or wait 60 seconds before requesting another.',
        cooldownRemaining: 60,
      };
    }
    return {
      success: false,
      error: err?.message || 'An unexpected error occurred while sending verification email.',
    };
  }
}

// Password reset cooldown registry
const resetCooldownMap = new Map<string, number>();

export async function resetPasswordForEmailAction(rawEmail: string, origin?: string) {
  const email = (rawEmail || '').trim().toLowerCase();

  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please provide a valid email address.' };
  }

  const now = Date.now();
  const lastSent = resetCooldownMap.get(email);

  if (lastSent) {
    const elapsedSeconds = Math.floor((now - lastSent) / 1000);
    if (elapsedSeconds < COOLDOWN_SECONDS) {
      const remaining = COOLDOWN_SECONDS - elapsedSeconds;
      return {
        success: false,
        error: `A password reset link was already requested recently. Please wait ${remaining}s before trying again.`,
        cooldownRemaining: remaining,
      };
    }
  }

  const appUrl = resolveAppUrl(origin);
  const redirectTo = `${appUrl}/auth/callback?next=/reset-password`;

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('rate limit') || msg.includes('429')) {
        resetCooldownMap.set(email, now);
        return {
          success: false,
          error: 'Rate limit reached. Please wait a few minutes before requesting another password reset.',
          cooldownRemaining: 60,
        };
      }
      return {
        success: false,
        error: error.message || 'Unable to send password reset email.',
      };
    }

    resetCooldownMap.set(email, now);
    return {
      success: true,
      message: `A password reset link has been dispatched to ${email}.`,
      cooldownRemaining: COOLDOWN_SECONDS,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'An unexpected error occurred while sending password reset email.',
    };
  }
}

export interface EmailAuthProviderCheckResult {
  exists: boolean;
  hasPassword: boolean;
  hasGoogle: boolean;
  isGoogleOnly: boolean;
  providers: string[];
  loginMessage?: string;
  signupMessage?: string;
}

/**
 * Checks whether an email is registered in Supabase Auth and whether it only possesses
 * OAuth (e.g. Google) identities without an active password set.
 * 
 * Used to avoid generic "Invalid login credentials" confusion when a user attempts
 * email/password authentication on an account created through Google Sign-In.
 */
export async function checkEmailAuthProviderAction(rawEmail: string): Promise<EmailAuthProviderCheckResult> {
  const email = (rawEmail || '').trim().toLowerCase();

  const emptyResult: EmailAuthProviderCheckResult = {
    exists: false,
    hasPassword: false,
    hasGoogle: false,
    isGoogleOnly: false,
    providers: [],
  };

  if (!email || !email.includes('@')) {
    return emptyResult;
  }

  try {
    const adminSupabase = createAdminClient();

    // 1. Primary path: Call the dedicated database function via RPC
    try {
      const { data: rpcData, error: rpcError } = await (adminSupabase as any).rpc(
        'check_user_auth_provider',
        { target_email: email }
      );

      if (!rpcError && rpcData && typeof rpcData === 'object') {
        const isGoogleOnly = Boolean(rpcData.isGoogleOnly);
        return {
          exists: Boolean(rpcData.exists),
          hasPassword: Boolean(rpcData.hasPassword),
          hasGoogle: Boolean(rpcData.hasGoogle),
          isGoogleOnly,
          providers: Array.isArray(rpcData.providers) ? rpcData.providers : [],
          loginMessage: isGoogleOnly
            ? "This email is registered via Google Sign-In. Please use the 'Sign in with Google' button, or click 'Forgot Password' to set a password for email login."
            : undefined,
          signupMessage: isGoogleOnly
            ? "An account already exists for this email via Google Sign-In. Sign in with Google, or reset your password to enable email/password login."
            : undefined,
        };
      }
    } catch (rpcErr) {
      // Non-blocking: fallback to Supabase Admin API
      console.warn('RPC check_user_auth_provider notice, trying admin API fallback:', rpcErr);
    }

    // 2. Fallback path: Query Supabase Auth Admin API
    try {
      const { data, error } = await adminSupabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

      if (!error && data?.users) {
        const user = data.users.find(
          (u) => u.email?.toLowerCase() === email
        );

        if (user) {
          const appMeta = user.app_metadata || {};
          const identities = user.identities || [];

          const hasGoogle =
            identities.some((i: any) => i.provider === 'google') ||
            appMeta.provider === 'google' ||
            (Array.isArray(appMeta.providers) && appMeta.providers.includes('google'));

          const hasPassword =
            identities.some((i: any) => i.provider === 'email') ||
            (Array.isArray(appMeta.providers) && appMeta.providers.includes('email'));

          const isGoogleOnly = Boolean(hasGoogle && !hasPassword);
          const providers: string[] = [];
          if (hasGoogle) providers.push('google');
          if (hasPassword) providers.push('email');

          return {
            exists: true,
            hasPassword,
            hasGoogle,
            isGoogleOnly,
            providers,
            loginMessage: isGoogleOnly
              ? "This email is registered via Google Sign-In. Please use the 'Sign in with Google' button, or click 'Forgot Password' to set a password for email login."
              : undefined,
            signupMessage: isGoogleOnly
              ? "An account already exists for this email via Google Sign-In. Sign in with Google, or reset your password to enable email/password login."
              : undefined,
          };
        }
      }
    } catch (adminErr) {
      console.warn('Admin API listUsers check notice:', adminErr);
    }

    return emptyResult;
  } catch (err) {
    // If admin client credentials are not configured or network fails, safely return empty result
    return emptyResult;
  }
}

