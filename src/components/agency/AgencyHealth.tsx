'use client';

import React, { useState } from 'react';
import { AgencyClient } from '@/data/agencyData';
import { Button } from '@/components/ui/Button';
import {
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingDown,
  ArrowRight,
  Bot,
  Globe,
  FileText,
  Clock,
  Sparkles,
  Mail,
  PhoneCall,
  ShieldAlert,
} from 'lucide-react';

interface AgencyHealthProps {
  clients: AgencyClient[];
  onManageClient: (client: AgencyClient) => void;
  onSwitchContext: (client: AgencyClient) => void;
}

export const AgencyHealth: React.FC<AgencyHealthProps> = ({
  clients,
  onManageClient,
  onSwitchContext,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'Healthy' | 'Needs Attention' | 'At Risk'>('ALL');

  const healthyClients = clients.filter((c) => c.health === 'Healthy');
  const attentionClients = clients.filter((c) => c.health === 'Needs Attention');
  const atRiskClients = clients.filter((c) => c.health === 'At Risk');

  const filtered = clients.filter((c) => {
    if (selectedCategory === 'ALL') return true;
    return c.health === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Agency Client Health & Usage Telemetry
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
              Proactive Retention Radar
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monitor client activity, AI receptionist usage volume, domain health, invoice workflows, and churn risk indicators.
          </p>
        </div>
      </div>

      {/* Health Category KPI Cluster */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Healthy */}
        <div
          onClick={() => setSelectedCategory('Healthy')}
          className={`p-5 rounded-2xl bg-[#0a0f1d] border transition-all cursor-pointer space-y-2 ${
            selectedCategory === 'Healthy'
              ? 'border-emerald-500 bg-emerald-500/5 shadow-md shadow-emerald-500/10'
              : 'border-outline-variant/50 hover:border-emerald-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Healthy Tenants</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            {healthyClients.length}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            High AI engagement, active invoices, DNS connected
          </p>
        </div>

        {/* Needs Attention */}
        <div
          onClick={() => setSelectedCategory('Needs Attention')}
          className={`p-5 rounded-2xl bg-[#0a0f1d] border transition-all cursor-pointer space-y-2 ${
            selectedCategory === 'Needs Attention'
              ? 'border-amber-500 bg-amber-500/5 shadow-md shadow-amber-500/10'
              : 'border-outline-variant/50 hover:border-amber-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Needs Attention</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono">
            {attentionClients.length}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Pending DNS, incomplete setup, or trial expiring
          </p>
        </div>

        {/* At Risk */}
        <div
          onClick={() => setSelectedCategory('At Risk')}
          className={`p-5 rounded-2xl bg-[#0a0f1d] border transition-all cursor-pointer space-y-2 ${
            selectedCategory === 'At Risk'
              ? 'border-red-500 bg-red-500/5 shadow-md shadow-red-500/10'
              : 'border-outline-variant/50 hover:border-red-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">At Risk / Suspended</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-black text-red-400 font-mono">
            {atRiskClients.length}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Payment past due, zero activity, or steep drop in usage
          </p>
        </div>
      </div>

      {/* Suggested Agency Owner Interventions for At-Risk / Warning Clients */}
      {atRiskClients.length > 0 && (
        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-3">
          <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>High-Priority Retention Interventions Required</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {atRiskClients.map((c) => (
              <div
                key={c.id}
                className="p-3.5 bg-[#0a0f1d] rounded-xl border border-red-500/20 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{c.name}</span>
                  <span className="text-[10px] font-bold text-red-400 font-mono">Health: {c.healthScore}/100</span>
                </div>
                <p className="text-[11px] text-slate-300">{c.lastActivity}</p>
                <div className="pt-2 border-t border-outline-variant/40 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">Owner: {c.ownerEmail}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onManageClient(c)}
                    className="text-xs text-red-300 border-red-500/40 hover:bg-red-500/10 h-7 px-2"
                  >
                    Take Action
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Grid / Table */}
      <div className="rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 overflow-hidden shadow-xs">
        <div className="p-4 bg-[#070b14] border-b border-outline-variant/50 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Tenant Telemetry & Health Audit ({filtered.length})
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Telemetry updated every 5m</span>
        </div>

        <div className="divide-y divide-outline-variant/40">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-surface-container-low/30 transition-colors"
            >
              {/* Client Info */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: c.accentColor }}
                >
                  {c.initials}
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{c.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container text-slate-300">
                      {c.plan}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Domain: <span className="text-slate-300">{c.domain}</span> ({c.domainStatus})
                  </p>
                  <p className="text-[11px] text-slate-300 pt-0.5">{c.lastActivity}</p>
                </div>
              </div>

              {/* Usage Metrics */}
              <div className="grid grid-cols-3 gap-6 font-mono text-xs text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">AI Calls</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5 text-purple-400" />
                    {c.aiUsageCalls}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Invoices</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    {c.monthlyInvoices}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Health</span>
                  <span
                    className={`font-bold flex items-center gap-1 ${
                      c.health === 'Healthy'
                        ? 'text-emerald-400'
                        : c.health === 'Needs Attention'
                        ? 'text-amber-400'
                        : 'text-red-400'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        c.health === 'Healthy'
                          ? 'bg-emerald-400'
                          : c.health === 'Needs Attention'
                          ? 'bg-amber-400'
                          : 'bg-red-400'
                      }`}
                    />
                    {c.healthScore}/100
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onManageClient(c)}
                  className="text-xs text-slate-300 hover:text-white border-outline-variant/60"
                >
                  Manage
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onSwitchContext(c)}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  className="text-xs font-bold bg-primary text-white"
                >
                  Open
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
