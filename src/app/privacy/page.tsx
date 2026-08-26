import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import LegalLayout from '@/components/legal/LegalLayout';
import {
  Shield,
  Lock,
  Database,
  Eye,
  Server,
  Trash2,
  CheckCircle2,
  Mail,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { BRAND } from '@/config/brand';

export const metadata: Metadata = {
  title: `Privacy Policy | ${BRAND.name}`,
  description:
    `Comprehensive Google Play, GDPR, and CCPA compliant Privacy Policy for ${BRAND.name}. Learn how we collect, process, protect, and delete your business and financial data.`,
};

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle={`This Privacy Policy outlines how ${BRAND.legalName} collects, uses, processes, stores, protects, and deletes personal and business data across our web and mobile applications.`}
      lastUpdated="August 24, 2026"
      effectiveDate="August 24, 2026"
      version="v2.4 (Google Play & GDPR Aligned)"
      category="Privacy & Data Protection"
    >
      {/* Table of Contents */}
      <div className="bg-[#050812] border border-slate-800 rounded-2xl p-5 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">
          Table of Contents
        </h3>
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-300 list-decimal list-inside">
          <li><a href="#identity" className="hover:text-blue-400">1. Developer & Entity Identity</a></li>
          <li><a href="#data-collection" className="hover:text-blue-400">2. Information We Collect</a></li>
          <li><a href="#purpose" className="hover:text-blue-400">3. How We Use Your Information</a></li>
          <li><a href="#subprocessors" className="hover:text-blue-400">4. Third-Party Subprocessors & Sharing</a></li>
          <li><a href="#security" className="hover:text-blue-400">5. Data Security & Storage Controls</a></li>
          <li><a href="#ai-governance" className="hover:text-blue-400">6. AI Processing & Gemini Intelligence</a></li>
          <li><a href="#retention-deletion" className="hover:text-blue-400">7. Data Retention & Deletion Rights</a></li>
          <li><a href="#user-rights" className="hover:text-blue-400">8. GDPR, CCPA & Global User Rights</a></li>
          <li><a href="#children" className="hover:text-blue-400">9. Children&apos;s Privacy</a></li>
          <li><a href="#contact" className="hover:text-blue-400">10. Contact & Data Protection Officer</a></li>
        </ol>
      </div>

      {/* 1. Entity Identity */}
      <section id="identity" className="space-y-3 pt-4">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-blue-600/20 text-blue-400 text-xs flex items-center justify-center font-mono">1</span>
          Developer & Application Identity
        </h2>
        <p>
          This application (<strong>{BRAND.name}</strong>) is owned and operated by <strong>{BRAND.legalName}</strong> (&quot;{BRAND.companyName}&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), a commercial software enterprise specializing in multi-tenant accounts receivable automation, invoicing, customer relationship management, and ethical financial operations.
        </p>
        <div className="bg-[#050812] border border-slate-800 rounded-xl p-4 text-xs space-y-1 font-mono text-slate-300">
          <p><strong>Application Name:</strong> {BRAND.name}</p>
          <p><strong>Operating Entity:</strong> {BRAND.legalName}</p>
          <p><strong>Headquarters:</strong> Delaware, United States</p>
          <p><strong>Primary Support & Inquiries:</strong> {BRAND.supportEmail}</p>
          <p><strong>Data Protection Officer (DPO):</strong> {BRAND.privacyEmail}</p>
        </div>
      </section>

      {/* 2. Information We Collect */}
      <section id="data-collection" className="space-y-3 pt-4">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-blue-600/20 text-blue-400 text-xs flex items-center justify-center font-mono">2</span>
          Information We Collect
        </h2>
        <p>
          We strictly collect information necessary to deliver, authenticate, secure, and maintain accounts receivable management services:
        </p>
        
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-[#050812] border border-slate-800 space-y-1.5">
            <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              A. Account & Profile Credentials
            </h3>
            <p className="text-xs text-slate-400">
              When creating an account, we collect your full name, business email address, company/trade name, role (e.g., owner, admin), and encrypted authentication tokens managed through Supabase Auth.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#050812] border border-slate-800 space-y-1.5">
            <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              B. Business & Invoicing Data
            </h3>
            <p className="text-xs text-slate-400">
              Customer contact records (client name, client email, phone number, physical address, communication opt-in status), invoice numbers, issue dates, due dates, itemized line items, subtotal, original amounts due, payments recorded, and remaining balances.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#050812] border border-slate-800 space-y-1.5">
            <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              C. Communication & Telephony Records
            </h3>
            <p className="text-xs text-slate-400">
              When sending payment reminders or statement notices via Email, SMS, or WhatsApp with affirmative consent, we log provider message identifiers, transmission timestamps, delivery statuses, and opt-out/STOP events. We do not inspect or sell message contents.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#050812] border border-slate-800 space-y-1.5">
            <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              D. Technical & Security Audit Logs
            </h3>
            <p className="text-xs text-slate-400">
              IP addresses, request headers, browser user agent, session timestamps, and security audit events strictly used to detect unauthorized cross-tenant access attempts, brute-force anomalies, and rate-limiting enforcement.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Purpose */}
      <section id="purpose" className="space-y-3 pt-4">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-blue-600/20 text-blue-400 text-xs flex items-center justify-center font-mono">3</span>
          How We Use Your Information
        </h2>
        <p>We process your data under the following legitimate legal and contractual grounds:</p>
        <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside pl-1">
          <li><strong>Service Delivery:</strong> To generate invoices, record payments, calculate outstanding aging balances, and maintain customer accounts.</li>
          <li><strong>Payment Settlement:</strong> To facilitate card and ACH checkout links via integrated payment processors (Stripe Connect).</li>
          <li><strong>Consensual Notifications:</strong> To dispatch payment confirmation receipts, approaching due notices, and overdue follow-ups upon your review and approval.</li>
          <li><strong>Security & Tenant Isolation:</strong> To enforce cryptographic webhook verification, Row Level Security (RLS), and prevent cross-tenant data leakage.</li>
          <li><strong>Legal & Tax Compliance:</strong> To generate audit trails, tax summaries, and maintain statutory accounting records Net 7 years where required by law.</li>
        </ul>
      </section>

      {/* 4. Subprocessors */}
      <section id="subprocessors" className="space-y-3 pt-4">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-blue-600/20 text-blue-400 text-xs flex items-center justify-center font-mono">4</span>
          Third-Party Subprocessors & Data Sharing
        </h2>
        <p>
          <strong>{BRAND.name} does not sell, rent, monetize, or trade your personal or customer data to third parties, data brokers, or advertising networks.</strong> We share data exclusively with verified technical infrastructure subprocessors under strict Data Processing Addenda (DPAs):
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-800 text-xs text-slate-300 rounded-xl overflow-hidden">
            <thead className="bg-[#050812] text-slate-200 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3 text-left">Subprocessor</th>
                <th className="p-3 text-left">Purpose</th>
                <th className="p-3 text-left">Data Transmitted</th>
                <th className="p-3 text-left">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              <tr>
                <td className="p-3 font-semibold text-white">Supabase Inc.</td>
                <td className="p-3">Managed PostgreSQL Database & Auth Engine</td>
                <td className="p-3">User profiles, encrypted auth credentials, business invoices, customer metadata</td>
                <td className="p-3 font-mono text-[11px]">US / EU</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Stripe Inc.</td>
                <td className="p-3">Payment Processing & Subscription Billing</td>
                <td className="p-3">Customer email, billing addresses, invoice payment amounts (PCI-DSS Level 1 managed by Stripe; {BRAND.shortName} never stores raw card numbers)</td>
                <td className="p-3 font-mono text-[11px]">United States</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Resend Inc.</td>
                <td className="p-3">Transactional Email Dispatch</td>
                <td className="p-3">Recipient email address, invoice PDF links, email delivery status</td>
                <td className="p-3 font-mono text-[11px]">United States</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Twilio Inc.</td>
                <td className="p-3">SMS Reminders & TCPA Opt-Out Routing</td>
                <td className="p-3">Recipient phone number, reminder text, opt-out status</td>
                <td className="p-3 font-mono text-[11px]">United States</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Meta Platforms Ireland</td>
                <td className="p-3">WhatsApp Cloud API Communication</td>
                <td className="p-3">Opted-in customer WhatsApp number, template notification metadata</td>
                <td className="p-3 font-mono text-[11px]">Ireland / US</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Google LLC (Gemini)</td>
                <td className="p-3">Read-Only Financial Intelligence & Copilot</td>
                <td className="p-3">Aging invoice balances, overdue days, customer communication tone parameters</td>
                <td className="p-3 font-mono text-[11px]">United States</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Security */}
      <section id="security" className="space-y-3 pt-4">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-blue-600/20 text-blue-400 text-xs flex items-center justify-center font-mono">5</span>
          Data Security & Technical Controls
        </h2>
        <p>
          {BRAND.name} implements robust, multi-layered technical and organizational safeguards:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#050812] border border-slate-800">
            <p className="font-bold text-white mb-1">Postgres Row Level Security (RLS)</p>
            <p className="text-slate-400">Enforces zero cross-tenant leakage at the database engine layer. Every query requires verified business membership.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#050812] border border-slate-800">
            <p className="font-bold text-white mb-1">Encryption in Transit & At Rest</p>
            <p className="text-slate-400">All data in transit is encrypted using modern TLS 1.3. Database volumes and backups are encrypted with AES-256.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#050812] border border-slate-800">
            <p className="font-bold text-white mb-1">Cryptographic Webhook Validation</p>
            <p className="text-slate-400">Inbound Stripe webhooks are verified using HMAC SHA-256 signatures with timestamp tolerance barriers.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#050812] border border-slate-800">
            <p className="font-bold text-white mb-1">Server-Side Authorization</p>
            <p className="text-slate-400">Client mutation inputs are never trusted directly. Role-based membership is evaluated server-side before execution.</p>
          </div>
        </div>
      </section>

      {/* 6. AI Governance */}
      <section id="ai-governance" className="space-y-3 pt-4">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-blue-600/20 text-blue-400 text-xs flex items-center justify-center font-mono">6</span>
          AI Processing & Gemini Copilot Governance
        </h2>
        <p>
          {BRAND.name} utilizes Google Gemini models strictly in an <strong>advisory, read-only copilot capacity</strong>:
        </p>
        <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside pl-1">
          <li><strong>Zero Ledger Mutation:</strong> AI models cannot modify invoice balances, trigger payments, or mutate financial state. Remaining balance calculations are strictly computed via deterministic database arithmetic (<code>remaining_balance = original_amount - payments_received</code>).</li>
          <li><strong>Human-in-the-Loop:</strong> No reminder, SMS, or WhatsApp message generated by the AI copilot is ever dispatched without explicit human approval.</li>
          <li><strong>No Foundation Model Training:</strong> Your business data and customer invoices are never used to train public LLM models or shared across commercial AI pools.</li>
          <li><strong>Halal-First & Ethical Debt Safeguards:</strong> Our deterministic validation layer rejects all prompt outputs attempting usurious interest calculations, compounding late fees, predatory financing, or deceptive debt-collection notices.</li>
        </ul>
      </section>

      {/* 7. Retention & Deletion */}
      <section id="retention-deletion" className="space-y-3 pt-4">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-blue-600/20 text-blue-400 text-xs flex items-center justify-center font-mono">7</span>
          Data Retention & Deletion Rights
        </h2>
        <p>
          In full accordance with the <strong>Google Play Data Safety Mandate</strong>, <strong>GDPR Article 17 (Right to Erasure)</strong>, and <strong>CCPA/CPRA</strong>, users have full autonomy to delete their account and associated personal data:
        </p>
        
        <div className="p-4 rounded-2xl bg-[#050812] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <Trash2 className="w-4 h-4" />
            <span>Two Ways to Request Account & Data Deletion</span>
          </div>
          <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside">
            <li>
              <strong>In-App Self-Service Deletion:</strong> Authenticated users can navigate to <Link href="/settings" className="text-blue-400 hover:underline font-semibold">Settings &gt; Danger Zone</Link> to permanently delete their account profile, customer lists, and business workspace in real-time.
            </li>
            <li>
              <strong>Public Unauthenticated Deletion Portal:</strong> Anyone who previously created an account or wishes to purge their contact details can submit a request via our public <Link href="/account-deletion" className="text-blue-400 hover:underline font-semibold">Account Deletion Page (/account-deletion)</Link> without requiring active login.
            </li>
          </ol>
          <p className="text-[11px] text-slate-400">
            *Note: Historical finalized tax invoices and statutory audit logs are retained up to statutory accounting retention horizons (Net 7 years) where mandated by commercial tax laws, after which they are permanently destroyed.
          </p>
        </div>
      </section>

      {/* 8. Global User Rights */}
      <section id="user-rights" className="space-y-3 pt-4">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-blue-600/20 text-blue-400 text-xs flex items-center justify-center font-mono">8</span>
          GDPR, CCPA & Global Privacy Rights
        </h2>
        <p>Depending on your jurisdiction, you are entitled to the following enforceable privacy rights:</p>
        <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside pl-1">
          <li><strong>Right of Access:</strong> Request a complete export of personal data held about you in standard JSON or CSV format.</li>
          <li><strong>Right to Rectification:</strong> Update inaccurate business credentials or customer contact information via Settings.</li>
          <li><strong>Right to Erasure / Deletion:</strong> Permanently delete your profile and personal data.</li>
          <li><strong>Right to Object & Opt-Out:</strong> Withdraw consent for SMS/WhatsApp notices at any time (e.g., reply STOP).</li>
          <li><strong>Right to Non-Discrimination:</strong> We will never degrade service quality or deny access for exercising privacy rights.</li>
        </ul>
      </section>

      {/* 9. Children's Privacy */}
      <section id="children" className="space-y-3 pt-4">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-blue-600/20 text-blue-400 text-xs flex items-center justify-center font-mono">9</span>
          Children&apos;s Privacy
        </h2>
        <p>
          {BRAND.name} is a commercial B2B financial software platform designed exclusively for business entities and professional operators. We do not knowingly market to, collect, or process information from individuals under the age of 18. If you believe a minor has created an account, contact <a href={`mailto:${BRAND.privacyEmail}`} className="text-blue-400 hover:underline">{BRAND.privacyEmail}</a> immediately for expedited removal.
        </p>
      </section>

      {/* 10. Contact */}
      <section id="contact" className="space-y-3 pt-4">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-blue-600/20 text-blue-400 text-xs flex items-center justify-center font-mono">10</span>
          Contact & Data Protection Officer
        </h2>
        <p>For any questions, compliance audits, GDPR/CCPA inquiries, or data deletion requests, contact our Data Protection Team:</p>
        <div className="p-4 rounded-xl bg-[#050812] border border-slate-800 text-xs font-mono space-y-1 text-slate-300">
          <p><strong>{BRAND.legalName} — Data Protection Office</strong></p>
          <p>Email: <a href={`mailto:${BRAND.privacyEmail}`} className="text-blue-400 hover:underline">{BRAND.privacyEmail}</a></p>
          <p>Legal Inquiries: <a href={`mailto:${BRAND.legalEmail}`} className="text-blue-400 hover:underline">{BRAND.legalEmail}</a></p>
          <p>Physical Notice Address: {BRAND.legalName}, Corporation Trust Center, 1209 Orange St, Wilmington, DE 19801, USA</p>
        </div>
      </section>
    </LegalLayout>
  );
}
