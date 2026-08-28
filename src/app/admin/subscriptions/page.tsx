'use client';

import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/Button';
import { CreditCard, TrendingUp, ShieldCheck, CheckCircle2, Zap, Smartphone, Globe } from 'lucide-react';
import Link from 'next/link';

export default function AdminSubscriptionsPage() {
  const plans = [
    { name: 'Starter', price: '$29/mo', count: 184, mrr: 5336, color: 'text-blue-600', provider: 'Razorpay / Google Play' },
    { name: 'Professional', price: '$79/mo', count: 168, mrr: 13272, color: 'text-indigo-600', provider: 'Stripe / Google Play / Razorpay' },
    { name: 'Enterprise', price: '$249/mo', count: 32, mrr: 7968, color: 'text-purple-600', provider: 'Stripe / Wire / Razorpay' },
    { name: 'Agency Reseller', price: '$699/mo', count: 28, mrr: 19572, color: 'text-amber-600', provider: 'Stripe / Razorpay' },
  ];

  const subscriptionsList = [
    { id: 'sub_01', tenant: 'Apex Precision HVAC', agency: 'Apex Growth Marketing', plan: 'Professional', source: 'RAZORPAY', status: 'ACTIVE', mrr: 79, renewal: '2026-09-01', providerId: 'sub_rzp_88491028' },
    { id: 'sub_02', tenant: 'Precision Roofing & Siding', agency: 'Apex Growth Marketing', plan: 'Enterprise', source: 'STRIPE', status: 'ACTIVE', mrr: 249, renewal: '2026-09-15', providerId: 'sub_1Nq84L2KZIS582' },
    { id: 'sub_03', tenant: 'Metro Pro Plumbing', agency: 'Apex Growth Marketing', plan: 'Starter', source: 'GOOGLE_PLAY', status: 'ACTIVE', mrr: 29, renewal: '2026-09-10', providerId: 'GPA.3391-4820-9182' },
    { id: 'sub_04', tenant: 'ClearFlow Drain & Septic', agency: 'TradeScale Reseller', plan: 'Starter', source: 'GOOGLE_PLAY', status: 'TRIAL', mrr: 29, renewal: '2026-09-05', providerId: 'GPA.9912-8472-1102' },
    { id: 'sub_05', tenant: 'Highland Commercial', agency: 'Local Contractors Agency', plan: 'Enterprise', source: 'STRIPE', status: 'ACTIVE', mrr: 249, renewal: '2026-09-20', providerId: 'sub_1Nq899018231' },
  ];

  return (
    <AdminLayout
      title="Platform SaaS Subscriptions"
      subtitle="Centralized overview of multi-tenant subscription tiers, lifecycle states, Google Play Android billing, and provider routing."
      showBack
      backUrl="/admin"
      actions={
        <div className="flex items-center gap-2">
          <Link href="/admin/payments">
            <Button variant="outline" size="sm" className="text-xs bg-white text-slate-700 border-slate-200 hover:bg-slate-50 min-h-[36px]">
              Payment Ledger
            </Button>
          </Link>
          <Link href="/admin/reconciliation">
            <Button size="sm" className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold min-h-[36px]">
              Reconciliation
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6 max-w-full overflow-hidden">
        {/* Plan Breakdown Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {plans.map((p, idx) => (
            <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1.5 min-w-0">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 truncate block">{p.name}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{p.count}</span>
                <span className="text-xs text-slate-500">subscribers</span>
              </div>
              <p className="text-xs font-bold text-emerald-600 font-mono">MRR: ${p.mrr.toLocaleString()}</p>
              <span className="text-[11px] text-slate-400 block truncate">{p.provider}</span>
            </div>
          ))}
        </section>

        {/* Lifecycle States Summary */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-3 sm:space-y-4 min-w-0">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600 shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">Subscription Lifecycle Health</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500">ACTIVE</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">382</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500">TRIAL</span>
              <p className="text-xl sm:text-2xl font-black text-blue-600 font-mono">18</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500">PAST DUE</span>
              <p className="text-xl sm:text-2xl font-black text-amber-600 font-mono">6</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500">CANCELLED</span>
              <p className="text-xl sm:text-2xl font-black text-slate-500 font-mono">4</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">CHURN RATE</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">0.9%</p>
            </div>
          </div>
        </section>

        {/* Active Subscriptions Inspection Table */}
        <section className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 truncate">
              Live Subscription Registry ({subscriptionsList.length})
            </h3>
            <span className="text-[11px] text-slate-500 font-mono shrink-0">Audited Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tenant Business</th>
                  <th className="py-3 px-4">Agency Reseller</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Billing Source</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Renewal Date</th>
                  <th className="py-3 px-4 text-right">MRR Value</th>
                  <th className="py-3 px-4 text-center">Provider ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {subscriptionsList.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">{sub.tenant}</td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">{sub.agency}</td>
                    <td className="py-3.5 px-4 font-bold text-indigo-600 whitespace-nowrap">{sub.plan}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 border border-slate-200 text-slate-700">
                        {sub.source}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">{sub.renewal}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">${sub.mrr}/mo</td>
                    <td className="py-3.5 px-4 text-center font-mono text-[11px] text-slate-500 whitespace-nowrap">{sub.providerId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
