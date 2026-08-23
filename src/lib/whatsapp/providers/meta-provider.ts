import { WhatsAppMessage, WhatsAppProvider, WhatsAppSendResult } from '../types';

export class MetaWhatsAppProvider implements WhatsAppProvider {
  name = 'Meta WhatsApp Business Cloud API';

  constructor(
    private apiToken: string,
    private phoneNumberId: string
  ) {}

  async sendWhatsApp(message: WhatsAppMessage): Promise<WhatsAppSendResult> {
    const timestamp = new Date().toISOString();

    try {
      const endpoint = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;

      let requestPayload: any;

      if (message.templateName) {
        requestPayload = {
          messaging_product: 'whatsapp',
          to: message.to.replace(/^\+/, ''),
          type: 'template',
          template: {
            name: message.templateName,
            language: { code: message.templateLanguage || 'en_US' },
          },
        };
      } else {
        requestPayload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: message.to.replace(/^\+/, ''),
          type: 'text',
          text: {
            preview_url: true,
            body: message.bodyText || '',
          },
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          provider: this.name,
          status: 'failed',
          error: data?.error?.message || `HTTP ${response.status}: ${response.statusText}`,
          timestamp,
        };
      }

      const messageId = data?.messages?.[0]?.id || `wamid_${Date.now()}`;
      return {
        success: true,
        messageId,
        provider: this.name,
        status: 'sent',
        timestamp,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: this.name,
        status: 'failed',
        error: err.message || 'Network exception connecting to WhatsApp Cloud API',
        timestamp,
      };
    }
  }
}
