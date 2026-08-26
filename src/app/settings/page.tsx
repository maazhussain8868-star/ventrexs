'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useApp } from '@/context/AppContext';
import {
  Save,
  Store,
  CreditCard,
  Sparkles,
  Bell,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  FileText,
  Shield,
  ExternalLink,
  AlertTriangle,
  Scale,
  Lock,
  ChevronRight,
  Info,
} from 'lucide-react';

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy', desc: 'Google Play & GDPR compliant data practices' },
  { label: 'Terms of Service', href: '/terms', desc: 'Commercial platform agreements & ethical standards' },
  { label: 'Subscription Terms', href: '/subscription-terms', desc: 'Plan tiers, 14-day trial, and billing rules' },
  { label: 'Refund Policy', href: '/refund-policy', desc: '14-day money-back guarantee terms' },
  { label: 'Data Processing (DPA)', href: '/dpa', desc: 'GDPR Art. 28 subprocessors & security TOMs' },
  { label: 'Security Overview', href: '/security', desc: 'RLS database isolation & encryption' },
  { label: 'Acceptable Use Policy', href: '/acceptable-use', desc: 'Ethical AR conduct & TCPA consent rules' },
  { label: 'IP & DMCA Policy', href: '/ip-policy', desc: 'Customer data sovereignty & copyright notice' },
  { label: 'Data Retention Schedule', href: '/data-retention', desc: '30-day user purge vs statutory tax records' },
  { label: 'Service Level (SLA)', href: '/sla', desc: '99.9% target uptime availability guarantee' },
  { label: 'Account Deletion Portal', href: '/account-deletion', desc: 'Public unauthenticated deletion request page' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { settings, businessProfile, updateSettings, updateBusinessProfile, showToast, deleteAccount } = useApp();

  const [businessName, setBusinessName] = useState(businessProfile?.name || settings.businessName);
  const [businessEmail, setBusinessEmail] = useState(businessProfile?.email || settings.businessEmail);
  const [phone, setPhone] = useState(businessProfile?.phone || settings.phone || '');
  const [website, setWebsite] = useState(businessProfile?.website || settings.website || '');
  const [industry, setIndustry] = useState(businessProfile?.industry || settings.industry || 'HVAC');
  const [taxId, setTaxId] = useState(settings.taxId);
  const [currency, setCurrency] = useState(settings.currency);
  const [paymentTermsDays, setPaymentTermsDays] = useState(settings.paymentTermsDays);
  const [defaultNotes, setDefaultNotes] = useState(settings.defaultNotes);
  const [stripeConnected, setStripeConnected] = useState(settings.stripeConnected);
  const [achConnected, setAchConnected] = useState(settings.achConnected);
  const [autoReminderEnabled, setAutoReminderEnabled] = useState(settings.autoReminderEnabled);
  const [isSaving, setIsSaving] = useState(false);

  // Account deletion modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [acknowledgedTaxRetention, setAcknowledgedTaxRetention] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      updateSettings({
        businessName,
        businessEmail,
        phone,
        website,
        industry: industry as any,
        taxId,
        currency,
        paymentTermsDays: Number(paymentTermsDays),
        defaultNotes,
        stripeConnected,
        achConnected,
        autoReminderEnabled,
      });
      updateBusinessProfile({
        name: businessName,
        email: businessEmail,
        phone,
        website,
        industry: industry as any,
      });
      setIsSaving(false);
    }, 400);
  };

  const handleConfirmAccountDeletion = async () => {
    if (deleteConfirmText !== 'DELETE' || !acknowledgedTaxRetention) return;

    setIsDeletingAccount(true);
    const res = await deleteAccount();
    setIsDeletingAccount(false);

    if (res.success) {
      setIsDeleteModalOpen(false);
      router.push('/login');
    }
  };

  return (
    <AppShell
      title="Settings"
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          isLoading={isSaving}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save Settings
        </Button>
      }
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">Business & Platform Settings</h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-tertiary-container/15 text-tertiary">
              <ShieldCheck className="w-3.5 h-3.5" />
              Ethical Business Setup
            </span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Configure merchant settlement rails, standard payment horizons, AI collection parameters, and legal compliance.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Business Profile Section */}
          <section className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-outline-variant">
              <span className="material-symbols-outlined text-primary text-[22px] fill-icon">storefront</span>
              <h2 className="font-bold text-base text-on-surface">Business Entity & Remittance Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Business / Trade Name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
              <Input
                label="Primary Billing Email"
                type="email"
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                required
              />
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">Trade Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value as any)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-sm"
                >
                  <option value="HVAC">HVAC & Air Conditioning</option>
                  <option value="Roofing">Roofing & Siding</option>
                  <option value="Plumbing">Plumbing & Drains</option>
                  <option value="Electrical">Electrical Services</option>
                  <option value="Concrete">Concrete & Masonry</option>
                  <option value="General Contractor">General Contractor</option>
                  <option value="Landscaping">Landscaping & Tree Care</option>
                  <option value="Garage Door">Garage Door Services</option>
                  <option value="Pest Control">Pest Control</option>
                  <option value="Cleaning">Commercial / Home Cleaning</option>
                  <option value="Other">Other Service Business</option>
                </select>
              </div>
              <Input
                label="Dispatch Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Input
                label="Website URL"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourcompany.com"
              />
              <Input
                label="EIN / Commercial Tax ID"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
              />
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Default Invoicing Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-sm"
                >
                  <option value="USD ($)">USD ($) - United States Dollar</option>
                  <option value="CAD ($)">CAD ($) - Canadian Dollar</option>
                  <option value="GBP (£)">GBP (£) - British Pound</option>
                  <option value="EUR (€)">EUR (€) - Euro</option>
                </select>
              </div>
            </div>
          </section>

          {/* Invoicing Defaults */}
          <section className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-outline-variant">
              <span className="material-symbols-outlined text-primary text-[22px]">description</span>
              <h2 className="font-bold text-base text-on-surface">Invoice Terms & Policy</h2>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Standard Payment Due Horizon
              </label>
              <select
                value={paymentTermsDays}
                onChange={(e) => setPaymentTermsDays(Number(e.target.value))}
                className="w-full sm:w-1/2 bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-sm"
              >
                <option value={7}>Net 7 Days (Accelerated Turnaround)</option>
                <option value={10}>Net 10 Days</option>
                <option value={14}>Net 14 Days (Standard Commercial)</option>
                <option value={30}>Net 30 Days (Extended Wholesale)</option>
                <option value={60}>Net 60 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Standard Remittance Notes & Instructions
              </label>
              <textarea
                rows={3}
                value={defaultNotes}
                onChange={(e) => setDefaultNotes(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary transition-all resize-none"
              />
            </div>
          </section>

          {/* Payment Gateway Integrations */}
          <section className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 mb-2 pb-3 border-b border-outline-variant">
              <span className="material-symbols-outlined text-primary text-[22px]">payments</span>
              <h2 className="font-bold text-base text-on-surface">Direct Merchant Settlement Rails</h2>
            </div>

            <div className="p-4 rounded-xl border border-outline-variant bg-surface flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center font-bold text-sm">
                  Stripe
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Credit & Debit Card Processing</p>
                  <p className="text-xs text-on-surface-variant">Instant customer checkout via Stripe Connect</p>
                </div>
              </div>
              <Button
                type="button"
                variant={stripeConnected ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => {
                  setStripeConnected(!stripeConnected);
                  showToast({ title: stripeConnected ? 'Stripe Disconnected' : 'Stripe Connected!', type: 'info' });
                }}
              >
                {stripeConnected ? 'Connected ✓' : 'Connect Stripe'}
              </Button>
            </div>

            <div className="p-4 rounded-xl border border-outline-variant bg-surface flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-tertiary-container/15 text-tertiary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">account_balance</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">ACH Direct Bank Debit</p>
                  <p className="text-xs text-on-surface-variant">Automated low-fee bank wire & debit transfers</p>
                </div>
              </div>
              <Button
                type="button"
                variant={achConnected ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => {
                  setAchConnected(!achConnected);
                  showToast({ title: achConnected ? 'ACH Disconnected' : 'ACH Rails Connected!', type: 'info' });
                }}
              >
                {achConnected ? 'Connected ✓' : 'Connect ACH'}
              </Button>
            </div>
          </section>

          {/* AI Automation Toggle */}
          <section className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-outline-variant">
              <span className="material-symbols-outlined text-primary text-[22px]">smart_toy</span>
              <h2 className="font-bold text-base text-on-surface">AI Autonomous Collection Parameters</h2>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-on-surface">Enable Autonomous Copilot Queue</p>
                <p className="text-xs text-on-surface-variant mt-0.5 max-w-md leading-relaxed">
                  Allow Ventrexs AI to analyze overdue aging balances daily and pre-draft truthful follow-up notices for your approval.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoReminderEnabled}
                onChange={(e) => setAutoReminderEnabled(e.target.checked)}
                className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer mt-1"
              />
            </div>
          </section>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Settings
            </Button>
          </div>
        </form>

        {/* Modular System Settings & Subscriptions */}
        <section className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-base text-on-surface">Workspace Subscriptions & Module Automation</h2>
            </div>
            <span className="text-[11px] font-mono text-outline">Service OS Hub</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/settings/billing"
              className="p-4 rounded-xl border border-outline-variant/80 bg-surface hover:border-primary/50 transition-all flex flex-col justify-between group shadow-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between mb-1">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <ChevronRight className="w-4 h-4 text-outline group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-xs font-bold text-on-surface group-hover:text-primary">SaaS Subscription & Billing</h3>
                <p className="text-[11px] text-on-surface-variant">Manage plans, monthly usage quotas, and Stripe customer portal.</p>
              </div>
            </Link>

            <Link
              href="/settings/receptionist"
              className="p-4 rounded-xl border border-outline-variant/80 bg-surface hover:border-primary/50 transition-all flex flex-col justify-between group shadow-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between mb-1">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <ChevronRight className="w-4 h-4 text-outline group-hover:text-amber-500 transition-colors" />
                </div>
                <h3 className="text-xs font-bold text-on-surface group-hover:text-amber-500">AI Receptionist Config</h3>
                <p className="text-[11px] text-on-surface-variant">Services catalog, business hours, and emergency dispatch rules.</p>
              </div>
            </Link>

            <Link
              href="/settings/reputation"
              className="p-4 rounded-xl border border-outline-variant/80 bg-surface hover:border-primary/50 transition-all flex flex-col justify-between group shadow-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between mb-1">
                  <ShieldCheck className="w-5 h-5 text-tertiary" />
                  <ChevronRight className="w-4 h-4 text-outline group-hover:text-tertiary transition-colors" />
                </div>
                <h3 className="text-xs font-bold text-on-surface group-hover:text-tertiary">Review Automation Settings</h3>
                <p className="text-[11px] text-on-surface-variant">Job completion triggers, survey delays, and Google review link.</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Legal & Compliance Directory Card */}
        <section className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-base text-on-surface">Legal & Privacy Compliance Center</h2>
            </div>
            <span className="text-[11px] font-mono text-outline">Google Play & GDPR Verified</span>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            Review Ventrexs AI&apos;s commercial terms, privacy protections, data retention rules, and subprocessor disclosures:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {legalLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="p-3 rounded-xl border border-outline-variant/70 bg-surface hover:bg-surface-container-low transition-colors flex items-center justify-between group"
              >
                <div className="space-y-0.5 pr-2">
                  <p className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors flex items-center gap-1.5">
                    {item.label}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                  <p className="text-[11px] text-on-surface-variant line-clamp-1">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-outline group-hover:text-primary transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>

        {/* Danger Zone: Account & Data Deletion */}
        <section className="bg-error/5 border border-error/25 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-error/20">
            <AlertTriangle className="w-5 h-5 text-error" />
            <h2 className="font-bold text-base text-error">Danger Zone: Account & Data Deletion</h2>
          </div>

          <div className="space-y-2 text-xs text-on-surface-variant">
            <p>
              Permanently delete your account profile, customer lists, communication drafts, and business workspace.
            </p>
            <div className="p-3 rounded-xl bg-surface border border-outline-variant text-[11px] space-y-1 text-on-surface">
              <p className="font-bold text-error flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                Data Deletion Notice:
              </p>
              <p className="text-on-surface-variant leading-relaxed">
                Personal credentials, customer CRM contacts, and unsent drafts are deleted immediately. Commercial tax invoices are retained in anonymized format strictly where mandated by statutory tax laws (Net 7 years).
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setDeleteConfirmText('');
                setAcknowledgedTaxRetention(false);
                setIsDeleteModalOpen(true);
              }}
              className="text-error border-error/30 hover:bg-error/10 hover:border-error"
              leftIcon={<Trash2 className="w-4 h-4 text-error" />}
            >
              Delete Account & Workspace
            </Button>
          </div>
        </section>
      </div>

      {/* Account Deletion Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isDeletingAccount && setIsDeleteModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-error">
            <Trash2 className="w-5 h-5" />
            <span>Confirm Permanent Account Deletion</span>
          </div>
        }
        description="This action is permanent and cannot be undone."
      >
        <div className="space-y-4 text-xs text-on-surface">
          <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error space-y-1">
            <p className="font-bold">Warning: Permanent Workspace Erasure</p>
            <p className="text-[11px] leading-relaxed text-error/90">
              Executing this action will immediately invalidate your active session, delete your user profile, and wipe all customer directories.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledgedTaxRetention}
                onChange={(e) => setAcknowledgedTaxRetention(e.target.checked)}
                className="w-4 h-4 rounded text-error focus:ring-error mt-0.5"
              />
              <span className="text-[11px] text-on-surface-variant leading-relaxed">
                I understand that account credentials and personal contacts will be purged within 30 days, while finalized tax invoices may be retained up to 7 years pursuant to corporate tax laws.
              </span>
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-on-surface">
              Type <strong className="text-error font-mono">DELETE</strong> to confirm:
            </label>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="font-mono text-center tracking-widest uppercase text-error"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-outline-variant">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isDeletingAccount}
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isDeletingAccount}
              disabled={deleteConfirmText !== 'DELETE' || !acknowledgedTaxRetention}
              onClick={handleConfirmAccountDeletion}
              className="bg-error hover:bg-error/90 text-white"
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Permanently Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
