'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, RotateCcw, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Logo } from '@/components/ui/Logo';

import { ConversionTracker } from '@/lib/analytics/conversion-tracker';
import { PLANS_CONFIG, PlanKey } from '@/lib/billing/types';

/**
 * /billing/success
 *
 * Landing page after Stripe checkout success.
 * For Razorpay, users land here AFTER /api/billing/verify has confirmed the payment.
 *
 * This page:
 * 1. Polls AppContext subscription status until it becomes 'active'
 * 2. Fires purchase & subscription_started conversions once confirmed
 * 3. Shows success UI
 * 4. Redirects to /dashboard once subscription is confirmed server-side
 */
export default function BillingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { subscription, refreshSubscription } = useApp();

  const plan = searchParams.get('plan') || '';
  const isActivated = searchParams.get('activated') === 'true';
  const sessionId = searchParams.get('session_id') || searchParams.get('razorpay_order_id') || subscription?.id || 'sub_success';
  const planKey = (plan || subscription?.plan || 'Starter') as PlanKey;
  const cycle = (subscription?.billingCycle || 'monthly') as 'monthly' | 'annual';
  const price = cycle === 'annual'
    ? (PLANS_CONFIG[planKey]?.priceAnnual || 290)
    : (PLANS_CONFIG[planKey]?.priceMonthly || 29);

  const [status, setStatus] = useState<'verifying' | 'success' | 'timeout'>(
    isActivated ? 'success' : 'verifying'
  );
  const [pollCount, setPollCount] = useState(0);
  const MAX_POLLS = 20;
  const POLL_INTERVAL_MS = 2500;

  useEffect(() => {
    const isTrialValid =
      subscription?.status === 'trialing' &&
      Boolean(
        subscription?.currentPeriodEnd &&
        new Date(subscription.currentPeriodEnd).getTime() > Date.now()
      );

    // If subscription is already active on mount or arrived from verified route, go straight to success
    if (isActivated || subscription?.status === 'active' || isTrialValid) {
      setStatus('success');
      return;
    }

    // Actively refresh subscription from DB and poll until active or timeout
    let timer: ReturnType<typeof setTimeout>;
    let count = 0;
    let isCancelled = false;

    const poll = async () => {
      if (isCancelled) return;
      count++;
      setPollCount(count);

      try {
        await refreshSubscription();
      } catch {
        // Non-blocking
      }

      const currentStatus = subscription?.status;
      const isNowTrialValid =
        currentStatus === 'trialing' &&
        Boolean(
          subscription?.currentPeriodEnd &&
          new Date(subscription.currentPeriodEnd).getTime() > Date.now()
        );

      if (currentStatus === 'active' || isNowTrialValid) {
        setStatus('success');
        return;
      }

      if (count >= MAX_POLLS) {
        setStatus('timeout');
        return;
      }

      timer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    timer = setTimeout(poll, 1500);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [isActivated, refreshSubscription, subscription?.status]);

  // Track conversion and redirect to dashboard after confirming success
  useEffect(() => {
    if (status === 'success') {
      ConversionTracker.trackPurchase({
        transaction_id: sessionId,
        plan: planKey,
        billing_cycle: cycle,
        value: price,
        currency: 'USD',
      });
      ConversionTracker.trackSubscriptionStarted({
        plan: planKey,
        billing_cycle: cycle,
        value: price,
      });

      const timer = setTimeout(() => {
        router.replace('/dashboard');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, sessionId, planKey, cycle, price, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 font-sans">
      {/* Logo */}
      <div className="mb-8">
        <Logo href="/" variant="full" size="md" theme="light" />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 max-w-sm w-full text-center">
        {status === 'verifying' && (
          <>
            <RotateCcw className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="font-black text-xl text-slate-900">Confirming Payment</h2>
            <p className="text-sm text-slate-500 mt-2">
              Verifying your payment with our servers…
            </p>
            <p className="text-xs text-slate-400 mt-3">
              Check {pollCount}/{MAX_POLLS} — this usually takes 5–15 seconds
            </p>
            <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((pollCount / MAX_POLLS) * 100, 95)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-3">
              Do not refresh this page. Your payment is being confirmed securely.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="font-black text-xl text-slate-900">Subscription Activated!</h2>
            <p className="text-sm text-slate-500 mt-2">
              {plan ? `Your ${plan} plan is now active.` : 'Your subscription is now active.'}
              {' '}Welcome to Ventrexs AI!
            </p>
            <p className="text-xs text-slate-400 mt-3">
              Redirecting to your dashboard in 3 seconds…
            </p>
            <button
              onClick={() => router.replace('/dashboard')}
              className="mt-4 w-full py-2.5 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {status === 'timeout' && (
          <>
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
            <h2 className="font-black text-xl text-slate-900">Verification Taking Longer</h2>
            <p className="text-sm text-slate-500 mt-2">
              Your payment may have been received, but confirmation is taking longer than usual.
              This can happen with webhook delays.
            </p>
            <p className="text-xs text-slate-400 mt-3">
              If payment was deducted from your account, your subscription will activate automatically
              once we receive confirmation. Please allow up to 5 minutes.
            </p>
            <div className="flex flex-col gap-2 mt-5">
              <button
                onClick={() => {
                  setPollCount(0);
                  setStatus('verifying');
                }}
                className="w-full py-2.5 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700"
              >
                Check Again
              </button>
              <button
                onClick={() => router.replace('/billing')}
                className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                Back to Plans
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
