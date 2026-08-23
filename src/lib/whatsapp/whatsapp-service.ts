import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../supabase/types';
import { getWhatsAppProvider } from './providers/factory';
import { DistributedRateLimiter } from '../sms/rate-limiter';
import { validateAndNormalizePhoneNumber } from '../sms/phone-validator';
import { WhatsAppConsentService } from './consent-service';
import { validateWhatsAppTemplate } from './template-validator';
import { validateAICollectionOutput } from '../ai/validator';
import { SendApprovedWhatsAppParams, WhatsAppSendResult, WhatsAppMessageType } from './types';

export class WhatsAppService {
  private rateLimiter: DistributedRateLimiter;
  private consentService: WhatsAppConsentService;

  constructor(private client: SupabaseClient<Database>) {
    this.rateLimiter = new DistributedRateLimiter(client, 10, 60);
    this.consentService = new WhatsAppConsentService(client);
  }

  /**
   * Secure Server-Side Pipeline: Send an approved WhatsApp payment statement
   */
  async sendApprovedWhatsApp(params: SendApprovedWhatsAppParams): Promise<{
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

    const customer = (comm as any).customers;
    const invoice = (comm as any).invoices;
    const business = (comm as any).businesses;
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

    // 5. WhatsApp Consent & Opt-Out Verification
    const consentCheck = WhatsAppConsentService.verifyConsent({
      whatsapp_consent: customer?.whatsapp_consent ?? false,
      whatsapp_consent_at: customer?.whatsapp_consent_at,
      whatsapp_consent_source: customer?.whatsapp_consent_source,
      whatsapp_opted_out: customer?.whatsapp_opted_out ?? false,
      whatsapp_opted_out_at: customer?.whatsapp_opted_out_at,
      whatsapp_opt_out_reason: customer?.whatsapp_opt_out_reason,
    });

    if (!consentCheck.canSend) {
      const errorMsg = consentCheck.reason || 'Customer has not consented or has opted out of WhatsApp.';
      await this.markCommunicationFailed(communicationId, errorMsg);
      throw new Error(errorMsg);
    }

    // 6. Template & Message Type Validation (Transactional only, no marketing)
    const msgType: WhatsAppMessageType = (comm.template_name as WhatsAppMessageType) || 'invoice_reminder';
    const templateCheck = validateWhatsAppTemplate({
      type: msgType,
      templateName: comm.template_name,
      messageText: comm.message,
      variables: (comm.template_variables as Record<string, any>) || {},
    });

    if (!templateCheck.isValid) {
      const errorMsg = templateCheck.error || 'Invalid WhatsApp template or message type.';
      await this.markCommunicationFailed(communicationId, errorMsg);
      throw new Error(errorMsg);
    }

    // 7. Halal-First Integrity & Balance Verification
    if (invoice) {
      const remainingBalance = Number(invoice.remaining_balance);
      if (remainingBalance <= 0) {
        throw new Error('HALAL-FIRST ERROR: Cannot send WhatsApp collection message for fully settled invoice.');
      }
    }

    const validation = validateAICollectionOutput({
      priority: 'medium',
      recommended_action: 'send_reminder',
      reason: 'WhatsApp validation scan',
      suggested_tone: 'Professional Statement',
      message_draft_subject: 'WhatsApp Notice',
      message_draft: comm.message,
      confidence: 0.95,
    });

    if (!validation.isValid) {
      const errorMsg = `HALAL-FIRST VALIDATION FAILED: ${validation.errors.join('; ')}`;
      await this.markCommunicationFailed(communicationId, errorMsg);
      throw new Error(errorMsg);
    }

    // 8. Distributed Rate Limiting Check
    const rateCheck = await this.rateLimiter.checkRateLimit(`whatsapp:${commBusinessId}`);
    if (!rateCheck.allowed) {
      throw new Error(rateCheck.message || 'WhatsApp sending rate limit exceeded.');
    }

    // 9. Update status to 'sending'
    await this.client
      .from('communications')
      .update({ status: 'sending', delivery_status: 'in_transit' })
      .eq('id', communicationId);

    // 10. Dispatch through Active WhatsApp Provider
    const provider = getWhatsAppProvider();
    const sendResult = await provider.sendWhatsApp({
      to: normalizedPhone,
      type: msgType,
      templateName: comm.template_name || undefined,
      templateLanguage: comm.template_language || 'en_US',
      templateVariables: (comm.template_variables as Record<string, string>) || undefined,
      bodyText: comm.message,
      metadata: {
        communicationId,
        businessId: commBusinessId,
      },
    });

    // 11. Handle Result & Persist State
    if (sendResult.success) {
      const sentTimestamp = new Date().toISOString();

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

      await this.rateLimiter.recordSend(`whatsapp:${commBusinessId}`);

      if (comm.invoice_id) {
        await this.client.from('invoice_events').insert({
          invoice_id: comm.invoice_id,
          business_id: commBusinessId,
          event_type: 'reminder_sent',
          title: `Truthful WhatsApp Statement Sent`,
          description: `Dispatched to ${normalizedPhone} via ${provider.name}`,
          metadata: {
            communication_id: communicationId,
            provider: provider.name,
            provider_message_id: sendResult.messageId,
            recipient_phone: normalizedPhone,
          },
        });
      }

      await this.client.from('audit_logs').insert({
        business_id: commBusinessId,
        user_id: userId || null,
        action: 'SEND_APPROVED_WHATSAPP',
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
      await this.markCommunicationFailed(communicationId, sendResult.error || 'Provider rejected WhatsApp dispatch');

      await this.client.from('audit_logs').insert({
        business_id: commBusinessId,
        user_id: userId || null,
        action: 'WHATSAPP_SEND_FAILED',
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
        error: sendResult.error || 'Failed to dispatch WhatsApp message',
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
    } catch (e: any) {
      console.warn('Failed to update WhatsApp communication failure status:', e?.message);
    }
  }
}
