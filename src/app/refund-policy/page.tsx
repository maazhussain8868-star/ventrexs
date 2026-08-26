import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import LegalLayout from '@/components/legal/LegalLayout';
import {
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Mail,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { BRAND } from '@/config/brand';

export const metadata: Metadata = {
  title: `Refund & Cancellation Policy | ${BRAND.name}`,
  description:
    `Transparent 14-day money-back guarantee, subscription cancellation terms, and refund eligibility criteria for ${BRAND.name}.`,
};

export default function RefundPolicyPage() {
  return (
    <LegalLayout
      title="Refund & Cancellation Policy"
      subtitle="We believe in transparent, honest software pricing. Learn about our 14-day money-back guarantee, refund eligibility, and self-service cancellation procedures."
      lastUpdated="August 24, 2026"
      effectiveDate="August 24, 2026"
      version="v2.4"
      category="Billing, Refunds & Cancellations"
    >
      <div className="space-y-8">
        {/* 14-Day Guarantee Callout */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 via-[#0B1220] to-indigo-950/60 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-400 flex-shrink-0">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-white">14-Day Money-Back Guarantee</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              If you subscribe to any paid {BRAND.name} tier and find that it does not fit your accounts receivable workflow, contact us within 14 days of your initial payment for a full, no-questions-asked refund.
            </p>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            1. Refund Eligibility & Request Window
          </h2>
          <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
            <li><strong>Initial Subscriptions:</strong> Full refund available within 14 calendar days from the date of the initial payment transaction.</li>
            <li><strong>Annual Subscriptions:</strong> Pro-rata refunds are available within the first 30 days of an annual subscription purchase or annual renewal.</li>
            <li><strong>Monthly Renewals:</strong> Monthly recurring payments are generally non-refundable once the billing cycle begins, unless cancellation was requested prior to the renewal date and failed due to technical error.</li>
            <li><strong>Service Downtime Credit:</strong> In the unlikely event that platform availability falls below our 99.9% commitment under the <Link href="/sla" className="text-blue-400 hover:underline">SLA</Link>, affected enterprise customers are eligible for pro-rata service credits.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-cyan-400" />
            2. Merchant Processing & Third-Party Transaction Fees
          </h2>
          <p>
            {BRAND.name} provides direct software settlement rails connecting your business directly to your Stripe merchant account:
          </p>
          <div className="p-4 rounded-xl bg-[#050812] border border-slate-800 space-y-2 text-xs text-slate-300">
            <p><strong>• Software Subscription Fees:</strong> The fees paid to {BRAND.legalName} for platform access are refundable in accordance with Section 1 above.</p>
            <p><strong>• Customer Invoice Transactions:</strong> Payments collected from your end-customers for your invoices are processed directly by Stripe Connect into your business bank account. {BRAND.name} does not hold or escrow merchant funds. Any customer refunds for invoice payments must be initiated by you directly through your Stripe dashboard.</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            3. How to Cancel Your Subscription
          </h2>
          <p>
            You can cancel your subscription at any time without needing to speak to a sales representative:
          </p>
          <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside">
            <li>Sign in to your {BRAND.name} account.</li>
            <li>Navigate to <Link href="/settings" className="text-blue-400 hover:underline font-semibold">Settings &gt; Billing & Subscriptions</Link>.</li>
            <li>Click <strong>&quot;Cancel Subscription&quot;</strong>.</li>
            <li>Confirm your cancellation. Your plan remains active until the end of the current paid billing period with zero further charges.</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-yellow-400" />
            4. Submitting a Refund Request
          </h2>
          <p>
            To submit a refund request under our 14-day guarantee, email our billing operations team:
          </p>
          <div className="p-4 rounded-xl bg-[#050812] border border-slate-800 text-xs font-mono space-y-1 text-slate-300">
            <p><strong>{BRAND.legalName} — {BRAND.shortName} Billing Department</strong></p>
            <p>Email: <a href={`mailto:${BRAND.billingEmail}`} className="text-blue-400 hover:underline">{BRAND.billingEmail}</a></p>
            <p>Required Details: Account Email, Business Name, Invoice/Transaction ID</p>
            <p>Processing Time: Approved refunds are processed to your original payment method within 3–5 business days.</p>
          </div>
        </section>
      </div>
    </LegalLayout>
  );
}
