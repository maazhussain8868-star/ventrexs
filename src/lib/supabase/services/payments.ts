import { SupabaseClient } from '@supabase/supabase-js';
import { Database, PaymentMethod } from '../types';

export interface RecordPaymentParams {
  business_id: string;
  invoice_id: string;
  amount: number;
  payment_date?: string;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export class PaymentService {
  constructor(private client: SupabaseClient<Database>) {}

  async recordPayment(params: RecordPaymentParams) {
    const paymentAmount = Number(params.amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    // 1. Fetch current invoice with lock/verification
    const { data: invoice, error: invError } = await this.client
      .from('invoices')
      .select('*')
      .eq('id', params.invoice_id)
      .single();

    if (invError || !invoice) {
      throw new Error(`Invoice not found: ${invError?.message || ''}`);
    }

    // 2. Validate remaining balance
    const currentRemaining = Number(invoice.remaining_balance);
    if (paymentAmount > currentRemaining + 0.001) {
      throw new Error(
        `Payment amount ($${paymentAmount.toFixed(2)}) exceeds remaining invoice balance ($${currentRemaining.toFixed(2)}).`
      );
    }

    // 3. Record Payment transaction
    const { data: payment, error: payError } = await this.client
      .from('payments')
      .insert({
        business_id: params.business_id,
        invoice_id: params.invoice_id,
        amount: paymentAmount,
        payment_date: params.payment_date || new Date().toISOString(),
        method: params.method,
        reference: params.reference,
        notes: params.notes,
      })
      .select()
      .single();

    if (payError) throw payError;

    // 4. Fetch the authoritative trigger-updated invoice state
    const { data: updatedInvoice, error: fetchUpdatedError } = await this.client
      .from('invoices')
      .select('*')
      .eq('id', params.invoice_id)
      .single();

    if (fetchUpdatedError) {
      console.warn('Notice fetching trigger-updated invoice state:', fetchUpdatedError.message);
    }

    // 5. Add In-App Notification
    try {
      await this.client.from('notifications').insert({
        business_id: params.business_id,
        type: 'payment',
        title: `Payment Received: $${paymentAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        message: `Payment applied to invoice ${invoice.invoice_number} via ${params.method}.`,
        link_url: `/invoices/${invoice.id}`,
        read: false,
      });
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.warn('Payment notification insert notice:', errMsg);
    }

    return { payment, invoice: updatedInvoice || invoice };
  }

  async getPaymentsByInvoice(invoiceId: string) {
    const { data, error } = await this.client
      .from('payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getPaymentsByBusiness(businessId: string) {
    const { data, error } = await this.client
      .from('payments')
      .select(`
        *,
        invoices (
          id,
          invoice_number,
          customer_id,
          customers (
            name,
            company
          )
        )
      `)
      .eq('business_id', businessId)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
