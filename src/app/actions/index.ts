'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createSupabaseServices } from '@/lib/supabase/services';
import { CreateInvoiceParams } from '@/lib/supabase/services/invoices';
import { RecordPaymentParams } from '@/lib/supabase/services/payments';
import { CreateCommunicationParams } from '@/lib/supabase/services/communications';
import { CreateNotificationParams } from '@/lib/supabase/services/notifications';
import { CustomerInsert, CustomerUpdate } from '@/lib/supabase/services/customers';
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
    const { services } = await getServerServices();
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
    const { services } = await getServerServices();
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
    const { services } = await getServerServices();
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
    const { services } = await getServerServices();
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
    const { services } = await getServerServices();
    await services.invoices.deleteInvoice(id);

    if (businessId) {
      await services.audit.logAction({
        business_id: businessId,
        action: 'DELETE_INVOICE',
        entity: 'invoice',
        entity_id: id,
      });
    }

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
    const { services } = await getServerServices();
    const result = await services.payments.recordPayment(params);

    revalidatePath('/invoices');
    revalidatePath(`/invoices/${params.invoice_id}`);
    revalidatePath('/dashboard');
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
    const { services } = await getServerServices();
    const invoice = await services.invoices.getInvoiceById(id);
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
    const { services } = await getServerServices();
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
    const { services } = await getServerServices();
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
    const { services } = await getServerServices();
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
    const { services } = await getServerServices();
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
    const { services } = await getServerServices();
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
    const { EmailService } = await import('@/lib/email/email-service');
    const emailService = new EmailService(supabase);

    const result = await emailService.sendApprovedEmail(params);

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
    const { SMSService } = await import('@/lib/sms/sms-service');
    const smsService = new SMSService(supabase);

    const result = await smsService.sendApprovedSMS(params);

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
    const { supabase } = await getServerServices();
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
    const { WhatsAppService } = await import('@/lib/whatsapp/whatsapp-service');
    const whatsappService = new WhatsAppService(supabase);

    const result = await whatsappService.sendApprovedWhatsApp(params);

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
    const { supabase } = await getServerServices();
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
export async function createCheckoutSessionAction(params: {
  businessId: string;
  plan: 'Starter' | 'Professional' | 'Enterprise';
  interval: 'monthly' | 'annual';
  customerEmail: string;
  customerName?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  try {
    const { supabase } = await getServerServices();
    const { BillingService } = await import('@/lib/billing/billing-service');
    const billingService = new BillingService(supabase);

    const result = await billingService.createCheckoutSession(params);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create checkout session' };
  }
}

/**
 * 23. Process Payment Provider Webhook
 */
export async function handlePaymentWebhookAction(payload: string, signature: string, secret?: string) {
  try {
    const { supabase } = await getServerServices();
    const { BillingService } = await import('@/lib/billing/billing-service');
    const billingService = new BillingService(supabase);

    const result = await billingService.handleWebhook(payload, signature, secret);

    revalidatePath('/pricing');
    revalidatePath('/dashboard');
    revalidatePath('/settings');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to handle payment webhook' };
  }
}

/**
 * 24. Cancel Subscription (Immediate or Period End)
 */
export async function cancelSubscriptionAction(params: {
  businessId: string;
  cancelAtPeriodEnd?: boolean;
  userId?: string;
}) {
  try {
    const { supabase } = await getServerServices();
    const { BillingService } = await import('@/lib/billing/billing-service');
    const billingService = new BillingService(supabase);

    const result = await billingService.cancelSubscription(params);

    revalidatePath('/pricing');
    revalidatePath('/settings');
    revalidatePath('/dashboard');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to cancel subscription' };
  }
}

/**
 * 25. Get Subscription Entitlements
 */
export async function getSubscriptionEntitlementsAction(businessId: string) {
  try {
    const { supabase } = await getServerServices();
    const { BillingService } = await import('@/lib/billing/billing-service');
    const billingService = new BillingService(supabase);

    const result = await billingService.getSubscriptionDetails(businessId);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch subscription entitlements' };
  }
}
