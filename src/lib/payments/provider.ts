/**
 * VENTREXS AI — PHASE 14: PAYMENT PROVIDER INTEGRATION
 * Core PaymentProvider Interface & Base Contract
 */

import {
  PaymentProviderName,
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
} from './types';

export interface PaymentProvider {
  name: PaymentProviderName;

  /** Process direct customer or invoice payment */
  processPayment(params: ProcessPaymentParams): Promise<ProcessPaymentResult>;

  /** Execute a full or partial refund */
  refundPayment(params: RefundPaymentParams): Promise<RefundPaymentResult>;

  /** Create a hosted or embedded checkout session (e.g. SaaS subscription or invoice portal) */
  createCheckoutSession?(params: CheckoutSessionParams): Promise<CheckoutSessionResult>;

  /** Create an invoice payment request link with secure cryptographic token */
  createPaymentRequest?(params: CreatePaymentRequestParams): Promise<{
    paymentRequest: PaymentRequestRecord;
    paymentUrl: string;
  }>;

  /** Verify an existing payment or transaction directly with provider */
  verifyPayment?(
    paymentId: string,
    reference?: string
  ): Promise<{ verified: boolean; status: PaymentStatus; amount?: number; error?: string }>;

  /** Authorize and capture payment */
  capturePayment?(
    paymentId: string,
    amount: number
  ): Promise<{ success: boolean; status: PaymentStatus; transactionId: string }>;

  /** Retrieve live payment status */
  getPaymentStatus?(paymentId: string): Promise<PaymentStatus>;

  /** Verify cryptographic webhook signature */
  verifyWebhookSignature?(
    payload: string,
    signature: string,
    secret?: string
  ): Promise<WebhookVerificationResult>;

  /** Process incoming webhook payload */
  handleWebhook?(
    payload: string,
    signature: string,
    secret?: string
  ): Promise<{ success: boolean; eventId?: string; error?: string }>;

  /** Cancel an active SaaS subscription */
  cancelSubscription?(
    subscriptionId: string,
    atPeriodEnd?: boolean
  ): Promise<{ success: boolean; status: string }>;

  /** Reactivate a scheduled-to-cancel subscription */
  reactivateSubscription?(subscriptionId: string): Promise<{ success: boolean; status: string }>;

  /** Create self-serve customer billing portal session */
  createCustomerPortalSession?(params: {
    businessId: string;
    providerCustomerId: string;
    returnUrl: string;
  }): Promise<{ portalUrl: string }>;
}
