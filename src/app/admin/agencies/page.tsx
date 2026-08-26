'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { getAdminAgenciesAction } from '@/app/actions/admin';
import {
  Building,
  Search,
  CheckCircle2,
  TrendingUp,
  Users,
} from 'lucide-react';

export default function AdminAgenciesPage() {
  const { showToast } = useApp();
  const [agencies, setAgencies] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      const res = await getAdminAgenciesAction();
      if (res.success && res.data) {
        setAgencies(res.data);
      }
    }
    loadData();
  }, []);

  const filtered = agencies.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell title="Platform Agencies & Resellers" showBack backUrl="/admin">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Search Bar */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search agencies by name or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant rounded-xl pl-9 pr-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>
          <span className="text-xs text-on-surface-variant font-mono">{filtered.length} Agencies</span>
        </section>

        {/* Directory List */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xs overflow-hidden divide-y divide-outline-variant/60">
          {filtered.map((ag) => (
            <div key={ag.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-container-low/30 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-on-surface">{ag.name}</h3>
                  <span className="text-[10px] font-mono text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
                    slug: {ag.slug}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {ag.tier}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-on-surface-variant font-mono pt-1">
                  <span>Managed Businesses: {ag.businesses}</span>
                  <span>Portfolio MRR: ${ag.mrr}/mo</span>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
              </span>
            </div>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
