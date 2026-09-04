import React from 'react';
import { useApp } from '../../context/AppContext';
import { Smartphone, Monitor, Sparkles } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const { isMobileFrame, toggleMobileFrame } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Desktop Simulator Control Bar */}
      <div className="w-full hidden md:flex items-center justify-between px-6 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-300 z-50">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-bold text-white tracking-wide">TRS CONNECT PWA</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Telangana Civic & Youth Engagement Engine</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400">Preview Mode:</span>
          <button
            onClick={toggleMobileFrame}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${
              isMobileFrame
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Device (390px)</span>
          </button>
          <button
            onClick={toggleMobileFrame}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${
              !isMobileFrame
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Full Viewport</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="w-full flex-1 flex justify-center items-start md:py-6 overflow-x-hidden">
        {isMobileFrame ? (
          <div className="relative w-full max-w-[430px] md:min-h-[860px] md:rounded-[44px] md:border-[10px] md:border-slate-800 md:shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_40px_rgba(13,122,62,0.2)] bg-slate-50 overflow-hidden flex flex-col">
            {/* Simulated Smartphone Notch / Dynamic Island */}
            <div className="hidden md:flex items-center justify-between px-7 pt-3 pb-1 bg-emerald-800 text-white select-none">
              <span className="text-xs font-semibold">9:41</span>
              <div className="w-24 h-4 bg-slate-900 rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-700 ml-auto mr-3" />
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold">
                <span>5G</span>
                <div className="w-4 h-2.5 border border-white rounded-xs p-0.5">
                  <div className="w-full h-full bg-white rounded-2xs" />
                </div>
              </div>
            </div>

            {/* Application Inside Device */}
            <div className="flex-1 overflow-y-auto flex flex-col bg-slate-50 text-slate-900 no-scrollbar">
              {children}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-2xl min-h-screen bg-slate-50 text-slate-900 flex flex-col shadow-2xl">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
