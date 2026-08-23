export type AIPriority = 'low' | 'medium' | 'high';
export type AIRecommendedAction = 'monitor' | 'send_reminder' | 'send_followup' | 'review_account';
export type AIMessageTone = 'Gentle Check-in' | 'Professional Statement' | 'Firm Follow-up';

export interface AICollectionInput {
  invoiceId: string;
  invoiceNumber: string;
  originalAmount: number;
  amountPaid: number;
  remainingBalance: number;
  dueDate: string;
  daysOverdue: number;
  status: string;
  customerName: string;
  customerCompany: string;
  customerEmail: string;
  customerPhone?: string;
  paymentHistory?: Array<{
    date: string;
    amount: number;
    method: string;
  }>;
  communicationHistory?: Array<{
    date: string;
    channel: string;
    tone: string;
    status: string;
  }>;
  businessName: string;
  businessCurrency: string;
}

export interface AICollectionOutput {
  priority: AIPriority;
  recommended_action: AIRecommendedAction;
  reason: string;
  suggested_tone: AIMessageTone;
  message_draft_subject?: string;
  message_draft: string;
  confidence: number; // 0.0 to 1.0
}

export interface AICustomDraftOutput {
  subject: string;
  body: string;
  channel: 'email' | 'sms' | 'whatsapp';
  tone: AIMessageTone;
}
