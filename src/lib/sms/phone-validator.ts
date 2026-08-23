/**
 * Validates and normalizes phone numbers to standard E.164 international format
 */
export function validateAndNormalizePhoneNumber(rawPhone: string | null | undefined): {
  isValid: boolean;
  normalized?: string;
  error?: string;
} {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return { isValid: false, error: 'Phone number is required.' };
  }

  const trimmed = rawPhone.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Phone number cannot be empty.' };
  }

  // Remove whitespace, dashes, parentheses, dots
  const cleaned = trimmed.replace(/[\s\-\(\)\.]/g, '');

  // Check E.164 regex (+ followed by 10 to 15 digits)
  const e164Regex = /^\+[1-9]\d{9,14}$/;
  if (e164Regex.test(cleaned)) {
    return { isValid: true, normalized: cleaned };
  }

  // If 10 digits without prefix (e.g. 5551234567), format as North American +1
  const tenDigitRegex = /^[2-9]\d{9}$/;
  if (tenDigitRegex.test(cleaned)) {
    return { isValid: true, normalized: `+1${cleaned}` };
  }

  // If 11 digits starting with 1 (e.g. 15551234567)
  const elevenDigitRegex = /^1[2-9]\d{9}$/;
  if (elevenDigitRegex.test(cleaned)) {
    return { isValid: true, normalized: `+${cleaned}` };
  }

  return {
    isValid: false,
    error: `Invalid phone number format: "${rawPhone}". Must be a valid 10-digit or E.164 phone number.`,
  };
}
