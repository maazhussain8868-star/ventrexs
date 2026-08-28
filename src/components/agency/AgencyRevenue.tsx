'use client';

import React, { useState } from 'react';
import { AgencyClient } from '@/data/agencyData';
import { Button } from '@/components/ui/Button';
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  ArrowUpRight,
  Download,
  Calendar,
  Sparkles,
  Smartphone,
  Globe,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface AgencyRevenueProps {
  clients: AgencyClient[];
}

export const AgencyRevenue: React.FC<AgencyRevenueProps> = ({ clients }) => {
  const { showToast } = useApp();
  const [selectedRange, setSelectedRange] = useState<'30D' | '6M' | '1Y'>('6M');

  const totalMrr = clients.reduce((acc, c) => (c.status !== 'Suspended' ? acc + c.mrr : acc), 0);
  const totalArr = totalMrr * 12;
  const activeSubs = clients.filter((c) => c.status === 'Active').length;

  const starterCount = clients.filter((c) => c.plan === 'Starter').length;
  const proCount = clients.filter((c) => c.plan === 'Professional').length;
  const entCount = clients.filter((c) => c.plan === 'Enterprise').length;

  const mrrData = [
    { month: 'Mar', mrr: 1420 },
    { month: 'Apr', mrr: 1680 },
    { month: 'May', mrr: 1890 },
    { month: 'Jun', mrr: 2050 },
    { month: 'Jul', mrr: 2190 },
    { month: 'Aug', mrr: 2327 },
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-1">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
            Agency Revenue & Portfolio MRR
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 line-clamp-2">
            Aggregated recurring subscription revenue across your contractor client organizations.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => showToast({ title: 'Report Exported', description: 'Financial CSV downloaded.', type: 'info' })}
          leftIcon={<Download className="w-3.5 h-3.5" />}
          className="text-xs bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shrink-0 min-h-[36px]"
        >
          Export CSV
        </Button>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Recurring Revenue</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">${totalMrr.toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +18.4%
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Current monthly billing total</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Annual Run Rate (ARR)</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">${totalArr.toLocaleString()}</span>
          <p className="text-[11px] text-slate-400">Projected annualized run rate</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Subscriptions</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 font-mono">{activeSubs}</span>
          <p className="text-[11px] text-emerald-600 font-semibold">100% active retention</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Growth Rate</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">+18.4%</span>
          <p className="text-[11px] text-slate-400">Net client expansion</p>
        </div>
      </div>

      {/* 6-Month MRR Growth Chart */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 gap-2">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">MRR Growth — Last 6 Months</h2>
            <p className="text-xs text-slate-500 truncate">Historical progression of recurring reseller income</p>
          </div>
          <span className="text-[10px] sm:text-xs font-mono font-bold text-violet-700 bg-violet-50 px-2 sm:px-2.5 py-1 rounded-lg border border-violet-100 shrink-0">
            Aug: $2,327/mo
          </span>
        </div>

        <div className="grid grid-cols-6 gap-2 sm:gap-3 items-end h-44 sm:h-52 pt-2">
          {mrrData.map((item, idx) => {
            const heightPercent = Math.round((item.mrr / 2500) * 100);
            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 sm:gap-2 h-full justify-end group">
                <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  ${item.mrr}
                </span>
                <div className="w-full bg-slate-100 rounded-xl h-full flex items-end p-1">
                  <div
                    className="w-full bg-gradient-to-t from-violet-600 to-indigo-600 rounded-lg transition-all group-hover:from-violet-700 group-hover:to-indigo-700 shadow-2xs"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-600">{item.month}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Plan Distribution & Billing Sources (2 Cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 min-w-0">
        {/* Plan Distribution */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 min-w-0">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">Plan Distribution</h3>
          <div className="space-y-2.5 sm:space-y-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
              <span className="font-bold text-slate-900 truncate">Starter Tier ($29/mo)</span>
              <span className="font-mono font-bold text-slate-900 shrink-0">{starterCount} clients</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
              <span className="font-bold text-slate-900 truncate">Professional Tier ($79/mo)</span>
              <span className="font-mono font-bold text-slate-900 shrink-0">{proCount} clients</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
              <span className="font-bold text-slate-900 truncate">Enterprise Tier ($249/mo)</span>
              <span className="font-mono font-bold text-slate-900 shrink-0">{entCount} clients</span>
            </div>
          </div>
        </section>

        {/* Billing Sources */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 min-w-0">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">Billing Sources</h3>
          <div className="space-y-2.5 sm:space-y-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-slate-900 truncate">Google Play In-App</span>
              </div>
              <span className="font-mono font-bold text-slate-900 shrink-0">$580/mo</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-bold text-slate-900 truncate">Razorpay India UPI & Cards</span>
              </div>
              <span className="font-mono font-bold text-slate-900 shrink-0">$1,148/mo</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <CreditCard className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-bold text-slate-900 truncate">Stripe Subscriptions</span>
              </div>
              <span className="font-mono font-bold text-slate-900 shrink-0">$599/mo</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
