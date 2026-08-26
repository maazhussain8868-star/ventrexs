export type AccountTier = 'PLATFORM_ADMIN' | 'AGENCY' | 'BUSINESS';

export type AgencyPlanTier = 'Agency Starter' | 'Agency Growth' | 'Agency Enterprise';

export type AgencyRole = 'AGENCY_OWNER' | 'AGENCY_ADMIN' | 'AGENCY_MANAGER' | 'AGENCY_STAFF' | 'AGENCY_VIEWER';

export type AgencyMemberStatus = 'active' | 'invited' | 'suspended' | 'removed';

export type AgencyInvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

export type CustomDomainStatus = 'PENDING' | 'VERIFYING' | 'VERIFIED' | 'ACTIVE' | 'FAILED' | 'REMOVED';

export type FeatureFlagKey =
  | 'AI_RECEPTIONIST'
  | 'WHATSAPP'
  | 'SMS'
  | 'REVIEWS'
  | 'ESTIMATES'
  | 'JOBS'
  | 'PAYMENTS'
  | 'REPORTS'
  | 'OWNER_AI'
  | 'AGENCY'
  | 'WHITE_LABEL'
  | 'CUSTOM_DOMAINS';

export interface AgencyMemberRecord {
  id: string;
  agencyId: string;
  userId: string;
  email: string;
  role: AgencyRole;
  status: AgencyMemberStatus;
  invitedAt: string;
  acceptedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgencyInvitationRecord {
  id: string;
  agencyId: string;
  email: string;
  role: AgencyRole;
  tokenHash: string;
  status: AgencyInvitationStatus;
  expiresAt: string;
  createdBy?: string;
  acceptedAt?: string;
  createdAt: string;
  updatedAt: string;
  rawToken?: string; // Only returned at generation time for link distribution
}

export interface AgencyTenantCreationParams {
  name: string;
  slug: string;
  ownerEmail: string;
  planTier: AgencyPlanTier;
  subscriptionId?: string;
  maxBusinesses?: number;
  contactPhone?: string;
}

export interface AgencyRecord {
  id: string;
  name: string;
  slug: string;
  ownerId?: string;
  planTier: AgencyPlanTier;
  maxBusinesses: number;
  status: 'active' | 'suspended' | 'cancelled';
  contactEmail: string;
  contactPhone?: string;
  subscriptionId?: string;
  billingStatus?: 'active' | 'trial' | 'past_due' | 'suspended' | 'cancelled';
  businessCount?: number;
  totalMrr?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface AgencyBusinessItem {
  id: string;
  agencyId: string;
  businessId: string;
  businessName: string;
  businessEmail: string;
  industry: string;
  plan: string;
  status: 'active' | 'trial' | 'suspended';
  mrr: number;
  jobsCount: number;
  invoicesCount: number;
  assignedAt: string;
}

export interface WhiteLabelBranding {
  id?: string;
  agencyId?: string;
  businessId?: string;
  brandName: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  loginHeadline?: string;
  loginTagline?: string;
  emailSenderName?: string;
  supportEmail?: string;
  supportPhone?: string;
  footerText?: string;
  customPrivacyUrl?: string;
  customTermsUrl?: string;
  isActive: boolean;
}

export interface CustomDomainRecord {
  id: string;
  agencyId?: string;
  businessId?: string;
  domain: string;
  status: CustomDomainStatus;
  txtVerificationToken: string;
  sslStatus: 'pending' | 'issuing' | 'active' | 'failed';
  verifiedAt?: string;
  lastCheckedAt?: string;
  failureReason?: string;
  createdAt: string;
}

export interface FeatureFlagRecord {
  id: string;
  flagKey: FeatureFlagKey | string;
  scope: 'global' | 'agency' | 'business';
  targetId?: string;
  isEnabled: boolean;
  description?: string;
}

export interface AuditLogEvent {
  id: string;
  businessId?: string;
  agencyId?: string;
  userId?: string;
  actorEmail: string;
  actorRole: string;
  eventType: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface DataExportRecord {
  id: string;
  businessId: string;
  requestedBy: string;
  format: 'json' | 'csv' | 'zip';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  downloadUrl?: string;
  expiresAt: string;
  createdAt: string;
}

export interface AccountDeletionRecord {
  id: string;
  businessId: string;
  requestedBy: string;
  status: 'REQUESTED' | 'REVIEWED' | 'CONFIRMED' | 'EXECUTED' | 'REJECTED';
  reason: string;
  reviewedBy?: string;
  confirmedAt?: string;
  executedAt?: string;
  createdAt: string;
}

export interface ProductionReadinessCheck {
  id: string;
  name: string;
  category: 'core' | 'billing' | 'communications' | 'ai' | 'security' | 'compliance';
  status: 'READY' | 'WARNING' | 'BLOCKED';
  message: string;
  details?: string;
}

export interface SystemHealthMetric {
  component: string;
  status: 'HEALTHY' | 'DEGRADED' | 'OUTAGE';
  responseTimeMs: number;
  errorMessage?: string;
  lastChecked: string;
}
