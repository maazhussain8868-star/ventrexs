export type PlanKey = 'Starter' | 'Professional' | 'Enterprise';
export type BillingInterval = 'monthly' | 'annual';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'cancelled' | 'canceled' | 'incomplete' | 'paused';

export interface PlanLimits {
  maxInvoicesPerMonth: number;
  maxRemindersPerMonth: number;
  aiCopilot: boolean;
  multiUser: boolean;
  customSms: boolean;
  customWhatsapp: boolean;
  advancedReports: boolean;
  apiAccess: boolean;
}

export interface PlanConfig {
  key: PlanKey;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  features: string[];
  limits: PlanLimits;
}

export const PLANS_CONFIG: Record<PlanKey, PlanConfig> = {
  Starter: {
    key: 'Starter',
    name: 'Starter Plan',
    priceMonthly: 19,
    priceAnnual: 190, // $190/yr (~2 months free)
    features: [
      'Up to 50 active invoices/month',
      'Truthful AI Follow-up Drafts',
      'Automated Email Reminders',
      'Halal-First Balance Enforcement',
      'Basic Accounting Reports',
    ],
    limits: {
      maxInvoicesPerMonth: 50,
      maxRemindersPerMonth: 200,
      aiCopilot: true,
      multiUser: false,
      customSms: false,
      customWhatsapp: false,
      advancedReports: false,
      apiAccess: false,
    },
  },
  Professional: {
    key: 'Professional',
    name: 'Professional Plan',
    priceMonthly: 49,
    priceAnnual: 490, // $490/yr
    features: [
      'Unlimited active invoices',
      'Real-time AI Collection Copilot',
      'Multi-channel: Email, SMS & WhatsApp',
      'Up to 5 Team Member Seats',
      'Audit Trail & Compliance Export',
      'Custom Branding on Invoices',
    ],
    limits: {
      maxInvoicesPerMonth: 10000,
      maxRemindersPerMonth: 5000,
      aiCopilot: true,
      multiUser: true,
      customSms: true,
      customWhatsapp: true,
      advancedReports: true,
      apiAccess: false,
    },
  },
  Enterprise: {
    key: 'Enterprise',
    name: 'Enterprise Plan',
    priceMonthly: 199,
    priceAnnual: 1990,
    features: [
      'Unlimited everything',
      'Dedicated Account Manager',
      'Custom ERP & CRM Webhooks',
      'Full API Access',
      '99.9% Uptime SLA',
      'Custom Halal Compliance Audits',
    ],
    limits: {
      maxInvoicesPerMonth: 1000000,
      maxRemindersPerMonth: 1000000,
      aiCopilot: true,
      multiUser: true,
      customSms: true,
      customWhatsapp: true,
      advancedReports: true,
      apiAccess: true,
    },
  },
};

export interface CheckoutSessionParams {
  businessId: string;
  plan: PlanKey;
  interval: BillingInterval;
  customerEmail: string;
  customerName?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  checkoutUrl: string;
  provider: string;
}

export interface WebhookEvent {
  id: string;
  provider: string;
  type: string;
  businessId?: string;
  plan?: PlanKey;
  interval?: BillingInterval;
  status?: SubscriptionStatus;
  providerCustomerId?: string;
  providerSubscriptionId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  data: Record<string, any>;
  created: number;
}

export interface PaymentProvider {
  name: string;
  createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult>;
  verifyWebhookSignature(payload: string, signature: string, secret?: string): Promise<{ isValid: boolean; event?: WebhookEvent; error?: string }>;
  cancelSubscription(providerSubscriptionId: string, cancelAtPeriodEnd: boolean): Promise<{ success: boolean; error?: string }>;
}
