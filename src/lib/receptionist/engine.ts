/**
 * ==============================================================================
 * PAYPILOT AI — AI RECEPTIONIST CONVERSATION ENGINE
 * Channel-Agnostic Intent Detection, Information Extraction, State Progression
 * ==============================================================================
 */

import {
  ReceptionistConversation,
  ReceptionistSettings,
  ReceptionistService,
  ReceptionistIntent,
  ConversationState,
  StructuredReceptionistResponse,
  ExtractedCustomerInfo,
  Appointment,
} from '@/types';
import { validateReceptionistInput, checkHandoffTriggers } from './safety';
import { generateAvailableSlots, validateProposedAppointment } from './booking-validator';

export interface ProcessMessageParams {
  conversation: Partial<ReceptionistConversation>;
  incomingMessage: string;
  settings?: ReceptionistSettings;
  services?: ReceptionistService[];
  existingAppointments?: Appointment[];
}

/**
 * Extracts phone numbers from text.
 */
function extractPhone(text: string): string | undefined {
  const match = text.match(/(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/);
  return match ? match[0].trim() : undefined;
}

/**
 * Extracts email addresses from text.
 */
function extractEmail(text: string): string | undefined {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0].trim().toLowerCase() : undefined;
}

/**
 * Extracts customer name if introduced (e.g. "My name is John Doe", "I'm Sarah").
 */
function extractName(text: string): string | undefined {
  const namePatterns = [
    /(?:my name is|i am|i'm|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /name:\s*([A-Za-z\s]+)/i,
  ];

  for (const p of namePatterns) {
    const match = text.match(p);
    if (match && match[1]) {
      const candidate = match[1].trim();
      if (candidate.length > 2 && candidate.length < 40) {
        return candidate;
      }
    }
  }
  return undefined;
}

/**
 * Extracts address / zip code if present.
 */
function extractAddress(text: string): string | undefined {
  const match = text.match(/\b\d{1,5}\s+([A-Za-z0-9\s.,]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Court|Ct|Way|Drive|Circle|Cir))\b/i);
  if (match) return match[0].trim();

  const zipMatch = text.match(/\b\d{5}(?:-\d{4})?\b/);
  if (zipMatch) return `Zip code: ${zipMatch[0]}`;

  return undefined;
}

/**
 * Detects the core intent from message text.
 */
export function detectIntent(text: string): { intent: ReceptionistIntent; confidence: number } {
  const lower = text.toLowerCase();

  // 1. Emergency
  if (
    lower.includes('emergency') || 
    lower.includes('gas leak') || 
    lower.includes('flooding') || 
    lower.includes('smoke') || 
    lower.includes('pipe burst') || 
    lower.includes('no heat in freezing')
  ) {
    return { intent: 'EMERGENCY', confidence: 0.95 };
  }

  // 2. Human Request
  if (
    lower.includes('human') || 
    lower.includes('agent') || 
    lower.includes('person') || 
    lower.includes('manager') || 
    lower.includes('representative')
  ) {
    return { intent: 'HUMAN_REQUEST', confidence: 0.92 };
  }

  // 3. Billing & Invoices
  if (lower.includes('invoice') || lower.includes('bill') || lower.includes('charge')) {
    return { intent: 'INVOICE_QUESTION', confidence: 0.88 };
  }
  if (lower.includes('pay') || lower.includes('credit card') || lower.includes('payment receipt')) {
    return { intent: 'PAYMENT_QUESTION', confidence: 0.85 };
  }

  // 4. Booking & Appointments
  if (
    lower.includes('schedule') || 
    lower.includes('book') || 
    lower.includes('appointment') || 
    lower.includes('time slot') || 
    lower.includes('technician visit') ||
    lower.includes('come over') ||
    lower.includes('send someone') ||
    lower.includes('send a technician') ||
    lower.includes('send tech')
  ) {
    return { intent: 'BOOK_APPOINTMENT', confidence: 0.90 };
  }
  if (lower.includes('reschedule') || lower.includes('move appointment') || lower.includes('change date')) {
    return { intent: 'RESCHEDULE', confidence: 0.88 };
  }
  if (lower.includes('cancel')) {
    return { intent: 'CANCEL', confidence: 0.88 };
  }

  // 5. Price Inquiry
  if (
    lower.includes('how much') || 
    lower.includes('price') || 
    lower.includes('cost') || 
    lower.includes('estimate') || 
    lower.includes('quote') || 
    lower.includes('rates') ||
    lower.includes('fee')
  ) {
    return { intent: 'PRICE_INQUIRY', confidence: 0.86 };
  }

  // 6. Service Inquiries
  if (
    lower.includes('repair') || 
    lower.includes('replace') || 
    lower.includes('fix') || 
    lower.includes('install') || 
    lower.includes('maintenance') || 
    lower.includes('diagnostic') ||
    lower.includes('inspection') ||
    lower.includes('tune-up') ||
    lower.includes('service') || 
    lower.includes('hvac') || 
    lower.includes('roof') || 
    lower.includes('plumb') || 
    lower.includes('electrical') ||
    lower.includes('leak') ||
    lower.includes('door') ||
    lower.includes('pest')
  ) {
    return { intent: 'SERVICE_INQUIRY', confidence: 0.85 };
  }

  return { intent: 'GENERAL_QUESTION', confidence: 0.65 };
}

/**
 * Identifies which service matches the text from the business service catalog.
 */
function matchService(
  text: string,
  services: ReceptionistService[] = []
): ReceptionistService | undefined {
  const lower = text.toLowerCase();
  for (const s of services) {
    const sName = s.name.toLowerCase();
    if (lower.includes(sName)) {
      return s;
    }
    // Check main title before '&' or '/'
    const mainTitle = sName.split(/[&/]/)[0].trim();
    if (mainTitle.length > 3 && lower.includes(mainTitle)) {
      return s;
    }
    // Check keywords in service name
    const words = sName.split(/\s+/).filter(w => w.length > 3 && !['and', 'with', 'the', 'for'].includes(w));
    if (words.length > 0 && words.every(w => lower.includes(w))) {
      return s;
    }
  }
  return undefined;
}

/**
 * Main AI Receptionist conversation processing engine.
 */
export function processReceptionistMessage(
  params: ProcessMessageParams
): StructuredReceptionistResponse {
  const {
    conversation,
    incomingMessage,
    settings,
    services = [],
    existingAppointments = [],
  } = params;

  // 1. Defensive Safety & Prompt Injection Check
  const safety = validateReceptionistInput(incomingMessage);
  if (!safety.isSafe) {
    return {
      replyText: safety.rejectionReply || "I can only assist with service questions and scheduling. How can I help you today?",
      state: conversation.state || 'NEW',
      detectedIntent: 'GENERAL_QUESTION',
      confidence: 0.5,
      extractedInfo: {},
      requestedAction: 'NONE',
    };
  }

  const cleanText = safety.sanitizedInput;

  // 2. Check Human Handoff Triggers
  const handoff = checkHandoffTriggers(cleanText, settings?.humanHandoffKeywords || []);
  if (handoff.shouldHandoff) {
    return {
      replyText: "I've flagged your request for our team. An authorized representative or on-call specialist has been notified and will contact you directly.",
      state: 'HANDOFF_REQUIRED',
      detectedIntent: 'HUMAN_REQUEST',
      confidence: 0.95,
      extractedInfo: {
        notes: handoff.reason,
      },
      requestedAction: 'TRIGGER_HANDOFF',
      handoffReason: handoff.reason,
    };
  }

  // 3. Detect Intent
  const { intent, confidence } = detectIntent(cleanText);

  // 4. Extract Customer Information
  const extractedInfo: ExtractedCustomerInfo = {
    name: extractName(cleanText) || conversation.customerName,
    phone: extractPhone(cleanText) || conversation.customerPhone,
    email: extractEmail(cleanText) || conversation.customerEmail,
    address: extractAddress(cleanText) || conversation.customerAddress,
    serviceRequested: conversation.serviceRequested,
    urgency: intent === 'EMERGENCY' ? 'urgent' : conversation.urgency || 'medium',
  };

  // Match service from catalog
  const matchedSvc = matchService(cleanText, services);
  if (matchedSvc) {
    extractedInfo.serviceRequested = matchedSvc.name;
  }

  // 5. Check FAQ Knowledge Base (only when intent is GENERAL_QUESTION or PRICE_INQUIRY and no contact given)
  if (settings?.faqs && settings.faqs.length > 0 && !extractedInfo.name && !extractedInfo.phone) {
    const lower = cleanText.toLowerCase();
    const matchedFaq = settings.faqs.find((f) => {
      const qWords = f.question.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const matches = qWords.filter(w => lower.includes(w));
      return matches.length >= 2 || (qWords.length === 1 && matches.length === 1);
    });

    if (matchedFaq && (intent === 'GENERAL_QUESTION' || intent === 'PRICE_INQUIRY')) {
      return {
        replyText: `${matchedFaq.answer} Is there a service or appointment we can help you schedule?`,
        state: conversation.state || 'COLLECTING_INFO',
        detectedIntent: intent,
        confidence: 0.85,
        extractedInfo,
        requestedAction: 'NONE',
      };
    }
  }

  // 6. State Machine & Response Construction
  let nextState: ConversationState = conversation.state || 'NEW';
  let replyText = '';
  let requestedAction: 'NONE' | 'CREATE_LEAD' | 'BOOK_APPOINTMENT' | 'TRIGGER_HANDOFF' = 'NONE';
  let suggestedSlots: string[] = [];

  // Generate real availability windows
  const availableSlotGroups = generateAvailableSlots({
    existingAppointments,
    leadTimeHours: settings?.bookingLeadTimeHours || 2,
    maxDaysAhead: settings?.bookingMaxDaysAhead || 7,
    serviceDurationMinutes: matchedSvc?.typicalDurationMinutes || 60,
  });

  const slotSummary = availableSlotGroups
    .slice(0, 2)
    .map(g => `${g.date}: ${g.slots.join(', ')}`)
    .join(' | ');

  // Progression logic
  if (intent === 'EMERGENCY') {
    nextState = 'HANDOFF_REQUIRED';
    requestedAction = 'TRIGGER_HANDOFF';
    replyText = `Understood. For urgent situations, our on-call technician is being alerted immediately. ${
      extractedInfo.phone ? `We will call you at ${extractedInfo.phone}.` : 'Please provide the best callback phone number so our team can reach you in minutes.'
    }`;
  } else if (intent === 'INVOICE_QUESTION' || intent === 'PAYMENT_QUESTION') {
    nextState = 'COLLECTING_INFO';
    replyText = "For questions about past invoices or balance receipts, I can connect you with our accounts desk. May I have your name and invoice or account number?";
  } else if (!extractedInfo.serviceRequested) {
    nextState = 'COLLECTING_INFO';
    const popularServices = services.slice(0, 3).map(s => s.name).join(', ');
    replyText = `Thanks for contacting us! We specialize in ${popularServices || 'commercial and residential services'}. What type of service or repair are you looking for today?`;
  } else if (!extractedInfo.name || (!extractedInfo.phone && !extractedInfo.email)) {
    nextState = 'QUALIFYING';
    requestedAction = 'CREATE_LEAD';
    replyText = `We would be glad to help with your ${extractedInfo.serviceRequested}! To get this organized with our technicians, what is your full name and the best phone number or email to reach you?`;
  } else {
    // We have service and contact information!
    nextState = 'READY_TO_BOOK';
    requestedAction = 'CREATE_LEAD';

    if (slotSummary) {
      suggestedSlots = availableSlotGroups.flatMap(g => g.slots);
      replyText = `Great, ${extractedInfo.name}! I have your details for ${extractedInfo.serviceRequested}. We have technician availability upcoming: ${slotSummary}. Would one of these times work best for you, or do you have a preferred morning/afternoon window?`;
    } else {
      replyText = `Thank you, ${extractedInfo.name}! I've recorded your inquiry for ${extractedInfo.serviceRequested}. Our team will review our schedule and contact you at ${extractedInfo.phone || extractedInfo.email} with confirmed time slots.`;
    }
  }

  return {
    replyText,
    state: nextState,
    detectedIntent: intent,
    confidence,
    extractedInfo,
    requestedAction,
    suggestedSlots,
  };
}
