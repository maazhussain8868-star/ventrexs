'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { AlertCircle, Mail, Send, Loader2, ArrowRight } from 'lucide-react';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const { resendVerificationEmail } = useApp();
  const reason = searchParams.get('reason');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setResendError('Please enter your account email address.');
      return;
    }
    if (resendCooldown > 0 || resendLoading) return;

    setResendLoading(true);
    setResendError('');
    setResendSuccess(false);

    try {
      const res = await resendVerificationEmail(email.trim());
      if (res.success) {
        setResendSuccess(true);
        setResendCooldown(60);
      } else {
        setResendError(res.error || 'Failed to dispatch verification email.');
      }
    } catch (err: any) {
      setResendError(err?.message || 'Failed to dispatch verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md mx-auto flex flex-col gap-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        {/* Header / Logo */}
        <div className="text-center flex flex-col items-center gap-2">
          <Link
            href="/"
            className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg mb-1 hover:scale-105 transition-transform"
          >
            <span className="material-symbols-outlined text-[28px]">verified_user</span>
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight">Ventrexs AI</h1>
          <p className="text-xs text-slate-400">Account Authentication</p>
        </div>

        {/* Status Card */}
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200">
            <h3 className="font-bold text-amber-300 mb-1">
              {reason === 'supabase_not_configured'
                ? 'Authentication Service Unavailable'
                : 'Verification Link Expired or Invalid'}
            </h3>
            <p className="text-slate-300 leading-relaxed">
              This email confirmation link may have expired, was already used, or is invalid. If your email was already confirmed, you can sign in directly.
            </p>
          </div>
        </div>

        {/* Resend Form */}
        <form onSubmit={handleResend} className="flex flex-col gap-3 pt-2">
          <label className="text-xs font-bold text-slate-300">Request a Fresh Verification Link</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@business.com"
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors"
            />
          </div>

          {resendError && (
            <p className="text-xs text-rose-400 font-medium">{resendError}</p>
          )}

          {resendSuccess && (
            <p className="text-xs text-emerald-400 font-medium">
              A fresh verification email has been dispatched to {email}. Please check your inbox.
            </p>
          )}

          <button
            type="submit"
            disabled={resendLoading || resendCooldown > 0}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            {resendLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Send Verification Email'}
          </button>
        </form>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-800 text-center">
          <Link
            href="/login"
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Return to Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
