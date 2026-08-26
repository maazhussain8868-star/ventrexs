'use client';

import React from 'react';
import {
  ShieldCheck,
  Lock,
  Key,
  Server,
  Database,
  RefreshCw,
  CheckCircle2,
  Cpu,
  FileCode,
  Shield,
  Layers,
  Terminal,
} from 'lucide-react';

const SECURITY_CARDS = [
  {
    id: 'webhook',
    title: 'Cryptographic Webhook Verification',
    badge: 'Phase 1 & 4 Remediated',
    icon: Key,
    accent: 'blue',
    description:
      'Stripe webhooks are validated using raw buffer HMAC-SHA256 signatures with constant-time buffer comparisons (`crypto.timingSafeEqual`), strictly rejecting forged or tampered payloads.',
    subfeatures: [
      'HMAC-SHA256 Raw Buffer Verification',
      'Constant-Time Signature Matching',
      'Anti-Replay Timestamp Check (<300s tolerance)',
      'Event Idempotency Deduplication Table',
    ],
  },
  {
    id: 'rls',
    title: 'Row Level Security & Tenant Isolation',
    badge: 'Phase 2 & 3 Hardened',
    icon: Database,
    accent: 'emerald',
    description:
      'Multi-tenant PostgreSQL architecture enforces Row Level Security (RLS) on every table, strictly confining business queries to the authenticated tenant context with 0 cross-tenant leakage.',
    subfeatures: [
      'PostgreSQL Native Row Level Security',
      'Tenant Boundary Enforcement (0 Cross-Tenant Leakage)',
      'Cross-Tenant business_members Join Defense',
      'Subscriptions Table Client-Mutation Lockdown',
    ],
  },
  {
    id: 'server_auth',
    title: 'Server Authorization & Guardrails',
    badge: 'Phase 2 Verified',
    icon: Server,
    accent: 'indigo',
    description:
      'All administrative operations (`/admin`) and Server Actions validate authenticated user identity and business tenant ownership on the server side before executing business logic.',
    subfeatures: [
      'Server-Side RBAC (Owner/Admin/Member)',
      'Single-Source-of-Truth Payment Recording',
      'Protected Server Actions (RPC Elimination)',
      'Middleware Route Guard for Protected Routes',
    ],
  },
  {
    id: 'ai_validator',
    title: 'AI Financial Bounds & Ledger Invariants',
    badge: 'Phase 5 Implemented',
    icon: Cpu,
    accent: 'purple',
    description:
      'AI recommendations pass through strict deterministic balance bounds validation before presentation, preventing prompt injections from modifying financial balances.',
    subfeatures: [
      'Ledger Invariant: remaining = original - paid',
      'Rejection of NaN, Infinity & Negative Balances',
      'Halal-First Zero-Interest Enforcement',
      'Human-in-the-Loop Advisory Isolation',
    ],
  },
  {
    id: 'comms_consent',
    title: 'TCPA/CTIA Affirmative Opt-In Engine',
    badge: 'Phase 2, 4 & 5 Passed',
    icon: Lock,
    accent: 'pink',
    description:
      'Transactional communications strictly enforce explicit affirmative opt-in consent for SMS and WhatsApp, automatically respecting STOP keywords and rate-limiting outgoing messages.',
    subfeatures: [
      'Affirmative Consent Verification (Fail Closed)',
      'Automated STOP Keyword Unsubscribe',
      'Distributed Outbound Rate Limiting',
      'Meta & Carrier Template Conformance',
    ],
  },
  {
    id: 'headers_csp',
    title: 'Production Security Headers & CSP',
    badge: 'Production Hardened',
    icon: Shield,
    accent: 'cyan',
    description:
      'Every response enforces enterprise Content Security Policy, strict HSTS, clickjacking prevention (`frame-ancestors \'none\'`), MIME sniffing protection, and referrer isolation.',
    subfeatures: [
      'Content-Security-Policy (CSP)',
      'Strict-Transport-Security (HSTS Preload)',
      'X-Frame-Options: DENY',
      'Sanitized Operational Audit Logs',
    ],
  },
];

export default function SecurityArchitecture() {
  return (
    <div className="w-full space-y-12">
      {/* Central Security Assertion Highlight Banner */}
      <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/40 border border-blue-500/40 backdrop-blur-2xl shadow-[0_0_80px_rgba(37,99,235,0.18)] overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-xs font-mono text-blue-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Cryptographically Verified & Hardened</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Security Tested. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-300">Production Ready.</span>
            </h3>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Ventrexs AI has undergone comprehensive security remediation and rigorous functional regression suites. Every critical financial boundary, cryptographic signature, and tenant isolation rule is verified by automated test assertions.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> 0 Regressions
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <CheckCircle2 className="w-4 h-4" /> 0 Audit Vulnerabilities
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <CheckCircle2 className="w-4 h-4" /> 0 TypeScript Errors
              </span>
            </div>
          </div>

          {/* Large Assertion Metric Badge */}
          <div className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl bg-slate-950/90 border border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.2)] shrink-0 text-center w-full sm:w-auto min-w-[260px]">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                Automated Test Suite
              </span>
            </div>

            <div className="text-5xl sm:text-6xl font-extrabold font-mono text-white tracking-tight my-2 flex items-baseline justify-center gap-1">
              <span className="text-emerald-400">242</span>
              <span className="text-slate-600 text-3xl font-normal">/</span>
              <span className="text-slate-200">242</span>
            </div>

            <p className="text-xs font-semibold text-slate-300">
              Security & Functional Assertions Passing
            </p>
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              Phase 1–5 + Production Suites
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Security Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SECURITY_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="flex flex-col justify-between p-6 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all duration-300 group shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 group-hover:scale-105 group-hover:text-cyan-300 transition-all">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {card.badge}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                  {card.title}
                </h4>

                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  {card.description}
                </p>
              </div>

              {/* Subfeatures list */}
              <div className="pt-4 border-t border-slate-800/80 space-y-2">
                {card.subfeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
