import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { Database } from '@/lib/supabase/types';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://paypilot-demo.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'paypilot-demo-anon-key';

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

  const { pathname } = req.nextUrl;

  const protectedPrefixes = [
    '/dashboard',
    '/invoices',
    '/customers',
    '/copilot',
    '/collections',
    '/follow-up',
    '/reports',
    '/notifications',
    '/settings',
    '/profile',
    '/admin',
  ];

  const isProtectedRoute = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // Unauthenticated user attempting to access protected resource
  if (isProtectedRoute && !user) {
    if (isDemoMode) {
      return res;
    }

    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Authenticated user attempting to visit login/signup
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/invoices/:path*',
    '/customers/:path*',
    '/copilot/:path*',
    '/collections/:path*',
    '/follow-up/:path*',
    '/reports/:path*',
    '/notifications/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/login',
    '/signup',
  ],
};
