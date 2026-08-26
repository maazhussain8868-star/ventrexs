'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  Users,
  Building2,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-primary" />,
      title: 'Ethical Financial Governance',
      desc: 'Strict Halal ledger arithmetic: 0% interest, 0% compounding fees, and 0% predatory late charges built directly into our core SQL schemas.',
    },
    {
      icon: <Lock className="w-6 h-6 text-emerald-600" />,
      title: 'Zero-Trust Multi-Tenancy',
      desc: 'Row Level Security enforced at the PostgreSQL kernel layer. Customer datasets are isolated with tenant-scoped encryption.',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-indigo-500" />,
      title: 'Human-Governed AI Automation',
      desc: 'AI agents operate strictly within advisory and drafting boundaries. Sensitive financial mutations require explicit human approval.',
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
            <Link href="/features" className="hover:text-on-surface transition-colors">Features</Link>
            <Link href="/pricing" className="hover:text-on-surface transition-colors">Pricing</Link>
            <Link href="/about" className="text-primary font-bold">About</Link>
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

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
            <HeartHandshake className="w-3.5 h-3.5" /> Built for Field Service Operators
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-on-surface">
            The Ethical Operating System for <span className="text-primary">Service Trades</span>
          </h1>
          <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Founded with the belief that contractors deserve modern AI tooling without predatory financial tricks, hidden fees, or brittle disconnected software stacks.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <div
              key={i}
              className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 shadow-xs space-y-3"
            >
              <div className="p-3 bg-surface-container-high rounded-2xl w-fit border border-outline-variant/20">
                {v.icon}
              </div>
              <h3 className="text-base font-bold text-on-surface">{v.title}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Architecture Note */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-8 space-y-4">
          <h2 className="text-xl font-bold text-on-surface">Our Commitment to Clean Architecture</h2>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Ventrexs AI was engineered from the ground up using strict PostgreSQL schemas, Supabase Row-Level Security, and cryptographic HMAC webhook verification. Our multi-tenant architecture ensures that every business retains strict ownership over its leads, customers, work orders, and financial history.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold text-primary">
            <Link href="/security" className="flex items-center gap-1 hover:underline">
              View Security Architecture <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link href="/pricing" className="flex items-center gap-1 hover:underline">
              Review Transparent Pricing <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
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
