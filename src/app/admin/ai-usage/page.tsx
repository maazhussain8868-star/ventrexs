'use client';

import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Bot, Sparkles, Cpu, ShieldCheck, CheckCircle2, Zap, Activity } from 'lucide-react';

export default function AdminAiUsagePage() {
  const telemetry = {
    todayCalls: 1840,
    totalTokens: '4.82M',
    avgLatency: '22ms',
    approvalRate: '99.4%',
    safetyPassRate: '100%',
    models: [
      { name: 'Gemini 1.5 Flash (Receptionist & Triage)', share: 68, calls: '1,250' },
      { name: 'Gemini 1.5 Pro (Estimates & Invoices)', share: 24, calls: '440' },
      { name: 'Gemini Safety Guard Evaluator', share: 8, calls: '150' },
    ],
  };

  return (
    <AdminLayout
      title="AI Inference & Token Metering"
      subtitle="Observability for Google DeepMind Gemini model latency, context token consumption, and confidence threshold gates."
      showBack
      backUrl="/admin"
    >
      <div className="space-y-6 max-w-full overflow-hidden">
        {/* Metric Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Inference Calls Today</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{telemetry.todayCalls.toLocaleString()}</span>
            <p className="text-[11px] text-emerald-600 font-semibold">+18% inquiry expansion</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tokens Processed</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{telemetry.totalTokens}</span>
            <p className="text-[11px] text-slate-500">Context window tokens</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">P95 Inference Latency</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">{telemetry.avgLatency}</span>
            <p className="text-[11px] text-emerald-600 font-semibold">Gemini Flash low-latency</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Safety Pass Rate</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">{telemetry.safetyPassRate}</span>
            <p className="text-[11px] text-slate-500">0 ethical violations</p>
          </div>
        </section>

        {/* Model Breakdown */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 min-w-0">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
            Model Distribution & Clusters
          </h3>

          <div className="space-y-3">
            {telemetry.models.map((m, idx) => (
              <div key={idx} className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                  <span className="text-xs font-bold text-slate-900 truncate">{m.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono text-slate-500">{m.calls} calls</span>
                    <span className="text-[10px] font-mono text-indigo-700 font-bold bg-indigo-100 px-2 py-0.2 rounded">
                      {m.share}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${m.share}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
