import React from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { PlatformAdminService } from '@/lib/admin/service';
import { ShieldCheck, Lock } from 'lucide-react';
import Link from 'next/link';

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
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col">
      {/* Top Private Platform Admin Status Banner */}
      <div className="bg-[#0b0f19] text-white border-b border-outline-variant/40 px-4 py-2 text-xs flex items-center justify-between z-50">
        <div className="flex items-center gap-2 font-mono">
          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-extrabold tracking-wider uppercase border border-purple-500/30 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-purple-400" /> PRIVATE PLATFORM ADMIN
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            admin.ventrexs.com • Authorized Identities Only
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">
            {userEmail || 'owner1@ventrexs.com'}
          </span>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Customer View &rarr;
          </Link>
        </div>
      </div>

      <div className="flex-1">{children}</div>
    </div>
  );
}
