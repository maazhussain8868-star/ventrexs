/**
 * VENTREXS AI — PHASE 14: PAYMENT PROVIDER INTEGRATION & REVENUE OPERATIONS
 * Comprehensive Type Definitions & Domain Models
 */

export type PaymentPurpose = 'SAAS_SUBSCRIPTION' | 'CUSTOMER_INVOICE' | 'DEMO';

export type PaymentProviderName = 'razorpay' | 'stripe' | 'skydo' | 'india_upi' | 'google_play' | 'manual' | 'demo' | 'ach';

export type BillingSource = 'GOOGLE_PLAY' | 'RAZORPAY' | 'STRIPE' | 'ALTERNATIVE_BILLING' | 'MANUAL' | 'DEMO';

export type { PaymentProvider } from './provider';

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type SubscriptionLifecycleState =
  | 'TRIAL'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'SUSPENDED';

export type PaymentMethodType =
  | 'Credit Card'
  | 'Debit Card'
  | 'UPI'
  | 'Netbanking'
  | 'ACH Transfer'
  | 'Bank Wire'
  | 'Check'
  | 'Cash'
  | 'Other';

export interface CurrencyAmount {
  /** Amount in integer cents/paise (e.g. $10.00 = 1000, ₹10.00 = 1000) */
  integerUnits: number;
  /** Decimal formatted amount (e.g. 10.00) */
  decimalAmount: number;
  currency: string;
}

export interface ProcessPaymentParams {
  businessId: string;
  invoiceId?: string;
  subscriptionId?: string;
  customerId?: string;
  amount: number;
  currency?: string;
  method: PaymentMethodType;
  purpose?: PaymentPurpose;
  reference?: string;
  paymentToken?: string;
  idempotencyKey?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface ProcessPaymentResult {
  success: boolean;
  status: PaymentStatus;
  transactionId: string;
  amount: number;
  currency: string;
  purpose?: PaymentPurpose;
  completedAt?: string;
  failureReason?: string;
  receiptUrl?: string;
  providerData?: Record<string, any>;
}

export interface CheckoutSessionParams {
  businessId: string;
  purpose: PaymentPurpose;
  planId?: string;
  planName?: string;
  invoiceId?: string;
  amount: number;
  currency: string;
  interval?: 'monthly' | 'annual';
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  successUrl: string;
  cancelUrl: string;
  idempotencyKey?: string;
  metadata?: Record<string, any>;
}

export interface CheckoutSessionResult {
  sessionId: string;
  checkoutUrl: string;
  provider: PaymentProviderName;
  purpose: PaymentPurpose;
  amount: number;
  currency: string;
  expiresAt: string;
  clientSecret?: string;
}

export interface CreatePaymentRequestParams {
  businessId: string;
  invoiceId: string;
  customerId?: string;
  amount: number;
  currency?: string;
  channel: 'email' | 'sms' | 'whatsapp' | 'direct_link';
  customMessage?: string;
}

export interface RefundPaymentParams {
  businessId: string;
  paymentId: string;
  invoiceId?: string;
  subscriptionId?: string;
  amount: number;
  reason: string;
  idempotencyKey?: string;
}

export interface RefundPaymentResult {
  success: boolean;
  refundId: string;
  amount: number;
  status: 'SUCCEEDED' | 'FAILED' | 'PENDING';
  failureReason?: string;
  providerRefundId?: string;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  eventId?: string;
  eventType?: string;
  purpose?: PaymentPurpose;
  data?: Record<string, any>;
  error?: string;
}

export interface PaymentTransactionRecord {
  id: string;
  tenantId: string;
  businessId?: string;
  agencyId?: string;
  purpose: PaymentPurpose;
  provider: PaymentProviderName | string;
  providerPaymentId?: string;
  providerCustomerId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  invoiceId?: string;
  subscriptionId?: string;
  idempotencyKey?: string;
  refundedAmount?: number;
  createdAt: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
}

export interface PaymentRecord {
  id: string;
  businessId: string;
  invoiceId: string;
  customerId?: string;
  customerName?: string;
  invoiceNumber?: string;
  amount: number;
  currency: string;
  method: PaymentMethodType;
  status: PaymentStatus;
  provider: PaymentProviderName | string;
  providerTransactionId?: string;
  reference?: string;
  paymentDate: string;
  completedAt?: string;
  failureReason?: string;
  refundedAmount: number;
  notes?: string;
  secureToken?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface RefundRecord {
  id: string;
  businessId: string;
  paymentId: string;
  invoiceId?: string;
  subscriptionId?: string;
  amount: number;
  reason: string;
  status: 'SUCCEEDED' | 'FAILED' | 'PENDING';
  providerRefundId?: string;
  createdAt: string;
}

export interface PaymentRequestRecord {
  id: string;
  businessId: string;
  invoiceId: string;
  customerId?: string;
  secureToken: string;
  channel: 'email' | 'sms' | 'whatsapp' | 'direct_link';
  status: 'PENDING' | 'SENT' | 'OPENED' | 'COMPLETED' | 'EXPIRED';
  amountRequested: number;
  expiresAt: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface PublicInvoicePaymentView {
  secureToken: string;
  invoiceId: string;
  invoiceNumber: string;
  businessName: string;
  businessEmail?: string;
  businessPhone?: string;
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
  items: { description: string; quantity: number; unitPrice: number; total: number }[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  remainingBalance: number;
  dueDate: string;
  status: string;
  isExpired: boolean;
}

export interface RevenueSummary {
  totalCollected: number;
  pendingAmount: number;
  failedAmount: number;
  refundedAmount: number;
  outstandingReceivables: number;
  collectionsToday: number;
  collectionsThisMonth: number;
  collectionRatePercent: number;
  totalPaymentsCount: number;
}

export interface ReconciliationReport {
  id: string;
  provider: PaymentProviderName;
  periodStart: string;
  periodEnd: string;
  totalTransactionsCount: number;
  totalAmountCollected: number;
  totalAmountRefunded: number;
  matchedCount: number;
  discrepancyCount: number;
  discrepancies: {
    transactionId: string;
    expectedAmount: number;
    actualAmount: number;
    reason: string;
  }[];
  generatedAt: string;
}
