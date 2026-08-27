'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
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
  ShieldCheck,
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
    <AdminLayout
      title="Platform Observability & System Health"
      subtitle="Live telemetry of API latencies, database connectivity, AI reasoning clusters, carrier gateways, and payment adapters."
      showBack
      backUrl="/admin"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            loadData();
            showToast({ title: 'Telemetry Refreshed', description: 'Real-time telemetry stream updated.', type: 'info' });
          }}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          className="text-xs border-outline-variant/60 text-slate-200"
        >
          Refresh Stream
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Real-time Subsystem Latency Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((m, idx) => (
            <div key={idx} className="bg-[#0a0f1d] border border-outline-variant/40 rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{m.component}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-mono border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> {m.status}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono">{m.responseTimeMs} ms</span>
                <span className="text-[10px] text-slate-400">latency</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                Checked: {new Date(m.lastChecked).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </section>

        {/* Readiness Checklist Summary */}
        <section className="bg-[#0a0f1d] border border-outline-variant/40 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 bg-[#070b14] border-b border-outline-variant/40 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Production Safety Diagnostics ({readiness.length})
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Zero Raw Secrets Leaked</span>
          </div>

          <div className="divide-y divide-outline-variant/30 text-xs">
            {readiness.map((chk) => (
              <div key={chk.id} className="p-4 flex items-center justify-between gap-4 hover:bg-surface-container-low/30 transition-colors">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{chk.name}</span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-surface-container text-slate-300 border border-outline-variant/40">
                      {chk.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{chk.message}</p>
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> {chk.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
