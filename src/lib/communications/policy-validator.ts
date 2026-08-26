import { validateAICollectionOutput } from '../ai/validator';

export interface PolicyValidationParams {
  subject?: string;
  message: string;
  remainingBalance?: number;
  isInvoiceCommunication?: boolean;
}

export interface PolicyValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedMessage: string;
  sanitizedSubject?: string;
}

// Prohibited financial debt modification terms
const FORBIDDEN_TERMS = [
  'interest charge',
  'compound interest',
  'penalty fee',
  'late payment penalty',
  'debt sale',
  'debt collection agency',
  'lawsuit threat',
  'seize assets',
  'wage garnishment',
  'loan refinancing',
];

export function validateCommunicationPolicy(params: PolicyValidationParams): PolicyValidationResult {
  const errors: string[] = [];
  const fullText = `${params.subject || ''} ${params.message}`.toLowerCase();

  // 1. Check for forbidden predatory financial or debt trading terms
  for (const term of FORBIDDEN_TERMS) {
    if (fullText.includes(term)) {
      errors.push(`Prohibited financial terminology detected: "${term}". Ventrexs AI operates on transparent, ethical communication standards.`);
    }
  }

  // 2. Zero / Negative Balance collection prevention
  if (params.isInvoiceCommunication && params.remainingBalance !== undefined && params.remainingBalance <= 0) {
    errors.push('Cannot send payment reminder or collection communication for an invoice with zero or negative remaining balance.');
  }

  // 3. Delegate to core AI Copilot validator for holistic checks
  const copilotValidation = validateAICollectionOutput({
    priority: 'medium',
    recommended_action: 'send_reminder',
    reason: 'Policy check',
    suggested_tone: 'Professional Statement',
    message_draft_subject: params.subject,
    message_draft: params.message,
    confidence: 0.95,
  });

  if (!copilotValidation.isValid) {
    errors.push(...copilotValidation.errors);
  }

  // 4. Sanitize script / dangerous HTML tags
  const sanitizedSubject = params.subject
    ? params.subject.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim()
    : undefined;

  const sanitizedMessage = params.message
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .trim();

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedSubject,
    sanitizedMessage,
  };
}
