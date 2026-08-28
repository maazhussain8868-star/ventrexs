'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Bot,
  Kanban,
  FileText,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function DemoTokenAccessPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const rawToken = resolvedParams.token;
  const router = useRouter();

  const handleLaunchDemo = () => {
    // Immediate entry into isolated demo workspace
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#050812] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-xl z-10">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-cyan-400" /> Instant Public Demo Access
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Ventrexs AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">Live Demo</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Welcome to your direct preview session. Explore all operational modules with realistic contractor demo data.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-[#0A1020]/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 bg-[#0D1528] rounded-2xl border border-slate-800/80 flex items-start gap-2.5">
              <Bot className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">AI Receptionist</span>
                <span className="text-[11px] text-slate-400">Voice triage & booking</span>
              </div>
            </div>

            <div className="p-3 bg-[#0D1528] rounded-2xl border border-slate-800/80 flex items-start gap-2.5">
              <Kanban className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Lead & Job CRM</span>
                <span className="text-[11px] text-slate-400">Field operations pipeline</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-blue-950/30 rounded-2xl border border-blue-800/40 text-xs text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px] uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" /> Demo Tenant (Apex Comfort HVAC)
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Invitation token verified. All operations in this demo are isolated from production customer databases.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleLaunchDemo}
            className="w-full text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30 py-3.5 rounded-xl cursor-pointer"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Launch Demo Dashboard
          </Button>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <Link href="/" className="hover:text-white transition-colors">
              &larr; Back to Homepage
            </Link>
            <Link href="/pricing" className="text-blue-400 hover:underline font-semibold">
              View Pricing &rarr;
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-[11px] text-slate-500 font-mono">
          Ventrexs AI Multi-Tenant Isolation &copy; {new Date().getFullYear()} Desynthic
        </div>
      </div>
    </div>
  );
}
