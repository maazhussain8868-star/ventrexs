'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createSupabaseServices } from '@/lib/supabase/services';
import { calculateServerEstimateTotals } from '@/lib/supabase/services/estimates';
import { assertUserBelongsToBusiness } from '@/lib/auth/server-authorization';
import { AutomationTriggerDispatcher } from '@/lib/communications/automation-triggers';
import { revalidatePath } from 'next/cache';

async function getServerServices() {
  const supabase = await createServerSupabaseClient();
  const services = createSupabaseServices(supabase);
  return { supabase, services };
}

/**
 * 1. Get Estimates List for Business
 */
export async function getEstimatesAction(businessId: string, filter?: {
  status?: string;
  customerId?: string;
  jobId?: string;
}) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const estimates = await services.estimates.getEstimates(businessId, filter);
    return { success: true, data: estimates };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch estimates' };
  }
}

/**
 * 2. Get Estimate with Full Details
 */
export async function getEstimateByIdAction(id: string, businessId: string) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const estimate = await services.estimates.getEstimateById(id);
    if (!estimate || estimate.business_id !== businessId) {
      return { success: false, error: 'Estimate not found or inaccessible' };
    }

    return { success: true, data: estimate };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch estimate' };
  }
}

/**
 * 3. Create Estimate (Server-side arithmetic verification with integer cents)
 */
export async function createEstimateAction(params: {
  businessId: string;
  customerId?: string;
  jobId?: string;
  leadId?: string;
  title: string;
  description?: string;
  items: Array<{
    id?: string;
    description: string;
    quantity: number;
    unitPrice?: number;
    unit_price?: number;
    amount?: number;
  }>;
  taxRate?: number;
  discountAmount?: number;
  validUntil?: string;
  notes?: string;
}) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, params.businessId);

    const { data: { user } } = await supabase.auth.getUser();

    // Server-side calculation of totals using integer cents arithmetic
    const totals = calculateServerEstimateTotals(
      params.items,
      params.taxRate || 0,
      params.discountAmount || 0
    );

    // Format items with computed line totals
    const formattedItems = params.items.map((item, idx) => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.unitPrice ?? item.unit_price) || 0;
      const lineTotal = Math.round(qty * price * 100) / 100;
      return {
        id: item.id || `item-${Date.now()}-${idx}`,
        description: item.description || 'Service Line Item',
        quantity: qty,
        unitPrice: price,
        amount: lineTotal,
      };
    });

    const estimateNumber = `EST-${Math.floor(1000 + Math.random() * 9000)}`;

    const estimate = await services.estimates.createEstimate({
      business_id: params.businessId,
      customer_id: params.customerId || null,
      job_id: params.jobId || null,
      lead_id: params.leadId || null,
      estimate_number: estimateNumber,
      title: params.title,
      description: params.description || null,
      items: formattedItems as any,
      subtotal: totals.subtotal,
      tax_rate: params.taxRate || 0,
      tax_amount: totals.taxAmount,
      discount_amount: totals.discountAmount,
      total_amount: totals.totalAmount,
      status: 'DRAFT',
      valid_until: params.validUntil || null,
      notes: params.notes || null,
      created_by: user?.id || null,
    });

    // If linked to a job, log activity and link estimate_id
    if (params.jobId) {
      await services.operations.updateJob(params.jobId, {
        estimate_id: estimate.id,
        estimated_total: totals.totalAmount,
      });

      await services.operations.addJobActivity({
        business_id: params.businessId,
        job_id: params.jobId,
        activity_type: 'ESTIMATE_CREATED',
        title: `Estimate Created: ${estimateNumber}`,
        description: `Draft estimate created for $${totals.totalAmount.toFixed(2)}`,
        user_id: user?.id || null,
        user_name: (user?.user_metadata?.name as string) || 'Estimator',
        metadata: { estimateId: estimate.id, totalAmount: totals.totalAmount },
      });
    }

    await services.audit.logAction({
      business_id: params.businessId,
      action: 'CREATE_ESTIMATE',
      entity: 'estimate',
      entity_id: estimate.id,
      metadata: { estimateNumber, totalAmount: totals.totalAmount },
    });

    revalidatePath('/estimates');
    if (params.jobId) revalidatePath(`/jobs/${params.jobId}`);
    return { success: true, data: estimate };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create estimate' };
  }
}

/**
 * 4. Update Estimate
 */
export async function updateEstimateAction(
  id: string,
  businessId: string,
  updates: {
    title?: string;
    description?: string;
    items?: Array<{ description: string; quantity: number; unitPrice: number }>;
    taxRate?: number;
    discountAmount?: number;
    validUntil?: string;
    notes?: string;
  }
) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const existing = await services.estimates.getEstimateById(id);
    if (!existing || existing.business_id !== businessId) {
      return { success: false, error: 'Estimate not found' };
    }

    let computedUpdates: any = { ...updates };

    if (updates.items) {
      const totals = calculateServerEstimateTotals(
        updates.items,
        updates.taxRate ?? existing.tax_rate,
        updates.discountAmount ?? existing.discount_amount
      );
      const formattedItems = updates.items.map((item, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: Math.round(item.quantity * item.unitPrice * 100) / 100,
      }));

      computedUpdates = {
        ...computedUpdates,
        items: formattedItems,
        subtotal: totals.subtotal,
        tax_amount: totals.taxAmount,
        discount_amount: totals.discountAmount,
        total_amount: totals.totalAmount,
      };
    }

    const updated = await services.estimates.updateEstimate(id, computedUpdates);

    revalidatePath('/estimates');
    revalidatePath(`/estimates/${id}`);
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update estimate' };
  }
}

/**
 * 5. Send Estimate to Customer (Integrates with Phase 4 Communication Engine)
 */
export async function sendEstimateAction(params: {
  estimateId: string;
  businessId: string;
  channel: 'email' | 'sms' | 'whatsapp';
  recipientEmail?: string;
  recipientPhone?: string;
}) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, params.businessId);

    const estimate = await services.estimates.getEstimateById(params.estimateId);
    if (!estimate || estimate.business_id !== params.businessId) {
      return { success: false, error: 'Estimate not found' };
    }

    const customer = (estimate as any).customers;
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Update status to SENT
    await services.estimates.updateEstimate(params.estimateId, {
      status: 'SENT',
    });

    // 2. Log activity on linked Job
    if (estimate.job_id) {
      await services.operations.addJobActivity({
        business_id: params.businessId,
        job_id: estimate.job_id,
        activity_type: 'ESTIMATE_SENT',
        title: `Estimate Sent (${params.channel.toUpperCase()})`,
        description: `Estimate #${estimate.estimate_number} ($${Number(estimate.total_amount).toFixed(2)}) sent to ${customer?.name || 'Customer'}.`,
        user_id: user?.id || null,
        user_name: (user?.user_metadata?.name as string) || 'Sender',
        metadata: { channel: params.channel, estimateId: estimate.id },
      });
    }

    // 3. Dispatch via Phase 4 Automation Trigger Engine
    const dispatcher = new AutomationTriggerDispatcher(supabase);
    await dispatcher.executeTrigger({
      businessId: params.businessId,
      triggerType: 'ESTIMATE_SENT',
      channel: params.channel,
      recipientName: customer?.name || 'Customer',
      recipientEmail: params.recipientEmail || customer?.email,
      recipientPhone: params.recipientPhone || customer?.phone,
      serviceName: estimate.title,
      invoiceAmount: `$${Number(estimate.total_amount).toFixed(2)}`,
    });

    revalidatePath('/estimates');
    revalidatePath(`/estimates/${params.estimateId}`);
    if (estimate.job_id) revalidatePath(`/jobs/${estimate.job_id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to send estimate' };
  }
}

/**
 * 6. Approve Estimate (Client authorization record)
 */
export async function approveEstimateAction(params: {
  estimateId: string;
  businessId: string;
  customerName?: string;
}) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, params.businessId);

    const estimate = await services.estimates.getEstimateById(params.estimateId);
    if (!estimate || estimate.business_id !== params.businessId) {
      return { success: false, error: 'Estimate not found' };
    }

    const { data: { user } } = await supabase.auth.getUser();
    const approvedAt = new Date().toISOString();
    const customer = (estimate as any).customers;
    const approverName = params.customerName || customer?.name || 'Authorized Customer';

    const updated = await services.estimates.updateEstimate(params.estimateId, {
      status: 'APPROVED',
      approved_at: approvedAt,
      approved_by_customer_name: approverName,
    });

    if (estimate.job_id) {
      await services.operations.addJobActivity({
        business_id: params.businessId,
        job_id: estimate.job_id,
        activity_type: 'ESTIMATE_APPROVED',
        title: `Estimate Approved: $${Number(estimate.total_amount).toFixed(2)}`,
        description: `Approved by ${approverName}`,
        user_id: user?.id || null,
        user_name: (user?.user_metadata?.name as string) || 'Customer Portal',
        metadata: { estimateId: estimate.id, approvedAt, totalAmount: estimate.total_amount },
      });
    }

    await services.audit.logAction({
      business_id: params.businessId,
      action: 'APPROVE_ESTIMATE',
      entity: 'estimate',
      entity_id: estimate.id,
      metadata: { approverName, totalAmount: estimate.total_amount },
    });

    revalidatePath('/estimates');
    revalidatePath(`/estimates/${params.estimateId}`);
    if (estimate.job_id) revalidatePath(`/jobs/${estimate.job_id}`);
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to approve estimate' };
  }
}

/**
 * 7. Reject Estimate (With mandatory rejection reason)
 */
export async function rejectEstimateAction(params: {
  estimateId: string;
  businessId: string;
  reason: string;
}) {
  try {
    if (!params.reason || !params.reason.trim()) {
      return { success: false, error: 'Rejection reason is required' };
    }

    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, params.businessId);

    const estimate = await services.estimates.getEstimateById(params.estimateId);
    if (!estimate || estimate.business_id !== params.businessId) {
      return { success: false, error: 'Estimate not found' };
    }

    const { data: { user } } = await supabase.auth.getUser();
    const rejectedAt = new Date().toISOString();

    const updated = await services.estimates.updateEstimate(params.estimateId, {
      status: 'REJECTED',
      rejected_at: rejectedAt,
      rejection_reason: params.reason.trim(),
    });

    if (estimate.job_id) {
      await services.operations.addJobActivity({
        business_id: params.businessId,
        job_id: estimate.job_id,
        activity_type: 'ESTIMATE_REJECTED',
        title: `Estimate Rejected`,
        description: `Reason: ${params.reason.trim()}`,
        user_id: user?.id || null,
        user_name: (user?.user_metadata?.name as string) || 'Customer',
        metadata: { estimateId: estimate.id, rejectedAt, reason: params.reason },
      });
    }

    await services.audit.logAction({
      business_id: params.businessId,
      action: 'REJECT_ESTIMATE',
      entity: 'estimate',
      entity_id: estimate.id,
      metadata: { reason: params.reason },
    });

    revalidatePath('/estimates');
    revalidatePath(`/estimates/${params.estimateId}`);
    if (estimate.job_id) revalidatePath(`/jobs/${estimate.job_id}`);
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to reject estimate' };
  }
}

/**
 * 8. Convert Approved Estimate to Invoice (Strict Halal Financial Invariant Preservation)
 */
export async function convertEstimateToInvoiceAction(params: {
  estimateId: string;
  businessId: string;
  dueDateDays?: number;
}) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, params.businessId);

    const estimate = await services.estimates.getEstimateById(params.estimateId);
    if (!estimate || estimate.business_id !== params.businessId) {
      return { success: false, error: 'Estimate not found' };
    }

    if (estimate.status !== 'APPROVED') {
      return { success: false, error: 'Only approved estimates can be converted to an invoice' };
    }

    if (estimate.invoice_id) {
      return { success: false, error: 'An invoice has already been generated for this estimate' };
    }

    const { data: { user } } = await supabase.auth.getUser();

    // Inherit approved line items and totals
    const totalAmount = Number(estimate.total_amount);
    const subtotal = Number(estimate.subtotal);
    const taxRate = Number(estimate.tax_rate);
    const taxAmount = Number(estimate.tax_amount);
    const discountAmount = Number(estimate.discount_amount);

    const issueDate = new Date().toISOString().split('T')[0];
    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + (params.dueDateDays || 14));
    const dueDate = dueDateObj.toISOString().split('T')[0];

    // Create Invoice with Strict Invariant: remaining_balance = original_amount = totalAmount, amount_paid = 0
    const invNumber = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
    const invoice = await services.invoices.createInvoice({
      business_id: params.businessId,
      customer_id: estimate.customer_id!,
      invoice_number: invNumber,
      issue_date: issueDate,
      due_date: dueDate,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      original_amount: totalAmount,
      status: 'due',
      priority: 'medium',
      items: Array.isArray(estimate.items)
        ? (estimate.items as any[]).map(it => ({
            description: it.description,
            quantity: Number(it.quantity) || 1,
            unit_price: Number(it.unitPrice ?? it.unit_price) || 0,
            line_total: Number(it.amount ?? (Number(it.quantity || 1) * Number(it.unitPrice ?? it.unit_price ?? 0))),
          }))
        : [],
      notes: `Generated from Approved Estimate ${estimate.estimate_number}`,
    });

    // Link invoice to Estimate
    await services.estimates.updateEstimate(params.estimateId, {
      invoice_id: invoice.id,
    });

    // Link invoice to Job if linked
    if (estimate.job_id) {
      await services.operations.updateJob(estimate.job_id, {
        invoice_id: invoice.id,
        status: 'INVOICED',
      });

      await services.operations.addJobActivity({
        business_id: params.businessId,
        job_id: estimate.job_id,
        activity_type: 'INVOICE_CREATED',
        title: `Invoice Generated: ${invoice.invoice_number}`,
        description: `Invoice created from approved estimate ${estimate.estimate_number} for $${totalAmount.toFixed(2)}`,
        user_id: user?.id || null,
        user_name: (user?.user_metadata?.name as string) || 'Accounting',
        metadata: { invoiceId: invoice.id, totalAmount },
      });
    }

    await services.audit.logAction({
      business_id: params.businessId,
      action: 'CONVERT_ESTIMATE_TO_INVOICE',
      entity: 'invoice',
      entity_id: invoice.id,
      metadata: { estimateId: estimate.id, invoiceNumber: invoice.invoice_number, totalAmount },
    });

    revalidatePath('/estimates');
    revalidatePath(`/estimates/${params.estimateId}`);
    revalidatePath('/invoices');
    if (estimate.job_id) revalidatePath(`/jobs/${estimate.job_id}`);
    return { success: true, data: invoice };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to convert estimate to invoice' };
  }
}

/**
 * 9. Delete Estimate
 */
export async function deleteEstimateAction(id: string, businessId: string) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const existing = await services.estimates.getEstimateById(id);
    if (!existing || existing.business_id !== businessId) {
      return { success: false, error: 'Estimate not found' };
    }

    await services.estimates.deleteEstimate(id);

    revalidatePath('/estimates');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete estimate' };
  }
}
