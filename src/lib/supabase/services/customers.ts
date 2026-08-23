import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types';

export type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
export type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

export class CustomerService {
  constructor(private client: SupabaseClient<Database>) {}

  async getCustomers(businessId: string) {
    const { data: customers, error } = await this.client
      .from('customers')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch invoices to compute outstanding receivables and payments received
    const { data: invoices, error: invError } = await this.client
      .from('invoices')
      .select('customer_id, remaining_balance, amount_paid, status')
      .eq('business_id', businessId);

    if (invError) throw invError;

    const invoicesByCustomer = (invoices || []).reduce<Record<string, {
      totalOutstanding: number;
      totalPaid: number;
      overdueCount: number;
      activeCount: number;
    }>>((acc, inv) => {
      const cId = inv.customer_id;
      if (!acc[cId]) {
        acc[cId] = { totalOutstanding: 0, totalPaid: 0, overdueCount: 0, activeCount: 0 };
      }
      acc[cId].totalOutstanding += Number(inv.remaining_balance || 0);
      acc[cId].totalPaid += Number(inv.amount_paid || 0);
      if (inv.status === 'overdue') acc[cId].overdueCount += 1;
      if (inv.status !== 'paid' && inv.status !== 'draft') acc[cId].activeCount += 1;
      return acc;
    }, {});

    return customers.map(c => ({
      ...c,
      totalOutstanding: invoicesByCustomer[c.id]?.totalOutstanding ?? 0,
      outstandingReceivables: invoicesByCustomer[c.id]?.totalOutstanding ?? 0,
      totalPaid: invoicesByCustomer[c.id]?.totalPaid ?? 0,
      paymentsReceived: invoicesByCustomer[c.id]?.totalPaid ?? 0,
      overdueCount: invoicesByCustomer[c.id]?.overdueCount ?? 0,
      activeInvoicesCount: invoicesByCustomer[c.id]?.activeCount ?? 0,
    }));
  }

  async getCustomerById(id: string) {
    const { data, error } = await this.client
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createCustomer(customer: CustomerInsert) {
    const { data, error } = await this.client
      .from('customers')
      .insert(customer)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCustomer(id: string, updates: CustomerUpdate) {
    const { data, error } = await this.client
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCustomer(id: string) {
    const { error } = await this.client
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  async getCustomerHistory(customerId: string) {
    const { data: customer, error: custError } = await this.client
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (custError) throw custError;

    const { data: invoices, error: invError } = await this.client
      .from('invoices')
      .select(`
        *,
        invoice_items (*),
        payments (*),
        invoice_events (*)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (invError) throw invError;

    const { data: communications, error: commError } = await this.client
      .from('communications')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (commError) throw commError;

    return {
      customer,
      invoices: invoices || [],
      communications: communications || [],
    };
  }
}
