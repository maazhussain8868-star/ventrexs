import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ventrexs-demo.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'ventrexs-demo-anon-key';

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
    data: { user },
  } = await supabase.auth.getUser();

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

  if (isCustomerProtectedRoute && !user) {
    if (isDemoMode) {
      return res;
    }

    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 4. Authenticated user visiting login/signup
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

