import { SupabaseClient } from '@supabase/supabase-js';
import { Database, CommunicationChannel, CommunicationTone, CommunicationStatus } from '../types';

export interface CreateCommunicationParams {
  business_id: string;
  invoice_id?: string | null;
  customer_id: string;
  channel: CommunicationChannel;
  subject?: string;
  message: string;
  tone?: CommunicationTone;
  status?: CommunicationStatus;
  sent_at?: string | null;
}

export class CommunicationService {
  constructor(private client: SupabaseClient<Database>) {}

  async getCommunications(businessId: string, customerId?: string) {
    let query = this.client
      .from('communications')
      .select(`
        *,
        customers (id, name, company, email, phone),
        invoices (id, invoice_number, remaining_balance)
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createCommunication(params: CreateCommunicationParams) {
    const { data, error } = await this.client
      .from('communications')
      .insert({
        business_id: params.business_id,
        invoice_id: params.invoice_id,
        customer_id: params.customer_id,
        channel: params.channel,
        subject: params.subject,
        message: params.message,
        tone: params.tone || 'professional',
        status: params.status || 'draft',
        sent_at: params.sent_at,
      })
      .select()
      .single();

    if (error) throw error;

    // If sent, add timeline event to invoice
    if (params.invoice_id && (params.status === 'sent' || params.sent_at)) {
      await this.client.from('invoice_events').insert({
        invoice_id: params.invoice_id,
        business_id: params.business_id,
        event_type: 'reminder_sent',
        title: 'Truthful Follow-up Sent',
        description: params.subject || `Courtesy notice sent via ${params.channel}`,
        metadata: { communication_id: data.id, channel: params.channel },
      });
    }

    return data;
  }

  async updateCommunicationStatus(id: string, status: CommunicationStatus, sentAt?: string) {
    const { data, error } = await this.client
      .from('communications')
      .update({
        status,
        sent_at: sentAt || (status === 'sent' ? new Date().toISOString() : null),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
