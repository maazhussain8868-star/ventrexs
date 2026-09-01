'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Mail, ArrowRight, Loader2, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { resetPasswordForEmail } = useApp();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const isSubmittingRef = useRef(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmittingRef.current || isLoading || cooldown > 0) {
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);
    setError('');

    try {
      const res = await resetPasswordForEmail(cleanEmail);
      if (res.success) {
        setIsSuccess(true);
        setCooldown(60);
      } else {
        const errorMsg = res.error || 'Unable to send password reset email.';
        setError(errorMsg);
        if (errorMsg.toLowerCase().includes('wait') || errorMsg.toLowerCase().includes('rate limit')) {
          setCooldown(60);
        }
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'An unexpected error occurred.';
      setError(errorMsg);
      if (errorMsg.toLowerCase().includes('wait') || errorMsg.toLowerCase().includes('rate limit')) {
        setCooldown(60);
      }
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6 bg-surface rounded-2xl border border-outline-variant p-6 sm:p-8 shadow-sm">
        {/* Header / Logo */}
        <div className="text-center flex flex-col items-center gap-2">
          <Link
            href="/"
            className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-xs mb-1 hover:scale-105 transition-transform"
          >
            <span className="material-symbols-outlined text-[28px] fill-icon">lock_reset</span>
          </Link>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Reset Password</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Enter your account email to receive a recovery link
          </p>
        </div>

        {/* Success Alert */}
        {isSuccess && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Password Reset Link Dispatched</span>
            </div>
            <p className="leading-relaxed">
              If an account exists for <span className="font-semibold text-on-surface">{email}</span>, you will receive an email shortly with instructions to reset your password.
            </p>
            <p className="text-[11px] text-on-surface-variant">
              Please check your spam or promotions folder if it doesn&apos;t appear in your inbox within a few minutes.
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface-variant">Work Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@business.com"
                className="w-full pl-9 pr-3 py-2.5 bg-surface border border-outline-variant rounded-lg text-xs sm:text-sm text-on-surface focus:outline-hidden focus:border-primary transition-colors placeholder:text-outline"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || cooldown > 0}
            className="w-full mt-1 bg-primary text-on-primary font-bold text-xs sm:text-sm py-2.5 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending link...</span>
              </>
            ) : cooldown > 0 ? (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Resend in {cooldown}s</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send Reset Link</span>
              </>
            )}
          </button>
        </form>

        {/* Return to Sign In */}
        <div className="text-center pt-2 border-t border-outline-variant">
          <Link
            href="/login"
            className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1.5"
          >
            <ArrowRight className="w-3 h-3 rotate-180" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
