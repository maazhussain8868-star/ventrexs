'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { assertUserBelongsToBusiness } from '@/lib/auth/server-authorization';
import { CommunicationOrchestrator } from '@/lib/communications/orchestrator';
import { ConsentManager } from '@/lib/communications/consent-manager';
import { AutomationTriggerDispatcher, TriggerPayload } from '@/lib/communications/automation-triggers';
import { OutboundMessageRequest } from '@/lib/communications/types';
import { SYSTEM_TEMPLATES } from '@/lib/communications/template-engine';
import { CommunicationChannel, CommunicationTone } from '@/lib/supabase/types';
import { getAIServiceProvider } from '@/lib/ai/provider';
import { revalidatePath } from 'next/cache';

/**
 * 1. Get Communications List
 */
export async function getCommunicationsAction(businessId: string, filter?: {
  channel?: string;
  status?: string;
  customerId?: string;
  leadId?: string;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    await assertUserBelongsToBusiness(supabase, businessId);

    let query = supabase
      .from('communications')
      .select(`
        *,
        customers (id, name, company, email, phone),
        leads (id, name, email, phone, service_requested),
        invoices (id, invoice_number, remaining_balance)
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (filter?.channel && filter.channel !== 'all') {
      query = query.eq('channel', filter.channel as CommunicationChannel);
    }
    if (filter?.status && filter.status !== 'all') {
      query = query.eq('status', filter.status as any);
    }
    if (filter?.customerId) {
      query = query.eq('customer_id', filter.customerId);
    }
    if (filter?.leadId) {
      query = query.eq('lead_id', filter.leadId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch communications' };
  }
}

/**
 * 2. Send Communication (Direct or Queued for Approval)
 */
export async function sendCommunicationAction(req: OutboundMessageRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    await assertUserBelongsToBusiness(supabase, req.businessId);

    const orchestrator = new CommunicationOrchestrator(supabase);
    const result = await orchestrator.dispatchCommunication({
      ...req,
      userId: user?.id,
    });

    revalidatePath('/communications');
    revalidatePath('/communications/approvals');
    revalidatePath('/dashboard');
    if (req.leadId) revalidatePath(`/leads`);
    if (req.customerId) revalidatePath(`/contacts`);

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to dispatch communication' };
  }
}

/**
 * 3. Approve Communication Draft
 */
export async function approveCommunicationAction(communicationId: string, businessId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    await assertUserBelongsToBusiness(supabase, businessId);

    const orchestrator = new CommunicationOrchestrator(supabase);
    const result = await orchestrator.approveAndSend({
      communicationId,
      businessId,
      userId: user?.id,
    });

    revalidatePath('/communications');
    revalidatePath('/communications/approvals');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to approve communication' };
  }
}

/**
 * 4. Reject Communication Draft
 */
export async function rejectCommunicationAction(communicationId: string, businessId: string, reason: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    await assertUserBelongsToBusiness(supabase, businessId);

    const orchestrator = new CommunicationOrchestrator(supabase);
    const result = await orchestrator.rejectCommunication({
      communicationId,
      businessId,
      reason,
      userId: user?.id,
    });

    revalidatePath('/communications');
    revalidatePath('/communications/approvals');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to reject communication' };
  }
}

/**
 * 5. Get Communication Templates
 */
export async function getCommunicationTemplatesAction(businessId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    await assertUserBelongsToBusiness(supabase, businessId);

    const { data, error } = await supabase
      .from('communication_templates')
      .select('*')
      .or(`business_id.eq.${businessId},business_id.is.null`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const templates = (data && data.length > 0) ? data : SYSTEM_TEMPLATES;
    return { success: true, data: templates };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch templates' };
  }
}

/**
 * 6. Create Communication Template
 */
export async function createCommunicationTemplateAction(params: {
  business_id: string;
  name: string;
  channel: CommunicationChannel;
  category: string;
  subject_template?: string;
  body_template: string;
  variables?: string[];
}) {
  try {
    const supabase = await createServerSupabaseClient();
    await assertUserBelongsToBusiness(supabase, params.business_id);

    const { data, error } = await supabase
      .from('communication_templates')
      .insert({
        business_id: params.business_id,
        name: params.name,
        channel: params.channel,
        category: params.category,
        subject_template: params.subject_template || null,
        body_template: params.body_template,
        variables: (params.variables || []) as any,
        is_system: false,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/communications/templates');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create template' };
  }
}

/**
 * 7. Update Communication Template
 */
export async function updateCommunicationTemplateAction(id: string, businessId: string, updates: {
  name?: string;
  subject_template?: string;
  body_template?: string;
  variables?: string[];
}) {
  try {
    const supabase = await createServerSupabaseClient();
    await assertUserBelongsToBusiness(supabase, businessId);

    const { data, error } = await supabase
      .from('communication_templates')
      .update({
        ...updates,
        variables: updates.variables ? (updates.variables as any) : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('business_id', businessId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/communications/templates');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update template' };
  }
}

/**
 * 8. Delete Communication Template
 */
export async function deleteCommunicationTemplateAction(id: string, businessId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    await assertUserBelongsToBusiness(supabase, businessId);

    const { error } = await supabase
      .from('communication_templates')
      .delete()
      .eq('id', id)
      .eq('business_id', businessId);

    if (error) throw error;

    revalidatePath('/communications/templates');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete template' };
  }
}

/**
 * 9. Get Communication Consents
 */
export async function getCommunicationConsentsAction(businessId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    await assertUserBelongsToBusiness(supabase, businessId);

    const { data, error } = await supabase
      .from('communication_consents')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch consents' };
  }
}

/**
 * 10. Update Consent / Record Opt-In
 */
export async function updateConsentAction(params: {
  businessId: string;
  customerId?: string;
  leadId?: string;
  channel: CommunicationChannel;
  optedIn: boolean;
  source?: string;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    await assertUserBelongsToBusiness(supabase, params.businessId);

    const manager = new ConsentManager(supabase);
    if (params.optedIn) {
      await manager.recordConsent({
        businessId: params.businessId,
        customerId: params.customerId,
        leadId: params.leadId,
        channel: params.channel,
        source: params.source || 'MANUAL_DASHBOARD',
      });
    } else {
      await manager.recordOptOut({
        businessId: params.businessId,
        customerId: params.customerId,
        leadId: params.leadId,
        channel: params.channel,
        reason: 'Manual update via dashboard',
      });
    }

    revalidatePath('/communications');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update consent' };
  }
}

/**
 * 11. Record Global Opt-Out
 */
export async function recordOptOutAction(params: {
  businessId: string;
  customerId?: string;
  leadId?: string;
  channel: CommunicationChannel;
  reason?: string;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    await assertUserBelongsToBusiness(supabase, params.businessId);

    const manager = new ConsentManager(supabase);
    await manager.recordOptOut(params);

    revalidatePath('/communications');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to record opt-out' };
  }
}

/**
 * 12. Generate AI Communication Draft
 */
export async function generateAICommunicationDraftAction(params: {
  businessId: string;
  customerName: string;
  serviceRequested?: string;
  channel: CommunicationChannel;
  tone?: CommunicationTone;
  contextPrompt: string;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    await assertUserBelongsToBusiness(supabase, params.businessId);

    const provider = getAIServiceProvider();
    const draft = await provider.generateCustomDraft(
      {
        invoiceId: 'draft',
        invoiceNumber: 'NOTICE',
        originalAmount: 0,
        amountPaid: 0,
        remainingBalance: 0,
        dueDate: new Date().toISOString().split('T')[0],
        daysOverdue: 0,
        status: 'draft',
        customerName: params.customerName,
        customerCompany: 'Client Organization',
        customerEmail: '',
        businessName: 'Ventrexs AI Workspace',
        businessCurrency: 'USD ($)',
      },
      (params.tone || 'professional') as any,
      params.channel as any
    );

    return {
      success: true,
      data: {
        subject: draft.subject,
        message: draft.body,
        tone: params.tone || 'professional',
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to generate AI draft' };
  }
}

/**
 * 13. Dispatch Automation Trigger
 */
export async function dispatchAutomationTriggerAction(payload: TriggerPayload) {
  try {
    const supabase = await createServerSupabaseClient();
    await assertUserBelongsToBusiness(supabase, payload.businessId);

    const dispatcher = new AutomationTriggerDispatcher(supabase);
    const result = await dispatcher.executeTrigger(payload);

    revalidatePath('/communications');
    revalidatePath('/communications/approvals');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to dispatch automation trigger' };
  }
}
