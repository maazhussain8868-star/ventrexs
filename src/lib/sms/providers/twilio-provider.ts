import { SMSMessage, SMSProvider, SMSSendResult } from '../types';

export class TwilioSMSProvider implements SMSProvider {
  name = 'Twilio Production SMS Provider';

  constructor(
    private accountSid: string,
    private authToken: string,
    private defaultFrom?: string
  ) {}

  async sendSMS(message: SMSMessage): Promise<SMSSendResult> {
    const timestamp = new Date().toISOString();

    try {
      const fromNumber = message.from || process.env.TWILIO_FROM_NUMBER || this.defaultFrom;
      if (!fromNumber) {
        return {
          success: false,
          provider: this.name,
          status: 'failed',
          error: 'Twilio from number is not configured (TWILIO_FROM_NUMBER).',
          timestamp,
        };
      }

      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      const authHeader = 'Basic ' + Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');

      const bodyParams = new URLSearchParams({
        To: message.to,
        From: fromNumber,
        Body: message.message,
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParams.toString(),
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
        messageId: data.sid,
        provider: this.name,
        status: 'sent',
        timestamp,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: this.name,
        status: 'failed',
        error: err.message || 'Network exception connecting to Twilio',
        timestamp,
      };
    }
  }
}
