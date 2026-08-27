'use client';

import React, { useState } from 'react';
import { AgencyDeployment } from '@/data/agencyData';
import { Button } from '@/components/ui/Button';
import {
  Server,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Globe,
  Zap,
  Activity,
  ArrowUpRight,
} from 'lucide-react';

interface AgencyDeploymentsProps {
  deployments: AgencyDeployment[];
  onTriggerRedeploy?: (deploymentId: string) => void;
}

export const AgencyDeployments: React.FC<AgencyDeploymentsProps> = ({
  deployments,
  onTriggerRedeploy,
}) => {
  const [redeployingId, setRedeployingId] = useState<string | null>(null);

  const liveCount = deployments.filter((d) => d.status === 'Live').length;
  const deployingCount = deployments.filter((d) => d.status === 'Deploying').length;
  const failedCount = deployments.filter((d) => d.status === 'Failed').length;

  const handleRedeploy = (id: string) => {
    setRedeployingId(id);
    if (onTriggerRedeploy) onTriggerRedeploy(id);
    setTimeout(() => setRedeployingId(null), 1000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Live':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> LIVE
          </span>
        );
      case 'Deploying':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            <RefreshCw className="w-3 h-3 animate-spin" /> DEPLOYING
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
            <AlertTriangle className="w-3 h-3" /> FAILED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            <Clock className="w-3 h-3" /> ATTENTION
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Deployments & Infrastructure</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor client edge infrastructure, build versions, container uptime, and global CDN propagation.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleRedeploy('all')}
          className="text-xs bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
        >
          Check All Clusters
        </Button>
      </div>

      {/* 4 Top KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Deployments</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{liveCount}</span>
            <span className="text-xs text-emerald-600 font-semibold">100% active</span>
          </div>
          <p className="text-[11px] text-slate-400">Zero service downtime</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">In Progress</span>
          <span className="text-3xl font-extrabold text-slate-900 font-mono">{deployingCount}</span>
          <p className="text-[11px] text-slate-400">Queued build jobs</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Latency</span>
          <span className="text-3xl font-extrabold text-indigo-600 font-mono">22ms</span>
          <p className="text-[11px] text-emerald-600 font-semibold">Global CDN edge routing</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attention Required</span>
          <span className="text-3xl font-extrabold text-emerald-600 font-mono">{failedCount}</span>
          <p className="text-[11px] text-slate-400">All edge clusters healthy</p>
        </div>
      </section>

      {/* Managed Deployments Table */}
      <section className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Managed Deployments ({deployments.length})
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Edge Multi-Region</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Client Tenant</th>
                <th className="py-3 px-4">Environment</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Build Version</th>
                <th className="py-3 px-4">Uptime</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {deployments.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{d.clientName}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">Production</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{d.edgeRegion || 'US-East-1'}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{d.version}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">{d.uptimePercent}%</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">{d.latencyMs}ms</td>
                  <td className="py-3.5 px-4">{getStatusBadge(d.status)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRedeploy(d.id)}
                      disabled={redeployingId === d.id}
                      leftIcon={<RefreshCw className={`w-3 h-3 ${redeployingId === d.id ? 'animate-spin' : ''}`} />}
                      className="text-xs bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
                    >
                      {redeployingId === d.id ? 'Deploying...' : 'Redeploy'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
