import { WhatsAppProvider } from '../types';
import { globalDevWhatsAppProvider } from './dev-provider';
import { MetaWhatsAppProvider } from './meta-provider';

export function getWhatsAppProvider(): WhatsAppProvider {
  const isProduction = process.env.NODE_ENV === 'production';
  const providerType = process.env.WHATSAPP_PROVIDER?.toLowerCase();
  const apiToken = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (
    providerType === 'meta' ||
    (apiToken && phoneNumberId && providerType !== 'test')
  ) {
    if (!apiToken || !phoneNumberId) {
      throw new Error('PRODUCTION CONFIGURATION ERROR: WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID are required for Meta WhatsApp provider.');
    }
    return new MetaWhatsAppProvider(apiToken, phoneNumberId);
  }

  // Production safeguard: do not silently fall back to Dev provider in production
  if (isProduction && process.env.ALLOW_DEV_PROVIDERS !== 'true') {
    throw new Error(
      'PRODUCTION CONFIGURATION ERROR: WHATSAPP_PROVIDER must be configured to a valid production provider (e.g. "meta") in production mode.'
    );
  }

  return globalDevWhatsAppProvider;
}
