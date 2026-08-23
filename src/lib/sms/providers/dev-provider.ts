import { SMSMessage, SMSProvider, SMSSendResult } from '../types';

export class DevSMSProvider implements SMSProvider {
  name = 'Development / Test SMS Provider';

  private sentMessages: Array<SMSMessage & { id: string; sentAt: string }> = [];
  private simulatedError: string | null = null;

  async sendSMS(message: SMSMessage): Promise<SMSSendResult> {
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

    const messageId = `sms_dev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
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

  simulateFailureNext(errorMessage = 'Simulated SMS gateway network error') {
    this.simulatedError = errorMessage;
  }
}

export const globalDevSMSProvider = new DevSMSProvider();
