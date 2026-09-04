import crypto from 'crypto';

export interface StripeCheckoutSessionOptions {
  customerEmail?: string;
  plan: string;
  billingCycle: 'monthly' | 'annual';
  priceInCents: number;
  currency?: string;
  successUrl: string;
  cancelUrl: string;
  clientReferenceId?: string;
  metadata?: Record<string, string>;
}

export interface StripeCheckoutSessionResponse {
  id: string;
  url: string;
  customer?: string;
  subscription?: string;
  payment_status: string;
  status: string;
}

/**
 * Server-side Stripe client utility for Ventrexs SaaS subscriptions.
 * Operates strictly server-side using secure REST API requests with Bearer token and HMAC-SHA256 signature verification.
 */
export class StripeClient {
  private secretKey: string;
  private publishableKey: string;
  private webhookSecret: string;

  constructor(secretKey?: string, publishableKey?: string, webhookSecret?: string) {
    this.secretKey = secretKey || process.env.STRIPE_SECRET_KEY || '';
    this.publishableKey =
      publishableKey ||
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      process.env.STRIPE_PUBLISHABLE_KEY ||
      '';
    this.webhookSecret = webhookSecret || process.env.STRIPE_WEBHOOK_SECRET || '';
  }

  public get isConfigured(): boolean {
    return Boolean(this.secretKey);
  }

  public getPublishableKey(): string {
    return this.publishableKey;
  }

  /**
   * Create a Stripe Checkout hosted session for subscription
   */
  async createCheckoutSession(
    options: StripeCheckoutSessionOptions
  ): Promise<StripeCheckoutSessionResponse> {
    if (!this.isConfigured) {
      throw new Error('Stripe credentials not configured. Set STRIPE_SECRET_KEY.');
    }

    if (this.secretKey === 'sk_test_paypilot_local' || this.secretKey.startsWith('sk_test_mock')) {
      const sessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      return {
        id: sessionId,
        url: options.successUrl.replace('{CHECKOUT_SESSION_ID}', sessionId),
        payment_status: 'unpaid',
        status: 'open',
      };
    }

    const isAnnual = options.billingCycle === 'annual';
    const currency = (options.currency || 'usd').toLowerCase();

    const bodyParams = new URLSearchParams({
      mode: 'subscription',
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      'line_items[0][price_data][currency]': currency,
      'line_items[0][price_data][product_data][name]': `Ventrexs AI ${options.plan} Plan (${options.billingCycle})`,
      'line_items[0][price_data][unit_amount]': Math.round(options.priceInCents).toString(),
      'line_items[0][price_data][recurring][interval]': isAnnual ? 'year' : 'month',
      'line_items[0][quantity]': '1',
    });

    if (options.customerEmail) {
      bodyParams.append('customer_email', options.customerEmail);
    }

    if (options.clientReferenceId) {
      bodyParams.append('client_reference_id', options.clientReferenceId);
    }

    if (options.metadata) {
      for (const [key, value] of Object.entries(options.metadata)) {
        bodyParams.append(`metadata[${key}]`, value);
      }
    }

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Stripe createCheckoutSession failed (${res.status}): ${errBody}`);
    }

    return (await res.json()) as StripeCheckoutSessionResponse;
  }

  /**
   * Fetch customer portal session
   */
  async createBillingPortalSession(customerId: string, returnUrl: string): Promise<{ url: string }> {
    if (!this.isConfigured) throw new Error('Stripe credentials not configured.');

    const bodyParams = new URLSearchParams({
      customer: customerId,
      return_url: returnUrl,
    });

    const res = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Stripe portal session failed (${res.status}): ${errBody}`);
    }

    return await res.json();
  }

  /**
   * Cryptographically verify Stripe Webhook Signature
   * Adheres to Stripe standard: stripe-signature header formatted as `t=timestamp,v1=signature`
   */
  verifyWebhookSignature(
    rawBody: string,
    signatureHeader: string,
    customSecret?: string,
    toleranceInSeconds: number = 300
  ): { isValid: boolean; event?: Record<string, unknown>; error?: string } {
    const secret = customSecret || this.webhookSecret || process.env.STRIPE_WEBHOOK_SECRET || '';
    if (!secret || !signatureHeader || !rawBody) {
      return { isValid: false, error: 'Missing webhook secret or signature header' };
    }

    try {
      const parts = signatureHeader.split(',');
      let timestamp = '';
      const signatures: string[] = [];

      for (const part of parts) {
        const [key, val] = part.trim().split('=');
        if (key === 't') {
          timestamp = val;
        } else if (key === 'v1') {
          signatures.push(val);
        }
      }

      if (!timestamp || signatures.length === 0) {
        return { isValid: false, error: 'Malformed stripe-signature header' };
      }

      // Check timestamp freshness
      const timeDiff = Math.abs(Math.floor(Date.now() / 1000) - parseInt(timestamp, 10));
      if (timeDiff > toleranceInSeconds) {
        return { isValid: false, error: `Webhook timestamp outside tolerance (${timeDiff}s)` };
      }

      const signedPayload = `${timestamp}.${rawBody}`;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(signedPayload)
        .digest('hex');

      const expectedBuf = Buffer.from(expectedSignature, 'utf8');
      const isMatch = signatures.some((sig) => {
        const sigBuf = Buffer.from(sig, 'utf8');
        if (sigBuf.length !== expectedBuf.length) return false;
        return crypto.timingSafeEqual(expectedBuf, sigBuf);
      });

      if (!isMatch) {
        return { isValid: false, error: 'Signature mismatch' };
      }

      const parsedEvent = JSON.parse(rawBody) as Record<string, unknown>;
      return { isValid: true, event: parsedEvent };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to verify signature';
      return { isValid: false, error: msg };
    }
  }
}

// Singleton helper
let stripeInstance: StripeClient | null = null;
export function getStripeClient(): StripeClient {
  if (!stripeInstance) {
    stripeInstance = new StripeClient();
  }
  return stripeInstance;
}
