import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, CheckCircle2, RefreshCw, KeyRound, AlertTriangle } from 'lucide-react';

export const OtpScreen: React.FC = () => {
  const { loginPhone, verifyOtp, navigateTo, showToast, isLiveAuthReady } = useApp();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    const val = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = val;
    setDigits(newDigits);
    if (errorMsg) setErrorMsg('');

    // Auto move to next input
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 filled
    if (val && index === 5 && newDigits.every((d) => d !== '')) {
      handleComplete(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleComplete = async (code: string) => {
    if (!isLiveAuthReady) {
      setErrorMsg('Production backend is not configured.');
      showToast('Production backend is not configured.', 'error');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');
    const res = await verifyOtp(code);
    setIsVerifying(false);

    if (!res.success) {
      setErrorMsg(res.message || 'Verification token validation failed');
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    if (!isLiveAuthReady) {
      setErrorMsg('Production backend is not configured.');
      showToast('Production backend is not configured.', 'error');
      return;
    }
    setTimer(30);
    setCanResend(false);
    showToast(`Verification code redispatched to +91 ${loginPhone}`, 'info');
  };

  return (
    <div className="min-h-[750px] flex-1 bg-white text-slate-900 flex flex-col justify-between p-6 select-none">
      {/* Top Header */}
      <div>
        <button
          onClick={() => navigateTo('login')}
          className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 text-xs font-semibold py-1 rounded-full active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Change Number</span>
        </button>

        <div className="mt-6 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 border border-emerald-100">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 leading-tight">
            Verify Your Mobile
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Enter the 6-digit verification code sent to{' '}
            <span className="font-bold text-slate-800 tracking-wide">
              +91 {loginPhone || 'Your Mobile'}
            </span>
          </p>
        </div>

        {/* Backend Not Configured Alert */}
        {!isLiveAuthReady && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-900">Production backend is not configured.</span>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-snug">
                Cannot verify OTP without a connected Supabase project. Configure <code className="font-mono bg-amber-100 px-1 rounded">.env</code> to enable live phone verification.
              </p>
            </div>
          </div>
        )}

        {/* 6 Digit Input Boxes */}
        <div className="flex justify-between gap-2 my-6">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-12 h-14 text-center text-xl font-bold bg-slate-50 border-2 border-slate-200 focus:border-emerald-600 focus:bg-white focus:outline-none rounded-xl text-slate-900 transition-all shadow-xs"
              autoFocus={idx === 0}
            />
          ))}
        </div>

        {errorMsg && (
          <p className="text-rose-600 text-xs font-semibold mb-3 text-center">
            {errorMsg}
          </p>
        )}

        {/* Resend Timer */}
        <div className="flex justify-end mt-2">
          {canResend ? (
            <button
              onClick={handleResend}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resend Code</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400 font-medium">
              Resend in <span className="font-bold text-slate-600">{timer}s</span>
            </span>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={() => handleComplete(digits.join(''))}
          disabled={digits.some((d) => d === '') || isVerifying}
          className="w-full mt-8 py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-lg shadow-emerald-700/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
        >
          {isVerifying ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify & Continue</span>
            </>
          )}
        </button>
      </div>

      {/* Footer Info */}
      <div className="pt-6 border-t border-slate-100 text-center">
        <p className="text-[11px] text-slate-400">
          SMS delivery subject to network conditions. Ensure DND settings permit transactional messages.
        </p>
      </div>
    </div>
  );
};
