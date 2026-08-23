'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Shield, Zap, Sparkles, FileText, BarChart3, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col selection:bg-primary-container selection:text-on-primary-container">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-6 lg:px-12 py-4 bg-surface/90 backdrop-blur-md border-b border-outline-variant">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-xs">
            <span className="material-symbols-outlined text-[22px] fill-icon">payments</span>
          </div>
          <span className="font-bold text-xl text-primary tracking-tight">PayPilot AI</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-on-surface-variant">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
          <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-low rounded-lg transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-sm font-semibold bg-primary text-on-primary rounded-lg shadow-sm hover:bg-on-primary-fixed-variant transition-all active:scale-95"
          >
            Start Free Trial
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-5xl px-6 pt-16 sm:pt-24 pb-16 flex flex-col items-center text-center relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container border border-outline-variant mb-6 shadow-xs">
            <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
            <span className="text-xs font-semibold text-on-surface">AI Accounts Receivable Management for Small Businesses</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-on-background max-w-3xl leading-[1.15] mb-6">
            Get Paid Faster. <span className="text-primary">Without Chasing</span> Clients Manually.
          </h1>

          <p className="text-base sm:text-xl text-on-surface-variant max-w-2xl mb-8 leading-relaxed">
            Automate accounts receivable with ethical, truthful AI payment reminders tailored to client accounts payable cycles. Recover original balances 14 days faster.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-md justify-center mb-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 bg-primary text-on-primary rounded-xl font-semibold text-base shadow-md hover:bg-on-primary-fixed-variant transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3.5 bg-surface border border-outline-variant text-on-surface rounded-xl font-semibold text-base hover:bg-surface-container-low transition-colors"
            >
              Explore Live Demo
            </Link>
          </div>

          <p className="text-xs text-outline">
            No credit card required • Instant 2-minute setup • Ethical & Halal-Compliant AR
          </p>

          {/* Hero Dashboard Preview Card */}
          <div className="mt-12 w-full max-w-4xl rounded-2xl border border-outline-variant bg-surface shadow-2xl p-4 sm:p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-outline-variant">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-error/60" />
                <div className="w-3 h-3 rounded-full bg-amber-400/60" />
                <div className="w-3 h-3 rounded-full bg-tertiary/60" />
                <span className="ml-2 text-xs font-medium text-outline">paypilot.ai/dashboard</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-tertiary-container/15 text-tertiary font-bold text-xs flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Live Receivables Engine
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-left">
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60">
                <p className="text-xs text-on-surface-variant font-medium">Outstanding Receivables</p>
                <p className="text-xl sm:text-2xl font-bold text-primary font-mono">$18,400</p>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60">
                <p className="text-xs text-on-surface-variant font-medium">Overdue Amount</p>
                <p className="text-xl sm:text-2xl font-bold text-error font-mono">$12,400</p>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60">
                <p className="text-xs text-on-surface-variant font-medium">Due This Week</p>
                <p className="text-xl sm:text-2xl font-bold text-on-surface font-mono">$6,000</p>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60">
                <p className="text-xs text-on-surface-variant font-medium">Payments Received</p>
                <p className="text-xl sm:text-2xl font-bold text-tertiary font-mono">$10,100</p>
              </div>
            </div>

            <div className="bg-surface-container-low p-4 rounded-xl border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary text-on-primary">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-on-surface">AI Timing Insight for Acme Corp ($4,800.00 Overdue)</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    "High likelihood of immediate settlement. Customer AP department opens batch approvals on Thursday."
                  </p>
                </div>
              </div>
              <Link
                href="/follow-up?invoiceId=inv-1"
                className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-on-primary-fixed-variant transition-colors shrink-0"
              >
                Send Truthful Follow-up
              </Link>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="w-full max-w-5xl px-6 py-20">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-on-background mb-3">
              Autopilot for your Accounts Receivable
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant">
              Stop losing billable hours chasing invoices across endless email threads. Let PayPilot AI automate collections with ethical, respectful communication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[24px]">smart_toy</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Truthful Multi-Tone Reminders</h3>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-4">
                Choose between Gentle Check-in, Professional Statement, Firm Follow-up, or Formal Notice. AI writes courteous copy that preserves client goodwill.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high text-tertiary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[24px]">monitoring</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Predictive Payout Intelligence</h3>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-4">
                Know when client finance teams disburse funds so your notices land at the exact right moment for scheduled batch inclusion.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[24px]">payments</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Direct 1-Click Settlement Rails</h3>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-4">
                Clients receive frictionless checkout links supporting direct ACH Bank Transfer, Visa, Mastercard, Apple Pay, and Google Pay.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Bottom Section */}
        <section className="w-full bg-surface-container-high border-t border-outline-variant py-20 px-6 text-center">
          <div className="max-w-2xl mx-auto flex flex-col items-center">
            <h2 className="text-3xl font-bold text-on-background mb-4">
              Ready to Accelerate Your Cash Flow?
            </h2>
            <p className="text-base text-on-surface-variant mb-8">
              Join thousands of contractors, agencies, and businesses getting paid 14 days faster on average.
            </p>
            <Link
              href="/signup"
              className="px-8 py-3.5 bg-primary text-on-primary rounded-xl font-semibold text-base shadow-md hover:bg-on-primary-fixed-variant transition-all active:scale-95"
            >
              Start Free Trial Now
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface border-t border-outline-variant py-8 px-6 lg:px-12 text-xs text-on-surface-variant flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-primary">PayPilot AI</span>
          <span>© 2026 PayPilot Inc. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/pricing" className="hover:underline">Pricing</Link>
          <Link href="/dashboard" className="hover:underline font-semibold text-primary">Demo App</Link>
        </div>
      </footer>
    </div>
  );
}
