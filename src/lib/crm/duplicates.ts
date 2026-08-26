import { Customer, Lead } from '@/types';

export interface DuplicateMatch {
  id: string;
  type: 'contact' | 'lead';
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  matchedFields: ('email' | 'phone' | 'name')[];
  confidence: number;
}

export interface DuplicateCheckResult {
  hasDuplicate: boolean;
  matches: DuplicateMatch[];
}

/**
 * Normalizes phone numbers for comparison (extracts trailing 10 digits).
 */
export function normalizePhone(phone?: string | null): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}

/**
 * Normalizes email address for comparison.
 */
export function normalizeEmail(email?: string | null): string {
  if (!email) return '';
  return email.trim().toLowerCase();
}

/**
 * Normalizes company or personal name for comparison.
 */
export function normalizeName(name?: string | null): string {
  if (!name) return '';
  return name.trim().toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, ' ');
}

/**
 * Detects potential duplicate contacts or leads in the system.
 */
export function detectDuplicates(
  target: { id?: string; email?: string; phone?: string; name?: string; company?: string },
  contacts: Customer[] = [],
  leads: Lead[] = []
): DuplicateCheckResult {
  const matches: DuplicateMatch[] = [];
  const targetEmail = normalizeEmail(target.email);
  const targetPhone = normalizePhone(target.phone);
  const targetName = normalizeName(target.name);
  const targetCompany = normalizeName(target.company);

  // 1. Check existing Customers / Contacts
  contacts.forEach((c) => {
    if (target.id && c.id === target.id) return;
    const cEmail = normalizeEmail(c.email);
    const cPhone = normalizePhone(c.phone);
    const cName = normalizeName(c.name);
    const cCompany = normalizeName(c.company);

    const matchedFields: ('email' | 'phone' | 'name')[] = [];
    let confidence = 0;

    if (targetEmail && cEmail && targetEmail === cEmail) {
      matchedFields.push('email');
      confidence += 60;
    }
    if (targetPhone && cPhone && targetPhone === cPhone) {
      matchedFields.push('phone');
      confidence += 60;
    }
    if (
      (targetName && cName && targetName === cName) ||
      (targetCompany && cCompany && targetCompany === cCompany)
    ) {
      matchedFields.push('name');
      confidence += 25;
    }

    if (confidence >= 40) {
      matches.push({
        id: c.id,
        type: 'contact',
        name: c.name,
        company: c.company,
        email: c.email,
        phone: c.phone,
        matchedFields,
        confidence: Math.min(100, confidence),
      });
    }
  });

  // 2. Check existing Leads
  leads.forEach((l) => {
    if (target.id && l.id === target.id) return;
    const lEmail = normalizeEmail(l.email);
    const lPhone = normalizePhone(l.phone);
    const lName = normalizeName(l.name);
    const lCompany = normalizeName(l.company);

    const matchedFields: ('email' | 'phone' | 'name')[] = [];
    let confidence = 0;

    if (targetEmail && lEmail && targetEmail === lEmail) {
      matchedFields.push('email');
      confidence += 60;
    }
    if (targetPhone && lPhone && targetPhone === lPhone) {
      matchedFields.push('phone');
      confidence += 60;
    }
    if (
      (targetName && lName && targetName === lName) ||
      (targetCompany && lCompany && targetCompany === lCompany)
    ) {
      matchedFields.push('name');
      confidence += 25;
    }

    if (confidence >= 40) {
      matches.push({
        id: l.id,
        type: 'lead',
        name: l.name,
        company: l.company,
        email: l.email,
        phone: l.phone,
        matchedFields,
        confidence: Math.min(100, confidence),
      });
    }
  });

  return {
    hasDuplicate: matches.length > 0,
    matches: matches.sort((a, b) => b.confidence - a.confidence),
  };
}
