import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import LegalLayout from '@/components/legal/LegalLayout';
import {
  Activity,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { BRAND } from '@/config/brand';

export const metadata: Metadata = {
  title: `Service Level Agreement (SLA) | ${BRAND.name}`,
  description:
    `Service Level Agreement (SLA) defining ${BRAND.name} target uptime commitments (99.9%), support response times, and incident severity classifications.`,
};

export default function ServiceLevelAgreementPage() {
  return (
    <LegalLayout
      title="Service Level Agreement (SLA)"
      subtitle="Commitment to service availability, target uptime guarantees, scheduled maintenance windows, and incident response severity tiers."
      lastUpdated="August 24, 2026"
      effectiveDate="August 24, 2026"
      version="v2.4"
      category="Service Commitments & Availability"
    >
      <div className="space-y-8">
        <div className="p-6 rounded-2xl bg-[#050812] border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold flex-shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">99.9% Core Target Uptime</h3>
              <p className="text-xs text-slate-400">Guaranteed API and platform availability for accounts receivable operations.</p>
            </div>
          </div>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Target: 99.9%
          </span>
        </div>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            1. Uptime Measurement & Exclusions
          </h2>
          <p>
            Monthly Uptime Percentage is calculated as the total number of minutes in a calendar month minus the number of minutes of Downtime, divided by the total number of minutes in that month.
          </p>
          <p className="text-xs text-slate-300 font-semibold">Exclusions from Downtime calculations include:</p>
          <ul className="space-y-1.5 text-xs text-slate-400 list-disc list-inside">
            <li>Scheduled maintenance windows communicated at least 48 hours in advance.</li>
            <li>Outages caused by external network providers, DNS providers, or third-party infrastructure (e.g., Stripe merchant checkout outages, carrier-level SMS delivery delays).</li>
            <li>Downtime resulting from Customer misuse, unapproved scrapers, or violation of our <Link href="/acceptable-use" className="text-blue-400 hover:underline">Acceptable Use Policy</Link>.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            2. Incident Severity Levels & Response Times
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-800 text-xs text-slate-300 rounded-xl overflow-hidden">
              <thead className="bg-[#050812] text-slate-200 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3 text-left">Severity Tier</th>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-left">Target Initial Response</th>
                  <th className="p-3 text-left">Status Updates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                <tr>
                  <td className="p-3 font-semibold text-red-400">P1 — Critical</td>
                  <td className="p-3">Core platform or invoicing API completely unavailable for all users</td>
                  <td className="p-3 font-mono text-[11px]">&lt; 30 minutes</td>
                  <td className="p-3 font-mono text-[11px]">Every 1 hour</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-amber-400">P2 — Major</td>
                  <td className="p-3">Core feature impaired (e.g., payment webhook delay, email queue backlog)</td>
                  <td className="p-3 font-mono text-[11px]">&lt; 2 hours</td>
                  <td className="p-3 font-mono text-[11px]">Every 4 hours</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-blue-400">P3 — Moderate</td>
                  <td className="p-3">Non-critical feature issue with acceptable operational workaround</td>
                  <td className="p-3 font-mono text-[11px]">&lt; 8 hours</td>
                  <td className="p-3 font-mono text-[11px]">Daily</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-400">P4 — Minor</td>
                  <td className="p-3">Cosmetic anomaly, documentation inquiry, or general question</td>
                  <td className="p-3 font-mono text-[11px]">&lt; 24 hours</td>
                  <td className="p-3 font-mono text-[11px]">Weekly</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            3. Scheduled Maintenance Windows
          </h2>
          <p>
            Standard infrastructure updates are scheduled during low-traffic periods (Sunday 02:00–04:00 UTC). Emergency security patches may be deployed outside standard windows when necessary to protect tenant security.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
