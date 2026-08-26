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

export class DemoPaymentAdapter implements PaymentProvider {
  name = 'demo' as const;

  async processPayment(params: ProcessPaymentParams): Promise<ProcessPaymentResult> {
    const transactionId = `txn_demo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    if (params.notes?.includes('SIMULATE_FAILURE') || params.reference === 'FAIL_TEST') {
      return {
        success: false,
        status: 'FAILED',
        transactionId,
        amount: params.amount,
        currency: params.currency || 'USD',
        purpose: params.purpose || 'DEMO',
        failureReason: 'Card was declined by issuing bank (Simulated Demo Failure).',
      };
    }

    return {
      success: true,
      status: 'SUCCEEDED',
      transactionId,
      amount: params.amount,
      currency: params.currency || 'USD',
      purpose: params.purpose || 'DEMO',
      completedAt: new Date().toISOString(),
      receiptUrl: `https://demo.ventrexs.com/receipts/${transactionId}`,
      providerData: { isDemo: true, simulation: 'sandbox_guaranteed' },
    };
  }

  async refundPayment(params: RefundPaymentParams): Promise<RefundPaymentResult> {
    const refundId = `ref_demo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    if (params.reason?.includes('SIMULATE_REFUND_FAILURE')) {
      return {
        success: false,
        refundId,
        amount: params.amount,
        status: 'FAILED',
        failureReason: 'Original charge cannot be refunded (Simulated Demo Failure).',
      };
    }

    return {
      success: true,
      refundId,
      amount: params.amount,
      status: 'SUCCEEDED',
      providerRefundId: `demo_pr_${refundId}`,
    };
  }

  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult> {
    const sessionId = `cs_demo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      sessionId,
      checkoutUrl: `${params.successUrl}?session_id=${sessionId}&demo=true`,
      provider: 'demo',
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
    const secureToken = `pay_demo_${Math.random().toString(36).substring(2, 10)}`;
    const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();

    const paymentRequest: PaymentRequestRecord = {
      id: `req_demo_${Date.now()}`,
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

    return {
      paymentRequest,
      paymentUrl: `https://demo.ventrexs.com/pay/${secureToken}`,
    };
  }

  async verifyPayment(
    paymentId: string,
    reference?: string
  ): Promise<{ verified: boolean; status: PaymentStatus; amount?: number; error?: string }> {
    return {
      verified: true,
      status: 'SUCCEEDED',
      amount: 100,
    };
  }

  async capturePayment(
    paymentId: string,
    amount: number
  ): Promise<{ success: boolean; status: PaymentStatus; transactionId: string }> {
    return {
      success: true,
      status: 'SUCCEEDED',
      transactionId: `cap_demo_${Date.now()}`,
    };
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    return 'SUCCEEDED';
  }

  async verifyWebhookSignature(
    payload: string,
    signature: string,
    secret?: string
  ): Promise<WebhookVerificationResult> {
    return {
      isValid: true,
      eventId: `evt_demo_${Date.now()}`,
      eventType: 'payment_succeeded',
      purpose: 'DEMO',
      data: { demo: true },
    };
  }

  async handleWebhook(
    payload: string,
    signature: string,
    secret?: string
  ): Promise<{ success: boolean; eventId?: string; error?: string }> {
    return {
      success: true,
      eventId: `evt_demo_${Date.now()}`,
    };
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

