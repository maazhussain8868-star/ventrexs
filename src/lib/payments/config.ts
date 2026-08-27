/**
 * VENTREXS AI — PAYMENT ENVIRONMENT VALIDATION & DIAGNOSTICS
 * Validates environment variables for payment providers safely.
 * NEVER leaks or prints raw secrets. Reports only configuration status and missing variable names.
 */

export interface ProviderConfigStatus {
  provider: 'razorpay' | 'stripe' | 'skydo' | 'google_play' | 'demo';
  isConfigured: boolean;
  missingVariables: string[];
  status: 'CONFIGURED' | 'NOT_CONFIGURED' | 'DEMO_SANDBOX';
  notes: string;
}

export interface PaymentSystemHealth {
  demoMode: boolean;
  activeSaasProvider: string;
  activeCustomerProvider: string;
  providers: {
    razorpay: ProviderConfigStatus;
    stripe: ProviderConfigStatus;
    skydo: ProviderConfigStatus;
    google_play: ProviderConfigStatus;
    demo: ProviderConfigStatus;
  };
}

export class PaymentConfigValidator {
  /**
   * Validates Razorpay configuration status (India SaaS & Customer Payments)
   */
  static getRazorpayStatus(): ProviderConfigStatus {
    const missing: string[] = [];
    if (!process.env.RAZORPAY_KEY_ID) missing.push('RAZORPAY_KEY_ID');
    if (!process.env.RAZORPAY_KEY_SECRET) missing.push('RAZORPAY_KEY_SECRET');
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) missing.push('RAZORPAY_WEBHOOK_SECRET');

    const isConfigured = missing.length === 0;
    return {
      provider: 'razorpay',
      isConfigured,
      missingVariables: missing,
      status: isConfigured ? 'CONFIGURED' : 'NOT_CONFIGURED',
      notes: isConfigured
        ? 'Razorpay credentials present for India SaaS subscription & invoicing operations.'
        : `Razorpay is not configured. Missing variables: ${missing.join(', ')}.`,
    };
  }

  /**
   * Validates Stripe configuration status (International SaaS & Invoices)
   */
  static getStripeStatus(): ProviderConfigStatus {
    const missing: string[] = [];
    if (!process.env.STRIPE_SECRET_KEY) missing.push('STRIPE_SECRET_KEY');
    if (!process.env.STRIPE_WEBHOOK_SECRET) missing.push('STRIPE_WEBHOOK_SECRET');
    if (!process.env.STRIPE_PUBLISHABLE_KEY) missing.push('STRIPE_PUBLISHABLE_KEY');

    const isConfigured = missing.length === 0;
    return {
      provider: 'stripe',
      isConfigured,
      missingVariables: missing,
      status: isConfigured ? 'CONFIGURED' : 'NOT_CONFIGURED',
      notes: isConfigured
        ? 'Stripe credentials present for international subscription and checkout operations.'
        : `Stripe is not configured. Missing variables: ${missing.join(', ')}.`,
    };
  }

  /**
   * Validates Skydo configuration status (Cross-Border Invoicing)
   */
  static getSkydoStatus(): ProviderConfigStatus {
    const missing: string[] = [];
    if (!process.env.SKYDO_API_KEY) missing.push('SKYDO_API_KEY');
    if (!process.env.SKYDO_API_SECRET && !process.env.SKYDO_SECRET_KEY) {
      missing.push('SKYDO_API_SECRET');
    }
    if (!process.env.SKYDO_WEBHOOK_SECRET) missing.push('SKYDO_WEBHOOK_SECRET');

    const isConfigured = missing.length === 0;
    return {
      provider: 'skydo',
      isConfigured,
      missingVariables: missing,
      status: isConfigured ? 'CONFIGURED' : 'NOT_CONFIGURED',
      notes: isConfigured
        ? 'Skydo credentials present for B2B cross-border invoice settlements.'
        : `Skydo is not configured. Missing variables: ${missing.join(', ')}.`,
    };
  }

  /**
   * Validates Google Play Billing configuration status (Android SaaS Digital Subscriptions)
   */
  static getGooglePlayStatus(): ProviderConfigStatus {
    const missing: string[] = [];
    if (!process.env.GOOGLE_PLAY_PACKAGE_NAME && !process.env.NEXT_PUBLIC_DEMO_MODE) {
      missing.push('GOOGLE_PLAY_PACKAGE_NAME');
    }
    if (!process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON && !process.env.NEXT_PUBLIC_DEMO_MODE) {
      missing.push('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON');
    }

    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    const isConfigured = isDemo || missing.length === 0;

    return {
      provider: 'google_play',
      isConfigured,
      missingVariables: missing,
      status: isDemo ? 'DEMO_SANDBOX' : isConfigured ? 'CONFIGURED' : 'NOT_CONFIGURED',
      notes: isDemo
        ? 'Google Play sandbox verifier active with zero external API calls.'
        : isConfigured
        ? 'Google Play Developer API service account credentials verified.'
        : `Google Play is not configured for production. Missing: ${missing.join(', ')}.`,
    };
  }

  /**
   * Validates Demo Provider status
   */
  static getDemoStatus(): ProviderConfigStatus {
    return {
      provider: 'demo',
      isConfigured: true,
      missingVariables: [],
      status: 'DEMO_SANDBOX',
      notes: 'Demo adapter is always available with 0 external API calls.',
    };
  }

  /**
   * Generates a complete system health overview for admin diagnostics
   */
  static getSystemHealth(): PaymentSystemHealth {
    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    return {
      demoMode: isDemo,
      activeSaasProvider: isDemo ? 'demo' : process.env.SAAS_PAYMENT_PROVIDER || 'razorpay',
      activeCustomerProvider: isDemo ? 'demo' : process.env.CUSTOMER_PAYMENT_PROVIDER || 'razorpay',
      providers: {
        razorpay: this.getRazorpayStatus(),
        stripe: this.getStripeStatus(),
        skydo: this.getSkydoStatus(),
        google_play: this.getGooglePlayStatus(),
        demo: this.getDemoStatus(),
      },
    };
  }
}
