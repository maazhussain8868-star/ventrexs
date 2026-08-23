import { PaymentProvider } from '../types';
import { globalDevPaymentProvider } from './dev-provider';
import { StripePaymentProviderAdapter } from './stripe-adapter';

export function getPaymentProvider(): PaymentProvider {
  const isProduction = process.env.NODE_ENV === 'production';
  const providerType = process.env.BILLING_PROVIDER?.toLowerCase();
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (
    providerType === 'stripe' ||
    (stripeKey && stripeKey.startsWith('sk_') && providerType !== 'test')
  ) {
    if (!stripeKey) {
      throw new Error('PRODUCTION CONFIGURATION ERROR: STRIPE_SECRET_KEY is required for Stripe billing provider.');
    }
    return new StripePaymentProviderAdapter(stripeKey, webhookSecret);
  }

  // Production safeguard: do not silently fall back to Dev provider in production
  if (isProduction && process.env.ALLOW_DEV_PROVIDERS !== 'true') {
    throw new Error(
      'PRODUCTION CONFIGURATION ERROR: BILLING_PROVIDER must be configured to a valid production provider (e.g. "stripe") in production mode.'
    );
  }

  return globalDevPaymentProvider;
}
