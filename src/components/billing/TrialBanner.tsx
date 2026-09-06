'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Clock, AlertTriangle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function TrialBanner() {
  const { subscription } = useApp();

  if (!subscription || subscription.status !== 'trialing') {
    return null;
  }

  const trialEndStr = subscription.trialEndsAt || subscription.currentPeriodEnd;
  if (!trialEndStr) {
    return null;
  }

  const trialEndMs = new Date(trialEndStr).getTime();
  const remainingMs = trialEndMs - Date.now();

  // If expired, the hard block takeover takes precedence
  if (remainingMs <= 0) {
    return null;
  }

  const remainingHours = Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60)));
  const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
  const planName = subscription.selectedPlan || subscription.plan || 'Professional';
  const pricingUrl = `/pricing?plan=${encodeURIComponent(planName)}&from=trial_banner`;

  // CASE 1: Day 7 (Trial Ending Today / <= 24 Hours) — Urgent in-app banner
  if (remainingHours <= 24) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600/20 via-amber-600/15 to-red-600/10 border-2 border-red-500/40 rounded-2xl p-4 sm:p-5 shadow-lg animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-red-500/25 border border-red-500/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-white bg-red-600 px-2.5 py-0.5 rounded-full shadow-xs">
                  <Clock className="w-3 h-3" />
                  Trial Ending Today ({remainingHours > 0 ? `${remainingHours}h remaining` : 'Ending Soon'})
                </span>
                <span className="font-extrabold text-sm sm:text-base text-on-surface">
                  Your free trial ends today — subscribe to keep access
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1 max-w-2xl leading-relaxed">
                Your 7-day free trial concludes today. Subscribe now to maintain continuous operation of your dedicated AI Receptionist phone line, customer leads, and business tools without interruption.
              </p>
            </div>
          </div>
          <Link href={pricingUrl} className="shrink-0 w-full sm:w-auto">
            <Button
              variant="primary"
              size="sm"
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-extrabold gap-2 text-xs shadow-md py-2.5 px-5"
            >
              <span>Subscribe Now</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // CASE 2: Day 5 & 6 (2 Days Remaining / <= 48 Hours) — High-priority warning banner
  if (remainingDays <= 2) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-transparent border border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-md animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                  2 Days Remaining
                </span>
                <span className="font-extrabold text-sm sm:text-base text-on-surface">
                  Your free trial ends in 2 days — subscribe to keep access
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1 max-w-2xl">
                Lock in your {planName} plan to ensure your AI Receptionist, estimates, and automated customer triage remain active without disruption.
              </p>
            </div>
          </div>
          <Link href={pricingUrl} className="shrink-0 w-full sm:w-auto">
            <Button
              variant="primary"
              size="sm"
              className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-extrabold gap-2 text-xs shadow-xs py-2 px-4"
            >
              <span>Subscribe Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // CASE 3: Days 1–4 (> 2 Days Remaining) — Standard informative trial indicator
  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
              Free Trial
            </span>
            <span className="font-extrabold text-sm text-on-surface">
              {remainingDays} days remaining in your free trial
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Your {planName} features are unlocked. Upgrade anytime to ensure uninterrupted access.
          </p>
        </div>
      </div>
      <Link href={pricingUrl} className="shrink-0">
        <Button variant="primary" size="sm" className="font-bold gap-1.5 text-xs shadow-xs">
          <span>Upgrade Plan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </Link>
    </div>
  );
}
