/**
 * VENTREXS AI — RAZORPAY BILLING PROVIDER ADAPTER
 * Handles SaaS subscription checkout sessions via Razorpay Orders API.
 * All API calls are server-side only. RAZORPAY_KEY_SECRET never reaches the browser.
 *
 * Flow:
 * 1. createCheckoutSession() → calls Razorpay /v1/orders → returns orderId + client metadata
 * 2. Client uses Razorpay.js (only needs key_id, NOT secret) to open payment modal
 * 3. On payment success, Razorpay redirects to successUrl with payment_id, order_id, signature
 * 4. /api/billing/verify validates the signature server-side
 * 5. Webhook at /api/webhooks/razorpay confirms and activates subscription
 */

import crypto from 'crypto';
import {
  CheckoutSessionParams,
  CheckoutSessionResult,
  PaymentProvider,
  WebhookEvent,
  PLANS_CONFIG,
  AGENCY_PLANS_CONFIG,
  PlanKey,
  AgencyPlanKey,
} from '../types';

export class RazorpayBillingProviderAdapter implements PaymentProvider {
  name = 'Razorpay Billing Adapter';

  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;

  constructor(keyId?: string, keySecret?: string, webhookSecret?: string) {
    this.keyId = keyId || process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = keySecret || process.env.RAZORPAY_KEY_SECRET || '';
    this.webhookSecret = webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET || '';
  }

  get isConfigured(): boolean {
    return Boolean(this.keyId && this.keySecret);
  }

  /**
   * Creates a Razorpay Order for SaaS subscription payment.
   * Returns orderId + keyId so the client can open the Razorpay modal.
   * The successUrl is embedded in the notes for post-payment redirect.
   */
  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult> {
    if (!this.isConfigured) {
      throw new Error(
        'Razorpay credentials are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'
      );
    }

    const isAnnual = params.interval === 'annual';
    const planConfig =
      params.plan in PLANS_CONFIG
        ? PLANS_CONFIG[params.plan as PlanKey]
        : params.plan in AGENCY_PLANS_CONFIG
        ? AGENCY_PLANS_CONFIG[params.plan as AgencyPlanKey]
        : null;

    if (!planConfig) {
      throw new Error(`Invalid plan requested: ${params.plan}`);
    }

    const priceUSD = isAnnual ? planConfig.priceAnnual : planConfig.priceMonthly;
    // Razorpay accepts amount in smallest currency unit (paise for INR, cents for USD)
    // Using USD amounts * 100 cents
    const amountInCents = Math.round(priceUSD * 100);

    // Build Razorpay order via REST API
    const credentials = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const receiptId = `vnx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const orderPayload = {
      amount: amountInCents,
      currency: 'USD',
      receipt: receiptId,
      notes: {
        business_id: params.businessId || '',
        agency_id: params.agencyId || '',
        plan: params.plan,
        interval: params.interval,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        customer_email: params.customerEmail,
        platform: 'ventrexs_ai',
      },
    };

    let order: any;
    if (this.keyId === 'rzp_test_paypilot_local' || this.keyId.startsWith('rzp_test_mock')) {
      order = {
        id: `order_rzp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        amount: amountInCents,
        currency: 'USD',
        status: 'created',
      };
    } else {
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      order = await response.json();

      if (!response.ok) {
        throw new Error(
          `Razorpay Order Creation Error: ${order?.error?.description || order?.error?.reason || response.statusText}`
        );
      }
    }

    // The checkoutUrl encodes all params so the billing page can render the Razorpay modal
    // In the browser, the billing/success page reads these query params
    const checkoutUrl =
      `${params.successUrl.split('?')[0].replace('/billing/success', '/billing/checkout')}` +
      `?order_id=${order.id}` +
      `&key_id=${encodeURIComponent(this.keyId)}` +
      `&amount=${amountInCents}` +
      `&currency=USD` +
      `&plan=${params.plan}` +
      `&interval=${params.interval}` +
      `&email=${encodeURIComponent(params.customerEmail)}` +
      `&name=${encodeURIComponent(params.customerName || '')}` +
      `&business_id=${encodeURIComponent(params.businessId || '')}` +
      `&success_url=${encodeURIComponent(params.successUrl)}` +
      `&cancel_url=${encodeURIComponent(params.cancelUrl)}`;

    return {
      sessionId: order.id,
      checkoutUrl,
      provider: this.name,
    };
  }

  /**
   * Verifies Razorpay payment signature (HMAC-SHA256).
   * Called from /api/billing/verify after payment completion.
   * Expected: HMAC-SHA256(orderId + '|' + paymentId, keySecret) === signature
   */
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    if (!this.keySecret) return false;
    try {
      const generated = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');
      const expectedBuf = Buffer.from(generated);
      const actualBuf = Buffer.from(signature);
      if (expectedBuf.length !== actualBuf.length) return false;
      return crypto.timingSafeEqual(expectedBuf, actualBuf);
    } catch {
      return false;
    }
  }

  /**
   * Verifies Razorpay webhook signature.
   * Format: HMAC-SHA256(payload, webhookSecret) === x-razorpay-signature header
   */
  async verifyWebhookSignature(
    payload: string,
    signature: string,
    secret?: string
  ): Promise<{ isValid: boolean; event?: WebhookEvent; error?: string }> {
    const activeSecret = secret || this.webhookSecret;
    if (!activeSecret) {
      return { isValid: false, error: 'Razorpay webhook secret not configured.' };
    }

    try {
      const generated = crypto
        .createHmac('sha256', activeSecret)
        .update(payload)
        .digest('hex');

      const expectedBuf = Buffer.from(generated);
      const actualBuf = Buffer.from(signature);

      if (
        expectedBuf.length !== actualBuf.length ||
        !crypto.timingSafeEqual(expectedBuf, actualBuf)
      ) {
        return {
          isValid: false,
          error: 'Razorpay webhook signature mismatch: forged or tampered payload.',
        };
      }

      const parsed = JSON.parse(payload);
      const dataObj = parsed?.payload?.subscription?.entity ||
                      parsed?.payload?.payment?.entity ||
                      parsed?.payload?.order?.entity ||
                      {};
      const notes = dataObj?.notes || {};

      const event: WebhookEvent = {
        id: parsed.event_id || parsed.id || `evt_rzp_${Date.now()}`,
        provider: this.name,
        type: parsed.event || 'payment.captured',
        businessId: notes.business_id || notes.businessId,
        agencyId: notes.agency_id || notes.agencyId,
        plan: (notes.plan as PlanKey) || undefined,
        interval: notes.interval as any,
        providerCustomerId: dataObj.customer_id || undefined,
        providerSubscriptionId: dataObj.subscription_id || dataObj.id || undefined,
        status: parsed.event === 'subscription.cancelled' ? 'cancelled' :
                parsed.event === 'payment.failed' ? 'past_due' : 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
        cancelAtPeriodEnd: false,
        data: dataObj,
        created: parsed.created_at || Math.floor(Date.now() / 1000),
      };

      return { isValid: true, event };
    } catch (err: any) {
      return {
        isValid: false,
        error: `Webhook payload parsing failed: ${err.message}`,
      };
    }
  }

  async cancelSubscription(
    providerSubscriptionId: string,
    cancelAtPeriodEnd: boolean
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured) {
      return { success: false, error: 'Razorpay not configured for cancellation.' };
    }

    try {
      const credentials = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
      const body = JSON.stringify({ cancel_at_cycle_end: cancelAtPeriodEnd ? 1 : 0 });

      const response = await fetch(
        `https://api.razorpay.com/v1/subscriptions/${providerSubscriptionId}/cancel`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/json',
          },
          body,
        }
      );

      if (!response.ok) {
        const err = await response.json();
        return {
          success: false,
          error: err?.error?.description || response.statusText,
        };
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to cancel Razorpay subscription.' };
    }
  }

  async reactivateSubscription(
    providerSubscriptionId: string
  ): Promise<{ success: boolean; error?: string }> {
    // Razorpay does not support direct reactivation via API; user must re-subscribe
    return {
      success: false,
      error: 'Razorpay subscriptions cannot be reactivated directly. Please create a new subscription.',
    };
  }
}
