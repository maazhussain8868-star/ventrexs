import { PaymentProvider } from '../types';
import { globalDevPaymentProvider } from './dev-provider';
import { StripePaymentProviderAdapter } from './stripe-adapter';
import { RazorpayBillingProviderAdapter } from './razorpay-billing-adapter';

export function getPaymentProvider(): PaymentProvider {
  const isProduction = process.env.NODE_ENV === 'production';
  const providerType = (process.env.BILLING_PROVIDER || process.env.SAAS_PAYMENT_PROVIDER || '').toLowerCase();

  // --- Razorpay (Primary SaaS provider, configured as default in .env.example) ---
  if (providerType === 'razorpay') {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      if (isProduction && process.env.ALLOW_DEV_PROVIDERS !== 'true') {
        throw new Error(
          'PRODUCTION CONFIGURATION ERROR: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required for Razorpay billing provider.'
        );
      }
      // Fall through to dev provider below
    } else {
      return new RazorpayBillingProviderAdapter(keyId, keySecret, process.env.RAZORPAY_WEBHOOK_SECRET);
    }
  }

  // --- Stripe (International SaaS provider) ---
  if (
    providerType === 'stripe' ||
    (process.env.STRIPE_SECRET_KEY?.startsWith('sk_') && providerType !== 'test')
  ) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      if (isProduction && process.env.ALLOW_DEV_PROVIDERS !== 'true') {
        throw new Error('PRODUCTION CONFIGURATION ERROR: STRIPE_SECRET_KEY is required for Stripe billing provider.');
      }
    } else {
      return new StripePaymentProviderAdapter(stripeKey, process.env.STRIPE_WEBHOOK_SECRET);
    }
  }

  // Production safeguard: do not silently fall back to Dev provider in production
  if (isProduction && process.env.ALLOW_DEV_PROVIDERS !== 'true') {
    throw new Error(
      'PRODUCTION CONFIGURATION ERROR: BILLING_PROVIDER must be set to "razorpay" or "stripe" in production. ' +
      'Set RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET (for Razorpay) or STRIPE_SECRET_KEY (for Stripe).'
    );
  }

  return globalDevPaymentProvider;
}
