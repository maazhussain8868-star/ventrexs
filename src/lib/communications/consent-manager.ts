import { SupabaseClient } from '@supabase/supabase-js';
import { Database, CommunicationChannel } from '../supabase/types';
import { CommunicationConsentRecord } from './types';

// Standard opt-out keywords (TCPA / CTIA / Meta guidelines)
export const GLOBAL_OPT_OUT_KEYWORDS = [
  'STOP',
  'UNSUBSCRIBE',
  'CANCEL',
  'QUIT',
  'END',
  'OPTOUT',
  'OPT OUT',
  'STOPALL',
  'REVOKE',
];

export interface ConsentCheckTarget {
  channel: CommunicationChannel;
  optedIn?: boolean;
  optedOut?: boolean;
  optedOutAt?: string | null;
  optOutReason?: string | null;
  isOperationalTransactional?: boolean;
}

export class ConsentManager {
  constructor(private client?: SupabaseClient<Database>) {}

  /**
   * Checks if an incoming message string is an explicit opt-out command
   */
  static isOptOutMessage(message: string): boolean {
    if (!message) return false;
    const clean = message.trim().toUpperCase();
    return GLOBAL_OPT_OUT_KEYWORDS.includes(clean);
  }

  /**
   * Synchronously verifies consent and opt-out rules for any channel
   */
  static verifyConsent(target: ConsentCheckTarget): {
    canSend: boolean;
    reason?: string;
  } {
    const channelLabel = target.channel.toUpperCase();

    // 1. Explicit opt-out check (Highest priority: applies to ALL channels including email)
    if (target.optedOut) {
      return {
        canSend: false,
        reason: `COMPLIANCE OPT-OUT: Recipient opted out of ${channelLabel} communications on ${target.optedOutAt || 'earlier'} (${target.optOutReason || 'STOP/Unsubscribe request'}). Sending is blocked.`,
      };
    }

    // 2. Strict Affirmative Opt-In Check for SMS and WhatsApp
    if (target.channel === 'sms' || target.channel === 'whatsapp') {
      if (!target.optedIn) {
        return {
          canSend: false,
          reason: `CONSENT REQUIRED: Recipient has not provided affirmative opt-in consent for ${channelLabel} messaging.`,
        };
      }
    }

    // 3. Email Check: If marketing/automated outreach, affirmative opt-in or valid customer status required
    if (target.channel === 'email' && !target.isOperationalTransactional && !target.optedIn) {
      return {
        canSend: false,
        reason: 'CONSENT REQUIRED: Recipient has not opted in for automated email communications.',
      };
    }

    return { canSend: true };
  }

  /**
   * Records affirmative consent for a customer or lead across a specific channel
   */
  async recordConsent(params: {
    businessId: string;
    customerId?: string;
    leadId?: string;
    channel: CommunicationChannel;
    source?: string;
  }): Promise<{ success: boolean; consentId?: string }> {
    const timestamp = new Date().toISOString();
    const source = params.source || 'PORTAL_OPTIN';

    if (this.client) {
      // 1. Insert or update communication_consents table
      const { data, error } = await this.client
        .from('communication_consents')
        .upsert(
          {
            business_id: params.businessId,
            customer_id: params.customerId || null,
            lead_id: params.leadId || null,
            channel: params.channel,
            opted_in: true,
            consent_source: source,
            consent_at: timestamp,
            opted_out: false,
            opted_out_at: null,
            opt_out_reason: null,
            updated_at: timestamp,
          },
          { onConflict: 'business_id,customer_id,channel' }
        )
        .select()
        .single();

      if (error) {
        // Fallback standard insert if conflict constraint is different
        await this.client.from('communication_consents').insert({
          business_id: params.businessId,
          customer_id: params.customerId || null,
          lead_id: params.leadId || null,
          channel: params.channel,
          opted_in: true,
          consent_source: source,
          consent_at: timestamp,
          opted_out: false,
        });
      }

      // 2. Mirror into customers table for backward compatibility
      if (params.customerId) {
        if (params.channel === 'sms') {
          await this.client
            .from('customers')
            .update({
              sms_consent: true,
              sms_consent_at: timestamp,
              sms_consent_source: source,
              sms_opted_out: false,
              sms_opted_out_at: null,
              sms_opt_out_reason: null,
            })
            .eq('id', params.customerId);
        } else if (params.channel === 'whatsapp') {
          await this.client
            .from('customers')
            .update({
              whatsapp_consent: true,
              whatsapp_consent_at: timestamp,
              whatsapp_consent_source: source,
              whatsapp_opted_out: false,
              whatsapp_opted_out_at: null,
              whatsapp_opt_out_reason: null,
            })
            .eq('id', params.customerId);
        }
      }

      // 3. Audit log
      await this.client.from('audit_logs').insert({
        business_id: params.businessId,
        action: 'COMMUNICATION_CONSENT_RECORDED',
        entity: params.customerId ? 'customer' : 'lead',
        entity_id: params.customerId || params.leadId || 'unknown',
        metadata: { channel: params.channel, source, timestamp },
      });
    }

    return { success: true };
  }

  /**
   * Records a global or channel-specific opt-out request
   */
  async recordOptOut(params: {
    businessId: string;
    customerId?: string;
    leadId?: string;
    channel: CommunicationChannel;
    reason?: string;
  }): Promise<{ success: boolean }> {
    const timestamp = new Date().toISOString();
    const reason = params.reason || 'STOP_REQUEST';

    if (this.client) {
      // 1. Update communication_consents table
      await this.client.from('communication_consents').insert({
        business_id: params.businessId,
        customer_id: params.customerId || null,
        lead_id: params.leadId || null,
        channel: params.channel,
        opted_in: false,
        opted_out: true,
        opted_out_at: timestamp,
        opt_out_reason: reason,
      });

      // 2. Mirror into customers table
      if (params.customerId) {
        if (params.channel === 'sms') {
          await this.client
            .from('customers')
            .update({
              sms_opted_out: true,
              sms_opted_out_at: timestamp,
              sms_opt_out_reason: reason,
              sms_consent: false,
            })
            .eq('id', params.customerId);
        } else if (params.channel === 'whatsapp') {
          await this.client
            .from('customers')
            .update({
              whatsapp_opted_out: true,
              whatsapp_opted_out_at: timestamp,
              whatsapp_opt_out_reason: reason,
              whatsapp_consent: false,
            })
            .eq('id', params.customerId);
        }
      }

      // 3. Add CRM Lead Activity if related to a lead
      if (params.leadId) {
        await this.client.from('lead_activities').insert({
          business_id: params.businessId,
          lead_id: params.leadId,
          activity_type: 'sms',
          title: `Opt-out Recorded (${params.channel.toUpperCase()})`,
          description: `Customer submitted opt-out: "${reason}". Automated outbound messaging halted.`,
          metadata: { channel: params.channel, reason, timestamp },
        });
      }

      // 4. Audit Log
      await this.client.from('audit_logs').insert({
        business_id: params.businessId,
        action: 'COMMUNICATION_OPT_OUT_RECORDED',
        entity: params.customerId ? 'customer' : 'lead',
        entity_id: params.customerId || params.leadId || 'unknown',
        metadata: { channel: params.channel, reason, timestamp },
      });
    }

    return { success: true };
  }
}
