'use client';

import React, { useState } from 'react';
import { AgencyClient } from '@/data/agencyData';
import { Button } from '@/components/ui/Button';
import {
  Building2,
  Search,
  Plus,
  ArrowRight,
  Globe,
  Sliders,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  LayoutGrid,
  List,
  Filter,
  MoreVertical,
  Bot,
  FileText,
  Wrench,
  ChevronRight,
  Trash2,
  RefreshCw,
} from 'lucide-react';

interface AgencyClientsProps {
  clients: AgencyClient[];
  onOpenAddClient: () => void;
  onManageClient: (client: AgencyClient) => void;
  onSwitchContext: (client: AgencyClient) => void;
}

export const AgencyClients: React.FC<AgencyClientsProps> = ({
  clients,
  onOpenAddClient,
  onManageClient,
  onSwitchContext,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Trial' | 'Provisioning' | 'Suspended'>('ALL');
  const [healthFilter, setHealthFilter] = useState<'ALL' | 'Healthy' | 'Needs Attention' | 'At Risk'>('ALL');
  const [planFilter, setPlanFilter] = useState<'ALL' | 'Starter' | 'Professional' | 'Enterprise'>('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const filtered = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase()) ||
      c.ownerEmail.toLowerCase().includes(search.toLowerCase()) ||
      c.domain.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesHealth = healthFilter === 'ALL' || c.health === healthFilter;
    const matchesPlan = planFilter === 'ALL' || c.plan === planFilter;

    return matchesSearch && matchesStatus && matchesHealth && matchesPlan;
  });

  const totalMrr = filtered.reduce((acc, c) => (c.status !== 'Suspended' ? acc + c.mrr : acc), 0);

  return (
    <div className="space-y-6">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Client Portfolio & Tenant Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/30 font-mono">
              {filtered.length} Tenants
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Supervise all active managed trade businesses, subscription health, custom domain bindings, and telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenAddClient}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs font-bold bg-primary text-white shadow-sm"
          >
            + Provision Client
          </Button>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search business name, trade, email, or domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#070b14] border border-outline-variant/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-primary placeholder-slate-500 font-medium"
          />
        </div>

        {/* Dropdown Filters & View Mode */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#070b14] border border-outline-variant/60 rounded-xl px-3 py-2 text-slate-300 text-xs focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Trial">In Trial</option>
            <option value="Provisioning">Provisioning</option>
            <option value="Suspended">Suspended</option>
          </select>

          {/* Health Filter */}
          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value as any)}
            className="bg-[#070b14] border border-outline-variant/60 rounded-xl px-3 py-2 text-slate-300 text-xs focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Health States</option>
            <option value="Healthy">Healthy (Green)</option>
            <option value="Needs Attention">Needs Attention (Amber)</option>
            <option value="At Risk">At Risk (Red)</option>
          </select>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as any)}
            className="bg-[#070b14] border border-outline-variant/60 rounded-xl px-3 py-2 text-slate-300 text-xs focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Plans</option>
            <option value="Starter">Starter ($79/mo)</option>
            <option value="Professional">Professional ($149/mo)</option>
            <option value="Enterprise">Enterprise ($299/mo)</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl bg-[#070b14] border border-outline-variant/60 p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filtered MRR Summary Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-2 font-mono">
        <span>Showing {filtered.length} of {clients.length} total client businesses</span>
        <span>
          Combined MRR: <strong className="text-emerald-400 font-black">${totalMrr.toLocaleString()}/mo</strong>
        </span>
      </div>

      {/* Main List / Grid Presentation */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {filtered.map((client) => (
            <div
              key={client.id}
              className="p-5 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 hover:border-primary/50 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs"
            >
              {/* Tenant Brand & Identity */}
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm text-white shrink-0 shadow-md"
                  style={{ backgroundColor: client.accentColor }}
                >
                  {client.initials}
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-white truncate">{client.name}</h3>
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

                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono flex-wrap">
                    <span className="text-slate-300">{client.ownerEmail}</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1 text-sky-400">
                      <Globe className="w-3 h-3" />
                      {client.domain}
                    </span>
                    <span>&bull;</span>
                    <span>{client.environment}</span>
                  </div>

                  <p className="text-[11px] text-slate-400 pt-0.5">{client.lastActivity}</p>
                </div>
              </div>

              {/* Middle: Onboarding & Health Telemetry */}
              <div className="flex items-center gap-6 lg:gap-8 text-xs font-mono">
                {/* MRR */}
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">MRR</span>
                  <span className="text-sm font-black text-white">${client.mrr}/mo</span>
                </div>

                {/* Onboarding Stage */}
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Onboarding</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-300">{client.onboardingStage}</span>
                    <span className="text-[10px] text-slate-500">({client.onboardingProgress}%)</span>
                  </div>
                </div>

                {/* Health Indicator */}
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Health Score</span>
                  <div className="flex items-center gap-1.5">
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
                      {client.healthScore}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
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
                  className="text-xs font-bold bg-primary text-white hover:bg-primary/90"
                >
                  Open Workspace
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Grid Card Presentation */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <div
              key={client.id}
              className="p-5 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 hover:border-primary/50 transition-all space-y-4 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-sm shrink-0"
                      style={{ backgroundColor: client.accentColor }}
                    >
                      {client.initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{client.name}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">{client.industry}</p>
                    </div>
                  </div>

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

                {/* Plan & MRR */}
                <div className="p-3 bg-[#070b14] rounded-xl border border-outline-variant/40 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block">PLAN TIER</span>
                    <span className="font-bold text-primary">{client.plan}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">MRR</span>
                    <span className="font-black text-emerald-400">${client.mrr}/mo</span>
                  </div>
                </div>

                {/* Telemetry Metrics */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px]">Domain:</span>
                    <span className="font-mono font-semibold text-slate-300 text-[11px] truncate max-w-[160px]">
                      {client.domain}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px]">Onboarding:</span>
                    <span className="font-mono text-slate-300 text-[11px]">
                      {client.onboardingStage} ({client.onboardingProgress}%)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px]">Health:</span>
                    <span
                      className={`font-mono font-bold text-[11px] ${
                        client.health === 'Healthy'
                          ? 'text-emerald-400'
                          : client.health === 'Needs Attention'
                          ? 'text-amber-400'
                          : 'text-red-400'
                      }`}
                    >
                      {client.health} ({client.healthScore}/100)
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onManageClient(client)}
                  className="w-1/2 text-xs text-slate-300 hover:text-white border-outline-variant/60"
                >
                  Manage
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onSwitchContext(client)}
                  className="w-1/2 text-xs font-bold bg-primary text-white hover:bg-primary/90"
                >
                  Open
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
