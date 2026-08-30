'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, RotateCcw, AlertCircle, Shield } from 'lucide-react';

/**
 * /billing/checkout
 *
 * Renders the Razorpay payment modal using Razorpay.js (public script).
 * Only receives: order_id, key_id (PUBLIC), amount, plan metadata from URL params.
 * The KEY_SECRET is NEVER sent here — it stays on the server.
 *
 * After payment:
 * - Razorpay calls handler.ondismiss (user cancelled) or handler.onsuccess
 * - On success: we redirect to /api/billing/verify with the payment details
 * - The API route verifies the signature SERVER-SIDE, then activates subscription
 */
export default function BillingCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rzpRef = useRef<any>(null);
  const [status, setStatus] = useState<'loading' | 'opening' | 'cancelled' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  // Extract params from URL (set by RazorpayBillingProviderAdapter.createCheckoutSession)
  const orderId = searchParams.get('order_id') || '';
  const keyId = searchParams.get('key_id') || '';
  const amount = searchParams.get('amount') || '0';
  const currency = searchParams.get('currency') || 'USD';
  const plan = searchParams.get('plan') || '';
  const billingCycle = searchParams.get('interval') || 'monthly';
  const email = searchParams.get('email') || '';
  const name = searchParams.get('name') || '';
  const businessId = searchParams.get('business_id') || '';
  const successUrl = searchParams.get('success_url') || '/billing/success';
  const cancelUrl = searchParams.get('cancel_url') || '/billing?cancelled=true';

  useEffect(() => {
    if (!orderId || !keyId) {
      setStatus('error');
      setErrorMessage('Invalid checkout session. Missing order or key parameters.');
      return;
    }

    // Load Razorpay.js script dynamically
    const existingScript = document.getElementById('razorpay-js');
    if (existingScript) {
      initRazorpay();
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = initRazorpay;
    script.onerror = () => {
      setStatus('error');
      setErrorMessage('Failed to load payment module. Please check your internet connection.');
    };
    document.body.appendChild(script);

    return () => {
      if (rzpRef.current) {
        rzpRef.current.close?.();
      }
    };
  }, [orderId, keyId]);

  function initRazorpay() {
    setStatus('opening');

    const options = {
      key: keyId,               // Public key ONLY (not secret)
      amount: amount,           // In smallest currency unit (cents / paise)
      currency: currency,
      name: 'Ventrexs AI',
      description: `${plan} Plan — ${billingCycle} subscription`,
      order_id: orderId,
      prefill: {
        email,
        name,
      },
      notes: {
        business_id: businessId,
        plan,
        interval: billingCycle,
      },
      theme: {
        color: '#2563EB',
      },
      modal: {
        ondismiss: () => {
          setStatus('cancelled');
          // Give user a moment to see the cancellation message, then redirect
          setTimeout(() => {
            router.replace(cancelUrl || '/billing?cancelled=true');
          }, 2000);
        },
      },
      handler: (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        // Payment modal completed — redirect to server-side verification
        // /api/billing/verify will validate signature, activate subscription, then redirect
        const verifyUrl = `/api/billing/verify?` + new URLSearchParams({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          plan,
          billing_cycle: billingCycle,
          business_id: businessId,
          success_url: successUrl,
        }).toString();

        window.location.href = verifyUrl;
      },
    };

    try {
      // @ts-ignore — Razorpay is loaded from external script
      rzpRef.current = new window.Razorpay(options);
      rzpRef.current.on('payment.failed', (response: any) => {
        setStatus('error');
        setErrorMessage(
          response?.error?.description ||
          'Payment failed. Please try again or use a different payment method.'
        );
      });
      rzpRef.current.open();
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err?.message || 'Failed to initialize payment modal.');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 font-sans">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="font-extrabold text-lg text-slate-900">Ventrexs AI</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 max-w-sm w-full text-center">
        {status === 'loading' && (
          <>
            <RotateCcw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="font-black text-lg text-slate-900">Loading Payment Module</h2>
            <p className="text-xs text-slate-500 mt-2">
              Securely loading payment gateway…
            </p>
          </>
        )}

        {status === 'opening' && (
          <>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
            <h2 className="font-black text-lg text-slate-900">Opening Checkout</h2>
            <p className="text-xs text-slate-500 mt-2">
              Complete your payment in the popup window.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-4">
              <Shield className="w-3.5 h-3.5" />
              <span>256-bit encrypted, PCI-compliant</span>
            </div>
          </>
        )}

        {status === 'cancelled' && (
          <>
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-4" />
            <h2 className="font-black text-lg text-slate-900">Payment Cancelled</h2>
            <p className="text-xs text-slate-500 mt-2">
              Your subscription has not been activated. Redirecting back to plan selection…
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-4" />
            <h2 className="font-black text-lg text-slate-900">Payment Error</h2>
            <p className="text-xs text-slate-500 mt-2">{errorMessage}</p>
            <button
              onClick={() => router.replace('/billing?failed=true')}
              className="mt-4 w-full py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
