'use client';

import React, { useState } from 'react';
import {
  Users,
  Globe,
  Lock,
  Server,
  Database,
  CreditCard,
  Mail,
  MessageSquare,
  PhoneCall,
  Sparkles,
  ShieldCheck,
  ArrowDown,
  Layers,
  Cpu,
} from 'lucide-react';

export default function ArchitectureDiagram() {
  const [selectedLayer, setSelectedLayer] = useState<string>('tenant');

  const layers = [
    {
      id: 'client',
      title: 'Client & Interaction Tier',
      subtitle: 'Next.js 16 (React 19) • SSR & Responsive UI',
      icon: Globe,
      color: '#3B82F6',
      details:
        'Modern responsive dashboard with App Router, server-rendered components, optimistic state synchronization, and client-side error boundaries.',
      tags: ['Next.js 16', 'React 19', 'Tailwind CSS v4', 'Lucide Icons'],
    },
    {
      id: 'edge',
      title: 'Edge Proxy & Route Guards',
      subtitle: 'Middleware • Security Headers • CSP • HSTS',
      icon: Lock,
      color: '#06B6D4',
      details:
        'Next.js edge proxy inspects session cookies on all 12 protected routes, enforces CSP headers, prevents clickjacking, and halts unauthenticated access before executing route code.',
      tags: ['@supabase/ssr', 'CSP', 'HSTS Preload', 'Route Matchers'],
    },
    {
      id: 'server_actions',
      title: 'Server Authorization & Actions Layer',
      subtitle: 'Strict Server-Side Authorization • Audit Logging',
      icon: Server,
      color: '#6366F1',
      details:
        'RPC-protected Server Actions validate tenant ownership via assertUserBelongsToBusiness, sanitizing all payloads and producing tamper-evident audit trail entries.',
      tags: ['Server Actions', 'Tenant Boundary Assertions', 'Audit Logging', 'Fail-Closed RBAC'],
    },
    {
      id: 'tenant',
      title: 'PostgreSQL Database & Multi-Tenant RLS',
      subtitle: 'PostgreSQL • Native RLS Policies • Trigger Invariants',
      icon: Database,
      color: '#10B981',
      details:
        'Database engine enforces Row Level Security on every table. Triggers maintain mathematical ledger invariants (remaining_balance = original_amount - amount_paid) and prevent cross-tenant joining.',
      tags: ['PostgreSQL', 'RLS Policies', 'Deduplication Triggers', 'Ledger Invariants'],
    },
    {
      id: 'external',
      title: 'Financial & Multi-Channel Services',
      subtitle: 'Stripe Webhooks • Resend • Twilio • Meta WhatsApp',
      icon: CreditCard,
      color: '#8B5CF6',
      details:
        'Stripe webhooks with raw buffer HMAC-SHA256 verification and replay protection. Resend for email, Twilio for TCPA-consented SMS, and Meta Business API for WhatsApp.',
      tags: ['Stripe HMAC-SHA256', 'Resend', 'Twilio (TCPA/CTIA)', 'Meta WhatsApp API'],
    },
  ];

  return (
    <div className="w-full space-y-8">
      {/* Diagram Interactive Workspace */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-slate-800 backdrop-blur-2xl shadow-2xl">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Visual Architecture Flow Stack */}
          <div className="w-full lg:w-3/5 space-y-4">
            {layers.map((layer, index) => {
              const Icon = layer.icon;
              const isSelected = selectedLayer === layer.id;

              return (
                <div key={layer.id} className="relative">
                  {/* Connected line connector */}
                  {index > 0 && (
                    <div className="flex justify-center -my-2">
                      <div className="h-4 w-0.5 bg-gradient-to-b from-blue-500/60 to-indigo-500/60" />
                    </div>
                  )}

                  <div
                    onClick={() => setSelectedLayer(layer.id)}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-slate-900 border-blue-500/80 shadow-[0_0_30px_rgba(37,99,235,0.25)] scale-[1.01]'
                        : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                        style={{
                          backgroundColor: `${layer.color}25`,
                          borderColor: `${layer.color}50`,
                          borderWidth: '1px',
                          color: layer.color,
                        }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex flex-col text-left">
                        <span className="text-sm font-bold text-white tracking-tight">
                          {layer.title}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {layer.subtitle}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        Layer 0{index + 1}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Layer Detail Inspector Panel */}
          <div className="w-full lg:w-2/5 p-6 rounded-2xl bg-slate-950 border border-slate-800/90 h-full flex flex-col justify-between space-y-6">
            {(() => {
              const active = layers.find((l) => l.id === selectedLayer) || layers[0];
              const Icon = active.icon;

              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: `${active.color}20`,
                          color: active.color,
                        }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white">{active.title}</h4>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Isolated
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {active.details}
                  </p>

                  <div className="pt-2">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                      Architectural Tokens:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {active.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Full isolation from browser tier down to PostgreSQL RLS.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
