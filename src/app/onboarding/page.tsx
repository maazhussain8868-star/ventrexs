'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ArrowRight, ArrowLeft, CheckCircle, Sparkles, Building2, CreditCard, ShieldCheck } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, settings, updateProfile, updateSettings, showToast } = useApp();

  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState(profile.businessName || 'Main Street Bakery & Cafe');
  const [industry, setIndustry] = useState('bakery');
  const [address, setAddress] = useState(profile.address || '742 Evergreen Terrace, Springfield, IL');
  const [phone, setPhone] = useState(profile.phone || '+1 (555) 382-9912');

  const [paymentTermsDays, setPaymentTermsDays] = useState(settings.paymentTermsDays || 14);
  const [currency, setCurrency] = useState('USD ($)');

  const [stripeConnected, setStripeConnected] = useState(settings.stripeConnected);
  const [achConnected, setAchConnected] = useState(settings.achConnected);
  const [autoReminder, setAutoReminder] = useState(settings.autoReminderEnabled);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Complete Onboarding
      updateProfile({
        businessName,
        address,
        phone,
        businessType: industry === 'bakery' ? 'Bakery, Food & Catering' : industry === 'hvac' ? 'HVAC & Plumbing' : industry === 'agency' ? 'Creative Agency' : 'Professional Services'
      });
      updateSettings({
        businessName,
        paymentTermsDays: Number(paymentTermsDays),
        currency,
        stripeConnected,
        achConnected,
        autoReminderEnabled: autoReminder
      });

      showToast({
        title: 'Workspace Configured!',
        description: 'Your PayPilot AI Accounts Receivable cockpit is ready.',
        type: 'success'
      });

      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 flex justify-center items-center w-full px-6 py-4 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-[20px] fill-icon">payments</span>
          </div>
          <span className="font-bold text-lg text-primary">PayPilot AI</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col px-4 sm:px-6 py-8 max-w-lg mx-auto w-full">
        {/* Step Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Step {step} of 3
            </span>
            <span className="text-xs font-semibold text-on-surface-variant">
              {step === 1 ? 'Business Profile' : step === 2 ? 'Invoicing Terms' : 'Payment & AI Setup'}
            </span>
          </div>
          <div className="h-2 bg-surface-container-high rounded-full w-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 flex flex-col justify-between">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-on-background mb-2 tracking-tight">
                  Welcome! Let&apos;s set up your business workspace.
                </h1>
                <p className="text-sm text-on-surface-variant">
                  Tell us a bit about what you do so we can tailor our AI accounts receivable models to your industry.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5" htmlFor="bname">
                    Business / Trade Name
                  </label>
                  <input
                    id="bname"
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Main Street Bakery & Cafe"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5" htmlFor="ind">
                    Industry
                  </label>
                  <div className="relative">
                    <select
                      id="ind"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                    >
                      <option value="bakery">Bakery, Food & Catering</option>
                      <option value="hvac">HVAC, Plumbing & Electrical</option>
                      <option value="agency">Marketing, Design & Creative Agency</option>
                      <option value="construction">General Contracting & Construction</option>
                      <option value="tech">Software & IT Services</option>
                      <option value="consulting">Professional Consulting</option>
                      <option value="other">Other Commercial Business</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5" htmlFor="addr">
                    Business Address
                  </label>
                  <input
                    id="addr"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St, City, State, ZIP"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              {/* Tailored insights callout */}
              <div className="rounded-xl overflow-hidden border border-outline-variant bg-surface-container-lowest p-4 flex items-center gap-3.5 shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-surface-variant text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl fill-icon">storefront</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-surface">Industry Benchmarking</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                    AI models benchmark collection timing against 500+ peers in your specific industry.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-on-background mb-2 tracking-tight">
                  Configure Invoicing Terms
                </h1>
                <p className="text-sm text-on-surface-variant">
                  Set standard payment horizons applied to your customer invoices.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    Standard Payment Terms
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { days: 7, label: 'Net 7 Days' },
                      { days: 14, label: 'Net 14 Days' },
                      { days: 30, label: 'Net 30 Days' },
                    ].map((t) => (
                      <button
                        key={t.days}
                        type="button"
                        onClick={() => setPaymentTermsDays(t.days)}
                        className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          paymentTermsDays === t.days
                            ? 'bg-primary text-on-primary border-primary shadow-xs'
                            : 'bg-surface border-outline-variant text-on-surface hover:bg-surface-container-low'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    Billing Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  >
                    <option value="USD ($)">USD - US Dollar ($)</option>
                    <option value="CAD ($)">CAD - Canadian Dollar ($)</option>
                    <option value="GBP (£)">GBP - British Pound (£)</option>
                    <option value="EUR (€)">EUR - Euro (€)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-on-background mb-2 tracking-tight">
                  Payment Channels & AI Copilot
                </h1>
                <p className="text-sm text-on-surface-variant">
                  Enable simulated merchant rails and automated follow-up intelligence.
                </p>
              </div>

              <div className="space-y-3">
                {/* Stripe Toggle */}
                <div className="p-4 rounded-xl border border-outline-variant bg-surface-container-lowest flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center font-bold">
                      S
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">Credit Card Processing (Stripe)</p>
                      <p className="text-xs text-on-surface-variant">Accept Visa, Mastercard, Apple Pay</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={stripeConnected}
                    onChange={(e) => setStripeConnected(e.target.checked)}
                    className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer"
                  />
                </div>

                {/* ACH Toggle */}
                <div className="p-4 rounded-xl border border-outline-variant bg-surface-container-lowest flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-tertiary-container/15 text-tertiary flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-[20px]">account_balance</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">ACH Direct Bank Debit</p>
                      <p className="text-xs text-on-surface-variant">Direct bank-to-bank settlement</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={achConnected}
                    onChange={(e) => setAchConnected(e.target.checked)}
                    className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer"
                  />
                </div>

                {/* AI Collection Copilot Toggle */}
                <div className="p-4 rounded-xl border border-primary/30 bg-surface-container-low flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">AI Smart Collection Reminders</p>
                      <p className="text-xs text-on-surface-variant">Suggests optimal send times & truthful drafted copy</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoReminder}
                    onChange={(e) => setAutoReminder(e.target.checked)}
                    className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 pt-4 border-t border-outline-variant flex items-center gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-5 py-3 rounded-xl border border-outline-variant text-on-surface font-semibold text-sm hover:bg-surface-container-low transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex-1 bg-primary text-on-primary font-semibold text-sm py-3 px-6 rounded-xl hover:bg-on-primary-fixed-variant transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <span>{step === 3 ? 'Launch PayPilot Cockpit' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
