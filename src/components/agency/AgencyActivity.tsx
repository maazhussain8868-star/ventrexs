'use client';

import React, { useState } from 'react';
import { AgencyActivityEvent } from '@/data/agencyData';
import {
  Activity,
  CreditCard,
  Building2,
  Globe,
  Server,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react';

interface AgencyActivityProps {
  activities: AgencyActivityEvent[];
}

export const AgencyActivity: React.FC<AgencyActivityProps> = ({ activities }) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const filtered = activities.filter((a) => {
    if (filterCategory === 'ALL') return true;
    return a.category.toUpperCase() === filterCategory.toUpperCase();
  });

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'billing':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'clients':
        return <Building2 className="w-4 h-4 text-violet-600" />;
      case 'domains':
        return <Globe className="w-4 h-4 text-blue-600" />;
      case 'deployments':
        return <Server className="w-4 h-4 text-indigo-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Agency Activity Feed</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time audit log of client onboarding, domain changes, subscriptions, and deployment tasks.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {['ALL', 'BILLING', 'CLIENTS', 'DOMAINS', 'DEPLOYMENTS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                filterCategory === cat
                  ? 'bg-white text-violet-700 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      <section className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden divide-y divide-slate-100">
        {filtered.map((act) => (
          <div key={act.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors text-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                {getCategoryIcon(act.category)}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{act.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                    {act.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{act.description}</p>
                <span className="text-[11px] font-mono text-slate-400">Tenant: {act.clientName || 'General'}</span>
              </div>
            </div>

            <div className="text-right space-y-1 shrink-0">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> SUCCESS
              </span>
              <p className="text-[11px] text-slate-400 font-mono">{act.timeAgo || act.timestamp}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};
