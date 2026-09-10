import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types';

export type TechnicianRow = Database['public']['Tables']['technicians']['Row'];
export type TechnicianInsert = Database['public']['Tables']['technicians']['Insert'];
export type TechnicianUpdate = Database['public']['Tables']['technicians']['Update'];

export class TechniciansService {
  constructor(private client: SupabaseClient<Database>) {}

  /**
   * 1. Retrieve all technicians scoped to a specific business
   */
  async getTechnicians(businessId: string, statusFilter?: 'all' | 'active' | 'inactive' | 'deactivated') {
    let query = this.client
      .from('technicians')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: true });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * 2. Retrieve single technician by ID
   */
  async getTechnicianById(id: string) {
    const { data, error } = await this.client
      .from('technicians')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 3. Add employee / technician to the business roster
   */
  async createTechnician(technician: TechnicianInsert) {
    const { data, error } = await this.client
      .from('technicians')
      .insert({
        ...technician,
        status: technician.status || 'active',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 4. Update technician details
   */
  async updateTechnician(id: string, updates: TechnicianUpdate) {
    const { data, error } = await this.client
      .from('technicians')
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

  /**
   * 5. Set technician status (active, inactive, deactivated)
   */
  async setTechnicianStatus(id: string, status: 'active' | 'inactive' | 'deactivated') {
    return this.updateTechnician(id, { status });
  }

  /**
   * 6. Delete technician
   */
  async deleteTechnician(id: string) {
    const { error } = await this.client
      .from('technicians')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
}
