'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';

export default function PricingPage() {
  const { profile, updateProfile, showToast } = useApp();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(profile.billingCycle || 'monthly');

  const handleSelectPlan = (planName: 'Starter' | 'Professional' | 'Enterprise') => {
    updateProfile({
      plan: planName,
      billingCycle
    });
    showToast({
      title: `Plan Updated to ${planName}!`,
      description: `Billing cycle set to ${billingCycle}`,
      type: 'success'
    });
  };

  return (
    <AppShell title="Subscription & Plans">
      <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-8">
        {/* Header matching Stitch */}
        <div className="text-center max-w-xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-bold text-on-surface mb-2 tracking-tight">
            Choose Your Plan
          </h1>
          <p className="text-sm sm:text-base text-on-surface-variant">
            Scale your business with AI-powered financial collections and cash flow forecasting.
          </p>
        </div>

        {/* Monthly / Annual Toggle matching Stitch */}
        <div className="flex justify-center">
          <div className="bg-surface-container-low rounded-full p-1.5 flex border border-outline-variant shadow-xs">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-full font-bold text-xs sm:text-sm transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span>Annually</span>
              <span className="px-2 py-0.5 rounded-full bg-tertiary text-on-tertiary text-[10px] font-bold">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid matching Stitch */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Starter Plan */}
          <div className="bg-surface rounded-2xl border border-outline-variant p-6 sm:p-7 flex flex-col justify-between shadow-xs">
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-on-surface mb-1">Starter</h3>
                <p className="text-xs text-on-surface-variant">Essential tools for freelancers & small trades.</p>
              </div>

              <div className="mb-6">
                <span className="text-3xl sm:text-4xl font-bold text-on-surface">
                  ${billingCycle === 'monthly' ? '19' : '15'}
                </span>
                <span className="text-xs text-on-surface-variant font-medium"> /month</span>
                {billingCycle === 'annual' && (
                  <p className="text-[11px] text-tertiary font-semibold mt-1">Billed annually ($180/yr)</p>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start text-xs text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mr-2" />
                  Up to 50 Invoices / month
                </li>
                <li className="flex items-start text-xs text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mr-2" />
                  Basic Payment Reminders
                </li>
                <li className="flex items-start text-xs text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mr-2" />
                  Stripe & ACH Payment Gateways
                </li>
                <li className="flex items-start text-xs text-on-surface-variant">
                  <XCircle className="w-4 h-4 text-outline-variant shrink-0 mr-2" />
                  AI Automated Collection Reasoning
                </li>
              </ul>
            </div>

            <Button
              variant={profile.plan === 'Starter' ? 'secondary' : 'outline'}
              size="md"
              onClick={() => handleSelectPlan('Starter')}
              disabled={profile.plan === 'Starter'}
              className="w-full"
            >
              {profile.plan === 'Starter' ? 'Current Plan' : 'Select Starter'}
            </Button>
          </div>

          {/* Professional Plan (Highlighted Best Value) */}
          <div className="relative bg-surface rounded-2xl border-2 border-primary p-6 sm:p-7 flex flex-col justify-between shadow-xl ai-glow">
            <div className="absolute top-0 right-0 bg-primary text-on-primary px-3.5 py-1 rounded-bl-xl font-bold text-[11px] uppercase tracking-wider">
              Best Value
            </div>

            <div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-primary mb-1">Professional</h3>
                <p className="text-xs text-on-surface-variant">For growing businesses needing AI automation.</p>
              </div>

              <div className="mb-6">
                <span className="text-3xl sm:text-4xl font-bold text-on-surface">
                  ${billingCycle === 'monthly' ? '49' : '39'}
                </span>
                <span className="text-xs text-on-surface-variant font-medium"> /month</span>
                {billingCycle === 'annual' && (
                  <p className="text-[11px] text-tertiary font-semibold mt-1">Billed annually ($468/yr)</p>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start text-xs font-semibold text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mr-2" />
                  Unlimited Smart Invoices
                </li>
                <li className="flex items-start text-xs font-semibold text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mr-2" />
                  Autonomous AI Collection Copilot
                </li>
                <li className="flex items-start text-xs font-semibold text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mr-2" />
                  Multi-Tone Template Generator
                </li>
                <li className="flex items-start text-xs font-semibold text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mr-2" />
                  Predictive Debtor Risk Scoring
                </li>
                <li className="flex items-start text-xs font-semibold text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mr-2" />
                  Priority 24/7 Support
                </li>
              </ul>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => handleSelectPlan('Professional')}
              className="w-full shadow-md"
            >
              {profile.plan === 'Professional' ? 'Active Plan' : 'Upgrade to Professional'}
            </Button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-surface rounded-2xl border border-outline-variant p-6 sm:p-7 flex flex-col justify-between shadow-xs">
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-on-surface mb-1">Enterprise</h3>
                <p className="text-xs text-on-surface-variant">Custom workflows for multi-entity operations.</p>
              </div>

              <div className="mb-6">
                <span className="text-3xl sm:text-4xl font-bold text-on-surface">Custom</span>
                <span className="text-xs text-on-surface-variant font-medium"> / bespoke</span>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start text-xs text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mr-2" />
                  Everything in Professional
                </li>
                <li className="flex items-start text-xs text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mr-2" />
                  Custom Fine-Tuned AI Models
                </li>
                <li className="flex items-start text-xs text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mr-2" />
                  Dedicated Account Executive
                </li>
                <li className="flex items-start text-xs text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mr-2" />
                  Custom ERP & Accounting Integrations
                </li>
              </ul>
            </div>

            <Button
              variant="secondary"
              size="md"
              onClick={() => showToast({ title: 'Enterprise Inquiry Sent', description: 'Our sales team will contact you shortly.', type: 'info' })}
              className="w-full"
            >
              Contact Enterprise Sales
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
