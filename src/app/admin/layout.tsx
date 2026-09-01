import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { PlatformAdminService } from '@/lib/admin/service';
import { ShieldCheck, Lock } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Platform Admin | Ventrexs AI',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  let userEmail: string | null = null;
  if (!isDemoMode) {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      redirect('/login?redirectTo=/admin');
    }

    userEmail = user.email || null;
    const isAuthorized = PlatformAdminService.isAuthorizedAdmin(userEmail);
    if (!isAuthorized) {
      redirect('/dashboard?error=unauthorized_admin_access');
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      <div className="flex-1">{children}</div>
    </div>
  );
}
