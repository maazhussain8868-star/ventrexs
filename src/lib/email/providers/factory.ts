import { EmailProvider } from '../types';
import { globalDevEmailProvider } from './dev-provider';
import { ResendEmailProvider } from './resend-provider';

export function getEmailProvider(): EmailProvider {
  const isProduction = process.env.NODE_ENV === 'production';
  const providerType = process.env.EMAIL_PROVIDER?.toLowerCase();
  const resendApiKey = process.env.RESEND_API_KEY;

  if (providerType === 'resend' || (resendApiKey && resendApiKey.startsWith('re_') && providerType !== 'test')) {
    if (!resendApiKey) {
      throw new Error('PRODUCTION CONFIGURATION ERROR: RESEND_API_KEY is required for Resend email provider.');
    }
    return new ResendEmailProvider(resendApiKey);
  }

  // Production safeguard: do not silently fall back to Dev provider in production
  if (isProduction && process.env.ALLOW_DEV_PROVIDERS !== 'true') {
    throw new Error(
      'PRODUCTION CONFIGURATION ERROR: EMAIL_PROVIDER must be configured to a valid production provider (e.g. "resend") in production mode.'
    );
  }

  // Default to development/testing provider in dev/test environments
  return globalDevEmailProvider;
}
