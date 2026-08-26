export type PlanKey = 'Starter' | 'Professional' | 'Enterprise';
export type BillingInterval = 'monthly' | 'annual';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'cancelled' | 'canceled' | 'incomplete' | 'paused';

export type UsageMetric = 
  | 'ai_receptionist_chats'
  | 'sms_messages'
  | 'email_messages'
  | 'whatsapp_messages'
  | 'jobs_created'
  | 'estimates_created'
  | 'review_requests_sent'
  | 'team_members_count';

export interface PlanLimits {
  maxInvoicesPerMonth: number;
  maxRemindersPerMonth: number;
  maxLeads: number;
  maxJobsPerMonth: number;
  maxEstimatesPerMonth: number;
  maxAiChatsPerMonth: number;
  maxSmsPerMonth: number;
  maxEmailPerMonth: number;
  maxWhatsappPerMonth: number;
  maxReviewsPerMonth: number;
  maxTeamSeats: number;
  aiCopilot: boolean;
  aiReceptionist: boolean;
  multiUser: boolean;
  customSms: boolean;
  customWhatsapp: boolean;
  reputationManagement: boolean;
  advancedReports: boolean;
  apiAccess: boolean;
}

export interface PlanConfig {
  key: PlanKey;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnual: number;
  popular?: boolean;
  features: string[];
  limits: PlanLimits;
}

export const PLANS_CONFIG: Record<PlanKey, PlanConfig> = {
  Starter: {
    key: 'Starter',
    name: 'Starter Plan',
    tagline: 'Essential dispatch, invoices, and CRM for solo trades.',
    priceMonthly: 19,
    priceAnnual: 190, // $190/yr (~2 months free)
    features: [
      'Up to 50 active invoices/month',
      '100 CRM Leads & Contacts',
      '25 Work Orders / month',
      'Basic Estimates & Itemized Billing',
      '50 AI Receptionist Chats/month',
      '100 Email & SMS Reminders',
      '25 Review Requests & Feedback Surveys',
      '1 Team User Seat',
      'Halal-First Non-Compounding Ledger',
    ],
    limits: {
      maxInvoicesPerMonth: 50,
      maxRemindersPerMonth: 200,
      maxLeads: 100,
      maxJobsPerMonth: 25,
      maxEstimatesPerMonth: 25,
      maxAiChatsPerMonth: 50,
      maxSmsPerMonth: 100,
      maxEmailPerMonth: 200,
      maxWhatsappPerMonth: 0,
      maxReviewsPerMonth: 25,
      maxTeamSeats: 1,
      aiCopilot: true,
      aiReceptionist: true,
      multiUser: false,
      customSms: false,
      customWhatsapp: false,
      reputationManagement: true,
      advancedReports: false,
      apiAccess: false,
    },
  },
  Professional: {
    key: 'Professional',
    name: 'Professional Plan',
    tagline: 'Autonomous AI triage, multi-crew dispatch, and field reputation for growing contractors.',
    priceMonthly: 49,
    priceAnnual: 490, // $490/yr
    popular: true,
    features: [
      'Unlimited Invoices & Payment Reminders',
      '1,000 Active CRM Leads & Pipeline Deals',
      '500 Work Orders & Technician Dispatching',
      'Estimates & 1-Click Invoice Conversion',
      '500 AI Receptionist Calls & Emergency Triage',
      '1,000 Multi-Channel SMS & WhatsApp Messages',
      '250 Automated Google Review Requests',
      'Up to 5 Technician / Dispatcher Seats',
      'Advanced Operations Analytics & Reports',
    ],
    limits: {
      maxInvoicesPerMonth: 10000,
      maxRemindersPerMonth: 5000,
      maxLeads: 1000,
      maxJobsPerMonth: 500,
      maxEstimatesPerMonth: 500,
      maxAiChatsPerMonth: 500,
      maxSmsPerMonth: 1000,
      maxEmailPerMonth: 5000,
      maxWhatsappPerMonth: 500,
      maxReviewsPerMonth: 250,
      maxTeamSeats: 5,
      aiCopilot: true,
      aiReceptionist: true,
      multiUser: true,
      customSms: true,
      customWhatsapp: true,
      reputationManagement: true,
      advancedReports: true,
      apiAccess: false,
    },
  },
  Enterprise: {
    key: 'Enterprise',
    name: 'Enterprise / Commercial Plan',
    tagline: 'High-volume commercial fleet management, unlimited AI triage, and bespoke integrations.',
    priceMonthly: 199,
    priceAnnual: 1990,
    features: [
      'Unlimited Invoices, Jobs, Estimates & CRM',
      'Unlimited AI Receptionist Chats & Booking',
      '5,000 SMS & WhatsApp Dispatches / month',
      'Unlimited Reputation Management & Surveys',
      'Unlimited Team Members & Multi-Branch Dispatch',
      'Custom ERP Webhooks & Full API Access',
      'Dedicated Account Manager & 99.9% Uptime SLA',
      'Priority 24/7 Phone Support',
    ],
    limits: {
      maxInvoicesPerMonth: 1000000,
      maxRemindersPerMonth: 1000000,
      maxLeads: 1000000,
      maxJobsPerMonth: 1000000,
      maxEstimatesPerMonth: 1000000,
      maxAiChatsPerMonth: 5000,
      maxSmsPerMonth: 5000,
      maxEmailPerMonth: 50000,
      maxWhatsappPerMonth: 5000,
      maxReviewsPerMonth: 1000000,
      maxTeamSeats: 100,
      aiCopilot: true,
      aiReceptionist: true,
      multiUser: true,
      customSms: true,
      customWhatsapp: true,
      reputationManagement: true,
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

export interface CustomerPortalParams {
  businessId: string;
  providerCustomerId: string;
  returnUrl: string;
}

export interface CustomerPortalResult {
  portalUrl: string;
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
  createCustomerPortalSession?(params: CustomerPortalParams): Promise<CustomerPortalResult>;
  verifyWebhookSignature(payload: string, signature: string, secret?: string): Promise<{ isValid: boolean; event?: WebhookEvent; error?: string }>;
  cancelSubscription(providerSubscriptionId: string, cancelAtPeriodEnd: boolean): Promise<{ success: boolean; error?: string }>;
  reactivateSubscription?(providerSubscriptionId: string): Promise<{ success: boolean; error?: string }>;
}
