import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Json } from '../types';

export interface LogAuditParams {
  business_id?: string | null;
  user_id?: string | null;
  action: string;
  entity: string;
  entity_id?: string | null;
  metadata?: Record<string, unknown>;
}

export class AuditService {
  constructor(private client: SupabaseClient<Database>) {}

  async logAction(params: LogAuditParams) {
    // Sanitization: Ensure no sensitive keys (passwords, tokens, secrets) are ever logged
    const cleanMetadata: Record<string, unknown> = {};
    if (params.metadata) {
      for (const [key, value] of Object.entries(params.metadata)) {
        if (!/password|token|secret|key|authorization/i.test(key)) {
          cleanMetadata[key] = value;
        }
      }
    }

    const { data, error } = await this.client
      .from('audit_logs')
      .insert({
        business_id: params.business_id || null,
        user_id: params.user_id || null,
        action: params.action,
        entity: params.entity,
        entity_id: params.entity_id || null,
        metadata: cleanMetadata as Json,
      })
      .select()
      .single();

    if (error) {
      console.warn('Audit log write error:', error.message);
      return null;
    }
    return data;
  }

  async getAuditLogs(businessId: string) {
    const { data, error } = await this.client
      .from('audit_logs')
      .select('*')
      .eq('business_id', businessId)
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  }
}
