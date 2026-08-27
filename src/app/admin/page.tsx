'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useApp } from '@/context/AppContext';
import { 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Sparkles, 
  Activity, 
  ChevronRight, 
  Sliders, 
  UserCheck, 
  AlertCircle,
  Database,
  Building2
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { adminStats, showToast } = useApp();

  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState(false);
  const [isAiConfigOpen, setIsAiConfigOpen] = useState(false);

  const [modelTemperature, setModelTemperature] = useState(0.7);
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);

  const mockUsers = [
    { name: 'Jane Doe', email: 'jane@mainstreetbakery.com', business: 'Main Street Bakery & Cafe', plan: 'Professional', status: 'Active', mrr: '$49' },
    { name: 'Robert Vance', email: 'robert@apexsolutions.io', business: 'Apex Solutions', plan: 'Enterprise', status: 'Active', mrr: '$199' },
    { name: 'Carlos Mendoza', email: 'carlos@mendozaplumbers.com', business: 'Mendoza Plumbing', plan: 'Starter', status: 'Active', mrr: '$19' },
    { name: 'Sarah Connor', email: 'sarah@globaltech.io', business: 'Global Tech LLC', plan: 'Professional', status: 'Active', mrr: '$49' },
  ];

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              Platform Administration & Telemetry
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-tertiary-container/15 text-tertiary">
              <ShieldCheck className="w-3.5 h-3.5" />
              Multi-Tenant Cloud
            </span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Live multi-tenant SaaS commercial performance and ethical AI orchestration health.
          </p>
        </div>

        {/* Bento Grid for Stats */}
        <div className="grid grid-cols-2 gap-4">
          {/* MRR Card (Full Width) */}
          <div className="col-span-2 bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Monthly Recurring Revenue (MRR)
              </p>
              <span className="material-symbols-outlined text-tertiary bg-tertiary-container/15 p-1.5 rounded-full text-sm">
                trending_up
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-on-surface tracking-tight font-mono">
              ${adminStats.mrr.toLocaleString()}
            </div>
            <div className="mt-2 text-tertiary font-bold text-xs sm:text-sm flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>+{adminStats.mrrGrowth}% commercial growth this month</span>
            </div>
          </div>

          {/* Active Users Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[130px]">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <Building2 className="w-4 h-4 text-primary" />
              <p className="text-xs font-bold uppercase tracking-wider">Active Small Business Tenants</p>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-on-surface font-mono">
              {adminStats.activeUsers.toLocaleString()}
            </div>
            <p className="text-[11px] text-tertiary font-semibold">+{adminStats.userGrowth}% net tenant expansion</p>
          </div>

          {/* AI Usage Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[130px]">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-[20px] fill-icon">smart_toy</span>
              <p className="text-xs font-bold uppercase tracking-wider">Ethical AI Drafts Today</p>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-on-surface font-mono">
              {adminStats.aiDraftsToday.toLocaleString()}
            </div>
            <p className="text-[11px] text-primary font-semibold">99.4% user approval rate</p>
          </div>
        </div>

        {/* System Health Banner */}
        <div className="bg-tertiary-fixed/15 border border-tertiary-fixed-dim/40 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-tertiary-container"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold text-on-tertiary-fixed-variant">
                Platform Infrastructure Status: All Systems Operational
              </span>
              <span className="text-xs text-on-surface-variant">
                AI Reasoning latency: 22ms • Global Uptime: {adminStats.serverUptime}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsHealthModalOpen(true)}
            className="text-xs font-bold text-tertiary-container bg-surface border border-outline-variant px-3.5 py-1.5 rounded-xl hover:bg-surface-container-low transition-colors shadow-xs"
          >
            Details
          </button>
        </div>

        {/* Quick Administration Cards */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">
            Platform Management & Settings
          </h2>

          <div
            onClick={() => setIsUserMgmtOpen(true)}
            className="w-full bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:bg-surface-container-low transition-colors shadow-xs cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="bg-secondary-container text-on-secondary-container p-2.5 rounded-xl">
                <span className="material-symbols-outlined text-[22px]">manage_accounts</span>
              </div>
              <div className="text-left">
                <span className="block text-sm font-bold text-on-surface">Tenant Account & Subscription Directory</span>
                <span className="block text-xs text-on-surface-variant">Review registered businesses, subscription tiers, and active usage</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-outline-variant" />
          </div>

          <div
            onClick={() => setIsAiConfigOpen(true)}
            className="w-full bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:bg-surface-container-low transition-colors shadow-xs cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="bg-primary-fixed text-on-primary-fixed p-2.5 rounded-xl">
                <span className="material-symbols-outlined text-[22px]">settings_suggest</span>
              </div>
              <div className="text-left">
                <span className="block text-sm font-bold text-on-surface">AI Copilot Hyperparameter Configuration</span>
                <span className="block text-xs text-on-surface-variant">Configure temperature sampling and ethical confidence threshold gates</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-outline-variant" />
          </div>

          {/* Demo Access & Dual-Approval Center */}
          <a
            href="/admin/demo-access"
            className="w-full bg-surface-container-lowest border border-primary/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:bg-primary/5 transition-colors shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block text-sm font-bold text-on-surface flex items-center gap-2">
                  Demo Access & Two-Person Approval Gate
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">New</span>
                </span>
                <span className="block text-xs text-on-surface-variant">Generate 24h cryptographic demo links and review 2-person owner approval requests</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-primary" />
          </a>
        </div>
      </div>

      {/* System Health Modal */}
      <Modal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        title="Real-Time System Diagnostics"
        footer={
          <Button variant="primary" size="md" onClick={() => setIsHealthModalOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-3 text-xs sm:text-sm">
          <div className="p-3 bg-surface rounded-xl border border-outline-variant flex justify-between items-center">
            <span className="font-semibold text-on-surface">AI Inference API (Google DeepMind Gemini)</span>
            <span className="text-xs font-bold text-tertiary flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-tertiary" /> 99.99% Operational
            </span>
          </div>
          <div className="p-3 bg-surface rounded-xl border border-outline-variant flex justify-between items-center">
            <span className="font-semibold text-on-surface">Payment Webhooks (Stripe / Plaid ACH)</span>
            <span className="text-xs font-bold text-tertiary flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-tertiary" /> Active (0 backlog)
            </span>
          </div>
          <div className="p-3 bg-surface rounded-xl border border-outline-variant flex justify-between items-center">
            <span className="font-semibold text-on-surface">Database Primary Cluster (US-East)</span>
            <span className="text-xs font-bold text-tertiary flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-tertiary" /> 18ms latency
            </span>
          </div>
        </div>
      </Modal>

      {/* Tenant User Management Modal */}
      <Modal
        isOpen={isUserMgmtOpen}
        onClose={() => setIsUserMgmtOpen(false)}
        maxWidth="xl"
        title="Tenant Accounts & Subscriptions"
        footer={
          <Button variant="primary" size="md" onClick={() => setIsUserMgmtOpen(false)}>
            Done
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant font-bold text-on-surface-variant uppercase">
                <th className="py-2.5 px-3">Business</th>
                <th className="py-2.5 px-3">Owner Email</th>
                <th className="py-2.5 px-3">Plan</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">MRR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {mockUsers.map((u, i) => (
                <tr key={i} className="hover:bg-surface-container-low">
                  <td className="py-3 px-3 font-bold text-on-surface">{u.business}</td>
                  <td className="py-3 px-3 text-on-surface-variant">{u.email}</td>
                  <td className="py-3 px-3 font-semibold text-primary">{u.plan}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-tertiary-container/15 text-tertiary font-bold text-[10px]">
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-on-surface font-mono">{u.mrr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* AI Configuration Modal */}
      <Modal
        isOpen={isAiConfigOpen}
        onClose={() => setIsAiConfigOpen(false)}
        title="AI Copilot Model Parameters"
        footer={
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setIsAiConfigOpen(false);
              showToast({ title: 'AI Hyperparameters Updated', type: 'success' });
            }}
          >
            Save Parameters
          </Button>
        }
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-on-surface">Sampling Temperature</label>
              <span className="font-bold text-primary font-mono">{modelTemperature}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={modelTemperature}
              onChange={(e) => setModelTemperature(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <p className="text-[11px] text-on-surface-variant mt-1">Lower = more deterministic & formal; Higher = more creative.</p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-on-surface">Ethical Auto-Recommendation Threshold</label>
              <span className="font-bold text-primary font-mono">{confidenceThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="99"
              step="1"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <p className="text-[11px] text-on-surface-variant mt-1">Only recommend follow-ups when confidence is above this threshold.</p>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
