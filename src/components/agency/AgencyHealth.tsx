'use client';

import React from 'react';
import { AgencyClient } from '@/data/agencyData';
import { Button } from '@/components/ui/Button';
import {
  HeartPulse,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Bot,
  MessageSquare,
  FileText,
  HardDrive,
  Activity,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface AgencyHealthProps {
  clients: AgencyClient[];
  onManageClient?: (client: AgencyClient) => void;
}

export const AgencyHealth: React.FC<AgencyHealthProps> = ({
  clients,
  onManageClient,
}) => {
  const healthyClients = clients.filter((c) => c.health === 'Healthy');
  const attentionClients = clients.filter((c) => c.health === 'Needs Attention');
  const atRiskClients = clients.filter((c) => c.health === 'At Risk');

  const meters = [
    { title: 'AI Voice Receptionist', used: '14,280', cap: '30,000', icon: Bot, percent: 47 },
    { title: 'Customer SMS & WhatsApp', used: '42,190', cap: '75,000', icon: MessageSquare, percent: 56 },
    { title: 'Invoices Generated', used: '1,840', cap: '5,000', icon: FileText, percent: 36 },
    { title: 'Media & Storage Assets', used: '12.4 GB', cap: '50 GB', icon: HardDrive, percent: 24 },
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-1">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
            Client Health & Usage Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 line-clamp-2">
            Real-time telemetry on client quota utilization, service health, and recommended plan upgrades.
          </p>
        </div>
      </div>

      {/* 3 Health Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 uppercase">
            <CheckCircle2 className="w-4 h-4" /> Healthy Portfolio
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{healthyClients.length}</span>
          <p className="text-[11px] text-slate-400">High engagement and active payments</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5 uppercase">
            <Clock className="w-4 h-4" /> Needs Attention
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">{attentionClients.length}</span>
          <p className="text-[11px] text-slate-400">Nearing quota or pending setup</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold text-red-700 flex items-center gap-1.5 uppercase">
            <AlertTriangle className="w-4 h-4" /> At Risk
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-red-600 font-mono">{atRiskClients.length}</span>
          <p className="text-[11px] text-slate-400">Inactivity or DNS mismatch</p>
        </div>
      </div>

      {/* Quota Telemetry Meters */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 min-w-0">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">Aggregated Quota Usage</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {meters.map((m, idx) => (
            <div key={idx} className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 min-w-0">
              <div className="flex items-center justify-between">
                <m.icon className="w-4 h-4 text-violet-600" />
                <span className="text-xs font-mono font-bold text-slate-700">{m.percent}%</span>
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">{m.title}</h4>
                <p className="text-[11px] font-mono text-slate-500 truncate">{m.used} / {m.cap}</p>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-violet-600 rounded-full" style={{ width: `${m.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended Interventions */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 min-w-0">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">Recommended Agency Interventions</h3>
        <div className="space-y-3">
          <div className="p-3.5 sm:p-4 bg-amber-50/60 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5 min-w-0">
              <span className="font-bold text-amber-900 block truncate">Apex Comfort HVAC &bull; High AI Usage</span>
              <p className="text-amber-700">Client has consumed 88% of Starter plan allowance. Recommend upgrading to Professional.</p>
            </div>
            <button
              onClick={() => onManageClient && onManageClient(clients[0])}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 shadow-2xs whitespace-nowrap self-start sm:self-auto min-h-[36px]"
            >
              Review Plan
            </button>
          </div>

          <div className="p-3.5 sm:p-4 bg-red-50/60 border border-red-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5 min-w-0">
              <span className="font-bold text-red-900 block truncate">ClearFlow Drain & Septic &bull; DNS Verification Incomplete</span>
              <p className="text-red-700">Custom domain CNAME record has not resolved after 48 hours. Client portal remains unverified.</p>
            </div>
            <button
              onClick={() => onManageClient && onManageClient(clients[1] || clients[0])}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 shadow-2xs whitespace-nowrap self-start sm:self-auto min-h-[36px]"
            >
              Inspect DNS
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
