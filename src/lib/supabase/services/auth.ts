import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types';
import { checkEmailAuthProviderAction } from '@/app/actions/auth';

export function formatAuthErrorMessage(error: any): string {
  if (!error) return 'An unexpected authentication error occurred.';
  const msg = typeof error === 'string' ? error : error.message || error.error_description || error.msg || '';
  if (msg.includes('Google Sign-In') || msg.includes('Google sign-in')) {
    return msg;
  }
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
    error?.status === 429 ||
    error?.statusCode === 429
  ) {
    return 'Email verification rate limit reached. Supabase temporarily restricts sending to prevent spam. Please check your inbox (including Spam folder), or wait 60 seconds before requesting another.';
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
 * Environment-safe URL resolution for production, staging, and development.
 * In the browser, always uses the active window.location.origin so redirects stay
 * on the exact domain (e.g. localhost, apex https://ventrexs.com, or https://www.ventrexs.com).
 * On the server, uses the provided request origin, NEXT_PUBLIC_APP_URL, or https://www.ventrexs.com.
 */
export function resolveAppUrl(origin?: string): string {
  // 1. Browser context: always use the active window origin
  if (typeof window !== 'undefined' && window.location?.origin) {
    const browserOrigin = window.location.origin.replace(/\/$/, '');
    if (browserOrigin && !browserOrigin.includes('undefined')) {
      return browserOrigin;
    }
  }

  // 2. Server context with explicit origin passed from request
  if (origin && !origin.includes('undefined')) {
    return origin.replace(/\/$/, '');
  }

  // 3. Server fallback from environment
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && !envUrl.includes('undefined')) {
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

      // Supabase returns an empty identities array if the user already exists (user enumeration protection)
      const isExistingUser =
        authData.user &&
        Array.isArray(authData.user.identities) &&
        authData.user.identities.length === 0;

      if (isExistingUser) {
        // In Supabase, if identities.length === 0, NO verification email was sent because the account already exists!
        // Check if the user is registered via Google OAuth or standard email/password
        try {
          const providerCheck = await checkEmailAuthProviderAction(params.email);
          if (providerCheck.isGoogleOnly && providerCheck.signupMessage) {
            throw new Error(providerCheck.signupMessage);
          }
        } catch (checkErr: any) {
          if (checkErr?.message?.includes('Google Sign-In')) {
            throw checkErr;
          }
        }
        throw new Error(
          'An account with this email already exists. Please sign in instead, or request a verification email below if your account is not yet confirmed.'
        );
      }

      let business = null;
      // If a session was returned (email confirmation disabled in Supabase), ensure workspace immediately
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
        isExistingUser: false,
        isGoogleOnlyAccount: false,
      };
    } catch (err: any) {
      const msg = (err?.message || '').toLowerCase();
      if (
        msg.includes('user already registered') ||
        msg.includes('email already in use') ||
        msg.includes('already exists')
      ) {
        try {
          const providerCheck = await checkEmailAuthProviderAction(params.email);
          if (providerCheck.isGoogleOnly && providerCheck.signupMessage) {
            throw new Error(providerCheck.signupMessage);
          }
        } catch (checkErr: any) {
          if (checkErr?.message?.includes('Google Sign-In')) {
            throw checkErr;
          }
        }
      }
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
      const msg = (err?.message || '').toLowerCase();
      const code = (err?.code || err?.error_code || '').toLowerCase();
      if (
        msg.includes('invalid login credentials') ||
        msg.includes('invalid_credentials') ||
        msg.includes('invalid credentials') ||
        code.includes('invalid_credentials')
      ) {
        try {
          const providerCheck = await checkEmailAuthProviderAction(params.email);
          if (providerCheck.isGoogleOnly && providerCheck.loginMessage) {
            throw new Error(providerCheck.loginMessage);
          }
        } catch (checkErr: any) {
          if (checkErr?.message?.includes('Google Sign-In')) {
            throw checkErr;
          }
        }
      }
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
