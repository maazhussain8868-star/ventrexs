'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Lock, Activity } from 'lucide-react';

interface AdminHeaderProps {
  userEmail?: string | null;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ userEmail }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#070b14] border-b border-outline-variant/50 text-white select-none">
      {/* Top Banner */}
      <div className="bg-[#0c101d] px-4 py-2 border-b border-outline-variant/30 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-mono">
          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-extrabold tracking-wider uppercase border border-purple-500/30 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-purple-400" /> PRIVATE PLATFORM ADMIN
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            admin.ventrexs.com • Authorized Identities Only
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>99.99% SYSTEM SLA</span>
          </div>

          <span className="text-slate-400 font-mono text-[11px] hidden md:inline">
            {userEmail || 'owner1@ventrexs.com'}
          </span>

          <Link
            href="/dashboard"
            className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Customer View</span>
            <ArrowRight className="w-3 h-3 text-primary" />
          </Link>
        </div>
      </div>

      {/* Main Admin Nav Title */}
      <div className="px-6 h-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white">
              VENTREXS ENTERPRISE CONTROL
            </span>
            <span className="text-[10px] text-slate-400 font-mono block leading-none mt-0.5">
              Unified Platform Management & Ledger Observability
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono text-slate-400">
            Active Cluster: US-East Multi-Tenant
          </span>
        </div>
      </div>
    </header>
  );
};
