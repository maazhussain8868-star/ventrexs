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

export interface FinancialBoundsInput {
  original_amount: number;
  amount_paid: number;
  remaining_balance: number;
}

/**
 * Validates financial figures to guarantee ledger integrity, non-negativity, finite bounds, and consistency.
 * Deterministic and fails closed on any violation.
 */
export function validateFinancialBounds(values: Partial<FinancialBoundsInput>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check original_amount
  if (values.original_amount !== undefined) {
    const val = Number(values.original_amount);
    if (typeof values.original_amount === 'boolean' || isNaN(val) || !Number.isFinite(val)) {
      errors.push('original_amount must be a valid finite number.');
    } else if (val < 0) {
      errors.push('original_amount cannot be negative.');
    } else if (val > 100_000_000) {
      errors.push('original_amount exceeds maximum permissible limit ($100,000,000.00).');
    }
  }

  // Check amount_paid
  if (values.amount_paid !== undefined) {
    const val = Number(values.amount_paid);
    if (typeof values.amount_paid === 'boolean' || isNaN(val) || !Number.isFinite(val)) {
      errors.push('amount_paid must be a valid finite number.');
    } else if (val < 0) {
      errors.push('amount_paid cannot be negative.');
    } else if (val > 100_000_000) {
      errors.push('amount_paid exceeds maximum permissible limit ($100,000,000.00).');
    }
  }

  // Check remaining_balance
  if (values.remaining_balance !== undefined) {
    const val = Number(values.remaining_balance);
    if (typeof values.remaining_balance === 'boolean' || isNaN(val) || !Number.isFinite(val)) {
      errors.push('remaining_balance must be a valid finite number.');
    } else if (val < 0) {
      errors.push('remaining_balance cannot be negative.');
    } else if (val > 100_000_000) {
      errors.push('remaining_balance exceeds maximum permissible limit ($100,000,000.00).');
    }
  }

  // If type/nan/inf/sign errors exist, fail closed immediately
  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const original_amount = Number(values.original_amount);
  const amount_paid = Number(values.amount_paid);
  const remaining_balance = Number(values.remaining_balance);

  // Check paid <= original
  if (
    values.amount_paid !== undefined &&
    values.original_amount !== undefined &&
    amount_paid > original_amount
  ) {
    errors.push(`amount_paid ($${amount_paid}) cannot exceed original_amount ($${original_amount}).`);
  }

  // Check remaining_balance <= original
  if (
    values.remaining_balance !== undefined &&
    values.original_amount !== undefined &&
    remaining_balance > original_amount
  ) {
    errors.push(`remaining_balance ($${remaining_balance}) cannot exceed original_amount ($${original_amount}).`);
  }

  // Check ledger invariant: remaining_balance === original_amount - amount_paid
  if (
    values.original_amount !== undefined &&
    values.amount_paid !== undefined &&
    values.remaining_balance !== undefined
  ) {
    const calculatedRemaining = Number((original_amount - amount_paid).toFixed(2));
    const normalizedRemaining = Number(remaining_balance.toFixed(2));
    if (Math.abs(normalizedRemaining - calculatedRemaining) > 0.001) {
      errors.push(
        `Ledger invariant violation: remaining_balance ($${normalizedRemaining}) must equal original_amount - amount_paid ($${calculatedRemaining}).`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
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
  if (isNaN(confidence) || !Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
    confidence = 0.90;
  }

  // 7. Validate numerical financial bounds if provided in raw AI output
  if (
    raw.original_amount !== undefined ||
    raw.amount_paid !== undefined ||
    raw.remaining_balance !== undefined ||
    raw.amount !== undefined
  ) {
    const boundCheck = validateFinancialBounds({
      original_amount: raw.original_amount,
      amount_paid: raw.amount_paid,
      remaining_balance: raw.remaining_balance ?? raw.amount,
    });
    if (!boundCheck.isValid) {
      errors.push(...boundCheck.errors);
    }
  }

  // 8. Validate expectedBalance if passed
  if (expectedBalance !== undefined) {
    const exp = Number(expectedBalance);
    if (typeof expectedBalance === 'boolean' || isNaN(exp) || !Number.isFinite(exp) || exp < 0) {
      errors.push('expectedBalance must be a valid non-negative finite number.');
    }
  }

  // 9. HALAL-FIRST HARD RULE AUDIT
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
