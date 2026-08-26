import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types';

export type LeadInsert = Database['public']['Tables']['leads']['Insert'];
export type LeadUpdate = Database['public']['Tables']['leads']['Update'];
export type LeadActivityInsert = Database['public']['Tables']['lead_activities']['Insert'];
export type LeadNoteInsert = Database['public']['Tables']['lead_notes']['Insert'];

export class LeadService {
  constructor(private client: SupabaseClient<Database>) {}

  async getLeads(businessId: string) {
    const { data, error } = await this.client
      .from('leads')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getLeadById(id: string) {
    const { data: lead, error: leadError } = await this.client
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (leadError) throw leadError;

    const { data: activities, error: actError } = await this.client
      .from('lead_activities')
      .select('*')
      .eq('lead_id', id)
      .order('created_at', { ascending: false });

    if (actError) throw actError;

    const { data: notes, error: notesError } = await this.client
      .from('lead_notes')
      .select('*')
      .eq('lead_id', id)
      .order('created_at', { ascending: false });

    if (notesError) {
      console.warn('Note fetch error ignored:', notesError);
    }

    return {
      ...lead,
      activities: activities || [],
      notesList: notes || [],
    };
  }

  async createLead(lead: LeadInsert) {
    const { data, error } = await this.client
      .from('leads')
      .insert(lead)
      .select()
      .single();

    if (error) throw error;

    // Log initial lead activity
    try {
      await this.client.from('lead_activities').insert({
        business_id: data.business_id,
        lead_id: data.id,
        activity_type: 'status_change',
        title: 'Lead Created',
        description: `New lead received from ${data.source}: ${data.service_requested || 'General Inquiry'}`,
        metadata: { initial_status: data.status, source: data.source },
      });
    } catch {
      // Non-blocking activity log
    }

    return data;
  }

  async updateLead(id: string, updates: LeadUpdate) {
    const { data, error } = await this.client
      .from('leads')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateLeadStatus(id: string, status: string, notes?: string, userId?: string) {
    const { data: lead, error: leadError } = await this.client
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (leadError) throw leadError;

    const oldStatus = lead.status;

    const { data: updated, error: updateError } = await this.client
      .from('leads')
      .update({
        status,
        updated_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log status change activity
    try {
      await this.client.from('lead_activities').insert({
        business_id: lead.business_id,
        lead_id: id,
        user_id: userId || null,
        activity_type: 'status_change',
        title: `Stage moved to ${status}`,
        description: notes || `Lead pipeline status advanced from ${oldStatus} to ${status}`,
        metadata: { from: oldStatus, to: status },
      });
    } catch {
      // Non-blocking
    }

    return updated;
  }

  async assignLead(id: string, assignedUserId: string | null, assignedUserName: string | null, actorUserId?: string) {
    const { data: updated, error } = await this.client
      .from('leads')
      .update({
        assigned_user_id: assignedUserId,
        assigned_user_name: assignedUserName,
        updated_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    try {
      await this.client.from('lead_activities').insert({
        business_id: updated.business_id,
        lead_id: id,
        user_id: actorUserId || null,
        activity_type: 'assigned_user_changed',
        title: 'Assigned User Changed',
        description: assignedUserName ? `Assigned to ${assignedUserName}` : 'Assignment removed',
        metadata: { assigned_user_name: assignedUserName },
      });
    } catch {
      // Non-blocking
    }

    return updated;
  }

  async addActivity(activity: LeadActivityInsert) {
    const { data, error } = await this.client
      .from('lead_activities')
      .insert(activity)
      .select()
      .single();

    if (error) throw error;

    try {
      await this.client
        .from('leads')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', activity.lead_id);
    } catch {
      // Non-blocking
    }

    return data;
  }

  async createNote(note: LeadNoteInsert) {
    const { data, error } = await this.client
      .from('lead_notes')
      .insert(note)
      .select()
      .single();

    if (error) throw error;

    // Log note activity
    try {
      await this.client.from('lead_activities').insert({
        business_id: note.business_id,
        lead_id: note.lead_id,
        user_id: note.author_id || null,
        activity_type: 'note',
        title: 'Note Added',
        description: note.content.substring(0, 120),
      });
      await this.client
        .from('leads')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', note.lead_id);
    } catch {
      // Non-blocking
    }

    return data;
  }

  async updateNote(noteId: string, content: string) {
    const { data, error } = await this.client
      .from('lead_notes')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', noteId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteNote(noteId: string) {
    const { error } = await this.client
      .from('lead_notes')
      .delete()
      .eq('id', noteId);

    if (error) throw error;
    return true;
  }

  async deleteLead(id: string) {
    const { error } = await this.client
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  async bulkUpdateStatus(leadIds: string[], status: string, businessId: string) {
    const { data, error } = await this.client
      .from('leads')
      .update({
        status,
        updated_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .in('id', leadIds)
      .eq('business_id', businessId)
      .select();

    if (error) throw error;
    return data || [];
  }

  async bulkAssign(leadIds: string[], assignedUserId: string | null, assignedUserName: string | null, businessId: string) {
    const { data, error } = await this.client
      .from('leads')
      .update({
        assigned_user_id: assignedUserId,
        assigned_user_name: assignedUserName,
        updated_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .in('id', leadIds)
      .eq('business_id', businessId)
      .select();

    if (error) throw error;
    return data || [];
  }

  async bulkDelete(leadIds: string[], businessId: string) {
    const { error } = await this.client
      .from('leads')
      .delete()
      .in('id', leadIds)
      .eq('business_id', businessId);

    if (error) throw error;
    return true;
  }
}
