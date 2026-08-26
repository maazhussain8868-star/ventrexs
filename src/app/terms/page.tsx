import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import LegalLayout from '@/components/legal/LegalLayout';
import {
  ShieldCheck,
  Scale,
  CreditCard,
  AlertCircle,
  FileCheck,
  Ban,
  MessageSquare,
} from 'lucide-react';
import { BRAND } from '@/config/brand';

export const metadata: Metadata = {
  title: `Terms of Service | ${BRAND.name}`,
  description:
    `Commercial Terms of Service governing the use of ${BRAND.name}, multi-tenant accounts receivable operations, and ethical financial automation.`,
};

export default function TermsOfServicePage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle={`These commercial Terms of Service govern your access to and use of ${BRAND.name}'s accounts receivable, invoicing, customer management, and financial automation platform.`}
      lastUpdated="August 24, 2026"
      effectiveDate="August 24, 2026"
      version="v2.4"
      category="Commercial Terms & Conditions"
    >
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-400" />
            1. Agreement & Acceptance
          </h2>
          <p>
            By creating an account, accessing, or using <strong>{BRAND.name}</strong> (the &quot;Platform&quot; or &quot;Services&quot;), operated by <strong>{BRAND.legalName}</strong> (&quot;{BRAND.companyName}&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you agree to be bound by these Terms of Service, our <Link href="/privacy" className="text-blue-400 hover:underline font-medium">Privacy Policy</Link>, <Link href="/acceptable-use" className="text-blue-400 hover:underline font-medium">Acceptable Use Policy</Link>, and applicable <Link href="/subscription-terms" className="text-blue-400 hover:underline font-medium">Subscription Terms</Link>.
          </p>
          <p>
            If you are entering into this agreement on behalf of a corporation, partnership, or other legal entity, you represent that you possess lawful authority to bind that organization. If you do not agree with these Terms, you must immediately terminate use of the Services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            2. Multi-Tenant Workspaces & Account Security
          </h2>
          <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
            <li><strong>Tenant Isolation:</strong> You are provided a segregated business workspace enforced by PostgreSQL Row Level Security (RLS). You are strictly prohibited from attempting to query, intercept, or access data belonging to other businesses or tenants.</li>
            <li><strong>Credential Confidentiality:</strong> You are responsible for safeguarding your login credentials and ensuring all users under your organization adhere to role-based access rules.</li>
            <li><strong>Audit Logging:</strong> You acknowledge that security-sensitive actions (payment records, customer updates, communication dispatches, account deletion) are logged for forensic audit integrity.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-cyan-400" />
            3. Ethical Financial Standards & Halal-First Integrity
          </h2>
          <p>
            {BRAND.name} is engineered around the core philosophy of <strong>ethical, transparent, and interest-free receivables management</strong>:
          </p>
          <div className="p-4 rounded-xl bg-[#050812] border border-slate-800 space-y-2 text-xs text-slate-300">
            <p><strong>A. Zero Compounding Usury / Interest:</strong> The platform prohibits calculating compounding interest, predatory debt inflation, or unlawful penalty accruals on overdue balances.</p>
            <p><strong>B. Deterministic Ledger Arithmetic:</strong> Remaining invoice balances are strictly computed as <code>remaining_balance = original_amount - payments_received</code>. No AI agent or automated script possesses authority to alter verified financial amounts.</p>
            <p><strong>C. Truthful Communication:</strong> All payment requests and statement summaries must accurately reflect legitimate goods or services delivered.</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            4. Communication Compliance & Affirmative Consent (TCPA)
          </h2>
          <p>
            When utilizing {BRAND.name}&apos;s multi-channel communication engines (Email, SMS via Twilio, WhatsApp via Meta Cloud API):
          </p>
          <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
            <li>You warrant that you have obtained verifiable, affirmative consent (opt-in) from your customers prior to sending automated SMS or WhatsApp notifications.</li>
            <li>You agree to honor all automated opt-out keywords (e.g., STOP, UNSUBSCRIBE, CANCEL) immediately. The platform automatically blocks transmissions to opted-out contacts.</li>
            <li>You shall not use communication rails for marketing spam, unsolicited broadcasts, or harassing debt-collection practices.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-yellow-400" />
            5. Payment Processing & Subscription Billing
          </h2>
          <p>
            Subscription fees are billed in advance on a recurring monthly or annual basis in accordance with our <Link href="/subscription-terms" className="text-blue-400 hover:underline">Subscription Terms</Link>. Card processing is securely executed via Stripe Connect. We do not store raw card numbers or CVV codes on our servers.
          </p>
          <p className="text-xs text-slate-400">
            Refunds are governed by our <Link href="/refund-policy" className="text-blue-400 hover:underline">Refund & Cancellation Policy</Link>, which includes a 14-day money-back guarantee for first-time subscribers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Ban className="w-5 h-5 text-red-400" />
            6. Prohibited Activities
          </h2>
          <p>You agree not to:</p>
          <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
            <li>Reverse engineer, decompile, or attempt to extract source code from the platform.</li>
            <li>Bypass rate limiters, Server Action authorization barriers, or RLS policies.</li>
            <li>Upload fraudulent invoices or process payments for illegal, illicit, or prohibited goods.</li>
            <li>Transmit malware, automated scrapers, or overload server infrastructure.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            7. Limitation of Liability & Disclaimers
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed uppercase font-mono">
            THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. IN NO EVENT SHALL {BRAND.legalName.toUpperCase()}, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF OR IN CONNECTION WITH THE USE OF THE SERVICES, INCLUDING LOSS OF DATA, REVENUE, OR BUSINESS OPPORTUNITY, EXCEEDING THE GREATER OF $100 OR THE FEES PAID BY YOU IN THE TWELVE (12) MONTHS PRECEDING THE EVENT.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white">8. Governing Law & Dispute Resolution</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to conflict of law principles. Any dispute arising under or relating to these Terms shall be resolved through binding arbitration administered in Wilmington, Delaware.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white">9. Termination & Account Deletion</h2>
          <p>
            You may terminate this agreement at any time by executing an account deletion in <Link href="/settings" className="text-blue-400 hover:underline">Settings &gt; Danger Zone</Link> or submitting a request via our public <Link href="/account-deletion" className="text-blue-400 hover:underline">Account Deletion Portal</Link>. Upon termination, your access is revoked and your data is purged in accordance with our <Link href="/data-retention" className="text-blue-400 hover:underline">Data Retention Policy</Link>.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
