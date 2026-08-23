import { SMSProvider } from '../types';
import { globalDevSMSProvider } from './dev-provider';
import { TwilioSMSProvider } from './twilio-provider';

export function getSMSProvider(): SMSProvider {
  const isProduction = process.env.NODE_ENV === 'production';
  const providerType = process.env.SMS_PROVIDER?.toLowerCase();
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;

  if (
    providerType === 'twilio' ||
    (twilioSid && twilioAuth && twilioSid.startsWith('AC') && providerType !== 'test')
  ) {
    if (!twilioSid || !twilioAuth) {
      throw new Error('PRODUCTION CONFIGURATION ERROR: TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required for Twilio SMS provider.');
    }
    return new TwilioSMSProvider(twilioSid, twilioAuth, process.env.TWILIO_FROM_NUMBER);
  }

  // Production safeguard: do not silently fall back to Dev provider in production
  if (isProduction && process.env.ALLOW_DEV_PROVIDERS !== 'true') {
    throw new Error(
      'PRODUCTION CONFIGURATION ERROR: SMS_PROVIDER must be configured to a valid production provider (e.g. "twilio") in production mode.'
    );
  }

  return globalDevSMSProvider;
}
