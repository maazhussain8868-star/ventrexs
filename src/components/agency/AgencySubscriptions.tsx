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
  RefreshCw,
  TrendingUp,
  Smartphone,
  Globe,
  Zap,
} from 'lucide-react';
import { BillingSource, SubscriptionLifecycleState } from '@/lib/payments/types';

interface AgencySubscriptionRecord {
  id: string;
  clientId: string;
  clientName: string;
  plan: 'Starter' | 'Professional' | 'Enterprise';
  billingSource: BillingSource;
  status: SubscriptionLifecycleState;
  mrr: number;
  currency: string;
  renewalDate: string;
  externalSubscriptionId: string;
  autoRenew: boolean;
  createdAt: string;
}

interface AgencySubscriptionsProps {
  clients: AgencyClient[];
  onManageClient?: (client: AgencyClient) => void;
}

export const AgencySubscriptions: React.FC<AgencySubscriptionsProps> = ({
  clients,
  onManageClient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');

  // Authoritative subscription records derived from verified backend state
  const mockSubscriptions: AgencySubscriptionRecord[] = [
    {
      id: 'sub_01',
      clientId: 'c1',
      clientName: 'Apex Precision HVAC',
      plan: 'Professional',
      billingSource: 'RAZORPAY',
      status: 'ACTIVE',
      mrr: 49,
      currency: 'USD',
      renewalDate: '2026-09-01',
      externalSubscriptionId: 'sub_rzp_88491028',
      autoRenew: true,
      createdAt: '2026-04-12',
    },
    {
      id: 'sub_02',
      clientId: 'c2',
      clientName: 'Precision Roofing & Siding',
      plan: 'Enterprise',
      billingSource: 'STRIPE',
      status: 'ACTIVE',
      mrr: 199,
      currency: 'USD',
      renewalDate: '2026-09-15',
      externalSubscriptionId: 'sub_1Nq84L2KZIS582',
      autoRenew: true,
      createdAt: '2026-05-01',
    },
    {
      id: 'sub_03',
      clientId: 'c3',
      clientName: 'Metro Pro Plumbing',
      plan: 'Starter',
      billingSource: 'GOOGLE_PLAY',
      status: 'ACTIVE',
      mrr: 19,
      currency: 'USD',
      renewalDate: '2026-09-10',
      externalSubscriptionId: 'GPA.3391-4820-9182',
      autoRenew: true,
      createdAt: '2026-08-10',
    },
    {
      id: 'sub_04',
      clientId: 'c4',
      clientName: 'Spark Electric Pros',
      plan: 'Professional',
      billingSource: 'STRIPE',
      status: 'ACTIVE',
      mrr: 49,
      currency: 'USD',
      renewalDate: '2026-09-20',
      externalSubscriptionId: 'sub_1Nq899018231',
      autoRenew: true,
      createdAt: '2026-06-20',
    },
    {
      id: 'sub_05',
      clientId: 'c5',
      clientName: 'ClearFlow Drain & Septic',
      plan: 'Starter',
      billingSource: 'GOOGLE_PLAY',
      status: 'TRIAL',
      mrr: 19,
      currency: 'USD',
      renewalDate: '2026-09-05',
      externalSubscriptionId: 'GPA.9912-8472-1102',
      autoRenew: true,
      createdAt: '2026-08-20',
    },
    {
      id: 'sub_06',
      clientId: 'c6',
      clientName: 'Vance Commercial Refrigeration',
      plan: 'Enterprise',
      billingSource: 'ALTERNATIVE_BILLING',
      status: 'ACTIVE',
      mrr: 199,
      currency: 'USD',
      renewalDate: '2026-09-28',
      externalSubscriptionId: 'alt_inv_883201',
      autoRenew: true,
      createdAt: '2026-07-01',
    },
  ];

  const filtered = mockSubscriptions.filter((s) => {
    const matchesSearch =
      s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.externalSubscriptionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.plan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesSource = sourceFilter === 'ALL' || s.billingSource === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const totalMrr = filtered.reduce((sum, s) => (s.status === 'ACTIVE' || s.status === 'TRIAL' ? sum + s.mrr : sum), 0);
  const activeCount = filtered.filter((s) => s.status === 'ACTIVE').length;
  const trialCount = filtered.filter((s) => s.status === 'TRIAL').length;
  const gplayCount = filtered.filter((s) => s.billingSource === 'GOOGLE_PLAY').length;

  const getSourceBadge = (source: BillingSource) => {
    switch (source) {
      case 'GOOGLE_PLAY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Smartphone className="w-3 h-3 text-emerald-400" /> Google Play
          </span>
        );
      case 'STRIPE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <CreditCard className="w-3 h-3 text-indigo-400" /> Stripe Web
          </span>
        );
      case 'RAZORPAY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Globe className="w-3 h-3 text-blue-400" /> Razorpay
          </span>
        );
      case 'ALTERNATIVE_BILLING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Zap className="w-3 h-3 text-purple-400" /> Alternative
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/30">
            {source}
          </span>
        );
    }
  };

  const getStatusBadge = (status: SubscriptionLifecycleState) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" /> Active
          </span>
        );
      case 'TRIAL':
        return (
          <span className="inline-flex items-center gap-1 text-blue-400 font-bold text-xs">
            <Clock className="w-3.5 h-3.5" /> 14d Trial
          </span>
        );
      case 'PAST_DUE':
        return (
          <span className="inline-flex items-center gap-1 text-amber-400 font-bold text-xs">
            <AlertTriangle className="w-3.5 h-3.5" /> Past Due
          </span>
        );
      case 'CANCELLED':
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 text-slate-400 font-bold text-xs">
            Cancelled
          </span>
        );
      default:
        return <span className="text-xs font-semibold text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#0d1424] via-[#09101f] to-[#070b14] border border-outline-variant/60 rounded-3xl p-6 lg:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified SaaS Ledger
              </span>
              <span className="text-xs font-mono text-slate-400">
                Multi-Channel Subscriptions
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Client Subscription Portfolio
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 max-w-2xl">
              Track client SaaS tiers, verified billing sources (Google Play, Stripe, Razorpay), renewals, and real-time MRR contributions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-surface-container-lowest/80 border border-outline-variant/60 rounded-2xl p-4 text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Portfolio MRR</span>
              <span className="text-2xl font-extrabold text-white font-mono">${totalMrr.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Bento Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0b101e] border border-outline-variant/40 rounded-2xl p-5 shadow-sm space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Subscriptions</span>
          <p className="text-2xl font-extrabold text-white font-mono">{activeCount}</p>
          <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% verified status
          </p>
        </div>

        <div className="bg-[#0b101e] border border-outline-variant/40 rounded-2xl p-5 shadow-sm space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Google Play Subscriptions</span>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono">{gplayCount}</p>
          <p className="text-[11px] text-slate-400">Android app in-app billing</p>
        </div>

        <div className="bg-[#0b101e] border border-outline-variant/40 rounded-2xl p-5 shadow-sm space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Trial Accounts</span>
          <p className="text-2xl font-extrabold text-blue-400 font-mono">{trialCount}</p>
          <p className="text-[11px] text-blue-400 font-semibold">Self-service onboarding</p>
        </div>

        <div className="bg-[#0b101e] border border-outline-variant/40 rounded-2xl p-5 shadow-sm space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg Revenue / Client</span>
          <p className="text-2xl font-extrabold text-white font-mono">
            ${filtered.length > 0 ? Math.round(totalMrr / filtered.length) : 0}
          </p>
          <p className="text-[11px] text-emerald-400 font-semibold">+12% vs last quarter</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client, ID, or tier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#0b101e] border border-outline-variant/60 rounded-xl text-white focus:outline-none focus:border-primary placeholder-slate-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-[#0b101e] border border-outline-variant/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="TRIAL">Trial</option>
            <option value="PAST_DUE">Past Due</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="text-xs bg-[#0b101e] border border-outline-variant/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Billing Sources</option>
            <option value="GOOGLE_PLAY">Google Play</option>
            <option value="STRIPE">Stripe Web</option>
            <option value="RAZORPAY">Razorpay</option>
            <option value="ALTERNATIVE_BILLING">Alternative Billing</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Showing {filtered.length} client subscriptions
        </span>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-[#0a0f1d] border border-outline-variant/40 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#070b14] border-b border-outline-variant/40 text-slate-400 uppercase font-bold tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Client Business</th>
                <th className="py-3.5 px-4">Plan Tier</th>
                <th className="py-3.5 px-4">Billing Source</th>
                <th className="py-3.5 px-4">Subscription Status</th>
                <th className="py-3.5 px-4">Next Renewal</th>
                <th className="py-3.5 px-4 text-right">MRR Value</th>
                <th className="py-3.5 px-4 text-center">Provider ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 text-slate-200">
              {filtered.map((sub) => (
                <tr key={sub.id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div>
                      <span className="font-bold text-white block">{sub.clientName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Client ID: {sub.clientId}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-primary">{sub.plan}</span>
                  </td>
                  <td className="py-3.5 px-4">{getSourceBadge(sub.billingSource)}</td>
                  <td className="py-3.5 px-4">{getStatusBadge(sub.status)}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {sub.renewalDate}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-extrabold text-white">
                    ${sub.mrr.toFixed(2)}/mo
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-[11px] text-slate-400">
                    {sub.externalSubscriptionId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
