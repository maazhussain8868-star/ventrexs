'use client';

import React, { useState } from 'react';
import { AgencyClient } from '@/data/agencyData';
import { Button } from '@/components/ui/Button';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Smartphone,
  Globe,
  DollarSign,
} from 'lucide-react';

interface AgencySubscriptionsProps {
  clients: AgencyClient[];
  onManageClient?: (client: AgencyClient) => void;
}

export const AgencySubscriptions: React.FC<AgencySubscriptionsProps> = ({
  clients,
  onManageClient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');

  const getBillingSource = (client: AgencyClient): string => {
    if (client.name.includes('Metro')) return 'GOOGLE_PLAY';
    if (client.name.includes('Precision') || client.name.includes('Highland')) return 'STRIPE';
    if (client.name.includes('Trade') || client.name.includes('ClearFlow')) return 'SKYDDO';
    return 'RAZORPAY';
  };

  const filteredClients = clients.filter((c) => {
    const source = getBillingSource(c);
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.plan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === 'ALL' || c.plan === planFilter;
    const matchesSource = sourceFilter === 'ALL' || source === sourceFilter;
    return matchesSearch && matchesPlan && matchesSource;
  });

  const totalMrr = clients.reduce((acc, c) => (c.status !== 'Suspended' ? acc + c.mrr : acc), 0);
  const activeSubs = clients.filter((c) => c.status === 'Active').length;
  const trialSubs = clients.filter((c) => c.status === 'Trial').length;

  const getBillingBadge = (source: string) => {
    switch (source) {
      case 'GOOGLE_PLAY':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <Smartphone className="w-3 h-3" /> GOOGLE PLAY
          </span>
        );
      case 'STRIPE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
            <CreditCard className="w-3 h-3" /> STRIPE
          </span>
        );
      case 'RAZORPAY':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            <Globe className="w-3 h-3" /> RAZORPAY
          </span>
        );
      default:
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            ALTERNATIVE
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            ACTIVE
          </span>
        );
      case 'Trial':
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            TRIAL
          </span>
        );
      default:
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Client SaaS Subscriptions</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit recurring SaaS subscription plans, billing gateways, renewal schedules, and client MRR breakdown.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Subscriptions</span>
          <span className="text-3xl font-extrabold text-slate-900 font-mono">{activeSubs}</span>
          <p className="text-[11px] text-emerald-600 font-semibold">100% active retention</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Monthly MRR</span>
          <span className="text-3xl font-extrabold text-slate-900 font-mono">${totalMrr.toLocaleString()}</span>
          <p className="text-[11px] text-emerald-600 font-semibold">+18.4% growth</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trials in Progress</span>
          <span className="text-3xl font-extrabold text-blue-600 font-mono">{trialSubs}</span>
          <p className="text-[11px] text-slate-400">14-day trial evaluation</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Google Play MRR</span>
          <span className="text-3xl font-extrabold text-emerald-600 font-mono">$580</span>
          <p className="text-[11px] text-slate-400">Android app subscribers</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client or plan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
            />
          </div>

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

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-violet-500 font-medium"
          >
            <option value="ALL">All Billing Sources</option>
            <option value="GOOGLE_PLAY">Google Play</option>
            <option value="STRIPE">Stripe</option>
            <option value="RAZORPAY">Razorpay</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-mono font-semibold">
          {filteredClients.length} Subscriptions Listed
        </span>
      </div>

      {/* Subscriptions Table */}
      <section className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Client Tenant</th>
                <th className="py-3 px-4">Plan Tier</th>
                <th className="py-3 px-4">Billing Source</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">MRR</th>
                <th className="py-3 px-4">Next Renewal</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredClients.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                  <td className="py-3.5 px-4 font-bold text-violet-700">{c.plan}</td>
                  <td className="py-3.5 px-4">{getBillingBadge(getBillingSource(c))}</td>
                  <td className="py-3.5 px-4">{getStatusBadge(c.status)}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">${c.mrr}/mo</td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono">2026-09-01</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onManageClient && onManageClient(c)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                    >
                      Manage Plan
                    </button>
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
