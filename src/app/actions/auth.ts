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
            'A verification email was recently requested for this address. Please check your inbox (including spam), or wait a few minutes before trying again.',
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
          'A verification email was recently requested for this address. Please check your inbox or wait a few minutes before requesting another.',
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
