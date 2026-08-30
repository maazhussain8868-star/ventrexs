'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { SignupAccountType } from '@/lib/acquisition/types';
import { captureAcquisitionAttribution, getStoredAttribution } from '@/lib/acquisition/tracker';
import { recordAcquisitionAttributionAction } from '@/app/actions/acquisition';
import {
  Building2,
  Globe,
  Sparkles,
  ArrowRight,
  Check,
  Loader2,
  Send,
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, resendVerificationEmail, showToast } = useApp();

  // 1. Signup Type Choice
  const initialType = (searchParams.get('type') || '').toUpperCase();
  const [accountType, setAccountType] = useState<SignupAccountType>(
    initialType === 'AGENCY' || initialType === 'AGENCY_OWNER'
      ? 'AGENCY_OWNER'
      : initialType === 'DEMO'
      ? 'DEMO_GUEST'
      : 'BUSINESS_OWNER'
  );

  // Form Fields
  const [name, setName] = useState('');
  const [businessOrAgencyName, setBusinessOrAgencyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // 2. Capture Attribution on Mount
  useEffect(() => {
    captureAcquisitionAttribution();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (accountType === 'DEMO_GUEST') {
      router.push('/demo');
      return;
    }

    if (!name || !businessOrAgencyName || !email || !password) {
      setError('Please complete all required fields.');
      return;
    }
    if (!agreeTerms) {
      setError('Please accept the terms and conditions.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResendSuccess(false);

    const res = await signUp({
      email,
      password,
      name,
      businessName: businessOrAgencyName,
    });

    setIsLoading(false);

    if (res.success) {
      // Record Attribution asynchronously
      const { lastTouch, firstTouch } = getStoredAttribution();
      const attributionToSave = lastTouch || firstTouch;
      if (attributionToSave) {
        recordAcquisitionAttributionAction({
          attribution: attributionToSave,
        }).catch((err) => console.warn('Attribution save notice:', err));
      }

      showToast({
        title: 'Account Created',
        description: 'Welcome to Ventrexs AI. Directing to setup...',
        type: 'success',
      });

      if (accountType === 'AGENCY_OWNER') {
        router.push('/agency/onboarding');
      } else {
        router.push('/onboarding');
      }
    } else {
      setError(res.error || 'Failed to create account. Please try again.');
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your work email to receive verification.');
      return;
    }
    if (resendCooldown > 0) return;

    setResendLoading(true);
    setError('');
    const res = await resendVerificationEmail(email);
    setResendLoading(false);

    if (res.success) {
      setResendSuccess(true);
      setResendCooldown(60);
    } else {
      setError(res.error || 'Unable to dispatch verification email.');
    }
  };

  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      {/* Background glow pool */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[300px] bg-indigo-600/15 blur-[120px] pointer-events-none -z-10" />

      <div className="w-full max-w-lg mx-auto flex flex-col gap-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-2">
          <Link
            href="/"
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/25 mb-1 active:scale-95 transition-transform"
          >
            <Sparkles className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Start with Ventrexs AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Select your account type to configure your dedicated workspace
          </p>
        </div>

        {/* 1. Account Type Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            How do you want to use Ventrexs?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setAccountType('BUSINESS_OWNER')}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 min-h-[90px] cursor-pointer ${
                accountType === 'BUSINESS_OWNER'
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm ring-1 ring-blue-500'
                  : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <Building2 className={`w-5 h-5 ${accountType === 'BUSINESS_OWNER' ? 'text-blue-400' : 'text-slate-400'}`} />
                {accountType === 'BUSINESS_OWNER' && <Check className="w-4 h-4 text-blue-400" />}
              </div>
              <div>
                <p className="text-xs font-extrabold leading-tight">Business Owner</p>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Contractor CRM & AI</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAccountType('AGENCY_OWNER')}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 min-h-[90px] cursor-pointer ${
                accountType === 'AGENCY_OWNER'
                  ? 'bg-violet-600/20 border-violet-500 text-white shadow-sm ring-1 ring-violet-500'
                  : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <Globe className={`w-5 h-5 ${accountType === 'AGENCY_OWNER' ? 'text-violet-400' : 'text-slate-400'}`} />
                {accountType === 'AGENCY_OWNER' && <Check className="w-4 h-4 text-violet-400" />}
              </div>
              <div>
                <p className="text-xs font-extrabold leading-tight">Agency Reseller</p>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">White-label & clients</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAccountType('DEMO_GUEST')}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 min-h-[90px] cursor-pointer ${
                accountType === 'DEMO_GUEST'
                  ? 'bg-amber-600/20 border-amber-500 text-white shadow-sm ring-1 ring-amber-500'
                  : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <Sparkles className={`w-5 h-5 ${accountType === 'DEMO_GUEST' ? 'text-amber-400' : 'text-slate-400'}`} />
                {accountType === 'DEMO_GUEST' && <Check className="w-4 h-4 text-amber-400" />}
              </div>
              <div>
                <p className="text-xs font-extrabold leading-tight">Explore Demo</p>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Live sandbox trial</p>
              </div>
            </button>
          </div>
        </div>

        {/* Demo Fast-Track Notice */}
        {accountType === 'DEMO_GUEST' ? (
          <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3 text-center">
            <h3 className="text-sm font-bold text-amber-300">Instant Demo Sandbox Access</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Explore the full AI receptionist, contractor dispatching, and invoicing workspace with pre-populated demo data. No credit card or password required.
            </p>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-md active:scale-95"
            >
              <span>Launch Demo Gateway</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Signup Form */
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs font-semibold text-red-400 space-y-2">
                <p className="leading-relaxed">{error}</p>
                {(error.toLowerCase().includes('rate limit') || error.toLowerCase().includes('already exists')) && (
                  <div className="pt-2 border-t border-red-500/20 flex flex-wrap items-center gap-3">
                    <Link
                      href={email ? `/login?email=${encodeURIComponent(email)}` : '/login'}
                      className="text-xs font-bold text-white bg-red-600/80 hover:bg-red-600 px-3 py-1.5 rounded-xl transition-all inline-flex items-center gap-1 shadow-sm"
                    >
                      <span>Sign In to Existing Account</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendLoading || resendCooldown > 0}
                      className="text-[11px] font-bold text-slate-300 hover:text-white inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {resendLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      {resendCooldown > 0 ? `Retry in ${resendCooldown}s` : 'Request new verification'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {resendSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400">
                Verification email dispatched! Please check your inbox.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="name">
                  Your Full Name *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-hidden min-h-[40px]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="business">
                  {accountType === 'AGENCY_OWNER' ? 'Agency Name *' : 'Business Name *'}
                </label>
                <input
                  id="business"
                  type="text"
                  required
                  placeholder={accountType === 'AGENCY_OWNER' ? 'e.g. Apex Marketing Agency' : 'e.g. Johnson Home Services'}
                  value={businessOrAgencyName}
                  onChange={(e) => setBusinessOrAgencyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-hidden min-h-[40px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="email">
                Work Email *
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-hidden min-h-[40px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="password">
                Create Password *
              </label>
              <input
                id="password"
                type="password"
                required
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-hidden min-h-[40px]"
              />

              {/* Password strength meter */}
              {password && (
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 rounded-full ${strength >= 1 ? 'bg-red-500' : 'bg-transparent'}`} />
                    <div className={`h-full flex-1 rounded-full ${strength >= 2 ? 'bg-amber-500' : 'bg-transparent'}`} />
                    <div className={`h-full flex-1 rounded-full ${strength >= 3 ? 'bg-blue-500' : 'bg-transparent'}`} />
                    <div className={`h-full flex-1 rounded-full ${strength >= 4 ? 'bg-emerald-500' : 'bg-transparent'}`} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    {strength <= 1 ? 'Weak' : strength === 2 ? 'Fair' : strength === 3 ? 'Good' : 'Strong'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-700 bg-slate-800 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-slate-400 leading-tight cursor-pointer">
                I agree to the{' '}
                <Link href="/terms" className="text-blue-400 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-400 hover:underline">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm py-3 rounded-xl shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-all mt-2 disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {accountType === 'AGENCY_OWNER' ? 'Create Agency Workspace' : 'Create Business Account'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
