import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../supabase/types';
import { CustomerSMSConsent } from './types';

// Standard opt-out keywords (TCPA / CTIA guidelines)
const OPT_OUT_KEYWORDS = ['STOP', 'UNSUBSCRIBE', 'CANCEL', 'QUIT', 'END', 'OPTOUT', 'OPT OUT', 'STOPALL'];

export class SMSConsentService {
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
   * Verifies customer SMS consent and opt-out status
   */
  static verifyConsent(customer: CustomerSMSConsent): {
    canSend: boolean;
    reason?: string;
  } {
    // 1. Explicit opt-out check
    if (customer.sms_opted_out) {
      return {
        canSend: false,
        reason: `TCPA/CTIA COMPLIANCE: Customer opted out of SMS messaging on ${customer.sms_opted_out_at || 'earlier'} (Reason: ${customer.sms_opt_out_reason || 'STOP request'}). Sending is blocked.`,
      };
    }

    // 2. Opt-in consent check
    if (customer.sms_consent === false) {
      return {
        canSend: false,
        reason: 'CONSENT REQUIRED: Customer does not have active SMS communication consent recorded.',
      };
    }

    return { canSend: true };
  }

  /**
   * Records an explicit opt-out (e.g. STOP received or manual customer request)
   */
  async recordOptOut(customerId: string, reason = 'STOP_REQUEST'): Promise<{ success: boolean; customerId: string }> {
    const timestamp = new Date().toISOString();

    const { error } = await this.client
      .from('customers')
      .update({
        sms_opted_out: true,
        sms_opted_out_at: timestamp,
        sms_opt_out_reason: reason,
        sms_consent: false,
        updated_at: timestamp,
      })
      .eq('id', customerId);

    if (error) {
      throw new Error(`Failed to record customer SMS opt-out: ${error.message}`);
    }

    // Audit log
    await this.client.from('audit_logs').insert({
      action: 'SMS_OPT_OUT_RECORDED',
      entity: 'customer',
      entity_id: customerId,
      metadata: { reason, timestamp },
    });

    return { success: true, customerId };
  }

  /**
   * Records affirmative consent / opt-in (e.g. invoice portal consent or written agreement)
   */
  async recordConsent(
    customerId: string,
    source = 'INVOICE_PORTAL_OPTIN'
  ): Promise<{ success: boolean; customerId: string }> {
    const timestamp = new Date().toISOString();

    const { error } = await this.client
      .from('customers')
      .update({
        sms_consent: true,
        sms_consent_at: timestamp,
        sms_consent_source: source,
        sms_opted_out: false,
        sms_opted_out_at: null,
        sms_opt_out_reason: null,
        updated_at: timestamp,
      })
      .eq('id', customerId);

    if (error) {
      throw new Error(`Failed to record customer SMS consent: ${error.message}`);
    }

    await this.client.from('audit_logs').insert({
      action: 'SMS_CONSENT_RECORDED',
      entity: 'customer',
      entity_id: customerId,
      metadata: { source, timestamp },
    });

    return { success: true, customerId };
  }
}
