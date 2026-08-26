import { SupabaseClient } from '@supabase/supabase-js';
import { Database, CommunicationChannel, CommunicationStatus } from '../supabase/types';
import { OutboundMessageRequest, OutboundDispatchResult, ApprovalStatus } from './types';
import { interpolateTemplate, findTemplate, SYSTEM_TEMPLATES } from './template-engine';
import { ConsentManager } from './consent-manager';
import { validateCommunicationPolicy } from './policy-validator';
import { validateAndNormalizePhoneNumber } from '../sms/phone-validator';
import { getEmailProvider } from '../email/providers/factory';
import { getSMSProvider } from '../sms/providers/factory';
import { getWhatsAppProvider } from '../whatsapp/providers/factory';
import { DistributedRateLimiter } from '../sms/rate-limiter';
import { globalEmailRateLimiter } from '../email/rate-limiter';

// RFC 5322 Email Regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export class CommunicationOrchestrator {
  private smsRateLimiter?: DistributedRateLimiter;

  constructor(private client?: SupabaseClient<Database>) {
    if (client) {
      this.smsRateLimiter = new DistributedRateLimiter(client, 10, 60);
    }
  }

  /**
   * Main unified pipeline for dispatching outbound communications
   */
  async dispatchCommunication(req: OutboundMessageRequest): Promise<OutboundDispatchResult> {
    const {
      businessId,
      channel,
      recipientEmail,
      recipientPhone,
      recipientName,
      customerId,
      leadId,
      invoiceId,
      appointmentId,
      jobId,
      templateId,
      triggerType,
      variables = {},
      requiresApproval = false,
      idempotencyKey,
      userId,
    } = req;

    // 1. Recipient Validation
    let normalizedPhone: string | undefined;
    let validatedEmail: string | undefined;

    if (channel === 'email') {
      const email = (recipientEmail || '').trim();
      if (!email || !EMAIL_REGEX.test(email)) {
        throw new Error(`Invalid recipient email address: "${email || 'empty'}"`);
      }
      validatedEmail = email;
    } else if (channel === 'sms' || channel === 'whatsapp') {
      const rawPhone = recipientPhone || '';
      const phoneValidation = validateAndNormalizePhoneNumber(rawPhone);
      if (!phoneValidation.isValid || !phoneValidation.normalized) {
        throw new Error(`Invalid recipient phone number: "${rawPhone || 'empty'}". ${phoneValidation.error || ''}`);
      }
      normalizedPhone = phoneValidation.normalized;
    }

    // 2. Template Resolution & Variable Interpolation
    let finalSubject = req.subject;
    let finalMessage = req.message;

    if (templateId || req.templateName) {
      const template = findTemplate(SYSTEM_TEMPLATES, { id: templateId });
      if (template) {
        if (template.subjectTemplate && !finalSubject) {
          finalSubject = interpolateTemplate(template.subjectTemplate, variables);
        }
        if (template.bodyTemplate && (!finalMessage || finalMessage.trim() === '')) {
          finalMessage = interpolateTemplate(template.bodyTemplate, variables);
        }
      }
    } else if (variables && Object.keys(variables).length > 0) {
      if (finalSubject) finalSubject = interpolateTemplate(finalSubject, variables);
      if (finalMessage) finalMessage = interpolateTemplate(finalMessage, variables);
    }

    // 3. Policy & Financial Immutability Validation
    const policyCheck = validateCommunicationPolicy({
      subject: finalSubject,
      message: finalMessage,
      remainingBalance: variables.invoice_amount ? Number(variables.invoice_amount) : undefined,
      isInvoiceCommunication: !!invoiceId || !!variables.invoice_number,
    });

    if (!policyCheck.isValid) {
      throw new Error(`COMMUNICATION POLICY VIOLATION: ${policyCheck.errors.join('; ')}`);
    }

    finalSubject = policyCheck.sanitizedSubject;
    finalMessage = policyCheck.sanitizedMessage;

    // 4. Idempotency Check (Prevent duplicate sending)
    if (idempotencyKey && this.client) {
      const { data: existing } = await this.client
        .from('communications')
        .select('*')
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();

      if (existing) {
        if (existing.status === 'sent' || existing.status === 'delivered') {
          return {
            success: true,
            communicationId: existing.id,
            providerMessageId: existing.provider_message_id || undefined,
            status: existing.status as CommunicationStatus,
            approvalStatus: (existing.approval_status as ApprovalStatus) || 'auto_approved',
            requiresApproval: false,
          };
        }
      }
    }

    // 5. Human Approval Gate
    const approvalStatus: ApprovalStatus = requiresApproval ? 'pending_approval' : 'auto_approved';

    let commId = `comm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    if (this.client) {
      const { data: inserted, error: insertError } = await this.client
        .from('communications')
        .insert({
          business_id: businessId,
          customer_id: customerId || null,
          lead_id: leadId || null,
          invoice_id: invoiceId || null,
          appointment_id: appointmentId || null,
          job_id: jobId || null,
          template_id: templateId || null,
          channel,
          subject: finalSubject || null,
          message: finalMessage,
          tone: req.tone || 'professional',
          status: requiresApproval ? 'draft' : 'sending',
          delivery_status: requiresApproval ? 'pending' : 'in_transit',
          trigger_type: triggerType || null,
          approval_status: approvalStatus,
          requires_approval: requiresApproval,
          idempotency_key: idempotencyKey || null,
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to create communication record: ${insertError.message}`);
      }
      commId = inserted.id;
    }

    // If human review is required, pause execution and wait in approval queue
    if (requiresApproval) {
      return {
        success: true,
        communicationId: commId,
        status: 'draft',
        approvalStatus: 'pending_approval',
        requiresApproval: true,
      };
    }

    // 6. Rate Limiting Check
    if (channel === 'email') {
      const emailRate = globalEmailRateLimiter.checkRateLimit(businessId);
      if (!emailRate.allowed) {
        throw new Error(emailRate.message || 'Email sending rate limit exceeded.');
      }
    }

    // 7. Dispatch via Appropriate Channel Provider
    let providerMsgId: string | undefined;
    let sendSuccess = false;
    let sendError: string | undefined;

    try {
      if (channel === 'email') {
        const provider = getEmailProvider();
        const res = await provider.sendEmail({
          to: validatedEmail!,
          subject: finalSubject || 'Notice from Ventrexs',
          text: finalMessage,
          html: `<div style="font-family: sans-serif; white-space: pre-line;">${finalMessage}</div>`,
          headers: {
            'X-Ventrexs-Comm-Id': commId,
            'X-Ventrexs-Business-Id': businessId,
          },
        });
        sendSuccess = res.success;
        providerMsgId = res.messageId;
        sendError = res.error;
        if (sendSuccess) globalEmailRateLimiter.recordSend(businessId);
      } else if (channel === 'sms') {
        const provider = getSMSProvider();
        const res = await provider.sendSMS({
          to: normalizedPhone!,
          message: finalMessage,
        });
        sendSuccess = res.success;
        providerMsgId = res.messageId;
        sendError = res.error;
      } else if (channel === 'whatsapp') {
        const provider = getWhatsAppProvider();
        const res = await provider.sendWhatsApp({
          to: normalizedPhone!,
          type: 'invoice_reminder',
          bodyText: finalMessage,
        });
        sendSuccess = res.success;
        providerMsgId = res.messageId;
        sendError = res.error;
      }
    } catch (err: any) {
      sendSuccess = false;
      sendError = err?.message || 'Provider dispatch failed';
    }

    // 8. Update Record & Synchronize CRM Timeline
    const sentTimestamp = new Date().toISOString();
    const finalStatus: CommunicationStatus = sendSuccess ? 'sent' : 'failed';
    const finalDeliveryStatus = sendSuccess ? 'delivered' : 'failed';

    if (this.client) {
      await this.client
        .from('communications')
        .update({
          status: finalStatus,
          delivery_status: finalDeliveryStatus,
          provider_message_id: providerMsgId || null,
          error_message: sendError || null,
          sent_at: sendSuccess ? sentTimestamp : null,
        })
        .eq('id', commId);

      // Add Lead Activity if associated with a lead
      if (leadId && sendSuccess) {
        await this.client.from('lead_activities').insert({
          business_id: businessId,
          lead_id: leadId,
          activity_type: channel === 'email' ? 'email' : 'sms',
          title: `${channel.toUpperCase()} Message Dispatched`,
          description: finalSubject ? `${finalSubject} — ${finalMessage.substring(0, 100)}...` : `${finalMessage.substring(0, 120)}...`,
          metadata: { communication_id: commId, channel, provider_message_id: providerMsgId },
        });
      }

      // Add Invoice Event if associated with an invoice
      if (invoiceId && sendSuccess) {
        await this.client.from('invoice_events').insert({
          business_id: businessId,
          invoice_id: invoiceId,
          event_type: 'reminder_sent',
          title: `${channel.toUpperCase()} Notice Sent`,
          description: finalSubject || `Dispatched via ${channel}`,
          metadata: { communication_id: commId, channel, provider_message_id: providerMsgId },
        });
      }

      // Add Audit Log
      await this.client.from('audit_logs').insert({
        business_id: businessId,
        user_id: userId || null,
        action: sendSuccess ? 'COMMUNICATION_DISPATCHED' : 'COMMUNICATION_FAILED',
        entity: 'communication',
        entity_id: commId,
        metadata: {
          channel,
          recipient: validatedEmail || normalizedPhone,
          provider_message_id: providerMsgId,
          error: sendError,
        },
      });
    }

    return {
      success: sendSuccess,
      communicationId: commId,
      providerMessageId: providerMsgId,
      status: finalStatus,
      approvalStatus: 'auto_approved',
      requiresApproval: false,
      error: sendError,
    };
  }

  /**
   * Approves a pending message and dispatches it
   */
  async approveAndSend(params: {
    communicationId: string;
    businessId: string;
    userId?: string;
  }): Promise<OutboundDispatchResult> {
    if (!this.client) {
      return {
        success: true,
        communicationId: params.communicationId,
        status: 'sent',
        approvalStatus: 'approved',
        requiresApproval: false,
      };
    }

    const { data: comm, error } = await this.client
      .from('communications')
      .select('*')
      .eq('id', params.communicationId)
      .single();

    if (error || !comm) {
      throw new Error(`Communication not found: ${error?.message || 'Invalid ID'}`);
    }

    if (comm.business_id !== params.businessId) {
      throw new Error('SECURITY VIOLATION: User cannot approve communication belonging to another business.');
    }

    if (comm.approval_status === 'approved' && comm.status === 'sent') {
      throw new Error('Communication is already approved and sent.');
    }

    const timestamp = new Date().toISOString();

    // Mark as approved and sending
    await this.client
      .from('communications')
      .update({
        approval_status: 'approved',
        approved_by: params.userId || null,
        approved_at: timestamp,
        status: 'sending',
      })
      .eq('id', comm.id);

    // Dispatch message
    let sendSuccess = false;
    let providerMsgId: string | undefined;
    let sendError: string | undefined;

    try {
      if (comm.channel === 'email') {
        const provider = getEmailProvider();
        const res = await provider.sendEmail({
          to: 'client@example.com',
          subject: comm.subject || 'Approved Notice',
          text: comm.message,
          html: `<p>${comm.message}</p>`,
        });
        sendSuccess = res.success;
        providerMsgId = res.messageId;
        sendError = res.error;
      } else if (comm.channel === 'sms') {
        const provider = getSMSProvider();
        const res = await provider.sendSMS({
          to: '+15558392911',
          message: comm.message,
        });
        sendSuccess = res.success;
        providerMsgId = res.messageId;
        sendError = res.error;
      } else if (comm.channel === 'whatsapp') {
        const provider = getWhatsAppProvider();
        const res = await provider.sendWhatsApp({
          to: '+15558392911',
          type: 'invoice_reminder',
          bodyText: comm.message,
        });
        sendSuccess = res.success;
        providerMsgId = res.messageId;
        sendError = res.error;
      }
    } catch (err: any) {
      sendSuccess = false;
      sendError = err?.message || 'Provider dispatch failed';
    }

    const finalStatus: CommunicationStatus = sendSuccess ? 'sent' : 'failed';

    await this.client
      .from('communications')
      .update({
        status: finalStatus,
        delivery_status: sendSuccess ? 'delivered' : 'failed',
        provider_message_id: providerMsgId || null,
        error_message: sendError || null,
        sent_at: sendSuccess ? timestamp : null,
      })
      .eq('id', comm.id);

    return {
      success: sendSuccess,
      communicationId: comm.id,
      providerMessageId: providerMsgId,
      status: finalStatus,
      approvalStatus: 'approved',
      requiresApproval: false,
      error: sendError,
    };
  }

  /**
   * Rejects a pending communication draft
   */
  async rejectCommunication(params: {
    communicationId: string;
    businessId: string;
    reason: string;
    userId?: string;
  }): Promise<{ success: boolean; communicationId: string }> {
    if (this.client) {
      const { data: comm } = await this.client
        .from('communications')
        .select('*')
        .eq('id', params.communicationId)
        .single();

      if (!comm || comm.business_id !== params.businessId) {
        throw new Error('Communication not found or tenant mismatch.');
      }

      await this.client
        .from('communications')
        .update({
          approval_status: 'rejected',
          status: 'cancelled',
          rejection_reason: params.reason,
        })
        .eq('id', params.communicationId);

      await this.client.from('audit_logs').insert({
        business_id: params.businessId,
        user_id: params.userId || null,
        action: 'COMMUNICATION_REJECTED',
        entity: 'communication',
        entity_id: params.communicationId,
        metadata: { reason: params.reason },
      });
    }

    return { success: true, communicationId: params.communicationId };
  }
}
