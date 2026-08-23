import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../supabase/types';
import { CustomerWhatsAppConsent } from './types';

const OPT_OUT_KEYWORDS = ['STOP', 'UNSUBSCRIBE', 'CANCEL', 'QUIT', 'END', 'OPTOUT', 'OPT OUT', 'STOPALL'];

export class WhatsAppConsentService {
  constructor(private client: SupabaseClient<Database>) {}

  /**
   * Checks if incoming text is an explicit STOP / opt-out keyword
   */
  static isOptOutMessage(message: string): boolean {
    if (!message) return false;
    const clean = message.trim().toUpperCase();
    return OPT_OUT_KEYWORDS.includes(clean);
  }

  /**
   * Verifies customer WhatsApp consent and opt-out status
   */
  static verifyConsent(customer: CustomerWhatsAppConsent): {
    canSend: boolean;
    reason?: string;
  } {
    // 1. Explicit opt-out check
    if (customer.whatsapp_opted_out) {
      return {
        canSend: false,
        reason: `WHATSAPP COMPLIANCE: Customer opted out of WhatsApp messaging on ${customer.whatsapp_opted_out_at || 'earlier'} (Reason: ${customer.whatsapp_opt_out_reason || 'STOP request'}). Sending is blocked.`,
      };
    }

    // 2. Affirmative opt-in consent check (Strict default false)
    if (!customer.whatsapp_consent) {
      return {
        canSend: false,
        reason: 'CONSENT REQUIRED: Customer does not have affirmative WhatsApp communication consent recorded.',
      };
    }

    return { canSend: true };
  }

  /**
   * Records an explicit opt-out
   */
  async recordOptOut(
    customerId: string,
    reason = 'STOP_REQUEST'
  ): Promise<{ success: boolean; customerId: string }> {
    const timestamp = new Date().toISOString();

    const { error } = await this.client
      .from('customers')
      .update({
        whatsapp_opted_out: true,
        whatsapp_opted_out_at: timestamp,
        whatsapp_opt_out_reason: reason,
        whatsapp_consent: false,
        updated_at: timestamp,
      })
      .eq('id', customerId);

    if (error) {
      throw new Error(`Failed to record customer WhatsApp opt-out: ${error.message}`);
    }

    await this.client.from('audit_logs').insert({
      action: 'WHATSAPP_OPT_OUT_RECORDED',
      entity: 'customer',
      entity_id: customerId,
      metadata: { reason, timestamp },
    });

    return { success: true, customerId };
  }

  /**
   * Records affirmative consent / opt-in
   */
  async recordConsent(
    customerId: string,
    source = 'INVOICE_PORTAL_OPTIN'
  ): Promise<{ success: boolean; customerId: string }> {
    const timestamp = new Date().toISOString();

    const { error } = await this.client
      .from('customers')
      .update({
        whatsapp_consent: true,
        whatsapp_consent_at: timestamp,
        whatsapp_consent_source: source,
        whatsapp_opted_out: false,
        whatsapp_opted_out_at: null,
        whatsapp_opt_out_reason: null,
        updated_at: timestamp,
      })
      .eq('id', customerId);

    if (error) {
      throw new Error(`Failed to record customer WhatsApp consent: ${error.message}`);
    }

    await this.client.from('audit_logs').insert({
      action: 'WHATSAPP_CONSENT_RECORDED',
      entity: 'customer',
      entity_id: customerId,
      metadata: { source, timestamp },
    });

    return { success: true, customerId };
  }
}
