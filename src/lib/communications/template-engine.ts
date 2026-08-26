import { CommunicationChannel } from '../supabase/types';
import { CommunicationCategory, CommunicationTemplateItem } from './types';

// Built-in System Templates
export const SYSTEM_TEMPLATES: CommunicationTemplateItem[] = [
  // --- EMAIL TEMPLATES ---
  {
    id: 'sys-email-lead-welcome',
    name: 'New Inquiry Acknowledgment',
    channel: 'email',
    category: 'lead_welcome',
    subjectTemplate: 'Thank you for reaching out to {{business_name}}',
    bodyTemplate: 'Hi {{customer_name}},\n\nThank you for contacting {{business_name}} regarding {{service_name}}. We have received your request and our service specialist is reviewing the details.\n\nIf you need immediate assistance, you can reach our office at {{business_phone}}.\n\nWarm regards,\n{{business_name}} Team',
    variables: ['customer_name', 'business_name', 'service_name', 'business_phone'],
    isSystem: true,
  },
  {
    id: 'sys-email-appt-confirm',
    name: 'Appointment Confirmation',
    channel: 'email',
    category: 'appointment_confirmation',
    subjectTemplate: 'Appointment Confirmed: {{service_name}} with {{business_name}}',
    bodyTemplate: 'Dear {{customer_name}},\n\nYour service appointment for {{service_name}} has been confirmed for {{appointment_date}} at {{appointment_time}}.\n\nTechnician: {{technician_name}}\nFor any questions or rescheduling requests, please call us at {{business_phone}}.\n\nSincerely,\n{{business_name}}',
    variables: ['customer_name', 'business_name', 'service_name', 'appointment_date', 'appointment_time', 'technician_name', 'business_phone'],
    isSystem: true,
  },
  {
    id: 'sys-email-appt-reminder',
    name: 'Appointment Reminder (24h Ahead)',
    channel: 'email',
    category: 'appointment_reminder',
    subjectTemplate: 'Reminder: Upcoming Service Appointment Tomorrow',
    bodyTemplate: 'Hi {{customer_name}},\n\nThis is a friendly reminder of your scheduled {{service_name}} appointment tomorrow, {{appointment_date}} at {{appointment_time}}.\n\nOur technician {{technician_name}} will arrive promptly. Please ensure the service area is accessible.\n\nThank you,\n{{business_name}}',
    variables: ['customer_name', 'business_name', 'service_name', 'appointment_date', 'appointment_time', 'technician_name'],
    isSystem: true,
  },
  {
    id: 'sys-email-estimate-notice',
    name: 'Service Estimate Ready',
    channel: 'email',
    category: 'estimate_notification',
    subjectTemplate: 'Your Service Estimate from {{business_name}}',
    bodyTemplate: 'Dear {{customer_name}},\n\nThank you for requesting an estimate for {{service_name}}. Your detailed proposal is prepared and ready for review.\n\nEstimated Total: {{invoice_amount}}\n\nPlease contact us at {{business_phone}} if you have any questions or would like to schedule your service.\n\nBest regards,\n{{business_name}}',
    variables: ['customer_name', 'business_name', 'service_name', 'invoice_amount', 'business_phone'],
    isSystem: true,
  },
  {
    id: 'sys-email-invoice-notice',
    name: 'Invoice Statement & Payment Notice',
    channel: 'email',
    category: 'invoice_notification',
    subjectTemplate: 'Invoice {{invoice_number}} Statement - {{business_name}}',
    bodyTemplate: 'Dear {{customer_name}},\n\nPlease find your statement for Invoice {{invoice_number}} regarding {{service_name}}.\n\nTotal Due: {{invoice_amount}}\nDue Date: {{due_date}}\n\nThank you for your business!\n{{business_name}}',
    variables: ['customer_name', 'business_name', 'invoice_number', 'service_name', 'invoice_amount', 'due_date'],
    isSystem: true,
  },
  {
    id: 'sys-email-payment-confirm',
    name: 'Payment Receipt Confirmation',
    channel: 'email',
    category: 'payment_confirmation',
    subjectTemplate: 'Payment Received: Thank You! ({{invoice_number}})',
    bodyTemplate: 'Hi {{customer_name}},\n\nWe have received your payment of {{payment_amount}} for Invoice {{invoice_number}}. Your account has been credited accordingly.\n\nThank you for choosing {{business_name}}!\n{{business_name}} Accounts',
    variables: ['customer_name', 'business_name', 'invoice_number', 'payment_amount'],
    isSystem: true,
  },
  {
    id: 'sys-email-follow-up',
    name: 'Service Follow-up & Satisfaction Check',
    channel: 'email',
    category: 'follow_up',
    subjectTemplate: 'How was your recent service with {{business_name}}?',
    bodyTemplate: 'Hi {{customer_name}},\n\nWe wanted to follow up on your recent {{service_name}} service completed on {{appointment_date}}. Our goal is 100% customer satisfaction.\n\nIf you have any feedback or further questions, please let us know by replying to this email or calling {{business_phone}}.\n\nBest,\n{{business_name}}',
    variables: ['customer_name', 'business_name', 'service_name', 'appointment_date', 'business_phone'],
    isSystem: true,
  },

  // --- SMS TEMPLATES (Concise & Compliant) ---
  {
    id: 'sys-sms-lead-welcome',
    name: 'SMS Inquiry Acknowledgment',
    channel: 'sms',
    category: 'lead_welcome',
    bodyTemplate: 'Hi {{customer_name}}, thanks for contacting {{business_name}} for {{service_name}}! We are reviewing your request and will reply shortly. Reply STOP to opt out.',
    variables: ['customer_name', 'business_name', 'service_name'],
    isSystem: true,
  },
  {
    id: 'sys-sms-appt-confirm',
    name: 'SMS Appointment Confirmation',
    channel: 'sms',
    category: 'appointment_confirmation',
    bodyTemplate: '{{business_name}}: Your {{service_name}} appointment is confirmed for {{appointment_date}} at {{appointment_time}} with {{technician_name}}. Questions? Call {{business_phone}}. Reply STOP to opt out.',
    variables: ['business_name', 'service_name', 'appointment_date', 'appointment_time', 'technician_name', 'business_phone'],
    isSystem: true,
  },
  {
    id: 'sys-sms-appt-reminder',
    name: 'SMS Appointment Reminder',
    channel: 'sms',
    category: 'appointment_reminder',
    bodyTemplate: 'Reminder from {{business_name}}: Your {{service_name}} service is tomorrow {{appointment_date}} at {{appointment_time}}. Reply STOP to opt out.',
    variables: ['business_name', 'service_name', 'appointment_date', 'appointment_time'],
    isSystem: true,
  },
  {
    id: 'sys-sms-invoice-notice',
    name: 'SMS Invoice Statement',
    channel: 'sms',
    category: 'invoice_notification',
    bodyTemplate: '{{business_name}}: Statement for Inv {{invoice_number}} ({{invoice_amount}}) is due on {{due_date}}. Questions? Call {{business_phone}}. Reply STOP to opt out.',
    variables: ['business_name', 'invoice_number', 'invoice_amount', 'due_date', 'business_phone'],
    isSystem: true,
  },
  {
    id: 'sys-sms-payment-confirm',
    name: 'SMS Payment Confirmation',
    channel: 'sms',
    category: 'payment_confirmation',
    bodyTemplate: '{{business_name}}: Payment of {{payment_amount}} received for Inv {{invoice_number}}. Thank you for your business! Reply STOP to opt out.',
    variables: ['business_name', 'payment_amount', 'invoice_number'],
    isSystem: true,
  },
  {
    id: 'sys-sms-follow-up',
    name: 'SMS Post-Service Follow-up',
    channel: 'sms',
    category: 'follow_up',
    bodyTemplate: 'Hi {{customer_name}}, thank you for choosing {{business_name}} for {{service_name}}! Let us know if you need anything further at {{business_phone}}. Reply STOP to opt out.',
    variables: ['customer_name', 'business_name', 'service_name', 'business_phone'],
    isSystem: true,
  },

  // --- WHATSAPP TEMPLATES (Meta Transactional Compliant) ---
  {
    id: 'sys-wa-appt-confirm',
    name: 'WhatsApp Appointment Confirmation',
    channel: 'whatsapp',
    category: 'appointment_confirmation',
    bodyTemplate: 'Hello {{customer_name}}, your {{service_name}} appointment with {{business_name}} is confirmed for {{appointment_date}} at {{appointment_time}} with technician {{technician_name}}.\n\nReply STOP to unsubscribe.',
    variables: ['customer_name', 'service_name', 'business_name', 'appointment_date', 'appointment_time', 'technician_name'],
    isSystem: true,
  },
  {
    id: 'sys-wa-appt-reminder',
    name: 'WhatsApp Appointment Reminder',
    channel: 'whatsapp',
    category: 'appointment_reminder',
    bodyTemplate: 'Hello {{customer_name}}, this is a reminder of your service appointment tomorrow {{appointment_date}} at {{appointment_time}} with {{business_name}}.\n\nReply STOP to opt out.',
    variables: ['customer_name', 'appointment_date', 'appointment_time', 'business_name'],
    isSystem: true,
  },
  {
    id: 'sys-wa-invoice-notice',
    name: 'WhatsApp Invoice Statement',
    channel: 'whatsapp',
    category: 'invoice_notification',
    bodyTemplate: 'Hello {{customer_name}}, here is your statement for invoice {{invoice_number}} from {{business_name}} for {{invoice_amount}} due on {{due_date}}.\n\nReply STOP to unsubscribe.',
    variables: ['customer_name', 'invoice_number', 'business_name', 'invoice_amount', 'due_date'],
    isSystem: true,
  },
  {
    id: 'sys-wa-payment-confirm',
    name: 'WhatsApp Payment Receipt',
    channel: 'whatsapp',
    category: 'payment_confirmation',
    bodyTemplate: 'Hello {{customer_name}}, your payment of {{payment_amount}} for invoice {{invoice_number}} has been received with thanks by {{business_name}}.\n\nReply STOP to opt out.',
    variables: ['customer_name', 'payment_amount', 'invoice_number', 'business_name'],
    isSystem: true,
  },
  {
    id: 'sys-wa-follow-up',
    name: 'WhatsApp Service Follow-up',
    channel: 'whatsapp',
    category: 'follow_up',
    bodyTemplate: 'Hello {{customer_name}}, thank you for choosing {{business_name}} for your {{service_name}}. If you have any questions, our team is here to assist.\n\nReply STOP to opt out.',
    variables: ['customer_name', 'business_name', 'service_name'],
    isSystem: true,
  },
];

/**
 * Strips dangerous HTML / script tags from variable values and text
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

/**
 * Extracts all variable names {{variable}} from a template string
 */
export function extractVariables(template: string): string[] {
  if (!template) return [];
  const matches = template.match(/\{\{([a-zA-Z0-9_]+)\}\}/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '').trim())));
}

/**
 * Interpolates variables into a template string safely
 */
export function interpolateTemplate(
  template: string,
  variables: Record<string, string | number | boolean | undefined>
): string {
  if (!template) return '';
  return template.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (match, key) => {
    const rawVal = variables[key];
    if (rawVal === undefined || rawVal === null) {
      return match; // Leave unreplaced token if not provided
    }
    return sanitizeInput(String(rawVal));
  });
}

/**
 * Validates whether all required tokens in a template have been supplied
 */
export function validateTemplateVariables(
  template: string,
  variables: Record<string, string | number | boolean | undefined>
): { isValid: boolean; missingVariables: string[] } {
  const needed = extractVariables(template);
  const missing = needed.filter(key => {
    const val = variables[key];
    return val === undefined || val === null || String(val).trim() === '';
  });

  return {
    isValid: missing.length === 0,
    missingVariables: missing,
  };
}

/**
 * Looks up a system or business template by ID or category + channel
 */
export function findTemplate(
  templates: CommunicationTemplateItem[],
  lookup: { id?: string; channel?: CommunicationChannel; category?: CommunicationCategory }
): CommunicationTemplateItem | undefined {
  if (lookup.id) {
    const found = templates.find(t => t.id === lookup.id) || SYSTEM_TEMPLATES.find(t => t.id === lookup.id);
    if (found) return found;
  }

  if (lookup.channel && lookup.category) {
    const custom = templates.find(t => t.channel === lookup.channel && t.category === lookup.category);
    if (custom) return custom;
    return SYSTEM_TEMPLATES.find(t => t.channel === lookup.channel && t.category === lookup.category);
  }

  return undefined;
}
