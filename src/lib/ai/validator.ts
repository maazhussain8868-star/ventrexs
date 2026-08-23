import { AICollectionOutput, AIPriority, AIRecommendedAction, AIMessageTone } from './types';

// Forbidden terms that violate Halal-First and ethical debt collection rules
const FORBIDDEN_FINANCIAL_PATTERNS = [
  /\binterest\b/i,
  /\briba\b/i,
  /\bapr\b/i,
  /\bapy\b/i,
  /\blate\s*fee(s)?\b/i,
  /\blate\s*charge(s)?\b/i,
  /\blate\s*payment\s*interest\b/i,
  /\bpenalt(y|ies)\b/i,
  /\bpenalty\s*fee(s)?\b/i,
  /\bloan(s)?\b/i,
  /\bfinancing\b/i,
  /\bcash\s*advance(s)?\b/i,
  /\bbnpl\b/i,
  /\bbuy\s*now\s*pay\s*later\b/i,
  /\bdebt\s*trad(e|ing)\b/i,
  /\b(buy|sell)\s*(your\s*)?debt\b/i,
  /\bfactor(ing)?\b/i,
  /\blegal\s*action\s*will\s*be\s*taken\s*immediately\b/i,
  /\barrest\b/i,
  /\blawsuit\s*filed\b/i,
  /\bgarnish(ment)?\b/i,
];

export interface ValidationResult {
  isValid: boolean;
  sanitizedOutput?: AICollectionOutput;
  errors: string[];
}

export function validateAICollectionOutput(
  raw: any,
  expectedBalance?: number
): ValidationResult {
  const errors: string[] = [];

  if (!raw || typeof raw !== 'object') {
    return { isValid: false, errors: ['AI output is not a valid JSON object.'] };
  }

  // 1. Validate Priority
  const allowedPriorities: AIPriority[] = ['low', 'medium', 'high'];
  let priority: AIPriority = 'medium';
  if (allowedPriorities.includes(raw.priority)) {
    priority = raw.priority;
  } else {
    errors.push(`Invalid priority: "${raw.priority}". Must be one of: low, medium, high.`);
  }

  // 2. Validate Action
  const allowedActions: AIRecommendedAction[] = ['monitor', 'send_reminder', 'send_followup', 'review_account'];
  let recommended_action: AIRecommendedAction = 'send_reminder';
  if (allowedActions.includes(raw.recommended_action)) {
    recommended_action = raw.recommended_action;
  } else {
    errors.push(`Invalid recommended_action: "${raw.recommended_action}". Must be one of: monitor, send_reminder, send_followup, review_account.`);
  }

  // 3. Validate Tone
  const allowedTones: AIMessageTone[] = ['Gentle Check-in', 'Professional Statement', 'Firm Follow-up'];
  let suggested_tone: AIMessageTone = 'Professional Statement';
  if (allowedTones.includes(raw.suggested_tone)) {
    suggested_tone = raw.suggested_tone;
  } else if (raw.suggested_tone === 'gentle') {
    suggested_tone = 'Gentle Check-in';
  } else if (raw.suggested_tone === 'firm' || raw.suggested_tone === 'urgent') {
    suggested_tone = 'Firm Follow-up';
  } else {
    suggested_tone = 'Professional Statement';
  }

  // 4. Validate Reason
  const reason = typeof raw.reason === 'string' && raw.reason.trim().length > 0
    ? raw.reason.trim()
    : 'Based on invoice due date and historical settlement horizon.';

  // 5. Validate Message Draft
  const message_draft = typeof raw.message_draft === 'string' && raw.message_draft.trim().length > 0
    ? raw.message_draft.trim()
    : '';

  const message_draft_subject = typeof raw.message_draft_subject === 'string'
    ? raw.message_draft_subject.trim()
    : undefined;

  // 6. Validate Confidence
  let confidence = Number(raw.confidence);
  if (isNaN(confidence) || confidence < 0 || confidence > 1) {
    confidence = 0.90;
  }

  // 7. HALAL-FIRST HARD RULE AUDIT
  const combinedText = `${reason} ${message_draft_subject || ''} ${message_draft}`;
  for (const pattern of FORBIDDEN_FINANCIAL_PATTERNS) {
    if (pattern.test(combinedText)) {
      errors.push(`HALAL-FIRST VIOLATION: Output contains forbidden financial pattern: ${pattern}`);
    }
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
    };
  }

  return {
    isValid: true,
    sanitizedOutput: {
      priority,
      recommended_action,
      reason,
      suggested_tone,
      message_draft_subject,
      message_draft,
      confidence,
    },
    errors: [],
  };
}
