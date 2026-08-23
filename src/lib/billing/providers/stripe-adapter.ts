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
      'line_items[0][price_data][product_data][name]': `PayPilot AI ${params.plan} Plan (${params.interval})`,
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

  async verifyWebhookSignature(
    payload: string,
    signature: string,
    secret?: string
  ): Promise<{ isValid: boolean; event?: WebhookEvent; error?: string }> {
    const whSecret = secret || this.webhookSecret;
    if (!whSecret) {
      return { isValid: false, error: 'Stripe webhook signing secret is not configured.' };
    }

    try {
      // Parse payload
      const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
      const dataObj = parsed?.data?.object || {};
      const metadata = dataObj?.metadata || {};

      const event: WebhookEvent = {
        id: parsed.id,
        provider: this.name,
        type: parsed.type,
        businessId: metadata.business_id || dataObj.client_reference_id,
        plan: metadata.plan,
        interval: metadata.interval,
        providerCustomerId: dataObj.customer,
        providerSubscriptionId: dataObj.subscription || dataObj.id,
        status: dataObj.status === 'active' ? 'active' : dataObj.status === 'past_due' ? 'past_due' : 'active',
        currentPeriodStart: dataObj.current_period_start ? new Date(dataObj.current_period_start * 1000).toISOString() : new Date().toISOString(),
        currentPeriodEnd: dataObj.current_period_end ? new Date(dataObj.current_period_end * 1000).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString(),
        cancelAtPeriodEnd: dataObj.cancel_at_period_end || false,
        data: dataObj,
        created: parsed.created || Math.floor(Date.now() / 1000),
      };

      return { isValid: true, event };
    } catch (e: any) {
      return { isValid: false, error: e.message || 'Failed to parse Stripe webhook payload' };
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
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to contact Stripe cancellation endpoint' };
    }
  }
}
