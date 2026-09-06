'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { createClient } from '@/lib/supabase/client';
import { 
  Lock, 
  ArrowRight, 
  LogOut, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles,
  PhoneCall,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

interface ExpiredTrialBlockerProps {
  isStandalonePage?: boolean;
}

export function ExpiredTrialBlocker({ isStandalonePage = false }: ExpiredTrialBlockerProps) {
  const router = useRouter();
  const { subscription, profile, businessProfile } = useApp();
  const supabase = createClient();

  // Block Escape key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  const planName = subscription?.selectedPlan || subscription?.plan || 'Professional';
  const targetPricingUrl = `/pricing?plan=${encodeURIComponent(planName)}&reason=trial_expired&from=trial_expired`;

  const handleSubscribeNow = () => {
    router.push(targetPricingUrl);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
    router.push('/login');
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#070b14]/98 backdrop-blur-2xl flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto selection:bg-red-500/30`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="expired-trial-title"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg bg-surface-container-lowest/90 border border-outline-variant/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Brand mark & Lock badge */}
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
          <Logo href="#" variant="icon" size="sm" />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-red-500/15 text-red-500 border border-red-500/30">
            <Lock className="w-3 h-3" />
            Trial Expired
          </span>
        </div>

        {/* Hero Alert Graphic */}
        <div className="relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-b from-red-500/20 to-red-500/5 border border-red-500/30 flex items-center justify-center text-red-500 shadow-inner">
          <ShieldAlert className="w-10 h-10 animate-pulse" />
          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-black shadow-md">
            !
          </div>
        </div>

        {/* Clear Headline & Context */}
        <div className="space-y-2">
          <h1 id="expired-trial-title" className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
            Your 7-day free trial has ended
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Your 7-day trial period has concluded. To keep accessing your workspace and maintain uninterrupted operation of your dedicated AI Receptionist, CRM pipeline, and field dispatching, activate your plan now.
          </p>
        </div>

        {/* Value Preservation Summary */}
        <div className="bg-surface-container-low/60 rounded-2xl p-4 border border-outline-variant/60 text-left space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
            <Database className="w-4 h-4 text-emerald-500" />
            <span>100% of your workspace data is securely saved</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <PhoneCall className="w-4 h-4 text-primary" />
            <span>AI Receptionist phone line & customer lead inbox</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Estimates, work orders & automated follow-ups</span>
          </div>
          <p className="text-[11px] text-outline pt-1 border-t border-outline-variant/30 italic">
            Zero-usage policy: Trial expiration applies automatically regardless of whether call minutes or SMS credits were consumed.
          </p>
        </div>

        {/* Primary & Secondary Actions */}
        <div className="space-y-3 pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={handleSubscribeNow}
            className="w-full font-extrabold text-sm py-3.5 gap-2 shadow-xl bg-primary hover:bg-primary/90 text-on-primary rounded-xl"
          >
            <span>Subscribe Now ({planName} Plan)</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface py-2 transition-colors rounded-lg"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log out of account</span>
          </button>
        </div>

        <p className="text-[11px] text-outline text-center">
          Questions about plans? Reach our billing concierge at{' '}
          <a href="mailto:billing@ventrexs.com" className="text-primary hover:underline">
            billing@ventrexs.com
          </a>
        </p>
      </div>
    </div>
  );
}
