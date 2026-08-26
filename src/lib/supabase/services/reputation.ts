import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types';

export type ReviewSettingsInsert = Database['public']['Tables']['review_settings']['Insert'];
export type ReviewSettingsUpdate = Database['public']['Tables']['review_settings']['Update'];
export type ReviewRequestInsert = Database['public']['Tables']['review_requests']['Insert'];
export type ReviewRequestUpdate = Database['public']['Tables']['review_requests']['Update'];
export type CustomerFeedbackInsert = Database['public']['Tables']['customer_feedback']['Insert'];
export type CustomerFeedbackUpdate = Database['public']['Tables']['customer_feedback']['Update'];

export class ReputationService {
  constructor(private client: SupabaseClient<Database>) {}

  // ==========================================
  // REVIEW SETTINGS
  // ==========================================
  async getSettings(businessId: string) {
    const { data, error } = await this.client
      .from('review_settings')
      .select('*')
      .eq('business_id', businessId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async upsertSettings(settings: ReviewSettingsInsert) {
    const { data, error } = await this.client
      .from('review_settings')
      .upsert(settings, { onConflict: 'business_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ==========================================
  // REVIEW REQUESTS
  // ==========================================
  async getReviewRequests(businessId: string, filters?: {
    status?: string;
    channel?: string;
    customerId?: string;
    jobId?: string;
  }) {
    let query = this.client
      .from('review_requests')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'ALL') {
      query = query.eq('status', filters.status);
    }
    if (filters?.channel && filters.channel !== 'ALL') {
      query = query.eq('channel', filters.channel);
    }
    if (filters?.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }
    if (filters?.jobId) {
      query = query.eq('job_id', filters.jobId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getReviewRequestById(id: string) {
    const { data, error } = await this.client
      .from('review_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getReviewRequestByIdempotencyKey(key: string) {
    const { data, error } = await this.client
      .from('review_requests')
      .select('*')
      .eq('idempotency_key', key)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createReviewRequest(request: ReviewRequestInsert) {
    const { data, error } = await this.client
      .from('review_requests')
      .insert(request)
      .select()
      .single();

    if (error) throw error;

    // Log creation event
    await this.logEvent(data.id, data.business_id, 'REQUEST_CREATED', {
      channel: data.channel,
      status: data.status,
    });

    return data;
  }

  async updateReviewRequest(id: string, updates: ReviewRequestUpdate) {
    const { data, error } = await this.client
      .from('review_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ==========================================
  // CUSTOMER FEEDBACK
  // ==========================================
  async getCustomerFeedback(businessId: string, filters?: {
    rating?: number;
    sentiment?: string;
    followUpStatus?: string;
    customerId?: string;
  }) {
    let query = this.client
      .from('customer_feedback')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (filters?.rating) {
      query = query.eq('rating', filters.rating);
    }
    if (filters?.sentiment && filters.sentiment !== 'ALL') {
      query = query.eq('sentiment', filters.sentiment);
    }
    if (filters?.followUpStatus && filters.followUpStatus !== 'ALL') {
      query = query.eq('follow_up_status', filters.followUpStatus);
    }
    if (filters?.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getFeedbackById(id: string) {
    const { data, error } = await this.client
      .from('customer_feedback')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createFeedback(feedback: CustomerFeedbackInsert) {
    const { data, error } = await this.client
      .from('customer_feedback')
      .insert(feedback)
      .select()
      .single();

    if (error) throw error;

    // If linked to review request, mark request completed
    if (data.review_request_id) {
      await this.client
        .from('review_requests')
        .update({
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
        })
        .eq('id', data.review_request_id);

      await this.logEvent(data.review_request_id, data.business_id, 'FEEDBACK_SUBMITTED', {
        rating: data.rating,
        sentiment: data.sentiment,
      });
    }

    return data;
  }

  async updateFeedbackFollowUp(id: string, updates: {
    follow_up_status: string;
    follow_up_notes?: string | null;
    assigned_to?: string | null;
  }) {
    const { data, error } = await this.client
      .from('customer_feedback')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ==========================================
  // EVENT LOGGING
  // ==========================================
  async logEvent(reviewRequestId: string, businessId: string, eventType: string, payload: Record<string, any> = {}) {
    try {
      await this.client
        .from('review_events')
        .insert({
          business_id: businessId,
          review_request_id: reviewRequestId,
          event_type: eventType,
          payload,
        });
    } catch (err) {
      console.warn('Failed to log review event:', err);
    }
  }
}
