import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import LegalLayout from '@/components/legal/LegalLayout';
import {
  CreditCard,
  CheckCircle2,
  Calendar,
  Zap,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { BRAND } from '@/config/brand';

export const metadata: Metadata = {
  title: `Subscription Terms & Billing Policy | ${BRAND.name}`,
  description:
    `SaaS Subscription tiers, billing cycles, trial policies, payment settlement rules, and cancellation terms for ${BRAND.name}.`,
};

export default function SubscriptionTermsPage() {
  return (
    <LegalLayout
      title="Subscription Terms & Billing Policy"
      subtitle={`Comprehensive rules governing ${BRAND.name}'s software subscription tiers, billing cycles, trial periods, entitlement enforcement, and payment settlement.`}
      lastUpdated="August 24, 2026"
      effectiveDate="August 24, 2026"
      version="v2.4"
      category="SaaS Billing & Subscriptions"
    >
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            1. Software Subscription Plans & Tiers
          </h2>
          <p>
            {BRAND.name} is provided on a software-as-a-service (SaaS) subscription basis with transparent, flat-rate pricing. We offer three standardized plan tiers:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#050812] border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-white">Starter</h3>
                <span className="text-xs font-mono font-bold text-blue-400">$29/mo</span>
              </div>
              <p className="text-xs text-slate-400">Essential invoicing and email collection automation for small business operators.</p>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Up to 50 active invoices/mo</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Automated Email reminders</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Stripe Card Checkout</li>
                <li className="flex items-center gap-1.5 text-slate-500">• SMS & WhatsApp not included</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-[#050812] border border-blue-500/30 shadow-[0_0_20px_rgba(37,99,235,0.15)] space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-white">Professional</h3>
                <span className="text-xs font-mono font-bold text-blue-400">$79/mo</span>
              </div>
              <p className="text-xs text-slate-400">Multi-channel communication, AI copilot intelligence, and ACH bank payment rails.</p>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Unlimited active invoices</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Email, SMS & WhatsApp rails</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> AI Aging Analysis Copilot</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Direct ACH Bank Settlement</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-[#050812] border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-white">Enterprise</h3>
                <span className="text-xs font-mono font-bold text-blue-400">$249/mo</span>
              </div>
              <p className="text-xs text-slate-400">High-volume organizations requiring dedicated DPA, SLA guarantees, and priority support.</p>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Custom team seats & roles</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 99.9% Uptime SLA commitment</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Dedicated Account Manager</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            2. 14-Day Free Trial Policy
          </h2>
          <p>
            New organizations automatically receive a complimentary 14-day trial period on the Starter plan. During this period, you have full access to core invoicing capabilities without obligation.
          </p>
          <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
            <li><strong>No Hidden Lock-In:</strong> Your trial status is clearly displayed on your dashboard.</li>
            <li><strong>Expiration Behavior:</strong> When the 14-day trial expires without an active payment method, your subscription transitions to inactive status. Your data remains fully intact and accessible in read-only mode for 30 days.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-cyan-400" />
            3. Payment Methods & Billing Cycles
          </h2>
          <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
            <li><strong>Billing Frequency:</strong> Subscriptions are billed in advance on a recurring monthly or annual cadence on the calendar day matching your initial subscription date.</li>
            <li><strong>Accepted Rails:</strong> Credit Cards (Visa, Mastercard, American Express), Debit Cards, and direct ACH bank debits processed through Stripe.</li>
            <li><strong>Taxes:</strong> All listed subscription fees are exclusive of applicable federal, state, local, or value-added taxes (VAT/GST).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            4. Upgrades, Downgrades & Entitlement Changes
          </h2>
          <p>
            You may modify your subscription plan at any time through <Link href="/settings" className="text-blue-400 hover:underline">Settings &gt; Billing</Link>:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
            <li><strong>Upgrades (e.g., Starter to Professional):</strong> Take effect immediately. Feature gates (such as WhatsApp messaging rails) unlock upon successful billing transaction. Prorated difference is charged automatically.</li>
            <li><strong>Downgrades:</strong> Take effect at the end of the current billing cycle. Advanced features remain active until period expiration.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-yellow-400" />
            5. Cancellation & Data Preservation
          </h2>
          <p>
            You can cancel your subscription at any time with one click. Upon cancellation:
          </p>
          <div className="p-4 rounded-xl bg-[#050812] border border-slate-800 text-xs text-slate-300 space-y-1.5">
            <p><strong>• Active Through Billing Period:</strong> You retain full platform access until the end of your prepaid billing period.</p>
            <p><strong>• Zero Data Loss:</strong> Canceling your subscription does <em>not</em> delete your invoices, customer profiles, or payment history.</p>
            <p><strong>• Permanent Account Deletion:</strong> If you wish to permanently purge all data, use our self-service <Link href="/settings" className="text-blue-400 hover:underline">Account Deletion Tool</Link> or public <Link href="/account-deletion" className="text-blue-400 hover:underline">Deletion Form</Link>.</p>
          </div>
        </section>
      </div>
    </LegalLayout>
  );
}
