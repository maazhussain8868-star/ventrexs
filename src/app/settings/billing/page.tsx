'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PlanBadge } from '@/components/billing/PlanBadge';
import { UsageMeter } from '@/components/billing/UsageMeter';
import { useApp } from '@/context/AppContext';
import { PLANS_CONFIG, PlanKey, BillingInterval } from '@/lib/billing/types';
import { 
  CreditCard, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Calendar, 
  Users, 
  Zap, 
  ArrowRight,
  Clock,
  SlidersHorizontal,
  ChevronRight,
  Info
} from 'lucide-react';

export default function BillingSettingsPage() {
  const { 
    subscription, 
    usageRecords, 
    subscriptionEvents, 
    createCheckoutSession, 
    createCustomerPortalSession, 
    cancelSubscription, 
    reactivateSubscription,
    showToast 
  } = useApp();

  const [billingInterval, setBillingInterval] = useState<BillingInterval>(subscription.billingCycle || 'monthly');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<PlanKey | null>(null);

  const currentPlanConfig = PLANS_CONFIG[subscription.plan] || PLANS_CONFIG.Professional;

  const handlePlanSelect = async (planKey: PlanKey) => {
    if (subscription.status === 'active' && planKey === subscription.plan) {
      showToast({
        title: 'Current Plan',
        description: `You are already subscribed to the ${planKey} plan.`,
        type: 'info',
      });
      return;
    }

    setIsUpgrading(true);
    try {
      const res = await createCheckoutSession(planKey, billingInterval);
      if (res?.checkoutUrl) {
        if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
          window.location.href = res.checkoutUrl;
        }
      }
    } finally {
      setIsUpgrading(false);
    }
  };

  const handlePortalRedirect = async () => {
    await createCustomerPortalSession();
  };

  const handleConfirmCancel = async () => {
    setIsCancelModalOpen(false);
    await cancelSubscription(true);
  };

  const handleReactivate = async () => {
    await reactivateSubscription();
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Next billing cycle';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <AppShell
      title="SaaS Subscription & Billing"
      showBack
      backUrl="/settings"
    >
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/60 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-on-surface tracking-tight">
                Subscription & Quotas
              </h1>
              <PlanBadge plan={subscription.plan} status={subscription.status} />
            </div>
            <p className="text-sm text-on-surface-variant">
              Manage your Ventrexs AI SaaS subscription, review monthly usage caps, and access your Stripe billing portal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handlePortalRedirect}
              className="gap-2 text-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Stripe Customer Portal
            </Button>
          </div>
        </div>

        {/* Pending Cancellation Alert */}
        {subscription.cancelAtPeriodEnd && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-on-surface">Subscription Cancellation Pending</p>
                <p className="text-on-surface-variant">
                  Your plan is scheduled to cancel on <span className="font-semibold text-on-surface">{formatDate(subscription.currentPeriodEnd)}</span>. You maintain full feature access until then.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleReactivate}
              className="shrink-0 text-xs gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Resume Subscription
            </Button>
          </div>
        )}

        {/* Active Subscription Overview Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-6 shadow-xs relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Plan Info */}
            <div className="space-y-2 md:border-r md:border-outline-variant/60 md:pr-6">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Current Plan
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-on-surface tracking-tight">
                  {currentPlanConfig.name}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                {currentPlanConfig.tagline}
              </p>
              <div className="pt-2 flex items-center gap-2">
                <Badge 
                  variant={subscription.status === 'active' ? 'success' : 'neutral'} 
                  label={`Status: ${subscription.status.toUpperCase()}`}
                />
                <Badge 
                  variant="neutral"
                  label={subscription.billingCycle === 'annual' ? 'Annual Billing' : 'Monthly Billing'}
                />
              </div>
            </div>

            {/* Renewal & Pricing */}
            <div className="space-y-2 md:border-r md:border-outline-variant/60 md:pr-6">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Investment & Renewal
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono text-on-surface">
                  ${subscription.priceAmount}
                </span>
                <span className="text-xs text-on-surface-variant">
                  / {subscription.billingCycle === 'annual' ? 'year' : 'month'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant pt-1">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>Next renewal: <strong className="text-on-surface">{formatDate(subscription.currentPeriodEnd)}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-tertiary">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Halal-compliant transparent pricing (Zero hidden charges)</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-2.5 justify-center md:pl-2">
              <Button
                variant="primary"
                onClick={() => {
                  const target = subscription.plan === 'Starter' ? 'Professional' : 'Enterprise';
                  handlePlanSelect(target);
                }}
                className="w-full gap-2 text-xs"
                disabled={isUpgrading}
              >
                <Sparkles className="w-4 h-4" />
                {subscription.plan === 'Enterprise' ? 'Manage Custom Limits' : 'Upgrade Plan'}
              </Button>

              {!subscription.cancelAtPeriodEnd ? (
                <Button
                  variant="ghost"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="w-full text-xs text-on-surface-variant hover:text-error"
                >
                  Cancel Subscription
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleReactivate}
                  className="w-full text-xs text-primary"
                >
                  Reactivate Subscription
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Real-time Quota & Usage Meters */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-on-surface tracking-tight">
                Current Period Quotas & Usage
              </h2>
              <p className="text-xs text-on-surface-variant">
                Live consumption metrics synchronized across AI dispatch, communications, field jobs, and surveys.
              </p>
            </div>
            <span className="text-xs text-on-surface-variant flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-primary" />
              Resets {formatDate(subscription.currentPeriodEnd)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <UsageMeter
              metric="ai_receptionist_chats"
              label="AI Receptionist Chats"
              current={usageRecords.ai_receptionist_chats?.currentUsage || 0}
              limit={usageRecords.ai_receptionist_chats?.limit || 500}
              isUnlimited={usageRecords.ai_receptionist_chats?.isUnlimited}
              unit="chats"
            />
            <UsageMeter
              metric="sms_messages"
              label="Outbound SMS Dispatches"
              current={usageRecords.sms_messages?.currentUsage || 0}
              limit={usageRecords.sms_messages?.limit || 1000}
              isUnlimited={usageRecords.sms_messages?.isUnlimited}
              unit="msgs"
            />
            <UsageMeter
              metric="email_messages"
              label="Email Invoices & Alerts"
              current={usageRecords.email_messages?.currentUsage || 0}
              limit={usageRecords.email_messages?.limit || 5000}
              isUnlimited={usageRecords.email_messages?.isUnlimited}
              unit="emails"
            />
            <UsageMeter
              metric="whatsapp_messages"
              label="WhatsApp Automated Messages"
              current={usageRecords.whatsapp_messages?.currentUsage || 0}
              limit={usageRecords.whatsapp_messages?.limit || 500}
              isUnlimited={usageRecords.whatsapp_messages?.isUnlimited}
              unit="msgs"
            />
            <UsageMeter
              metric="jobs_created"
              label="Active Work Orders (Jobs)"
              current={usageRecords.jobs_created?.currentUsage || 0}
              limit={usageRecords.jobs_created?.limit || 500}
              isUnlimited={usageRecords.jobs_created?.isUnlimited}
              unit="jobs"
            />
            <UsageMeter
              metric="estimates_created"
              label="Proposals & Estimates"
              current={usageRecords.estimates_created?.currentUsage || 0}
              limit={usageRecords.estimates_created?.limit || 500}
              isUnlimited={usageRecords.estimates_created?.isUnlimited}
              unit="estimates"
            />
            <UsageMeter
              metric="review_requests_sent"
              label="Google Review Requests"
              current={usageRecords.review_requests_sent?.currentUsage || 0}
              limit={usageRecords.review_requests_sent?.limit || 250}
              isUnlimited={usageRecords.review_requests_sent?.isUnlimited}
              unit="requests"
            />
            <UsageMeter
              metric="team_members_count"
              label="Team User Seats"
              current={usageRecords.team_members_count?.currentUsage || 1}
              limit={usageRecords.team_members_count?.limit || 5}
              isUnlimited={usageRecords.team_members_count?.isUnlimited}
              unit="users"
            />
          </div>
        </div>

        {/* Section 3: Plan Comparison & Upgrade Grid */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-on-surface tracking-tight">
                Available SaaS Plans
              </h2>
              <p className="text-xs text-on-surface-variant">
                Select the tier that matches your dispatch crew size and automation requirements.
              </p>
            </div>

            {/* Monthly / Annual Billing Interval Toggle */}
            <div className="flex items-center bg-surface-container-high p-1 rounded-xl border border-outline-variant/60 self-start">
              <button
                type="button"
                onClick={() => setBillingInterval('monthly')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  billingInterval === 'monthly'
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingInterval('annual')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  billingInterval === 'annual'
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Annual
                <span className="text-[10px] bg-tertiary/15 text-tertiary px-1.5 py-0.2 rounded-full font-bold">
                  2 Mos Free
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['Starter', 'Professional', 'Enterprise'] as PlanKey[]).map((key) => {
              const plan = PLANS_CONFIG[key];
              const isCurrent = subscription.status === 'active' && subscription.plan === key;
              const price = billingInterval === 'annual' ? plan.priceAnnual : plan.priceMonthly;

              return (
                <div
                  key={key}
                  className={`rounded-2xl p-6 bg-surface-container-lowest border transition-all flex flex-col justify-between ${
                    plan.popular
                      ? 'border-primary ring-2 ring-primary/20 shadow-md relative'
                      : isCurrent
                      ? 'border-tertiary/80 shadow-xs'
                      : 'border-outline-variant/80 hover:border-outline-variant'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                      Most Popular
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg text-on-surface">{plan.name}</h3>
                      {isCurrent && (
                        <Badge variant="info" label="Current" />
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant mb-4 min-h-[32px]">
                      {plan.tagline}
                    </p>

                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-3xl font-extrabold font-mono text-on-surface">
                        ${price}
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        /{billingInterval === 'annual' ? 'year' : 'month'}
                      </span>
                    </div>

                    <div className="space-y-2.5 mb-6 border-t border-outline-variant/60 pt-4">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-on-surface">
                          <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant={isCurrent ? 'outline' : plan.popular ? 'primary' : 'outline'}
                    disabled={isCurrent || isUpgrading}
                    onClick={() => handlePlanSelect(key)}
                    className="w-full text-xs font-bold gap-1.5"
                  >
                    {isCurrent ? (
                      'Active Plan'
                    ) : (
                      <>
                        <span>Select {plan.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Subscription Lifecycle Events & Audit Trail */}
        <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-on-surface">
                Subscription Lifecycle Events
              </h3>
              <p className="text-xs text-on-surface-variant">
                Cryptographically logged subscription updates, checkout events, and renewal transactions.
              </p>
            </div>
            <ShieldCheck className="w-5 h-5 text-tertiary" />
          </div>

          <div className="divide-y divide-outline-variant/50">
            {subscriptionEvents.map((evt) => (
              <div key={evt.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div>
                    <p className="font-semibold text-on-surface">
                      {evt.eventType.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[11px] text-on-surface-variant">
                      {evt.toPlan ? `Target Plan: ${evt.toPlan}` : 'Commercial Account Update'}
                    </p>
                  </div>
                </div>
                <span className="text-on-surface-variant font-mono text-[11px]">
                  {formatDate(evt.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Halal Ethical Billing Disclosure */}
        <div className="p-4 rounded-xl bg-surface-container-high/60 border border-outline-variant/60 flex items-start gap-3">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs text-on-surface-variant space-y-1">
            <p className="font-bold text-on-surface">Ethical SaaS Commercial Invariants</p>
            <p>
              Ventrexs operates under strict zero-riba (no compounding interest, no predatory late payment penalties) commercial standards. All subscription rates are fixed and predictable. You can cancel at any time without punitive termination fees.
            </p>
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel SaaS Subscription?"
      >
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            Are you sure you want to cancel your <strong className="text-on-surface">{subscription.plan}</strong> subscription?
          </p>
          <div className="p-3 rounded-xl bg-surface-container-high text-xs text-on-surface space-y-1.5">
            <p className="font-semibold">What happens next:</p>
            <ul className="list-disc list-inside text-on-surface-variant space-y-1">
              <li>Your workspace remains fully operational until <span className="font-bold text-on-surface">{formatDate(subscription.currentPeriodEnd)}</span>.</li>
              <li>Your historical jobs, invoices, customer feedback, and contacts remain 100% safe and intact.</li>
              <li>You can reactivate your subscription at any time with 1 click.</li>
            </ul>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsCancelModalOpen(false)}
            >
              Keep Subscription
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmCancel}
              className="bg-error hover:bg-error/90 text-white"
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
