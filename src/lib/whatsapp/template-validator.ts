import { WhatsAppMessageType } from './types';

const ALLOWED_MESSAGE_TYPES: WhatsAppMessageType[] = [
  'invoice_reminder',
  'payment_followup',
  'payment_confirmation',
];

const FORBIDDEN_TEMPLATE_TYPES = [
  'marketing',
  'promotional',
  'broadcast',
  'newsletter',
  'lead_gen',
  'cold_outreach',
];

export function validateWhatsAppTemplate(params: {
  type: string;
  templateName?: string | null;
  messageText?: string | null;
  variables?: Record<string, any> | null;
}): { isValid: boolean; error?: string } {
  const { type, messageText } = params;

  // 1. Check for forbidden broadcast/marketing categories
  const lowerType = (type || '').toLowerCase();
  for (const forbidden of FORBIDDEN_TEMPLATE_TYPES) {
    if (lowerType.includes(forbidden)) {
      return {
        isValid: false,
        error: `WhatsApp marketing/broadcast message type "${type}" is strictly forbidden. Only transactional invoice statements are permitted.`,
      };
    }
  }

  // 2. Check that type is in the allowed transactional list
  if (!ALLOWED_MESSAGE_TYPES.includes(type as WhatsAppMessageType)) {
    return {
      isValid: false,
      error: `Invalid WhatsApp message type: "${type}". Allowed types: ${ALLOWED_MESSAGE_TYPES.join(', ')}`,
    };
  }

  // 3. Check for empty content
  if (!messageText || !messageText.trim()) {
    return {
      isValid: false,
      error: 'WhatsApp message content cannot be empty.',
    };
  }

  return { isValid: true };
}
