import { CheckoutSessionParams, CheckoutSessionResult, PaymentProvider, WebhookEvent } from '../types';

export class DevPaymentProvider implements PaymentProvider {
  name = 'Development / Test Payment Provider';

  private createdSessions: Map<string, CheckoutSessionParams> = new Map();

  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult> {
    const sessionId = `cs_dev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    this.createdSessions.set(sessionId, params);

    // Mock checkout URL redirecting to success URL with mock session ID
    const checkoutUrl = `${params.successUrl}?session_id=${sessionId}&plan=${params.plan}&interval=${params.interval}`;

    return {
      sessionId,
      checkoutUrl,
      provider: this.name,
    };
  }

  async verifyWebhookSignature(
    payload: string,
    signature: string,
    secret?: string
  ): Promise<{ isValid: boolean; event?: WebhookEvent; error?: string }> {
    // If signature is missing or explicitly invalid, simulate rejection
    if (!signature || signature.trim() === '' || signature === 'invalid-sig' || signature === 'invalid') {
      return {
        isValid: false,
        error: 'Invalid webhook cryptographic signature',
      };
    }

    try {
      const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
      const event: WebhookEvent = {
        id: parsed.id || `evt_dev_${Date.now()}`,
        provider: this.name,
        type: parsed.type || 'checkout_completed',
        businessId: parsed.businessId || parsed.business_id,
        plan: parsed.plan,
        interval: parsed.interval,
        status: parsed.status || 'active',
        providerCustomerId: parsed.providerCustomerId || `cus_dev_${Date.now()}`,
        providerSubscriptionId: parsed.providerSubscriptionId || `sub_dev_${Date.now()}`,
        currentPeriodStart: parsed.currentPeriodStart || new Date().toISOString(),
        currentPeriodEnd: parsed.currentPeriodEnd || new Date(Date.now() + 30 * 86400000).toISOString(),
        cancelAtPeriodEnd: parsed.cancelAtPeriodEnd || false,
        data: parsed.data || parsed,
        created: parsed.created || Math.floor(Date.now() / 1000),
      };

      return {
        isValid: true,
        event,
      };
    } catch (err: any) {
      return {
        isValid: false,
        error: `Webhook JSON parsing failure: ${err.message}`,
      };
    }
  }

  async cancelSubscription(
    providerSubscriptionId: string,
    cancelAtPeriodEnd: boolean
  ): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }

  getSession(sessionId: string) {
    return this.createdSessions.get(sessionId) || null;
  }

  clearSessions() {
    this.createdSessions.clear();
  }
}

export const globalDevPaymentProvider = new DevPaymentProvider();
