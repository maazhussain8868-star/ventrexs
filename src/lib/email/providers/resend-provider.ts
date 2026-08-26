import { EmailMessage, EmailProvider, EmailSendResult } from '../types';

export class ResendEmailProvider implements EmailProvider {
  name = 'Resend Production Email Provider';

  constructor(private apiKey: string, private defaultFrom = 'Ventrexs AI <notifications@ventrexs.com>') {}

  async sendEmail(message: EmailMessage): Promise<EmailSendResult> {
    const timestamp = new Date().toISOString();

    try {
      const fromAddress = message.from || process.env.EMAIL_FROM || this.defaultFrom;
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [message.to],
          reply_to: message.replyTo,
          subject: message.subject,
          text: message.text,
          html: message.html,
          headers: message.headers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          provider: this.name,
          status: 'failed',
          error: data?.message || `HTTP ${response.status}: ${response.statusText}`,
          timestamp,
        };
      }

      return {
        success: true,
        messageId: data.id,
        provider: this.name,
        status: 'sent',
        timestamp,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: this.name,
        status: 'failed',
        error: err.message || 'Network error while contacting email gateway',
        timestamp,
      };
    }
  }
}
