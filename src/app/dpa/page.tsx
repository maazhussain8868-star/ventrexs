import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import LegalLayout from '@/components/legal/LegalLayout';
import {
  Shield,
  FileText,
  Lock,
  Database,
  Server,
  CheckCircle2,
  AlertCircle,
  Globe,
} from 'lucide-react';
import { BRAND } from '@/config/brand';

export const metadata: Metadata = {
  title: `Data Processing Addendum (DPA) | ${BRAND.name}`,
  description:
    `GDPR Article 28 and CCPA compliant Data Processing Addendum (DPA) outlining ${BRAND.name} data processing terms, technical safeguards, and authorized subprocessors.`,
};

export default function DataProcessingAddendumPage() {
  return (
    <LegalLayout
      title="Data Processing Addendum (DPA)"
      subtitle={`This Data Processing Addendum ("DPA") supplements the ${BRAND.name} Terms of Service and applies where GDPR, UK GDPR, CCPA/CPRA, or global privacy legislation governs the processing of personal data.`}
      lastUpdated="August 24, 2026"
      effectiveDate="August 24, 2026"
      version="v2.4 (GDPR Art. 28 Compliant)"
      category="Data Protection & Privacy Addenda"
    >
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            1. Scope & Definitions
          </h2>
          <p>
            This DPA applies to the processing of Personal Data by <strong>{BRAND.legalName}</strong> on behalf of the Customer (&quot;Customer&quot;, &quot;Controller&quot;, &quot;You&quot;) in connection with the provision of the {BRAND.name} Accounts Receivable SaaS Platform.
          </p>
          <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
            <li><strong>&quot;Controller&quot;</strong> means the entity that determines the purposes and means of processing Personal Data (The Customer).</li>
            <li><strong>&quot;Processor&quot;</strong> means {BRAND.legalName}, which processes Personal Data strictly on behalf of and pursuant to instructions from Controller.</li>
            <li><strong>&quot;Data Subject&quot;</strong> means identified or identifiable natural persons whose personal data is uploaded or processed (e.g., Customer representatives, end-client billing contacts).</li>
            <li><strong>&quot;Subprocessor&quot;</strong> means any third-party data processor engaged by {BRAND.name} to deliver technical infrastructure services.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            2. Roles & Processing Instructions
          </h2>
          <p>
            {BRAND.legalName} agrees to process Personal Data exclusively in accordance with documented instructions from Customer, including regarding transfers of Personal Data to third countries, unless required to do so by applicable Union or Member State law.
          </p>
          <div className="p-4 rounded-xl bg-[#050812] border border-slate-800 text-xs text-slate-300 space-y-2">
            <p><strong>• Confidentiality:</strong> {BRAND.legalName} ensures that all personnel authorized to process Customer Personal Data have committed themselves to strict confidentiality obligations.</p>
            <p><strong>• Purpose Limitation:</strong> {BRAND.legalName} shall not process, sell, retain, or monetize Customer data for any purpose other than providing the agreed SaaS invoicing and collection operations.</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-400" />
            3. Authorized Subprocessors
          </h2>
          <p>
            Customer grants general authorization for {BRAND.legalName} to engage the following infrastructure subprocessors:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-800 text-xs text-slate-300 rounded-xl overflow-hidden">
              <thead className="bg-[#050812] text-slate-200 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3 text-left">Subprocessor</th>
                  <th className="p-3 text-left">Entity & Location</th>
                  <th className="p-3 text-left">Processing Scope</th>
                  <th className="p-3 text-left">Transfer Mechanism</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                <tr>
                  <td className="p-3 font-semibold text-white">Supabase Inc.</td>
                  <td className="p-3">USA / EU</td>
                  <td className="p-3">Managed Postgres Database, Row Level Security, Auth Engine</td>
                  <td className="p-3 font-mono text-[11px]">Standard Contractual Clauses (SCCs)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Stripe Inc.</td>
                  <td className="p-3">USA</td>
                  <td className="p-3">Payment processing, merchant settlement, card tokenization</td>
                  <td className="p-3 font-mono text-[11px]">SCCs / DPF Compliant</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Resend Inc.</td>
                  <td className="p-3">USA</td>
                  <td className="p-3">Transactional billing email delivery</td>
                  <td className="p-3 font-mono text-[11px]">SCCs</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Twilio Inc.</td>
                  <td className="p-3">USA</td>
                  <td className="p-3">SMS reminder transmission & TCPA opt-out management</td>
                  <td className="p-3 font-mono text-[11px]">SCCs</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Meta Platforms Ireland</td>
                  <td className="p-3">Ireland / USA</td>
                  <td className="p-3">WhatsApp Cloud API reminder delivery</td>
                  <td className="p-3 font-mono text-[11px]">EU DPA / SCCs</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Google LLC (Gemini API)</td>
                  <td className="p-3">USA</td>
                  <td className="p-3">Read-only AR copilot draft generation (Zero public model training)</td>
                  <td className="p-3 font-mono text-[11px]">SCCs</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            4. Technical & Organizational Security Measures (TOMs)
          </h2>
          <p>
            {BRAND.name} maintains rigorous technical and organizational measures pursuant to GDPR Article 32:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
            <li><strong>Tenant Isolation:</strong> Database-level Row Level Security (RLS) guaranteeing absolute logical segregation between different merchant tenants.</li>
            <li><strong>Encryption:</strong> Enforced TLS 1.3 encryption for all data in transit; AES-256 encryption for database storage and backups at rest.</li>
            <li><strong>Cryptographic Webhook Signatures:</strong> Inbound payment webhooks validated using HMAC SHA-256 signatures to reject replay or tampering attacks.</li>
            <li><strong>Deterministic Ethical Guardrails:</strong> Mathematical balance validation rejecting interest or unauthorized balance modification.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            5. Security Incident Management & Notification
          </h2>
          <p>
            In the event of a confirmed Security Incident resulting in unlawful destruction, loss, alteration, or unauthorized disclosure of Customer Personal Data, {BRAND.legalName} shall:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
            <li>Notify affected Customers without undue delay and, where feasible, within <strong>72 hours</strong> of becoming aware of the incident.</li>
            <li>Provide relevant details describing the nature of the breach, categories of data subjects impacted, and remedial actions undertaken.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            6. Return & Deletion of Customer Personal Data
          </h2>
          <p>
            Upon termination of Services or receipt of a deletion instruction from Customer, {BRAND.legalName} shall delete or return all Customer Personal Data within 30 days, in accordance with our <Link href="/data-retention" className="text-blue-400 hover:underline">Data Retention Policy</Link>, retaining only records required under applicable commercial tax and financial auditing laws.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
