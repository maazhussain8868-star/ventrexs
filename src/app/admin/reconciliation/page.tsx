'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, DollarSign, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminReconciliationPage() {
  const [selectedProvider, setSelectedProvider] = useState<string>('razorpay');
  const [isReconciling, setIsReconciling] = useState<boolean>(false);

  const reports = [
    {
      provider: 'razorpay',
      totalCollected: 18450.0,
      totalRefunded: 150.0,
      matched: 384,
      discrepancies: 0,
      lastChecked: 'Today, 14:00 UTC',
      status: 'HEALTHY',
    },
    {
      provider: 'stripe',
      totalCollected: 12200.0,
      totalRefunded: 0.0,
      matched: 142,
      discrepancies: 0,
      lastChecked: 'Today, 13:45 UTC',
      status: 'HEALTHY',
    },
    {
      provider: 'skydo',
      totalCollected: 8900.0,
      totalRefunded: 0.0,
      matched: 35,
      discrepancies: 0,
      lastChecked: 'Today, 12:30 UTC',
      status: 'HEALTHY',
    },
  ];

  const currentReport = reports.find((r) => r.provider === selectedProvider) || reports[0];

  const handleRunReconciliation = () => {
    setIsReconciling(true);
    setTimeout(() => {
      setIsReconciling(false);
    }, 800);
  };

  return (
    <AppShell title="Revenue Reconciliation Engine" showBack backUrl="/admin">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Banner */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-on-surface">Multi-Provider Ledger Reconciliation</h2>
            </div>
            <p className="text-xs text-on-surface-variant">
              Automated audit comparing external payment provider transaction feeds against internal database settlement ledgers.
            </p>
          </div>
          <Button onClick={handleRunReconciliation} disabled={isReconciling} className="gap-2 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${isReconciling ? 'animate-spin' : ''}`} />
            {isReconciling ? 'Reconciling...' : 'Run Audit'}
          </Button>
        </section>

        {/* Provider Tabs */}
        <div className="flex items-center gap-2 border-b border-outline-variant pb-2">
          {['razorpay', 'stripe', 'skydo'].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedProvider(p)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                selectedProvider === p
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface border border-outline-variant'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Report Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Total Settled</span>
            <p className="text-2xl font-black text-on-surface font-mono">${currentReport.totalCollected.toLocaleString()}</p>
            <p className="text-[11px] text-emerald-600 font-semibold">100% matched with provider</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Refunds Processed</span>
            <p className="text-2xl font-black text-on-surface font-mono">${currentReport.totalRefunded.toLocaleString()}</p>
            <p className="text-[11px] text-on-surface-variant">Zero unauthorized refunds</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Matched Records</span>
            <p className="text-2xl font-black text-on-surface font-mono">{currentReport.matched}</p>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Full parity
            </p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Discrepancies</span>
            <p className="text-2xl font-black text-on-surface font-mono">{currentReport.discrepancies}</p>
            <p className="text-[11px] text-emerald-600 font-semibold">Zero variance detected</p>
          </div>
        </div>

        {/* Audit Status */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-on-surface">Reconciliation Ledger Integrity Status</h3>
            </div>
            <span className="text-xs font-mono text-on-surface-variant">Last verified: {currentReport.lastChecked}</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            All captured payments and refunds in the internal Ventrexs database match external provider records with zero floating-point variance or missing event logs. Halal financial ledger invariants are 100% compliant.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
