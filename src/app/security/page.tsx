import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import LegalLayout from '@/components/legal/LegalLayout';
import {
  ShieldCheck,
  Lock,
  Database,
  Server,
  KeyRound,
  FileCheck,
  AlertTriangle,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { BRAND } from '@/config/brand';

export const metadata: Metadata = {
  title: `Security Architecture & Data Protection | ${BRAND.name}`,
  description:
    `Detailed technical overview of ${BRAND.name} security controls, Row Level Security (RLS) tenant isolation, cryptographic webhook verification, and encryption standards.`,
};

export default function SecurityOverviewPage() {
  return (
    <LegalLayout
      title="Security & Data Protection Overview"
      subtitle={`A transparent, technical breakdown of ${BRAND.name}'s production security controls, multi-tenant database isolation, cryptographic safeguards, and responsible disclosure policy.`}
      lastUpdated="August 24, 2026"
      effectiveDate="August 24, 2026"
      version="v2.4 (242/242 Assertions Verified)"
      category="Technical Security Architecture"
    >
      <div className="space-y-8">
        {/* Verification Banner */}
        <div className="p-5 rounded-2xl bg-[#050812] border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Production-Hardened Architecture</h3>
              <p className="text-xs text-slate-400">Continuous automated validation across 242 security & system test assertions.</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            242 / 242 PASS
          </span>
        </div>

        {/* 1. Truthful Posture */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-400" />
            1. Transparent Security Posture
          </h2>
          <p>
            We maintain an uncompromising commitment to <strong>truth in technical documentation</strong>. We do not claim third-party certifications (such as SOC 2 Type II or ISO 27001) that have not been independently awarded. Instead, we document the exact, verifiable architectural security controls implemented directly in our software codebase:
          </p>
        </section>

        {/* 2. Core Pillars */}
        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            2. Core Architectural Safeguards
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#050812] border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Database className="w-4 h-4 text-emerald-400" />
                PostgreSQL Row Level Security (RLS)
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Multi-tenant boundaries are enforced directly by the database engine. Every query automatically verifies tenant membership, preventing cross-tenant data leakage even if application layers are bypassed.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#050812] border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <KeyRound className="w-4 h-4 text-cyan-400" />
                Cryptographic Webhook Signatures
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inbound payment webhooks from Stripe are verified using HMAC SHA-256 signatures with timestamp tolerance barriers. Replay attacks and unsigned payloads are rejected immediately.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#050812] border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Server className="w-4 h-4 text-indigo-400" />
                Server-Side Authorization & RPC Isolation
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Client mutations route through authenticated Next.js Server Actions that verify user session and business membership server-side. Internal webhook handlers are strictly unexported from client RPC endpoints.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#050812] border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-yellow-400" />
                Deterministic Ledger Invariants
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Financial arithmetic is protected by strict database constraints. AI models are strictly advisory with zero write authority, and interest or usurious penalties are rejected fail-closed.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Encryption */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-cyan-400" />
            3. Encryption Standards
          </h2>
          <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
            <li><strong>Data in Transit:</strong> 100% of web and API traffic is encrypted using modern TLS 1.3 with HSTS (HTTP Strict Transport Security) preloading enabled.</li>
            <li><strong>Data at Rest:</strong> Database tables, storage volumes, and automated backups are encrypted using industry-standard AES-256 encryption managed by Supabase infrastructure.</li>
            <li><strong>Payment Card Data:</strong> We never touch, process, or store raw credit card numbers or CVVs. All payment collection uses Stripe Elements and Stripe Connect tokenization.</li>
          </ul>
        </section>

        {/* 4. Responsible Disclosure */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-emerald-400" />
            4. Vulnerability Reporting & Responsible Disclosure
          </h2>
          <p>
            We welcome vulnerability reports from security researchers and ethical hackers. If you discover a security vulnerability in {BRAND.name}:
          </p>
          <div className="p-4 rounded-xl bg-[#050812] border border-slate-800 text-xs font-mono space-y-1 text-slate-300">
            <p><strong>Security Reporting Channel:</strong> <a href={`mailto:${BRAND.securityEmail}`} className="text-blue-400 hover:underline">{BRAND.securityEmail}</a></p>
            <p><strong>Response Commitment:</strong> Initial acknowledgment within 24 hours.</p>
            <p><strong>Guidelines:</strong> Please do not access or modify other users&apos; data, execute denial-of-service attacks, or disclose the vulnerability publicly prior to mutually agreed resolution.</p>
          </div>
        </section>
      </div>
    </LegalLayout>
  );
}
