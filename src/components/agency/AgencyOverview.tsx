'use client';

import React, { useState } from 'react';
import {
  AgencyClient,
  AgencyDeployment,
  AgencyDomainItem,
  AgencyActivityEvent,
} from '@/data/agencyData';
import { AgencyNavTab } from './AgencySidebar';
import { Button } from '@/components/ui/Button';
import {
  Building2,
  Users2,
  TrendingUp,
  CreditCard,
  Layers,
  GitBranch,
  Server,
  Globe,
  Palette,
  ShieldCheck,
  ArrowRight,
  Plus,
  HeartPulse,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  ArrowUpRight,
  Activity,
} from 'lucide-react';

interface AgencyOverviewProps {
  clients: AgencyClient[];
  deployments: AgencyDeployment[];
  domains: AgencyDomainItem[];
  activities: AgencyActivityEvent[];
  onSelectTab: (tab: AgencyNavTab) => void;
  onOpenAddClient: () => void;
  onManageClient: (client: AgencyClient) => void;
  onSwitchContext: (client: AgencyClient) => void;
}

export const AgencyOverview: React.FC<AgencyOverviewProps> = ({
  clients,
  deployments,
  domains,
  activities,
  onSelectTab,
  onOpenAddClient,
  onManageClient,
  onSwitchContext,
}) => {
  const [timeFilter, setTimeFilter] = useState<'7D' | '30D' | '6M' | '1Y'>('6M');

  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === 'Active').length;
  const trialClients = clients.filter((c) => c.status === 'Trial').length;
  const pendingOnboarding = clients.filter((c) => c.onboardingStage !== 'Live').length;
  const liveDeployments = deployments.filter((d) => d.status === 'Live').length;
  const totalMrr = clients.reduce((acc, c) => (c.status !== 'Suspended' ? acc + c.mrr : acc), 0);

  const healthyCount = clients.filter((c) => c.health === 'Healthy').length;
  const attentionCount = clients.filter((c) => c.health === 'Needs Attention').length;
  const atRiskCount = clients.filter((c) => c.health === 'At Risk').length;

  const mrrChartData = [
    { label: 'Mar', value: 1420 },
    { label: 'Apr', value: 1680 },
    { label: 'May', value: 1890 },
    { label: 'Jun', value: 2050 },
    { label: 'Jul', value: 2190 },
    { label: 'Aug', value: 2327 },
  ];

  const onboardingStages = [
    { name: 'NEW', count: clients.filter((c) => c.onboardingStage === 'New Client').length, stage: 'New Client' },
    { name: 'SETUP', count: clients.filter((c) => c.onboardingStage === 'Setup').length, stage: 'Setup' },
    { name: 'BRANDING', count: clients.filter((c) => c.onboardingStage === 'Branding').length, stage: 'Branding' },
    { name: 'DOMAIN', count: clients.filter((c) => c.onboardingStage === 'Domain').length, stage: 'Domain' },
    { name: 'CONFIG', count: clients.filter((c) => c.onboardingStage === 'Configuration').length, stage: 'Configuration' },
    { name: 'LIVE', count: clients.filter((c) => c.onboardingStage === 'Live').length, stage: 'Live' },
  ];

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'Healthy':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Healthy
          </span>
        );
      case 'Needs Attention':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <Clock className="w-3 h-3" /> Attention
          </span>
        );
      case 'At Risk':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
            <AlertTriangle className="w-3 h-3" /> At Risk
          </span>
        );
      default:
        return <span className="text-xs text-slate-600">{health}</span>;
    }
  };

  const getSubscriptionBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            ACTIVE
          </span>
        );
      case 'Trial':
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            TRIAL
          </span>
        );
      default:
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            {status.toUpperCase()}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Agency Dashboard
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 mt-0.5">
            Manage your client portfolio, deployments, subscriptions and reseller operations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectTab('revenue')}
            className="text-xs bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          >
            Revenue Report
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenAddClient}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-xs"
          >
            + Add Client
          </Button>
        </div>
      </div>

      {/* 2. Top 4 Clean KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Clients
            </span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <Users2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {totalClients}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+2 this month</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Clients
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {activeClients}
            </div>
            <div className="mt-1 text-xs text-slate-500 font-medium">
              85.7% of portfolio active
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Monthly Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              ${totalMrr.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% MRR growth</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Onboarding
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <GitBranch className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-amber-600 tracking-tight font-mono">
              {pendingOnboarding}
            </div>
            <div className="mt-1 text-xs text-amber-700 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Requires attention</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Analytics (2 Columns: Revenue Performance Left, Client Health Right) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Revenue Performance */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Revenue Performance</h2>
              <p className="text-xs text-slate-500">Reseller subscription MRR growth trajectory</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['7D', '30D', '6M', '1Y'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    timeFilter === filter
                      ? 'bg-white text-violet-700 shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart Area */}
          <div className="grid grid-cols-6 gap-3 items-end h-48 pt-4">
            {mrrChartData.map((item, idx) => {
              const heightPercent = Math.round((item.value / 2500) * 100);
              return (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] font-mono font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    ${item.value}
                  </span>
                  <div className="w-full bg-slate-100 rounded-xl h-full flex items-end p-1">
                    <div
                      className="w-full bg-gradient-to-t from-violet-600 to-indigo-600 rounded-lg transition-all group-hover:from-violet-700 group-hover:to-indigo-700 shadow-2xs"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Client Portfolio Health */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-1 pb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Client Portfolio Health</h2>
            <p className="text-xs text-slate-500">Service reliability and adoption status</p>
          </div>

          <div className="space-y-3 my-auto">
            {/* Healthy */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Healthy
                </span>
                <span className="font-mono font-bold text-slate-900">{healthyCount} clients</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.round((healthyCount / totalClients) * 100)}%` }}
                />
              </div>
            </div>

            {/* Needs Attention */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Needs Attention
                </span>
                <span className="font-mono font-bold text-slate-900">{attentionCount} clients</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${Math.round((attentionCount / totalClients) * 100)}%` }}
                />
              </div>
            </div>

            {/* At Risk */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5 text-red-700">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> At Risk
                </span>
                <span className="font-mono font-bold text-slate-900">{atRiskCount} client</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${Math.round((atRiskCount / totalClients) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectTab('health')}
            className="w-full py-2 text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-xl border border-violet-200 transition-colors flex items-center justify-center gap-1"
          >
            <span>View Detailed Health Telemetry</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 4. Client Portfolio Table */}
      <section className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden space-y-3 p-6">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Client Portfolio</h2>
            <p className="text-xs text-slate-500">Active small business accounts under your agency</p>
          </div>
          <button
            onClick={() => onSelectTab('clients')}
            className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1"
          >
            <span>View All Clients</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Client Business</th>
                <th className="py-3 px-4">Industry</th>
                <th className="py-3 px-4">Plan Tier</th>
                <th className="py-3 px-4">Health</th>
                <th className="py-3 px-4">Subscription</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {clients.slice(0, 6).map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                      style={{ backgroundColor: c.accentColor || '#6366f1' }}
                    >
                      {c.initials}
                    </div>
                    <div>
                      <span className="block leading-tight">{c.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{c.domain}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{c.industry}</td>
                  <td className="py-3.5 px-4 font-bold text-violet-700">{c.plan}</td>
                  <td className="py-3.5 px-4">{getHealthBadge(c.health)}</td>
                  <td className="py-3.5 px-4">{getSubscriptionBadge(c.status)}</td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono">{c.lastActivityTime}</td>
                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    <button
                      onClick={() => onManageClient(c)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                    >
                      Manage
                    </button>
                    <button
                      onClick={() => onSwitchContext(c)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 transition-colors"
                      title="Open client workspace in Customer View"
                    >
                      Enter &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Onboarding Pipeline & Deployment Overview (2 Cols) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Onboarding Stages */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Client Onboarding Stages</h2>
              <p className="text-xs text-slate-500">Pipeline progression across your portfolio</p>
            </div>
            <button
              onClick={() => onSelectTab('onboarding')}
              className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1"
            >
              <span>View Onboarding</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {onboardingStages.map((st, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">{st.name}</span>
                <p className="text-xl font-extrabold text-slate-900 font-mono">{st.count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Deployment Health Overview */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Deployment Overview</h2>
              <p className="text-xs text-slate-500">Edge CDN nodes and instance uptime</p>
            </div>
            <button
              onClick={() => onSelectTab('deployments')}
              className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1"
            >
              <span>Manage Clusters</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-0.5">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">LIVE</span>
              <p className="text-xl font-black text-emerald-700 font-mono">{liveDeployments}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase">DEPLOYING</span>
              <p className="text-xl font-black text-slate-800 font-mono">0</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase">ATTENTION</span>
              <p className="text-xl font-black text-slate-800 font-mono">0</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase">AVG LATENCY</span>
              <p className="text-xl font-black text-indigo-600 font-mono">22ms</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
