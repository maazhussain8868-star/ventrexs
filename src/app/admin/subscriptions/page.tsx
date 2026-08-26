'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { CreditCard, TrendingUp, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AdminSubscriptionsPage() {
  const plans = [
    { name: 'Starter', price: '$19/mo', count: 184, mrr: 3496, color: 'text-blue-500', provider: 'Razorpay / Stripe' },
    { name: 'Professional', price: '$49/mo', count: 168, mrr: 8232, color: 'text-purple-500', provider: 'Razorpay / Stripe' },
    { name: 'Enterprise', price: '$199/mo', count: 32, mrr: 6368, color: 'text-emerald-500', provider: 'Razorpay / Stripe' },
    { name: 'Agency Reseller', price: '$490/mo', count: 28, mrr: 13720, color: 'text-amber-500', provider: 'Razorpay / Stripe' },
  ];

  return (
    <AppShell title="Platform Subscription Analytics" showBack backUrl="/admin">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Banner */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-on-surface">SaaS Subscription Ledger & MRR</h2>
            </div>
            <p className="text-xs text-on-surface-variant">
              Centralized overview of multi-tenant subscription tiers, lifecycle states, and provider routing.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/payments">
              <Button variant="outline" className="text-xs">View Payment Ledger</Button>
            </Link>
            <Link href="/admin/reconciliation">
              <Button className="text-xs">Reconciliation</Button>
            </Link>
          </div>
        </section>

        {/* Plan Breakdown Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p, idx) => (
            <div key={idx} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{p.name}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-on-surface font-mono">{p.count}</span>
                <span className="text-xs text-on-surface-variant">subscribers</span>
              </div>
              <p className="text-xs font-bold text-emerald-600 font-mono">MRR: ${p.mrr.toLocaleString()}</p>
              <span className="text-[10px] text-on-surface-variant block">{p.provider}</span>
            </div>
          ))}
        </section>

        {/* Lifecycle States Summary */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-on-surface">Subscription Lifecycle Health</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="p-3 bg-surface-container-low rounded-xl">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant">ACTIVE</span>
              <p className="text-lg font-black text-emerald-600 font-mono">382</p>
            </div>
            <div className="p-3 bg-surface-container-low rounded-xl">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant">TRIAL</span>
              <p className="text-lg font-black text-blue-600 font-mono">18</p>
            </div>
            <div className="p-3 bg-surface-container-low rounded-xl">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant">PAST DUE</span>
              <p className="text-lg font-black text-amber-600 font-mono">6</p>
            </div>
            <div className="p-3 bg-surface-container-low rounded-xl">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant">CANCELLED</span>
              <p className="text-lg font-black text-on-surface-variant font-mono">4</p>
            </div>
            <div className="p-3 bg-surface-container-low rounded-xl">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant">CHURN RATE</span>
              <p className="text-lg font-black text-emerald-600 font-mono">0.9%</p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

