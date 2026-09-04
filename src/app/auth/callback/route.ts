import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { Database } from '@/lib/supabase/types';
import type { EmailOtpType } from '@supabase/supabase-js';
import { resolveAppUrl } from '@/lib/supabase/services/auth';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const rawNext = searchParams.get('next');

  const appUrl = resolveAppUrl(origin);

  // Recovery flow takes precedence
  let next = rawNext;
  if (type === 'recovery') {
    next = next || '/reset-password';
  } else if (!next) {
    next = '/onboarding';
  }

  const redirectTarget = next.startsWith('http')
    ? next
    : `${appUrl}${next.startsWith('/') ? next : `/${next}`}`;
  let response = NextResponse.redirect(new URL(redirectTarget));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL(`${appUrl}/auth/error?reason=supabase_not_configured`));
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  let authenticatedUser = null;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      authenticatedUser = data.user;
    } else if (error) {
      console.error('Supabase PKCE exchangeCodeForSession error:', error.message);
    }
  } else if (token_hash) {
    const otpType: EmailOtpType =
      type && ['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email'].includes(type)
        ? type
        : 'email';

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: otpType,
    });
    if (!error && data.user) {
      authenticatedUser = data.user;
    } else if (error) {
      console.error('Supabase verifyOtp error:', error.message);
    }
  }

  if (authenticatedUser) {
    // If this was a password recovery callback, redirect straight to reset-password
    if (type === 'recovery' || redirectTarget.includes('/reset-password')) {
      return response;
    }

    // Idempotently ensure user profile & workspace exist
    try {
      const adminSupabase = createAdminClient();
      const name =
        (authenticatedUser.user_metadata?.name as string) ||
        (authenticatedUser.user_metadata?.full_name as string) ||
        authenticatedUser.email?.split('@')[0] ||
        'Business Owner';
      const businessName =
        (authenticatedUser.user_metadata?.business_name as string) ||
        `${name}'s Business`;

      // 1. Ensure profile exists
      await adminSupabase.from('profiles').upsert(
        {
          id: authenticatedUser.id,
          email: authenticatedUser.email || '',
          name,
          role: 'owner',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      // 2. Check if user already has an active workspace membership
      const { data: member } = await adminSupabase
        .from('business_members')
        .select('business_id')
        .eq('user_id', authenticatedUser.id)
        .order('is_primary', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!member?.business_id) {
        // 3. Try database RPC if available
        let rpcResolved = false;
        try {
          const { data: rpcRes, error: rpcErr } = await (adminSupabase as any).rpc('ensure_user_workspace_membership', {
            p_user_id: authenticatedUser.id,
            p_email: authenticatedUser.email || '',
            p_name: name,
            p_business_name: businessName,
          });
          if (!rpcErr && (rpcRes as any)?.success) {
            rpcResolved = true;
          }
        } catch {
          // Non-blocking fallback
        }

        if (!rpcResolved) {
          // 4. Fallback: check if business exists by email
          const { data: existingBiz } = await adminSupabase
            .from('businesses')
            .select('id')
            .eq('email', authenticatedUser.email || '')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          let targetBizId = existingBiz?.id;

          if (!targetBizId) {
            const { data: newBusiness } = await adminSupabase
              .from('businesses')
              .insert({
                name: businessName,
                email: authenticatedUser.email || '',
                currency: 'USD ($)',
                payment_terms_days: 14,
                auto_reminder_enabled: true,
              })
              .select('id')
              .single();
            targetBizId = newBusiness?.id;
          }

          if (targetBizId) {
            await adminSupabase.from('business_members').upsert(
              {
                business_id: targetBizId,
                user_id: authenticatedUser.id,
                role: 'owner',
                is_primary: true,
              },
              { onConflict: 'business_id,user_id' }
            );
          }
        }
      }
    } catch (provisionErr) {
      console.warn('Auth callback workspace sync notice:', provisionErr);
    }

    // Preserve plan parameter in redirect target if configured
    const userPlan = (authenticatedUser.user_metadata?.plan as string) || '';
    if (userPlan && !redirectTarget.includes('plan=')) {
      const separator = redirectTarget.includes('?') ? '&' : '?';
      const finalTarget = `${redirectTarget}${separator}plan=${encodeURIComponent(userPlan)}`;
      const newResponse = NextResponse.redirect(new URL(finalTarget));
      response.cookies.getAll().forEach((c) => {
        newResponse.cookies.set(c);
      });
      return newResponse;
    }

    return response;
  }

  // If verification failed or code expired, redirect to branded error page
  return NextResponse.redirect(new URL(`${appUrl}/auth/error?reason=verification_failed`));
}
