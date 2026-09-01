import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types';

export function formatAuthErrorMessage(error: any): string {
  if (!error) return 'An unexpected authentication error occurred.';
  const msg = typeof error === 'string' ? error : error.message || error.error_description || error.msg || '';
  const code = typeof error === 'object' && error !== null ? String(error.code || error.error_code || '') : '';
  const lower = (msg + ' ' + code).toLowerCase();

  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('network request failed') ||
    lower.includes('fetch failed') ||
    lower.includes('load failed')
  ) {
    return 'Unable to reach the authentication server. Please check your internet connection and try again.';
  }

  if (
    lower.includes('rate limit') ||
    lower.includes('over_email_send_rate_limit') ||
    lower.includes('too many requests') ||
    lower.includes('email_rate_limit_exceeded') ||
    lower.includes('email rate limit exceeded') ||
    error.status === 429 ||
    error.statusCode === 429
  ) {
    return 'A verification email was recently requested for this address. Please check your inbox (and spam folder) or wait a few minutes before requesting another.';
  }

  if (
    lower.includes('user already registered') ||
    lower.includes('email already in use') ||
    lower.includes('already exists') ||
    lower.includes('user_already_exists')
  ) {
    return 'An account with this email already exists. Please sign in instead, or request a verification email if unconfirmed.';
  }

  if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials') || lower.includes('invalid credentials')) {
    return 'Invalid login credentials. Please verify your email and password.';
  }

  if (lower.includes('email not confirmed') || lower.includes('email_not_confirmed')) {
    return 'Your email address is not yet confirmed. Please check your inbox or request a new verification email.';
  }

  if (lower.includes('password') && (lower.includes('short') || lower.includes('least 6') || lower.includes('least 8'))) {
    return 'Password must be at least 8 characters long.';
  }

  return msg || 'Authentication failed. Please try again.';
}

/**
 * Environment-safe URL resolution for production and development.
 * In production, this NEVER returns localhost:3000 or 127.0.0.1.
 * Always resolves strictly to https://www.ventrexs.com (or non-local NEXT_PUBLIC_APP_URL).
 */
export function resolveAppUrl(origin?: string): string {
  const isProd = process.env.NODE_ENV === 'production';
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (isProd) {
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl.replace(/\/$/, '');
    }
    return 'https://www.ventrexs.com';
  }

  // Non-production environment:
  if (origin && !origin.includes('undefined')) {
    return origin.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }
  return 'https://www.ventrexs.com';
}

export class AuthService {
  constructor(private client: SupabaseClient<Database>) {}

  /**
   * Idempotently ensure user profile and a single dedicated business workspace exist
   */
  async ensureUserWorkspace(params: {
    userId: string;
    email: string;
    name?: string;
    businessName?: string;
  }) {
    const { userId, email, name = 'Owner', businessName = 'My Business' } = params;

    // 1. Create or update profile (safe upsert)
    try {
      const { error: profileError } = await this.client
        .from('profiles')
        .upsert({
          id: userId,
          name,
          email,
          role: 'owner',
        });

      if (profileError) {
        console.warn('Profile sync notice:', profileError.message);
      }
    } catch (profErr: any) {
      console.warn('Profile sync exception:', profErr?.message);
    }

    // 2. Check if the user already has a business workspace
    try {
      const { data: existingMembership } = await this.client
        .from('business_members')
        .select('business_id, role, is_primary')
        .eq('user_id', userId)
        .order('is_primary', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingMembership?.business_id) {
        const { data: existingBusiness } = await this.client
          .from('businesses')
          .select('*')
          .eq('id', existingMembership.business_id)
          .maybeSingle();

        if (existingBusiness) {
          return { business: existingBusiness, userRole: existingMembership.role };
        }
      }
    } catch (membershipCheckErr: any) {
      console.warn('Existing workspace lookup notice:', membershipCheckErr?.message);
    }

    // 3. Create fresh isolated workspace
    try {
      const { data: newBusiness, error: businessError } = await this.client
        .from('businesses')
        .insert({
          name: businessName,
          email,
          currency: 'USD ($)',
          payment_terms_days: 14,
          auto_reminder_enabled: true,
        })
        .select()
        .single();

      if (businessError) {
        console.warn('Business creation notice:', businessError.message);
        return { business: null, userRole: 'owner' };
      }

      if (newBusiness) {
        // Trigger handle_new_business_owner may have already created the business_members row
        const { data: existingMember } = await this.client
          .from('business_members')
          .select('id')
          .eq('business_id', newBusiness.id)
          .eq('user_id', userId)
          .maybeSingle();

        if (!existingMember) {
          try {
            await this.client.from('business_members').insert({
              business_id: newBusiness.id,
              user_id: userId,
              role: 'owner',
              is_primary: true,
            });
          } catch {
            // Non-blocking: trigger or unique constraint handled it
          }
        }
      }

      return { business: newBusiness, userRole: 'owner' };
    } catch (createErr: any) {
      console.warn('Workspace creation exception:', createErr?.message);
      return { business: null, userRole: 'owner' };
    }
  }

  async signUp(params: {
    email: string;
    password: string;
    name: string;
    businessName: string;
    plan?: string;
  }) {
    try {
      const appUrl = resolveAppUrl(typeof window !== 'undefined' ? window.location.origin : undefined);
      const planParam = params.plan ? `?plan=${encodeURIComponent(params.plan)}` : '';
      const emailRedirectTo = `${appUrl}/auth/callback?next=${encodeURIComponent(`/onboarding${planParam}`)}`;

      const { data: authData, error: authError } = await this.client.auth.signUp({
        email: params.email,
        password: params.password,
        options: {
          data: {
            name: params.name,
            business_name: params.businessName,
            plan: params.plan || 'Professional',
          },
          emailRedirectTo,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user account');

      // Supabase returns an empty identities array if the user already exists
      const isExistingUser =
        authData.user &&
        Array.isArray(authData.user.identities) &&
        authData.user.identities.length === 0;

      let business = null;
      // Only attempt client-side workspace creation if we have an active authenticated session.
      // If email confirmation is required, session is null, and ensureUserWorkspace will run upon first login.
      if (authData.session) {
        try {
          const result = await this.ensureUserWorkspace({
            userId: authData.user.id,
            email: params.email,
            name: params.name,
            businessName: params.businessName,
          });
          business = result.business;
        } catch (dbErr: any) {
          console.warn('Workspace initialization warning:', dbErr?.message);
        }
      }

      return {
        user: authData.user,
        session: authData.session,
        business,
        needsEmailConfirmation: !authData.session,
        isExistingUser,
      };
    } catch (err: any) {
      const formatted = formatAuthErrorMessage(err);
      throw new Error(formatted);
    }
  }

  async resendVerificationEmail(email: string) {
    try {
      const appUrl = resolveAppUrl(typeof window !== 'undefined' ? window.location.origin : undefined);
      const emailRedirectTo = `${appUrl}/auth/callback?next=/onboarding`;

      const { data, error } = await this.client.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo,
        },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      const formatted = formatAuthErrorMessage(err);
      throw new Error(formatted);
    }
  }

  async resetPasswordForEmail(email: string) {
    try {
      const appUrl = resolveAppUrl(typeof window !== 'undefined' ? window.location.origin : undefined);
      const redirectTo = `${appUrl}/auth/callback?next=/reset-password`;

      const { data, error } = await this.client.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      const formatted = formatAuthErrorMessage(err);
      throw new Error(formatted);
    }
  }

  async updatePassword(password: string) {
    try {
      const { data, error } = await this.client.auth.updateUser({
        password,
      });

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      const formatted = formatAuthErrorMessage(err);
      throw new Error(formatted);
    }
  }

  async signInWithOAuth(provider: 'google' | 'apple') {
    try {
      const appUrl = resolveAppUrl(typeof window !== 'undefined' ? window.location.origin : undefined);
      const redirectTo = `${appUrl}/auth/callback?next=/dashboard`;

      const { data, error } = await this.client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: provider === 'google' ? {
            access_type: 'offline',
            prompt: 'consent',
          } : undefined,
        },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      const formatted = formatAuthErrorMessage(err);
      throw new Error(formatted);
    }
  }

  async signIn(params: { email: string; password: string }) {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email: params.email,
        password: params.password,
      });

      if (error) throw error;
      return data;
    } catch (err: any) {
      const formatted = formatAuthErrorMessage(err);
      throw new Error(formatted);
    }
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  async getSession() {
    const { data, error } = await this.client.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async getUser() {
    const { data, error } = await this.client.auth.getUser();
    if (error) throw error;
    return data.user;
  }

  async getProfile(userId: string) {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(userId: string, updates: Partial<Database['public']['Tables']['profiles']['Update']>) {
    const { data, error } = await this.client
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
