'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function SignupPage() {
  const router = useRouter();
  const { signUp, showToast } = useApp();
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !businessName || !email || !password) {
      setError('Please complete all required fields.');
      return;
    }
    if (!agreeTerms) {
      setError('Please accept the terms and conditions.');
      return;
    }

    setIsLoading(true);
    setError('');

    const res = await signUp({
      email,
      password,
      name,
      businessName,
    });
    setIsLoading(false);

    if (res.success) {
      router.push('/onboarding');
    } else {
      setError(res.error || 'Failed to create account. Please try again.');
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
    <div className="min-h-screen bg-background text-on-background flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md mx-auto flex flex-col gap-6 bg-surface rounded-2xl border border-outline-variant p-6 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-2">
          <Link href="/" className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-xs mb-1">
            <span className="material-symbols-outlined text-[28px] fill-icon">payments</span>
          </Link>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Create your account</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Start your 14-day free trial of PayPilot AI
          </p>
        </div>

        {error && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-xs font-semibold text-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1" htmlFor="name">
                Your Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1" htmlFor="business">
                Business Name
              </label>
              <input
                id="business"
                type="text"
                required
                placeholder="Main Street Bakery"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1" htmlFor="email">
              Work Email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="jane@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1" htmlFor="password">
              Create Password
            </label>
            <input
              id="password"
              type="password"
              required
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
            />

            {/* Password strength meter */}
            {password && (
              <div className="mt-2 flex items-center gap-1.5">
                <div className="flex-1 h-1.5 rounded-full bg-surface-container-high overflow-hidden flex gap-1">
                  <div className={`h-full flex-1 rounded-full ${strength >= 1 ? 'bg-error' : 'bg-transparent'}`} />
                  <div className={`h-full flex-1 rounded-full ${strength >= 2 ? 'bg-amber-500' : 'bg-transparent'}`} />
                  <div className={`h-full flex-1 rounded-full ${strength >= 3 ? 'bg-tertiary-container' : 'bg-transparent'}`} />
                  <div className={`h-full flex-1 rounded-full ${strength >= 4 ? 'bg-tertiary' : 'bg-transparent'}`} />
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant">
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
              className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-on-surface-variant leading-tight cursor-pointer">
              I agree to the <a href="#" className="text-primary underline">Terms of Service</a> and <a href="#" className="text-primary underline">Privacy Policy</a>.
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-on-primary font-semibold text-sm py-3 rounded-lg shadow-sm hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              'Create Free Account'
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-xs text-on-surface-variant">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
