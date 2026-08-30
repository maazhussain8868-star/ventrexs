'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Mail, Lock, Eye, EyeOff, Loader2, Send } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, resendVerificationEmail, showToast } = useApp();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResendSuccess(false);

    const res = await signIn(email, password);
    setIsLoading(false);

    if (res.success) {
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const redirectTo = params?.get('redirectTo');
      const targetUrl = redirectTo && redirectTo.startsWith('/') ? redirectTo : '/dashboard';
      router.push(targetUrl);
    } else {
      setError(res.error || 'Failed to sign in. Please verify your credentials.');
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your account email address to receive verification.');
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

  const handleSocialLogin = (provider: string) => {
    showToast({
      title: `${provider} sign-in unavailable`,
      description: 'Use email and password to authenticate securely.',
      type: 'info',
    });
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6 bg-surface rounded-2xl border border-outline-variant p-6 sm:p-8 shadow-sm">
        {/* Header / Logo */}
        <div className="text-center flex flex-col items-center gap-2">
          <Link href="/" className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-xs mb-1 hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[28px] fill-icon">payments</span>
          </Link>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Ventrexs AI</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">Sign in to your account</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400">
            <p className="font-medium">{error}</p>
            {error.toLowerCase().includes('confirm') && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading || resendCooldown > 0}
                className="mt-2 text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-1"
              >
                {resendLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                {resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : 'Resend verification email'}
              </button>
            )}
          </div>
        )}

        {/* Resend Confirmation */}
        {resendSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-600 dark:text-emerald-400">
            A fresh verification link has been sent to your email.
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface-variant">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@business.com"
                className="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant rounded-lg text-xs sm:text-sm text-on-surface focus:outline-hidden focus:border-primary transition-colors placeholder:text-outline"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-on-surface-variant">Password</label>
              <Link href="/forgot-password" className="text-[11px] text-primary hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-9 py-2 bg-surface border border-outline-variant rounded-lg text-xs sm:text-sm text-on-surface focus:outline-hidden focus:border-primary transition-colors placeholder:text-outline"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface focus:outline-hidden"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-primary text-on-primary font-bold text-xs sm:text-sm py-2.5 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="flex-grow border-t border-outline-variant"></div>
          <span className="flex-shrink-0 mx-3 text-xs text-outline">or continue with</span>
          <div className="flex-grow border-t border-outline-variant"></div>
        </div>

        {/* Social Login */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => handleSocialLogin('Google')}
            className="w-full flex items-center justify-center gap-2.5 bg-surface text-on-surface font-semibold text-xs sm:text-sm py-2.5 rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin('Apple')}
            className="w-full flex items-center justify-center gap-2.5 bg-surface text-on-surface font-semibold text-xs sm:text-sm py-2.5 rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">apple</span>
            Apple ID
          </button>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-1">
          <p className="text-xs text-on-surface-variant">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary font-bold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
