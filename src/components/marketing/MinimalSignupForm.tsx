'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Phone,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { submitLandingTrialLeadAction } from '@/app/actions/inquiry';
import { ConversionTracker } from '@/lib/analytics/conversion-tracker';

export default function MinimalSignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    message: string;
    redirectUrl?: string;
  } | null>(null);

  const [hasStarted, setHasStarted] = useState(false);

  // GA4 event: signup form started on initial interaction
  const handleFocus = () => {
    if (!hasStarted) {
      setHasStarted(true);
      ConversionTracker.trackSignupStarted();
    }
  };

  // Format phone number as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFocus();
    const raw = e.target.value.replace(/[^0-9+]/g, '');
    setPhone(raw);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid business email address.');
      return;
    }

    if (!phone || phone.replace(/[^0-9]/g, '').length < 7) {
      setErrorMessage('Please enter a valid phone number (at least 7 digits).');
      return;
    }

    setIsLoading(true);

    ConversionTracker.trackCtaClick({
      cta_name: 'Start Free Trial Form Submit',
      cta_location: 'landing_minimal_form',
      destination_url: '/signup',
    });

    try {
      const res = await submitLandingTrialLeadAction({
        email,
        phone,
        honeypot,
      });

      if (res.success) {
        // GA4 tracking: signup completed
        ConversionTracker.trackSignupCompleted({
          account_type: 'BUSINESS_OWNER',
          plan: 'Starter',
        });

        setSuccessData({
          message: res.message,
          redirectUrl: res.redirectUrl,
        });
      } else {
        setErrorMessage(res.message || 'Unable to start trial. Please verify your details.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#0B132B]/90 via-[#070D1F]/90 to-[#040714] border border-blue-500/30 shadow-[0_20px_60px_rgba(37,99,235,0.25)] relative overflow-hidden">
      {/* Ambient glow accent */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {successData ? (
        <div className="py-8 px-4 text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-white">
              Your 7-Day Free Trial is Reserved!
            </h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              We've allocated your trial workspace for <span className="font-semibold text-cyan-300 font-mono">{email}</span> with dedicated AI telephony.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 space-y-1 text-left max-w-sm mx-auto">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold font-mono">
              <Zap className="w-4 h-4" /> Ready to Test In Under 60 Seconds
            </div>
            <p className="text-[11px] text-slate-400">
              Click below to complete your business profile and claim your dedicated US phone number.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                if (successData.redirectUrl) {
                  router.push(successData.redirectUrl);
                } else {
                  router.push(`/signup?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&trial=true`);
                }
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <span>Continue to Workspace Setup</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[11px] font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>7-DAY UNLIMITED TRIAL • NO CREDIT CARD</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Start Your Free Trial in Seconds
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Get an instant AI receptionist, dedicated phone line, and CRM. No commitments or credit card required.
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Minimal 2 Inputs */}
          <div className="space-y-3.5">
            {/* Email Address */}
            <div>
              <label htmlFor="landing-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="landing-email"
                  type="email"
                  required
                  placeholder="john@apexcomfort.com"
                  value={email}
                  onChange={(e) => {
                    handleFocus();
                    setEmail(e.target.value);
                  }}
                  onFocus={handleFocus}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700/90 hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm text-white placeholder-slate-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Mobile Phone Number */}
            <div>
              <label htmlFor="landing-phone" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mobile Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="landing-phone"
                  type="tel"
                  required
                  placeholder="(555) 234-5678"
                  value={phone}
                  onChange={handlePhoneChange}
                  onFocus={handleFocus}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700/90 hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm text-white placeholder-slate-500 transition-all outline-none font-mono"
                />
              </div>
            </div>

            {/* Hidden Spam Defense Honeypot */}
            <input
              type="text"
              name="company_website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Submit CTA Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-70 text-white font-bold text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Reserving Your Free Trial...</span>
              </>
            ) : (
              <>
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Trust Guarantees */}
          <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> No Credit Card Required
            </span>
            <span>•</span>
            <span>Cancel Anytime</span>
            <span>•</span>
            <span>Instant Setup</span>
          </div>
        </form>
      )}
    </div>
  );
}
