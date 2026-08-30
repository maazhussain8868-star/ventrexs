'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Bot,
  Kanban,
  FileText,
  Clock,
  CheckCircle2,
  Lock,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';

export default function DemoGatewayPage() {
  const router = useRouter();
  const { enterDemoMode } = useApp();

  const handleLaunchDemo = () => {
    // Immediate entry into isolated demo workspace
    enterDemoMode();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#050812] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-xl z-10">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold shadow-xs">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Instant Public Demo • Zero Approval Required</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">Ventrexs AI</span> Live
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Experience our AI-powered service business operations platform in a completely safe, isolated demo environment with realistic pre-loaded data.
          </p>
        </div>

        {/* Demo Overview Card */}
        <div className="bg-[#0A1020]/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Highlight badges */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 bg-[#0D1528] rounded-2xl border border-slate-800/80 flex items-start gap-2.5">
              <Bot className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">AI Receptionist</span>
                <span className="text-[11px] text-slate-400">24/7 lead intake & triage</span>
              </div>
            </div>

            <div className="p-3 bg-[#0D1528] rounded-2xl border border-slate-800/80 flex items-start gap-2.5">
              <Kanban className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Contractor CRM</span>
                <span className="text-[11px] text-slate-400">Pipeline & dispatch board</span>
              </div>
            </div>

            <div className="p-3 bg-[#0D1528] rounded-2xl border border-slate-800/80 flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Smart Invoicing</span>
                <span className="text-[11px] text-slate-400">Halal non-interest billing</span>
              </div>
            </div>

            <div className="p-3 bg-[#0D1528] rounded-2xl border border-slate-800/80 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Safe Read-Only</span>
                <span className="text-[11px] text-slate-400">Zero live payment charges</span>
              </div>
            </div>
          </div>

          {/* Demo Tenant Context Notice */}
          <div className="p-3.5 bg-blue-950/30 rounded-2xl border border-blue-800/40 text-xs text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px] uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" /> Isolated Demo Tenant (Apex Comfort HVAC)
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              You are exploring realistic fictional data for an HVAC contractor. No credit card, account registration, or administrative approval is needed.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col gap-3">
            <Link
              href="/test-receptionist"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-blue-600/30 border border-blue-400/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 text-center"
            >
              <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
              <span>Test AI Receptionist Live (Voice Demo)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleLaunchDemo}
              className="w-full text-sm font-semibold bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-slate-200 hover:text-white py-3.5 rounded-xl cursor-pointer"
              rightIcon={<ArrowRight className="w-4 h-4 text-slate-400" />}
            >
              Explore Full Workspace Sandbox
            </Button>
          </div>

          {/* Alternative links */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <Link href="/" className="hover:text-white transition-colors">
              &larr; Back to Homepage
            </Link>
            <Link href="/pricing" className="text-blue-400 hover:underline font-semibold">
              View Commercial Plans &rarr;
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-[11px] text-slate-500 font-mono">
          Ventrexs AI &bull; Production Preview Sandbox &bull; &copy; {new Date().getFullYear()} Desynthic
        </div>
      </div>
    </div>
  );
}
