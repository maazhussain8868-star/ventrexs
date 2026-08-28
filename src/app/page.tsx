'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Sparkles,
  FileText,
  CreditCard,
  Users,
  ShieldAlert,
  Mail,
  MessageSquare,
  PhoneCall,
  BarChart3,
  Bell,
  ArrowUpRight,
  Layers,
  Lock,
  Server,
  Database,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu,
  Clock,
  Briefcase,
  Workflow,
  Check,
  Shield,
  Code2,
} from 'lucide-react';

import Navbar from '@/components/marketing/Navbar';
import Hero3DCanvas from '@/components/marketing/Hero3DCanvas';
import ProductShowcase from '@/components/marketing/ProductShowcase';
import SecurityArchitecture from '@/components/marketing/SecurityArchitecture';
import ArchitectureDiagram from '@/components/marketing/ArchitectureDiagram';
import InvestorInquiryForm from '@/components/marketing/InvestorInquiryForm';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050812] text-slate-100 flex flex-col selection:bg-blue-600/30 selection:text-blue-200 overflow-x-hidden font-sans">
      {/* 1. Glass Sticky Navbar */}
      <Navbar />

      <main className="flex-1 flex flex-col items-center w-full">
        {/* ============================================================ */}
        {/* SECTION 1 — HERO & 3D FINANCIAL ECOSYSTEM (DESKTOP 45/55 SPLIT) */}
        {/* ============================================================ */}
        <section className="relative w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-14 sm:pb-20">
          {/* Subtle Ambient Radial Lighting Pool (Electric Blue Dominant) */}
          <div className="absolute top-10 left-1/3 w-[650px] h-[380px] bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none -z-10" />

          {/* Desktop 2-Column Grid / Responsive Mobile Stack */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
            {/* Left Column: Copy & Trust Signals (~44% width on desktop) */}
            <div className="lg:col-span-5 flex flex-col items-start text-left z-10">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0B1220] border border-blue-500/30 shadow-[0_0_20px_rgba(37,99,235,0.15)] mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-blue-300">
                  AI-POWERED BUSINESS OPERATIONS
                </span>
              </div>

              {/* Large High-Contrast Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-[1.12] mb-5">
                Run Your Service Business{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">
                  Smarter
                </span>{' '}
                With AI.
              </h1>

              {/* Concise Supporting Copy */}
              <p className="text-sm sm:text-base text-slate-300 mb-6 leading-relaxed font-normal">
                Ventrexs AI helps businesses manage AI reception, CRM, scheduling, jobs, payments, reputation, and analytics from one connected platform.
              </p>

              {/* Premium CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mb-6">
                <Link
                  href="/demo"
                  className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-lg shadow-blue-600/30 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 border border-blue-400/30 cursor-pointer"
                >
                  <span>Explore Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/pricing"
                  className="w-full sm:w-auto px-6 py-3.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>View Pricing</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>

              {/* Small Supporting Subtitle */}
              <p className="text-[11px] font-mono text-slate-400 mb-6">
                Production-ready SaaS • Multi-tenant architecture • Security tested
              </p>

              {/* Enterprise Infrastructure Credibility Strip */}
              <div className="w-full py-3.5 px-4.5 rounded-2xl bg-[#090F1C]/85 border border-slate-800/90 backdrop-blur-xl flex flex-col gap-2.5 text-xs font-mono text-slate-300 shadow-md">
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">242/242 Security Assertions Passed</span>
                </div>
                <div className="flex items-center gap-2 text-blue-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>0 Known Audit Vulnerabilities</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <div className="flex items-center gap-1.5 text-cyan-400">
                    <Database className="w-3.5 h-3.5 shrink-0" />
                    <span>RLS Isolation</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-purple-400">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>HMAC Webhooks</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: High-Impact 3D Spatial Financial Ecosystem (~56% width) */}
            <div className="lg:col-span-7 w-full flex items-center justify-center relative min-h-[580px] sm:min-h-[640px] lg:min-h-[700px]">
              <Hero3DCanvas />
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 2 — 3D SCROLL WORKFLOW TRANSITION */}
        {/* ============================================================ */}
        <section id="product" className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28 border-t border-slate-800/80">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono mb-3">
              <Workflow className="w-3.5 h-3.5" /> THE FINANCIAL OPERATING LAYER
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              From invoice creation to recovered revenue — one connected workflow.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Ventrexs AI eliminates fragmented business operations by synchronizing the end-to-end service lifecycle from initial AI receptionist booking to field dispatch, customer communications, automated payments, and revenue analytics.
            </p>
          </div>

          {/* Connected Timeline Workflow Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { step: '01', title: 'Invoice', desc: 'Zero-interest terms & balance validation', icon: FileText, color: 'text-blue-400' },
              { step: '02', title: 'Payment', desc: 'Cryptographic Stripe webhook capture', icon: CreditCard, color: 'text-emerald-400' },
              { step: '03', title: 'Customer', desc: 'Tenant-isolated CRM & contact profiles', icon: Users, color: 'text-indigo-400' },
              { step: '04', title: 'Collections', desc: 'Automated polite aging cadences', icon: ShieldAlert, color: 'text-amber-400' },
              { step: '05', title: 'Communication', desc: 'Email, SMS (TCPA) & WhatsApp', icon: Mail, color: 'text-pink-400' },
              { step: '06', title: 'Analytics', desc: 'Recovery velocity & cash forecasts', icon: BarChart3, color: 'text-cyan-400' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#090F1C]/90 hover:bg-[#0E1626] border border-slate-800 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between group shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="text-[10px] font-mono font-bold text-slate-500 group-hover:text-blue-400 transition-colors">
                        STAGE {item.step}
                      </span>
                      <Icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-blue-200 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-normal font-sans">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 3 — PRODUCT ECOSYSTEM */}
        {/* ============================================================ */}
        <section id="platform" className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28 border-t border-slate-800/80">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono mb-3">
              <Layers className="w-3.5 h-3.5" /> 10 Core Financial Modules
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              Comprehensive Financial Operating Engine
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Every feature is built directly into the repository, covered by automated tests, and architected for enterprise-grade SaaS deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Smart Invoicing',
                desc: 'Halal-First zero-interest terms with database-enforced remaining balance invariants.',
                icon: FileText,
                badge: 'Zero-Interest',
                color: '#3B82F6',
              },
              {
                title: 'Payment Tracking',
                desc: 'Real-time reconciliation via Stripe webhooks with HMAC-SHA256 signature verification and idempotency.',
                icon: CreditCard,
                badge: 'HMAC-SHA256',
                color: '#10B981',
              },
              {
                title: 'Automated Collections',
                desc: 'Polite, staged aging bucket automation that accelerates settlement without damaging client goodwill.',
                icon: ShieldAlert,
                badge: 'Ethical AR',
                color: '#F59E0B',
              },
              {
                title: 'AI Collection Copilot',
                desc: 'Contextual advisory engine recommending optimal timing and respectful multi-tone communication drafts.',
                icon: Sparkles,
                badge: 'Advisory Mode',
                color: '#8B5CF6',
              },
              {
                title: 'Email Communication',
                desc: 'Transactional reminder dispatch via Resend with verified delivery, open tracking, and statement attachments.',
                icon: Mail,
                badge: 'Resend API',
                color: '#06B6D4',
              },
              {
                title: 'SMS Reminders',
                desc: 'Transactional SMS via Twilio with affirmative TCPA/CTIA consent guardrails and STOP keyword processing.',
                icon: MessageSquare,
                badge: 'TCPA Enforced',
                color: '#EC4899',
              },
              {
                title: 'WhatsApp Engine',
                desc: 'Meta Business API integration with approved transactional templates for instant billing coordination.',
                icon: PhoneCall,
                badge: 'Meta Cloud API',
                color: '#22C55E',
              },
              {
                title: 'Financial Reports',
                desc: 'Real-time aging distribution, recovery velocity metrics, and cash collection forecast models.',
                icon: BarChart3,
                badge: 'Live Analytics',
                color: '#38BDF8',
              },
              {
                title: 'Customer Management',
                desc: 'Multi-tenant client CRM with billing history, payment performance metrics, and consent logs.',
                icon: Users,
                badge: 'RLS Isolated',
                color: '#6366F1',
              },
              {
                title: 'System Notifications',
                desc: 'In-app real-time operational feeds for overdue events, payment settlements, and copilot alerts.',
                icon: Bell,
                badge: 'Event Stream',
                color: '#EAB308',
              },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-[#090F1C]/90 hover:bg-[#0E1626] border border-slate-800 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between group shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"
                        style={{
                          backgroundColor: `${card.color}20`,
                          color: card.color,
                          border: `1px solid ${card.color}40`,
                        }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {card.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      {card.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800/70 flex items-center gap-2 text-[11px] font-mono text-slate-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified in codebase & test suites</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 4 — INTERACTIVE PRODUCT SHOWCASE */}
        {/* ============================================================ */}
        <section id="showcase" className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28 border-t border-slate-800/80">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Interactive UI Preview
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              Built, functional, and ready to deploy.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Explore the live UI capabilities of Ventrexs AI across service operations, AI copilot workflows, multi-channel delivery, and financial reporting.
            </p>
          </div>

          <ProductShowcase />
        </section>

        {/* ============================================================ */}
        {/* SECTION 5 — AI COPILOT */}
        {/* ============================================================ */}
        <section id="copilot" className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28 border-t border-slate-800/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5" /> Human-in-the-Loop AI
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Intelligence where your operations team needs it.
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                The Ventrexs AI Copilot assists service and financial teams by analyzing customer inquiry patterns, evaluating dispatch schedules, and recommending tailored operational workflows.
              </p>

              {/* Strict Advisory Boundary Alert */}
              <div className="p-5 rounded-2xl bg-[#090F1C] border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Authoritative Ledger Invariant Enforcement</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  AI recommendations are purely advisory. The financial ledger remains strictly protected by deterministic database triggers and bounds validators, preventing autonomous balance modifications or interest calculations.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-300">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">ETHICAL RULE</span>
                  <span className="text-emerald-400 font-semibold">Zero Interest / Late Fees</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">LEDGER SAFETY</span>
                  <span className="text-blue-400 font-semibold">Read-Only Invariant</span>
                </div>
              </div>
            </div>

            {/* AI Analysis Workflow Diagram */}
            <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-slate-950 border border-purple-500/30 shadow-[0_0_60px_rgba(139,92,246,0.15)] space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
                  <span className="text-xs font-mono text-purple-300 font-semibold">AI Advisory Architecture</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Invoice: INV-2026-001</span>
              </div>

              {/* Step by Step AI Flow */}
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#090F1C] border border-slate-800 text-slate-300">
                  <span className="text-blue-400 font-bold">01</span>
                  <span>Customer Context & Aging Bucket Evaluation</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#090F1C] border border-slate-800 text-slate-300">
                  <span className="text-indigo-400 font-bold">02</span>
                  <span>Deterministic Balance Bounds Verification ($4,800.00)</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#090F1C] border border-slate-800 text-slate-300">
                  <span className="text-purple-400 font-bold">03</span>
                  <span>AI Drafting: Polite Professional Statement Reminder</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200">
                  <span className="text-emerald-400 font-bold">04</span>
                  <span className="font-sans font-semibold">Human-in-the-Loop Approval Before Dispatch</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Review Customer Record
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Draft Communication
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 6 — COMMUNICATION ENGINE */}
        {/* ============================================================ */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28 border-t border-slate-800/80">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-3">
              <Mail className="w-3.5 h-3.5" /> Multi-Channel Delivery Engine
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              One workflow. Multiple communication channels.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Automated reminders reach customers across their preferred communication channels with strict TCPA/CTIA consent guardrails, opt-out handling, and rate limits.
            </p>
          </div>

          {/* Step-by-Step Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { num: '1', title: 'Invoice Overdue', desc: 'Aging bucket trigger' },
              { num: '2', title: 'AI Evaluates', desc: 'Context & timing analysis' },
              { num: '3', title: 'Draft Prepared', desc: 'Polite reminder generated' },
              { num: '4', title: 'Multi-Channel Dispatch', desc: 'Email, SMS or WhatsApp' },
              { num: '5', title: 'Customer Responds', desc: 'Portal checkout link' },
              { num: '6', title: 'Stripe Settlement', desc: 'Cryptographic confirmation' },
            ].map((step, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#090F1C]/90 border border-slate-800 flex flex-col justify-between shadow-md"
              >
                <span className="text-[11px] font-mono text-cyan-400 font-bold mb-3">
                  STEP 0{step.num}
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white mb-1.5">{step.title}</h3>
                  <p className="text-xs text-slate-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 7 — SECURITY ARCHITECTURE */}
        {/* ============================================================ */}
        <section id="security" className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28 border-t border-slate-800/80">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> 242/242 Passing Assertions
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              Built with security at the core.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Every financial calculation, tenant boundary, and webhook signature is cryptographically verified and enforced across comprehensive Phase 1–5 test suites.
            </p>
          </div>

          <SecurityArchitecture />
        </section>

        {/* ============================================================ */}
        {/* SECTION 8 — TECHNICAL ARCHITECTURE */}
        {/* ============================================================ */}
        <section id="architecture" className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28 border-t border-slate-800/80">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono mb-3">
              <Server className="w-3.5 h-3.5" /> Full-Stack Technical Diagram
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              Enterprise-Grade SaaS Architecture
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Explore the technical tiers separating client execution, edge proxies, server-side authorization, multi-tenant database policies, and external financial adapters.
            </p>
          </div>

          <ArchitectureDiagram />
        </section>

        {/* ============================================================ */}
        {/* SECTION 9 — STRATEGIC VALUE PROPOSITIONS */}
        {/* ============================================================ */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28 border-t border-slate-800/80">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono mb-3">
              <Zap className="w-3.5 h-3.5" /> Strategic Advantages
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              Why Ventrexs AI represents immediate value
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
              A fully functional product with solved security architecture, tested business workflows, and high commercial readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Built, not just conceptual.',
                desc: 'Complete Next.js 16 / TypeScript codebase with 23 compiled routes, tested server actions, and verified data models.',
                icon: FileText,
              },
              {
                title: 'Financial workflows in one system.',
                desc: 'Consolidates invoicing, automated collections, customer CRM, multi-channel dispatch, and cash analytics into one platform.',
                icon: Layers,
              },
              {
                title: 'Security-first architecture.',
                desc: 'Phase 1–5 hardened with 242/242 passing test assertions, HMAC-SHA256 webhooks, and zero cross-tenant data leakage.',
                icon: ShieldCheck,
              },
              {
                title: 'AI-assisted operations.',
                desc: 'Contextual AI recommendations with strict read-only financial bounds validation and human-in-the-loop oversight.',
                icon: Sparkles,
              },
              {
                title: 'Multi-channel customer communication.',
                desc: 'Unified delivery across Email, SMS (TCPA compliant), and WhatsApp Business API from a single aging workflow.',
                icon: Mail,
              },
              {
                title: 'Designed for scalable SaaS.',
                desc: 'Clean multi-tenant schema, tiered feature entitlements, subscription management, and idempotent billing triggers.',
                icon: TrendingUp,
              },
            ].map((prop, i) => {
              const Icon = prop.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-[#090F1C]/90 hover:bg-[#0E1626] border border-slate-800 hover:border-slate-700 transition-all duration-300 shadow-lg"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{prop.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">{prop.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 10 — BUSINESS MODEL & MONETIZATION */}
        {/* ============================================================ */}
        <section id="pricing" className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28 border-t border-slate-800/80">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-3">
              <TrendingUp className="w-3.5 h-3.5" /> Proposed Monetization
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              Potential SaaS Monetization Structure
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Designed for recurring B2B software subscriptions and usage-based communication add-ons based on the underlying architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-2xl bg-[#090F1C]/90 border border-slate-800 flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase">Starter Tier</span>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white my-4">$29 <span className="text-xs text-slate-500 font-normal">/ month</span></div>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  For growing SMBs needing automated email invoice reminders and basic receivables tracking.
                </p>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Smart Zero-Interest Invoicing</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Automated Email Reminders</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Stripe Payment Reconciliation</li>
                </ul>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
                Architecture: Feature Gated
              </div>
            </div>

            <div className="p-7 rounded-2xl bg-gradient-to-b from-blue-950/40 to-[#090F1C] border border-blue-500/40 shadow-2xl shadow-blue-500/10 flex flex-col justify-between relative">
              <div className="absolute -top-3.5 right-6 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-mono font-bold shadow-md">
                RECOMMENDED
              </div>
              <div>
                <span className="text-xs font-mono text-blue-400 uppercase">Professional Tier</span>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white my-4">$79 <span className="text-xs text-slate-500 font-normal">/ month</span></div>
                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  For established agencies and businesses requiring multi-channel SMS/WhatsApp and AI Copilot.
                </p>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> All Starter Features</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> AI Collection Copilot Insights</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> SMS & WhatsApp Dispatch</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Aging & Recovery Reports</li>
                </ul>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-800 text-[11px] text-blue-400 font-mono">
                Architecture: Multi-Channel Enabled
              </div>
            </div>

            <div className="p-7 rounded-2xl bg-[#090F1C]/90 border border-slate-800 flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase">Enterprise / Commercial</span>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white my-4">$249 <span className="text-xs text-slate-500 font-normal">/ month</span></div>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  For high-volume financial operations requiring dedicated database isolation and custom API webhooks.
                </p>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Unlimited Team Seats</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Dedicated Schema Isolation</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Custom ERP / Accounting Connectors</li>
                </ul>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
                Architecture: Enterprise Ready
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 11 — TARGET MARKET & USE CASES */}
        {/* ============================================================ */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28 border-t border-slate-800/80">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono mb-3">
              <Briefcase className="w-3.5 h-3.5" /> Target Market Segments
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              Designed for modern financial operations
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Target business categories that benefit immediately from automated accounts receivable and ethical payment recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Digital & Creative Agencies',
                desc: 'Retainer billing, project milestone payments, and automated follow-ups without awkward client interactions.',
              },
              {
                title: 'Professional Service Firms',
                desc: 'Legal, consulting, and accounting practices managing recurring client retainers and net-30 invoicing.',
              },
              {
                title: 'B2B SaaS & Tech Vendors',
                desc: 'Annual contract renewals, usage invoicing, and automated reminders for overdue enterprise balances.',
              },
              {
                title: 'SMB Wholesale & Trade',
                desc: 'Purchase order invoicing, partial payment ledgering, and multi-channel SMS delivery for fast settlement.',
              },
            ].map((useCase, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#090F1C]/90 border border-slate-800 hover:border-slate-700 transition-colors shadow-md"
              >
                <h3 className="text-sm sm:text-base font-bold text-white mb-2">{useCase.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">{useCase.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 12 — PRODUCT STATUS & REPOSITORY HEALTH */}
        {/* ============================================================ */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28 border-t border-slate-800/80">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" /> Repository Health
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              Dynamically Verified Product Status
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Direct verification results from the current codebase, compiler, security suite, and build pipeline.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-5 rounded-2xl bg-[#090F1C]/90 border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Product State</span>
              <p className="text-sm sm:text-base font-bold font-mono text-white mt-1">Functional SaaS</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#090F1C]/90 border border-emerald-500/30 text-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Security Tests</span>
              <p className="text-sm sm:text-base font-bold font-mono text-emerald-400 mt-1">242 / 242 Pass</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#090F1C]/90 border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Production Build</span>
              <p className="text-sm sm:text-base font-bold font-mono text-blue-400 mt-1">Verified Next 16</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#090F1C]/90 border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase">TypeScript</span>
              <p className="text-sm sm:text-base font-bold font-mono text-cyan-400 mt-1">0 Errors</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#090F1C]/90 border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase">NPM Audit</span>
              <p className="text-sm sm:text-base font-bold font-mono text-purple-400 mt-1">0 Vulnerabilities</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#090F1C]/90 border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Compiled Routes</span>
              <p className="text-sm sm:text-base font-bold font-mono text-emerald-400 mt-1">23 Routes</p>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 13 — ACQUISITION / INVESTMENT OPPORTUNITY */}
        {/* ============================================================ */}
        <section id="opportunity" className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28 border-t border-slate-800/80">
          <div className="rounded-3xl p-8 sm:p-12 lg:p-14 bg-gradient-to-br from-[#090F1C] via-slate-950 to-indigo-950/40 border border-slate-800 shadow-2xl space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono">
                <Briefcase className="w-3.5 h-3.5" /> For Buyers & Investors
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                Looking for the right next chapter.
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left pt-3">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-blue-500/30">
                  <span className="text-xs font-mono text-blue-400 font-semibold uppercase">For Strategic Acquirers</span>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    Acquire a production-ready financial SaaS foundation with completed invoicing, payment reconciliation, multi-channel dispatch, and AI copilot.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-indigo-500/30">
                  <span className="text-xs font-mono text-indigo-400 font-semibold uppercase">For Growth Investors</span>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    Evaluate the hardened security foundation (242/242 passing tests), scalable multi-tenant architecture, and clear recurring SaaS monetization model.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                <h4 className="text-xs font-bold text-white">Full Asset Codebase</h4>
                <p className="text-[11px] text-slate-400">Complete Next.js 16, TypeScript, Supabase RLS, and test suites.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                <h4 className="text-xs font-bold text-white">Security Architecture</h4>
                <p className="text-[11px] text-slate-400">Phase 1–5 remediation, HMAC-SHA256 webhooks, and 242/242 passing tests.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                <h4 className="text-xs font-bold text-white">Multi-Channel Infrastructure</h4>
                <p className="text-[11px] text-slate-400">Integrated email, SMS (TCPA opt-in), and Meta WhatsApp API adapters.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                <h4 className="text-xs font-bold text-white">Deployment-Ready</h4>
                <p className="text-[11px] text-slate-400">0 compiler errors, 0 npm audit vulnerabilities, and verified production builds.</p>
              </div>
            </div>

            <div className="text-center pt-3">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
              >
                <span>Discuss the Opportunity</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 14 — LIVE PRODUCT CTA */}
        {/* ============================================================ */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-slate-800/80 text-center">
          <div className="max-w-2xl mx-auto space-y-5">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
              See Ventrexs AI in action.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Inspect the live receivables dashboard or submit an inquiry to review full architectural documentation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Open Product Demo</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <a
                href="#contact"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Request Private Walkthrough
              </a>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 15 — BUYER / INVESTOR INQUIRY FORM */}
        {/* ============================================================ */}
        <section id="contact" className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28 border-t border-slate-800/80">
          <InvestorInquiryForm />
        </section>
      </main>

      {/* ============================================================ */}
      {/* SECTION 16 — COMPREHENSIVE INVESTOR & COMPLIANCE FOOTER */}
      {/* ============================================================ */}
      <footer className="w-full border-t border-slate-800/80 bg-[#050812] py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand & Identity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                <Zap className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white">Ventrexs AI</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              AI-Powered Business Operations Platform. Run your service business smarter with AI-powered reception, CRM, jobs, payments, reputation, and business intelligence.
            </p>
            <div className="pt-1">
              <p className="text-xs font-medium text-slate-400">Powered by Desynthic</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-slate-400">
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">Delaware, USA</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">Google Play Compliant</span>
            </div>
          </div>

          {/* Col 2: Product & Platform */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">Product</p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#showcase" className="hover:text-white transition-colors">Showcase & Features</a></li>
              <li><a href="#platform" className="hover:text-white transition-colors">Platform Capabilities</a></li>
              <li><a href="#security" className="hover:text-white transition-colors">Security Architecture</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing & Plans</a></li>
              <li><Link href="/demo" className="hover:text-white transition-colors">Live Demo Gateway</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Merchant Sign In</Link></li>
            </ul>
          </div>

          {/* Col 3: Legal & Regulatory */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">Legal & Policies</p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/subscription-terms" className="hover:text-white transition-colors">Subscription Terms</Link></li>
              <li><Link href="/refund-policy" className="hover:text-white transition-colors">Refund & Cancellation</Link></li>
              <li><Link href="/dpa" className="hover:text-white transition-colors">Data Processing (DPA)</Link></li>
              <li><Link href="/acceptable-use" className="hover:text-white transition-colors">Acceptable Use Policy</Link></li>
              <li><Link href="/ip-policy" className="hover:text-white transition-colors">IP & DMCA Policy</Link></li>
              <li><Link href="/sla" className="hover:text-white transition-colors">Service Level (SLA)</Link></li>
            </ul>
          </div>

          {/* Col 4: Trust, Safety & User Rights */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">Trust & Privacy</p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/security" className="hover:text-white transition-colors">Security Overview</Link></li>
              <li><Link href="/data-retention" className="hover:text-white transition-colors">Data Retention Schedule</Link></li>
              <li><Link href="/account-deletion" className="hover:text-red-400 font-medium text-slate-300 transition-colors">Account & Data Deletion</Link></li>
              <li><a href="mailto:privacy@ventrexs.com" className="hover:text-white transition-colors">Data Protection Officer</a></li>
              <li><a href="mailto:security@ventrexs.com" className="hover:text-white transition-colors">Report Vulnerability</a></li>
              <li><a href="mailto:support@ventrexs.com" className="hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-10 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-500">
          <p>© {new Date().getFullYear()} Desynthic. All rights reserved. Powered by Desynthic • Ventrexs AI.</p>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Google Play Compliant
            </span>
            <span>•</span>
            <span>Verified Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
