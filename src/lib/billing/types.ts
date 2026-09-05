export type PlanKey = 'Starter' | 'Professional' | 'Enterprise';
export type AgencyPlanKey = 'AgencyStarter' | 'AgencyGrowth' | 'AgencyEnterprise';
export type AnyPlanKey = PlanKey | AgencyPlanKey;

export type BillingInterval = 'monthly' | 'annual';
export type SubscriptionStatus = 'pending' | 'checkout_started' | 'trialing' | 'active' | 'past_due' | 'cancelled' | 'canceled' | 'incomplete' | 'paused' | 'expired';

export type UsageMetric = 
  | 'ai_receptionist_minutes'
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
  maxAiMinutesPerMonth?: number;
  maxAiChatsPerMonth: number; // Backwards-compatible alias to minutes
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
  crmType?: 'Basic leads/pipeline' | 'Full leads/pipeline' | 'Full with custom pipeline stages';
  followUpAutomation?: boolean | 'advanced';
  reputationMode?: 'disabled' | 'auto_request' | 'auto_request_ai_suggestions';
  whiteLabel?: boolean;
  supportTier?: 'Email only' | 'Email + chat' | 'Dedicated support';
  overageRatePerMinuteUsd?: number;
  maxClients?: number;
  customBranding?: boolean;
  whiteLabelSubdomain?: boolean;
}

export interface PlanPricingBreakdown {
  monthly: number;
  annualMonthlyEquivalent: number;
  annualTotal: number;
}

export interface PlanConfig {
  key: PlanKey;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnual: number;
  annualMonthlyEquivalent: number;
  annualDiscountPercent: number;
  overageRatePerMinuteUsd: number;
  pricing: {
    USD: PlanPricingBreakdown;
    INR: PlanPricingBreakdown;
  };
  popular?: boolean;
  features: string[];
  featureDetails: {
    aiReceptionistMinutes: number;
    outboundSms: number;
    whatsappMessages: number;
    emailInvoicesAlerts: number; // -1 for unlimited
    activeWorkOrders: number; // -1 for unlimited
    proposalsEstimates: number; // -1 for unlimited
    googleReviewRequests: number;
    teamUserSeats: number;
    crm: string;
    followUpAutomation: string;
    reputationManagement: string;
    whiteLabelAgency: string;
    apiAccess: string;
    support: string;
    overageRateForExtraAiMinutes: string;
  };
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
    name: 'Starter',
    tagline: 'Essential dispatch, invoices, and AI Receptionist for solo trades.',
    priceMonthly: 29,
    priceAnnual: 295.80, // $24.65/mo * 12 (15% discount)
    annualMonthlyEquivalent: 24.65,
    annualDiscountPercent: 15,
    overageRatePerMinuteUsd: 0.15,
    pricing: {
      USD: {
        monthly: 29,
        annualMonthlyEquivalent: 24.65,
        annualTotal: 295.80,
      },
      INR: {
        monthly: 2499,
        annualMonthlyEquivalent: 2124.15,
        annualTotal: 25489,
      },
    },
    features: [
      '60 AI Receptionist Minutes/month',
      '300 Outbound SMS Dispatches',
      '100 WhatsApp Messages',
      '1,000 Email Invoices & Alerts',
      '100 Active Work Orders (Jobs)',
      '100 Proposals & Estimates',
      '50 Google Review Requests',
      '1 Team User Seat',
      'Basic Leads & Pipeline CRM',
      'Email Only Support',
      'Dedicated US Telephony & Agent',
    ],
    featureDetails: {
      aiReceptionistMinutes: 60,
      outboundSms: 300,
      whatsappMessages: 100,
      emailInvoicesAlerts: 1000,
      activeWorkOrders: 100,
      proposalsEstimates: 100,
      googleReviewRequests: 50,
      teamUserSeats: 1,
      crm: 'Basic leads/pipeline',
      followUpAutomation: 'Disabled',
      reputationManagement: 'Disabled',
      whiteLabelAgency: 'Disabled',
      apiAccess: 'Disabled',
      support: 'Email only',
      overageRateForExtraAiMinutes: '$0.15/minute',
    },
    limits: {
      maxInvoicesPerMonth: 1000,
      maxRemindersPerMonth: 500,
      maxLeads: 200,
      maxJobsPerMonth: 100,
      maxEstimatesPerMonth: 100,
      maxAiMinutesPerMonth: 60,
      maxAiChatsPerMonth: 60,
      maxSmsPerMonth: 300,
      maxEmailPerMonth: 1000,
      maxWhatsappPerMonth: 100,
      maxReviewsPerMonth: 50,
      maxTeamSeats: 1,
      aiCopilot: true,
      aiReceptionist: true,
      multiUser: false,
      customSms: false,
      customWhatsapp: false,
      reputationManagement: false,
      advancedReports: false,
      apiAccess: false,
      crmType: 'Basic leads/pipeline',
      followUpAutomation: false,
      reputationMode: 'disabled',
      whiteLabel: false,
      supportTier: 'Email only',
      overageRatePerMinuteUsd: 0.15,
    },
  },
  Professional: {
    key: 'Professional',
    name: 'Professional',
    tagline: 'Autonomous AI receptionist, multi-crew dispatch, and field reputation for growing contractors.',
    priceMonthly: 79,
    priceAnnual: 805.80, // $67.15/mo * 12 (15% discount)
    annualMonthlyEquivalent: 67.15,
    annualDiscountPercent: 15,
    overageRatePerMinuteUsd: 0.12,
    popular: true,
    pricing: {
      USD: {
        monthly: 79,
        annualMonthlyEquivalent: 67.15,
        annualTotal: 805.80,
      },
      INR: {
        monthly: 6499,
        annualMonthlyEquivalent: 5524.15,
        annualTotal: 66289,
      },
    },
    features: [
      '250 AI Receptionist Minutes/month',
      '1,000 Outbound SMS Dispatches',
      '500 WhatsApp Messages',
      '5,000 Email Invoices & Alerts',
      '500 Active Work Orders (Jobs)',
      '500 Proposals & Estimates',
      '250 Google Review Requests',
      '5 Team User Seats',
      'Full Leads & Pipeline CRM',
      'Automated Follow-up Sequences',
      'Automated Reputation Management',
      'Email + Chat Priority Support',
    ],
    featureDetails: {
      aiReceptionistMinutes: 250,
      outboundSms: 1000,
      whatsappMessages: 500,
      emailInvoicesAlerts: 5000,
      activeWorkOrders: 500,
      proposalsEstimates: 500,
      googleReviewRequests: 250,
      teamUserSeats: 5,
      crm: 'Full leads/pipeline',
      followUpAutomation: 'Enabled',
      reputationManagement: 'Auto-request enabled',
      whiteLabelAgency: 'Disabled',
      apiAccess: 'Disabled',
      support: 'Email + chat',
      overageRateForExtraAiMinutes: '$0.12/minute',
    },
    limits: {
      maxInvoicesPerMonth: 10000,
      maxRemindersPerMonth: 5000,
      maxLeads: 2500,
      maxJobsPerMonth: 500,
      maxEstimatesPerMonth: 500,
      maxAiMinutesPerMonth: 250,
      maxAiChatsPerMonth: 250,
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
      crmType: 'Full leads/pipeline',
      followUpAutomation: true,
      reputationMode: 'auto_request',
      whiteLabel: false,
      supportTier: 'Email + chat',
      overageRatePerMinuteUsd: 0.12,
    },
  },
  Enterprise: {
    key: 'Enterprise',
    name: 'Enterprise',
    tagline: 'High-volume commercial contractor fleets, white-label operations, and custom integrations.',
    priceMonthly: 249,
    priceAnnual: 2539.80, // $211.65/mo * 12 (15% discount)
    annualMonthlyEquivalent: 211.65,
    annualDiscountPercent: 15,
    overageRatePerMinuteUsd: 0.10,
    pricing: {
      USD: {
        monthly: 249,
        annualMonthlyEquivalent: 211.65,
        annualTotal: 2539.80,
      },
      INR: {
        monthly: 19999,
        annualMonthlyEquivalent: 16999.15,
        annualTotal: 203989,
      },
    },
    features: [
      '900 AI Receptionist Minutes/month',
      '5,000 Outbound SMS Dispatches',
      '2,000 WhatsApp Messages',
      'Unlimited Email Invoices & Alerts',
      'Unlimited Active Work Orders (Jobs)',
      'Unlimited Proposals & Estimates',
      '1,000 Google Review Requests',
      '20 Team User Seats',
      'Custom CRM Stages & Automations',
      'Advanced Multi-step Follow-up Sequences',
      'Reputation Management + AI Responses',
      'White-Label & Agency Reseller Mode',
      'Full REST API & Custom Webhooks',
      'Dedicated 24/7 Priority Support',
    ],
    featureDetails: {
      aiReceptionistMinutes: 900,
      outboundSms: 5000,
      whatsappMessages: 2000,
      emailInvoicesAlerts: -1, // Unlimited
      activeWorkOrders: -1, // Unlimited
      proposalsEstimates: -1, // Unlimited
      googleReviewRequests: 1000,
      teamUserSeats: 20,
      crm: 'Full with custom pipeline stages',
      followUpAutomation: 'Advanced sequences enabled',
      reputationManagement: 'Auto-request + AI response suggestions',
      whiteLabelAgency: 'Enabled',
      apiAccess: 'Enabled',
      support: 'Dedicated support',
      overageRateForExtraAiMinutes: '$0.10/minute',
    },
    limits: {
      maxInvoicesPerMonth: 1000000,
      maxRemindersPerMonth: 1000000,
      maxLeads: 1000000,
      maxJobsPerMonth: 1000000,
      maxEstimatesPerMonth: 1000000,
      maxAiMinutesPerMonth: 900,
      maxAiChatsPerMonth: 900,
      maxSmsPerMonth: 5000,
      maxEmailPerMonth: 1000000,
      maxWhatsappPerMonth: 2000,
      maxReviewsPerMonth: 1000,
      maxTeamSeats: 20,
      aiCopilot: true,
      aiReceptionist: true,
      multiUser: true,
      customSms: true,
      customWhatsapp: true,
      reputationManagement: true,
      advancedReports: true,
      apiAccess: true,
      crmType: 'Full with custom pipeline stages',
      followUpAutomation: 'advanced',
      reputationMode: 'auto_request_ai_suggestions',
      whiteLabel: true,
      supportTier: 'Dedicated support',
      overageRatePerMinuteUsd: 0.10,
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
  userId?: string;
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
