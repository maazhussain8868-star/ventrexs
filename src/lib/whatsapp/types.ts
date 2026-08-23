export type WhatsAppMessageType = 'invoice_reminder' | 'payment_followup' | 'payment_confirmation';

export interface WhatsAppMessage {
  to: string;
  from?: string;
  type: WhatsAppMessageType;
  templateName?: string;
  templateLanguage?: string;
  templateVariables?: Record<string, string>;
  bodyText?: string;
  metadata?: Record<string, string>;
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  provider: string;
  status: 'sent' | 'failed';
  error?: string;
  timestamp: string;
}

export interface WhatsAppProvider {
  name: string;
  sendWhatsApp(message: WhatsAppMessage): Promise<WhatsAppSendResult>;
}

export interface SendApprovedWhatsAppParams {
  communicationId: string;
  businessId?: string;
  userId?: string;
}

export interface CustomerWhatsAppConsent {
  whatsapp_consent: boolean;
  whatsapp_consent_at?: string | null;
  whatsapp_consent_source?: string | null;
  whatsapp_opted_out: boolean;
  whatsapp_opted_out_at?: string | null;
  whatsapp_opt_out_reason?: string | null;
}
