import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AgencyTenantService } from '@/lib/agency/service';
import { Building2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Agency Portal | Ventrexs AI',
  robots: {
    index: false,
    follow: false,
  },
};

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
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col antialiased">
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
