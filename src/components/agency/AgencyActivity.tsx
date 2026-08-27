'use client';

import React, { useState } from 'react';
import { AgencyActivityEvent } from '@/data/agencyData';
import {
  Activity,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  Globe,
  CreditCard,
  Server,
  Palette,
  ShieldCheck,
  Search,
} from 'lucide-react';

interface AgencyActivityProps {
  activities: AgencyActivityEvent[];
}

export const AgencyActivity: React.FC<AgencyActivityProps> = ({ activities }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const categories = ['ALL', 'Billing', 'Domains', 'Onboarding', 'Deployments', 'White-Label', 'Security'];

  const filtered = activities.filter((act) => {
    const matchesCategory = selectedCategory === 'ALL' || act.category === selectedCategory;
    const matchesSearch =
      act.title.toLowerCase().includes(search.toLowerCase()) ||
      act.description.toLowerCase().includes(search.toLowerCase()) ||
      act.actor.toLowerCase().includes(search.toLowerCase()) ||
      (act.clientName && act.clientName.toLowerCase().includes(search.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Agency Activity Stream & Audit Log
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/30 font-mono">
              Immutable SaaS Event Log
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time audit log of onboarding milestones, domain bindings, payments collected, deployment releases, and team actions.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-surface-container-low'
              }`}
            >
              {cat === 'ALL' ? 'All Activity' : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#070b14] border border-outline-variant/60 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary placeholder-slate-500"
          />
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 p-6 shadow-xs">
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-outline-variant/40">
          {filtered.map((act) => {
            const getCategoryIcon = () => {
              switch (act.category) {
                case 'Billing':
                  return <CreditCard className="w-3.5 h-3.5 text-emerald-400" />;
                case 'Domains':
                  return <Globe className="w-3.5 h-3.5 text-sky-400" />;
                case 'Onboarding':
                  return <Building2 className="w-3.5 h-3.5 text-primary" />;
                case 'Deployments':
                  return <Server className="w-3.5 h-3.5 text-indigo-400" />;
                case 'White-Label':
                  return <Palette className="w-3.5 h-3.5 text-purple-400" />;
                default:
                  return <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />;
              }
            };

            return (
              <div key={act.id} className="relative group">
                {/* Node Bullet */}
                <div
                  className={`absolute -left-6 top-1 w-5 h-5 rounded-full bg-[#0a0f1d] border-2 flex items-center justify-center ${
                    act.severity === 'success'
                      ? 'border-emerald-400 text-emerald-400'
                      : act.severity === 'warning'
                      ? 'border-amber-400 text-amber-400'
                      : act.severity === 'error'
                      ? 'border-red-400 text-red-400'
                      : 'border-primary text-primary'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                </div>

                {/* Event Content Card */}
                <div className="p-4 bg-[#070b14] border border-outline-variant/40 hover:border-primary/40 rounded-2xl space-y-1.5 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-white">{act.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-surface-container text-slate-300 flex items-center gap-1">
                        {getCategoryIcon()}
                        {act.category}
                      </span>
                      {act.clientName && (
                        <span className="text-[10px] font-semibold text-primary">
                          &bull; {act.clientName}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{act.timeAgo}</span>
                  </div>

                  <p className="text-xs text-slate-300">{act.description}</p>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 font-mono">
                    <span>Triggered by: {act.actor}</span>
                    <span>{act.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
