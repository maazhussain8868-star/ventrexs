'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Lock, Search, Bell, Menu } from 'lucide-react';

interface AdminHeaderProps {
  userEmail?: string | null;
  onToggleMobileMenu?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ userEmail, onToggleMobileMenu }) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/90 text-slate-900 shadow-xs select-none">
      {/* Top Private Platform Admin Bar */}
      <div className="bg-slate-900 text-white px-3 sm:px-4 lg:px-6 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-mono min-w-0">
          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold tracking-wider uppercase border border-indigo-400/30 flex items-center gap-1 shrink-0">
            <ShieldCheck className="w-3 h-3 text-indigo-400" /> PRIVATE PLATFORM ADMIN
          </span>
          <span className="text-[11px] text-slate-300 hidden md:inline truncate">
            admin.ventrexs.com • Authorized Identities Only
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">99.99% SLA</span>
            <span className="sm:hidden">SLA 99.9%</span>
          </div>

          <span className="text-slate-300 font-mono text-[11px] hidden lg:inline truncate max-w-[160px]">
            {userEmail || 'owner1@ventrexs.com'}
          </span>

          <Link
            href="/dashboard"
            className="text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1 transition-colors pl-2 border-l border-slate-700 min-h-[36px]"
          >
            <span className="hidden sm:inline">Customer View</span>
            <span className="sm:hidden">Exit</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
          </Link>
        </div>
      </div>

      {/* Main Header Nav */}
      <div className="px-3 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Mobile Menu + Brand Identity */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open Admin Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link href="/admin" className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-sm shadow-indigo-600/20 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 leading-none">
                  VENTREXS
                </span>
                <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 tracking-wider uppercase hidden xs:inline">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-tight mt-0.5 truncate hidden sm:block">
                Unified Platform Operations & Telemetry
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-lg hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search platform resources, businesses, audit logs..."
              className="w-full pl-10 pr-12 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white text-[10px] font-mono text-slate-400 border border-slate-200 shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Status & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-mono text-[11px]">US-East Pod</span>
          </div>

          <button
            type="button"
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="System Alerts"
            aria-label="System Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-indigo-600" />
          </button>
        </div>
      </div>
    </header>
  );
};
