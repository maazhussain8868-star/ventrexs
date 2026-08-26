'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Bot,
  Wrench,
  FileSpreadsheet,
  Star,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function FeaturesPage() {
  const featureList = [
    {
      icon: <Bot className="w-6 h-6 text-primary" />,
      title: 'Autonomous AI Receptionist',
      desc: '24/7 call and text qualification. Converts inbound inquiries into booked jobs with human-like accuracy and zero prompt injection risk.',
      badge: 'Core AI',
    },
    {
      icon: <Wrench className="w-6 h-6 text-indigo-500" />,
      title: 'Field Operations & Dispatch',
      desc: 'Live work order tracking, GPS-ready dispatching, and automated technician status workflows from assignment to completion.',
      badge: 'Field Ops',
    },
    {
      icon: <FileSpreadsheet className="w-6 h-6 text-emerald-600" />,
      title: 'Estimates & Halal Invoicing',
      desc: '1-click estimate-to-invoice conversion with strict integer-cents arithmetic, zero compounding interest, and zero predatory late fees.',
      badge: 'Ledger Engine',
    },
    {
      icon: <Star className="w-6 h-6 text-amber-500" />,
      title: 'Reputation & Review Automation',
      desc: 'Smart post-job SMS and email invitations. Neutralizes negative experiences before public posting with automated manager follow-ups.',
      badge: 'Growth Engine',
    },
    {
      icon: <CreditCard className="w-6 h-6 text-sky-600" />,
      title: 'Multi-Channel Collections',
      desc: 'SMS, WhatsApp, and email payment links with instant multi-gateway support (Stripe, Skydo, India UPI) and strict overpayment defense.',
      badge: 'Payments',
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-purple-600" />,
      title: 'Owner AI & Real-Time Analytics',
      desc: 'Read-only business intelligence providing actionable cash-flow forecasts, technician KPIs, and lead channel attribution.',
      badge: 'Intelligence',
    },
  ];

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col">
      {/* Public Navigation Bar */}
      <header className="sticky top-0 z-50 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tight text-on-surface">
            <div className="w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold">
              V
            </div>
            <span>Ventrexs <span className="text-primary">AI</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-on-surface-variant">
            <Link href="/features" className="text-primary font-bold">Features</Link>
            <Link href="/pricing" className="hover:text-on-surface transition-colors">Pricing</Link>
            <Link href="/about" className="hover:text-on-surface transition-colors">About</Link>
            <Link href="/security" className="hover:text-on-surface transition-colors">Security</Link>
            <Link href="/contact" className="hover:text-on-surface transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-bold text-on-surface hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link
              href="/demo"
              className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" /> View Live Demo
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
            <Zap className="w-3.5 h-3.5" /> Complete Service Operating System
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-on-surface">
            Everything Required to Run a <span className="text-primary">7-Figure Service Business</span>
          </h1>
          <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Ventrexs AI unifies customer acquisition, 24/7 AI call answering, field dispatching, reputation growth, and revenue operations into one cohesive, multi-tenant platform.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureList.map((f, i) => (
            <div
              key={i}
              className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 shadow-xs hover:border-primary/40 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-surface-container-high rounded-2xl border border-outline-variant/20">
                    {f.icon}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-[11px] font-bold text-on-surface-variant">
                    {f.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-on-surface">{f.title}</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">{f.desc}</p>
              </div>

              <div className="pt-2 border-t border-outline-variant/20 flex items-center text-xs font-bold text-primary gap-1">
                <span>Explore capability</span> <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-primary to-indigo-600 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-black">Experience Ventrexs AI in Action</h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-lg">
              Explore our live dual-approved demo environment with pre-loaded HVAC and plumbing workflows.
            </p>
          </div>

          <Link
            href="/demo"
            className="px-6 py-3 bg-white text-primary rounded-2xl text-xs font-black hover:bg-white/90 transition-all flex items-center gap-2 shadow-lg shrink-0"
          >
            <Sparkles className="w-4 h-4" /> Launch Interactive Demo
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant/20 py-8 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <div>&copy; {new Date().getFullYear()} Desynthic. All rights reserved. Powered by Desynthic • Ventrexs AI.</div>
          <div className="flex items-center gap-6 font-semibold">
            <Link href="/privacy" className="hover:text-on-surface">Privacy</Link>
            <Link href="/terms" className="hover:text-on-surface">Terms</Link>
            <Link href="/security" className="hover:text-on-surface">Security</Link>
            <Link href="/contact" className="hover:text-on-surface">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
