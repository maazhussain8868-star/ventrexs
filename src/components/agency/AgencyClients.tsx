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
}

export const AgencyClients: React.FC<AgencyClientsProps> = ({
  clients,
  onOpenAddClient,
  onManageClient,
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
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-1">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
            Clients Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 line-clamp-2">
            Manage all contractor and small business workspaces connected to your agency portfolio.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenAddClient}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          className="text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-xs shrink-0 min-h-[36px]"
        >
          + Add Client
        </Button>
      </div>

      {/* Filter & Controls Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, domain, industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 min-h-[36px]"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-none focus:border-violet-500 font-medium min-h-[36px]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Trial">Trial</option>
              <option value="Suspended">Suspended</option>
            </select>

            <select
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-none focus:border-violet-500 font-medium min-h-[36px]"
            >
              <option value="ALL">All Health</option>
              <option value="Healthy">Healthy</option>
              <option value="Needs Attention">Needs Attention</option>
              <option value="At Risk">At Risk</option>
            </select>

            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-none focus:border-violet-500 font-medium min-h-[36px]"
            >
              <option value="ALL">All Plans</option>
              <option value="Starter">Starter</option>
              <option value="Professional">Professional</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center justify-between lg:justify-end gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <span className="text-xs text-slate-500 font-mono font-semibold">
            {filteredClients.length} clients
          </span>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all min-h-[32px] min-w-[32px] flex items-center justify-center ${
                viewMode === 'list'
                  ? 'bg-white text-violet-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List View"
              aria-label="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all min-h-[32px] min-w-[32px] flex items-center justify-center ${
                viewMode === 'grid'
                  ? 'bg-white text-violet-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
              aria-label="Grid View"
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
            <table className="w-full text-left text-xs border-collapse min-w-[680px]">
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
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-2xs shrink-0"
                        style={{ backgroundColor: c.accentColor || '#6366f1' }}
                      >
                        {c.initials}
                      </div>
                      <div className="min-w-0">
                        <span className="block leading-tight truncate">{c.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono truncate block">{c.domain}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{c.industry}</td>
                    <td className="py-3 px-4 font-bold text-violet-700 whitespace-nowrap">{c.plan}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{getHealthBadge(c.health)}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{getSubscriptionBadge(c.status)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">${c.mrr}/mo</td>
                    <td className="py-3 px-4 text-slate-500 font-mono whitespace-nowrap">{c.lastActivityTime}</td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => onManageClient(c)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors min-h-[32px]"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredClients.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-violet-300 transition-all space-y-4 flex flex-col justify-between min-w-0"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm text-white shadow-2xs shrink-0"
                      style={{ backgroundColor: c.accentColor || '#6366f1' }}
                    >
                      {c.initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight truncate">{c.name}</h3>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate">{c.domain}</p>
                    </div>
                  </div>
                  <div className="shrink-0">{getSubscriptionBadge(c.status)}</div>
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
                    <span className="font-mono text-slate-500 truncate block">{c.lastActivityTime}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onManageClient(c)}
                  className="w-full text-xs bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 min-h-[36px]"
                >
                  Manage Client
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
