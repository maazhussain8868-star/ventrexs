import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/types';
import { resolveHostContext } from '@/lib/auth/hostname';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  const hostname = req.headers.get('host') || '';
  const hostContext = resolveHostContext(hostname);
  const { pathname } = req.nextUrl;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let user: User | null = null;
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isDemoMode) return res;
    if (process.env.NODE_ENV === 'production' && process.env.VENTREXS_TEST_MODE !== 'true') {
      return new NextResponse('Supabase is not configured.', { status: 503 });
    }
  } else {
    const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        req.cookies.set({
          name,
          value,
          ...options,
        });
        res = NextResponse.next({
          request: {
            headers: req.headers,
          },
        });
        res.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: CookieOptions) {
        req.cookies.set({
          name,
          value: '',
          ...options,
        });
        res = NextResponse.next({
          request: {
            headers: req.headers,
          },
        });
        res.cookies.set({
          name,
          value: '',
          ...options,
        });
      },
    },
    });

    // Refresh auth session
    const {
      data: { user: authenticatedUser },
    } = await supabase.auth.getUser();
    user = authenticatedUser;
  }

  // 1. Customer Hostname Boundary Enforcement (Completely Unaware of Admin/Agency Routes)
  const isCustomerDomain = hostContext === 'CUSTOMER';
  const isProductionHost =
    hostname.includes('paypilot.com') ||
    hostname.includes('ventrexs.com') ||
    hostname.includes('flowvexa.com');

  if (isCustomerDomain && isProductionHost) {
    if (pathname.startsWith('/admin') || pathname.startsWith('/agency')) {
      const notFoundUrl = req.nextUrl.clone();
      notFoundUrl.pathname = '/_not-found';
      return NextResponse.rewrite(notFoundUrl);
    }
  }

  // 2. Admin Hostname Boundary Enforcements
  if (hostContext === 'ADMIN') {
    if (pathname === '/') {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/admin';
      return NextResponse.redirect(redirectUrl);
    }
  } else if (hostContext === 'AGENCY') {
    // 3. Agency Hostname Boundary Enforcements
    if (pathname === '/') {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/agency';
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 4. Strict Platform Admin Protection
  if (pathname.startsWith('/admin')) {
    const adminEmail = user?.email?.toLowerCase();
    const authorizedAdmins = [
      (process.env.PLATFORM_ADMIN_1_EMAIL || 'owner1@ventrexs.com').toLowerCase(),
      (process.env.PLATFORM_ADMIN_2_EMAIL || 'owner2@ventrexs.com').toLowerCase(),
      'owner1@ventrexs.com',
      'owner2@ventrexs.com',
      'owner1@flowvexa.com',
      'owner2@flowvexa.com',
      'owner1@paypilot.io',
      'owner2@paypilot.io',
    ];
    const isAuthorized = isDemoMode || (adminEmail && authorizedAdmins.includes(adminEmail));

    if (!isAuthorized) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('unauthorized', 'admin');
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 5. Strict Agency Platform Protection
  if (pathname.startsWith('/agency')) {
    if (!user && !isDemoMode) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 3. Customer Application Protected Routes
  const protectedCustomerPrefixes = [
    '/dashboard',
    '/leads',
    '/pipeline',
    '/contacts',
    '/appointments',
    '/jobs',
    '/invoices',
    '/estimates',
    '/customers',
    '/copilot',
    '/receptionist',
    '/communications',
    '/reputation',
    '/payments',
    '/collections',
    '/follow-up',
    '/reports',
    '/notifications',
    '/settings',
    '/profile',
  ];

  const isCustomerProtectedRoute = protectedCustomerPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // Agency Boundary Enforcement: Agency users / host context can NEVER access customer dashboards
  if (hostContext === 'AGENCY' && isCustomerProtectedRoute) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/agency';
    return NextResponse.redirect(redirectUrl);
  }

  if (isCustomerProtectedRoute && !user) {
    if (isDemoMode) {
      return res;
    }

    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 5. SUBSCRIPTION PAYWALL GATE — Authenticated users must have an active subscription
  //    to access protected customer routes (/dashboard, /invoices, /leads, etc.).
  //    - Enabled by default in production.
  //    - Can be easily toggled off for local testing with NEXT_PUBLIC_ENABLE_PAYWALL=false.
  //    - Demo mode also bypasses this gate.
  //    - Unpaid users are redirected to /pricing to complete checkout.
  const isPaywallEnabled =
    process.env.NEXT_PUBLIC_ENABLE_PAYWALL !== 'false' &&
    process.env.ENABLE_PAYWALL !== 'false';

  if (isCustomerProtectedRoute && user && !isDemoMode && isPaywallEnabled && supabaseUrl && supabaseAnonKey) {
    try {
      const supabaseForSub = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value;
          },
          set(_name: string, _value: string, _options: CookieOptions) {},
          remove(_name: string, _options: CookieOptions) {},
        },
      });

      // 1. Direct user subscription check
      const { data: userSub } = await supabaseForSub
        .from('subscriptions')
        .select('status, current_period_end')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let activeSub = userSub;

      // 2. Fallback to business membership subscription check
      if (!activeSub) {
        const { data: membership } = await supabaseForSub
          .from('business_members')
          .select('business_id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (membership?.business_id) {
          const { data: bizSub } = await supabaseForSub
            .from('subscriptions')
            .select('status, current_period_end')
            .eq('business_id', membership.business_id)
            .maybeSingle();
          activeSub = bizSub;
        }
      }

      const status = activeSub?.status;
      const periodEnd = activeSub?.current_period_end ? new Date(activeSub.current_period_end).getTime() : 0;
      const isTrialValid = status === 'trialing' && periodEnd > Date.now();
      const hasActiveSubscription = status === 'active' || isTrialValid;

      if (!hasActiveSubscription) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/pricing';
        redirectUrl.searchParams.set('reason', status === 'trialing' ? 'trial_expired' : 'paywall');
        redirectUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(redirectUrl);
      }
    } catch {
      // If subscription check fails (e.g. temporary network error), fail open
    }
  }

  // 6. Authenticated user visiting login/signup
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = hostContext === 'ADMIN' ? '/admin' : hostContext === 'AGENCY' ? '/agency' : '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    '/',
    '/billing/:path*',
    '/onboarding/:path*',
    '/dashboard/:path*',
    '/leads/:path*',
    '/pipeline/:path*',
    '/contacts/:path*',
    '/appointments/:path*',
    '/jobs/:path*',
    '/invoices/:path*',
    '/estimates/:path*',
    '/customers/:path*',
    '/copilot/:path*',
    '/receptionist/:path*',
    '/communications/:path*',
    '/reputation/:path*',
    '/payments/:path*',
    '/collections/:path*',
    '/follow-up/:path*',
    '/reports/:path*',
    '/notifications/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/agency/:path*',
    '/login',
    '/signup',
  ],
};


