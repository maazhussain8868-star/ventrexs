'use client';

import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/Button';
import { CreditCard, TrendingUp, ShieldCheck, CheckCircle2, Zap, Smartphone, Globe } from 'lucide-react';
import Link from 'next/link';

export default function AdminSubscriptionsPage() {
  const plans = [
    { name: 'Starter', price: '$19/mo', count: 184, mrr: 3496, color: 'text-blue-600', provider: 'Razorpay / Google Play' },
    { name: 'Professional', price: '$49/mo', count: 168, mrr: 8232, color: 'text-indigo-600', provider: 'Stripe / Google Play / Razorpay' },
    { name: 'Enterprise', price: '$199/mo', count: 32, mrr: 6368, color: 'text-purple-600', provider: 'Stripe / Wire / Razorpay' },
    { name: 'Agency Reseller', price: '$490/mo', count: 28, mrr: 13720, color: 'text-amber-600', provider: 'Stripe / Razorpay' },
  ];

  const subscriptionsList = [
    { id: 'sub_01', tenant: 'Apex Precision HVAC', agency: 'Apex Growth Marketing', plan: 'Professional', source: 'RAZORPAY', status: 'ACTIVE', mrr: 49, renewal: '2026-09-01', providerId: 'sub_rzp_88491028' },
    { id: 'sub_02', tenant: 'Precision Roofing & Siding', agency: 'Apex Growth Marketing', plan: 'Enterprise', source: 'STRIPE', status: 'ACTIVE', mrr: 199, renewal: '2026-09-15', providerId: 'sub_1Nq84L2KZIS582' },
    { id: 'sub_03', tenant: 'Metro Pro Plumbing', agency: 'Apex Growth Marketing', plan: 'Starter', source: 'GOOGLE_PLAY', status: 'ACTIVE', mrr: 19, renewal: '2026-09-10', providerId: 'GPA.3391-4820-9182' },
    { id: 'sub_04', tenant: 'ClearFlow Drain & Septic', agency: 'TradeScale Reseller', plan: 'Starter', source: 'GOOGLE_PLAY', status: 'TRIAL', mrr: 19, renewal: '2026-09-05', providerId: 'GPA.9912-8472-1102' },
    { id: 'sub_05', tenant: 'Highland Commercial', agency: 'Local Contractors Agency', plan: 'Enterprise', source: 'STRIPE', status: 'ACTIVE', mrr: 199, renewal: '2026-09-20', providerId: 'sub_1Nq899018231' },
  ];

  return (
    <AdminLayout
      title="Platform SaaS Subscriptions & Lifecycle"
      subtitle="Centralized overview of multi-tenant subscription tiers, lifecycle states, Google Play Android billing, and provider routing."
      showBack
      backUrl="/admin"
      actions={
        <div className="flex items-center gap-2">
          <Link href="/admin/payments">
            <Button variant="outline" className="text-xs bg-white text-slate-700 border-slate-200 hover:bg-slate-50">
              Payment Ledger
            </Button>
          </Link>
          <Link href="/admin/reconciliation">
            <Button className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
              Reconciliation
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Plan Breakdown Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p, idx) => (
            <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{p.name}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 font-mono">{p.count}</span>
                <span className="text-xs text-slate-500">subscribers</span>
              </div>
              <p className="text-xs font-bold text-emerald-600 font-mono">MRR: ${p.mrr.toLocaleString()}</p>
              <span className="text-[11px] text-slate-400 block">{p.provider}</span>
            </div>
          ))}
        </section>

        {/* Lifecycle States Summary */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Subscription Lifecycle Health</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500">ACTIVE</span>
              <p className="text-2xl font-black text-emerald-600 font-mono">382</p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500">TRIAL</span>
              <p className="text-2xl font-black text-blue-600 font-mono">18</p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500">PAST DUE</span>
              <p className="text-2xl font-black text-amber-600 font-mono">6</p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500">CANCELLED</span>
              <p className="text-2xl font-black text-slate-500 font-mono">4</p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500">CHURN RATE</span>
              <p className="text-2xl font-black text-emerald-600 font-mono">0.9%</p>
            </div>
          </div>
        </section>

        {/* Active Subscriptions Inspection Table */}
        <section className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Live Subscription Registry ({subscriptionsList.length})
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Audited Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Tenant Business</th>
                  <th className="p-4">Agency Reseller</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Billing Source</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Renewal Date</th>
                  <th className="p-4 text-right">MRR Value</th>
                  <th className="p-4 text-center">Provider ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {subscriptionsList.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{sub.tenant}</td>
                    <td className="p-4 text-slate-500 text-[11px]">{sub.agency}</td>
                    <td className="p-4 font-bold text-indigo-600">{sub.plan}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 border border-slate-200 text-slate-700">
                        {sub.source}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-600">{sub.renewal}</td>
                    <td className="p-4 text-right font-mono font-bold text-slate-900">${sub.mrr}/mo</td>
                    <td className="p-4 text-center font-mono text-[11px] text-slate-500">{sub.providerId}</td>
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
