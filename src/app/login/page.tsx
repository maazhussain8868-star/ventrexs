'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, showToast } = useApp();
  const [email, setEmail] = useState('jane@mainstreetbakery.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError('');

    const res = await signIn(email, password);
    setIsLoading(false);

    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.error || 'Failed to sign in. Please verify your credentials.');
    }
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast({
        title: `Signed in with ${provider}`,
        type: 'success'
      });
      router.push('/dashboard');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6 bg-surface rounded-2xl border border-outline-variant p-6 sm:p-8 shadow-sm">
        {/* Header / Logo */}
        <div className="text-center flex flex-col items-center gap-2">
          <Link href="/" className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-xs mb-1 hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[28px] fill-icon">payments</span>
          </Link>
          <h1 className="text-2xl font-bold text-primary tracking-tight">PayPilot AI</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">Sign in to your account</p>
        </div>

        {error && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-xs font-semibold text-error">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-semibold text-on-surface" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">
                mail
              </span>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs sm:text-sm font-semibold text-on-surface" htmlFor="password">
                Password
              </label>
              <button
                type="button"
                onClick={() => showToast({ title: 'Password Reset Link', description: 'Reset email simulated for ' + email, type: 'info' })}
                className="text-xs text-primary font-medium hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">
                lock
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-on-primary font-semibold text-sm py-3 rounded-lg shadow-sm hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-outline-variant"></div>
          <span className="flex-shrink-0 mx-3 text-xs text-outline">or continue with</span>
          <div className="flex-grow border-t border-outline-variant"></div>
        </div>

        {/* Social Login */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => handleSocialLogin('Google')}
            className="w-full flex items-center justify-center gap-2.5 bg-surface text-on-surface font-semibold text-xs sm:text-sm py-2.5 rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors"
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
            className="w-full flex items-center justify-center gap-2.5 bg-surface text-on-surface font-semibold text-xs sm:text-sm py-2.5 rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors"
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
