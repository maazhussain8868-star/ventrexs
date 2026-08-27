'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { getAdminAgenciesAction } from '@/app/actions/admin';
import {
  Building,
  Search,
  CheckCircle2,
  TrendingUp,
  Users,
  Globe,
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
    <AdminLayout
      title="Platform Agencies & Resellers"
      subtitle="Overview of multi-tenant agency accounts, custom domain quotas, and aggregated client portfolio MRR."
      showBack
      backUrl="/admin"
    >
      <div className="space-y-6">
        {/* Search Bar */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search agencies by name or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder-slate-400"
            />
          </div>
          <span className="text-xs text-slate-500 font-mono font-semibold">{filtered.length} Agencies Registered</span>
        </section>

        {/* Directory List */}
        <section className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden divide-y divide-slate-100">
          {filtered.map((ag) => (
            <div key={ag.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">{ag.name}</h3>
                  <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    slug: {ag.slug}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {ag.tier}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 font-mono pt-1">
                  <span>Managed Businesses: {ag.businesses}</span>
                  <span>Portfolio MRR: ${ag.mrr}/mo</span>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
              </span>
            </div>
          ))}
        </section>
      </div>
    </AdminLayout>
  );
}
