import { SupabaseClient } from '@supabase/supabase-js';
import { Database, RecommendationStatus } from '../types';

export class RecommendationService {
  constructor(private client: SupabaseClient<Database>) {}

  async getRecommendations(businessId: string) {
    const { data, error } = await this.client
      .from('ai_recommendations')
      .select(`
        *,
        invoices (
          id,
          invoice_number,
          due_date,
          remaining_balance,
          customers (
            name,
            company,
            email,
            phone
          )
        )
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateRecommendationStatus(id: string, status: RecommendationStatus) {
    const { data, error } = await this.client
      .from('ai_recommendations')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
