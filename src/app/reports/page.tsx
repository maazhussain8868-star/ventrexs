'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { BarChartCollected } from '@/components/charts/BarChartCollected';
import { LineChartTrends } from '@/components/charts/LineChartTrends';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { Download, Calendar, TrendingUp, TrendingDown, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function ReportsPage() {
  const { showToast, collectedMtd, totalOutstanding } = useApp();
  const [timeRange, setTimeRange] = useState('30d');

  const handleExport = () => {
    showToast({
      title: 'Export Package Generated',
      description: 'Downloaded Financial_Accounts_Receivable_Report.csv',
      type: 'success'
    });
  };

  return (
    <AppShell
      title="Financial Analytics & Reports"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Export CSV
        </Button>
      }
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        {/* Header & Time Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">Accounts Receivable Health</h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-tertiary-container/15 text-tertiary">
                <ShieldCheck className="w-3.5 h-3.5" />
                Audited Principal
              </span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              Track DSO reduction, payment recovery timelines, and monthly remittance velocity.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-surface border border-outline-variant/80 rounded-xl p-1 shadow-xs">
            {[
              { id: '30d', label: 'Last 30 Days' },
              { id: '90d', label: 'Last 90 Days' },
              { id: 'ytd', label: 'Year to Date' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeRange === t.id
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChartCollected />
          <LineChartTrends />
        </div>

        {/* Financial KPI Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-surface-container-low rounded-xl text-primary">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-on-surface-variant">Avg. Days to Pay (DSO)</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-bold text-on-surface font-mono">14.2</span>
              <span className="text-xs text-on-surface-variant"> days</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-tertiary font-bold text-xs">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>-1.5 days improvement</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-surface-container-low rounded-xl text-tertiary">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-on-surface-variant">Collection Rate</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-bold text-on-surface font-mono">98.4%</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-tertiary font-bold text-xs">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+2.1% vs previous period</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-surface-container-low rounded-xl text-primary">
                <span className="material-symbols-outlined text-[18px]">payments</span>
              </div>
              <span className="text-xs font-semibold text-on-surface-variant">Payments Received MTD</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-bold text-primary font-mono">${collectedMtd.toLocaleString()}</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-tertiary font-bold text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Principal Balance</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-surface-container-low rounded-xl text-outline">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </div>
              <span className="text-xs font-semibold text-on-surface-variant">Billing Accuracy</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-bold text-on-surface font-mono">99.8%</span>
            </div>
            <div className="mt-2 text-xs font-semibold text-tertiary">
              Zero Unreconciled Items
            </div>
          </div>
        </section>

        {/* Full Export Action Bar */}
        <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div>
            <h3 className="font-bold text-sm text-on-surface">Need certified accounting reports?</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Export complete payment schedules for QuickBooks, Xero, or CPA audited financial packages.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={handleExport}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Complete Financial Package
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
