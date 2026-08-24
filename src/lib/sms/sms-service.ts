import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../supabase/types';
import { DistributedRateLimiter } from './rate-limiter';
import { SMSProvider, SendApprovedSMSParams } from './types';
import { getSMSProvider } from './providers/factory';
import { validateAndNormalizePhoneNumber } from './phone-validator';
import { SMSConsentService } from './consent-service';
import { validateAICollectionOutput } from '../ai/validator';

export class SMSService {
  private provider: SMSProvider;
  private rateLimiter: DistributedRateLimiter;
  private consentService: SMSConsentService;

  constructor(private client: SupabaseClient<Database>) {
    this.provider = getSMSProvider();
    this.rateLimiter = new DistributedRateLimiter(client, 10, 60);
    this.consentService = new SMSConsentService(client);
  }

  /**
   * Secure Server-Side Pipeline: Send an approved SMS payment reminder
   */
  async sendApprovedSMS(params: SendApprovedSMSParams): Promise<{
    success: boolean;
    communicationId: string;
    messageId?: string;
    status: 'sent' | 'failed';
    error?: string;
  }> {
    const { communicationId, businessId, userId } = params;

    // 1. Fetch communication record with customer, invoice, and business
    const { data: comm, error: commError } = await this.client
      .from('communications')
      .select(`
        *,
        customers (*),
        invoices (*),
        businesses (*)
      `)
      .eq('id', communicationId)
      .single();

    if (commError || !comm) {
      throw new Error(`Communication not found: ${commError?.message || 'Invalid ID'}`);
    }

    const commWithRelations = comm as unknown as {
      customers?: {
        phone?: string;
        sms_consent?: boolean;
        sms_consent_at?: string | null;
        sms_consent_source?: string | null;
        sms_opted_out?: boolean;
        sms_opted_out_at?: string | null;
        sms_opt_out_reason?: string | null;
      };
      invoices?: {
        remaining_balance?: number;
      };
    };

    const customer = commWithRelations.customers;
    const invoice = commWithRelations.invoices;
    const commBusinessId = comm.business_id;

    // 2. Multi-Tenant Authorization Check
    if (businessId && commBusinessId !== businessId) {
      throw new Error('SECURITY VIOLATION: User cannot access communication belonging to another business.');
    }

    // 3. Idempotency Check (Prevent duplicate sends)
    if (comm.status === 'sent') {
      throw new Error(`IDEMPOTENCY CONFLICT: Communication ${communicationId} was already sent on ${comm.sent_at || 'earlier'}. Cannot re-send.`);
    }

    if (comm.status === 'cancelled') {
      throw new Error(`Communication ${communicationId} has been cancelled.`);
    }

    // 4. Validate and Normalize Recipient Phone Number
    const rawPhone = customer?.phone;
    const phoneValidation = validateAndNormalizePhoneNumber(rawPhone);
    if (!phoneValidation.isValid || !phoneValidation.normalized) {
      const errorMsg = `Invalid recipient phone number: "${rawPhone || 'empty'}". ${phoneValidation.error || ''}`;
      await this.markCommunicationFailed(communicationId, errorMsg);
      throw new Error(errorMsg);
    }
    const normalizedPhone = phoneValidation.normalized;

    // 5. TCPA / CTIA Consent & Opt-Out Verification (Strict Default: false)
    const consentCheck = SMSConsentService.verifyConsent({
      sms_consent: customer?.sms_consent ?? false,
      sms_consent_at: customer?.sms_consent_at,
      sms_consent_source: customer?.sms_consent_source,
      sms_opted_out: customer?.sms_opted_out ?? false,
      sms_opted_out_at: customer?.sms_opted_out_at,
      sms_opt_out_reason: customer?.sms_opt_out_reason,
    });

    if (!consentCheck.canSend) {
      const errorMsg = consentCheck.reason || 'Customer has not consented or has opted out of SMS.';
      await this.markCommunicationFailed(communicationId, errorMsg);
      throw new Error(errorMsg);
    }

    // 6. Halal-First Integrity & Balance Verification
    if (invoice) {
      const remainingBalance = Number(invoice.remaining_balance);
      if (remainingBalance <= 0) {
        throw new Error('HALAL-FIRST ERROR: Cannot send SMS collection message for fully settled/zero balance invoice.');
      }
    }

    // Run Halal Validator on SMS message content
    const validation = validateAICollectionOutput({
      priority: 'medium',
      recommended_action: 'send_reminder',
      reason: 'SMS Validation scan',
      suggested_tone: 'Professional Statement',
      message_draft_subject: 'SMS Notice',
      message_draft: comm.message,
      confidence: 0.95,
    });

    if (!validation.isValid) {
      const errorMsg = `HALAL-FIRST VALIDATION FAILED: ${validation.errors.join('; ')}`;
      await this.markCommunicationFailed(communicationId, errorMsg);
      throw new Error(errorMsg);
    }

    // 7. Distributed Rate Limiting Check
    const rateCheck = await this.rateLimiter.checkRateLimit(`sms:${commBusinessId}`);
    if (!rateCheck.allowed) {
      throw new Error(rateCheck.message || 'SMS sending rate limit exceeded.');
    }

    // 8. Update status to 'sending'
    await this.client
      .from('communications')
      .update({ status: 'sending', delivery_status: 'in_transit' })
      .eq('id', communicationId);

    // 9. Dispatch through Active SMS Provider
    const provider = getSMSProvider();
    const sendResult = await provider.sendSMS({
      to: normalizedPhone,
      message: comm.message,
      metadata: {
        communicationId,
        businessId: commBusinessId,
      },
    });

    // 10. Handle Result & Persist State
    if (sendResult.success) {
      const sentTimestamp = new Date().toISOString();

      // Update communication as 'sent'
      await this.client
        .from('communications')
        .update({
          status: 'sent',
          delivery_status: 'delivered',
          provider_message_id: sendResult.messageId || null,
          sent_at: sentTimestamp,
          error_message: null,
        })
        .eq('id', communicationId);

      // Record rate limit send
      await this.rateLimiter.recordSend(`sms:${commBusinessId}`);

      // Add timeline event on invoice
      if (comm.invoice_id) {
        await this.client.from('invoice_events').insert({
          invoice_id: comm.invoice_id,
          business_id: commBusinessId,
          event_type: 'reminder_sent',
          title: `Truthful SMS Reminder Sent`,
          description: `Dispatched to ${normalizedPhone} via ${provider.name}`,
          metadata: {
            communication_id: communicationId,
            provider: provider.name,
            provider_message_id: sendResult.messageId,
            recipient_phone: normalizedPhone,
          },
        });
      }

      // Add audit log
      await this.client.from('audit_logs').insert({
        business_id: commBusinessId,
        user_id: userId || null,
        action: 'SEND_APPROVED_SMS',
        entity: 'communication',
        entity_id: communicationId,
        metadata: {
          recipient_phone: normalizedPhone,
          invoice_id: comm.invoice_id,
          provider: provider.name,
          provider_message_id: sendResult.messageId,
        },
      });

      return {
        success: true,
        communicationId,
        messageId: sendResult.messageId,
        status: 'sent',
      };
    } else {
      // Record failure, allow safe retry
      await this.markCommunicationFailed(communicationId, sendResult.error || 'Provider rejected SMS dispatch');

      await this.client.from('audit_logs').insert({
        business_id: commBusinessId,
        user_id: userId || null,
        action: 'SMS_SEND_FAILED',
        entity: 'communication',
        entity_id: communicationId,
        metadata: {
          recipient_phone: normalizedPhone,
          error: sendResult.error,
          provider: provider.name,
        },
      });

      return {
        success: false,
        communicationId,
        status: 'failed',
        error: sendResult.error || 'Failed to dispatch SMS',
      };
    }
  }

  private async markCommunicationFailed(id: string, errorMessage: string) {
    try {
      await this.client
        .from('communications')
        .update({
          status: 'failed',
          delivery_status: 'failed',
          error_message: errorMessage,
        })
        .eq('id', id);
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.warn('Failed to update SMS communication failure status:', errMsg);
    }
  }
}
