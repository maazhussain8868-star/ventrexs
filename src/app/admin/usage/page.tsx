'use client';

import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Layers, Bot, MessageSquare, PhoneCall, CheckCircle2, Cpu, HardDrive } from 'lucide-react';

export default function AdminUsagePage() {
  const meters = [
    { title: 'AI Receptionist Inquiries', used: '42,850', cap: '100,000', icon: Bot, percent: 43 },
    { title: 'SMS & WhatsApp Dispatches', used: '128,490', cap: '250,000', icon: MessageSquare, percent: 51 },
    { title: 'Active Work Orders (Jobs)', used: '18,420', cap: '50,000', icon: Layers, percent: 37 },
    { title: 'Cloud Object Storage', used: '48.2 GB', cap: '200 GB', icon: HardDrive, percent: 24 },
    { title: 'Inference Token Budget', used: '18.4M', cap: '50M', icon: Cpu, percent: 36 },
  ];

  return (
    <AdminLayout
      title="Platform Usage & Metering Telemetry"
      subtitle="Global resource consumption metrics across Gemini AI engines, carrier SMS/WhatsApp gateways, and database compute."
      showBack
      backUrl="/admin"
    >
      <div className="space-y-6">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {meters.map((m, idx) => (
            <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <m.icon className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-mono font-bold text-slate-700">{m.percent}%</span>
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-900">{m.title}</h3>
                <p className="text-xs font-mono text-slate-500">{m.used} / {m.cap}</p>
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
