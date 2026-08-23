export interface EmailMessage {
  from?: string;
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html?: string;
  headers?: Record<string, string>;
  metadata?: Record<string, string>;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  provider: string;
  status: 'sent' | 'failed';
  error?: string;
  timestamp: string;
}

export interface EmailProvider {
  name: string;
  sendEmail(message: EmailMessage): Promise<EmailSendResult>;
}

export interface SendApprovedEmailParams {
  communicationId: string;
  businessId?: string;
  userId?: string;
  forceApprove?: boolean;
}
