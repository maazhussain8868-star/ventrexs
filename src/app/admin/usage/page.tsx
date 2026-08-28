'use client';

import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Layers, Bot, MessageSquare, PhoneCall, CheckCircle2, Cpu, HardDrive } from 'lucide-react';

export default function AdminUsagePage() {
  const meters = [
    { title: 'AI Voice Receptionist', used: '42,850', cap: '100,000', icon: Bot, percent: 43 },
    { title: 'SMS & WhatsApp Dispatches', used: '128,490', cap: '250,000', icon: MessageSquare, percent: 51 },
    { title: 'Active Work Orders (Jobs)', used: '18,420', cap: '50,000', icon: Layers, percent: 37 },
    { title: 'Cloud Object Storage', used: '48.2 GB', cap: '200 GB', icon: HardDrive, percent: 24 },
    { title: 'Inference Token Budget', used: '18.4M', cap: '50M', icon: Cpu, percent: 36 },
  ];

  return (
    <AdminLayout
      title="Usage & Metering Telemetry"
      subtitle="Global resource consumption metrics across Gemini AI engines, carrier SMS/WhatsApp gateways, and database compute."
      showBack
      backUrl="/admin"
    >
      <div className="space-y-6 max-w-full overflow-hidden">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {meters.map((m, idx) => (
            <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-3 min-w-0">
              <div className="flex items-center justify-between">
                <m.icon className="w-5 h-5 text-indigo-600 shrink-0" />
                <span className="text-xs font-mono font-bold text-slate-700">{m.percent}%</span>
              </div>
              <div className="space-y-0.5 min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{m.title}</h3>
                <p className="text-xs font-mono text-slate-500 truncate">{m.used} / {m.cap}</p>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${m.percent}%` }} />
              </div>
            </div>
          ))}
        </section>
      </div>
    </AdminLayout>
  );
}
