'use client';

import React from 'react';
import { AgencyClient, agencyRevenueHistory } from '@/data/agencyData';
import {
  CreditCard,
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';

interface AgencyRevenueProps {
  clients: AgencyClient[];
}

export const AgencyRevenue: React.FC<AgencyRevenueProps> = ({ clients }) => {
  const activeSubs = clients.filter((c) => c.status === 'Active');
  const trialSubs = clients.filter((c) => c.status === 'Trial');
  const totalMrr = clients.reduce((acc, c) => (c.status !== 'Suspended' ? acc + c.mrr : acc), 0);
  const arr = totalMrr * 12;

  const starterCount = clients.filter((c) => c.plan === 'Starter').length;
  const proCount = clients.filter((c) => c.plan === 'Professional').length;
  const enterpriseCount = clients.filter((c) => c.plan === 'Enterprise').length;

  const starterMrr = starterCount * 79;
  const proMrr = proCount * 149;
  const enterpriseMrr = enterpriseCount * 299;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              SaaS Subscriptions & Revenue Intelligence
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
              +18.4% MoM
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Commercial portfolio expansion, recurring contract values, plan tier distribution, and renewal ledger.
          </p>
        </div>
      </div>

      {/* High-Level Financial Telemetry */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR */}
        <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Monthly Recurring Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            ${totalMrr.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% growth vs last month</span>
          </div>
        </div>

        {/* ARR */}
        <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Annualized Run Rate (ARR)</span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            ${arr.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Contracted run rate (12mo)</p>
        </div>

        {/* Active Subscriptions */}
        <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Subscriptions</span>
            <CreditCard className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {activeSubs.length}
          </div>
          <p className="text-[11px] text-indigo-400 font-bold font-mono">
            +{trialSubs.length} trials active
          </p>
        </div>

        {/* Churn Rate & Net Retention */}
        <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">SaaS Churn Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            0.8%
          </div>
          <p className="text-[11px] text-emerald-400 font-bold font-mono">
            Net Revenue Retention: 114%
          </p>
        </div>
      </div>

      {/* 2-Column: Revenue History Visualizer & Plan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 6-Month MRR Growth Trajectory */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#0a0f1d] border border-outline-variant/50 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                MRR Growth Trajectory (Past 6 Months)
              </h3>
              <p className="text-xs text-slate-400">
                Deterministic monthly recurring contract expansion.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              +$6,570 Net Added
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-6 pb-2">
            <div className="h-48 flex items-end justify-between gap-3">
              {agencyRevenueHistory.map((item, idx) => {
                const maxMrr = 10000;
                const heightPercent = Math.round((item.mrr / maxMrr) * 100);
                const isLatest = idx === agencyRevenueHistory.length - 1;

                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-emerald-400 transition-colors">
                      ${item.mrr}
                    </span>
                    <div className="w-full bg-[#070b14] rounded-xl p-1 h-36 flex items-end">
                      <div
                        className={`w-full rounded-lg transition-all duration-500 ${
                          isLatest
                            ? 'bg-gradient-to-t from-primary to-emerald-400 shadow-md shadow-emerald-500/20'
                            : 'bg-primary/40 group-hover:bg-primary/70'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Plan Tier Distribution */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[#0a0f1d] border border-outline-variant/50 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Plan Distribution
            </h3>
            <p className="text-xs text-slate-400">
              Breakdown by active subscription tier.
            </p>
          </div>

          <div className="space-y-3 py-2">
            {/* Enterprise */}
            <div className="p-3 bg-[#070b14] rounded-xl border border-outline-variant/40 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-purple-400">Enterprise ($299/mo)</span>
                <span className="font-mono font-bold text-white">{enterpriseCount} clients</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>MRR Contribution</span>
                <span className="text-emerald-400 font-bold">${enterpriseMrr}/mo</span>
              </div>
            </div>

            {/* Professional */}
            <div className="p-3 bg-[#070b14] rounded-xl border border-outline-variant/40 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-primary">Professional ($149/mo)</span>
                <span className="font-mono font-bold text-white">{proCount} clients</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>MRR Contribution</span>
                <span className="text-emerald-400 font-bold">${proMrr}/mo</span>
              </div>
            </div>

            {/* Starter */}
            <div className="p-3 bg-[#070b14] rounded-xl border border-outline-variant/40 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-300">Starter ($79/mo)</span>
                <span className="font-mono font-bold text-white">{starterCount} clients</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>MRR Contribution</span>
                <span className="text-emerald-400 font-bold">${starterMrr}/mo</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono text-center pt-2 border-t border-outline-variant/40">
            Average Revenue Per Business (ARPU): ${(totalMrr / (clients.length || 1)).toFixed(0)}/mo
          </div>
        </div>
      </div>

      {/* Client Billing Renewal Ledger */}
      <div className="rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 overflow-hidden shadow-xs">
        <div className="p-4 bg-[#070b14] border-b border-outline-variant/50 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Client Subscription Renewal Ledger ({clients.length})
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Auto-billed via Stripe Subscriptions</span>
        </div>

        <div className="divide-y divide-outline-variant/40">
          {clients.map((c) => (
            <div
              key={c.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-surface-container-low/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                  style={{ backgroundColor: c.accentColor }}
                >
                  {c.initials}
                </div>
                <div>
                  <span className="font-bold text-white">{c.name}</span>
                  <span className="text-[11px] text-slate-400 font-mono block">
                    {c.ownerEmail} &bull; {c.plan} Tier
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Status</span>
                  <span
                    className={`font-bold ${
                      c.status === 'Active'
                        ? 'text-emerald-400'
                        : c.status === 'Trial'
                        ? 'text-amber-400'
                        : 'text-red-400'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Next Renewal</span>
                  <span className="text-slate-300">Sep 01, 2026</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Amount</span>
                  <span className="font-black text-white">${c.mrr}/mo</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
