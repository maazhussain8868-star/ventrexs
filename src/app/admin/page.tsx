'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
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
  Building2,
  CheckCircle2,
  ArrowUpRight,
  CreditCard,
  Layers,
  Bot,
  Bell,
  Clock,
  Globe,
  Radio,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { adminStats, showToast } = useApp();

  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isAiConfigOpen, setIsAiConfigOpen] = useState(false);
  const [modelTemperature, setModelTemperature] = useState(0.7);
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);

  const revenueTimeline = [
    { month: 'Mar', mrr: 32000, arr: 384000 },
    { month: 'Apr', mrr: 35400, arr: 424800 },
    { month: 'May', mrr: 38900, arr: 466800 },
    { month: 'Jun', mrr: 41200, arr: 494400 },
    { month: 'Jul', mrr: 43800, arr: 525600 },
    { month: 'Aug', mrr: 45200, arr: 542400 },
  ];

  const subsystemHealth = [
    { name: 'API Cluster', status: 'Operational', latency: '22ms', uptime: '99.99%' },
    { name: 'Primary Database', status: 'Operational', latency: '14ms', uptime: '100%' },
    { name: 'Payment Gateways', status: 'Operational', latency: '35ms', uptime: '99.98%' },
    { name: 'Gemini AI Services', status: 'Operational', latency: '48ms', uptime: '99.95%' },
    { name: 'Notification Engine', status: 'Operational', latency: '19ms', uptime: '100%' },
  ];

  const recentActivity = [
    { time: '12:42 PM', event: 'New subscription activated', entity: 'Apex Comfort HVAC', category: 'Billing', status: 'SUCCESS' },
    { time: '11:15 AM', event: 'Custom domain SSL provisioned', entity: 'portal.apexagency.com', category: 'Agency', status: 'SUCCESS' },
    { time: '10:30 AM', event: 'Google Play subscription renewal', entity: 'Metro Pro Plumbing', category: 'Google Play', status: 'SUCCESS' },
    { time: '09:05 AM', event: '2-person demo approval granted', entity: 'Prospect: Highland HVAC', category: 'Security', status: 'SUCCESS' },
    { time: '08:20 AM', event: 'Contractor invoice payment settled', entity: 'Precision Roofing & Siding', category: 'Invoicing', status: 'SUCCESS' },
  ];

  return (
    <AdminLayout
      title="Platform Overview"
      subtitle="Monitor Ventrexs platform performance, revenue, infrastructure and security."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsHealthModalOpen(true)}
            className="text-xs bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          >
            Diagnostics
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAiConfigOpen(true)}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
          >
            AI Parameters
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 1. TOP 4 EQUAL KPI CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: MRR */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Monthly Recurring Revenue
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                $45,200
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+12.4% vs last month</span>
              </div>
            </div>
          </div>

          {/* KPI 2: Active Businesses */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Active Businesses
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                1,240
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+18.2% expansion</span>
              </div>
            </div>
          </div>

          {/* KPI 3: Active Subscriptions */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Active Subscriptions
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                1,184
              </div>
              <div className="mt-1 text-xs text-slate-500 font-medium">
                95.5% active retention rate
              </div>
            </div>
          </div>

          {/* KPI 4: Platform Health */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Platform Health SLA
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-emerald-600 tracking-tight font-mono">
                99.99%
              </div>
              <div className="mt-1 text-xs text-slate-500 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>All subsystems operational</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. REVENUE PERFORMANCE (LEFT) & PLATFORM HEALTH (RIGHT) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Performance (2 Cols) */}
          <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Revenue Performance & Timeline</h2>
                <p className="text-xs text-slate-500">6-month MRR and ARR growth trajectory</p>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                ARR: $542,400
              </span>
            </div>

            {/* Timeline Visual Chart */}
            <div className="grid grid-cols-6 gap-3 items-end h-48 pt-4">
              {revenueTimeline.map((item, idx) => {
                const heightPercent = Math.round((item.mrr / 50000) * 100);
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[11px] font-mono font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      ${(item.mrr / 1000).toFixed(1)}k
                    </span>
                    <div className="w-full bg-slate-100 rounded-xl h-full flex items-end p-1">
                      <div
                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-500 rounded-lg transition-all group-hover:from-indigo-700 group-hover:to-indigo-600 shadow-2xs"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-600">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subsystem Health (1 Col) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Subsystem Telemetry</h2>
                <p className="text-xs text-slate-500">Real-time latency & uptime</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="divide-y divide-slate-100 space-y-0.5">
              {subsystemHealth.map((sys, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 block">{sys.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">Uptime: {sys.uptime}</span>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> {sys.status}
                    </span>
                    <span className="block font-mono text-[11px] text-slate-500 font-semibold">{sys.latency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. BUSINESS & AGENCY OVERVIEW CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/businesses"
            className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-indigo-300 transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Customer Businesses Directory
                </h3>
                <p className="text-xs text-slate-500">1,240 registered small business tenants</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            href="/admin/agencies"
            className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-indigo-300 transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Agency & Reseller Accounts
                </h3>
                <p className="text-xs text-slate-500">28 active agency partner organizations</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </section>

        {/* 4. RECENT PLATFORM ACTIVITY */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Platform Activity</h2>
              <p className="text-xs text-slate-500">Immutable ledger events captured across all tenants</p>
            </div>
            <Link
              href="/admin/audit"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View Full Audit Trail</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentActivity.map((act, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-500">{act.time}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{act.event}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{act.entity}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {act.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> {act.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Diagnostics Modal */}
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
        <div className="space-y-3 text-xs sm:text-sm text-slate-800">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
            <span className="font-semibold text-slate-900">AI Inference API (Google Gemini)</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> 99.99% Operational
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
            <span className="font-semibold text-slate-900">Payment Webhooks (Stripe / Razorpay)</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active (0 backlog)
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
            <span className="font-semibold text-slate-900">Database Primary Cluster (US-East)</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> 14ms latency
            </span>
          </div>
        </div>
      </Modal>

      {/* AI Hyperparameters Modal */}
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
        <div className="space-y-4 text-xs sm:text-sm text-slate-800">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-900">Sampling Temperature</label>
              <span className="font-bold text-indigo-600 font-mono">{modelTemperature}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={modelTemperature}
              onChange={(e) => setModelTemperature(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">Lower = more deterministic & formal; Higher = more creative.</p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-900">Ethical Recommendation Threshold</label>
              <span className="font-bold text-indigo-600 font-mono">{confidenceThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="99"
              step="1"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">Only recommend automated actions when confidence is above threshold.</p>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
