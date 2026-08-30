export type PlanKey = 'Starter' | 'Professional' | 'Enterprise';
export type AgencyPlanKey = 'AgencyStarter' | 'AgencyGrowth' | 'AgencyEnterprise';
export type AnyPlanKey = PlanKey | AgencyPlanKey;

export type BillingInterval = 'monthly' | 'annual';
export type SubscriptionStatus = 'pending' | 'checkout_started' | 'trialing' | 'active' | 'past_due' | 'cancelled' | 'canceled' | 'incomplete' | 'paused' | 'expired';

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
  maxClients?: number;
  customBranding?: boolean;
  whiteLabelSubdomain?: boolean;
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

export interface AgencyPlanConfig {
  key: AgencyPlanKey;
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
    priceMonthly: 29,
    priceAnnual: 290, // $290/yr (~2 months free)
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
    priceMonthly: 79,
    priceAnnual: 790, // $790/yr
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
    priceMonthly: 249,
    priceAnnual: 2490,
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

export const AGENCY_PLANS_CONFIG: Record<AgencyPlanKey, AgencyPlanConfig> = {
  AgencyStarter: {
    key: 'AgencyStarter',
    name: 'Agency Starter',
    tagline: 'White-label SaaS command center for boutique trade marketing agencies.',
    priceMonthly: 299,
    priceAnnual: 2990, // $2,990/yr (~2 months free)
    features: [
      'Up to 10 Managed Contractor Client Sub-Accounts',
      'Custom Agency Subdomain (youragency.ventrexs.com)',
      'Custom Logo & Theme Accent Branding',
      'Unified Agency Client Health & Activity Feed',
      'Centralized Subscription Billing & Provisioning',
      'Standard AI Receptionist Triage Across Accounts',
      'Standard Email & SMS Dispatching',
    ],
    limits: {
      maxClients: 10,
      maxInvoicesPerMonth: 100000,
      maxRemindersPerMonth: 50000,
      maxLeads: 10000,
      maxJobsPerMonth: 5000,
      maxEstimatesPerMonth: 5000,
      maxAiChatsPerMonth: 2500,
      maxSmsPerMonth: 5000,
      maxEmailPerMonth: 25000,
      maxWhatsappPerMonth: 2500,
      maxReviewsPerMonth: 1000,
      maxTeamSeats: 5,
      aiCopilot: true,
      aiReceptionist: true,
      multiUser: true,
      customSms: true,
      customWhatsapp: true,
      reputationManagement: true,
      advancedReports: true,
      apiAccess: false,
      customBranding: true,
      whiteLabelSubdomain: true,
    },
  },
  AgencyGrowth: {
    key: 'AgencyGrowth',
    name: 'Agency Growth',
    tagline: 'Complete white-label reseller engine with custom domains & automated provisioning.',
    priceMonthly: 699,
    priceAnnual: 6990,
    popular: true,
    features: [
      'Up to 35 Managed Contractor Client Sub-Accounts',
      'Custom CNAME Domain (app.youragency.com)',
      'Full White-Label Removal of Ventrexs Badging',
      'Automated 1-Click Client Workspace Deployment',
      'Dedicated High-Throughput AI Receptionist Nodes',
      '15,000 SMS & WhatsApp Dispatches / month',
      'Role-Based Agency Team Member Access (15 Seats)',
      'Agency Revenue Analytics & Client Churn Predictor',
    ],
    limits: {
      maxClients: 35,
      maxInvoicesPerMonth: 500000,
      maxRemindersPerMonth: 250000,
      maxLeads: 50000,
      maxJobsPerMonth: 25000,
      maxEstimatesPerMonth: 25000,
      maxAiChatsPerMonth: 10000,
      maxSmsPerMonth: 15000,
      maxEmailPerMonth: 100000,
      maxWhatsappPerMonth: 10000,
      maxReviewsPerMonth: 5000,
      maxTeamSeats: 15,
      aiCopilot: true,
      aiReceptionist: true,
      multiUser: true,
      customSms: true,
      customWhatsapp: true,
      reputationManagement: true,
      advancedReports: true,
      apiAccess: true,
      customBranding: true,
      whiteLabelSubdomain: true,
    },
  },
  AgencyEnterprise: {
    key: 'AgencyEnterprise',
    name: 'Agency Enterprise',
    tagline: 'Unlimited reseller fleet scale, bespoke webhooks, and enterprise SLA.',
    priceMonthly: 1499,
    priceAnnual: 14990,
    features: [
      'Unlimited Contractor Client Sub-Accounts',
      'Multi-Brand Sub-Agencies & Regional Franchises',
      'Custom Edge SSL & Bespoke CNAME Routing',
      'Dedicated AI Model Fine-Tuning & Custom Voice Prompts',
      'Unlimited SMS, WhatsApp & Email Dispatches',
      'Unlimited Agency Team Seats & Granular Permissions',
      'Custom Webhooks & Bidirectional CRM Sync',
      '24/7 Dedicated Technical Account Manager',
    ],
    limits: {
      maxClients: 1000000,
      maxInvoicesPerMonth: 10000000,
      maxRemindersPerMonth: 5000000,
      maxLeads: 1000000,
      maxJobsPerMonth: 500000,
      maxEstimatesPerMonth: 500000,
      maxAiChatsPerMonth: 100000,
      maxSmsPerMonth: 100000,
      maxEmailPerMonth: 1000000,
      maxWhatsappPerMonth: 100000,
      maxReviewsPerMonth: 50000,
      maxTeamSeats: 1000,
      aiCopilot: true,
      aiReceptionist: true,
      multiUser: true,
      customSms: true,
      customWhatsapp: true,
      reputationManagement: true,
      advancedReports: true,
      apiAccess: true,
      customBranding: true,
      whiteLabelSubdomain: true,
    },
  },
};

export interface CheckoutSessionParams {
  businessId?: string;
  agencyId?: string;
  plan: AnyPlanKey;
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
  businessId?: string;
  agencyId?: string;
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
  agencyId?: string;
  plan?: AnyPlanKey;
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
