import { SupabaseClient } from '@supabase/supabase-js';
import { Database, CommunicationChannel } from '../supabase/types';
import { AutomationTriggerType, OutboundMessageRequest } from './types';
import { CommunicationOrchestrator } from './orchestrator';

export interface TriggerPayload {
  businessId: string;
  triggerType: AutomationTriggerType;
  customerId?: string;
  leadId?: string;
  invoiceId?: string;
  appointmentId?: string;
  jobId?: string;
  channel?: CommunicationChannel;
  preferredContact?: 'email' | 'sms' | 'whatsapp';
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  serviceName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  technicianName?: string;
  businessName?: string;
  businessPhone?: string;
  invoiceNumber?: string;
  invoiceAmount?: string | number;
  dueDate?: string;
  paymentAmount?: string | number;
  requiresApproval?: boolean;
}

export class AutomationTriggerDispatcher {
  constructor(private client?: SupabaseClient<Database>) {}

  /**
   * Evaluates and executes an automation trigger
   */
  async executeTrigger(payload: TriggerPayload) {
    const orchestrator = new CommunicationOrchestrator(this.client);
    const channel: CommunicationChannel = payload.channel || (payload.preferredContact as CommunicationChannel) || 'email';

    const variables: Record<string, string | number | undefined> = {
      customer_name: payload.recipientName || 'Valued Customer',
      business_name: payload.businessName || 'Ventrexs Service',
      service_name: payload.serviceName || 'Service Request',
      appointment_date: payload.appointmentDate || 'Scheduled Date',
      appointment_time: payload.appointmentTime || 'Scheduled Time',
      technician_name: payload.technicianName || 'Service Specialist',
      business_phone: payload.businessPhone || '+1 (555) 019-2831',
      invoice_number: payload.invoiceNumber || 'INV-001',
      invoice_amount: payload.invoiceAmount !== undefined ? `$${payload.invoiceAmount}` : '$0.00',
      due_date: payload.dueDate || 'Upon Receipt',
      payment_amount: payload.paymentAmount !== undefined ? `$${payload.paymentAmount}` : '$0.00',
    };

    let templateId: string | undefined;
    let fallbackSubject: string | undefined;
    let fallbackMessage: string | undefined;
    let defaultRequiresApproval = payload.requiresApproval ?? false;

    switch (payload.triggerType) {
      case 'NEW_LEAD':
        templateId = channel === 'sms' ? 'sys-sms-lead-welcome' : 'sys-email-lead-welcome';
        fallbackSubject = `Thank you for contacting ${variables.business_name}`;
        fallbackMessage = `Hi ${variables.customer_name}, thanks for reaching out regarding ${variables.service_name}! Our team will follow up shortly.`;
        break;

      case 'APPOINTMENT_BOOKED':
        templateId = channel === 'sms' ? 'sys-sms-appt-confirm' : channel === 'whatsapp' ? 'sys-wa-appt-confirm' : 'sys-email-appt-confirm';
        fallbackSubject = `Appointment Confirmed: ${variables.service_name}`;
        fallbackMessage = `Your appointment for ${variables.service_name} is confirmed for ${variables.appointment_date} at ${variables.appointment_time}.`;
        break;

      case 'APPOINTMENT_REMINDER':
        templateId = channel === 'sms' ? 'sys-sms-appt-reminder' : channel === 'whatsapp' ? 'sys-wa-appt-reminder' : 'sys-email-appt-reminder';
        fallbackSubject = `Reminder: Service Appointment Tomorrow`;
        fallbackMessage = `Reminder: Your ${variables.service_name} appointment is scheduled for tomorrow ${variables.appointment_date} at ${variables.appointment_time}.`;
        break;

      case 'ESTIMATE_SENT':
        templateId = 'sys-email-estimate-notice';
        fallbackSubject = `Estimate for ${variables.service_name} from ${variables.business_name}`;
        fallbackMessage = `Your estimate for ${variables.service_name} (${variables.invoice_amount}) has been prepared and is ready for your review.`;
        break;

      case 'INVOICE_CREATED':
        templateId = channel === 'sms' ? 'sys-sms-invoice-notice' : channel === 'whatsapp' ? 'sys-wa-invoice-notice' : 'sys-email-invoice-notice';
        fallbackSubject = `Invoice ${variables.invoice_number} Statement`;
        fallbackMessage = `Your statement for Invoice ${variables.invoice_number} (${variables.invoice_amount}) is due on ${variables.due_date}.`;
        break;

      case 'PAYMENT_RECEIVED':
        templateId = channel === 'sms' ? 'sys-sms-payment-confirm' : channel === 'whatsapp' ? 'sys-wa-payment-confirm' : 'sys-email-payment-confirm';
        fallbackSubject = `Payment Received: Thank You!`;
        fallbackMessage = `We received your payment of ${variables.payment_amount} for Invoice ${variables.invoice_number}. Thank you!`;
        break;

      case 'APPOINTMENT_COMPLETED':
      case 'FOLLOW_UP_DUE':
        templateId = channel === 'sms' ? 'sys-sms-follow-up' : channel === 'whatsapp' ? 'sys-wa-follow-up' : 'sys-email-follow-up';
        fallbackSubject = `How was your service with ${variables.business_name}?`;
        fallbackMessage = `Hi ${variables.customer_name}, thank you for choosing ${variables.business_name} for ${variables.service_name}. Let us know if you need anything else!`;
        break;

      default:
        fallbackSubject = `Update from ${variables.business_name}`;
        fallbackMessage = `Hi ${variables.customer_name}, here is an update regarding your service with ${variables.business_name}.`;
    }

    const request: OutboundMessageRequest = {
      businessId: payload.businessId,
      channel,
      recipientEmail: payload.recipientEmail,
      recipientPhone: payload.recipientPhone,
      recipientName: payload.recipientName,
      customerId: payload.customerId,
      leadId: payload.leadId,
      invoiceId: payload.invoiceId,
      appointmentId: payload.appointmentId,
      jobId: payload.jobId,
      templateId,
      triggerType: payload.triggerType,
      variables,
      subject: fallbackSubject,
      message: fallbackMessage,
      requiresApproval: defaultRequiresApproval,
      idempotencyKey: `trg-${payload.triggerType}-${payload.leadId || payload.customerId || payload.invoiceId || payload.appointmentId}-${Date.now()}`,
    };

    return orchestrator.dispatchCommunication(request);
  }
}
