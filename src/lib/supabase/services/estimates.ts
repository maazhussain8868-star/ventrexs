import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types';

export type EstimateInsert = Database['public']['Tables']['estimates']['Insert'];
export type EstimateUpdate = Database['public']['Tables']['estimates']['Update'];
export type JobActivityInsert = Database['public']['Tables']['job_activities']['Insert'];

export interface CalculatedEstimateTotals {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
}

/**
 * Calculates estimate totals server-side with integer cents arithmetic to avoid float errors.
 */
export function calculateServerEstimateTotals(
  items: Array<{ quantity: number; unit_price?: number; unitPrice?: number }>,
  taxRatePercent: number = 0,
  discountAmount: number = 0
): CalculatedEstimateTotals {
  let subtotalCents = 0;

  for (const item of items) {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unit_price ?? item.unitPrice) || 0;
    const itemTotalCents = Math.round(qty * price * 100);
    subtotalCents += Math.max(0, itemTotalCents);
  }

  const subtotal = subtotalCents / 100;
  const taxRate = Math.max(0, Number(taxRatePercent) || 0);
  const taxAmountCents = Math.round((subtotalCents * taxRate) / 100);
  const taxAmount = taxAmountCents / 100;
  const discountCents = Math.min(subtotalCents + taxAmountCents, Math.max(0, Math.round(Number(discountAmount || 0) * 100)));
  const discount = discountCents / 100;
  const totalCents = Math.max(0, subtotalCents + taxAmountCents - discountCents);
  const totalAmount = totalCents / 100;

  return {
    subtotal,
    taxAmount,
    discountAmount: discount,
    totalAmount,
  };
}

export class EstimatesService {
  constructor(private client: SupabaseClient<Database>) {}

  async getEstimates(businessId: string, filter?: { status?: string; customerId?: string; jobId?: string }) {
    let query = this.client
      .from('estimates')
      .select(`
        *,
        customers (id, name, company, email, phone, address),
        jobs (id, title, status, service_type)
      `)
      .eq('business_id', businessId);

    if (filter?.status && filter.status !== 'ALL') {
      query = query.eq('status', filter.status);
    }
    if (filter?.customerId) {
      query = query.eq('customer_id', filter.customerId);
    }
    if (filter?.jobId) {
      query = query.eq('job_id', filter.jobId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getEstimateById(id: string) {
    const { data, error } = await this.client
      .from('estimates')
      .select(`
        *,
        customers (id, name, company, email, phone, address),
        jobs (id, title, status, service_type, property_address),
        invoices (id, invoice_number, status, total_amount, remaining_balance)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createEstimate(estimate: EstimateInsert) {
    const { data, error } = await this.client
      .from('estimates')
      .insert(estimate)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateEstimate(id: string, updates: EstimateUpdate) {
    const { data, error } = await this.client
      .from('estimates')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteEstimate(id: string) {
    const { error } = await this.client
      .from('estimates')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
}
