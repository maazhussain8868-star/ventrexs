/**
 * ==============================================================================
 * PAYPILOT AI — AI RECEPTIONIST SUPABASE SERVICE
 * Multi-tenant settings, services catalog, conversations and message persistence
 * ==============================================================================
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types';
import {
  ReceptionistSettings,
  ReceptionistService,
  ReceptionistConversation,
  ReceptionistMessage,
  ConversationState,
  ReceptionistIntent,
} from '@/types';

export class ReceptionistBackendService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Retrieves receptionist settings for a business (or returns defaults).
   */
  async getSettings(businessId: string): Promise<ReceptionistSettings> {
    const { data, error } = await this.supabase
      .from('receptionist_settings')
      .select('*')
      .eq('business_id', businessId)
      .maybeSingle();

    if (error) {
      console.error('[ReceptionistService.getSettings] Error:', error.message);
    }

    if (data) {
      return {
        id: data.id,
        businessId: data.business_id,
        enabled: data.enabled,
        greeting: data.greeting,
        businessDescription: data.business_description,
        tone: data.tone as any,
        languages: (data.languages as string[]) || ['en'],
        afterHoursMessage: data.after_hours_message,
        emergencyInstructions: data.emergency_instructions,
        bookingEnabled: data.booking_enabled,
        bookingLeadTimeHours: data.booking_lead_time_hours,
        bookingMaxDaysAhead: data.booking_max_days_ahead,
        humanHandoffKeywords: (data.human_handoff_keywords as string[]) || [],
        faqs: (data.faqs as any[]) || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }

    // Default configuration
    return {
      id: `settings-${businessId}`,
      businessId,
      enabled: true,
      greeting: 'Hi! Thanks for contacting us. How can our team help with your home or property today?',
      businessDescription: 'Professional home service contractor providing repairs, installation, and maintenance.',
      tone: 'professional',
      languages: ['en'],
      afterHoursMessage: 'We are currently outside regular business hours. For urgent emergencies, our on-call team will be alerted immediately.',
      emergencyInstructions: 'Flag critical gas leaks, flooding, or safety hazards for immediate dispatch.',
      bookingEnabled: true,
      bookingLeadTimeHours: 2,
      bookingMaxDaysAhead: 14,
      humanHandoffKeywords: ['human', 'agent', 'person', 'manager', 'dispute', 'lawyer', 'complaint'],
      faqs: [
        {
          question: 'Are you licensed and insured?',
          answer: 'Yes, all our technicians are fully licensed, bonded, and insured.',
        },
        {
          question: 'Do you offer free estimates?',
          answer: 'Yes! We provide upfront estimates on major replacements and standard diagnostic rates for repairs.',
        }
      ],
    };
  }

  /**
   * Updates receptionist settings for a business.
   */
  async updateSettings(
    businessId: string,
    updates: Partial<ReceptionistSettings>
  ): Promise<ReceptionistSettings> {
    const payload = {
      business_id: businessId,
      enabled: updates.enabled !== undefined ? updates.enabled : true,
      greeting: updates.greeting || 'Hi! How can we help you today?',
      business_description: updates.businessDescription || '',
      tone: updates.tone || 'professional',
      languages: updates.languages || ['en'],
      after_hours_message: updates.afterHoursMessage || '',
      emergency_instructions: updates.emergencyInstructions || '',
      booking_enabled: updates.bookingEnabled !== undefined ? updates.bookingEnabled : true,
      booking_lead_time_hours: updates.bookingLeadTimeHours || 2,
      booking_max_days_ahead: updates.bookingMaxDaysAhead || 14,
      human_handoff_keywords: updates.humanHandoffKeywords || [],
      faqs: (updates.faqs as any) || [],
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('receptionist_settings')
      .upsert(payload as any, { onConflict: 'business_id' })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update receptionist settings: ${error.message}`);
    }

    return {
      id: data.id,
      businessId: data.business_id,
      enabled: data.enabled,
      greeting: data.greeting,
      businessDescription: data.business_description,
      tone: data.tone as any,
      languages: (data.languages as string[]) || ['en'],
      afterHoursMessage: data.after_hours_message,
      emergencyInstructions: data.emergency_instructions,
      bookingEnabled: data.booking_enabled,
      bookingLeadTimeHours: data.booking_lead_time_hours,
      bookingMaxDaysAhead: data.booking_max_days_ahead,
      humanHandoffKeywords: (data.human_handoff_keywords as string[]) || [],
      faqs: (data.faqs as any[]) || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Gets service knowledge catalog for a business.
   */
  async getServices(businessId: string): Promise<ReceptionistService[]> {
    const { data, error } = await this.supabase
      .from('receptionist_services')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[ReceptionistService.getServices] Error:', error.message);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      businessId: row.business_id,
      name: row.name,
      category: row.category,
      description: row.description,
      typicalDurationMinutes: row.typical_duration_minutes,
      emergencyAvailable: row.emergency_available,
      bookingEligible: row.booking_eligible,
      basePrice: Number(row.base_price) || 0,
      qualificationQuestions: (row.qualification_questions as string[]) || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  /**
   * Creates or updates a service knowledge item.
   */
  async saveService(
    businessId: string,
    service: Partial<ReceptionistService>
  ): Promise<ReceptionistService> {
    const payload = {
      business_id: businessId,
      name: service.name || 'General Service',
      category: service.category || 'General',
      description: service.description || '',
      typical_duration_minutes: service.typicalDurationMinutes || 60,
      emergency_available: !!service.emergencyAvailable,
      booking_eligible: service.bookingEligible !== undefined ? service.bookingEligible : true,
      base_price: service.basePrice || 0,
      qualification_questions: service.qualificationQuestions || [],
      updated_at: new Date().toISOString(),
    };

    if (service.id && !service.id.startsWith('temp-')) {
      const { data, error } = await this.supabase
        .from('receptionist_services')
        .update(payload)
        .eq('id', service.id)
        .eq('business_id', businessId)
        .select('*')
        .single();

      if (error) throw new Error(error.message);
      return {
        id: data.id,
        businessId: data.business_id,
        name: data.name,
        category: data.category,
        description: data.description,
        typicalDurationMinutes: data.typical_duration_minutes,
        emergencyAvailable: data.emergency_available,
        bookingEligible: data.booking_eligible,
        basePrice: Number(data.base_price) || 0,
        qualificationQuestions: (data.qualification_questions as string[]) || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }

    const { data, error } = await this.supabase
      .from('receptionist_services')
      .insert({ ...payload, created_at: new Date().toISOString() })
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return {
      id: data.id,
      businessId: data.business_id,
      name: data.name,
      category: data.category,
      description: data.description,
      typicalDurationMinutes: data.typical_duration_minutes,
      emergencyAvailable: data.emergency_available,
      bookingEligible: data.booking_eligible,
      basePrice: Number(data.base_price) || 0,
      qualificationQuestions: (data.qualification_questions as string[]) || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Deletes a service knowledge item.
   */
  async deleteService(businessId: string, serviceId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('receptionist_services')
      .delete()
      .eq('id', serviceId)
      .eq('business_id', businessId);

    if (error) throw new Error(error.message);
    return true;
  }

  /**
   * Lists conversations for a business.
   */
  async getConversations(businessId: string): Promise<ReceptionistConversation[]> {
    const { data, error } = await this.supabase
      .from('receptionist_conversations')
      .select('*, receptionist_messages(*)')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[ReceptionistService.getConversations] Error:', error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      businessId: row.business_id,
      customerId: row.customer_id || undefined,
      leadId: row.lead_id || undefined,
      appointmentId: row.appointment_id || undefined,
      channel: row.channel,
      state: row.state as ConversationState,
      detectedIntent: row.detected_intent as ReceptionistIntent,
      intentConfidence: Number(row.intent_confidence) || 0,
      customerName: row.customer_name || undefined,
      customerPhone: row.customer_phone || undefined,
      customerEmail: row.customer_email || undefined,
      customerAddress: row.customer_address || undefined,
      serviceRequested: row.service_requested || undefined,
      urgency: row.urgency as any,
      handoffRequired: row.handoff_required,
      handoffReason: row.handoff_reason || undefined,
      metadata: (row.metadata as Record<string, any>) || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      messages: (row.receptionist_messages || []).map((m: any) => ({
        id: m.id,
        businessId: m.business_id,
        conversationId: m.conversation_id,
        senderType: m.sender_type,
        content: m.content,
        structuredPayload: (m.structured_payload as Record<string, any>) || undefined,
        createdAt: m.created_at,
      })),
    }));
  }

  /**
   * Creates a new conversation.
   */
  async createConversation(
    businessId: string,
    conv: Partial<ReceptionistConversation>
  ): Promise<ReceptionistConversation> {
    const payload = {
      business_id: businessId,
      customer_id: conv.customerId || null,
      lead_id: conv.leadId || null,
      appointment_id: conv.appointmentId || null,
      channel: conv.channel || 'WEB_CHAT',
      state: conv.state || 'NEW',
      detected_intent: conv.detectedIntent || 'UNKNOWN',
      intent_confidence: conv.intentConfidence || 0.5,
      customer_name: conv.customerName || null,
      customer_phone: conv.customerPhone || null,
      customer_email: conv.customerEmail || null,
      customer_address: conv.customerAddress || null,
      service_requested: conv.serviceRequested || null,
      urgency: conv.urgency || 'medium',
      handoff_required: !!conv.handoffRequired,
      handoff_reason: conv.handoffReason || null,
      metadata: conv.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('receptionist_conversations')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      businessId: data.business_id,
      customerId: data.customer_id || undefined,
      leadId: data.lead_id || undefined,
      appointmentId: data.appointment_id || undefined,
      channel: data.channel as any,
      state: data.state as ConversationState,
      detectedIntent: data.detected_intent as ReceptionistIntent,
      intentConfidence: Number(data.intent_confidence) || 0,
      customerName: data.customer_name || undefined,
      customerPhone: data.customer_phone || undefined,
      customerEmail: data.customer_email || undefined,
      customerAddress: data.customer_address || undefined,
      serviceRequested: data.service_requested || undefined,
      urgency: data.urgency as any,
      handoffRequired: data.handoff_required,
      handoffReason: data.handoff_reason || undefined,
      metadata: (data.metadata as Record<string, any>) || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      messages: [],
    };
  }

  /**
   * Adds a message to a conversation.
   */
  async addMessage(
    businessId: string,
    conversationId: string,
    senderType: 'CUSTOMER' | 'AI' | 'HUMAN_AGENT' | 'SYSTEM',
    content: string,
    structuredPayload: Record<string, any> = {}
  ): Promise<ReceptionistMessage> {
    const { data, error } = await this.supabase
      .from('receptionist_messages')
      .insert({
        business_id: businessId,
        conversation_id: conversationId,
        sender_type: senderType,
        content,
        structured_payload: structuredPayload as any,
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      businessId: data.business_id,
      conversationId: data.conversation_id,
      senderType: data.sender_type as any,
      content: data.content,
      structuredPayload: (data.structured_payload as Record<string, any>) || undefined,
      createdAt: data.created_at,
    };
  }

  /**
   * Updates conversation state.
   */
  async updateConversationState(
    businessId: string,
    conversationId: string,
    updates: Partial<ReceptionistConversation>
  ): Promise<boolean> {
    const payload: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.state) payload.state = updates.state;
    if (updates.detectedIntent) payload.detected_intent = updates.detectedIntent;
    if (updates.intentConfidence !== undefined) payload.intent_confidence = updates.intentConfidence;
    if (updates.customerName !== undefined) payload.customer_name = updates.customerName;
    if (updates.customerPhone !== undefined) payload.customer_phone = updates.customerPhone;
    if (updates.customerEmail !== undefined) payload.customer_email = updates.customerEmail;
    if (updates.customerAddress !== undefined) payload.customer_address = updates.customerAddress;
    if (updates.serviceRequested !== undefined) payload.service_requested = updates.serviceRequested;
    if (updates.urgency) payload.urgency = updates.urgency;
    if (updates.handoffRequired !== undefined) payload.handoff_required = updates.handoffRequired;
    if (updates.handoffReason !== undefined) payload.handoff_reason = updates.handoffReason;
    if (updates.leadId !== undefined) payload.lead_id = updates.leadId;
    if (updates.customerId !== undefined) payload.customer_id = updates.customerId;
    if (updates.appointmentId !== undefined) payload.appointment_id = updates.appointmentId;

    const { error } = await this.supabase
      .from('receptionist_conversations')
      .update(payload)
      .eq('id', conversationId)
      .eq('business_id', businessId);

    if (error) throw new Error(error.message);
    return true;
  }
}
