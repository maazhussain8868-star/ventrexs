'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/context/AppContext';
import { PLANS_CONFIG, PlanKey, BillingInterval } from '@/lib/billing/types';
import { 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  HelpCircle,
  Zap,
  Bot,
  Users,
  Award
} from 'lucide-react';

export default function PricingPage() {
  const { subscription, createCheckoutSession, showToast } = useApp();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);

  const handleSelectPlan = async (planKey: PlanKey) => {
    if (planKey === subscription.plan) {
      showToast({
        title: 'Current Plan',
        description: `Your workspace is currently active on the ${planKey} plan.`,
        type: 'info',
      });
      return;
    }

    setLoadingPlan(planKey);
    try {
      const res = await createCheckoutSession(planKey, billingInterval);
      if (res?.checkoutUrl && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
        window.location.href = res.checkoutUrl;
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  const faqs = [
    {
      q: 'How does Ventrexs AI enforce ethical & Halal billing?',
      a: 'Ventrexs operates on strict non-compounding, zero-interest calculations. We never charge punitive late fees or predatory interest on overdue balances.',
    },
    {
      q: 'Can I upgrade, downgrade, or cancel at any time?',
      a: 'Yes, seamlessly. When you upgrade, changes apply immediately with prorated billing. When you cancel, your access continues uninterrupted until the end of the paid billing period.',
    },
    {
      q: 'Are all 8 service industries supported across all plans?',
      a: 'Yes. HVAC, Roofing, Plumbing, Electrical, General Contracting, Landscaping, Garage Door, Pest Control, and Cleaning businesses have full access to our industry-tuned workflows.',
    },
    {
      q: 'What payment methods do you support for SaaS subscriptions?',
      a: 'We accept all major credit cards, debit cards, and bank transfers securely processed via Stripe.',
    },
  ];

  return (
    <AppShell title="Plans & Pricing">
      <div className="max-w-6xl mx-auto flex flex-col gap-10 pb-16">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto pt-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            Transparent Service Business SaaS
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-on-surface mb-3 tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Choose the plan that matches your dispatch crew size. Autonomous AI receptionist triage, field work orders, estimates, and Google review management included.
          </p>
        </div>

        {/* Monthly / Annual Toggle */}
        <div className="flex justify-center">
          <div className="bg-surface-container-high rounded-full p-1.5 flex border border-outline-variant/80 shadow-xs">
            <button
              type="button"
              onClick={() => setBillingInterval('monthly')}
              className={`px-5 py-2 rounded-full font-bold text-xs sm:text-sm transition-all ${
                billingInterval === 'monthly'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingInterval('annual')}
              className={`px-5 py-2 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 ${
                billingInterval === 'annual'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full bg-tertiary/20 text-tertiary text-[10px] font-extrabold">
                2 Months Free
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {(['Starter', 'Professional', 'Enterprise'] as PlanKey[]).map((key) => {
            const plan = PLANS_CONFIG[key];
            const isCurrent = subscription.plan === key;
            const price = billingInterval === 'annual' ? plan.priceAnnual : plan.priceMonthly;

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
                        ${price}
                      </span>
                      <span className="text-xs text-on-surface-variant font-medium">
                        /{billingInterval === 'annual' ? 'year' : 'month'}
                      </span>
                    </div>
                    {billingInterval === 'annual' && (
                      <p className="text-[11px] text-tertiary font-semibold mt-1">
                        Billed annually (Includes 2 months free)
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

                <Button
                  variant={isCurrent ? 'outline' : plan.popular ? 'primary' : 'outline'}
                  size="md"
                  onClick={() => handleSelectPlan(key)}
                  disabled={isCurrent || loadingPlan === key}
                  className="w-full font-bold text-xs gap-1.5 shadow-xs"
                >
                  {isCurrent ? (
                    'Active Plan'
                  ) : loadingPlan === key ? (
                    'Preparing Checkout...'
                  ) : (
                    <>
                      <span>Get Started with {plan.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Feature Matrix / Comparison Callout */}
        <div className="rounded-2xl p-6 bg-surface-container-high/60 border border-outline-variant/60 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-tertiary" />
              <h3 className="text-base font-bold text-on-surface">
                Need customized team training or multi-location fleet dispatch?
              </h3>
            </div>
            <p className="text-xs text-on-surface-variant">
              Enterprise subscribers get a dedicated account specialist, customized AI receptionist tuning, and bespoke webhook integrations.
            </p>
          </div>
          <Link href="/settings/billing" className="shrink-0">
            <Button variant="outline" className="gap-2 text-xs">
              View Detailed Quotas
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
