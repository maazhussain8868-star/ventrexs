'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Lock, Search, Bell, Activity, CheckCircle2 } from 'lucide-react';

interface AdminHeaderProps {
  userEmail?: string | null;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ userEmail }) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/90 text-slate-900 shadow-xs select-none">
      {/* Top Private Platform Admin Bar */}
      <div className="bg-slate-900 text-white px-4 lg:px-6 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-mono">
          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold tracking-wider uppercase border border-indigo-400/30 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-indigo-400" /> PRIVATE PLATFORM ADMIN
          </span>
          <span className="text-[11px] text-slate-300 hidden sm:inline">
            admin.ventrexs.com • Authorized Identities Only
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>99.99% PLATFORM SLA</span>
          </div>

          <span className="text-slate-300 font-mono text-[11px] hidden md:inline">
            {userEmail || 'owner1@ventrexs.com'}
          </span>

          <Link
            href="/dashboard"
            className="text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1 transition-colors pl-2 border-l border-slate-700"
          >
            <span>Customer View</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
          </Link>
        </div>
      </div>

      {/* Main Header Nav */}
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-sm shadow-indigo-600/20">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 leading-none">
                VENTREXS
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 tracking-wider uppercase">
                ENTERPRISE CONTROL
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
              Unified Platform Management & Ledger Observability
            </p>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-lg hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search businesses, users, subscriptions, payments..."
              className="w-full pl-10 pr-12 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white text-[10px] font-mono text-slate-400 border border-slate-200 shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Status & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>US-East Cluster</span>
          </div>

          <button
            type="button"
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
            title="System Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600" />
          </button>
        </div>
      </div>
    </header>
  );
};
