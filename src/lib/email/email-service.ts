import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../supabase/types';
import { getEmailProvider } from './providers/factory';
import { globalEmailRateLimiter } from './rate-limiter';
import { renderInvoiceFollowUpEmail } from './email-template';
import { validateAICollectionOutput } from '../ai/validator';
import { SendApprovedEmailParams, EmailSendResult } from './types';

// RFC 5322 standard email regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export class EmailService {
  constructor(private client: SupabaseClient<Database>) {}

  /**
   * Secure Server-Side Pipeline: Send an approved communication email
   */
  async sendApprovedEmail(params: SendApprovedEmailParams): Promise<{
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

    // 4. Validate Recipient Email
    const recipientEmail = customer?.email?.trim();
    if (!recipientEmail || !EMAIL_REGEX.test(recipientEmail)) {
      const errorMsg = `Invalid recipient email address: "${recipientEmail || 'empty'}"`;
      await this.markCommunicationFailed(communicationId, errorMsg);
      throw new Error(errorMsg);
    }

    // 5. Halal-First Integrity & Balance Verification
    if (invoice) {
      const remainingBalance = Number(invoice.remaining_balance);
      if (remainingBalance <= 0) {
        throw new Error('HALAL-FIRST ERROR: Cannot send collection email for fully paid/zero balance invoice.');
      }
    }

    // Run Halal Validator on subject and message content
    const combinedContent = `${comm.subject || ''} ${comm.message}`;
    const validation = validateAICollectionOutput({
      priority: 'medium',
      recommended_action: 'send_reminder',
      reason: 'Validation check',
      suggested_tone: comm.tone === 'gentle' ? 'Gentle Check-in' : 'Professional Statement',
      message_draft_subject: comm.subject,
      message_draft: comm.message,
      confidence: 0.95,
    });

    if (!validation.isValid) {
      const errorMsg = `HALAL-FIRST VALIDATION FAILED: ${validation.errors.join('; ')}`;
      await this.markCommunicationFailed(communicationId, errorMsg);
      throw new Error(errorMsg);
    }

    // 6. Rate Limiting Check
    const rateCheck = globalEmailRateLimiter.checkRateLimit(commBusinessId);
    if (!rateCheck.allowed) {
      throw new Error(rateCheck.message || 'Email sending rate limit exceeded.');
    }

    // 7. Update status to 'sending'
    await this.client
      .from('communications')
      .update({ status: 'sending', delivery_status: 'in_transit' })
      .eq('id', communicationId);

    // 8. Render Email Template
    const rendered = renderInvoiceFollowUpEmail({
      businessName: business?.name || 'Ventrexs AI Workspace',
      businessEmail: business?.email || undefined,
      businessPhone: business?.phone || undefined,
      customerName: customer?.name || 'Valued Client',
      customerCompany: customer?.company || 'Accounts Payable Team',
      invoiceNumber: invoice?.invoice_number || 'INV-000',
      invoiceId: invoice?.id || '',
      remainingBalance: invoice ? Number(invoice.remaining_balance) : 0,
      currency: business?.currency || 'USD ($)',
      dueDate: invoice?.due_date || 'Due Date',
      messageBody: comm.message,
    });

    // 9. Dispatch through Active Email Provider
    const provider = getEmailProvider();
    const sendResult = await provider.sendEmail({
      to: recipientEmail,
      subject: comm.subject || `Invoice ${invoice?.invoice_number || ''} Statement - ${business?.name || 'Ventrexs'}`,
      text: rendered.text,
      html: rendered.html,
      headers: {
        'X-Ventrexs-Communication-Id': communicationId,
        'X-Ventrexs-Business-Id': commBusinessId,
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
      globalEmailRateLimiter.recordSend(commBusinessId);

      // Add timeline event on invoice
      if (comm.invoice_id) {
        await this.client.from('invoice_events').insert({
          invoice_id: comm.invoice_id,
          business_id: commBusinessId,
          event_type: 'reminder_sent',
          title: `Truthful Follow-up Email Sent`,
          description: `Dispatched to ${recipientEmail} via ${provider.name}`,
          metadata: {
            communication_id: communicationId,
            provider: provider.name,
            provider_message_id: sendResult.messageId,
            recipient: recipientEmail,
          },
        });
      }

      // Add audit log
      await this.client.from('audit_logs').insert({
        business_id: commBusinessId,
        user_id: userId || null,
        action: 'SEND_APPROVED_EMAIL',
        entity: 'communication',
        entity_id: communicationId,
        metadata: {
          recipient: recipientEmail,
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
      await this.markCommunicationFailed(communicationId, sendResult.error || 'Provider rejected email dispatch');

      await this.client.from('audit_logs').insert({
        business_id: commBusinessId,
        user_id: userId || null,
        action: 'EMAIL_SEND_FAILED',
        entity: 'communication',
        entity_id: communicationId,
        metadata: {
          recipient: recipientEmail,
          error: sendResult.error,
          provider: provider.name,
        },
      });

      return {
        success: false,
        communicationId,
        status: 'failed',
        error: sendResult.error || 'Failed to dispatch email',
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
      console.warn('Failed to update communication failure status:', e?.message);
    }
  }
}
