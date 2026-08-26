'use client';

import React from 'react';
import Link from 'next/link';
import {
  Zap,
  ArrowLeft,
  Shield,
  FileText,
  Lock,
  Calendar,
  Printer,
  ChevronRight,
  ExternalLink,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { BRAND } from '@/config/brand';

interface LegalLayoutProps {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  effectiveDate?: string;
  version?: string;
  category?: string;
  children: React.ReactNode;
}

const legalNavLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Subscription Terms', href: '/subscription-terms' },
  { label: 'Refund Policy', href: '/refund-policy' },
  { label: 'Data Processing (DPA)', href: '/dpa' },
  { label: 'Security Overview', href: '/security' },
  { label: 'Acceptable Use', href: '/acceptable-use' },
  { label: 'IP & DMCA Policy', href: '/ip-policy' },
  { label: 'Data Retention', href: '/data-retention' },
  { label: 'Service Level (SLA)', href: '/sla' },
  { label: 'Account Deletion', href: '/account-deletion' },
];

export default function LegalLayout({
  title,
  subtitle,
  lastUpdated = 'August 24, 2026',
  effectiveDate = 'August 24, 2026',
  version = 'v2.4',
  category = 'Legal & Regulatory Compliance',
  children,
}: LegalLayoutProps) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#050812] text-slate-100 flex flex-col font-sans selection:bg-blue-600/30 selection:text-blue-200">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full bg-[#050812]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition-all shadow-sm group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Home</span>
            </Link>

            <div className="hidden sm:block h-5 w-px bg-slate-800" />

            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                <Zap className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">
                {BRAND.shortName} <span className="text-blue-400">AI</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Print document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>

            <Link
              href="/login"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md transition-colors"
            >
              <span>App Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Sidebar / Quick Links */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="sticky top-24 space-y-5">
              <div className="bg-[#0B1220] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                  <FileText className="w-4 h-4" />
                  <span>Compliance Center</span>
                </div>
                <nav className="flex flex-col space-y-1">
                  {legalNavLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors flex items-center justify-between group"
                    >
                      <span>{item.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Data Protection / Contact Box */}
              <div className="bg-[#0B1220] border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Legal & DPO Contact</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  For privacy requests, GDPR/CCPA data export, or deletion inquiries:
                </p>
                <div className="space-y-1.5 text-xs">
                  <a
                    href={`mailto:${BRAND.privacyEmail}`}
                    className="text-blue-400 hover:underline flex items-center gap-1.5 font-mono text-[11px]"
                  >
                    <Mail className="w-3 h-3" />
                    {BRAND.privacyEmail}
                  </a>
                  <a
                    href={`mailto:${BRAND.supportEmail}`}
                    className="text-blue-400 hover:underline flex items-center gap-1.5 font-mono text-[11px]"
                  >
                    <Mail className="w-3 h-3" />
                    {BRAND.supportEmail}
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Document Content */}
          <article className="lg:col-span-9 bg-[#0B1220]/70 border border-slate-800 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl backdrop-blur-sm">
            {/* Header / Badges */}
            <div className="border-b border-slate-800 pb-8 mb-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <FileText className="w-3.5 h-3.5" />
                  {category}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800">
                  {version}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {title}
              </h1>

              {subtitle && (
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  {subtitle}
                </p>
              )}

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                <span>Last Updated: {lastUpdated}</span>
                <span>•</span>
                <span>Developer: {BRAND.legalName}</span>
                <span>•</span>
                <span>Jurisdiction: Delaware, United States</span>
              </div>
            </div>

            {/* Legal Body Markdown / HTML */}
            <div className="prose prose-invert max-w-none space-y-8 text-slate-300 text-xs sm:text-sm leading-relaxed">
              {children}
            </div>

            {/* Bottom Acknowledgement / Footer */}
            <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Google Play Data Safety & GDPR/CCPA Compliant</span>
              </div>
              <p className="text-slate-500 font-mono text-[11px]">
                © {new Date().getFullYear()} {BRAND.legalName}. All rights reserved.
              </p>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
