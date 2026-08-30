import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Navbar from '@/components/marketing/Navbar';
import PublicReceptionistDemo from '@/components/receptionist/PublicReceptionistDemo';

export const metadata: Metadata = {
  title: 'Test AI Receptionist Live | Ventrexs AI',
  description:
    'Experience Ventrexs AI Receptionist live for your HVAC, Plumbing, Roofing, Electrical, or Cleaning business. Test real voice conversations, lead qualification, and scheduling with zero signup.',
  openGraph: {
    title: 'Test AI Receptionist Live | Ventrexs AI',
    description:
      'Test Ventrexs voice-enabled AI receptionist for US service businesses. Fast, realistic, and zero account required.',
  },
};

export default function TestReceptionistPage() {
  return (
    <div className="min-h-screen bg-[#050812] text-slate-100 flex flex-col selection:bg-blue-600/30 selection:text-blue-200 overflow-x-hidden font-sans">
      {/* Sticky Marketing Navbar */}
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
        {/* Ambient background glows */}
        <div className="absolute top-10 left-1/4 w-[600px] h-[350px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none -z-10" />
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[300px] bg-gradient-to-t from-cyan-600/10 via-blue-600/5 to-transparent blur-[130px] pointer-events-none -z-10" />

        {/* Public Demo Container */}
        <Suspense fallback={<div className="text-center py-20 text-slate-400 font-mono text-sm">Loading AI Receptionist Demo...</div>}>
          <PublicReceptionistDemo />
        </Suspense>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-slate-800/80 py-6 px-4 text-center text-xs text-slate-400 font-mono">
        <span>© {new Date().getFullYear()} Ventrexs AI. Production-Ready Business Operations Platform.</span>
      </footer>
    </div>
  );
}
