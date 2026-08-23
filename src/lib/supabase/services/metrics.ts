import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types';

export class MetricsService {
  constructor(private client: SupabaseClient<Database>) {}

  async getDashboardMetrics(businessId: string) {
    const { data: invoices, error } = await this.client
      .from('invoices')
      .select('original_amount, amount_paid, remaining_balance, status, due_date, paid_date')
      .eq('business_id', businessId);

    if (error) throw error;

    const list = invoices || [];
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const totalOutstanding = list
      .filter(i => i.status === 'overdue' || i.status === 'due' || i.status === 'partially_paid' || i.status === 'sent')
      .reduce((sum, i) => sum + Number(i.remaining_balance || 0), 0);

    const overdueAmount = list
      .filter(i => i.status === 'overdue')
      .reduce((sum, i) => sum + Number(i.remaining_balance || 0), 0);

    const dueThisWeek = list
      .filter(i => {
        if (i.status !== 'due' && i.status !== 'sent') return false;
        const due = new Date(i.due_date);
        return due >= now && due <= oneWeekFromNow;
      })
      .reduce((sum, i) => sum + Number(i.remaining_balance || 0), 0);

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const collectedMtd = list
      .filter(i => {
        if (i.amount_paid <= 0) return false;
        if (!i.paid_date) return true;
        const paid = new Date(i.paid_date);
        return paid.getMonth() === currentMonth && paid.getFullYear() === currentYear;
      })
      .reduce((sum, i) => sum + Number(i.amount_paid || 0), 0);

    return {
      totalOutstanding,
      overdueAmount,
      dueThisWeek,
      collectedMtd,
      totalInvoices: list.length,
      paidCount: list.filter(i => i.status === 'paid').length,
      overdueCount: list.filter(i => i.status === 'overdue').length,
      openCount: list.filter(i => i.status !== 'paid' && i.status !== 'draft').length,
    };
  }

  async getCollectionsMetrics(businessId: string) {
    const { data: invoices, error } = await this.client
      .from('invoices')
      .select(`
        id,
        invoice_number,
        original_amount,
        amount_paid,
        remaining_balance,
        status,
        due_date,
        priority,
        customers (id, name, company, email, phone, risk_level)
      `)
      .eq('business_id', businessId)
      .in('status', ['overdue', 'due', 'partially_paid', 'sent'])
      .order('due_date', { ascending: true });

    if (error) throw error;

    const list = invoices || [];
    const totalAtRisk = list
      .filter(i => i.status === 'overdue')
      .reduce((sum, i) => sum + Number(i.remaining_balance || 0), 0);

    return {
      totalAtRisk,
      activeCollectionsCount: list.length,
      actionableInvoices: list,
    };
  }
}
