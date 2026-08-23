import { WhatsAppMessage, WhatsAppProvider, WhatsAppSendResult } from '../types';

export class DevWhatsAppProvider implements WhatsAppProvider {
  name = 'Development / Test WhatsApp Provider';

  private sentMessages: Array<WhatsAppMessage & { id: string; sentAt: string }> = [];
  private simulatedError: string | null = null;

  async sendWhatsApp(message: WhatsAppMessage): Promise<WhatsAppSendResult> {
    const timestamp = new Date().toISOString();

    if (this.simulatedError) {
      const errorMsg = this.simulatedError;
      this.simulatedError = null; // Reset after one trigger
      return {
        success: false,
        provider: this.name,
        status: 'failed',
        error: errorMsg,
        timestamp,
      };
    }

    const messageId = `wa_dev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    this.sentMessages.push({
      ...message,
      id: messageId,
      sentAt: timestamp,
    });

    return {
      success: true,
      messageId,
      provider: this.name,
      status: 'sent',
      timestamp,
    };
  }

  getSentMessages() {
    return [...this.sentMessages];
  }

  getLastMessage() {
    return this.sentMessages[this.sentMessages.length - 1] || null;
  }

  clearMessages() {
    this.sentMessages = [];
    this.simulatedError = null;
  }

  simulateFailureNext(errorMessage = 'Simulated WhatsApp Cloud API connection timeout') {
    this.simulatedError = errorMessage;
  }
}

export const globalDevWhatsAppProvider = new DevWhatsAppProvider();
