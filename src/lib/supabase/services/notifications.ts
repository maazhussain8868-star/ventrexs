import { SupabaseClient } from '@supabase/supabase-js';
import { Database, NotificationType } from '../types';

export interface CreateNotificationParams {
  business_id: string;
  user_id?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  link_url?: string | null;
}

export class NotificationService {
  constructor(private client: SupabaseClient<Database>) {}

  async getNotifications(businessId: string, userId?: string) {
    let query = this.client
      .from('notifications')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.or(`user_id.eq.${userId},user_id.is.null`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createNotification(params: CreateNotificationParams) {
    const { data, error } = await this.client
      .from('notifications')
      .insert({
        business_id: params.business_id,
        user_id: params.user_id,
        type: params.type,
        title: params.title,
        message: params.message,
        link_url: params.link_url,
        read: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async markAsRead(id: string) {
    const { data, error } = await this.client
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async markAllAsRead(businessId: string) {
    const { data, error } = await this.client
      .from('notifications')
      .update({ read: true })
      .eq('business_id', businessId)
      .eq('read', false)
      .select();

    if (error) throw error;
    return data;
  }

  async clearNotifications(businessId: string) {
    const { error } = await this.client
      .from('notifications')
      .delete()
      .eq('business_id', businessId);

    if (error) throw error;
    return true;
  }
}
