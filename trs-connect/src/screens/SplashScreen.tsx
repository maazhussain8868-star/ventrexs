import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useI18n } from '../context/I18nContext';
import { Shield, Sparkles, ArrowRight } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const { navigateTo, isAuthenticated } = useApp();
  const { t } = useI18n();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigateTo('home');
      } else {
        navigateTo('onboarding');
      }
    }, 2400);

    return () => clearTimeout(timer);
  }, [isAuthenticated, navigateTo]);

  return (
    <div
      onClick={() => navigateTo(isAuthenticated ? 'home' : 'onboarding')}
      className="min-h-[750px] flex-1 bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-950 text-white flex flex-col items-center justify-between p-8 relative overflow-hidden cursor-pointer select-none"
    >
      {/* Background Decorative Rings */}
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-emerald-700/30 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

      {/* Top Tag */}
      <div className="pt-8 flex flex-col items-center gap-1 text-center z-10 animate-fade-in">
        <span className="px-3.5 py-1 rounded-full bg-white/10 text-amber-300 border border-amber-400/30 text-[11px] font-bold tracking-widest uppercase">
          Official Organization App
        </span>
      </div>

      {/* Center Emblem & Branding */}
      <div className="flex flex-col items-center text-center z-10 my-auto">
        <div className="relative mb-6">
          {/* Outer glowing ring */}
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 p-1 shadow-2xl shadow-emerald-950/60 animate-pulse">
            <div className="w-full h-full rounded-[22px] bg-emerald-800 flex items-center justify-center p-2 border-2 border-emerald-700">
              <div className="flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-amber-400 tracking-tighter">TRS</span>
                <span className="text-[10px] font-extrabold text-emerald-100 tracking-widest -mt-1">
                  CONNECT
                </span>
              </div>
            </div>
          </div>
          {/* Accent badge */}
          <div className="absolute -bottom-2 -right-2 bg-amber-400 text-emerald-950 p-1.5 rounded-full shadow-lg">
            <Sparkles className="w-4 h-4 fill-emerald-950" />
          </div>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md">
          TRS CONNECT
        </h1>
        <p className="text-amber-300 text-sm font-semibold mt-1">
          {t('appTagline')}
        </p>

        <div className="w-12 h-1 bg-amber-400 rounded-full my-4" />

        <p className="text-emerald-100/80 text-xs max-w-xs font-normal leading-relaxed">
          Voluntary Membership • Youth Activities • Grievance Redressal • Local Action
        </p>
      </div>

      {/* Bottom Loading Indicator */}
      <div className="pb-6 flex flex-col items-center gap-4 z-10 w-full">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-200">
          <span>Tap anywhere to continue</span>
          <ArrowRight className="w-4 h-4 animate-pulse" />
        </div>

        <div className="w-36 h-1.5 bg-emerald-950/60 rounded-full overflow-hidden p-0.5 border border-white/10">
          <div className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full animate-pulse w-3/4" />
        </div>

        <p className="text-[10px] text-emerald-300/60 font-medium">
          Authorized Citizen Engagement Platform
        </p>
      </div>
    </div>
  );
};
