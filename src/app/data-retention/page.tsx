import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import LegalLayout from '@/components/legal/LegalLayout';
import {
  Trash2,
  Clock,
  Database,
  Calendar,
  ShieldCheck,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { BRAND } from '@/config/brand';

export const metadata: Metadata = {
  title: `Data Retention & Deletion Schedule | ${BRAND.name}`,
  description:
    `Documented Data Retention and Deletion Schedule for ${BRAND.name} in accordance with Google Play, GDPR Article 17, and commercial accounting regulations.`,
};

export default function DataRetentionPolicyPage() {
  return (
    <LegalLayout
      title="Data Retention & Deletion Policy"
      subtitle={`Detailed data lifecycle rules, category-specific retention schedules, and automated hard-purge timelines for ${BRAND.name}.`}
      lastUpdated="August 24, 2026"
      effectiveDate="August 24, 2026"
      version="v2.4 (GDPR Art. 17 & Google Play Aligned)"
      category="Data Lifecycle & Retention"
    >
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            1. Data Lifecycle & Retention Philosophy
          </h2>
          <p>
            {BRAND.name} adheres to strict data minimization principles under GDPR Article 5(1)(e). We retain personal and business information only for as long as necessary to fulfill the operational, contractual, and statutory accounting purposes for which it was gathered.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            2. Category-Specific Data Retention Schedule
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-800 text-xs text-slate-300 rounded-xl overflow-hidden">
              <thead className="bg-[#050812] text-slate-200 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3 text-left">Data Category</th>
                  <th className="p-3 text-left">Data Elements</th>
                  <th className="p-3 text-left">Active Retention</th>
                  <th className="p-3 text-left">Post-Deletion Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                <tr>
                  <td className="p-3 font-semibold text-white">User Accounts & Authentication</td>
                  <td className="p-3">User name, email, password hash, role, 2FA settings</td>
                  <td className="p-3 font-mono text-[11px]">Duration of active account</td>
                  <td className="p-3 font-mono text-[11px] text-emerald-400">Purged within 30 days</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Customer CRM Directory</td>
                  <td className="p-3">Client names, client emails, phone numbers, billing addresses</td>
                  <td className="p-3 font-mono text-[11px]">Duration of active business workspace</td>
                  <td className="p-3 font-mono text-[11px] text-emerald-400">Purged within 30 days</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Tax Invoices & Transaction Ledgers</td>
                  <td className="p-3">Invoice numbers, payment records, issue/due dates, subtotal, tax breakdown</td>
                  <td className="p-3 font-mono text-[11px]">Duration of subscription</td>
                  <td className="p-3 font-mono text-[11px] text-amber-400">7 years (Statutory accounting & tax audit laws)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Communication & Telephony Logs</td>
                  <td className="p-3">Message IDs, delivery statuses, transmission timestamps</td>
                  <td className="p-3 font-mono text-[11px]">90 days rolling window</td>
                  <td className="p-3 font-mono text-[11px] text-emerald-400">Automatically pruned after 90 days</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Security & Audit Logs</td>
                  <td className="p-3">IP address, session timestamps, authorization failure events</td>
                  <td className="p-3 font-mono text-[11px]">12 months rolling window</td>
                  <td className="p-3 font-mono text-[11px] text-emerald-400">Automatically pruned after 12 months</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Database Backup Snapshots</td>
                  <td className="p-3">Encrypted full database point-in-time archives</td>
                  <td className="p-3 font-mono text-[11px]">30 days rolling disaster recovery</td>
                  <td className="p-3 font-mono text-[11px] text-emerald-400">Overwritten/destroyed after 30 days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-400" />
            3. Account & Data Deletion Workflows
          </h2>
          <p>
            When an account deletion is initiated via our in-app settings or public request form:
          </p>
          <div className="p-4 rounded-xl bg-[#050812] border border-slate-800 text-xs text-slate-300 space-y-2">
            <p><strong>• Immediate Action:</strong> User session is invalidated, and personal login credentials are removed.</p>
            <p><strong>• 30-Day Hard Purge:</strong> All customer directories, draft invoices, and personal communication records are permanently deleted across our database and replica clusters within 30 calendar days.</p>
            <p><strong>• Statutory Preservation:</strong> Finalized, settled commercial tax invoices are retained in anonymized, read-only format strictly to comply with corporate tax laws (Net 7 years).</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white">4. Submitting a Deletion Request</h2>
          <p>
            You can trigger account deletion immediately through <Link href="/settings" className="text-blue-400 hover:underline">Settings &gt; Danger Zone</Link> or submit a request via our public <Link href="/account-deletion" className="text-blue-400 hover:underline">Account Deletion Portal</Link>.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
