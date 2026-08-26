'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createSupabaseServices } from '@/lib/supabase/services';
import { RecordPaymentParams } from '@/lib/supabase/services/payments';
import { PaymentMethodType, RefundPaymentParams } from '@/lib/payments/types';
import { revalidatePath } from 'next/cache';

async function getServerServices() {
  const supabase = await createServerSupabaseClient();
  const services = createSupabaseServices(supabase);
  return { supabase, services };
}

/**
 * Enforces business tenant isolation
 */
async function assertUserBelongsToBusiness(supabase: any, businessId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to perform payment operations.');
  }

  const { data: member, error } = await supabase
    .from('business_members')
    .select('role')
    .eq('business_id', businessId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !member) {
    throw new Error('Unauthorized: You do not belong to this business organization.');
  }

  return { user, role: member.role };
}

/**
 * 1. Record an Authoritative Payment (Manual, Cash, Check, Wire, Card)
 */
export async function recordPaymentAction(params: RecordPaymentParams) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, params.business_id);

    const result = await services.payments.recordPayment(params);

    revalidatePath('/payments');
    revalidatePath('/invoices');
    revalidatePath(`/invoices/${params.invoice_id}`);
    revalidatePath('/dashboard');
    revalidatePath('/reports');

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to record payment.' };
  }
}

/**
 * 2. Request Payment via Email / SMS / WhatsApp / Direct Link
 */
export async function requestInvoicePaymentAction(params: {
  businessId: string;
  invoiceId: string;
  channel: 'email' | 'sms' | 'whatsapp' | 'direct_link';
  customMessage?: string;
}) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, params.businessId);

    const result = await services.payments.createPaymentRequest(params);

    revalidatePath('/payments');
    revalidatePath(`/invoices/${params.invoiceId}`);

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to dispatch payment request.' };
  }
}

/**
 * 3. Retrieve Payments for a Business Ledger
 */
export async function getPaymentsAction(businessId: string) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const payments = await services.payments.getPaymentsByBusiness(businessId);
    return { success: true, data: payments };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch payments.' };
  }
}

/**
 * 4. Retrieve Payments for a Specific Invoice
 */
export async function getInvoicePaymentsAction(invoiceId: string, businessId?: string) {
  try {
    const { supabase, services } = await getServerServices();
    if (businessId) {
      await assertUserBelongsToBusiness(supabase, businessId);
    }

    const payments = await services.payments.getPaymentsByInvoice(invoiceId, businessId);
    return { success: true, data: payments };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch invoice payments.' };
  }
}

/**
 * 5. Retrieve Customer Payment History
 */
export async function getCustomerPaymentHistoryAction(customerId: string, businessId: string) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const payments = await services.payments.getPaymentsByCustomer(customerId, businessId);
    return { success: true, data: payments };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch customer payment history.' };
  }
}

/**
 * 6. Process Full or Partial Refund
 */
export async function refundPaymentAction(params: RefundPaymentParams) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, params.businessId);

    const result = await services.payments.refundPayment(params);

    revalidatePath('/payments');
    revalidatePath('/invoices');
    revalidatePath(`/invoices/${params.invoiceId}`);
    revalidatePath('/dashboard');

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to process refund.' };
  }
}

/**
 * 7. Retrieve Revenue Operations Summary
 */
export async function getRevenueSummaryAction(businessId: string) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const summary = await services.payments.getRevenueSummary(businessId);
    return { success: true, data: summary };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to calculate revenue summary.' };
  }
}

/**
 * 8. Public Action: Fetch Public Invoice via Secure Token (/pay/[secure_token])
 */
export async function getPublicInvoiceByPaymentTokenAction(secureToken: string) {
  try {
    const { services } = await getServerServices();
    const publicView = await services.payments.getPublicInvoiceByToken(secureToken);
    return { success: true, data: publicView };
  } catch (error: any) {
    return { success: false, error: error.message || 'Invalid or expired payment link.' };
  }
}

/**
 * 9. Public Action: Process Online Payment for /pay/[secure_token]
 */
export async function processPublicPaymentAction(params: {
  secureToken: string;
  amount: number;
  paymentMethod: PaymentMethodType;
  reference?: string;
}) {
  try {
    const { services } = await getServerServices();
    const result = await services.payments.processPublicPayment(params);

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Payment processing failed.' };
  }
}
