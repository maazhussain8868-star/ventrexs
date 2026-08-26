import React from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AgencyTenantService } from '@/lib/agency/service';
import { Building2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function AgencyLayout({
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
      redirect('/login?redirectTo=/agency');
    }

    userEmail = user.email || null;
    const userAgencies = AgencyTenantService.getUserAgencies(userEmail || user.id);
    if (userAgencies.length === 0) {
      redirect('/dashboard?error=no_agency_membership');
    }
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col">
      {/* Top Agency Platform Banner */}
      <div className="bg-[#0e1726] text-white border-b border-outline-variant/40 px-4 py-2 text-xs flex items-center justify-between z-50">
        <div className="flex items-center gap-2 font-mono">
          <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-extrabold tracking-wider uppercase border border-primary/30 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-primary" /> AGENCY PLATFORM
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            agency.ventrexs.com • Per-Agency Tenant Context
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">
            {userEmail || 'owner@apexgrowth.agency'}
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
