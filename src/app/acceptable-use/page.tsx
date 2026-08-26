import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import LegalLayout from '@/components/legal/LegalLayout';
import {
  Ban,
  ShieldAlert,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Scale,
} from 'lucide-react';
import { BRAND } from '@/config/brand';

export const metadata: Metadata = {
  title: `Acceptable Use Policy (AUP) | ${BRAND.name}`,
  description:
    `Acceptable Use Policy for ${BRAND.name} detailing ethical debt collection mandates, TCPA communication consent rules, and prohibited activities.`,
};

export default function AcceptableUsePage() {
  return (
    <LegalLayout
      title="Acceptable Use Policy (AUP)"
      subtitle={`This Acceptable Use Policy defines permitted and prohibited conduct on ${BRAND.name} to preserve platform integrity, prevent predatory debt collection, and protect end-recipients.`}
      lastUpdated="August 24, 2026"
      effectiveDate="August 24, 2026"
      version="v2.4"
      category="Compliance & Acceptable Use"
    >
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-400" />
            1. Purpose & Standards of Conduct
          </h2>
          <p>
            {BRAND.name} is built to foster transparent, professional, and ethical financial relationships between commercial businesses and their clients. All users must operate with honesty, integrity, and compliance with all applicable financial and telecommunications laws.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Ban className="w-5 h-5 text-red-400" />
            2. Prohibited Debt Collection Practices
          </h2>
          <p>You agree never to use the Platform for:</p>
          <div className="p-4 rounded-xl bg-[#050812] border border-red-500/20 space-y-2 text-xs text-slate-300">
            <p><strong>• Predatory Debt Collection:</strong> Harassment, threats of physical harm, profanity, or deceptive claims regarding legal arrest or property seizure.</p>
            <p><strong>• Compounding Usurious Charges:</strong> Calculating or invoicing unlawful, compounding interest fees or unauthorized hidden penalty surcharges.</p>
            <p><strong>• Fictitious Receivables:</strong> Invoicing for non-existent products, fabricated services, or unauthorized credit card rebilling schemes.</p>
            <p><strong>• Fraudulent Impersonation:</strong> Impersonating government agencies, court officials, or regulatory bodies in payment notices.</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            3. Multi-Channel Messaging & Telephony Rules (TCPA / CTIA)
          </h2>
          <p>
            When using our Email, SMS (Twilio), or WhatsApp (Meta) communication engines:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
            <li><strong>Affirmative Consent:</strong> You must possess verifiable opt-in consent from the recipient to contact their phone number for billing notifications.</li>
            <li><strong>Opt-Out Compliance:</strong> You must honor opt-out requests immediately. Our platform automatically suppresses future sends when a recipient replies STOP or UNSUBSCRIBE. You must not attempt to circumvent this suppression.</li>
            <li><strong>Permitted Sending Hours:</strong> You agree not to schedule automated SMS/WhatsApp alerts outside standard recipient local daytime hours (8:00 AM to 9:00 PM local time).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            4. System & Infrastructure Integrity
          </h2>
          <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
            <li>Do not attempt to probe, scan, or test the vulnerability of our systems without prior authorization.</li>
            <li>Do not attempt to bypass tenant isolation boundaries, Row Level Security (RLS), or Next.js Server Action authorization.</li>
            <li>Do not utilize automated scripts, scrapers, or bots to overwhelm platform endpoints or exceed distributed rate limits.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            5. Violation Reporting & Enforcement
          </h2>
          <p>
            Violations of this Acceptable Use Policy may result in immediate warning, suspension of messaging rails, or permanent account termination. To report a violation of this policy:
          </p>
          <div className="p-4 rounded-xl bg-[#050812] border border-slate-800 text-xs font-mono text-slate-300">
            <p>Email: <a href="mailto:abuse@ventrexs.com" className="text-blue-400 hover:underline">abuse@ventrexs.com</a></p>
          </div>
        </section>
      </div>
    </LegalLayout>
  );
}
