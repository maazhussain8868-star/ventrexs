'use client';

import React, { useState } from 'react';
import { AgencyClient } from '@/data/agencyData';
import { Button } from '@/components/ui/Button';
import {
  Building2,
  Search,
  Filter,
  Grid,
  List as ListIcon,
  Plus,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Globe,
  Sliders,
  Sparkles,
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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [healthFilter, setHealthFilter] = useState('ALL');
  const [planFilter, setPlanFilter] = useState('ALL');

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesHealth = healthFilter === 'ALL' || c.health === healthFilter;
    const matchesPlan = planFilter === 'ALL' || c.plan === planFilter;
    return matchesSearch && matchesStatus && matchesHealth && matchesPlan;
  });

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'Healthy':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Healthy
          </span>
        );
      case 'Attention':
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clients Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage all contractor and small business workspaces connected to your agency portfolio.
          </p>
        </div>

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

      {/* Filter & Controls Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, domain, industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
            />
          </div>

          {/* Filters */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-violet-500 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Trial">Trial</option>
            <option value="Suspended">Suspended</option>
          </select>

          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-violet-500 font-medium"
          >
            <option value="ALL">All Health</option>
            <option value="Healthy">Healthy</option>
            <option value="Attention">Needs Attention</option>
            <option value="At Risk">At Risk</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-violet-500 font-medium"
          >
            <option value="ALL">All Plans</option>
            <option value="Starter">Starter</option>
            <option value="Professional">Professional</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono font-semibold">
            {filteredClients.length} clients
          </span>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-violet-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-violet-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content View */}
      {viewMode === 'list' ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Client Business</th>
                  <th className="py-3 px-4">Industry</th>
                  <th className="py-3 px-4">Plan Tier</th>
                  <th className="py-3 px-4">Health</th>
                  <th className="py-3 px-4">Subscription</th>
                  <th className="py-3 px-4">MRR</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredClients.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-2xs"
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
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">${c.mrr}/mo</td>
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
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-violet-300 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-2xs"
                      style={{ backgroundColor: c.accentColor || '#6366f1' }}
                    >
                      {c.initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">{c.name}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">{c.domain}</p>
                    </div>
                  </div>
                  {getSubscriptionBadge(c.status)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Plan</span>
                    <span className="font-bold text-violet-700">{c.plan}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">MRR</span>
                    <span className="font-mono font-bold text-slate-900">${c.mrr}/mo</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Health</span>
                    <div>{getHealthBadge(c.health)}</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Activity</span>
                    <span className="font-mono text-slate-500">{c.lastActivityTime}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onManageClient(c)}
                  className="flex-1 text-xs bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200"
                >
                  Manage
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onSwitchContext(c)}
                  className="flex-1 text-xs bg-violet-600 hover:bg-violet-700 text-white font-bold"
                >
                  Enter &rarr;
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
