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
      title="Ethical AI Inference Telemetry & Token Metering"
      subtitle="Observability for Google DeepMind Gemini model latency, context token consumption, and confidence threshold gates."
      showBack
      backUrl="/admin"
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0a0f1d] border border-outline-variant/40 rounded-2xl p-5 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inference Calls Today</span>
            <span className="text-2xl font-black text-white font-mono">{telemetry.todayCalls.toLocaleString()}</span>
            <p className="text-[11px] text-emerald-400 font-semibold">+18% inquiry expansion</p>
          </div>

          <div className="bg-[#0a0f1d] border border-outline-variant/40 rounded-2xl p-5 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tokens Processed</span>
            <span className="text-2xl font-black text-white font-mono">{telemetry.totalTokens}</span>
            <p className="text-[11px] text-slate-400">Context window tokens</p>
          </div>

          <div className="bg-[#0a0f1d] border border-outline-variant/40 rounded-2xl p-5 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">P95 Inference Latency</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{telemetry.avgLatency}</span>
            <p className="text-[11px] text-emerald-400 font-semibold">Gemini Flash low-latency</p>
          </div>

          <div className="bg-[#0a0f1d] border border-outline-variant/40 rounded-2xl p-5 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Safety Pass Rate</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{telemetry.safetyPassRate}</span>
            <p className="text-[11px] text-slate-400">0 ethical violations</p>
          </div>
        </section>

        {/* Model Breakdown */}
        <section className="bg-[#0a0f1d] border border-outline-variant/40 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Model Distribution & Reasoning Clusters
          </h3>

          <div className="space-y-3">
            {telemetry.models.map((m, idx) => (
              <div key={idx} className="p-4 bg-[#070b14] border border-outline-variant/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{m.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400">{m.calls} calls</span>
                    <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded">
                      {m.share}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${m.share}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
