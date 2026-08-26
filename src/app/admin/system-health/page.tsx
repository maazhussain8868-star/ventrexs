'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { getAdminSystemHealthAction } from '@/app/actions/admin';
import { SystemHealthMetric, ProductionReadinessCheck } from '@/lib/agency/types';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Database,
  Cpu,
  Clock,
} from 'lucide-react';

export default function AdminSystemHealthPage() {
  const { showToast } = useApp();
  const [metrics, setMetrics] = useState<SystemHealthMetric[]>([]);
  const [readiness, setReadiness] = useState<ProductionReadinessCheck[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const res = await getAdminSystemHealthAction();
    setLoading(false);
    if (res.success && res.data) {
      setMetrics(res.data.metrics);
      setReadiness(res.data.readiness);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AppShell
      title="Platform Observability & System Health"
      showBack
      backUrl="/admin"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            loadData();
            showToast({ title: 'Telemetry Updated', description: 'Live server metrics refreshed.', type: 'info' });
          }}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          className="text-xs"
        >
          Refresh Telemetry
        </Button>
      }
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Banner */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-on-surface">Platform Telemetry & Health Stream</h2>
            </div>
            <p className="text-xs text-on-surface-variant">
              Live monitoring of API response latencies, database connectivity, and subsystem availability.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-full text-xs font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>99.99% Uptime</span>
          </div>
        </section>

        {/* Real-time Subsystem Latency Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((m, idx) => (
            <div key={idx} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface">{m.component}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full font-mono">
                  <CheckCircle2 className="w-3 h-3" /> {m.status}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-on-surface font-mono">{m.responseTimeMs} ms</span>
                <span className="text-[10px] text-on-surface-variant">latency</span>
              </div>
              <p className="text-[10px] text-on-surface-variant font-mono">
                Checked: {new Date(m.lastChecked).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </section>

        {/* Readiness Checklist Summary */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Production Safety Diagnostics ({readiness.length})
            </h3>
            <span className="text-[11px] text-on-surface-variant font-mono">Automated Health Guard</span>
          </div>

          <div className="divide-y divide-outline-variant/60 text-xs">
            {readiness.map((chk) => (
              <div key={chk.id} className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-on-surface">{chk.name}</span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                      {chk.category}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">{chk.message}</p>
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> {chk.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
