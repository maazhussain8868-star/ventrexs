import React from 'react';

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 rounded-2xl border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
        <p className="text-xs font-mono text-slate-400 tracking-wider uppercase">Loading Ventrexs AI...</p>
      </div>
    </div>
  );
}
