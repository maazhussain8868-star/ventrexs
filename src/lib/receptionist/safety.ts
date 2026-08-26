/**
 * ==============================================================================
 * PAYPILOT AI — AI RECEPTIONIST SAFETY, PROMPT INJECTION & BOUNDARY GUARD
 * Defensive validation, prompt isolation, financial boundary enforcement
 * ==============================================================================
 */

// Known prompt injection and system override trigger patterns
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /you\s+are\s+now\s+(an?\s+)?unrestricted/i,
  /system\s+override/i,
  /show\s+(me\s+)?(your\s+)?system\s+prompt/i,
  /print\s+(your\s+)?instructions/i,
  /reveal\s+(internal\s+)?(api\s+keys?|passwords?|credentials?)/i,
  /bypass\s+(safety|rules|security)/i,
  /drop\s+table/i,
  /<script[\s\S]*?>[\s\S]*?<\/script>/i,
  /javascript:/i,
  /roleplay\s+as\s+admin/i,
  /pretend\s+you\s+have\s+root\s+access/i,
];

// Financial and administrative mutation patterns forbidden from AI execution
const SENSITIVE_FINANCIAL_PATTERNS = [
  /(set|change|reduce|update)\s+(my\s+)?(invoice\s+)?(balance|total|amount|due)\s+to\s+0/i,
  /(waive|cancel|erase)\s+(my\s+)?(fee|payment|charge|invoice|bill)/i,
  /(give|issue|send)\s+(me\s+)?(a\s+)?(full\s+)?refund/i,
  /change\s+(my\s+)?role\s+to\s+admin/i,
  /delete\s+(the\s+)?business/i,
  /modify\s+subscription\s+plan/i,
  /(give|show|send|tell|reveal)\s+(me\s+)?(another|other|different)\s+customer('s)?\s+(data|info|information|phone|email|address)/i,
];

export interface SafetyCheckResult {
  isSafe: boolean;
  threatType?: 'PROMPT_INJECTION' | 'FINANCIAL_TAMPERING' | 'SENSITIVE_DATA_PROBE' | 'XSS';
  sanitizedInput: string;
  rejectionReply?: string;
}

/**
 * Validates incoming customer input against security policies and prompt injection attempts.
 */
export function validateReceptionistInput(input: string): SafetyCheckResult {
  if (!input || typeof input !== 'string') {
    return {
      isSafe: true,
      sanitizedInput: '',
    };
  }

  // 1. Sanitize XSS tags and control characters
  const sanitized = input
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Strip invisible control characters
    .trim();

  // 2. Check for Prompt Injections / Jailbreak attempts
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      return {
        isSafe: false,
        threatType: 'PROMPT_INJECTION',
        sanitizedInput: sanitized,
        rejectionReply: "I'm sorry, I can only assist with scheduling, service inquiries, and questions about our home-service offerings. How can I help with your home or property today?",
      };
    }
  }

  // 3. Check for Unauthorized Financial/Role mutation attempts
  for (const pattern of SENSITIVE_FINANCIAL_PATTERNS) {
    if (pattern.test(sanitized)) {
      return {
        isSafe: false,
        threatType: 'FINANCIAL_TAMPERING',
        sanitizedInput: sanitized,
        rejectionReply: "For billing questions, payment adjustments, or accounts changes, I will connect you directly with our office manager or billing team.",
      };
    }
  }

  return {
    isSafe: true,
    sanitizedInput: sanitized,
  };
}

/**
 * Checks if a customer's message should trigger an immediate human handoff.
 */
export function checkHandoffTriggers(
  input: string,
  handoffKeywords: string[] = []
): { shouldHandoff: boolean; reason?: string } {
  const lower = input.toLowerCase();

  // Standard emergency terms
  if (
    lower.includes('emergency') || 
    lower.includes('gas leak') || 
    lower.includes('flooding') || 
    lower.includes('smoke') || 
    lower.includes('sparking electrical')
  ) {
    return {
      shouldHandoff: true,
      reason: 'Urgent emergency requiring immediate on-call dispatch',
    };
  }

  // Explicit human agent request
  const explicitHumanPhrases = [
    'speak with a human',
    'talk to a person',
    'speak to an agent',
    'real person',
    'human representative',
    'operator',
    'customer service rep',
    'manager',
    'attorney',
    'lawyer',
    'dispute',
    'complaint',
  ];

  for (const phrase of explicitHumanPhrases) {
    if (lower.includes(phrase)) {
      return {
        shouldHandoff: true,
        reason: 'Customer explicitly requested a human representative',
      };
    }
  }

  // Business-configured custom keywords
  for (const kw of handoffKeywords) {
    if (kw && lower.includes(kw.toLowerCase())) {
      return {
        shouldHandoff: true,
        reason: `Matched custom handoff keyword: "${kw}"`,
      };
    }
  }

  return { shouldHandoff: false };
}
