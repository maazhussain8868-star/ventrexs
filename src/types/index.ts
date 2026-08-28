export type InvoiceStatus = 'draft' | 'sent' | 'due' | 'overdue' | 'partially_paid' | 'paid' | 'disputed';
export type PriorityLevel = 'high' | 'medium' | 'low';
export type RiskLevel = 'low' | 'medium' | 'high';
export type PaymentMethod = 'ACH Transfer' | 'Credit Card' | 'Bank Wire' | 'Check' | 'Other';

// CRM & Lead Statuses
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'ESTIMATE_SENT' | 'BOOKED' | 'WON' | 'LOST';
export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';
export type LeadSource = 
  | 'Website' 
  | 'Phone Call' 
  | 'Google' 
  | 'Referral' 
  | 'Angi' 
  | 'Yelp' 
  | 'Facebook' 
  | 'Instagram'
  | 'Thumbtack' 
  | 'Direct' 
  | 'Manual'
  | 'Import'
  | 'Other';

export type IndustryType =
  | 'HVAC'
  | 'Roofing'
  | 'Plumbing'
  | 'Electrical'
  | 'Concrete'
  | 'General Contractor'
  | 'Landscaping'
  | 'Garage Door'
  | 'Pest Control'
  | 'Cleaning'
  | 'Other';

export interface LeadNote {
  id: string;
  leadId: string;
  businessId?: string;
  authorId?: string;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  activityType: 
    | 'status_change' 
    | 'note' 
    | 'call' 
    | 'email' 
    | 'sms' 
    | 'estimate_created' 
    | 'booking_created' 
    | 'stage_change'
    | 'assigned_user_changed'
    | 'contact_converted'
    | 'job_created'
    | 'invoice_created'
    | 'payment_recorded'
    | 'follow_up_created'
    | 'follow_up_completed';
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  userName?: string;
}

export interface Lead {
  id: string;
  businessId?: string;
  customerId?: string;
  name: string;
  company?: string;
  phone: string;
  email: string;
  source: LeadSource;
  serviceRequested: string;
  status: LeadStatus;
  priority: LeadPriority;
  estimatedValue: number;
  score?: number;
  assignedUserId?: string;
  assignedUserName?: string;
  notes?: string;
  notesList?: LeadNote[];
  lastActivityAt: string;
  createdAt: string;
  activities?: LeadActivity[];
}

export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: string;
  businessId?: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  leadId?: string;
  title: string;
  serviceType: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  address: string;
  technicianName: string;
  notes?: string;
  createdAt: string;
}

export type JobStatus = 
  | 'NEW' 
  | 'SCHEDULED' 
  | 'DISPATCHED' 
  | 'IN_PROGRESS' 
  | 'ON_HOLD' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'PENDING' 
  | 'INVOICED';

export type JobPriority = 'low' | 'medium' | 'high' | 'urgent' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface JobActivity {
  id: string;
  jobId: string;
  businessId?: string;
  activityType: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  userId?: string;
  userName?: string;
  createdAt: string;
}

export interface Job {
  id: string;
  businessId?: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  leadId?: string;
  appointmentId?: string;
  invoiceId?: string;
  estimateId?: string;
  title: string;
  serviceType: string;
  description?: string;
  propertyAddress?: string;
  status: JobStatus;
  priority: LeadPriority | JobPriority;
  scheduledDate?: string;
  estimatedDurationMinutes?: number;
  startTime?: string;
  endTime?: string;
  estimatedTotal: number;
  actualTotal: number;
  assignedTechId?: string;
  assignedTechName?: string;
  technicianName: string;
  notes?: string;
  internalNotes?: string;
  customerNotes?: string;
  completedAt?: string;
  completedBy?: string;
  activities?: JobActivity[];
  createdAt: string;
  updatedAt?: string;
}

export type EstimateStatus = 
  | 'DRAFT' 
  | 'SENT' 
  | 'VIEWED' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'EXPIRED' 
  | 'CANCELLED';

export interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Estimate {
  id: string;
  businessId?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  jobId?: string;
  jobTitle?: string;
  leadId?: string;
  estimateNumber: string;
  title: string;
  description?: string;
  items: EstimateItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: EstimateStatus;
  validUntil?: string;
  notes?: string;
  createdBy?: string;
  approvedAt?: string;
  approvedByCustomerName?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  invoiceId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EstimateStats {
  totalEstimates: number;
  draft: number;
  sent: number;
  approved: number;
  rejected: number;
  approvedValue: number;
  pipelineValue: number;
}

export interface JobStats {
  totalJobs: number;
  newJobs: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  urgent: number;
  todayJobs: number;
  totalValue: number;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface TimelineEvent {
  id: string;
  type: 'created' | 'sent' | 'viewed' | 'reminder_sent' | 'payment_received';
  title: string;
  description?: string;
  timestamp: string;
}

export interface AISuggestion {
  actionType: 'gentle' | 'professional' | 'firm' | 'urgent';
  insight: string;
  confidence: number;
  recommendedSubject?: string;
  recommendedBody?: string;
}

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  customerCompany: string;
  customerEmail: string;
  customerPhone?: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  priority: PriorityLevel;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number; // Original Amount Due
  originalAmountDue: number;
  paymentsReceived: number;
  remainingBalance: number;
  daysOverdue: number;
  notes?: string;
  paidDate?: string;
  timeline: TimelineEvent[];
  aiSuggestion?: AISuggestion;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  totalOutstanding: number; // Outstanding Receivables
  outstandingReceivables: number;
  totalPaid: number; // Payments Received
  paymentsReceived: number;
  overdueCount: number;
  activeInvoicesCount: number;
  riskLevel: RiskLevel;
  creditScore: number;
  lastContactDate: string;
  preferredContact: 'email' | 'phone' | 'sms';
  notes?: string;
  serviceHistoryCount?: number;
  associatedLeadsCount?: number;
  associatedJobsCount?: number;
}

export interface CopilotRecommendation {
  id: string;
  invoiceId: string;
  customerName: string;
  amount: number;
  originalAmountDue: number;
  daysOverdue: number;
  priority: PriorityLevel;
  aiInsight: string;
  recommendedAction: string;
  confidence: number;
  tone: 'gentle' | 'professional' | 'firm' | 'urgent';
  draftSubject: string;
  draftBody: string;
  status: 'pending' | 'sent' | 'dismissed';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'payment' | 'overdue' | 'copilot' | 'system';
  linkUrl?: string;
}

export interface DaySchedule {
  open: string;
  close: string;
  closed: boolean;
}

export interface BusinessHours {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
  weekdays?: string;
  weekends?: string;
  emergency24_7?: boolean;
}

export interface ServiceBusinessProfile {
  id: string;
  name: string;
  industry: IndustryType;
  phone: string;
  email: string;
  website: string;
  address: string;
  logoUrl?: string;
  serviceAreas: string[];
  services: string[];
  businessHours: BusinessHours;
  timezone: string;
  about?: string;
  onboardingCompleted: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  accountType?: 'BUSINESS_OWNER' | 'AGENCY_OWNER' | 'PLATFORM_ADMIN' | 'DEMO_GUEST';
  businessName: string;
  businessType: string;
  phone: string;
  address: string;
  avatarUrl: string;
  plan: 'Starter' | 'Professional' | 'Enterprise';
  billingCycle: 'monthly' | 'annual';
  twoFactorEnabled: boolean;
}

export interface BusinessSettings {
  businessName: string;
  businessEmail: string;
  industry?: IndustryType;
  phone?: string;
  website?: string;
  address?: string;
  serviceAreas?: string[];
  services?: string[];
  businessHours?: BusinessHours;
  timezone?: string;
  about?: string;
  taxId: string;
  currency: string;
  paymentTermsDays: number;
  defaultNotes: string;
  stripeConnected: boolean;
  achConnected: boolean;
  autoReminderEnabled: boolean;
  onboardingCompleted?: boolean;
}

export interface AdminStats {
  mrr: number;
  mrrGrowth: number;
  activeUsers: number;
  userGrowth: number;
  aiDraftsToday: number;
  serverUptime: string;
}

// ==============================================================================
// PHASE 3 — AI RECEPTIONIST DOMAIN TYPES
// ==============================================================================

export type ConversationState =
  | 'NEW'
  | 'COLLECTING_INFO'
  | 'QUALIFYING'
  | 'READY_TO_BOOK'
  | 'BOOKING'
  | 'BOOKED'
  | 'HANDOFF_REQUIRED'
  | 'COMPLETED';

export type ReceptionistIntent =
  | 'SERVICE_INQUIRY'
  | 'PRICE_INQUIRY'
  | 'BOOK_APPOINTMENT'
  | 'RESCHEDULE'
  | 'CANCEL'
  | 'EMERGENCY'
  | 'GENERAL_QUESTION'
  | 'EXISTING_CUSTOMER'
  | 'INVOICE_QUESTION'
  | 'PAYMENT_QUESTION'
  | 'HUMAN_REQUEST'
  | 'UNKNOWN';

export type ReceptionistChannel =
  | 'WEB_CHAT'
  | 'SMS'
  | 'WHATSAPP'
  | 'VOICE'
  | 'EMAIL'
  | 'SIMULATED';

export type ReceptionistTone =
  | 'professional'
  | 'friendly'
  | 'emergency_first'
  | 'concise';

export interface ReceptionistFAQ {
  question: string;
  answer: string;
}

export interface ReceptionistSettings {
  id: string;
  businessId: string;
  enabled: boolean;
  greeting: string;
  businessDescription: string;
  tone: ReceptionistTone;
  languages: string[];
  afterHoursMessage: string;
  emergencyInstructions: string;
  bookingEnabled: boolean;
  bookingLeadTimeHours: number;
  bookingMaxDaysAhead: number;
  humanHandoffKeywords: string[];
  faqs: ReceptionistFAQ[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ReceptionistService {
  id: string;
  businessId?: string;
  name: string;
  category: string;
  description: string;
  typicalDurationMinutes: number;
  emergencyAvailable: boolean;
  bookingEligible: boolean;
  basePrice?: number;
  qualificationQuestions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ExtractedCustomerInfo {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  company?: string;
  serviceRequested?: string;
  problemDescription?: string;
  preferredTime?: string;
  urgency?: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
}

export interface ReceptionistMessage {
  id: string;
  businessId?: string;
  conversationId: string;
  senderType: 'CUSTOMER' | 'AI' | 'HUMAN_AGENT' | 'SYSTEM';
  content: string;
  structuredPayload?: Record<string, any>;
  createdAt: string;
}

export interface ReceptionistConversation {
  id: string;
  businessId: string;
  customerId?: string;
  leadId?: string;
  appointmentId?: string;
  channel: ReceptionistChannel;
  state: ConversationState;
  detectedIntent?: ReceptionistIntent;
  intentConfidence?: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  serviceRequested?: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  handoffRequired: boolean;
  handoffReason?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
  messages?: ReceptionistMessage[];
}

export interface StructuredReceptionistResponse {
  replyText: string;
  state: ConversationState;
  detectedIntent: ReceptionistIntent;
  confidence: number;
  extractedInfo: ExtractedCustomerInfo;
  requestedAction: 'NONE' | 'CREATE_LEAD' | 'BOOK_APPOINTMENT' | 'TRIGGER_HANDOFF';
  handoffReason?: string;
  suggestedSlots?: string[];
}

// ==============================================================================
// PHASE 4 — MULTI-CHANNEL COMMUNICATION AUTOMATION TYPES
// ==============================================================================

export type CommChannel = 'email' | 'sms' | 'whatsapp';
export type CommStatus = 'draft' | 'approved' | 'sending' | 'sent' | 'delivered' | 'failed' | 'cancelled' | 'queued';
export type CommApprovalStatus = 'auto_approved' | 'pending_approval' | 'approved' | 'rejected';
export type CommCategory =
  | 'appointment_confirmation'
  | 'appointment_reminder'
  | 'estimate_notification'
  | 'invoice_notification'
  | 'payment_confirmation'
  | 'follow_up'
  | 'lead_welcome'
  | 'custom';

export interface CommunicationItem {
  id: string;
  businessId: string;
  invoiceId?: string | null;
  customerId?: string | null;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  leadId?: string | null;
  leadName?: string;
  appointmentId?: string | null;
  jobId?: string | null;
  templateId?: string | null;
  channel: CommChannel;
  subject?: string | null;
  message: string;
  tone: 'gentle' | 'professional' | 'firm' | 'urgent';
  status: CommStatus;
  deliveryStatus?: 'pending' | 'in_transit' | 'delivered' | 'failed';
  triggerType?: string | null;
  approvalStatus: CommApprovalStatus;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  requiresApproval: boolean;
  providerMessageId?: string | null;
  errorMessage?: string | null;
  sentAt?: string | null;
  createdAt: string;
}

export interface CommunicationTemplate {
  id: string;
  businessId?: string | null;
  name: string;
  channel: CommChannel;
  category: CommCategory;
  subjectTemplate?: string;
  bodyTemplate: string;
  variables: string[];
  isSystem: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommunicationConsent {
  id: string;
  businessId: string;
  customerId?: string | null;
  customerName?: string;
  leadId?: string | null;
  leadName?: string;
  channel: CommChannel;
  optedIn: boolean;
  consentSource?: string | null;
  consentAt?: string | null;
  optedOut: boolean;
  optedOutAt?: string | null;
  optOutReason?: string | null;
  createdAt?: string;
}

export interface CommunicationStats {
  totalMessages: number;
  sent: number;
  delivered: number;
  failed: number;
  pending: number;
  replies: number;
  optOuts: number;
  emailCount: number;
  smsCount: number;
  whatsappCount: number;
}

// ==============================================================================
// PHASE 6 — REPUTATION & REVIEW MANAGEMENT TYPES
// ==============================================================================

export type ReviewRequestStatus =
  | 'PENDING'
  | 'SCHEDULED'
  | 'SENT'
  | 'DELIVERED'
  | 'OPENED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type ReviewChannel = 'email' | 'sms' | 'whatsapp' | 'web';
export type FeedbackSentiment = 'positive' | 'neutral' | 'negative';
export type FollowUpStatus = 'NEW' | 'IN_REVIEW' | 'CONTACTED' | 'RESOLVED' | 'CLOSED';
export type ReviewPlatform = 'google' | 'yelp' | 'facebook' | 'direct';

export interface ReviewSettings {
  id?: string;
  businessId: string;
  automationEnabled: boolean;
  requestDelayHours: number;
  primaryPlatform: ReviewPlatform;
  googleReviewUrl?: string;
  directFeedbackUrl?: string;
  defaultChannel: 'email' | 'sms' | 'whatsapp';
  maxRequestsPerJob: number;
  positiveThreshold: number;
  emailSubjectTemplate?: string;
  emailBodyTemplate?: string;
  smsBodyTemplate?: string;
  whatsappBodyTemplate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewRequest {
  id: string;
  businessId: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  jobId?: string;
  jobTitle?: string;
  technicianId?: string;
  technicianName?: string;
  channel: ReviewChannel;
  status: ReviewRequestStatus;
  scheduledFor?: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  completedAt?: string;
  reviewUrl?: string;
  feedbackUrl?: string;
  idempotencyKey?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerFeedback {
  id: string;
  businessId: string;
  reviewRequestId?: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  jobId?: string;
  jobTitle?: string;
  technicianName?: string;
  rating: number;
  sentiment: FeedbackSentiment;
  feedbackText?: string;
  serviceAspects?: string[];
  channel: ReviewChannel;
  followUpStatus: FollowUpStatus;
  followUpNotes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewEvent {
  id: string;
  businessId: string;
  reviewRequestId: string;
  eventType: string;
  payload?: Record<string, any>;
  createdAt: string;
}

export interface ReviewTemplate {
  id: string;
  businessId: string;
  name: string;
  channel: 'email' | 'sms' | 'whatsapp';
  subjectTemplate?: string;
  bodyTemplate: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReputationStats {
  totalRequests: number;
  sent: number;
  delivered: number;
  completed: number;
  deliveryRate: number;
  responseRate: number;
  averageRating: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  pendingFollowUps: number;
  resolvedFollowUps: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  channelBreakdown: {
    email: { sent: number; completed: number };
    sms: { sent: number; completed: number };
    whatsapp: { sent: number; completed: number };
  };
}

export interface TechnicianReputationMetric {
  technicianName: string;
  completedJobs: number;
  reviewRequests: number;
  responses: number;
  averageRating: number;
  positiveCount: number;
  negativeCount: number;
  responseRate: number;
}

// ==============================================================================
// PHASE 7 — SAAS MONETIZATION, SUBSCRIPTIONS & USAGE TYPES
// ==============================================================================

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

export interface UsageRecord {
  id: string;
  businessId: string;
  metric: UsageMetric;
  periodStart: string;
  periodEnd: string;
  usageCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export type SubscriptionEventType =
  | 'CHECKOUT_INITIATED'
  | 'SUBSCRIPTION_CREATED'
  | 'SUBSCRIPTION_UPDATED'
  | 'PLAN_UPGRADED'
  | 'PLAN_DOWNGRADED'
  | 'PAYMENT_SUCCEEDED'
  | 'PAYMENT_FAILED'
  | 'CANCELLATION_REQUESTED'
  | 'SUBSCRIPTION_CANCELLED'
  | 'SUBSCRIPTION_REACTIVATED'
  | 'TRIAL_EXPIRED'
  | 'PORTAL_SESSION_ACCESSED';

export interface SubscriptionEvent {
  id: string;
  businessId: string;
  userId?: string;
  eventType: SubscriptionEventType;
  fromPlan?: string;
  toPlan?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface BusinessSubscription {
  id: string;
  businessId: string;
  plan: PlanKey;
  billingCycle: BillingInterval;
  status: SubscriptionStatus;
  priceAmount: number;
  currency: string;
  provider?: string;
  providerCustomerId?: string;
  providerSubscriptionId?: string;
  trialStart?: string;
  trialEnd?: string;
  trialEndsAt?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt?: string;
  updatedAt?: string;
}

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

export interface EntitlementCheckResult {
  hasAccess: boolean;
  plan: PlanKey;
  status: SubscriptionStatus;
  isActive: boolean;
  isTrial: boolean;
  trialDaysRemaining?: number;
  reason?: string;
  limit?: number;
  usage?: number;
  remaining?: number;
}

// ==============================================================================
// PHASE 8 — REPORTS, ANALYTICS & OWNER AI DASHBOARD TYPES
// ==============================================================================
export type {
  DateRangePreset,
  DateRangeFilter,
  MetricTrend,
  ExecutiveDashboardMetrics,
  LeadFunnelStage,
  ServicePerformanceMetric,
  TechnicianPerformanceReport,
  LeadSourceRoiMetric,
  InsightCategory,
  InsightSeverity,
  OwnerInsight,
  DailyBriefing,
  AnomalyAlert,
} from '@/lib/analytics/types';

// ==============================================================================
// PHASE 9 — PAYMENTS & ADVANCED REVENUE OPERATIONS TYPES
// ==============================================================================
export type {
  PaymentStatus,
  PaymentMethodType,
  PaymentProviderName,
  ProcessPaymentParams,
  ProcessPaymentResult,
  RefundPaymentParams,
  RefundPaymentResult,
  PaymentProvider,
  PaymentRecord,
  RefundRecord,
  PaymentRequestRecord,
  PublicInvoicePaymentView,
  RevenueSummary,
} from '@/lib/payments/types';

// ==============================================================================
// PHASE 10 — PRODUCTION LAUNCH, AGENCY & WHITE-LABEL TYPES
// ==============================================================================
export type {
  AccountTier,
  AgencyPlanTier,
  CustomDomainStatus,
  FeatureFlagKey,
  AgencyRecord,
  AgencyBusinessItem,
  WhiteLabelBranding,
  CustomDomainRecord,
  FeatureFlagRecord,
  AuditLogEvent,
  DataExportRecord,
  AccountDeletionRecord,
  ProductionReadinessCheck,
  SystemHealthMetric,
} from '@/lib/agency/types';






