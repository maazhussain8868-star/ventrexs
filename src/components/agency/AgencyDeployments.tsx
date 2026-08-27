'use client';

import React, { useState } from 'react';
import { AgencyDeployment } from '@/data/agencyData';
import { Button } from '@/components/ui/Button';
import {
  Server,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Zap,
  Activity,
  ArrowRight,
  ExternalLink,
  Cpu,
  HardDrive,
  Globe,
} from 'lucide-react';

interface AgencyDeploymentsProps {
  deployments: AgencyDeployment[];
  onTriggerRedeploy: (depId: string) => void;
}

export const AgencyDeployments: React.FC<AgencyDeploymentsProps> = ({
  deployments,
  onTriggerRedeploy,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [redeployingId, setRedeployingId] = useState<string | null>(null);

  const filtered = deployments.filter((d) => {
    if (statusFilter === 'ALL') return true;
    return d.status === statusFilter;
  });

  const handleRedeploy = (id: string) => {
    setRedeployingId(id);
    setTimeout(() => {
      onTriggerRedeploy(id);
      setRedeployingId(null);
    }, 1000);
  };

  const liveCount = deployments.filter((d) => d.status === 'Live').length;
  const deployingCount = deployments.filter((d) => d.status === 'Deploying').length;
  const failedCount = deployments.filter((d) => d.status === 'Failed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Agency Cloud Deployment Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-mono">
              Cluster US-East-1
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time infrastructure orchestration, multi-tenant pod telemetry, and edge CDN routing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRedeploy('all')}
            isLoading={redeployingId === 'all'}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-xs border-outline-variant/60 text-slate-300 hover:text-white"
          >
            Redeploy Edge Cluster
          </Button>
        </div>
      </div>

      {/* Cluster Health Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Live Deployments</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{liveCount}</div>
          <p className="text-[11px] text-slate-400 font-mono">100% operational uptime</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">In Progress</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400 font-mono">{deployingCount}</div>
          <p className="text-[11px] text-slate-400 font-mono">Building edge assets</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg Edge Latency</span>
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-white font-mono">22ms</div>
          <p className="text-[11px] text-emerald-400 font-bold font-mono">Global CDN Anycast</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Failed / Attention</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400 font-mono">{failedCount}</div>
          <p className="text-[11px] text-slate-400 font-mono">1 rollback required</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="p-2 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 flex flex-wrap items-center gap-1.5 text-xs">
        {['ALL', 'Live', 'Deploying', 'Configuration Required', 'Domain Pending', 'Failed'].map((st) => {
          const isSelected = statusFilter === st;
          return (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                isSelected
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-surface-container-low'
              }`}
            >
              {st === 'ALL' ? 'All Deployments' : st}
            </button>
          );
        })}
      </div>

      {/* Deployments Table */}
      <div className="rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 overflow-hidden shadow-xs">
        <div className="p-4 bg-[#070b14] border-b border-outline-variant/50 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Managed Deployment Instances ({filtered.length})
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Runtime Engine: Node.js 20 LTS &bull; Edge V8</span>
        </div>

        <div className="divide-y divide-outline-variant/40">
          {filtered.map((dep) => (
            <div
              key={dep.id}
              className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-surface-container-low/30 transition-colors"
            >
              {/* Left Details */}
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <Server className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-sm text-white">{dep.clientName}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container text-slate-300">
                    {dep.environment}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {dep.version}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                  <span>Region: {dep.edgeRegion}</span>
                  <span>&bull;</span>
                  <span>Latency: {dep.latencyMs}ms</span>
                  <span>&bull;</span>
                  <span>Last deploy: {dep.lastDeployment}</span>
                  <span>&bull;</span>
                  <span className="text-slate-500">Commit: {dep.buildCommit}</span>
                </div>
              </div>

              {/* Middle: Status Pill */}
              <div className="flex items-center gap-4">
                <div className="text-right font-mono">
                  <span className="text-[10px] text-slate-500 block">UPTIME</span>
                  <span className="text-xs font-bold text-emerald-400">{dep.uptimePercent}%</span>
                </div>

                <div>
                  {dep.status === 'Live' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> LIVE
                    </span>
                  )}
                  {dep.status === 'Deploying' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> DEPLOYING
                    </span>
                  )}
                  {dep.status === 'Configuration Required' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <AlertTriangle className="w-3.5 h-3.5" /> CONFIG REQUIRED
                    </span>
                  )}
                  {dep.status === 'Domain Pending' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Globe className="w-3.5 h-3.5" /> DOMAIN PENDING
                    </span>
                  )}
                  {dep.status === 'Failed' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                      <XCircle className="w-3.5 h-3.5" /> FAILED
                    </span>
                  )}
                </div>

                {/* Actions */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRedeploy(dep.id)}
                  isLoading={redeployingId === dep.id}
                  leftIcon={<RefreshCw className="w-3 h-3" />}
                  className="text-xs text-slate-300 hover:text-white border-outline-variant/60"
                >
                  Redeploy
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
