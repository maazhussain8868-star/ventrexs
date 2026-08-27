'use client';

import React from 'react';
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
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === 'Active').length;
  const trialClients = clients.filter((c) => c.status === 'Trial').length;
  const pendingOnboarding = clients.filter((c) => c.onboardingStage !== 'Live').length;
  const liveDeployments = deployments.filter((d) => d.status === 'Live').length;
  const totalMrr = clients.reduce((acc, c) => (c.status !== 'Suspended' ? acc + c.mrr : acc), 0);
  const arr = totalMrr * 12;
  const mrrGrowth = 18.4;

  const topClients = clients.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e1628] via-[#0a0f1d] to-[#070b14] border border-outline-variant/50 p-6 sm:p-8 lg:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold font-mono">
              <Building2 className="w-3.5 h-3.5" />
              <span>APEX GROWTH MARKETING &bull; RESELLER PARTNER</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Agency Command Center
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Manage your clients, deployments, subscriptions, branding and revenue from one place.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="md"
              onClick={() => onSelectTab('clients')}
              className="text-xs font-bold border-outline-variant/80 text-white hover:bg-surface-container-low"
            >
              View Clients
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={onOpenAddClient}
              leftIcon={<Plus className="w-4 h-4" />}
              className="text-xs font-bold shadow-lg shadow-primary/25 bg-primary text-white hover:bg-primary/90"
            >
              + Add Client
            </Button>
          </div>
        </div>
      </section>

      {/* 2. High-Level Agency Intelligence: 7 Key Reseller Metrics */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
              Agency Telemetry & Performance
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Auto-synced across 14 tenant containers
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* 1. Total Clients */}
          <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 space-y-1 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Clients</span>
              <Users2 className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{totalClients}</div>
            <div className="text-[10px] text-slate-400 font-mono">Max limit: 25 seats</div>
          </div>

          {/* 2. Active Clients */}
          <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 space-y-1 hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Active Clients</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">{activeClients}</div>
            <div className="text-[10px] text-emerald-400/80 font-bold">100% good standing</div>
          </div>

          {/* 3. Monthly Recurring Revenue */}
          <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 space-y-1 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Monthly MRR</span>
              <CreditCard className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="text-2xl font-black text-white font-mono">${totalMrr.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400 font-mono">ARR: ${arr.toLocaleString()}</div>
          </div>

          {/* 4. Trial Clients */}
          <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 space-y-1 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Trial Clients</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">{trialClients}</div>
            <div className="text-[10px] text-amber-400/80 font-medium">14-day trials active</div>
          </div>

          {/* 5. Pending Onboarding */}
          <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 space-y-1 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Pending Setup</span>
              <GitBranch className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-2xl font-black text-sky-400 font-mono">{pendingOnboarding}</div>
            <div className="text-[10px] text-slate-400 font-mono">Setup & DNS pipeline</div>
          </div>

          {/* 6. Deployments */}
          <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 space-y-1 hover:border-indigo-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Deployments</span>
              <Server className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{liveDeployments}</div>
            <div className="text-[10px] text-indigo-400/80 font-bold">99.98% uptime</div>
          </div>

          {/* 7. MRR Growth */}
          <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 space-y-1 hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">MRR Growth</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">+{mrrGrowth}%</div>
            <div className="text-[10px] text-emerald-400/80 font-bold">+3 upgrades MoM</div>
          </div>
        </div>
      </section>

      {/* 3. Client Portfolio Highlights & Quick Actions Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Client Portfolio Snapshot
            </h3>
            <p className="text-xs text-slate-400">
              Top performing trade businesses under agency management.
            </p>
          </div>

          <button
            onClick={() => onSelectTab('clients')}
            className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All {totalClients} Clients</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Client Rows */}
        <div className="space-y-3">
          {topClients.map((client) => (
            <div
              key={client.id}
              className="p-4 sm:p-5 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 hover:border-primary/50 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs group"
            >
              {/* Left: Tenant identity */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: client.accentColor }}
                >
                  {client.initials}
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-white truncate group-hover:text-primary transition-colors">
                      {client.name}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-container text-slate-300">
                      {client.industry}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {client.plan}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        client.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : client.status === 'Trial'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {client.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Globe className="w-3 h-3 text-sky-400" />
                      {client.domain}
                    </span>
                    <span>&bull;</span>
                    <span>{client.lastActivity}</span>
                  </div>
                </div>
              </div>

              {/* Middle: Onboarding & Health */}
              <div className="flex items-center gap-6 lg:gap-8 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">MRR</span>
                  <span className="font-black text-white">${client.mrr}/mo</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Pipeline Stage</span>
                  <span className="font-bold text-slate-300">{client.onboardingStage}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Client Health</span>
                  <span
                    className={`font-bold flex items-center gap-1 ${
                      client.health === 'Healthy'
                        ? 'text-emerald-400'
                        : client.health === 'Needs Attention'
                        ? 'text-amber-400'
                        : 'text-red-400'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        client.health === 'Healthy'
                          ? 'bg-emerald-400'
                          : client.health === 'Needs Attention'
                          ? 'bg-amber-400'
                          : 'bg-red-400'
                      }`}
                    />
                    {client.health}
                  </span>
                </div>
              </div>

              {/* Right: Quick Actions */}
              <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-outline-variant/40">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onManageClient(client)}
                  className="text-xs text-slate-300 hover:text-white border-outline-variant/60"
                >
                  Manage
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onSwitchContext(client)}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  className="text-xs font-bold bg-primary/90 text-white hover:bg-primary"
                >
                  Open Workspace
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Reseller Modules Hub (Onboarding Pipeline, White-Label, Domains, Deployments) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Module A: Onboarding Pipeline */}
        <div
          onClick={() => onSelectTab('onboarding')}
          className="p-5 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 hover:border-primary/50 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <GitBranch className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">
              Onboarding Pipeline
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              6 stages tracking client setup from invitation to live production.
            </p>
          </div>
          <div className="text-[11px] font-mono text-sky-400 font-bold">
            {pendingOnboarding} clients currently in onboarding
          </div>
        </div>

        {/* Module B: White-Label Studio */}
        <div
          onClick={() => onSelectTab('whitelabel')}
          className="p-5 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 hover:border-primary/50 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">
              White-Label Branding
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Custom logos, theme tokens, login portal copy, and email branding.
            </p>
          </div>
          <div className="text-[11px] font-mono text-purple-400 font-bold">
            Live Preview & Theme Customizer
          </div>
        </div>

        {/* Module C: Custom Domains */}
        <div
          onClick={() => onSelectTab('domains')}
          className="p-5 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 hover:border-primary/50 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">
              Custom Domain Center
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Automated TLS 1.3 certificates and DNS TXT verification records.
            </p>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 font-bold">
            {domains.filter((d) => d.status === 'Connected').length} Domains Connected
          </div>
        </div>

        {/* Module D: Deployments & Cloud Pods */}
        <div
          onClick={() => onSelectTab('deployments')}
          className="p-5 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 hover:border-primary/50 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">
              Deployment Telemetry
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Multi-tenant pods, edge caching, latency gauges, and rollback tools.
            </p>
          </div>
          <div className="text-[11px] font-mono text-indigo-400 font-bold">
            {liveDeployments} Pods Operating Nominally
          </div>
        </div>
      </section>

      {/* 5. Live Agency Event Feed Snapshot */}
      <section className="p-6 rounded-3xl bg-[#0a0f1d] border border-outline-variant/50 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Live Agency Activity Stream
            </h3>
            <p className="text-xs text-slate-400">
              Audit log of client onboarding, domain changes, subscriptions, and deployment updates.
            </p>
          </div>
          <button
            onClick={() => onSelectTab('activity')}
            className="text-xs font-bold text-primary hover:underline"
          >
            View Full Audit Log &rarr;
          </button>
        </div>

        <div className="divide-y divide-outline-variant/40">
          {activities.slice(0, 4).map((act) => (
            <div key={act.id} className="py-3 flex items-start justify-between gap-4 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      act.severity === 'success'
                        ? 'bg-emerald-400'
                        : act.severity === 'warning'
                        ? 'bg-amber-400'
                        : act.severity === 'error'
                        ? 'bg-red-400'
                        : 'bg-primary'
                    }`}
                  />
                  <span className="font-bold text-white">{act.title}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-container text-slate-400">
                    {act.category}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] pl-4">{act.description}</p>
              </div>

              <span className="text-[10px] text-slate-500 font-mono shrink-0">{act.timeAgo}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
