'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { HealthService } from '@/lib/health/service';
import { ProductionReadinessCheck } from '@/lib/agency/types';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Server,
  Lock,
  Database,
  CreditCard,
  Mail,
  MessageSquare,
  Sparkles,
  Radio,
} from 'lucide-react';

export default function ProductionReadinessPage() {
  const { showToast } = useApp();
  const [checks, setChecks] = useState<ProductionReadinessCheck[]>([]);
  const [loading, setLoading] = useState(false);

  const loadChecks = () => {
    setLoading(true);
    const results = HealthService.getProductionReadiness();
    setChecks(results);
    setLoading(false);
  };

  useEffect(() => {
    loadChecks();
  }, []);

  const readyCount = checks.filter((c) => c.status === 'READY').length;
  const warningCount = checks.filter((c) => c.status === 'WARNING').length;
  const blockedCount = checks.filter((c) => c.status === 'BLOCKED').length;

  return (
    <AppShell
      title="Production Readiness Center"
      showBack
      backUrl="/settings"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            loadChecks();
            showToast({ title: 'Diagnostics Refreshed', description: 'Evaluated 12 core subsystems.', type: 'info' });
          }}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          className="text-xs"
        >
          Run Diagnostics
        </Button>
      }
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Readiness Overview Banner */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-bold text-on-surface">Platform Launch Readiness</h2>
            </div>
            <p className="text-xs text-on-surface-variant">
              Continuous live assessment of security boundaries, providers, and multi-tenant invariants.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-center px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <span className="text-lg font-black text-emerald-600 font-mono">{readyCount}</span>
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block uppercase">Ready</span>
            </div>
            <div className="text-center px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <span className="text-lg font-black text-amber-600 font-mono">{warningCount}</span>
              <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 block uppercase">Warning</span>
            </div>
            <div className="text-center px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <span className="text-lg font-black text-rose-600 font-mono">{blockedCount}</span>
              <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 block uppercase">Blocked</span>
            </div>
          </div>
        </section>

        {/* Diagnostic Checks List */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xs overflow-hidden divide-y divide-outline-variant/60">
          <div className="p-4 bg-surface-container-low flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Subsystem Checks (12)</h3>
            <span className="text-[11px] text-on-surface-variant font-mono">Zero Secrets Exposed</span>
          </div>

          {checks.map((chk) => {
            const isReady = chk.status === 'READY';
            const isWarning = chk.status === 'WARNING';
            const isBlocked = chk.status === 'BLOCKED';

            return (
              <div key={chk.id} className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-surface-container-low/30 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-on-surface">{chk.name}</h4>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-mono">
                      {chk.category}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">{chk.message}</p>
                </div>

                <div className="shrink-0 flex items-center gap-1.5">
                  {isReady && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> READY
                    </span>
                  )}
                  {isWarning && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      <AlertTriangle className="w-3.5 h-3.5" /> WARNING
                    </span>
                  )}
                  {isBlocked && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                      <XCircle className="w-3.5 h-3.5" /> BLOCKED
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}
