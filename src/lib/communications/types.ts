import { CommunicationChannel, CommunicationTone, CommunicationStatus } from '../supabase/types';

export type CommunicationCategory =
  | 'appointment_confirmation'
  | 'appointment_reminder'
  | 'estimate_notification'
  | 'invoice_notification'
  | 'payment_confirmation'
  | 'follow_up'
  | 'lead_welcome'
  | 'custom';

export type AutomationTriggerType =
  | 'NEW_LEAD'
  | 'LEAD_QUALIFIED'
  | 'APPOINTMENT_BOOKED'
  | 'APPOINTMENT_REMINDER'
  | 'APPOINTMENT_COMPLETED'
  | 'ESTIMATE_SENT'
  | 'INVOICE_CREATED'
  | 'PAYMENT_RECEIVED'
  | 'FOLLOW_UP_DUE'
  | 'MISSED_APPOINTMENT'
  | 'CUSTOMER_REPLY';

export type ApprovalStatus = 'auto_approved' | 'pending_approval' | 'approved' | 'rejected';

export interface CommunicationTemplateItem {
  id: string;
  businessId?: string | null;
  name: string;
  channel: CommunicationChannel;
  category: CommunicationCategory;
  subjectTemplate?: string;
  bodyTemplate: string;
  variables: string[];
  isSystem: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommunicationConsentRecord {
  id: string;
  businessId: string;
  customerId?: string | null;
  leadId?: string | null;
  channel: CommunicationChannel;
  optedIn: boolean;
  consentSource?: string | null;
  consentAt?: string | null;
  optedOut: boolean;
  optedOutAt?: string | null;
  optOutReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface OutboundMessageRequest {
  businessId: string;
  channel: CommunicationChannel;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientName?: string;
  customerId?: string;
  leadId?: string;
  invoiceId?: string;
  appointmentId?: string;
  jobId?: string;
  templateId?: string;
  templateName?: string;
  triggerType?: AutomationTriggerType;
  subject?: string;
  message: string;
  tone?: CommunicationTone;
  variables?: Record<string, string | number | boolean | undefined>;
  requiresApproval?: boolean;
  idempotencyKey?: string;
  userId?: string;
}

export interface OutboundDispatchResult {
  success: boolean;
  communicationId: string;
  providerMessageId?: string;
  status: CommunicationStatus;
  approvalStatus: ApprovalStatus;
  requiresApproval: boolean;
  error?: string;
  simulated?: boolean;
}

export interface InboundMessageEvent {
  channel: CommunicationChannel;
  senderIdentifier: string; // phone or email
  senderName?: string;
  messageText: string;
  providerMessageId?: string;
  timestamp?: string;
  businessId?: string;
  rawPayload?: Record<string, any>;
}

export interface InboundRoutingResult {
  success: boolean;
  handledAs: 'OPT_OUT' | 'RECEPTIONIST_CONVERSATION' | 'CRM_ACTIVITY' | 'IGNORED';
  optOutRecorded?: boolean;
  conversationId?: string;
  aiReplyText?: string;
  leadId?: string;
  customerId?: string;
  error?: string;
}
