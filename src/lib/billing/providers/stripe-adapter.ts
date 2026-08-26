import crypto from 'crypto';
import { CheckoutSessionParams, CheckoutSessionResult, PaymentProvider, WebhookEvent } from '../types';

/**
 * Production-ready Stripe Payment Provider Adapter
 * Keeps all Stripe API calls isolated behind the PaymentProvider interface.
 */
export class StripePaymentProviderAdapter implements PaymentProvider {
  name = 'Stripe Production Adapter';

  constructor(
    private secretKey: string,
    private webhookSecret?: string
  ) {}

  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult> {
    const isAnnual = params.interval === 'annual';
    const amountInCents = params.plan === 'Starter'
      ? (isAnnual ? 19000 : 1900)
      : params.plan === 'Professional'
      ? (isAnnual ? 49000 : 4900)
      : (isAnnual ? 199000 : 19900);

    const bodyParams = new URLSearchParams({
      'mode': 'subscription',
      'customer_email': params.customerEmail,
      'success_url': params.successUrl,
      'cancel_url': params.cancelUrl,
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][product_data][name]': `Ventrexs AI ${params.plan} Plan (${params.interval})`,
      'line_items[0][price_data][unit_amount]': amountInCents.toString(),
      'line_items[0][price_data][recurring][interval]': isAnnual ? 'year' : 'month',
      'line_items[0][quantity]': '1',
      'client_reference_id': params.businessId,
      'metadata[business_id]': params.businessId,
      'metadata[plan]': params.plan,
      'metadata[interval]': params.interval,
    });

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
    });

    const session = await response.json();

    if (!response.ok) {
      throw new Error(`Stripe Checkout Error: ${session?.error?.message || response.statusText}`);
    }

    return {
      sessionId: session.id,
      checkoutUrl: session.url,
      provider: this.name,
    };
  }

  /**
   * Cryptographically verifies Stripe webhook signatures with HMAC-SHA256 and constant-time equality.
   * Enforces timestamp freshness (default 300s) to neutralize replay attacks.
   */
  async verifyWebhookSignature(
    payload: string,
    signature: string,
    secret?: string,
    toleranceSeconds: number = 300
  ): Promise<{ isValid: boolean; event?: WebhookEvent; error?: string }> {
    const whSecret = secret || this.webhookSecret;
    if (!whSecret || whSecret.trim() === '') {
      return { isValid: false, error: 'Stripe webhook signing secret is not configured.' };
    }

    if (!signature || typeof signature !== 'string' || signature.trim() === '') {
      return { isValid: false, error: 'Missing or empty Stripe webhook signature header.' };
    }

    if (!payload || typeof payload !== 'string' || payload.trim() === '') {
      return { isValid: false, error: 'Missing or empty Stripe webhook payload.' };
    }

    // 1. Parse Stripe signature header format: "t=1492774577,v1=5257a869e7...,v1=..."
    const signatureItems = signature.split(',').reduce<Record<string, string[]>>((acc, item) => {
      const parts = item.trim().split('=');
      if (parts.length === 2 && parts[0] && parts[1]) {
        const key = parts[0].trim();
        const value = parts[1].trim();
        if (!acc[key]) acc[key] = [];
        acc[key].push(value);
      }
      return acc;
    }, {});

    const timestampStr = signatureItems['t']?.[0];
    const v1Signatures = signatureItems['v1'];

    if (!timestampStr || !v1Signatures || v1Signatures.length === 0) {
      return {
        isValid: false,
        error: 'Malformed Stripe signature header: missing timestamp ("t=") or signature ("v1=").',
      };
    }

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp) || timestamp <= 0) {
      return {
        isValid: false,
        error: 'Malformed Stripe signature header: invalid integer timestamp.',
      };
    }

    // 2. Enforce timestamp tolerance check (prevent replay attacks)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > toleranceSeconds) {
      return {
        isValid: false,
        error: `Webhook signature timestamp expired (Timestamp: ${timestamp}, Current: ${now}, Tolerance: ${toleranceSeconds}s).`,
      };
    }

    // 3. Compute expected HMAC-SHA256 hex digest for signed payload: `${timestamp}.${payload}`
    const signedPayload = `${timestamp}.${payload}`;
    let expectedSignatureHex: string;
    try {
      expectedSignatureHex = crypto
        .createHmac('sha256', whSecret)
        .update(signedPayload, 'utf8')
        .digest('hex');
    } catch (cryptoErr: unknown) {
      const errMsg = cryptoErr instanceof Error ? cryptoErr.message : String(cryptoErr);
      return {
        isValid: false,
        error: `Cryptographic HMAC calculation failed: ${errMsg}`,
      };
    }

    const expectedBuffer = Buffer.from(expectedSignatureHex, 'utf8');

    // 4. Verify candidate v1 signatures using constant-time comparison
    let signatureMatches = false;
    for (const v1Sig of v1Signatures) {
      const candidateBuffer = Buffer.from(v1Sig, 'utf8');
      if (
        candidateBuffer.length === expectedBuffer.length &&
        crypto.timingSafeEqual(candidateBuffer, expectedBuffer)
      ) {
        signatureMatches = true;
        break;
      }
    }

    if (!signatureMatches) {
      return {
        isValid: false,
        error: 'Cryptographic signature mismatch: forged, tampered, or invalid Stripe signature.',
      };
    }

    // 5. Parse and validate JSON payload strictly after signature verification
    try {
      const parsed = JSON.parse(payload);
      if (!parsed || typeof parsed !== 'object' || !parsed.id || !parsed.type) {
        return {
          isValid: false,
          error: 'Verified webhook payload is missing required event fields ("id", "type").',
        };
      }

      const dataObj = parsed?.data?.object || {};
      const metadata = dataObj?.metadata || {};

      const event: WebhookEvent = {
        id: parsed.id,
        provider: this.name,
        type: parsed.type,
        businessId: metadata.business_id || metadata.businessId || dataObj.client_reference_id,
        plan: metadata.plan,
        interval: metadata.interval,
        providerCustomerId: dataObj.customer,
        providerSubscriptionId: dataObj.subscription || dataObj.id,
        status: dataObj.status === 'past_due' ? 'past_due' : dataObj.status === 'canceled' || dataObj.status === 'cancelled' ? 'cancelled' : dataObj.status === 'active' ? 'active' : parsed.type === 'invoice.payment_failed' ? 'past_due' : 'active',
        currentPeriodStart: dataObj.current_period_start
          ? new Date(dataObj.current_period_start * 1000).toISOString()
          : new Date().toISOString(),
        currentPeriodEnd: dataObj.current_period_end
          ? new Date(dataObj.current_period_end * 1000).toISOString()
          : new Date(Date.now() + 30 * 86400000).toISOString(),
        cancelAtPeriodEnd: dataObj.cancel_at_period_end || false,
        data: dataObj,
        created: parsed.created || Math.floor(Date.now() / 1000),
      };

      return { isValid: true, event };
    } catch (parseErr: unknown) {
      const errMsg = parseErr instanceof Error ? parseErr.message : String(parseErr);
      return {
        isValid: false,
        error: `Failed to parse verified webhook payload JSON: ${errMsg}`,
      };
    }
  }

  async cancelSubscription(
    providerSubscriptionId: string,
    cancelAtPeriodEnd: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const endpoint = `https://api.stripe.com/v1/subscriptions/${providerSubscriptionId}`;
      const bodyParams = cancelAtPeriodEnd
        ? new URLSearchParams({ cancel_at_period_end: 'true' })
        : new URLSearchParams();

      const method = cancelAtPeriodEnd ? 'POST' : 'DELETE';
      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: cancelAtPeriodEnd ? bodyParams.toString() : undefined,
      });

      if (!response.ok) {
        const err = await response.json();
        return { success: false, error: err?.error?.message || response.statusText };
      }

      return { success: true };
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      return { success: false, error: errMsg || 'Failed to contact Stripe cancellation endpoint' };
    }
  }

  async reactivateSubscription(
    providerSubscriptionId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const endpoint = `https://api.stripe.com/v1/subscriptions/${providerSubscriptionId}`;
      const bodyParams = new URLSearchParams({ cancel_at_period_end: 'false' });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParams.toString(),
      });

      if (!response.ok) {
        const err = await response.json();
        return { success: false, error: err?.error?.message || response.statusText };
      }

      return { success: true };
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      return { success: false, error: errMsg || 'Failed to contact Stripe reactivation endpoint' };
    }
  }

  async createCustomerPortalSession(params: {
    businessId: string;
    providerCustomerId: string;
    returnUrl: string;
  }): Promise<{ portalUrl: string; provider: string }> {
    const bodyParams = new URLSearchParams({
      customer: params.providerCustomerId,
      return_url: params.returnUrl,
    });

    const response = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
    });

    const session = await response.json();

    if (!response.ok) {
      throw new Error(`Stripe Portal Error: ${session?.error?.message || response.statusText}`);
    }

    return {
      portalUrl: session.url,
      provider: this.name,
    };
  }
}
