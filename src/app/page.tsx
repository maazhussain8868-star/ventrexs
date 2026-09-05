'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PhoneCall,
  Users,
  FileText,
  CreditCard,
  MessageSquare,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Star,
  Clock,
  Building2,
  Wrench,
  Flame,
  Droplet,
  ChevronRight,
  TrendingUp,
  Shield,
  Layers,
  Bot,
  Activity,
  Award,
  Check,
} from 'lucide-react';

import Navbar from '@/components/marketing/Navbar';
import HeroDashboardMockup from '@/components/marketing/HeroDashboardMockup';
import MinimalSignupForm from '@/components/marketing/MinimalSignupForm';
import { ConversionTracker } from '@/lib/analytics/conversion-tracker';
import { PLANS_CONFIG, PlanKey } from '@/lib/billing/types';

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // GA4 Page View Tracking on Mount
  useEffect(() => {
    ConversionTracker.trackLandingPageView('/');
  }, []);

  const handleHeroCtaClick = () => {
    ConversionTracker.trackCtaClick({
      cta_name: 'Start Free Trial',
      cta_location: 'hero_primary',
      destination_url: '/signup?trial=true',
    });
  };

  const handlePricingCtaClick = (plan: string) => {
    ConversionTracker.trackCtaClick({
      cta_name: `Start Free Trial - ${plan}`,
      cta_location: 'pricing_table',
      destination_url: `/signup?plan=${plan}&interval=${billingCycle}&trial=true`,
    });
  };

  return (
    <div className="min-h-screen bg-[#050812] text-slate-100 flex flex-col selection:bg-blue-600/30 selection:text-blue-200 overflow-x-hidden font-sans">
      {/* 1. Glass Sticky Navbar */}
      <Navbar />

      <main className="flex-1 flex flex-col items-center w-full">
        {/* ============================================================ */}
        {/* SECTION 1 — HERO SECTION                                     */}
        {/* ============================================================ */}
        <section className="relative w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-16 sm:pb-24 flex flex-col items-center text-center">
          {/* Subtle Ambient Radial Lighting Pool (Electric Blue + Indigo) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[420px] bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none -z-10" />

          {/* Entrance Animation Wrapper */}
          <div className="max-w-3xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B1220] border border-blue-500/30 shadow-[0_0_25px_rgba(37,99,235,0.2)] mb-6">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-mono font-semibold tracking-wider uppercase text-blue-300">
                ALL-IN-ONE SERVICE OS
              </span>
            </div>

            {/* Benefit-Driven Main Headline (< 3s comprehension) */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] mb-6">
              Run your entire service business with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">
                one AI system.
              </span>
            </h1>

            {/* Value-Expanding Subheadline */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal mb-8 max-w-2xl">
              Never miss another high-value lead. Ventrexs AI answers calls 24/7, qualifies emergencies, schedules jobs, sends zero-interest invoices, and collects payments on autopilot.
            </p>

            {/* Single Primary CTA Button (No competing secondary CTAs) */}
            <div className="flex flex-col items-center gap-3 w-full sm:w-auto mb-12">
              <Link
                href="/signup?trial=true"
                onClick={handleHeroCtaClick}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl font-bold text-sm sm:text-base shadow-xl shadow-blue-600/40 hover:shadow-[0_0_35px_rgba(37,99,235,0.6)] transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 border border-blue-400/40 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              {/* Friction-Free Microcopy */}
              <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
                <span>7-Day Full Access</span>
                <span>•</span>
                <span>No Credit Card Required</span>
                <span>•</span>
                <span>Ready in 60 Seconds</span>
              </p>
            </div>
          </div>

          {/* Animated Hero Visual / Mockup of the Dashboard */}
          <div className="w-full mt-2 animate-in fade-in zoom-in-95 duration-1000 delay-200">
            <HeroDashboardMockup />
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 2 — SOCIAL PROOF & TRUST INDICATORS                  */}
        {/* ============================================================ */}
        <section className="w-full border-y border-slate-800/80 bg-[#070B16]/80 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Key Trust Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold text-white">99.9%</div>
                <div className="text-xs font-mono text-cyan-400">Receptionist Uptime</div>
                <p className="text-[11px] text-slate-400">Zero missed after-hours calls</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold text-white">&lt; 1.5s</div>
                <div className="text-xs font-mono text-cyan-400">Voice Response Time</div>
                <p className="text-[11px] text-slate-400">Natural human conversation speed</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold text-white">$4.2M+</div>
                <div className="text-xs font-mono text-cyan-400">Invoices Processed</div>
                <p className="text-[11px] text-slate-400">Automated zero-interest settlements</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold text-white">0</div>
                <div className="text-xs font-mono text-cyan-400">Missed Customer Leads</div>
                <p className="text-[11px] text-slate-400">Instant qualification & booking</p>
              </div>
            </div>

            {/* Industries Served Strip */}
            <div className="space-y-4 text-center">
              <p className="text-xs font-mono uppercase tracking-widest text-slate-400">
                Built for businesses like:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-80">
                <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs sm:text-sm">
                  <Flame className="w-4 h-4 text-blue-400" />
                  <span>HVAC & Cooling</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs sm:text-sm">
                  <Droplet className="w-4 h-4 text-cyan-400" />
                  <span>Plumbing & Drain</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs sm:text-sm">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Electrical Contractors</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs sm:text-sm">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <span>Roofing & Gutters</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs sm:text-sm">
                  <Wrench className="w-4 h-4 text-emerald-400" />
                  <span>Commercial Cleaning</span>
                </div>
              </div>
            </div>

            {/* TODO: Add real customer testimonials once available */}

            {/* Compliance & Security Strip */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>SOC-2 Type II Operating Standards</span>
              </div>
              <div className="flex items-center gap-2 text-blue-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>TCPA & Carrier A2P 10DLC Verified</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-400">
                <Shield className="w-4 h-4" />
                <span>256-Bit Bank Grade Encryption</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-400">
                <CreditCard className="w-4 h-4" />
                <span>Stripe Verified Partner</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 3 — CORE FEATURES BREAKDOWN                          */}
        {/* ============================================================ */}
        <section id="features" className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono font-semibold">
              <Layers className="w-3.5 h-3.5" />
              <span>THE FIVE CORE PILLARS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Everything your trade business needs to operate.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              No more juggling 6 disconnected apps. Ventrexs synchronizes your phones, CRM, invoicing, payments, and customer messaging into one command center.
            </p>
          </div>

          {/* 5 Animated Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: AI Receptionist */}
            <div className="p-7 rounded-3xl bg-gradient-to-b from-[#0A1124] to-[#060A16] border border-blue-500/30 hover:border-blue-500/60 transition-all duration-300 space-y-4 group shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-cyan-300 group-hover:scale-105 transition-transform">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                  Voice Intelligence
                </span>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-200 transition-colors">
                  24/7 AI Receptionist & Phone Number
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Dedicated US phone number trained on your trade. Answers instantly, filters spam, qualifies emergencies (gas leaks, pipe bursts, power outages), and books calendar slots.
              </p>
              <ul className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-cyan-400" /> Dedicated US DID Phone Number
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-cyan-400" /> Star-Code Call Forwarding (*71)
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-cyan-400" /> Editable Trade FAQs & Protocols
                </li>
              </ul>
            </div>

            {/* Feature 2: Autonomous CRM */}
            <div className="p-7 rounded-3xl bg-gradient-to-b from-[#0A1124] to-[#060A16] border border-indigo-500/30 hover:border-indigo-500/60 transition-all duration-300 space-y-4 group shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                  Customer Intelligence
                </span>
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-200 transition-colors">
                  Autonomous Service CRM
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Every caller is automatically captured into a rich customer profile with audio recordings, structured summaries, address data, equipment tags, and lead scores.
              </p>
              <ul className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-indigo-400" /> Automatic Lead Scoring (Hot/Cold)
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-indigo-400" /> Caller History & Equipment Logs
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-indigo-400" /> Multi-Stage Pipeline Tracking
                </li>
              </ul>
            </div>

            {/* Feature 3: Smart Invoicing & Estimates */}
            <div className="p-7 rounded-3xl bg-gradient-to-b from-[#0A1124] to-[#060A16] border border-emerald-500/30 hover:border-emerald-500/60 transition-all duration-300 space-y-4 group shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                  Financial Automation
                </span>
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-200 transition-colors">
                  Halal-First Smart Invoicing
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Generate branded proposals and zero-interest invoices in seconds. Automatic friendly reminder cadences eliminate late receivables without awkward calls.
              </p>
              <ul className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> 0% Interest & Zero Penalty Terms
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Automated SMS & Email Aging Cadence
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Database-Enforced Balance Tracking
                </li>
              </ul>
            </div>

            {/* Feature 4: Instant Payments */}
            <div className="p-7 rounded-3xl bg-gradient-to-b from-[#0A1124] to-[#060A16] border border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-300 space-y-4 group shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 group-hover:scale-105 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                  Revenue Collection
                </span>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-200 transition-colors">
                  Instant Stripe & Card Checkout
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Integrated Stripe and online payment portal. Customers can settle invoices via credit card, Apple Pay, Google Pay, or ACH with instant automated receipts.
              </p>
              <ul className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-cyan-400" /> Direct-to-Bank Stripe Deposits
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-cyan-400" /> Automatic Ledger Reconciliation
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-cyan-400" /> Instant Cryptographic Webhooks
                </li>
              </ul>
            </div>

            {/* Feature 5: Multi-Channel Comms */}
            <div className="p-7 rounded-3xl bg-gradient-to-b from-[#0A1124] to-[#060A16] border border-blue-500/30 hover:border-blue-500/60 transition-all duration-300 space-y-4 group shadow-xl md:col-span-2 lg:col-span-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-300 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-blue-400 uppercase tracking-wider font-semibold">
                  Multi-Channel Messaging
                </span>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors">
                  Synchronized SMS, WhatsApp & Email Dispatch
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Keep clients informed from dispatch to completion. Ventrexs sends automated on-the-way SMS notices, WhatsApp photo attachments, and post-service Google review requests.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="font-bold text-white">Outbound SMS</span>
                  <p className="text-[11px] text-slate-400">Carrier-registered TCPA double opt-in compliance.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="font-bold text-white">WhatsApp Business</span>
                  <p className="text-[11px] text-slate-400">Direct equipment photo sharing and quote sign-off.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="font-bold text-white">Review Booster</span>
                  <p className="text-[11px] text-slate-400">Auto-requests 5-star Google reviews upon payment.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 4 — HOW IT WORKS                                     */}
        {/* ============================================================ */}
        <section id="how-it-works" className="w-full border-y border-slate-800/80 bg-[#070B16] py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>ONBOARDING WORKFLOW</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Live and taking calls in 4 simple steps.
              </h2>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                No lengthy IT projects or weeks of training. Ventrexs AI gets your phones answered and dispatch automated today.
              </p>
            </div>

            {/* 4-Step Process Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: '01',
                  title: 'Sign Up in 30 Seconds',
                  desc: 'Provide your email and phone number. Your workspace and dedicated US telephone number are provisioned instantly.',
                  badge: 'Instant Telephony',
                  icon: Sparkles,
                },
                {
                  step: '02',
                  title: 'Connect Your Business',
                  desc: 'Pick your trade (HVAC, Plumbing, Electrical, etc.). Ventrexs auto-seeds your emergency rules and standard service catalog.',
                  badge: 'Auto-Seeded Rules',
                  icon: Building2,
                },
                {
                  step: '03',
                  title: 'AI Takes Over 24/7',
                  desc: 'Forward your phone line using simple carrier star-codes (*71). Ventrexs answers calls, filters spam, and books appointments.',
                  badge: '24/7 Voice Coverage',
                  icon: PhoneCall,
                },
                {
                  step: '04',
                  title: 'Get Paid & Scale',
                  desc: 'Complete jobs, send 1-click zero-interest invoices, and receive direct Stripe deposits while automated cadences manage follow-ups.',
                  badge: 'Autopilot Collections',
                  icon: TrendingUp,
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-3xl bg-[#090E1C] border border-slate-800 hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between space-y-6 group shadow-lg"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-extrabold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                          STEP {item.step}
                        </span>
                        <Icon className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-200 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-cyan-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {item.badge}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 5 — PRICING / CTA SECTION                            */}
        {/* ============================================================ */}
        <section id="pricing" className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
              <CreditCard className="w-3.5 h-3.5" />
              <span>TRANSPARENT US PRICING</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Predictable pricing for service fleets.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              No hidden fees, no per-user surprise penalties. Every plan includes dedicated US phone numbers, conversational AI minutes, and full CRM capabilities.
            </p>

            {/* Monthly / Annual Billing Toggle */}
            <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 mt-4">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  billingCycle === 'annual'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-mono uppercase">
                  15% OFF
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Starter Plan */}
            <div className="p-8 rounded-3xl bg-[#090F1C] border border-slate-800 flex flex-col justify-between space-y-6 shadow-lg hover:border-slate-700 transition-all">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">Starter</h3>
                  <p className="text-xs text-slate-400">{PLANS_CONFIG.Starter.tagline}</p>
                </div>

                <div className="py-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">
                      ${billingCycle === 'annual' ? PLANS_CONFIG.Starter.pricing.USD.annualMonthlyEquivalent : PLANS_CONFIG.Starter.pricing.USD.monthly}
                    </span>
                    <span className="text-xs font-mono text-slate-400">/ month</span>
                  </div>
                  {billingCycle === 'annual' && (
                    <p className="text-[11px] text-emerald-400 font-mono mt-1">
                      Billed annually ($295.80/yr) • Save 15%
                    </p>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-800 text-xs text-slate-300">
                  <div className="font-semibold text-white uppercase text-[10px] font-mono tracking-wider">
                    Included Capabilities:
                  </div>
                  <ul className="space-y-2.5">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span><strong>60 Minutes / mo</strong> AI Receptionist Voice</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span><strong>300 SMS</strong> + 100 WhatsApp Messages</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span><strong>100 Active Jobs</strong> & Proposals</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span><strong>1 Team User Seat</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Basic Leads & Pipeline CRM</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-400">
                      <Check className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>Extra minutes: $0.15/min</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Link
                href={`/signup?plan=Starter&interval=${billingCycle}&trial=true`}
                onClick={() => handlePricingCtaClick('Starter')}
                className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 text-center"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Professional Plan (Most Popular Highlight) */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-[#0C152B] to-[#080E1E] border-2 border-blue-500 flex flex-col justify-between space-y-6 shadow-2xl relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[11px] font-mono font-extrabold uppercase tracking-wider shadow-md">
                MOST POPULAR FOR CONTRACTORS
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">Professional</h3>
                  <p className="text-xs text-slate-300">{PLANS_CONFIG.Professional.tagline}</p>
                </div>

                <div className="py-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">
                      ${billingCycle === 'annual' ? PLANS_CONFIG.Professional.pricing.USD.annualMonthlyEquivalent : PLANS_CONFIG.Professional.pricing.USD.monthly}
                    </span>
                    <span className="text-xs font-mono text-slate-400">/ month</span>
                  </div>
                  {billingCycle === 'annual' && (
                    <p className="text-[11px] text-emerald-400 font-mono mt-1">
                      Billed annually ($805.80/yr) • Save 15%
                    </p>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-800 text-xs text-slate-300">
                  <div className="font-semibold text-white uppercase text-[10px] font-mono tracking-wider">
                    Everything in Starter, plus:
                  </div>
                  <ul className="space-y-2.5">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span><strong>250 Minutes / mo</strong> AI Receptionist Voice</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span><strong>1,000 SMS</strong> + 500 WhatsApp Messages</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span><strong>500 Active Jobs</strong> & Proposals</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span><strong>3 Team User Seats</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Standard Follow-Up Automation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Auto-Request Google Reviews on Completion</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-400">
                      <Check className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>Extra minutes: $0.12/min</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Link
                href={`/signup?plan=Professional&interval=${billingCycle}&trial=true`}
                onClick={() => handlePricingCtaClick('Professional')}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-blue-600/40 transition-all flex items-center justify-center gap-2 text-center cursor-pointer active:scale-98"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="p-8 rounded-3xl bg-[#090F1C] border border-slate-800 flex flex-col justify-between space-y-6 shadow-lg hover:border-slate-700 transition-all">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">Enterprise</h3>
                  <p className="text-xs text-slate-400">{PLANS_CONFIG.Enterprise.tagline}</p>
                </div>

                <div className="py-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">
                      ${billingCycle === 'annual' ? PLANS_CONFIG.Enterprise.pricing.USD.annualMonthlyEquivalent : PLANS_CONFIG.Enterprise.pricing.USD.monthly}
                    </span>
                    <span className="text-xs font-mono text-slate-400">/ month</span>
                  </div>
                  {billingCycle === 'annual' && (
                    <p className="text-[11px] text-emerald-400 font-mono mt-1">
                      Billed annually ($2,539.80/yr) • Save 15%
                    </p>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-800 text-xs text-slate-300">
                  <div className="font-semibold text-white uppercase text-[10px] font-mono tracking-wider">
                    Full Fleet Infrastructure:
                  </div>
                  <ul className="space-y-2.5">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span><strong>900 Minutes / mo</strong> AI Receptionist Voice</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span><strong>4,000 SMS</strong> + 2,000 WhatsApp Messages</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span><strong>Unlimited Active Jobs</strong> & Proposals</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span><strong>10 Team User Seats</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Full White-Label Client Subdomains</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Dedicated Account Manager & SLA</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-400">
                      <Check className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>Extra minutes: $0.10/min</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Link
                href={`/signup?plan=Enterprise&interval=${billingCycle}&trial=true`}
                onClick={() => handlePricingCtaClick('Enterprise')}
                className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 text-center"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 6 — MINIMAL SIGNUP FORM SECTION                      */}
        {/* ============================================================ */}
        <section id="signup" className="w-full border-t border-slate-800/80 bg-gradient-to-b from-[#050812] via-[#070B18] to-[#04060E] py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-10 text-center">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>EXPERIENCE VENTREXS AI TODAY</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Ready to put your service operations on autopilot?
              </h2>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl mx-auto">
                Join trade contractors across the country saving 20+ hours a week and capturing every after-hours lead.
              </p>
            </div>

            {/* Minimal 2-Field Frictionless Form */}
            <MinimalSignupForm />
          </div>
        </section>
      </main>

      {/* ============================================================ */}
      {/* SECTION 7 — COMPREHENSIVE COMPLIANCE & BRAND FOOTER          */}
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
              AI Operating System for Service Businesses. Powering automated call reception, CRM, dispatch, zero-interest invoicing, and payments on one connected platform.
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
              <li><a href="#features" className="hover:text-white transition-colors">Core Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing & Plans</a></li>
              <li><Link href="/test-receptionist" className="hover:text-white transition-colors">Test AI Receptionist</Link></li>
              <li><Link href="/demo" className="hover:text-white transition-colors">Live Demo Gateway</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Customer Sign In</Link></li>
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
              <li><Link href="/sla" className="hover:text-white transition-colors">Service Level (SLA)</Link></li>
            </ul>
          </div>

          {/* Col 4: Trust & Support */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">Trust & Support</p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/security" className="hover:text-white transition-colors">Security Overview</Link></li>
              <li><Link href="/data-retention" className="hover:text-white transition-colors">Data Retention</Link></li>
              <li><Link href="/account-deletion" className="hover:text-red-400 text-slate-300 transition-colors">Account & Data Deletion</Link></li>
              <li><a href="mailto:support@ventrexs.com" className="hover:text-white transition-colors">Contact Support</a></li>
              <li><a href="mailto:security@ventrexs.com" className="hover:text-white transition-colors">Report Vulnerability</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-10 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-500">
          <p>© {new Date().getFullYear()} Desynthic. All rights reserved. Ventrexs AI.</p>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> SOC-2 Ready
            </span>
            <span>•</span>
            <span>TCPA Compliant</span>
            <span>•</span>
            <span>Stripe Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
