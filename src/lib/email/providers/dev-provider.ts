import { EmailMessage, EmailProvider, EmailSendResult } from '../types';

export class DevEmailProvider implements EmailProvider {
  name = 'Development / Test Email Provider';

  private sentMessages: Array<EmailMessage & { id: string; sentAt: string }> = [];
  private simulatedError: string | null = null;

  async sendEmail(message: EmailMessage): Promise<EmailSendResult> {
    const timestamp = new Date().toISOString();

    // Check for simulated failure during tests
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

    const messageId = `msg_dev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
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

  simulateFailureNext(errorMessage = 'Simulated SMTP connection timeout') {
    this.simulatedError = errorMessage;
  }
}

// Global singleton instance for testing / dev state inspection
export const globalDevEmailProvider = new DevEmailProvider();
