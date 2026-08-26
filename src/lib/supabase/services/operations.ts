import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types';

export type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
export type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];
export type JobInsert = Database['public']['Tables']['jobs']['Insert'];
export type JobUpdate = Database['public']['Tables']['jobs']['Update'];

export class OperationsService {
  constructor(private client: SupabaseClient<Database>) {}

  // 1. APPOINTMENTS
  async getAppointments(businessId: string) {
    const { data, error } = await this.client
      .from('appointments')
      .select('*')
      .eq('business_id', businessId)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getAppointmentById(id: string) {
    const { data, error } = await this.client
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createAppointment(appointment: AppointmentInsert) {
    const { data, error } = await this.client
      .from('appointments')
      .insert(appointment)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateAppointment(id: string, updates: AppointmentUpdate) {
    const { data, error } = await this.client
      .from('appointments')
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

  async deleteAppointment(id: string) {
    const { error } = await this.client
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // 2. JOBS
  async getJobs(businessId: string) {
    const { data, error } = await this.client
      .from('jobs')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getJobById(id: string) {
    const { data, error } = await this.client
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getJobWithDetails(id: string) {
    const { data, error } = await this.client
      .from('jobs')
      .select(`
        *,
        customers (id, name, company, email, phone, address),
        leads (id, name, service_requested, phone, email, source),
        appointments (id, title, start_time, end_time, status, address),
        estimates (id, estimate_number, title, total_amount, status),
        invoices (id, invoice_number, total_amount, amount_paid, remaining_balance, status)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createJob(job: JobInsert) {
    const { data, error } = await this.client
      .from('jobs')
      .insert(job)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateJob(id: string, updates: JobUpdate) {
    const { data, error } = await this.client
      .from('jobs')
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

  async deleteJob(id: string) {
    const { error } = await this.client
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // 3. JOB ACTIVITIES
  async addJobActivity(activity: Database['public']['Tables']['job_activities']['Insert']) {
    const { data, error } = await this.client
      .from('job_activities')
      .insert(activity)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getJobActivities(jobId: string) {
    const { data, error } = await this.client
      .from('job_activities')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
