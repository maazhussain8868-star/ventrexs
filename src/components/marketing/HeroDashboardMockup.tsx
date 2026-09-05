'use client';

import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Clock,
  User,
  Bot,
  CreditCard,
} from 'lucide-react';

export default function HeroDashboardMockup() {
  const [activeTab, setActiveTab] = useState<'receptionist' | 'crm' | 'invoicing'>('receptionist');
  const [callTimer, setCallTimer] = useState(38);
  const [waveformStep, setWaveformStep] = useState(0);

  // Active call duration timer loop
  useEffect(() => {
    const interval = setInterval(() => {
      setCallTimer((prev) => (prev >= 90 ? 25 : prev + 1));
      setWaveformStep((prev) => (prev + 1) % 4);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl bg-gradient-to-b from-[#0F172A] via-[#090D1A] to-[#050812] border border-blue-500/20 shadow-[0_20px_70px_rgba(37,99,235,0.25)] overflow-hidden transition-all duration-300">
      {/* Top Browser / Window Control Bar */}
      <div className="px-4 py-3 bg-[#0A1020]/90 border-b border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="hidden sm:inline-block ml-3 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-400">
            https://app.ventrexs.com/operations/live
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>AI Receptionist Online</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400 hidden md:inline-block">
            DID: +1 (888) 524-7890
          </span>
        </div>
      </div>

      {/* Main App Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
        {/* Left Navigation Rail (Desktop) */}
        <div className="hidden md:flex md:col-span-3 flex-col justify-between p-4 bg-[#080C18]/60 border-r border-slate-800/80 text-xs font-medium">
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase text-slate-500 px-3 py-1">
              Live Modules
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('receptionist')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left ${
                activeTab === 'receptionist'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <PhoneCall className="w-4 h-4 text-cyan-400" />
              <span>AI Receptionist</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('crm')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left ${
                activeTab === 'crm'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <User className="w-4 h-4 text-indigo-400" />
              <span>Customer CRM</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('invoicing')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left ${
                activeTab === 'invoicing'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Invoicing & Pay</span>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Today's Calls</span>
              <span className="font-bold text-white">47 / 47</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-emerald-400" />
            </div>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              0 Missed Customers
            </p>
          </div>
        </div>

        {/* Center Dynamic Stage */}
        <div className="md:col-span-9 p-4 sm:p-6 flex flex-col justify-between space-y-4">
          {/* Header Metric Strip */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Monthly Revenue</span>
              <span className="text-base sm:text-lg font-bold text-white mt-0.5">$38,420</span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5 mt-0.5">
                <TrendingUp className="w-3 h-3" /> +24% vs last mo
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Avg Response</span>
              <span className="text-base sm:text-lg font-bold text-cyan-400 mt-0.5">1.4s</span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">24/7 Zero Latency</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Auto-Collected</span>
              <span className="text-base sm:text-lg font-bold text-emerald-400 mt-0.5">100%</span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">0% Debt / Interest</span>
            </div>
          </div>

          {/* Active Interactive Card: Live AI Receptionist Call in Progress */}
          {activeTab === 'receptionist' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0E1628] to-[#0A0F1E] border border-blue-500/30 space-y-4 shadow-lg">
              {/* Call Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-cyan-300">
                      <PhoneCall className="w-5 h-5 animate-pulse" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0E1628]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">Sarah Jenkins</h4>
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-mono font-bold">
                        EMERGENCY DISPATCH
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">+1 (512) 489-3312 • Austin, TX</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 font-mono text-xs text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {formatTime(callTimer)}
                  </span>
                  {/* Dynamic Voice Waveform Bars */}
                  <div className="flex items-center gap-0.5 h-5 px-2 bg-slate-900 rounded-lg border border-slate-700/80">
                    {[12, 18, 8, 22, 16, 24, 10, 20].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 bg-cyan-400 rounded-full transition-all duration-300"
                        style={{
                          height: `${Math.max(4, (h * (((waveformStep + i) % 5) + 1)) / 5)}px`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Real-Time Conversation Transcript Stream */}
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="font-semibold text-slate-300">Customer (Sarah)</span>
                    <span>Just now</span>
                  </div>
                  <p className="text-slate-200">
                    "Hi, our rooftop AC unit just started leaking water into our commercial kitchen. Can someone come out today?"
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-cyan-300 font-mono">
                    <span className="font-semibold flex items-center gap-1">
                      <Bot className="w-3.5 h-3.5" /> Ventrexs AI Receptionist
                    </span>
                    <span>AI Autonomous Response</span>
                  </div>
                  <p className="text-blue-100">
                    "I completely understand how urgent that is! I've flagged this for priority emergency dispatch. We have technician Dave available at 2:30 PM today. Would you like me to book that slot for you now?"
                  </p>
                </div>
              </div>

              {/* Bottom Quick Action Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] font-mono text-slate-400 border-t border-slate-800/80">
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Calendar Appointment Held
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  Trade: HVAC Emergency
                </span>
              </div>
            </div>
          )}

          {/* Tab 2: Autonomous CRM Lead Profile */}
          {activeTab === 'crm' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0E1628] to-[#0A0F1E] border border-indigo-500/30 space-y-4 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-white">Austin Tech Hub Inc.</h4>
                  <p className="text-xs text-slate-400 font-mono">Commercial Account • Priority Customer</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold">
                  Lead Score: 98/100 (Hot)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400">Total Lifetime Value</span>
                  <p className="font-bold text-emerald-400 text-sm">$14,280.00</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400">Equipment On File</span>
                  <p className="font-bold text-slate-200 text-sm">Carrier Rooftop 15-Ton</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1">
                <span className="text-[10px] font-mono text-slate-400">AI Call History Summary</span>
                <p className="text-slate-300">
                  4 prior service calls successfully resolved. Payment method on file (Stripe Card). Automated follow-up SMS scheduled for 24h post-completion.
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Halal-First Instant Invoicing & Stripe Payment */}
          {activeTab === 'invoicing' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0E1628] to-[#0A0F1E] border border-emerald-500/30 space-y-4 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-white">Invoice #INV-2026-084</h4>
                  <p className="text-xs text-slate-400 font-mono">Sarah Jenkins • Commercial Rooftop Repair</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> PAID VIA STRIPE
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400">Total Settled Amount</span>
                  <div className="text-xl font-extrabold text-white mt-0.5">$1,450.00</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-emerald-400">Instant Deposit Confirmed</span>
                  <div className="text-xs text-slate-400 font-mono">0% Interest • 0 Penalties</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  SMS & Email Receipt Dispatched Automatically
                </span>
                <span className="text-[10px] font-mono text-slate-400">10:42 AM</span>
              </div>
            </div>
          )}

          {/* Dynamic Feed Ticker: Bottom Live Notifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="text-slate-200 font-semibold truncate">$1,450 Invoice auto-collected</p>
                <p className="text-[10px] text-slate-400 font-mono">Stripe • 4m ago</p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="text-slate-200 font-semibold truncate">Google Review Request Sent</p>
                <p className="text-[10px] text-slate-400 font-mono">SMS Cadence • 12m ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
