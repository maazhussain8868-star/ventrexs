'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { PLANS_CONFIG, PlanKey, BillingInterval } from '@/lib/billing/types';
import {
  Check,
  Zap,
  Shield,
  CreditCard,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { saveSelectedPlanAction } from '@/app/actions/checkout';
import { startFreeTrialAction } from '@/app/actions/billing';
import { ConversionTracker } from '@/lib/analytics/conversion-tracker';

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, businessProfile, subscription, showToast, refreshSubscription } = useApp();

  const planFromUrl = searchParams.get('plan') as PlanKey | null;
  const initialPlan: PlanKey = planFromUrl && (planFromUrl in PLANS_CONFIG) ? planFromUrl : 'Professional';
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>(initialPlan);
  const [billingCycle, setBillingCycle] = useState<BillingInterval>('monthly');
  const [gateway, setGateway] = useState<'razorpay' | 'stripe'>('razorpay');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);
  const [isStartingTrial, setIsStartingTrial] = useState(false);

  useEffect(() => {
    if (planFromUrl && (planFromUrl in PLANS_CONFIG)) {
      setSelectedPlan(planFromUrl);
    }
  }, [planFromUrl]);

  // Show cancellation message if returning from payment provider
  const cancelled = searchParams.get('cancelled') === 'true';
  const failed = searchParams.get('failed') === 'true';

  useEffect(() => {
    if (cancelled) {
      showToast({
        title: 'Payment Cancelled',
        description: 'You cancelled checkout. Your subscription has not been activated. Choose a plan to try again.',
        type: 'info',
      });
    }
    if (failed) {
      showToast({
        title: 'Payment Failed',
        description: 'Your payment could not be processed. Please try again or use a different payment method.',
        type: 'error',
      });
    }
  }, [cancelled, failed]);

  // If subscription is already active or has an unexpired trial, redirect to dashboard
  useEffect(() => {
    const isTrialValid =
      subscription?.status === 'trialing' &&
      Boolean(
        subscription?.currentPeriodEnd &&
        new Date(subscription.currentPeriodEnd).getTime() > Date.now()
      );

    if (subscription?.status === 'active' || isTrialValid) {
      router.replace('/dashboard');
    }
  }, [subscription, router]);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        return resolve(true);
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleStartFreeTrial = async (planKey: PlanKey = selectedPlan) => {
    if (!user) {
      showToast({ title: 'Not logged in', description: 'Please log in first.', type: 'error' });
      router.push('/login');
      return;
    }

    setIsStartingTrial(true);
    try {
      const res = await startFreeTrialAction({ plan: planKey });
      if (!res.success) {
        showToast({
          title: 'Trial Unavailable',
          description: res.error || 'Could not start free trial.',
          type: 'error',
        });
        return;
      }

      showToast({
        title: '7-Day Free Trial Activated!',
        description: 'Welcome to Ventrexs AI. Your workspace is ready.',
        type: 'success',
      });

      await refreshSubscription();
      router.push('/dashboard');
    } catch (err: unknown) {
      showToast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to start free trial.',
        type: 'error',
      });
    } finally {
      setIsStartingTrial(false);
    }
  };

  const handleSelectPlan = async (planKey: PlanKey) => {
    if (!user) {
      showToast({ title: 'Not logged in', description: 'Please log in first.', type: 'error' });
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setLoadingPlan(planKey);

    try {
      // Step 1: Save plan selection with status='pending'
      const saveRes = await saveSelectedPlanAction({
        plan: planKey,
        billingCycle,
      });

      if (!saveRes.success) {
        throw new Error(saveRes.error || 'Failed to initialize workspace for selected plan.');
      }

      const resolvedBusinessId = saveRes.businessId;

      // Step 2: Track checkout_started conversion event
      const planPrice = billingCycle === 'annual'
        ? PLANS_CONFIG[planKey].priceAnnual
        : PLANS_CONFIG[planKey].priceMonthly;

      ConversionTracker.trackCheckoutStarted({
        plan: planKey,
        billing_cycle: billingCycle,
        value: planPrice,
        currency: gateway === 'stripe' ? 'USD' : 'INR',
      });

      // Step 3: Route directly through real checkout API
      if (gateway === 'stripe') {
        const res = await fetch('/api/checkout/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan: planKey,
            billingCycle,
            businessId: resolvedBusinessId,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.url) {
          throw new Error(data.error || 'Failed to initialize Stripe checkout session.');
        }

        window.location.assign(data.url);
      } else {
        const res = await fetch('/api/checkout/razorpay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan: planKey,
            billingCycle,
            currency: 'INR',
            businessId: resolvedBusinessId,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.orderId) {
          throw new Error(data.error || 'Failed to initialize Razorpay checkout order.');
        }

        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error('Could not load Razorpay checkout script. Please check your internet connection.');
        }

        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: 'Ventrexs AI',
          description: `${planKey} Plan (${billingCycle})`,
          order_id: data.orderId,
          prefill: {
            name: data.customer?.name || '',
            email: data.customer?.email || '',
          },
          theme: { color: '#0284c7' },
          handler: function (response: any) {
            showToast({
              title: 'Payment Successful',
              description: 'Verifying payment server-side and activating workspace...',
              type: 'success',
            });

            router.push(
              `/api/billing/verify?razorpay_payment_id=${encodeURIComponent(
                response.razorpay_payment_id
              )}&razorpay_order_id=${encodeURIComponent(
                response.razorpay_order_id
              )}&razorpay_signature=${encodeURIComponent(
                response.razorpay_signature
              )}&plan=${encodeURIComponent(planKey)}&billing_cycle=${billingCycle}&business_id=${encodeURIComponent(
                data.businessId || data.customer?.id || ''
              )}`
            );
          },
          modal: {
            ondismiss: function () {
              setLoadingPlan(null);
            },
          },
        };

        const RazorpayConstructor = (window as any).Razorpay;
        const rzp = new RazorpayConstructor(options);
        rzp.open();
      }
    } catch (err: any) {
      showToast({
        title: 'Checkout Error',
        description: err?.message || 'Failed to open payment gateway. Please try again.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
      setLoadingPlan(null);
    }
  };

  const plans = Object.values(PLANS_CONFIG);
  const annualSavings = (plan: PlanKey) => {
    const cfg = PLANS_CONFIG[plan];
    return Math.round(cfg.priceMonthly * 12 - cfg.priceAnnual);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 sm:px-8 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-base text-slate-900 tracking-tight">Ventrexs AI</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            Logged in as <strong>{user?.email}</strong>
          </span>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-10 max-w-5xl mx-auto w-full">
        {/* Page Heading */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Choose Your Plan
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Unlock your workspace. Start accepting customers, creating jobs, and sending invoices
            the moment your subscription is active.
          </p>

          {/* Cancellation / Failure Banners */}
          {(cancelled || failed) && (
            <div className="mt-4 mx-auto max-w-md flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-left">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-800">
                  {failed ? 'Payment failed' : 'Payment cancelled'}
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Your subscription is <strong>not active</strong>. Select a plan below to complete payment.
                </p>
              </div>
            </div>
          )}

          {/* Pending subscription notice */}
          {subscription?.status === 'pending' || subscription?.status === 'checkout_started' ? (
            <div className="mt-4 mx-auto max-w-md flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-left">
              <RotateCcw className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0 animate-spin" />
              <div>
                <p className="text-xs font-bold text-blue-800">Payment in progress</p>
                <p className="text-xs text-blue-700 mt-0.5">
                  We&apos;re waiting for payment confirmation. If you completed payment, please wait a
                  moment and refresh. If not, select a plan below to try again.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              billingCycle === 'annual'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
            }`}
          >
            Annual
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
              billingCycle === 'annual' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
            }`}>
              Save up to ${annualSavings('Professional')}
            </span>
          </button>
        </div>

        {/* Payment Gateway Selector & Free Trial Option */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white p-3.5 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-700">Gateway:</span>
            <div className="inline-flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setGateway('razorpay')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  gateway === 'razorpay'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Razorpay (UPI/INR)
              </button>
              <button
                type="button"
                onClick={() => setGateway('stripe')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  gateway === 'stripe'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Stripe (Cards/USD)
              </button>
            </div>
          </div>

          {subscription?.status !== 'active' && subscription?.status !== 'trialing' && (
            <button
              type="button"
              onClick={() => handleStartFreeTrial(selectedPlan)}
              disabled={isStartingTrial || isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 text-xs font-black hover:bg-amber-500/20 transition-all border border-amber-500/20"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Or Start 7-Day Free Trial</span>
            </button>
          )}
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {plans.map((plan) => {
            const price = billingCycle === 'annual' ? plan.priceAnnual / 12 : plan.priceMonthly;
            const isPopular = plan.popular;
            const isSelected = selectedPlan === plan.key;

            return (
              <div
                key={plan.key}
                onClick={() => setSelectedPlan(plan.key as PlanKey)}
                className={`relative rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-100'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black px-3 py-0.5 rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="font-black text-base text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{plan.tagline}</p>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">
                      ${Math.round(price)}
                    </span>
                    <span className="text-xs text-slate-500">/mo</span>
                  </div>
                  {billingCycle === 'annual' && (
                    <p className="text-[11px] text-emerald-600 font-bold mt-0.5">
                      ${plan.priceAnnual}/yr · Save ${Math.round(plan.priceMonthly * 12 - plan.priceAnnual)}
                    </p>
                  )}
                </div>

                <ul className="space-y-1.5 mb-5">
                  {plan.features.slice(0, 5).map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-xs text-slate-700">
                      <Check className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <div className="space-y-2 mt-auto">
                  <button
                    id={`select-plan-${plan.key}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlan(plan.key as PlanKey);
                    }}
                    disabled={isLoading}
                    className={`w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {loadingPlan === plan.key ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        Connecting {gateway === 'razorpay' ? 'Razorpay' : 'Stripe'}...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-3.5 h-3.5" />
                        Pay with {gateway === 'razorpay' ? 'Razorpay' : 'Stripe'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  {subscription?.status !== 'active' && subscription?.status !== 'trialing' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartFreeTrial(plan.key as PlanKey);
                      }}
                      disabled={isStartingTrial || isLoading}
                      className="w-full text-center text-[11px] font-bold text-amber-700 hover:underline py-0.5"
                    >
                      ⚡ Start 7-day free trial ({plan.name})
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Security note */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <Shield className="w-3.5 h-3.5" />
          <span>
            Payments are processed securely. We never store your card details.
            Subscription activates only after confirmed payment.
          </span>
        </div>
      </main>
    </div>
  );
}
