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

    // 4. Update Invoice Balance (Halal Integrity: remaining = original - paid)
    const newPaid = Number(invoice.amount_paid) + paymentAmount;
    const newRemaining = Math.max(0, Number(invoice.original_amount) - newPaid);
    const isPaid = newRemaining === 0;
    const newStatus = isPaid ? 'paid' : 'partially_paid';

    const { data: updatedInvoice, error: updateError } = await this.client
      .from('invoices')
      .update({
        amount_paid: newPaid,
        remaining_balance: newRemaining,
        status: newStatus,
        paid_date: isPaid ? new Date().toISOString().split('T')[0] : invoice.paid_date,
      })
      .eq('id', params.invoice_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 5. Add Timeline Event
    await this.client.from('invoice_events').insert({
      invoice_id: params.invoice_id,
      business_id: params.business_id,
      event_type: 'payment_received',
      title: `Payment Received ($${paymentAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })})`,
      description: `Settled via ${params.method}${params.reference ? ` • Ref: ${params.reference}` : ''}${params.notes ? ` • Note: ${params.notes}` : ''}`,
      metadata: {
        payment_id: payment.id,
        amount: paymentAmount,
        method: params.method,
        remaining_balance: newRemaining,
      },
    });

    // 6. Add Audit Log
    await this.client.from('audit_logs').insert({
      business_id: params.business_id,
      action: 'RECORD_PAYMENT',
      entity: 'payment',
      entity_id: payment.id,
      metadata: {
        invoice_id: params.invoice_id,
        amount: paymentAmount,
        method: params.method,
      },
    });

    // 7. Add In-App Notification
    await this.client.from('notifications').insert({
      business_id: params.business_id,
      type: 'payment',
      title: `Payment Received: $${paymentAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      message: `Payment applied to invoice ${invoice.invoice_number} via ${params.method}.`,
      link_url: `/invoices/${invoice.id}`,
      read: false,
    });

    return { payment, invoice: updatedInvoice };
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
