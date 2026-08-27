/**
 * VENTREXS AI — PHASE 14: PAYMENT PROVIDER FACTORY
 * Resolves appropriate payment adapters based on purpose, tenant configuration, and environment
 */

import { PaymentProvider } from './provider';
import { PaymentPurpose, PaymentProviderName } from './types';
import { DemoPaymentAdapter } from './adapters/demo-adapter';
import { RazorpayPaymentAdapter } from './adapters/razorpay-adapter';
import { StripeCustomerPaymentAdapter } from './adapters/stripe-adapter';
import { SkydoPaymentAdapter } from './adapters/skydo-adapter';
import { GooglePlayPaymentAdapter } from './adapters/google-play-adapter';

export class PaymentProviderFactory {
  /**
   * Resolves the authoritative PaymentProvider instance based on purpose and config
   */
  static getProvider(
    purposeOrProvider: PaymentPurpose | string = 'CUSTOMER_INVOICE',
    preferredProvider?: string,
    credentials?: { keyId?: string; secret?: string; webhookSecret?: string; apiKey?: string }
  ): PaymentProvider {
    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

    // Check if first param was a direct provider name (legacy signature)
    let purpose: PaymentPurpose = 'CUSTOMER_INVOICE';
    let providerName = preferredProvider;

    if (purposeOrProvider === 'SAAS_SUBSCRIPTION' || purposeOrProvider === 'CUSTOMER_INVOICE' || purposeOrProvider === 'DEMO') {
      purpose = purposeOrProvider;
    } else {
      providerName = purposeOrProvider;
    }

    // 1. Strict Demo Mode Isolation: If demo mode is active, or purpose is DEMO, ALWAYS use DemoPaymentAdapter
    if (isDemo || purpose === 'DEMO' || providerName === 'demo') {
      return new DemoPaymentAdapter();
    }

    // 2. SaaS Subscription Purpose
    if (purpose === 'SAAS_SUBSCRIPTION') {
      const saasProvider = (providerName || process.env.SAAS_PAYMENT_PROVIDER || 'razorpay').toLowerCase();
      if (saasProvider === 'google_play' || saasProvider === 'googleplay') {
        return new GooglePlayPaymentAdapter();
      }
      if (saasProvider === 'stripe') {
        return new StripeCustomerPaymentAdapter(credentials?.secret || credentials?.apiKey, credentials?.webhookSecret);
      }
      // Default primary for India SaaS is Razorpay
      return new RazorpayPaymentAdapter(credentials?.keyId || credentials?.apiKey, credentials?.secret, credentials?.webhookSecret);
    }

    // 3. Customer Invoice Purpose
    const customerProvider = (
      providerName ||
      process.env.CUSTOMER_PAYMENT_PROVIDER ||
      'razorpay'
    ).toLowerCase();


    switch (customerProvider) {
      case 'skydo':
        return new SkydoPaymentAdapter(credentials?.keyId || credentials?.secret, credentials?.webhookSecret);
      case 'stripe':
        return new StripeCustomerPaymentAdapter(credentials?.secret, credentials?.webhookSecret);
      case 'india_upi':
      case 'razorpay':
      default:
        return new RazorpayPaymentAdapter(credentials?.keyId, credentials?.secret, credentials?.webhookSecret);
    }
  }
}
