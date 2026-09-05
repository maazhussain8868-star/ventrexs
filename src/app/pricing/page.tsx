'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/context/AppContext';
import { PLANS_CONFIG, AGENCY_PLANS_CONFIG, PlanKey, AgencyPlanKey, BillingInterval } from '@/lib/billing/types';
import { startFreeTrialAction } from '@/app/actions/billing';
import { 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  HelpCircle,
  Building2,
  Globe,
  CreditCard,
  Clock
} from 'lucide-react';

// Single source of truth derived from PLANS_CONFIG
export const PLAN_PRICING = {
  INR: {
    Starter: { monthly: PLANS_CONFIG.Starter.pricing.INR.monthly, annual: PLANS_CONFIG.Starter.pricing.INR.annualTotal },
    Professional: { monthly: PLANS_CONFIG.Professional.pricing.INR.monthly, annual: PLANS_CONFIG.Professional.pricing.INR.annualTotal },
    Enterprise: { monthly: PLANS_CONFIG.Enterprise.pricing.INR.monthly, annual: PLANS_CONFIG.Enterprise.pricing.INR.annualTotal },
  },
  USD: {
    Starter: { monthly: PLANS_CONFIG.Starter.pricing.USD.monthly, annual: PLANS_CONFIG.Starter.pricing.USD.annualTotal },
    Professional: { monthly: PLANS_CONFIG.Professional.pricing.USD.monthly, annual: PLANS_CONFIG.Professional.pricing.USD.annualTotal },
    Enterprise: { monthly: PLANS_CONFIG.Enterprise.pricing.USD.monthly, annual: PLANS_CONFIG.Enterprise.pricing.USD.annualTotal },
  },
};

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
  };
  theme: { color: string };
  handler: (response: RazorpayResponse) => Promise<void> | void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

function detectUserPaymentRegion(): { gateway: 'razorpay' | 'stripe'; currency: 'INR' | 'USD' } {
  // Primary market is USA — Stripe USD is the primary/default option
  return { gateway: 'stripe', currency: 'USD' };
}

export default function PricingPage() {
  const router = useRouter();
  const { subscription, showToast, profile, user, refreshSubscription } = useApp();
  const [planCategory, setPlanCategory] = useState<'business' | 'agency'>('business');
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
  const [gateway, setGateway] = useState<'razorpay' | 'stripe'>(() => detectUserPaymentRegion().gateway);
  const [currency, setCurrency] = useState<'INR' | 'USD'>(() => detectUserPaymentRegion().currency);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [isStartingTrial, setIsStartingTrial] = useState(false);

  const handleStartFreeTrial = async (planKey: PlanKey = 'Professional') => {
    if (!user && !profile?.email) {
      router.push(`/signup?type=business&plan=${planKey}&trial=true`);
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
        title: '7-Day Free Trial Started!',
        description: 'Welcome to Ventrexs AI. Your workspace is now active.',
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

  const handleGatewayChange = (newGateway: 'razorpay' | 'stripe') => {
    setGateway(newGateway);
    setCurrency(newGateway === 'razorpay' ? 'INR' : 'USD');
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as unknown as { Razorpay?: unknown }).Razorpay) {
        return resolve(true);
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (planKey: PlanKey, gatewayOverride?: 'razorpay' | 'stripe') => {
    const selectedGateway = gatewayOverride || gateway;

    if (subscription.status === 'active' && planKey === subscription.plan) {
      showToast({
        title: 'Current Plan',
        description: `Your workspace is currently active on the ${planKey} plan.`,
        type: 'info',
      });
      return;
    }

    // If not logged in, route to signup with plan and gateway params
    if (!user && !profile?.email) {
      router.push(`/signup?type=business&plan=${planKey}&gateway=${selectedGateway}&cycle=${billingInterval}`);
      return;
    }

    setLoadingPlan(planKey);

    try {
      if (selectedGateway === 'stripe') {
        // Stripe Checkout hosted session
        const res = await fetch('/api/checkout/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan: planKey,
            billingCycle: billingInterval,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.url) {
          throw new Error(data.error || 'Failed to initialize Stripe hosted checkout session.');
        }

        window.location.assign(data.url);
      } else {
        // Razorpay checkout modal
        const res = await fetch('/api/checkout/razorpay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan: planKey,
            billingCycle: billingInterval,
            currency: 'INR',
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

        const options: RazorpayOptions = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: 'Ventrexs AI',
          description: `${planKey} Plan (${billingInterval})`,
          order_id: data.orderId,
          prefill: {
            name: data.customer?.name || '',
            email: data.customer?.email || '',
          },
          theme: { color: '#0284c7' },
          handler: function (response: RazorpayResponse) {
            showToast({
              title: 'Payment Successful',
              description: 'Verifying payment server-side and activating workspace...',
              type: 'success',
            });

            // Redirect to internal server verification endpoint
            router.push(
              `/api/billing/verify?razorpay_payment_id=${encodeURIComponent(
                response.razorpay_payment_id
              )}&razorpay_order_id=${encodeURIComponent(
                response.razorpay_order_id
              )}&razorpay_signature=${encodeURIComponent(
                response.razorpay_signature
              )}&plan=${encodeURIComponent(planKey)}&billing_cycle=${billingInterval}&business_id=${encodeURIComponent(
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

        const RazorpayConstructor = (window as unknown as { Razorpay: new (opts: RazorpayOptions) => RazorpayInstance }).Razorpay;
        const rzp = new RazorpayConstructor(options);
        rzp.open();
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to proceed with checkout. Please try again.';
      showToast({
        title: 'Checkout Error',
        description: errorMsg,
        type: 'error',
      });
      setLoadingPlan(null);
    }
  };

  const faqs = [
    {
      q: 'How does Ventrexs AI enforce ethical & Halal billing?',
      a: 'Ventrexs operates on strict non-compounding, zero-interest calculations. We never charge punitive late fees or predatory interest on overdue balances.',
    },
    {
      q: 'Which payment methods are supported for Indian businesses?',
      a: 'We support all Indian payment options via Razorpay including UPI (Google Pay, PhonePe, Paytm), RuPay, Visa, Mastercard credit/debit cards, and NetBanking across all major banks.',
    },
    {
      q: 'Which payment methods are supported for international users?',
      a: 'International subscribers are processed securely via Stripe Checkout supporting Visa, Mastercard, American Express, Apple Pay, and Google Pay in USD.',
    },
    {
      q: 'What is the difference between Business and Agency plans?',
      a: 'Business plans are designed for individual trade contractors managing their own jobs, dispatch, and AI reception. Agency plans are multi-tenant reseller tiers for marketing agencies managing fleets of 10 to 100+ contractor clients under custom white-label branding.',
    },
    {
      q: 'Can I upgrade, downgrade, or cancel at any time?',
      a: 'Yes, seamlessly. When you upgrade, changes apply immediately with prorated billing. When you cancel, your access continues uninterrupted until the end of the paid billing period.',
    },
    {
      q: 'Are all 8 service industries supported across all plans?',
      a: 'Yes. HVAC, Roofing, Plumbing, Electrical, General Contracting, Landscaping, Garage Door, Pest Control, and Cleaning businesses have full access to our industry-tuned workflows.',
    },
  ];

  return (
    <AppShell title="Plans & Pricing">
      <div className="max-w-6xl mx-auto flex flex-col gap-10 pb-16">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto pt-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            Transparent Commercial SaaS Pricing
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-on-surface mb-3 tracking-tight">
            Plans Built for Scale
          </h1>
          <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Choose between standalone contractor operating software and multi-tenant white-label agency reseller tiers.
          </p>
        </div>

        {/* 7-Day Free Trial Banner (No Credit Card Required) */}
        {subscription?.status !== 'active' && subscription?.status !== 'trialing' && (
          <div className="rounded-2xl p-6 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-teal-500/10 border border-primary/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-[11px] font-black uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5" />
                7-Day Free Trial
              </div>
              <h3 className="text-lg font-extrabold text-on-surface">
                Want to experience Ventrexs AI first?
              </h3>
              <p className="text-xs text-on-surface-variant max-w-xl">
                Start an intentional 7-day free trial with full access to the AI Receptionist, job dispatch, estimates, and invoice workflows. No credit card required.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => handleStartFreeTrial('Professional')}
              isLoading={isStartingTrial}
              className="shrink-0 font-bold text-xs gap-2 px-6 shadow-md"
            >
              <span>Start 7-Day Free Trial</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

        {/* Currency / Payment Gateway Selector */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" /> Select Payment Region & Gateway:
          </span>
          <div className="bg-surface-container-high rounded-2xl p-1.5 flex flex-wrap gap-2 border border-outline-variant/80 shadow-xs max-w-lg w-full">
            <button
              type="button"
              onClick={() => handleGatewayChange('razorpay')}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                gateway === 'razorpay'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>🇮🇳 Razorpay (INR • UPI & Cards)</span>
            </button>
            <button
              type="button"
              onClick={() => handleGatewayChange('stripe')}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                gateway === 'stripe'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>🌐 Stripe (USD • Global Cards)</span>
            </button>
          </div>
          <p className="text-[11px] text-on-surface-variant">
            {gateway === 'razorpay'
              ? '✨ Recommended for India: Instant UPI, QR Code, NetBanking, & RuPay/Visa/Mastercard.'
              : '✨ Recommended for International: Hosted Stripe Checkout in USD with instant card processing.'}
          </p>
        </div>

        {/* Plan Category Switcher (Business vs Agency) */}
        <div className="flex flex-col items-center gap-4">
          <div className="bg-surface-container-high rounded-2xl p-1.5 flex border border-outline-variant/80 shadow-xs max-w-md w-full">
            <button
              type="button"
              onClick={() => setPlanCategory('business')}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                planCategory === 'business'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Business Plans</span>
            </button>
            <button
              type="button"
              onClick={() => setPlanCategory('agency')}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                planCategory === 'agency'
                  ? 'bg-surface-container-lowest text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Agency / Reseller</span>
            </button>
          </div>

          {/* Monthly / Annual Toggle */}
          <div className="bg-surface-container rounded-full p-1 flex border border-outline-variant/60 shadow-2xs text-xs font-semibold">
            <button
              type="button"
              onClick={() => setBillingInterval('monthly')}
              className={`px-4 py-1.5 rounded-full transition-all ${
                billingInterval === 'monthly'
                  ? 'bg-surface-container-lowest text-on-surface shadow-2xs font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingInterval('annual')}
              className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                billingInterval === 'annual'
                  ? 'bg-surface-container-lowest text-on-surface shadow-2xs font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-500/20">
                15% OFF
              </span>
            </button>
          </div>
        </div>

        {/* 1. BUSINESS PLANS GRID */}
        {planCategory === 'business' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {(['Starter', 'Professional', 'Enterprise'] as PlanKey[]).map((key) => {
              const plan = PLANS_CONFIG[key];
              const isCurrent = subscription.status === 'active' && subscription.plan === key;

              const priceBreakdown = plan.pricing[currency] || plan.pricing.USD;
              const displayPerMonth = billingInterval === 'annual' ? priceBreakdown.annualMonthlyEquivalent : priceBreakdown.monthly;
              const annualTotal = priceBreakdown.annualTotal;
              const currencySymbol = currency === 'INR' ? '₹' : '$';

              return (
                <div
                  key={key}
                  className={`rounded-2xl p-7 flex flex-col justify-between transition-all bg-surface-container-lowest border ${
                    plan.popular
                      ? 'border-primary ring-2 ring-primary/20 shadow-lg relative'
                      : isCurrent
                      ? 'border-tertiary shadow-xs'
                      : 'border-outline-variant/80 shadow-xs hover:border-outline-variant'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                      Most Popular for Contractors
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-on-surface">{plan.name}</h3>
                      {isCurrent && <Badge variant="info" label="Current Plan" />}
                    </div>
                    <p className="text-xs text-on-surface-variant min-h-[36px] mb-4">
                      {plan.tagline}
                    </p>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-on-surface font-mono">
                          {currencySymbol}{displayPerMonth.toLocaleString()}
                        </span>
                        <span className="text-xs text-on-surface-variant font-medium">
                          /month
                        </span>
                      </div>
                      {billingInterval === 'annual' ? (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                          Billed annually at {currencySymbol}{annualTotal.toLocaleString()}/yr (15% discount applied)
                        </p>
                      ) : (
                        <p className="text-[11px] text-on-surface-variant font-medium mt-1">
                          Billed monthly, cancel anytime
                        </p>
                      )}
                    </div>

                    <div className="border-t border-outline-variant/60 pt-4 mb-6">
                      <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-3">
                        What&apos;s Included:
                      </span>
                      <ul className="space-y-2.5">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start text-xs text-on-surface gap-2">
                            <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <Button
                      variant={isCurrent ? 'outline' : plan.popular ? 'primary' : 'outline'}
                      size="md"
                      onClick={() => handleCheckout(key, gateway === 'razorpay' ? 'razorpay' : 'stripe')}
                      disabled={isCurrent || loadingPlan === key}
                      className="w-full font-bold text-xs gap-1.5 shadow-xs"
                    >
                      {isCurrent ? (
                        'Active Plan'
                      ) : loadingPlan === key ? (
                        'Connecting Gateway...'
                      ) : (
                        <>
                          <span>
                            {gateway === 'razorpay' ? 'Pay with Razorpay (UPI & Cards)' : 'Pay with Stripe (USD • Cards/Apple Pay)'}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </Button>

                    {!isCurrent && (
                      <button
                        type="button"
                        onClick={() => handleCheckout(key, gateway === 'razorpay' ? 'stripe' : 'razorpay')}
                        disabled={loadingPlan === key}
                        className="text-[11px] text-center text-on-surface-variant hover:text-primary transition-colors py-1 underline underline-offset-2 flex items-center justify-center gap-1 font-medium"
                      >
                        {gateway === 'razorpay'
                          ? '🌐 Pay with Stripe (USD • Global Cards)'
                          : '🇮🇳 Pay with Razorpay (India • UPI, NetBanking)'}
                      </button>
                    )}

                    {!isCurrent && subscription?.status !== 'active' && subscription?.status !== 'trialing' && (
                      <button
                        type="button"
                        onClick={() => handleStartFreeTrial(key)}
                        disabled={isStartingTrial || loadingPlan === key}
                        className="text-[11px] font-bold text-center text-primary hover:underline transition-colors py-0.5"
                      >
                        ⚡ Start 7-day free trial ({plan.name})
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Plan Feature Comparison Table */}
        {planCategory === 'business' && (
          <div className="mt-8 space-y-4">
            <div className="text-center max-w-xl mx-auto mb-6">
              <h2 className="text-2xl font-bold text-on-surface tracking-tight">
                Full Plan Feature Comparison
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Detailed feature-by-feature breakdown of all quotas, CRM capabilities, and telephony limits.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-outline-variant/80 bg-surface-container-lowest shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/80 bg-surface-container-high/50">
                    <th className="py-4 px-5 font-bold text-on-surface text-sm">Feature / Quota</th>
                    <th className="py-4 px-5 font-bold text-on-surface text-sm w-1/4">
                      Starter
                      <div className="text-xs font-normal text-on-surface-variant mt-0.5">$29/mo</div>
                    </th>
                    <th className="py-4 px-5 font-bold text-primary text-sm w-1/4 bg-primary/5">
                      Professional
                      <span className="ml-1.5 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-extrabold uppercase">Popular</span>
                      <div className="text-xs font-normal text-on-surface-variant mt-0.5">$79/mo</div>
                    </th>
                    <th className="py-4 px-5 font-bold text-on-surface text-sm w-1/4">
                      Enterprise
                      <div className="text-xs font-normal text-on-surface-variant mt-0.5">$249/mo</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50">
                  {/* Category: Pricing */}
                  <tr className="bg-surface-container-high/20 font-bold text-on-surface-variant uppercase text-[10px] tracking-wider">
                    <td colSpan={4} className="py-2.5 px-5">Pricing & Billing Options</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-5 font-medium text-on-surface">Monthly Price</td>
                    <td className="py-3 px-5 font-mono font-semibold">$29/mo</td>
                    <td className="py-3 px-5 font-mono font-semibold bg-primary/5 text-primary">$79/mo</td>
                    <td className="py-3 px-5 font-mono font-semibold">$249/mo</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-5 font-medium text-on-surface">Annual Price (15% Discount)</td>
                    <td className="py-3 px-5 font-mono">$24.65/mo ($295.80/yr)</td>
                    <td className="py-3 px-5 font-mono bg-primary/5 font-semibold text-emerald-600 dark:text-emerald-400">$67.15/mo ($805.80/yr)</td>
                    <td className="py-3 px-5 font-mono">$211.65/mo ($2,539.80/yr)</td>
                  </tr>

                  {/* Category: AI Receptionist & Telephony */}
                  <tr className="bg-surface-container-high/20 font-bold text-on-surface-variant uppercase text-[10px] tracking-wider">
                    <td colSpan={4} className="py-2.5 px-5">AI Receptionist & Voice Telephony</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-5 font-medium text-on-surface">Monthly AI Call Minutes</td>
                    <td className="py-3 px-5 font-bold font-mono">60 minutes/month</td>
                    <td className="py-3 px-5 font-bold font-mono bg-primary/5 text-primary">250 minutes/month</td>
                    <td className="py-3 px-5 font-bold font-mono">900 minutes/month</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-5 font-medium text-on-surface">Extra AI Minutes Overage Rate</td>
                    <td className="py-3 px-5 font-mono">$0.15/minute</td>
                    <td className="py-3 px-5 font-mono bg-primary/5">$0.12/minute</td>
                    <td className="py-3 px-5 font-mono font-semibold text-emerald-600 dark:text-emerald-400">$0.10/minute</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-5 font-medium text-on-surface">Dedicated Inbound Phone Number (US DID)</td>
                    <td className="py-3 px-5 text-emerald-600 font-semibold">✓ Included</td>
                    <td className="py-3 px-5 text-emerald-600 font-semibold bg-primary/5">✓ Included</td>
                    <td className="py-3 px-5 text-emerald-600 font-semibold">✓ Included</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-5 font-medium text-on-surface">24/7 Call Answering & Emergency Triage</td>
                    <td className="py-3 px-5 text-emerald-600 font-semibold">✓ Included</td>
                    <td className="py-3 px-5 text-emerald-600 font-semibold bg-primary/5">✓ Included</td>
                    <td className="py-3 px-5 text-emerald-600 font-semibold">✓ Included (Priority Escalation)</td>
                  </tr>

                  {/* Category: Communications */}
                  <tr className="bg-surface-container-high/20 font-bold text-on-surface-variant uppercase text-[10px] tracking-wider">
                    <td colSpan={4} className="py-2.5 px-5">Multi-Channel Communications</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-5 font-medium text-on-surface">Outbound SMS Dispatches</td>
                    <td className="py-3 px-5 font-mono">300/month</td>
                    <td className="py-3 px-5 font-mono bg-primary/5 font-semibold text-primary">1,000/month</td>
                    <td className="py-3 px-5 font-mono">5,000/month</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-5 font-medium text-on-surface">WhatsApp Automated Messages</td>
                    <td className="py-3 px-5 font-mono">100/month</td>
                    <td className="py-3 px-5 font-mono bg-primary/5 font-semibold text-primary">500/month</td>
                    <td className="py-3 px-5 font-mono">2,000/month</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-5 font-medium text-on-surface">Email Invoices & Alerts</td>
                    <td className="py-3 px-5 font-mono">1,000/month</td>
                    <td className="py-3 px-5 font-mono bg-primary/5 font-semibold text-primary">5,000/month</td>
                    <td className="py-3 px-5 font-mono font-bold text-emerald-600 dark:text-emerald-400">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-5 font-medium text-on-surface">Google Review Requests</td>
                    <td className="py-3 px-5 font-mono">50/month</td>
                    <td className="py-3 px-5 font-mono bg-primary/5 font-semibold text-primary">250/month</td>
                    <td className="py-3 px-5 font-mono font-semibold">1,000/month</td>
                  </tr>

                  {/* Category: Dispatch & Operations */}
                  <tr className="bg-surface-container-high/20 font-bold text-on-surface-variant uppercase text-[10px] tracking-wider">
                    <td colSpan={4} className="py-2.5 px-5">Operations & Field Dispatch</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-5 font-medium text-on-surface">Active Work Orders (Jobs)</td>
                    <td className="py-3 px-5 font-mono">100/month</td>
                    <td className="py-3 px-5 font-mono bg-primary/5 font-semibold text-primary">500/month</td>
                    <td className="py-3 px-5 font-mono font-bold text-emerald-600 dark:text-emerald-400">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-5 font-medium text-on-surface">Proposals & Estimates</td>
                    <td className="py-3 px-5 font-mono">100/month</td>
                    <td className="py-3 px-5 font-mono bg-primary/5 font-semibold text-primary">500/month</td>
                    <td className="py-3 px-5 font-mono font-bold text-emerald-600 dark:text-emerald-400">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-5 font-medium text-on-surface">Team User Seats</td>
                    <td className="py-3 px-5 font-mono">1 Seat</td>
                    <td className="py-3 px-5 font-mono bg-primary/5 font-semibold text-primary">5 Seats</td>
                    <td className="py-3 px-5 font-mono font-semibold">20 Seats</td>
                  </tr>

                  {/* Category: CRM & Automation */}
                  <tr className="bg-surface-container-high/20 font-bold text-on-surface-variant uppercase text-[10px] tracking-wider">
                    <td colSpan={4} className="py-2.5 px-5">CRM, Automations & Platform Scale</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-5 font-medium text-on-surface">CRM Pipeline</td>
                    <td className="py-3 px-5">Basic leads/pipeline</td>
                    <td className="py-3 px-5 bg-primary/5 font-medium text-primary">Full leads/pipeline</td>
                    <td className="py-3 px-5 font-medium">Full with custom stages</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-5 font-medium text-on-surface">Follow-up Automation</td>
                    <td className="py-3 px-5 text-on-surface-variant">Disabled</td>
                    <td className="py-3 px-5 text-emerald-600 font-semibold bg-primary/5">✓ Enabled</td>
                    <td className="py-3 px-5 text-emerald-600 font-semibold">✓ Advanced Sequences</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-5 font-medium text-on-surface">Reputation Management</td>
                    <td className="py-3 px-5 text-on-surface-variant">Disabled</td>
                    <td className="py-3 px-5 text-emerald-600 font-semibold bg-primary/5">✓ Auto-request enabled</td>
                    <td className="py-3 px-5 text-emerald-600 font-semibold">✓ Auto-request + AI Suggestions</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-5 font-medium text-on-surface">White-Label / Agency Mode</td>
                    <td className="py-3 px-5 text-on-surface-variant">Disabled</td>
                    <td className="py-3 px-5 text-on-surface-variant bg-primary/5">Disabled</td>
                    <td className="py-3 px-5 text-emerald-600 font-semibold">✓ Enabled</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-5 font-medium text-on-surface">REST API & Webhooks</td>
                    <td className="py-3 px-5 text-on-surface-variant">Disabled</td>
                    <td className="py-3 px-5 text-on-surface-variant bg-primary/5">Disabled</td>
                    <td className="py-3 px-5 text-emerald-600 font-semibold">✓ Enabled</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-5 font-medium text-on-surface">Support Level</td>
                    <td className="py-3 px-5">Email only</td>
                    <td className="py-3 px-5 bg-primary/5 font-semibold text-primary">Email + Chat</td>
                    <td className="py-3 px-5 font-semibold text-primary">Dedicated 24/7 Support</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. AGENCY / RESELLER PLANS GRID */}
        {planCategory === 'agency' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {(['AgencyStarter', 'AgencyGrowth', 'AgencyEnterprise'] as AgencyPlanKey[]).map((key) => {
              const plan = AGENCY_PLANS_CONFIG[key];
              const price = billingInterval === 'annual' ? plan.priceAnnual : plan.priceMonthly;

              return (
                <div
                  key={key}
                  className={`rounded-2xl p-7 flex flex-col justify-between transition-all bg-surface-container-lowest border ${
                    plan.popular
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg relative'
                      : 'border-outline-variant/80 shadow-xs hover:border-outline-variant'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                      Most Popular for Agencies
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-on-surface">{plan.name}</h3>
                      <Badge variant="neutral" label={`Fleet: ${plan.limits.maxClients || '10+'} Clients`} />
                    </div>
                    <p className="text-xs text-on-surface-variant min-h-[36px] mb-4">
                      {plan.tagline}
                    </p>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-on-surface font-mono">
                          ${price}
                        </span>
                        <span className="text-xs text-on-surface-variant font-medium">
                          /{billingInterval === 'annual' ? 'year' : 'month'}
                        </span>
                      </div>
                      {billingInterval === 'annual' && (
                        <p className="text-[11px] text-tertiary font-semibold mt-1">
                          Billed annually (${plan.priceAnnual}/yr • Includes 2 months free)
                        </p>
                      )}
                    </div>

                    <div className="border-t border-outline-variant/60 pt-4 mb-6">
                      <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-3">
                        Agency Reseller Features:
                      </span>
                      <ul className="space-y-2.5">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start text-xs text-on-surface gap-2">
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link href={`/signup?type=agency&plan=${key}`} className="w-full block">
                      <Button
                        variant={plan.popular ? 'primary' : 'outline'}
                        size="md"
                        className={`w-full font-bold text-xs gap-1.5 shadow-xs ${
                          plan.popular ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''
                        }`}
                      >
                        <span>Start Agency Plan</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Feature Matrix / Security Callout */}
        <div className="rounded-2xl p-6 bg-surface-container-high/60 border border-outline-variant/60 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-tertiary" />
              <h3 className="text-base font-bold text-on-surface">
                Bank-Grade 256-Bit SSL Encryption & Idempotent Verification
              </h3>
            </div>
            <p className="text-xs text-on-surface-variant">
              Every checkout is cryptographically signed and confirmed server-side via official Razorpay and Stripe webhooks.
            </p>
          </div>
          <Link href="/settings/billing" className="shrink-0">
            <Button variant="outline" className="gap-2 text-xs">
              View Current Usage
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Frequently Asked Questions */}
        <div className="space-y-6 pt-4">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-on-surface tracking-tight mb-1">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-on-surface-variant">
              Everything you need to know about our subscriptions and billing policies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/70 shadow-xs space-y-1.5"
              >
                <div className="flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <h4 className="text-xs font-bold text-on-surface">{faq.q}</h4>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
