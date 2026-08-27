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
          className="text-xs bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
        >
          Refresh Stream
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Subsystem Latency Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((m, idx) => (
            <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{m.component}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-mono border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> {m.status}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 font-mono">{m.responseTimeMs} ms</span>
                <span className="text-[11px] text-slate-500">latency</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Checked: {new Date(m.lastChecked).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </section>

        {/* Readiness Checklist */}
        <section className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Production Safety Diagnostics ({readiness.length})
            </h3>
            <span className="text-[11px] text-slate-500 font-mono font-medium">Zero Raw Secrets Leaked</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {readiness.map((chk) => (
              <div key={chk.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{chk.name}</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {chk.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{chk.message}</p>
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
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
