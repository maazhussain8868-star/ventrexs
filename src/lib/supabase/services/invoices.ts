import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types';

export interface CreateInvoiceParams {
  business_id: string;
  customer_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  currency?: string;
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  discount_amount?: number;
  original_amount: number;
  status?: Database['public']['Tables']['invoices']['Row']['status'];
  priority?: Database['public']['Tables']['invoices']['Row']['priority'];
  notes?: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    tax_amount?: number;
    discount_amount?: number;
    line_total: number;
  }>;
}

export class InvoiceService {
  constructor(private client: SupabaseClient<Database>) {}

  async getInvoices(businessId: string) {
    const { data, error } = await this.client
      .from('invoices')
      .select(`
        *,
        customers (
          id,
          name,
          company,
          email,
          phone
        ),
        invoice_items (*),
        payments (*),
        invoice_events (*),
        ai_recommendations (*)
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getInvoiceById(id: string) {
    const { data, error } = await this.client
      .from('invoices')
      .select(`
        *,
        customers (
          id,
          name,
          company,
          email,
          phone,
          address
        ),
        invoice_items (*),
        payments (*),
        invoice_events (*),
        ai_recommendations (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createInvoice(params: CreateInvoiceParams) {
    // Halal-First Integrity: remaining_balance = original_amount - 0
    const originalAmount = Number(params.original_amount);
    const amountPaid = 0;
    const remainingBalance = originalAmount - amountPaid;

    const { data: invoice, error: invError } = await this.client
      .from('invoices')
      .insert({
        business_id: params.business_id,
        customer_id: params.customer_id,
        invoice_number: params.invoice_number,
        issue_date: params.issue_date,
        due_date: params.due_date,
        currency: params.currency || 'USD',
        subtotal: Number(params.subtotal),
        tax_rate: Number(params.tax_rate || 0),
        tax_amount: Number(params.tax_amount || 0),
        discount_amount: Number(params.discount_amount || 0),
        original_amount: originalAmount,
        amount_paid: amountPaid,
        remaining_balance: remainingBalance,
        status: params.status || 'draft',
        priority: params.priority || 'medium',
        notes: params.notes,
      })
      .select()
      .single();

    if (invError) throw invError;

    // Insert Items
    if (params.items && params.items.length > 0) {
      const itemsToInsert = params.items.map(item => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        tax_amount: Number(item.tax_amount || 0),
        discount_amount: Number(item.discount_amount || 0),
        line_total: Number(item.line_total),
      }));

      const { error: itemsError } = await this.client
        .from('invoice_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;
    }

    // Insert Event
    await this.client.from('invoice_events').insert({
      invoice_id: invoice.id,
      business_id: params.business_id,
      event_type: 'created',
      title: 'Invoice Created',
      description: `Invoice ${invoice.invoice_number} created for original amount $${originalAmount.toLocaleString()}`,
      metadata: { original_amount: originalAmount },
    });

    if (params.status && params.status !== 'draft') {
      await this.client.from('invoice_events').insert({
        invoice_id: invoice.id,
        business_id: params.business_id,
        event_type: 'sent',
        title: 'Sent to Customer',
        description: `Delivered to customer`,
      });
    }

    return invoice;
  }

  async updateInvoice(
    id: string,
    updates: Partial<Database['public']['Tables']['invoices']['Update']> & {
      items?: Array<{
        id?: string;
        description: string;
        quantity: number;
        unit_price: number;
        tax_amount?: number;
        discount_amount?: number;
        line_total: number;
      }>;
    }
  ) {
    const { items, ...invoiceUpdates } = updates;

    // Recalculate remaining balance if original_amount or amount_paid is modified
    if (invoiceUpdates.original_amount !== undefined || invoiceUpdates.amount_paid !== undefined) {
      const { data: current } = await this.client
        .from('invoices')
        .select('original_amount, amount_paid')
        .eq('id', id)
        .single();

      if (current) {
        const orig = invoiceUpdates.original_amount !== undefined ? Number(invoiceUpdates.original_amount) : Number(current.original_amount);
        const paid = invoiceUpdates.amount_paid !== undefined ? Number(invoiceUpdates.amount_paid) : Number(current.amount_paid);
        invoiceUpdates.remaining_balance = Math.max(0, orig - paid);
      }
    }

    const { data: invoice, error: invError } = await this.client
      .from('invoices')
      .update(invoiceUpdates)
      .eq('id', id)
      .select()
      .single();

    if (invError) throw invError;

    // If items were provided, update them
    if (items && items.length > 0) {
      await this.client.from('invoice_items').delete().eq('invoice_id', id);
      const itemsToInsert = items.map(item => ({
        invoice_id: id,
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        tax_amount: Number(item.tax_amount || 0),
        discount_amount: Number(item.discount_amount || 0),
        line_total: Number(item.line_total),
      }));
      await this.client.from('invoice_items').insert(itemsToInsert);
    }

    return invoice;
  }

  async deleteInvoice(id: string) {
    const { error } = await this.client
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
}
