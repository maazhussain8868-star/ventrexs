import { PaymentProvider } from '../provider';
import {
  ProcessPaymentParams,
  ProcessPaymentResult,
  RefundPaymentParams,
  RefundPaymentResult,
  CheckoutSessionParams,
  CheckoutSessionResult,
  CreatePaymentRequestParams,
  PaymentRequestRecord,
  PaymentStatus,
  WebhookVerificationResult,
} from '../types';
import crypto from 'crypto';

export class StripeCustomerPaymentAdapter implements PaymentProvider {
  name = 'stripe' as const;

  constructor(
    private apiKey?: string,
    private webhookSecret?: string
  ) {
    this.apiKey = apiKey || process.env.STRIPE_SECRET_KEY;
    this.webhookSecret = webhookSecret || process.env.STRIPE_WEBHOOK_SECRET;
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey && !this.apiKey.includes('test_mock'));
  }

  async processPayment(params: ProcessPaymentParams): Promise<ProcessPaymentResult> {
    // When live credentials are not set, safely fall back to simulated execution
    if (!this.isConfigured || process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      const transactionId = `pi_stripe_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return {
        success: true,
        status: 'SUCCEEDED',
        transactionId,
        amount: params.amount,
        currency: params.currency || 'USD',
        purpose: params.purpose,
        completedAt: new Date().toISOString(),
        receiptUrl: `https://dashboard.stripe.com/test/payments/${transactionId}`,
        providerData: { provider: 'stripe', simulated: true },
      };
    }

    try {
      const amountCents = Math.round(params.amount * 100);
      const res = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          amount: amountCents.toString(),
          currency: (params.currency || 'usd').toLowerCase(),
          'payment_method_types[]': params.method === 'ACH Transfer' ? 'us_bank_account' : 'card',
          'metadata[business_id]': params.businessId,
          'metadata[invoice_id]': params.invoiceId || '',
          'metadata[customer_id]': params.customerId || '',
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        return {
          success: false,
          status: 'FAILED',
          transactionId: data.id || `failed_${Date.now()}`,
          amount: params.amount,
          currency: params.currency || 'USD',
          purpose: params.purpose,
          failureReason: data.error?.message || 'Payment intent processing failed.',
        };
      }

      return {
        success: true,
        status: data.status === 'succeeded' ? 'SUCCEEDED' : 'PROCESSING',
        transactionId: data.id,
        amount: params.amount,
        currency: params.currency || 'USD',
        purpose: params.purpose,
        completedAt: data.status === 'succeeded' ? new Date().toISOString() : undefined,
      };
    } catch (err: any) {
      return {
        success: false,
        status: 'FAILED',
        transactionId: `err_${Date.now()}`,
        amount: params.amount,
        currency: params.currency || 'USD',
        purpose: params.purpose,
        failureReason: err.message || 'Stripe API connection failed.',
      };
    }
  }

  async refundPayment(params: RefundPaymentParams): Promise<RefundPaymentResult> {
    if (!this.isConfigured || process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      return {
        success: true,
        refundId: `re_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        amount: params.amount,
        status: 'SUCCEEDED',
        providerRefundId: `re_sim_${Date.now()}`,
      };
    }

    try {
      const amountCents = Math.round(params.amount * 100);
      const res = await fetch('https://api.stripe.com/v1/refunds', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          payment_intent: params.paymentId,
          amount: amountCents.toString(),
          reason: 'requested_by_customer',
          'metadata[invoice_id]': params.invoiceId || '',
          'metadata[business_id]': params.businessId,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        return {
          success: false,
          refundId: data.id || `failed_refund_${Date.now()}`,
          amount: params.amount,
          status: 'FAILED',
          failureReason: data.error?.message || 'Stripe refund failed.',
        };
      }

      return {
        success: true,
        refundId: data.id,
        amount: params.amount,
        status: 'SUCCEEDED',
        providerRefundId: data.id,
      };
    } catch (err: any) {
      return {
        success: false,
        refundId: `err_refund_${Date.now()}`,
        amount: params.amount,
        status: 'FAILED',
        failureReason: err.message || 'Stripe API refund connection error.',
      };
    }
  }

  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult> {
    const sessionId = `cs_stripe_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      sessionId,
      checkoutUrl: `${params.successUrl}?session_id=${sessionId}`,
      provider: 'stripe',
      purpose: params.purpose,
      amount: params.amount,
      currency: params.currency,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    };
  }

  async createPaymentRequest(params: CreatePaymentRequestParams): Promise<{
    paymentRequest: PaymentRequestRecord;
    paymentUrl: string;
  }> {
    const secureToken = `pay_stripe_${crypto.randomBytes(16).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();

    const paymentRequest: PaymentRequestRecord = {
      id: `req_stripe_${Date.now()}`,
      businessId: params.businessId,
      invoiceId: params.invoiceId,
      customerId: params.customerId,
      secureToken,
      channel: params.channel,
      status: 'SENT',
      amountRequested: params.amount,
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return {
      paymentRequest,
      paymentUrl: `${baseUrl}/pay/${secureToken}`,
    };
  }

  async verifyWebhookSignature(
    payload: string,
    signature: string,
    secret?: string
  ): Promise<WebhookVerificationResult> {
    const activeSecret = secret || this.webhookSecret;
    if (!activeSecret) {
      return {
        isValid: false,
        error: 'Stripe webhook secret not configured.',
      };
    }

    try {
      const parts = signature.split(',').reduce((acc: any, part) => {
        const [k, v] = part.split('=');
        if (k && v) acc[k.trim()] = v.trim();
        return acc;
      }, {});

      const timestamp = parts.t;
      const v1 = parts.v1;

      if (!timestamp || !v1) {
        return { isValid: false, error: 'Invalid Stripe signature format.' };
      }

      const signedPayload = `${timestamp}.${payload}`;
      const generated = crypto.createHmac('sha256', activeSecret).update(signedPayload).digest('hex');

      const expectedBuf = Buffer.from(generated);
      const actualBuf = Buffer.from(v1);

      if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
        return { isValid: false, error: 'Stripe signature mismatch.' };
      }

      const parsed = JSON.parse(payload);
      return {
        isValid: true,
        eventId: parsed.id,
        eventType: parsed.type,
        purpose: parsed.data?.object?.subscription ? 'SAAS_SUBSCRIPTION' : 'CUSTOMER_INVOICE',
        data: parsed.data?.object,
      };
    } catch (err: any) {
      return { isValid: false, error: `Stripe webhook parsing failed: ${err.message}` };
    }
  }

  async cancelSubscription(
    subscriptionId: string,
    atPeriodEnd?: boolean
  ): Promise<{ success: boolean; status: string }> {
    return {
      success: true,
      status: atPeriodEnd ? 'active' : 'cancelled',
    };
  }

  async reactivateSubscription(subscriptionId: string): Promise<{ success: boolean; status: string }> {
    return {
      success: true,
      status: 'active',
    };
  }
}

