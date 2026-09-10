'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { SignupAccountType } from '@/lib/acquisition/types';
import { captureAcquisitionAttribution, getStoredAttribution } from '@/lib/acquisition/tracker';
import { recordAcquisitionAttributionAction } from '@/app/actions/acquisition';
import { ConversionTracker } from '@/lib/analytics/conversion-tracker';
import { trackCompleteRegistration } from '@/components/analytics/MetaPixel';
import {
  Building2,
  Globe,
  Sparkles,
  ArrowRight,
  Check,
  Loader2,
  Send,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, resendVerificationEmail, signInWithOAuth, showToast } = useApp();

  // 1. Signup Type & Plan Choice
  const initialType = (searchParams.get('type') || '').toUpperCase();
  const selectedPlan = searchParams.get('plan') || '';
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
  const [submitCooldown, setSubmitCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const [isExistingAccount, setIsExistingAccount] = useState(false);
  const [isGoogleExistingAccount, setIsGoogleExistingAccount] = useState(false);

  // Synchronous submission lock to block parallel / double-click requests
  const isSubmittingRef = React.useRef(false);
  const isResendingRef = React.useRef(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (submitCooldown > 0) {
      timer = setTimeout(() => setSubmitCooldown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [submitCooldown]);

  // 2. Capture Attribution & Track Signup Started on Mount
  useEffect(() => {
    captureAcquisitionAttribution();
    ConversionTracker.trackSignupStarted();
  }, []);

  const handleSocialLogin = async (provider: 'Google' | 'Apple') => {
    setError('');
    const providerKey = provider === 'Google' ? 'google' : 'apple';
    try {
      const res = await signInWithOAuth(providerKey);
      if (!res.success && res.error) {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err?.message || `Failed to sign in with ${provider}.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmittingRef.current || isLoading || submitCooldown > 0) {
      return;
    }

    if (accountType === 'DEMO_GUEST') {
      ConversionTracker.trackDemoStarted({ source: 'signup_toggle' });
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

    isSubmittingRef.current = true;
    setIsLoading(true);
    setError('');
    setResendSuccess(false);

    try {
      const res = await signUp({
        email: email.trim(),
        password,
        name: name.trim(),
        businessName: businessOrAgencyName.trim(),
        plan: selectedPlan || 'Professional',
      });

      if (res.success) {
        // Track signup_completed conversion
        ConversionTracker.trackSignupCompleted({
          account_type: accountType,
          plan: selectedPlan || 'Professional',
        });

        // Meta Pixel: CompleteRegistration (fired strictly once for successful new account creation)
        if (!res.isExistingUser) {
          trackCompleteRegistration({
            email: email.trim(),
            plan: selectedPlan || 'Professional',
            contentName: `7-Day Free Trial - ${selectedPlan || 'Professional'}`,
          });
        }

        // Record Attribution asynchronously
        const { lastTouch, firstTouch } = getStoredAttribution();
        const attributionToSave = lastTouch || firstTouch;
        if (attributionToSave) {
          recordAcquisitionAttributionAction({
            attribution: attributionToSave,
          }).catch((err) => console.warn('Attribution save notice:', err));
        }

        if (res.needsEmailConfirmation) {
          setIsExistingAccount(Boolean(res.isExistingUser));
          setIsGoogleExistingAccount(Boolean(res.isGoogleOnlyAccount));
          setVerificationSent(true);
          return;
        }

        showToast({
          title: 'Account Created',
          description: 'Welcome to Ventrexs AI. Directing to setup...',
          type: 'success',
        });

        const isTrial = searchParams.get('trial') === 'true';
        const planQuery = selectedPlan ? `?plan=${encodeURIComponent(selectedPlan)}` : '';
        const trialQuery = isTrial ? (planQuery ? '&trial=true' : '?trial=true') : '';
        if (accountType === 'AGENCY_OWNER') {
          router.push(`/agency/onboarding${planQuery}${trialQuery}`);
        } else {
          router.push(`/onboarding${planQuery}${trialQuery}`);
        }
      } else {
        const errorMsg = res.error || 'Failed to create account. Please try again.';
        if (errorMsg.includes('Google Sign-In') || errorMsg.includes('Google')) {
          setIsGoogleExistingAccount(true);
        }
        setError(errorMsg);
        const lowerErr = errorMsg.toLowerCase();
        if (
          lowerErr.includes('rate limit') ||
          lowerErr.includes('recently requested') ||
          lowerErr.includes('wait a few minutes') ||
          lowerErr.includes('wait a moment') ||
          lowerErr.includes('high volume') ||
          lowerErr.includes('too many requests')
        ) {
          setSubmitCooldown(60);
        }
      }
    } catch (submitErr: any) {
      const errMsg = submitErr?.message || 'An unexpected error occurred during signup.';
      if (errMsg.includes('Google Sign-In') || errMsg.includes('Google')) {
        setIsGoogleExistingAccount(true);
      }
      setError(errMsg);
      const lowerErr = errMsg.toLowerCase();
      if (
        lowerErr.includes('rate limit') ||
        lowerErr.includes('recently requested') ||
        lowerErr.includes('wait a few minutes') ||
        lowerErr.includes('wait a moment') ||
        lowerErr.includes('high volume') ||
        lowerErr.includes('too many requests')
      ) {
        setSubmitCooldown(60);
      }
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your work email to receive verification.');
      return;
    }
    if (resendCooldown > 0 || isResendingRef.current || resendLoading) return;

    isResendingRef.current = true;
    setResendLoading(true);
    setError('');

    try {
      const res = await resendVerificationEmail(email.trim());
      if (res.success) {
        setResendSuccess(true);
        setResendCooldown(60);
      } else {
        setError(res.error || 'Unable to dispatch verification email.');
      }
    } catch (resendErr: any) {
      setError(resendErr?.message || 'Unable to dispatch verification email.');
    } finally {
      setResendLoading(false);
      isResendingRef.current = false;
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
          <Logo href="/" variant="icon" size="lg" className="mb-1" />
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
        ) : verificationSent ? (
          <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-[11px] font-bold text-blue-300">
                <Sparkles className="w-3 h-3" />
                <span>{selectedPlan || 'Professional'} Plan Selected</span>
              </div>
              <h3 className="text-base font-extrabold text-white">
                Check Your Email
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                We sent a verification link to <span className="font-semibold text-white">{email}</span>. Please check your inbox (and your Spam or Junk folder) and click the link to activate your workspace and continue setup.
              </p>
            </div>

            {resendSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400">
                A fresh verification link was dispatched! Please check your inbox (and spam folder).
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              {isGoogleExistingAccount ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('Google')}
                    className="w-full py-2.5 px-3 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Sign in with Google</span>
                  </button>
                  <Link
                    href={email ? `/forgot-password?email=${encodeURIComponent(email)}` : '/forgot-password'}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs rounded-xl transition-all border border-slate-700 inline-flex items-center justify-center gap-1.5"
                  >
                    <span>Reset password to enable email login</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={`/login?email=${encodeURIComponent(email)}`}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md inline-flex items-center justify-center gap-1.5"
                  >
                    <span>Sign In to Your Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendLoading || resendCooldown > 0}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs rounded-xl transition-all border border-slate-700 disabled:opacity-50 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {resendLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    {resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : 'Resend Verification Email'}
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setVerificationSent(false)}
                className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors pt-1 cursor-pointer"
              >
                Change email or try again
              </button>
            </div>
          </div>
        ) : (
          /* Signup Form */
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* 1-Click Social Registration Option */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm py-2.5 rounded-xl transition-all shadow-md active:scale-[0.99] cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center my-1">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink-0 mx-3 text-[11px] text-slate-500 font-medium">or register with email</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs font-semibold text-red-400 space-y-2">
                <p className="leading-relaxed">{error}</p>
                {error.includes('Google Sign-In') ? (
                  <div className="pt-2 border-t border-red-500/20 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handleSocialLogin('Google')}
                      className="w-full py-2 px-3 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-lg transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Sign in with Google</span>
                    </button>
                    <Link
                      href={email ? `/forgot-password?email=${encodeURIComponent(email)}` : '/forgot-password'}
                      className="text-[11px] font-semibold text-primary hover:underline text-center"
                    >
                      Reset password to enable email/password login
                    </Link>
                  </div>
                ) : (
                  error.toLowerCase().includes('rate limit') ||
                  error.toLowerCase().includes('recently requested') ||
                  error.toLowerCase().includes('wait a few minutes') ||
                  error.toLowerCase().includes('wait a moment') ||
                  error.toLowerCase().includes('high volume') ||
                  error.toLowerCase().includes('already exists')
                ) && (
                  <div className="pt-2 border-t border-red-500/20 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSocialLogin('Google')}
                      className="text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-xl transition-all inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Sign in with Google</span>
                    </button>
                    <Link
                      href={email ? `/login?email=${encodeURIComponent(email)}` : '/login'}
                      className="text-xs font-bold text-white bg-red-600/80 hover:bg-red-600 px-3 py-1.5 rounded-xl transition-all inline-flex items-center gap-1 shadow-sm"
                    >
                      <span>Sign In</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendLoading || resendCooldown > 0}
                      className="text-[11px] font-bold text-slate-300 hover:text-white inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {resendLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      {resendCooldown > 0 ? `Retry in ${resendCooldown}s` : 'Request verification'}
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
              disabled={isLoading || submitCooldown > 0}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm py-3 rounded-xl shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-all mt-2 disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : submitCooldown > 0 ? (
                <span>Retry signup in {submitCooldown}s</span>
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
