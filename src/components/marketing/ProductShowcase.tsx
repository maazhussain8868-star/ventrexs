'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  FileText,
  Sparkles,
  Mail,
  MessageSquare,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Users,
  Search,
  Filter,
  CreditCard,
  Send,
  ShieldAlert,
  ChevronRight,
  Layers,
} from 'lucide-react';

export default function ProductShowcase() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'customers' | 'collections' | 'copilot'>('dashboard');

  return (
    <div className="w-full">
      {/* Showcase Tabs */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8 hide-scrollbar">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3, badge: 'Live HUD' },
          { id: 'invoices', label: 'Invoices', icon: FileText, badge: 'Zero-Interest' },
          { id: 'customers', label: 'Customers', icon: Users, badge: 'RLS CRM' },
          { id: 'collections', label: 'Collections', icon: ShieldAlert, badge: 'Ethical AR' },
          { id: 'copilot', label: 'AI Copilot', icon: Sparkles, badge: 'Advisory Mode' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.25)]'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono hidden sm:inline ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-200 border border-blue-400/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Glassmorphic Interactive Dashboard Container */}
      <div className="relative rounded-2xl sm:rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950/95 backdrop-blur-2xl shadow-2xl p-4 sm:p-8 overflow-hidden">
        {/* Top Browser / Window Frame */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-400">
              <span className="text-slate-600">https://</span>
              <span className="text-slate-300">app.ventrexs.com/{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              RLS Isolation: Active
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] font-mono text-blue-400 font-medium">
              <ShieldCheck className="w-3 h-3" />
              Assertions: 242/242
            </span>
          </div>
        </div>

        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">Total Receivables</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    +14.2%
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">$48,500.00</p>
                <p className="text-[11px] text-slate-500 mt-1">12 active invoices</p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">Collected (30d)</span>
                  <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                    Stripe Webhook
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 tracking-tight">$31,200.00</p>
                <p className="text-[11px] text-slate-500 mt-1">100% idempotent ledger</p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">Overdue (Aging)</span>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                    3 Invoices
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold font-mono text-amber-400 tracking-tight">$11,800.00</p>
                <p className="text-[11px] text-slate-500 mt-1">Halal cadence active</p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">Avg Settlement Speed</span>
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                    -9.4 Days
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold font-mono text-cyan-400 tracking-tight">16.2 Days</p>
                <p className="text-[11px] text-slate-500 mt-1">Accelerated with AI</p>
              </div>
            </div>

            {/* Simulated Live Transactions & Active Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              <div className="lg:col-span-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span>Recent Receivables Ledger</span>
                  </h4>
                  <span className="text-xs font-mono text-slate-500">Live DB Stream</span>
                </div>

                <div className="divide-y divide-slate-800/60">
                  {[
                    { id: 'INV-2026-001', client: 'Apex Media Corp', amount: '$4,800.00', status: 'Pending Review', tagColor: 'text-amber-400 bg-amber-500/10' },
                    { id: 'INV-2026-002', client: 'Vertex Software LLC', amount: '$12,400.00', status: 'Paid via Stripe', tagColor: 'text-emerald-400 bg-emerald-500/10' },
                    { id: 'INV-2026-003', client: 'Quantum Dynamics', amount: '$3,250.00', status: 'Follow-up Sent', tagColor: 'text-cyan-400 bg-cyan-500/10' },
                    { id: 'INV-2026-004', client: 'Solaria Logistics', amount: '$8,900.00', status: 'Due in 5 Days', tagColor: 'text-blue-400 bg-blue-500/10' },
                  ].map((row, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono text-slate-300 font-semibold">{row.id}</span>
                        <span className="text-slate-500 ml-2 font-medium">{row.client}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-white">{row.amount}</span>
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] ${row.tagColor}`}>
                          {row.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time System Feed */}
              <div className="lg:col-span-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>Real-Time Engine Feed</span>
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] font-mono text-emerald-400 block">WEBHOOK VERIFIED</span>
                      <span className="text-slate-300">Stripe payment $12,400.00 settled. Ledger reconciled.</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] font-mono text-blue-400 block">AI COPILOT ADVISORY</span>
                      <span className="text-slate-300">Recommended email draft generated for Apex Media.</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] font-mono text-slate-500 flex items-center justify-between">
                  <span>Tenant ID: org_live_891</span>
                  <span className="text-emerald-400">● Nominal</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Invoices */}
        {activeTab === 'invoices' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Smart Zero-Interest Invoices</h4>
                  <p className="text-xs text-slate-400">Strict database-level remaining balance and halal fee validation.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-400 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  Total Active: $48,500.00
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-mono border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Invoice</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Issue Date</th>
                    <th className="p-3.5">Due Date</th>
                    <th className="p-3.5 text-right">Total</th>
                    <th className="p-3.5 text-right">Balance</th>
                    <th className="p-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {[
                    { id: 'INV-2026-001', customer: 'Apex Media Corp', issue: 'Feb 10, 2026', due: 'Feb 24, 2026', total: '$4,800.00', bal: '$4,800.00', status: 'Overdue', color: 'text-amber-400 bg-amber-500/10' },
                    { id: 'INV-2026-002', customer: 'Vertex Software LLC', issue: 'Feb 12, 2026', due: 'Feb 26, 2026', total: '$12,400.00', bal: '$0.00', status: 'Paid', color: 'text-emerald-400 bg-emerald-500/10' },
                    { id: 'INV-2026-003', customer: 'Quantum Dynamics', issue: 'Feb 15, 2026', due: 'Mar 01, 2026', total: '$3,250.00', bal: '$1,250.00', status: 'Partial', color: 'text-blue-400 bg-blue-500/10' },
                    { id: 'INV-2026-004', customer: 'Solaria Logistics', issue: 'Feb 18, 2026', due: 'Mar 04, 2026', total: '$8,900.00', bal: '$8,900.00', status: 'Sent', color: 'text-cyan-400 bg-cyan-500/10' },
                  ].map((inv, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono text-white font-medium">{inv.id}</td>
                      <td className="p-3.5 text-slate-300">{inv.customer}</td>
                      <td className="p-3.5 text-slate-400 font-mono">{inv.issue}</td>
                      <td className="p-3.5 text-slate-400 font-mono">{inv.due}</td>
                      <td className="p-3.5 text-right font-mono font-semibold text-slate-200">{inv.total}</td>
                      <td className="p-3.5 text-right font-mono font-bold text-white">{inv.bal}</td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] ${inv.color}`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Customers */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Tenant-Isolated Customer CRM</h4>
                  <p className="text-xs text-slate-400">Row Level Security guarantees zero cross-tenant customer data access.</p>
                </div>
              </div>
              <span className="text-xs font-mono text-indigo-400 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                4 Active Profiles
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'Apex Media Corp', email: 'billing@apexmedia.com', invoices: '3 Total', health: 'Payment Due', phone: '+1 (555) 234-5678', score: 'Fair (14d avg)' },
                { name: 'Vertex Software LLC', email: 'ap@vertexsoft.io', invoices: '8 Total', health: 'Prompt Settler', phone: '+1 (555) 876-5432', score: 'Excellent (3d avg)' },
                { name: 'Quantum Dynamics', email: 'accounts@quantumdyn.com', invoices: '5 Total', health: 'Partial Settler', phone: '+1 (555) 345-6789', score: 'Good (9d avg)' },
                { name: 'Solaria Logistics', email: 'finance@solaria.net', invoices: '2 Total', health: 'On Schedule', phone: '+1 (555) 987-6543', score: 'Good (11d avg)' },
              ].map((c, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-white">{c.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {c.score}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mb-1">{c.email}</p>
                    <p className="text-xs text-slate-500 font-mono">{c.phone}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>{c.invoices}</span>
                    <span className="text-emerald-400">{c.health}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Collections */}
        {activeTab === 'collections' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Ethical Aging Buckets & Automation Cadence</h4>
                  <p className="text-xs text-slate-400">Polite staged reminders without aggressive compounding late penalties.</p>
                </div>
              </div>
              <span className="text-xs font-mono text-amber-400 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30">
                3 Aging Buckets
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-blue-400">1–15 DAYS (STAGE 1)</span>
                  <span className="text-[10px] font-mono text-slate-400">Polite Check-In</span>
                </div>
                <p className="text-xs text-slate-300 mb-3">Friendly statement email reminder dispatched automatically.</p>
                <div className="text-xs font-mono text-slate-500">Active Items: 2 Invoices</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/40 border border-amber-500/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-amber-400">16–30 DAYS (STAGE 2)</span>
                  <span className="text-[10px] font-mono text-slate-400">Statement Review</span>
                </div>
                <p className="text-xs text-slate-300 mb-3">Multi-channel SMS and follow-up prompt with direct settlement portal link.</p>
                <div className="text-xs font-mono text-amber-400">Active Items: 1 Invoice</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-purple-400">31+ DAYS (STAGE 3)</span>
                  <span className="text-[10px] font-mono text-slate-400">Direct Outreach</span>
                </div>
                <p className="text-xs text-slate-300 mb-3">AI Copilot suggests personalized settlement plan with finance team approval.</p>
                <div className="text-xs font-mono text-slate-500">Active Items: 0 Invoices</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: AI Copilot */}
        {activeTab === 'copilot' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">AI Financial Copilot (Advisory Mode)</h4>
                  <p className="text-xs text-slate-400">Contextual advice with strict read-only financial boundaries.</p>
                </div>
              </div>
              <span className="text-xs font-mono text-purple-400 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30">
                Bounds Enforced
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-mono text-purple-300 font-semibold">Recommendation for INV-2026-001 (Apex Media)</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Confidence: 94%</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                "Apex Media has previously settled two accounts within 48 hours of receiving an SMS reminder with invoice statement attached. Recommend sending Stage 1 reminder via SMS."
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button type="button" className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">
                  Approve Dispatch
                </button>
                <button type="button" className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold">
                  Modify Draft
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
