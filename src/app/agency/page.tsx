'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { getAgencyDashboardAction } from '@/app/actions/agency';
import Link from 'next/link';
import {
  Building,
  TrendingUp,
  CreditCard,
  Layers,
  Globe,
  Palette,
  ArrowRight,
  ShieldCheck,
  Users,
} from 'lucide-react';

export default function AgencyDashboardPage() {
  const { showToast } = useApp();
  const [stats, setStats] = useState<any>({
    totalBusinesses: 12,
    activeBusinesses: 10,
    trialBusinesses: 2,
    suspendedBusinesses: 0,
    totalMrr: 1840,
    activeSubscriptions: 12,
    recentActivity: [],
  });

  useEffect(() => {
    async function loadStats() {
      const res = await getAgencyDashboardAction();
      if (res.success && res.data) {
        setStats(res.data);
      }
    }
    loadStats();
  }, []);

  return (
    <AppShell
      title="Agency & Reseller Hub"
      actions={
        <Link href="/agency/businesses">
          <Button variant="primary" size="sm" className="text-xs" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Manage Client Accounts
          </Button>
        </Link>
      }
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Banner */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Building className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-on-surface">Reseller & Agency Command Hub</h2>
            </div>
            <p className="text-xs text-on-surface-variant">
              Manage multiple client trade businesses, configure custom white-label branding, and supervise recurring subscriptions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/agency/branding">
              <Button variant="outline" size="sm" className="text-xs" leftIcon={<Palette className="w-3.5 h-3.5" />}>
                Branding
              </Button>
            </Link>
            <Link href="/agency/domains">
              <Button variant="outline" size="sm" className="text-xs" leftIcon={<Globe className="w-3.5 h-3.5" />}>
                Custom Domains
              </Button>
            </Link>
          </div>
        </section>

        {/* 4 Stat Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-xs font-bold uppercase tracking-wider">Total Managed</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-black text-on-surface font-mono">{stats.totalBusinesses}</div>
            <p className="text-[11px] text-on-surface-variant">Active client tenants</p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-xs font-bold uppercase tracking-wider">Portfolio MRR</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600 font-mono">${stats.totalMrr.toLocaleString()}</div>
            <p className="text-[11px] text-emerald-600 font-bold">Monthly Recurring Revenue</p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-xs font-bold uppercase tracking-wider">Active Subscriptions</span>
              <CreditCard className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-black text-on-surface font-mono">{stats.activeSubscriptions}</div>
            <p className="text-[11px] text-on-surface-variant">100% in good standing</p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-xs font-bold uppercase tracking-wider">Trials</span>
              <Layers className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-600 font-mono">{stats.trialBusinesses}</div>
            <p className="text-[11px] text-on-surface-variant">14-day trial active</p>
          </div>
        </section>

        {/* Quick Links & Activity */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Agency Capabilities</h3>
            <div className="space-y-3">
              <Link
                href="/agency/businesses"
                className="p-4 bg-surface-container-low hover:bg-surface-container-high rounded-xl flex items-center justify-between transition-colors"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-on-surface">Client Business Directory</span>
                  <p className="text-[11px] text-on-surface-variant">Switch into client accounts, suspend, or invite business owners.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-on-surface-variant" />
              </Link>

              <Link
                href="/agency/branding"
                className="p-4 bg-surface-container-low hover:bg-surface-container-high rounded-xl flex items-center justify-between transition-colors"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-on-surface">White-Label Branding Suite</span>
                  <p className="text-[11px] text-on-surface-variant">Configure custom logos, theme colors, login headlines, and email signatures.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-on-surface-variant" />
              </Link>

              <Link
                href="/agency/domains"
                className="p-4 bg-surface-container-low hover:bg-surface-container-high rounded-xl flex items-center justify-between transition-colors"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-on-surface">Custom Domain Manager</span>
                  <p className="text-[11px] text-on-surface-variant">Map your agency domain (e.g. app.myagency.com) with automated SSL.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-on-surface-variant" />
              </Link>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Recent Activity Trail</h3>
            <div className="divide-y divide-outline-variant/60">
              {stats.recentActivity?.map((act: any, idx: number) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <span className="text-on-surface font-medium">{act.event}</span>
                  <span className="text-[11px] text-on-surface-variant font-mono">{act.date}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
