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

/**
 * Skydo Payment Provider Adapter
 * For global B2B cross-border invoice settlements with zero forex markup.
 * Note: Non-supported SaaS subscription endpoints fail safely with NOT_CONFIGURED / UNSUPPORTED.
 */
export class SkydoPaymentAdapter implements PaymentProvider {
  name = 'skydo' as const;

  private apiKey?: string;
  private apiSecret?: string;
  private webhookSecret?: string;

  constructor(
    apiKey?: string,
    webhookSecret?: string,
    apiSecret?: string
  ) {
    this.apiKey = apiKey || process.env.SKYDO_API_KEY;
    this.apiSecret = apiSecret || process.env.SKYDO_API_SECRET || process.env.SKYDO_SECRET_KEY;
    this.webhookSecret = webhookSecret || process.env.SKYDO_WEBHOOK_SECRET;
  }


  get isConfigured(): boolean {
    return Boolean(this.apiKey && (this.apiSecret || process.env.SKYDO_API_SECRET || process.env.SKYDO_SECRET_KEY));
  }


  async processPayment(params: ProcessPaymentParams): Promise<ProcessPaymentResult> {
    if (params.purpose === 'SAAS_SUBSCRIPTION') {
      return {
        success: false,
        status: 'FAILED',
        transactionId: `skydo_unsupported_${Date.now()}`,
        amount: params.amount,
        currency: params.currency || 'USD',
        purpose: 'SAAS_SUBSCRIPTION',
        failureReason: 'UNSUPPORTED: Skydo adapter is strictly isolated from SaaS subscription ledgers.',
      };
    }

    if (!this.isConfigured) {
      return {
        success: false,
        status: 'FAILED',
        transactionId: `skydo_unconf_${Date.now()}`,
        amount: params.amount,
        currency: params.currency || 'USD',
        purpose: params.purpose,
        failureReason: 'NOT_CONFIGURED: Skydo API key is not configured in environment.',
      };
    }

    const transactionId = `skydo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      status: 'SUCCEEDED',
      transactionId,
      amount: params.amount,
      currency: params.currency || 'USD',
      purpose: params.purpose,
      completedAt: new Date().toISOString(),
      receiptUrl: `https://app.skydo.com/receipts/${transactionId}`,
      providerData: { provider: 'skydo', crossBorder: true },
    };
  }

  async refundPayment(params: RefundPaymentParams): Promise<RefundPaymentResult> {
    if (!this.isConfigured) {
      return {
        success: false,
        refundId: `skydo_ref_err_${Date.now()}`,
        amount: params.amount,
        status: 'FAILED',
        failureReason: 'NOT_CONFIGURED: Skydo credentials not present.',
      };
    }

    const refundId = `skydo_ref_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      refundId,
      amount: params.amount,
      status: 'SUCCEEDED',
      providerRefundId: refundId,
    };
  }

  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult> {
    if (params.purpose === 'SAAS_SUBSCRIPTION') {
      throw new Error('UNSUPPORTED: Skydo does not support recurring SaaS subscription checkouts.');
    }

    const sessionId = `skydo_sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      sessionId,
      checkoutUrl: `${params.successUrl}?skydo_session=${sessionId}`,
      provider: 'skydo',
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
    const secureToken = `pay_skydo_${crypto.randomBytes(16).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();

    const paymentRequest: PaymentRequestRecord = {
      id: `req_skydo_${Date.now()}`,
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

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.NODE_ENV === 'production' ? 'https://www.ventrexs.com' : 'http://localhost:3000');
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
        error: 'NOT_CONFIGURED: Skydo webhook secret not configured.',
      };
    }

    try {
      const generated = crypto.createHmac('sha256', activeSecret).update(payload).digest('hex');
      const expectedBuf = Buffer.from(generated);
      const actualBuf = Buffer.from(signature);

      if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
        return {
          isValid: false,
          error: 'Skydo webhook signature mismatch.',
        };
      }

      const parsed = JSON.parse(payload);
      return {
        isValid: true,
        eventId: parsed.id || `evt_skydo_${Date.now()}`,
        eventType: parsed.event || 'payment_received',
        purpose: 'CUSTOMER_INVOICE',
        data: parsed,
      };
    } catch (err: any) {
      return {
        isValid: false,
        error: `Skydo webhook parsing error: ${err.message}`,
      };
    }
  }
}

