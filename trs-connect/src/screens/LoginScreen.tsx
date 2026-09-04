import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, ShieldCheck, Lock, AlertTriangle } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { requestOtp, setLoginPhone, navigateTo, isLiveAuthReady, showToast } = useApp();
  const [phoneInput, setPhoneInput] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLiveAuthReady) {
      setError('Production backend is not configured.');
      showToast('Production backend is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.', 'error');
      return;
    }

    const cleanPhone = phoneInput.trim().replace(/\D/g, '');

    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    if (!agreeTerms) {
      setError('Please consent to receiving authentication SMS to continue');
      return;
    }

    setError('');
    setIsLoading(true);
    setLoginPhone(cleanPhone);
    const res = await requestOtp(cleanPhone);
    setIsLoading(false);

    if (!res.success) {
      setError(res.message || 'Authentication request failed');
    }
  };

  return (
    <div className="min-h-[750px] flex-1 bg-white text-slate-900 flex flex-col justify-between p-6 select-none">
      {/* Top Bar */}
      <div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-amber-300 font-extrabold text-xs flex items-center justify-center">
              TRS
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-emerald-950 leading-none">TRS CONNECT</h2>
              <span className="text-[10px] text-emerald-700 font-semibold">Citizen Gateway</span>
            </div>
          </div>

          <button
            onClick={() => navigateTo('home')}
            className="text-xs font-bold text-slate-400 hover:text-emerald-700 px-3 py-1 rounded-full hover:bg-emerald-50 transition-colors"
          >
            Explore as Guest
          </button>
        </div>

        {/* Clear Production Backend Missing Alert */}
        {!isLiveAuthReady && (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-start gap-2.5 shadow-xs">
            <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-black block text-amber-900">
                Production backend is not configured.
              </span>
              <p className="text-[11px] text-amber-800 mt-1 leading-snug">
                Supabase environment variables (<code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-900">VITE_SUPABASE_URL</code> and <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-900">VITE_SUPABASE_ANON_KEY</code>) must be configured in <code className="font-mono bg-amber-100 px-1 rounded">.env</code> to dispatch real SMS codes.
              </p>
            </div>
          </div>
        )}

        {/* Hero Title */}
        <div className="mt-6 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Secure Citizen Access
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-3 leading-tight">
            Sign In with Mobile
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Enter your 10-digit mobile number to access voluntary membership and community services.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Mobile Number
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center gap-1.5 text-slate-500 font-bold text-sm border-r border-slate-200 pr-2">
                <span className="text-xs">🇮🇳</span>
                <span>+91</span>
              </div>
              <input
                type="tel"
                maxLength={10}
                value={phoneInput}
                onChange={(e) => {
                  setPhoneInput(e.target.value.replace(/\D/g, ''));
                  if (error) setError('');
                }}
                placeholder="Enter 10-digit number"
                className="w-full pl-24 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all tracking-wider"
                autoFocus
              />
            </div>
            {error && <p className="text-rose-600 text-xs mt-1.5 font-medium">{error}</p>}
          </div>

          {/* Consent Checkbox */}
          <label className="flex items-start gap-2.5 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
            />
            <span className="text-xs text-slate-500 leading-snug">
              I voluntarily agree to receive authentication SMS and adhere to the voluntary citizen code of conduct.
            </span>
          </label>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-lg shadow-emerald-700/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Send Verification Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Trust & Compliance Badge */}
      <div className="pt-6 border-t border-slate-100 space-y-2">
        <div className="flex items-center gap-2 text-slate-500 text-[11px]">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Encrypted citizen data with Row Level Security</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-[11px]">
          <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Strict zero-profiling guarantee: No political persuasion profiling</span>
        </div>
      </div>
    </div>
  );
};
