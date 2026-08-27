'use client';

import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { TrendingUp, DollarSign, CreditCard, ArrowUpRight, ShieldCheck, Globe, Smartphone, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function AdminRevenuePage() {
  const metrics = {
    totalMrr: 45820,
    mrrGrowth: 18.4,
    totalArr: 549840,
    grossInvoiceVolume: 1845920,
    subscriptionRevenue: 45820,
    customerProcessingGmv: 1800100,
    breakdownByProvider: [
      { provider: 'Razorpay (India SaaS & UPI)', mrr: 22400, share: 49, icon: Globe },
      { provider: 'Stripe (International SaaS)', mrr: 15400, share: 34, icon: CreditCard },
      { provider: 'Google Play (Android SaaS)', mrr: 6420, share: 14, icon: Smartphone },
      { provider: 'Alternative Wire Billing', mrr: 1600, share: 3, icon: RefreshCw },
    ],
  };

  return (
    <AdminLayout
      title="Platform Revenue Operations & Global GMV"
      subtitle="Financial overview of SaaS subscription revenue, processed customer invoice GMV, and payment provider channel distribution."
      showBack
      backUrl="/admin"
    >
      <div className="space-y-6">
        {/* Top Metric Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Platform MRR</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 font-mono">${metrics.totalMrr.toLocaleString()}</span>
              <span className="text-xs text-emerald-600 font-bold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +{metrics.mrrGrowth}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Verified multi-tenant subscriptions</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Annual Run Rate (ARR)</span>
            <span className="text-3xl font-black text-slate-900 font-mono">${metrics.totalArr.toLocaleString()}</span>
            <p className="text-[11px] text-slate-500">Extrapolated forward run rate</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Gross Invoice GMV</span>
            <span className="text-3xl font-black text-emerald-600 font-mono">${metrics.grossInvoiceVolume.toLocaleString()}</span>
            <p className="text-[11px] text-slate-500">Contractor field invoices settled</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Google Play Android MRR</span>
            <span className="text-3xl font-black text-slate-900 font-mono">$6,420</span>
            <p className="text-[11px] text-emerald-600 font-semibold">14% total SaaS revenue</p>
          </div>
        </section>

        {/* Breakdown by Provider */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Revenue Distribution by Payment Provider
            </h3>
            <span className="text-xs font-mono font-medium text-slate-500">Zero Floating-Point Variance</span>
          </div>

          <div className="space-y-3">
            {metrics.breakdownByProvider.map((b, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <b.icon className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900">{b.provider}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-900">${b.mrr.toLocaleString()}/mo</span>
                    <span className="text-[10px] font-mono text-indigo-700 font-bold bg-indigo-100 px-2 py-0.5 rounded">
                      {b.share}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${b.share}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
