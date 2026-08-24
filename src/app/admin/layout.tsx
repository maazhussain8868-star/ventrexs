import React from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { checkServerAdminAuthorization } from '@/lib/auth/server-authorization';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  // Demo mode allows exploratory viewing
  if (isDemoMode) {
    return <>{children}</>;
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login?redirectTo=/admin');
  }

  // Authorize admin or owner role strictly on server side
  const isAuthorized = await checkServerAdminAuthorization(supabase, user.id);
  if (!isAuthorized) {
    // Normal member without admin privileges is redirected to dashboard
    redirect('/dashboard?error=unauthorized_admin_access');
  }

  return <>{children}</>;
}
