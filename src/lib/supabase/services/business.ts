import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types';

export class BusinessService {
  constructor(private client: SupabaseClient<Database>) {}

  async getBusiness(businessId: string) {
    const { data, error } = await this.client
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    if (error) throw error;
    return data;
  }

  async getCurrentUserBusiness(userId: string) {
    const { data: membership, error: memError } = await this.client
      .from('business_members')
      .select('business_id, role, is_primary')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (memError) throw memError;
    if (!membership) return null;

    const { data: business, error: bizError } = await this.client
      .from('businesses')
      .select('*')
      .eq('id', membership.business_id)
      .single();

    if (bizError) throw bizError;
    return { ...business, userRole: membership.role };
  }

  async updateBusiness(businessId: string, updates: Partial<Database['public']['Tables']['businesses']['Update']>) {
    const { data, error } = await this.client
      .from('businesses')
      .update(updates)
      .eq('id', businessId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMembers(businessId: string) {
    const { data, error } = await this.client
      .from('business_members')
      .select(`
        id,
        role,
        is_primary,
        created_at,
        profiles (
          id,
          name,
          email,
          avatar_url
        )
      `)
      .eq('business_id', businessId);

    if (error) throw error;
    return data;
  }
}
