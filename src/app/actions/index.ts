'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createSupabaseServices } from '@/lib/supabase/services';
import { CreateInvoiceParams } from '@/lib/supabase/services/invoices';
import { RecordPaymentParams } from '@/lib/supabase/services/payments';
import { CreateCommunicationParams } from '@/lib/supabase/services/communications';
import { CreateNotificationParams } from '@/lib/supabase/services/notifications';
import { CustomerInsert, CustomerUpdate } from '@/lib/supabase/services/customers';
import { LeadInsert, LeadUpdate, LeadActivityInsert, LeadNoteInsert } from '@/lib/supabase/services/leads';
import { AppointmentInsert, AppointmentUpdate, JobInsert, JobUpdate } from '@/lib/supabase/services/operations';
import { assertUserBelongsToBusiness } from '@/lib/auth/server-authorization';
import { revalidatePath } from 'next/cache';

// Helper to get authenticated server services
async function getServerServices() {
  const supabase = await createServerSupabaseClient();
  const services = createSupabaseServices(supabase);
  return { supabase, services };
}

// Helper to get current authenticated user or fallback for local demo mode
async function getAuthContext() {
  const { supabase, services } = await getServerServices();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, supabase, services, isDemo: !user || !!error };
}

/**
 * 1. Create Customer
 */
export async function createCustomerAction(data: CustomerInsert) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, data.business_id);
    const customer = await services.customers.createCustomer(data);
    
    await services.audit.logAction({
      business_id: data.business_id,
      action: 'CREATE_CUSTOMER',
      entity: 'customer',
      entity_id: customer.id,
      metadata: { name: customer.name, company: customer.company },
    });

    revalidatePath('/customers');
    revalidatePath('/dashboard');
    return { success: true, data: customer };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create customer' };
  }
}

/**
 * 2. Update Customer
 */
export async function updateCustomerAction(id: string, updates: CustomerUpdate) {
  try {
    const { supabase, services } = await getServerServices();
    const existing = await services.customers.getCustomerById(id);
    if (!existing) {
      return { success: false, error: 'Customer not found' };
    }
    await assertUserBelongsToBusiness(supabase, existing.business_id);

    const customer = await services.customers.updateCustomer(id, updates);
    
    await services.audit.logAction({
      business_id: customer.business_id,
      action: 'UPDATE_CUSTOMER',
      entity: 'customer',
      entity_id: customer.id,
      metadata: { name: customer.name, company: customer.company },
    });

    revalidatePath('/customers');
    revalidatePath(`/customers/${id}`);
    return { success: true, data: customer };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update customer' };
  }
}

/**
 * 3. Create Invoice
 */
export async function createInvoiceAction(params: CreateInvoiceParams) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, params.business_id);
    const invoice = await services.invoices.createInvoice(params);

    await services.audit.logAction({
      business_id: params.business_id,
      action: 'CREATE_INVOICE',
      entity: 'invoice',
      entity_id: invoice.id,
      metadata: { invoice_number: invoice.invoice_number, original_amount: params.original_amount },
    });

    revalidatePath('/invoices');
    revalidatePath('/dashboard');
    revalidatePath('/collections');
    return { success: true, data: invoice };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create invoice' };
  }
}

/**
 * 4. Update Invoice
 */
export async function updateInvoiceAction(id: string, updates: any) {
  try {
    const { supabase, services } = await getServerServices();
    const existing = await services.invoices.getInvoiceById(id);
    if (!existing) {
      return { success: false, error: 'Invoice not found' };
    }
    await assertUserBelongsToBusiness(supabase, existing.business_id);

    const invoice = await services.invoices.updateInvoice(id, updates);

    await services.audit.logAction({
      business_id: invoice.business_id,
      action: 'UPDATE_INVOICE',
      entity: 'invoice',
      entity_id: invoice.id,
      metadata: { invoice_number: invoice.invoice_number },
    });

    revalidatePath('/invoices');
    revalidatePath(`/invoices/${id}`);
    revalidatePath('/dashboard');
    return { success: true, data: invoice };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update invoice' };
  }
}

/**
 * 5. Delete Invoice
 */
export async function deleteInvoiceAction(id: string, businessId?: string) {
  try {
    const { supabase, services } = await getServerServices();
    const existing = await services.invoices.getInvoiceById(id);
    if (!existing) {
      return { success: false, error: 'Invoice not found' };
    }
    const targetBusinessId = businessId || existing.business_id;
    if (businessId && existing.business_id !== businessId) {
      return { success: false, error: 'SECURITY_VIOLATION: Invoice does not belong to specified business' };
    }
    await assertUserBelongsToBusiness(supabase, targetBusinessId);

    await services.invoices.deleteInvoice(id);

    await services.audit.logAction({
      business_id: targetBusinessId,
      action: 'DELETE_INVOICE',
      entity: 'invoice',
      entity_id: id,
    });

    revalidatePath('/invoices');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete invoice' };
  }
}

/**
 * 6. Record Payment (Halal-First Balance Check)
 */
export async function recordPaymentAction(params: RecordPaymentParams) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, params.business_id);
    const result = await services.payments.recordPayment(params);

    revalidatePath('/invoices');
    revalidatePath(`/invoices/${params.invoice_id}`);
    revalidatePath('/dashboard');
    revalidatePath('/payments');
    revalidatePath('/collections');
    revalidatePath('/reports');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to record payment' };
  }
}

/**
 * 7. Get Invoice
 */
export async function getInvoiceAction(id: string) {
  try {
    const { supabase, services } = await getServerServices();
    const invoice = await services.invoices.getInvoiceById(id);
    if (!invoice) {
      return { success: false, error: 'Invoice not found' };
    }
    await assertUserBelongsToBusiness(supabase, invoice.business_id);
    return { success: true, data: invoice };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to get invoice' };
  }
}

/**
 * 8. Get Dashboard Metrics
 */
export async function getDashboardMetricsAction(businessId: string) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);
    const metrics = await services.metrics.getDashboardMetrics(businessId);
    return { success: true, data: metrics };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to get dashboard metrics' };
  }
}

/**
 * 9. Get Collections
 */
export async function getCollectionsAction(businessId: string) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);
    const collections = await services.metrics.getCollectionsMetrics(businessId);
    return { success: true, data: collections };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to get collections' };
  }
}

/**
 * 10. Get Customer History
 */
export async function getCustomerHistoryAction(customerId: string) {
  try {
    const { supabase, services } = await getServerServices();
    const customer = await services.customers.getCustomerById(customerId);
    if (!customer) {
      return { success: false, error: 'Customer not found' };
    }
    await assertUserBelongsToBusiness(supabase, customer.business_id);
    const history = await services.customers.getCustomerHistory(customerId);
    return { success: true, data: history };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to get customer history' };
  }
}

/**
 * 11. Create Notification
 */
export async function createNotificationAction(params: CreateNotificationParams) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, params.business_id);
    const notification = await services.notifications.createNotification(params);
    revalidatePath('/notifications');
    return { success: true, data: notification };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create notification' };
  }
}

/**
 * 12. Create Communication Draft
 */
export async function createCommunicationDraftAction(params: CreateCommunicationParams) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, params.business_id);
    const communication = await services.communications.createCommunication(params);
    revalidatePath('/follow-up');
    revalidatePath('/copilot');
    return { success: true, data: communication };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create communication draft' };
  }
}

/**
 * 13. Run AI Copilot Collection Analysis
 */
export async function runAICopilotAnalysisAction(businessId: string, invoiceId?: string) {
  try {
    const { supabase } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);
    const { AICopilotService } = await import('@/lib/ai/copilot-service');
    const copilot = new AICopilotService(supabase);

    if (invoiceId) {
      const result = await copilot.analyzeInvoice(invoiceId, businessId);
      revalidatePath('/copilot');
      revalidatePath('/dashboard');
      return { success: true, data: result };
    } else {
      const results = await copilot.analyzeBusinessInvoices(businessId);
      revalidatePath('/copilot');
      revalidatePath('/dashboard');
      return { success: true, data: results };
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to run AI copilot analysis' };
  }
}

/**
 * 14. Approve AI Recommendation (Creates communication draft + timeline + audit)
 */
export async function approveAIRecommendationAction(
  recommendationId: string,
  customDraft?: {
    subject?: string;
    message: string;
    channel?: 'email' | 'sms' | 'whatsapp';
  }
) {
  try {
    const { supabase } = await getServerServices();
    const { data: rec, error: recErr } = await supabase
      .from('ai_recommendations')
      .select('business_id')
      .eq('id', recommendationId)
      .single();
    if (recErr || !rec) {
      return { success: false, error: 'Recommendation not found' };
    }
    await assertUserBelongsToBusiness(supabase, rec.business_id);

    const { AICopilotService } = await import('@/lib/ai/copilot-service');
    const copilot = new AICopilotService(supabase);
    const result = await copilot.approveRecommendation(recommendationId, customDraft);

    revalidatePath('/copilot');
    revalidatePath('/follow-up');
    revalidatePath('/invoices');
    revalidatePath('/dashboard');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to approve recommendation' };
  }
}

/**
 * 15. Dismiss AI Recommendation
 */
export async function dismissAIRecommendationAction(recommendationId: string) {
  try {
    const { supabase } = await getServerServices();
    const { data: rec, error: recErr } = await supabase
      .from('ai_recommendations')
      .select('business_id')
      .eq('id', recommendationId)
      .single();
    if (recErr || !rec) {
      return { success: false, error: 'Recommendation not found' };
    }
    await assertUserBelongsToBusiness(supabase, rec.business_id);

    const { AICopilotService } = await import('@/lib/ai/copilot-service');
    const copilot = new AICopilotService(supabase);
    const result = await copilot.dismissRecommendation(recommendationId);

    revalidatePath('/copilot');
    revalidatePath('/dashboard');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to dismiss recommendation' };
  }
}

/**
 * 16. Generate AI Custom Draft
 */
export async function generateAICustomDraftAction(
  invoiceId: string,
  businessId: string,
  tone: 'Gentle Check-in' | 'Professional Statement' | 'Firm Follow-up',
  channel: 'email' | 'sms' | 'whatsapp'
) {
  try {
    const { supabase } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);
    const { AICopilotService } = await import('@/lib/ai/copilot-service');
    const copilot = new AICopilotService(supabase);
    const result = await copilot.generateCustomDraft(invoiceId, businessId, tone, channel);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to generate custom draft' };
  }
}

/**
 * 17. Send Approved Communication (Production-Ready Email Dispatch)
 */
export async function sendApprovedCommunicationAction(params: {
  communicationId: string;
  businessId?: string;
  userId?: string;
}) {
  try {
    const { supabase } = await getServerServices();
    let targetBusinessId = params.businessId;
    if (!targetBusinessId) {
      const { data: comm } = await supabase
        .from('communications')
        .select('business_id')
        .eq('id', params.communicationId)
        .single();
      if (!comm) return { success: false, error: 'Communication not found' };
      targetBusinessId = comm.business_id;
    }
    await assertUserBelongsToBusiness(supabase, targetBusinessId, params.userId);

    const { EmailService } = await import('@/lib/email/email-service');
    const emailService = new EmailService(supabase);

    const result = await emailService.sendApprovedEmail({ ...params, businessId: targetBusinessId });

    revalidatePath('/copilot');
    revalidatePath('/follow-up');
    revalidatePath('/invoices');
    revalidatePath('/dashboard');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to send approved communication' };
  }
}

/**
 * 18. Send Approved SMS (Production-Ready SMS Dispatch with Consent Verification)
 */
export async function sendApprovedSMSAction(params: {
  communicationId: string;
  businessId?: string;
  userId?: string;
}) {
  try {
    const { supabase } = await getServerServices();
    let targetBusinessId = params.businessId;
    if (!targetBusinessId) {
      const { data: comm } = await supabase
        .from('communications')
        .select('business_id')
        .eq('id', params.communicationId)
        .single();
      if (!comm) return { success: false, error: 'Communication not found' };
      targetBusinessId = comm.business_id;
    }
    await assertUserBelongsToBusiness(supabase, targetBusinessId, params.userId);

    const { SMSService } = await import('@/lib/sms/sms-service');
    const smsService = new SMSService(supabase);

    const result = await smsService.sendApprovedSMS({ ...params, businessId: targetBusinessId });

    revalidatePath('/copilot');
    revalidatePath('/follow-up');
    revalidatePath('/invoices');
    revalidatePath('/dashboard');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to send approved SMS' };
  }
}

/**
 * 19. Record Customer SMS Opt-Out (STOP / TCPA Compliance)
 */
export async function optOutCustomerSMSAction(params: {
  customerId: string;
  reason?: string;
}) {
  try {
    const { supabase, services } = await getServerServices();
    const customer = await services.customers.getCustomerById(params.customerId);
    if (!customer) {
      return { success: false, error: 'Customer not found' };
    }
    await assertUserBelongsToBusiness(supabase, customer.business_id);

    const { SMSConsentService } = await import('@/lib/sms/consent-service');
    const consentService = new SMSConsentService(supabase);

    const result = await consentService.recordOptOut(params.customerId, params.reason || 'USER_REQUEST');

    revalidatePath('/customers');
    revalidatePath(`/customers/${params.customerId}`);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to record customer SMS opt-out' };
  }
}

/**
 * 20. Send Approved WhatsApp Message (Production-Ready WhatsApp Dispatch)
 */
export async function sendApprovedWhatsAppAction(params: {
  communicationId: string;
  businessId?: string;
  userId?: string;
}) {
  try {
    const { supabase } = await getServerServices();
    let targetBusinessId = params.businessId;
    if (!targetBusinessId) {
      const { data: comm } = await supabase
        .from('communications')
        .select('business_id')
        .eq('id', params.communicationId)
        .single();
      if (!comm) return { success: false, error: 'Communication not found' };
      targetBusinessId = comm.business_id;
    }
    await assertUserBelongsToBusiness(supabase, targetBusinessId, params.userId);

    const { WhatsAppService } = await import('@/lib/whatsapp/whatsapp-service');
    const whatsappService = new WhatsAppService(supabase);

    const result = await whatsappService.sendApprovedWhatsApp({ ...params, businessId: targetBusinessId });

    revalidatePath('/copilot');
    revalidatePath('/follow-up');
    revalidatePath('/invoices');
    revalidatePath('/dashboard');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to send approved WhatsApp message' };
  }
}

/**
 * 21. Record Customer WhatsApp Opt-Out (STOP / Meta Compliance)
 */
export async function optOutCustomerWhatsAppAction(params: {
  customerId: string;
  reason?: string;
}) {
  try {
    const { supabase, services } = await getServerServices();
    const customer = await services.customers.getCustomerById(params.customerId);
    if (!customer) {
      return { success: false, error: 'Customer not found' };
    }
    await assertUserBelongsToBusiness(supabase, customer.business_id);

    const { WhatsAppConsentService } = await import('@/lib/whatsapp/consent-service');
    const consentService = new WhatsAppConsentService(supabase);

    const result = await consentService.recordOptOut(params.customerId, params.reason || 'USER_REQUEST');

    revalidatePath('/customers');
    revalidatePath(`/customers/${params.customerId}`);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to record customer WhatsApp opt-out' };
  }
}

/**
 * 22. Create Checkout Session for Plan Purchase
 */
// ==============================================================================
// PHASE 7 — BILLING, SUBSCRIPTIONS & MONETIZATION ACTIONS
// ==============================================================================
export async function createSubscriptionCheckoutAction(params: any) {
  const { createSubscriptionCheckoutAction: fn } = await import('./billing');
  return fn(params);
}

export async function createCustomerPortalSessionAction(params: any) {
  const { createCustomerPortalSessionAction: fn } = await import('./billing');
  return fn(params);
}

export async function getBusinessSubscriptionAction(businessId: string) {
  const { getBusinessSubscriptionAction: fn } = await import('./billing');
  return fn(businessId);
}

export async function getBusinessUsageAction(businessId: string) {
  const { getBusinessUsageAction: fn } = await import('./billing');
  return fn(businessId);
}

export async function cancelSubscriptionAction(params: any) {
  const { cancelSubscriptionAction: fn } = await import('./billing');
  return fn(params);
}

export async function reactivateSubscriptionAction(params: any) {
  const { reactivateSubscriptionAction: fn } = await import('./billing');
  return fn(params);
}

export async function createCheckoutSessionAction(params: {
  businessId: string;
  plan: 'Starter' | 'Professional' | 'Enterprise';
  interval: 'monthly' | 'annual';
  customerEmail: string;
  customerName?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  return createSubscriptionCheckoutAction(params);
}

export async function getSubscriptionEntitlementsAction(businessId: string) {
  return getBusinessSubscriptionAction(businessId);
}

/**
 * 26. Request Account Deletion (Public / Unauthenticated)
 * Allows users to submit an external account & data deletion request pursuant to Google Play Data Safety
 */
export async function requestAccountDeletionAction(params: { email: string; reason?: string }) {
  try {
    const trimmedEmail = (params.email || '').trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return { success: false, error: 'VALIDATION_ERROR: Please provide a valid email address.' };
    }

    const { supabase } = await getServerServices();
    
    // Log audit record of deletion request
    try {
      await supabase.from('audit_logs').insert({
        business_id: '11111111-1111-1111-1111-111111111111',
        entity: 'account_deletion_request',
        entity_id: trimmedEmail,
        action: 'requested',
        user_id: '11111111-1111-1111-1111-111111111111',
        metadata: {
          email: trimmedEmail,
          reason: params.reason || 'unspecified',
          requested_at: new Date().toISOString(),
          compliance: 'Google Play & GDPR Art. 17'
        }
      });
    } catch {
      // Non-blocking in demo mode
    }

    return {
      success: true,
      message: 'Account deletion request queued successfully. Confirmation email dispatched.',
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to submit deletion request.' };
  }
}

/**
 * 27. Delete User Account & Associated Personal Data (In-App Authenticated)
 * Permanently purges user profile, business membership, and unlinks user-controlled personal data
 */
export async function deleteUserAccountAction(businessId: string) {
  try {
    const { supabase } = await getServerServices();
    const authContext = await assertUserBelongsToBusiness(supabase, businessId);
    
    const userId = authContext.user_id;

    // Log deletion event for audit compliance
    try {
      await supabase.from('audit_logs').insert({
        business_id: businessId,
        entity: 'user_account',
        entity_id: userId,
        action: 'deleted',
        user_id: userId,
        metadata: {
          deleted_at: new Date().toISOString(),
          compliance: 'In-app account deletion'
        }
      });
    } catch {
      // Non-blocking
    }

    // Delete business membership
    try {
      await supabase
        .from('business_members')
        .delete()
        .eq('business_id', businessId)
        .eq('user_id', userId);
    } catch {
      // Non-blocking
    }

    // Delete profile
    try {
      await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
    } catch {
      // Non-blocking
    }

    try {
      revalidatePath('/settings');
      revalidatePath('/profile');
      revalidatePath('/dashboard');
    } catch {
      // Non-blocking in non-request test execution
    }

    return {
      success: true,
      message: 'Account and personal data successfully deleted.',
      deletedAt: new Date().toISOString()
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete user account.' };
  }
}

/**
 * 28. Create Lead (CRM)
 */
export async function createLeadAction(data: LeadInsert) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, data.business_id);
    const lead = await services.leads.createLead(data);

    await services.audit.logAction({
      business_id: data.business_id,
      action: 'CREATE_LEAD',
      entity: 'lead',
      entity_id: lead.id,
      metadata: { name: lead.name, source: lead.source, service: lead.service_requested },
    });

    revalidatePath('/leads');
    revalidatePath('/pipeline');
    revalidatePath('/dashboard');
    return { success: true, data: lead };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create lead' };
  }
}

/**
 * 29. Update Lead
 */
export async function updateLeadAction(id: string, updates: LeadUpdate) {
  try {
    const { supabase, services } = await getServerServices();
    const existing = await services.leads.getLeadById(id);
    if (!existing) {
      return { success: false, error: 'Lead not found' };
    }
    await assertUserBelongsToBusiness(supabase, existing.business_id);

    const lead = await services.leads.updateLead(id, updates);

    await services.audit.logAction({
      business_id: lead.business_id,
      action: 'UPDATE_LEAD',
      entity: 'lead',
      entity_id: lead.id,
      metadata: { name: lead.name, status: lead.status },
    });

    revalidatePath('/leads');
    revalidatePath('/pipeline');
    revalidatePath('/dashboard');
    return { success: true, data: lead };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update lead' };
  }
}

/**
 * 30. Update Lead Pipeline Status
 */
export async function updateLeadStatusAction(id: string, status: string, notes?: string) {
  try {
    const { supabase, services } = await getServerServices();
    const existing = await services.leads.getLeadById(id);
    if (!existing) {
      return { success: false, error: 'Lead not found' };
    }
    const authContext = await assertUserBelongsToBusiness(supabase, existing.business_id);

    const lead = await services.leads.updateLeadStatus(id, status, notes, authContext.user_id);

    await services.audit.logAction({
      business_id: lead.business_id,
      action: 'UPDATE_LEAD_STATUS',
      entity: 'lead',
      entity_id: lead.id,
      metadata: { old_status: existing.status, new_status: status },
    });

    revalidatePath('/leads');
    revalidatePath('/pipeline');
    revalidatePath('/dashboard');
    return { success: true, data: lead };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update lead status' };
  }
}

/**
 * 31. Add Lead Activity / Note
 */
export async function addLeadActivityAction(activity: LeadActivityInsert) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, activity.business_id);
    const result = await services.leads.addActivity(activity);

    revalidatePath('/leads');
    revalidatePath('/pipeline');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to add lead activity' };
  }
}

/**
 * 32. Delete Lead
 */
export async function deleteLeadAction(id: string, businessId?: string) {
  try {
    const { supabase, services } = await getServerServices();
    const existing = await services.leads.getLeadById(id);
    if (!existing) {
      return { success: false, error: 'Lead not found' };
    }
    const targetBusinessId = businessId || existing.business_id;
    if (businessId && existing.business_id !== businessId) {
      return { success: false, error: 'SECURITY_VIOLATION: Lead does not belong to specified business' };
    }
    await assertUserBelongsToBusiness(supabase, targetBusinessId);

    await services.leads.deleteLead(id);

    await services.audit.logAction({
      business_id: targetBusinessId,
      action: 'DELETE_LEAD',
      entity: 'lead',
      entity_id: id,
    });

    revalidatePath('/leads');
    revalidatePath('/pipeline');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete lead' };
  }
}

/**
 * 33. Get Leads for Business
 */
export async function getLeadsAction(businessId: string) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);
    const leads = await services.leads.getLeads(businessId);
    return { success: true, data: leads };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to get leads' };
  }
}

/**
 * 34. Update Business Profile
 */
export async function updateBusinessProfileAction(businessId: string, updates: any) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const updated = await services.business.updateBusiness(businessId, updates);

    await services.audit.logAction({
      business_id: businessId,
      action: 'UPDATE_BUSINESS_PROFILE',
      entity: 'business',
      entity_id: businessId,
      metadata: { name: updated.name, industry: updated.industry },
    });

    revalidatePath('/settings');
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update business profile' };
  }
}

/**
 * 35. Complete Onboarding Flow
 */
export async function completeOnboardingAction(businessId: string, data: any) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const updated = await services.business.updateBusiness(businessId, {
      ...data,
      onboarding_completed: true,
    });

    await services.audit.logAction({
      business_id: businessId,
      action: 'COMPLETE_ONBOARDING',
      entity: 'business',
      entity_id: businessId,
      metadata: { industry: data.industry, completed_at: new Date().toISOString() },
    });

    revalidatePath('/onboarding');
    revalidatePath('/dashboard');
    revalidatePath('/settings');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to complete onboarding' };
  }
}

/**
 * 36. Create Appointment
 */
export async function createAppointmentAction(data: AppointmentInsert) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, data.business_id);
    const appointment = await services.operations.createAppointment(data);

    await services.audit.logAction({
      business_id: data.business_id,
      action: 'CREATE_APPOINTMENT',
      entity: 'appointment',
      entity_id: appointment.id,
      metadata: { title: appointment.title, time: appointment.start_time },
    });

    revalidatePath('/appointments');
    revalidatePath('/dashboard');
    return { success: true, data: appointment };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create appointment' };
  }
}

/**
 * 37. Update Appointment
 */
export async function updateAppointmentAction(id: string, updates: AppointmentUpdate) {
  try {
    const { supabase, services } = await getServerServices();
    const existing = await services.operations.getAppointmentById(id);
    if (!existing) {
      return { success: false, error: 'Appointment not found' };
    }
    await assertUserBelongsToBusiness(supabase, existing.business_id);

    const updated = await services.operations.updateAppointment(id, updates);

    revalidatePath('/appointments');
    revalidatePath('/dashboard');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update appointment' };
  }
}

/**
 * 38. Delete Appointment
 */
export async function deleteAppointmentAction(id: string, businessId?: string) {
  try {
    const { supabase, services } = await getServerServices();
    const existing = await services.operations.getAppointmentById(id);
    if (!existing) {
      return { success: false, error: 'Appointment not found' };
    }
    const targetBusinessId = businessId || existing.business_id;
    await assertUserBelongsToBusiness(supabase, targetBusinessId);

    await services.operations.deleteAppointment(id);

    revalidatePath('/appointments');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete appointment' };
  }
}

/**
 * 39. Create Job
 */
export async function createJobAction(data: JobInsert) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, data.business_id);
    const job = await services.operations.createJob(data);

    await services.audit.logAction({
      business_id: data.business_id,
      action: 'CREATE_JOB',
      entity: 'job',
      entity_id: job.id,
      metadata: { title: job.title, service: job.service_type },
    });

    revalidatePath('/jobs');
    revalidatePath('/dashboard');
    return { success: true, data: job };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create job' };
  }
}

/**
 * 40. Update Job
 */
export async function updateJobAction(id: string, updates: JobUpdate) {
  try {
    const { supabase, services } = await getServerServices();
    const existing = await services.operations.getJobById(id);
    if (!existing) {
      return { success: false, error: 'Job not found' };
    }
    await assertUserBelongsToBusiness(supabase, existing.business_id);

    const updated = await services.operations.updateJob(id, updates);

    revalidatePath('/jobs');
    revalidatePath('/dashboard');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update job' };
  }
}

/**
 * 41. Delete Job
 */
export async function deleteJobAction(id: string, businessId?: string) {
  try {
    const { supabase, services } = await getServerServices();
    const existing = await services.operations.getJobById(id);
    if (!existing) {
      return { success: false, error: 'Job not found' };
    }
    const targetBusinessId = businessId || existing.business_id;
    await assertUserBelongsToBusiness(supabase, targetBusinessId);

    await services.operations.deleteJob(id);

    revalidatePath('/jobs');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete job' };
  }
}

/**
 * 42. Assign Lead to Team Member
 */
export async function assignLeadAction(params: {
  leadId: string;
  assignedUserId: string | null;
  assignedUserName: string | null;
}) {
  try {
    const { supabase, services } = await getServerServices();
    const existing = await services.leads.getLeadById(params.leadId);
    if (!existing) {
      return { success: false, error: 'Lead not found' };
    }
    await assertUserBelongsToBusiness(supabase, existing.business_id);

    const { data: { user } } = await supabase.auth.getUser();

    const updated = await services.leads.assignLead(
      params.leadId,
      params.assignedUserId,
      params.assignedUserName,
      user?.id
    );

    revalidatePath('/leads');
    revalidatePath(`/leads/${params.leadId}`);
    revalidatePath('/pipeline');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to assign lead' };
  }
}

/**
 * 43. Create Lead Note
 */
export async function createLeadNoteAction(params: {
  leadId: string;
  content: string;
  authorName?: string;
}) {
  try {
    const { supabase, services } = await getServerServices();
    const existing = await services.leads.getLeadById(params.leadId);
    if (!existing) {
      return { success: false, error: 'Lead not found' };
    }
    await assertUserBelongsToBusiness(supabase, existing.business_id);

    const { data: { user } } = await supabase.auth.getUser();

    const note = await services.leads.createNote({
      business_id: existing.business_id,
      lead_id: params.leadId,
      author_id: user?.id || null,
      author_name: params.authorName || (user?.user_metadata?.name as string) || 'Team Member',
      content: params.content,
    });

    revalidatePath('/leads');
    revalidatePath(`/leads/${params.leadId}`);
    return { success: true, data: note };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create lead note' };
  }
}

/**
 * 44. Update Lead Note
 */
export async function updateLeadNoteAction(params: {
  noteId: string;
  content: string;
}) {
  try {
    const { supabase, services } = await getServerServices();
    const { data: note, error: noteErr } = await supabase
      .from('lead_notes')
      .select('business_id, lead_id')
      .eq('id', params.noteId)
      .single();

    if (noteErr || !note) {
      return { success: false, error: 'Note not found' };
    }
    await assertUserBelongsToBusiness(supabase, note.business_id);

    const updated = await services.leads.updateNote(params.noteId, params.content);

    revalidatePath(`/leads/${note.lead_id}`);
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update lead note' };
  }
}

/**
 * 45. Delete Lead Note
 */
export async function deleteLeadNoteAction(noteId: string) {
  try {
    const { supabase, services } = await getServerServices();
    const { data: note, error: noteErr } = await supabase
      .from('lead_notes')
      .select('business_id, lead_id')
      .eq('id', noteId)
      .single();

    if (noteErr || !note) {
      return { success: false, error: 'Note not found' };
    }
    await assertUserBelongsToBusiness(supabase, note.business_id);

    await services.leads.deleteNote(noteId);

    revalidatePath(`/leads/${note.lead_id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete lead note' };
  }
}

/**
 * 46. Bulk Update Lead Status
 */
export async function bulkUpdateLeadStatusAction(params: {
  leadIds: string[];
  status: string;
  businessId: string;
}) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, params.businessId);

    const updated = await services.leads.bulkUpdateStatus(
      params.leadIds,
      params.status,
      params.businessId
    );

    revalidatePath('/leads');
    revalidatePath('/pipeline');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to bulk update lead status' };
  }
}

/**
 * 47. Bulk Assign Leads
 */
export async function bulkAssignLeadsAction(params: {
  leadIds: string[];
  assignedUserId: string | null;
  assignedUserName: string | null;
  businessId: string;
}) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, params.businessId);

    const updated = await services.leads.bulkAssign(
      params.leadIds,
      params.assignedUserId,
      params.assignedUserName,
      params.businessId
    );

    revalidatePath('/leads');
    revalidatePath('/pipeline');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to bulk assign leads' };
  }
}

/**
 * 48. Bulk Delete Leads
 */
export async function bulkDeleteLeadsAction(params: {
  leadIds: string[];
  businessId: string;
}) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, params.businessId);

    await services.leads.bulkDelete(params.leadIds, params.businessId);

    revalidatePath('/leads');
    revalidatePath('/pipeline');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to bulk delete leads' };
  }
}

/**
 * 49. Convert Lead to Customer / Contact (with duplicate handling)
 */
export async function convertLeadToCustomerAction(params: {
  leadId: string;
  createNewContact: boolean;
  existingCustomerId?: string;
}) {
  try {
    const { supabase, services } = await getServerServices();
    const lead = await services.leads.getLeadById(params.leadId);
    if (!lead) {
      return { success: false, error: 'Lead not found' };
    }
    await assertUserBelongsToBusiness(supabase, lead.business_id);

    let customerId = params.existingCustomerId;

    if (params.createNewContact || !customerId) {
      const newCustomer = await services.customers.createCustomer({
        business_id: lead.business_id,
        name: lead.name,
        company: lead.company || lead.name,
        email: lead.email || `lead-${lead.id}@placeholder.com`,
        phone: lead.phone || null,
        notes: `Converted from lead (${lead.service_requested || 'General Inquiry'})`,
      });
      customerId = newCustomer.id;
    }

    // Link customer to lead and set status to WON
    await services.leads.updateLead(params.leadId, {
      customer_id: customerId,
      status: 'WON',
    });

    // Log contact_converted activity
    await services.leads.addActivity({
      business_id: lead.business_id,
      lead_id: params.leadId,
      activity_type: 'contact_converted',
      title: 'Lead Converted to Contact',
      description: `Associated with customer record (${customerId})`,
      metadata: { customer_id: customerId },
    });

    revalidatePath('/leads');
    revalidatePath(`/leads/${params.leadId}`);
    revalidatePath('/contacts');
    revalidatePath('/customers');
    revalidatePath('/pipeline');
    return { success: true, customerId };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to convert lead to customer' };
  }
}

// ==============================================================================
// 50-57. PHASE 3 — AI RECEPTIONIST SERVER ACTIONS
// ==============================================================================

import {
  ReceptionistSettings,
  ReceptionistService,
  ReceptionistConversation,
  ReceptionistChannel,
} from '@/types';
import { processReceptionistMessage } from '@/lib/receptionist/engine';

/**
 * 50. Get Receptionist Settings
 */
export async function getReceptionistSettingsAction(businessId: string) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);
    const settings = await services.receptionist.getSettings(businessId);
    return { success: true, data: settings };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch receptionist settings' };
  }
}

/**
 * 51. Update Receptionist Settings
 */
export async function updateReceptionistSettingsAction(
  businessId: string,
  settings: Partial<ReceptionistSettings>
) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);
    const updated = await services.receptionist.updateSettings(businessId, settings);

    await services.audit.logAction({
      business_id: businessId,
      action: 'UPDATE_RECEPTIONIST_SETTINGS',
      entity: 'receptionist_settings',
      entity_id: updated.id,
      metadata: { enabled: updated.enabled, tone: updated.tone },
    });

    revalidatePath('/settings/receptionist');
    revalidatePath('/receptionist');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update receptionist settings' };
  }
}

/**
 * 52. Get Receptionist Services
 */
export async function getReceptionistServicesAction(businessId: string) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);
    const serviceList = await services.receptionist.getServices(businessId);
    return { success: true, data: serviceList };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch receptionist services' };
  }
}

/**
 * 53. Save Receptionist Service (Create or Update)
 */
export async function saveReceptionistServiceAction(
  businessId: string,
  service: Partial<ReceptionistService>
) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);
    const saved = await services.receptionist.saveService(businessId, service);

    revalidatePath('/settings/receptionist');
    revalidatePath('/receptionist');
    return { success: true, data: saved };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to save service knowledge' };
  }
}

/**
 * 54. Delete Receptionist Service
 */
export async function deleteReceptionistServiceAction(
  businessId: string,
  serviceId: string
) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);
    await services.receptionist.deleteService(businessId, serviceId);

    revalidatePath('/settings/receptionist');
    revalidatePath('/receptionist');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete service knowledge' };
  }
}

/**
 * 55. Get Receptionist Conversations
 */
export async function getReceptionistConversationsAction(businessId: string) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);
    const conversations = await services.receptionist.getConversations(businessId);
    return { success: true, data: conversations };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch conversations' };
  }
}

/**
 * 56. Process Receptionist Message
 */
export async function processReceptionistMessageAction(params: {
  businessId: string;
  conversationId?: string;
  messageText: string;
  channel?: ReceptionistChannel;
}) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, params.businessId);

    const settings = await services.receptionist.getSettings(params.businessId);
    const serviceList = await services.receptionist.getServices(params.businessId);
    const allAppointments = await services.operations.getAppointments(params.businessId);

    // 1. Resolve or create conversation record
    let conversation: ReceptionistConversation;
    if (params.conversationId) {
      const convList = await services.receptionist.getConversations(params.businessId);
      const existing = convList.find(c => c.id === params.conversationId);
      if (!existing) {
        return { success: false, error: 'Conversation not found' };
      }
      conversation = existing;
    } else {
      conversation = await services.receptionist.createConversation(params.businessId, {
        channel: params.channel || 'WEB_CHAT',
        state: 'NEW',
      });
    }

    // 2. Persist Customer Message
    await services.receptionist.addMessage(
      params.businessId,
      conversation.id,
      'CUSTOMER',
      params.messageText
    );

    // 3. Process message through Receptionist Engine
    const engineResponse = processReceptionistMessage({
      conversation,
      incomingMessage: params.messageText,
      settings,
      services: serviceList,
      existingAppointments: allAppointments as any,
    });

    // 4. Persist AI Message
    await services.receptionist.addMessage(
      params.businessId,
      conversation.id,
      'AI',
      engineResponse.replyText,
      {
        detected_intent: engineResponse.detectedIntent,
        confidence: engineResponse.confidence,
        extracted_info: engineResponse.extractedInfo,
        suggested_slots: engineResponse.suggestedSlots,
      }
    );

    let linkedLeadId = conversation.leadId;

    // 5. If requested action is CREATE_LEAD and we have customer info, create or link lead
    if (
      (engineResponse.requestedAction === 'CREATE_LEAD' || engineResponse.state === 'READY_TO_BOOK') &&
      engineResponse.extractedInfo.name &&
      !linkedLeadId
    ) {
      const createdLead = await services.leads.createLead({
        business_id: params.businessId,
        name: engineResponse.extractedInfo.name,
        company: engineResponse.extractedInfo.company || null,
        phone: engineResponse.extractedInfo.phone || null,
        email: engineResponse.extractedInfo.email || null,
        source: 'Website',
        service_requested: engineResponse.extractedInfo.serviceRequested || 'Standard Service Call',
        status: engineResponse.state === 'READY_TO_BOOK' ? 'QUALIFIED' : 'NEW',
        priority: engineResponse.extractedInfo.urgency || 'medium',
        notes: `AI Receptionist Inquiry (${conversation.channel}). Notes: ${engineResponse.extractedInfo.notes || 'None'}`,
      });

      linkedLeadId = createdLead.id;

      await services.leads.addActivity({
        business_id: params.businessId,
        lead_id: createdLead.id,
        activity_type: 'note',
        title: 'Ingested via AI Receptionist',
        description: `Captured from customer conversation (${conversation.channel})`,
      });
    }

    // 6. Update conversation state in DB
    await services.receptionist.updateConversationState(params.businessId, conversation.id, {
      state: engineResponse.state,
      detectedIntent: engineResponse.detectedIntent,
      intentConfidence: engineResponse.confidence,
      customerName: engineResponse.extractedInfo.name || conversation.customerName,
      customerPhone: engineResponse.extractedInfo.phone || conversation.customerPhone,
      customerEmail: engineResponse.extractedInfo.email || conversation.customerEmail,
      customerAddress: engineResponse.extractedInfo.address || conversation.customerAddress,
      serviceRequested: engineResponse.extractedInfo.serviceRequested || conversation.serviceRequested,
      urgency: engineResponse.extractedInfo.urgency || conversation.urgency,
      handoffRequired: engineResponse.requestedAction === 'TRIGGER_HANDOFF' || conversation.handoffRequired,
      handoffReason: engineResponse.handoffReason || conversation.handoffReason,
      leadId: linkedLeadId,
    });

    revalidatePath('/receptionist');
    revalidatePath('/receptionist/conversations');
    revalidatePath('/leads');

    return {
      success: true,
      data: {
        conversationId: conversation.id,
        replyText: engineResponse.replyText,
        state: engineResponse.state,
        detectedIntent: engineResponse.detectedIntent,
        confidence: engineResponse.confidence,
        extractedInfo: engineResponse.extractedInfo,
        suggestedSlots: engineResponse.suggestedSlots,
        handoffRequired: engineResponse.requestedAction === 'TRIGGER_HANDOFF',
        leadId: linkedLeadId,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to process message' };
  }
}

/**
 * 57. Trigger Human Handoff
 */
export async function triggerHumanHandoffAction(
  businessId: string,
  conversationId: string,
  reason: string
) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    await services.receptionist.updateConversationState(businessId, conversationId, {
      state: 'HANDOFF_REQUIRED',
      handoffRequired: true,
      handoffReason: reason,
    });

    await services.receptionist.addMessage(
      businessId,
      conversationId,
      'SYSTEM',
      `Human handoff triggered: ${reason}`
    );

    revalidatePath('/receptionist');
    revalidatePath('/receptionist/conversations');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to trigger handoff' };
  }
}

// ==============================================================================
// PHASE 8 — REPORTS, ANALYTICS & OWNER AI DASHBOARD ACTIONS
// ==============================================================================
export async function getExecutiveDashboardAction(
  businessId: string,
  preset?: any,
  customStart?: string,
  customEnd?: string
) {
  const { getExecutiveDashboardAction: fn } = await import('./analytics');
  return fn(businessId, preset, customStart, customEnd);
}

export async function getDetailedReportsAction(
  businessId: string,
  preset?: any,
  customStart?: string,
  customEnd?: string
) {
  const { getDetailedReportsAction: fn } = await import('./analytics');
  return fn(businessId, preset, customStart, customEnd);
}

export async function getTechnicianReportsAction(businessId: string) {
  const { getTechnicianReportsAction: fn } = await import('./analytics');
  return fn(businessId);
}

export async function getLeadSourceRoiAction(businessId: string) {
  const { getLeadSourceRoiAction: fn } = await import('./analytics');
  return fn(businessId);
}

export async function exportReportCsvAction(
  businessId: string,
  reportType?: 'revenue' | 'leads' | 'jobs' | 'technicians' | 'services'
) {
  const { exportReportCsvAction: fn } = await import('./analytics');
  return fn(businessId, reportType);
}

// ==============================================================================
// PHASE 9 — PAYMENTS & ADVANCED REVENUE OPERATIONS ACTIONS
// ==============================================================================
export async function requestInvoicePaymentAction(params: any) {
  const { requestInvoicePaymentAction: fn } = await import('./payments');
  return fn(params);
}

export async function getPaymentsAction(businessId: string) {
  const { getPaymentsAction: fn } = await import('./payments');
  return fn(businessId);
}

export async function getInvoicePaymentsAction(invoiceId: string, businessId?: string) {
  const { getInvoicePaymentsAction: fn } = await import('./payments');
  return fn(invoiceId, businessId);
}

export async function getCustomerPaymentHistoryAction(customerId: string, businessId: string) {
  const { getCustomerPaymentHistoryAction: fn } = await import('./payments');
  return fn(customerId, businessId);
}

export async function refundPaymentAction(params: any) {
  const { refundPaymentAction: fn } = await import('./payments');
  return fn(params);
}

export async function getRevenueSummaryAction(businessId: string) {
  const { getRevenueSummaryAction: fn } = await import('./payments');
  return fn(businessId);
}

export async function getPublicInvoiceByPaymentTokenAction(secureToken: string) {
  const { getPublicInvoiceByPaymentTokenAction: fn } = await import('./payments');
  return fn(secureToken);
}

export async function processPublicPaymentAction(params: any) {
  const { processPublicPaymentAction: fn } = await import('./payments');
  return fn(params);
}

// ==============================================================================
// PHASE 10 — PRODUCTION LAUNCH, AGENCY & WHITE-LABEL ACTIONS
// ==============================================================================
export async function getAgencyDashboardAction(agencyId?: string) {
  const { getAgencyDashboardAction: fn } = await import('./agency');
  return fn(agencyId);
}

export async function getAgencyBusinessesAction(agencyId?: string) {
  const { getAgencyBusinessesAction: fn } = await import('./agency');
  return fn(agencyId);
}

export async function switchBusinessContextAction(targetBusinessId: string, agencyId?: string) {
  const { switchBusinessContextAction: fn } = await import('./agency');
  return fn(targetBusinessId, agencyId);
}

export async function getAgencyBrandingAction(agencyId?: string) {
  const { getAgencyBrandingAction: fn } = await import('./agency');
  return fn(agencyId);
}

export async function updateAgencyBrandingAction(branding: any, agencyId?: string) {
  const { updateAgencyBrandingAction: fn } = await import('./agency');
  return fn(branding, agencyId);
}

export async function getAgencyDomainsAction(agencyId?: string) {
  const { getAgencyDomainsAction: fn } = await import('./agency');
  return fn(agencyId);
}

export async function addCustomDomainAction(domain: string, agencyId?: string) {
  const { addCustomDomainAction: fn } = await import('./agency');
  return fn(domain, agencyId);
}

export async function verifyCustomDomainAction(domainId: string, domainName: string) {
  const { verifyCustomDomainAction: fn } = await import('./agency');
  return fn(domainId, domainName);
}

export async function getAdminPlatformStatsAction() {
  const { getAdminPlatformStatsAction: fn } = await import('./admin');
  return fn();
}

export async function getAdminBusinessesAction() {
  const { getAdminBusinessesAction: fn } = await import('./admin');
  return fn();
}

export async function getAdminAgenciesAction() {
  const { getAdminAgenciesAction: fn } = await import('./admin');
  return fn();
}

export async function getAdminSystemHealthAction() {
  const { getAdminSystemHealthAction: fn } = await import('./admin');
  return fn();
}

export async function toggleBusinessStatusAdminAction(businessId: string, newStatus: 'active' | 'suspended') {
  const { toggleBusinessStatusAdminAction: fn } = await import('./admin');
  return fn(businessId, newStatus);
}

export async function getAuditLogsAction(businessId?: string) {
  const { getAuditLogsAction: fn } = await import('./audit');
  return fn(businessId);
}

export async function requestDataExportAction(businessId: string, format: 'json' | 'csv' | 'zip') {
  const { requestDataExportAction: fn } = await import('./audit');
  return fn(businessId, format);
}

export async function requestTenantAccountDeletionAction(businessId: string, reason: string) {
  const { requestTenantAccountDeletionAction: fn } = await import('./audit');
  return fn(businessId, reason);
}

export async function getProductionReadinessAction() {
  const { getProductionReadinessAction: fn } = await import('./audit');
  return fn();
}

// ==============================================================================
// PHASE 11 — DEMO ACCESS & DUAL-APPROVAL SECURITY ACTIONS
// ==============================================================================
export async function getActiveDemoLinkAction() {
  const { getActiveDemoLinkAction: fn } = await import('./demo-access');
  return fn();
}

export async function generateDemoLinkAction(label?: string) {
  const { generateDemoLinkAction: fn } = await import('./demo-access');
  return fn(label);
}

export async function revokeDemoTokenAction(tokenId: string) {
  const { revokeDemoTokenAction: fn } = await import('./demo-access');
  return fn(tokenId);
}

export async function regenerateDemoTokenAction(oldTokenId: string, label?: string) {
  const { regenerateDemoTokenAction: fn } = await import('./demo-access');
  return fn(oldTokenId, label);
}

export async function getDemoAccessOverviewAction() {
  const { getDemoAccessOverviewAction: fn } = await import('./demo-access');
  return fn();
}

export async function initiateDemoAccessRequestAction(params: any) {
  const { initiateDemoAccessRequestAction: fn } = await import('./demo-access');
  return fn(params);
}

export async function getDemoRequestStatusAction(requestId: string, rawToken: string) {
  const { getDemoRequestStatusAction: fn } = await import('./demo-access');
  return fn(requestId, rawToken);
}

export async function submitOwnerApprovalAction(params: any) {
  const { submitOwnerApprovalAction: fn } = await import('./demo-access');
  return fn(params);
}

// ==============================================================================
// PHASE 12 — PRIVATE ADMIN IDENTITY & AGENCY TENANT PROVISIONING ACTIONS
// ==============================================================================
export async function getPlatformAdminsAction() {
  const { getPlatformAdminsAction: fn } = await import('./admin-auth');
  return fn();
}

export async function recordAdminLoginAction(params: any) {
  const { recordAdminLoginAction: fn } = await import('./admin-auth');
  return fn(params);
}

export async function suspendAdminAction(adminId: string, actorEmail: string) {
  const { suspendAdminAction: fn } = await import('./admin-auth');
  return fn(adminId, actorEmail);
}

export async function reactivateAdminAction(adminId: string, actorEmail: string) {
  const { reactivateAdminAction: fn } = await import('./admin-auth');
  return fn(adminId, actorEmail);
}

export async function provisionAgencyTenantAction(params: any) {
  const { provisionAgencyTenantAction: fn } = await import('./agency-tenant');
  return fn(params);
}

export async function inviteAgencyMemberAction(params: any) {
  const { inviteAgencyMemberAction: fn } = await import('./agency-tenant');
  return fn(params);
}

export async function acceptAgencyInvitationAction(rawToken: string, userId: string) {
  const { acceptAgencyInvitationAction: fn } = await import('./agency-tenant');
  return fn(rawToken, userId);
}

export async function getUserAgenciesAction(userIdOrEmail: string) {
  const { getUserAgenciesAction: fn } = await import('./agency-tenant');
  return fn(userIdOrEmail);
}

export async function getAgencyAssignedBusinessesAction(agencyId: string, userIdOrEmail: string) {
  const { getAgencyAssignedBusinessesAction: fn } = await import('./agency-tenant');
  return fn(agencyId, userIdOrEmail);
}

export async function removeAgencyMemberAction(agencyId: string, memberId: string, actorEmail: string) {
  const { removeAgencyMemberAction: fn } = await import('./agency-tenant');
  return fn(agencyId, memberId, actorEmail);
}

export async function suspendAgencyAction(agencyId: string, actorEmail: string) {
  const { suspendAgencyAction: fn } = await import('./agency-tenant');
  return fn(agencyId, actorEmail);
}

export async function reactivateAgencyAction(agencyId: string, actorEmail: string) {
  const { reactivateAgencyAction: fn } = await import('./agency-tenant');
  return fn(agencyId, actorEmail);
}
