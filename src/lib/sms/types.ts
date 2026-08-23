export interface SMSMessage {
  to: string;
  from?: string;
  message: string;
  metadata?: Record<string, string>;
}

export interface SMSSendResult {
  success: boolean;
  messageId?: string;
  provider: string;
  status: 'sent' | 'failed';
  error?: string;
  timestamp: string;
}

export interface SMSProvider {
  name: string;
  sendSMS(message: SMSMessage): Promise<SMSSendResult>;
}

export interface SendApprovedSMSParams {
  communicationId: string;
  businessId?: string;
  userId?: string;
}

export interface CustomerSMSConsent {
  sms_consent: boolean;
  sms_consent_at?: string | null;
  sms_consent_source?: string | null;
  sms_opted_out: boolean;
  sms_opted_out_at?: string | null;
  sms_opt_out_reason?: string | null;
}
