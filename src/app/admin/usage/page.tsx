'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Layers, Bot, MessageSquare, PhoneCall, CheckCircle2 } from 'lucide-react';

export default function AdminUsagePage() {
  const meters = [
    { title: 'AI Receptionist Inquiries', used: '42,850', cap: '100,000', icon: Bot, percent: 43 },
    { title: 'SMS & WhatsApp Messages', used: '128,490', cap: '250,000', icon: MessageSquare, percent: 51 },
    { title: 'Active Work Orders (Jobs)', used: '18,420', cap: '50,000', icon: Layers, percent: 37 },
  ];

  return (
    <AppShell title="Platform Usage & Capacity Meters" showBack backUrl="/admin">
      <div className="max-w-5xl mx-auto space-y-6">
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-on-surface">Resource Metering & Quotas</h2>
            </div>
            <p className="text-xs text-on-surface-variant">
              Platform-wide consumption metrics across AI engines, carrier dispatches, and cloud jobs.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {meters.map((m, idx) => (
            <div key={idx} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <m.icon className="w-5 h-5 text-primary" />
                <span className="text-xs font-mono font-bold text-on-surface-variant">{m.percent}%</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-on-surface">{m.title}</h3>
                <p className="text-xs font-mono text-on-surface-variant">{m.used} / {m.cap}</p>
              </div>
              <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${m.percent}%` }} />
              </div>
            </div>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
