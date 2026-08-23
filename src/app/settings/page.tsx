'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useApp } from '@/context/AppContext';
import { Save, Store, CreditCard, Sparkles, Bell, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings, showToast } = useApp();

  const [businessName, setBusinessName] = useState(settings.businessName);
  const [businessEmail, setBusinessEmail] = useState(settings.businessEmail);
  const [taxId, setTaxId] = useState(settings.taxId);
  const [currency, setCurrency] = useState(settings.currency);
  const [paymentTermsDays, setPaymentTermsDays] = useState(settings.paymentTermsDays);
  const [defaultNotes, setDefaultNotes] = useState(settings.defaultNotes);
  const [stripeConnected, setStripeConnected] = useState(settings.stripeConnected);
  const [achConnected, setAchConnected] = useState(settings.achConnected);
  const [autoReminderEnabled, setAutoReminderEnabled] = useState(settings.autoReminderEnabled);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      updateSettings({
        businessName,
        businessEmail,
        taxId,
        currency,
        paymentTermsDays: Number(paymentTermsDays),
        defaultNotes,
        stripeConnected,
        achConnected,
        autoReminderEnabled
      });
      setIsSaving(false);
    }, 400);
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
            Configure merchant settlement rails, standard payment horizons, and AI collection parameters.
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
                Standard Remittance Notes & Remittance Instructions
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
                  <p className="text-sm font-bold text-on-surface">ACH Direct Bank Debit (Plaid)</p>
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
                  Allow PayPilot AI to analyze overdue aging balances daily and pre-draft truthful follow-up notices for your approval.
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
      </div>
    </AppShell>
  );
}
