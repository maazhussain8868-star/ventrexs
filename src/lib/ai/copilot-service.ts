import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../supabase/types';
import { getAIServiceProvider } from './provider';
import { AICollectionInput, AIMessageTone } from './types';
import { validateAICollectionOutput } from './validator';

export class AICopilotService {
  constructor(private client: SupabaseClient<Database>) {}

  /**
   * 1. Analyze single invoice and persist recommendation in Supabase
   */
  async analyzeInvoice(invoiceId: string, businessId: string) {
    // Fetch invoice with customer, payments, events
    const { data: invoice, error: invError } = await this.client
      .from('invoices')
      .select(`
        *,
        customers (id, name, company, email, phone, address),
        payments (payment_date, amount, method),
        communications (created_at, channel, tone, status),
        businesses (name, currency)
      `)
      .eq('id', invoiceId)
      .eq('business_id', businessId)
      .single();

    if (invError || !invoice) {
      throw new Error(`Invoice not found or inaccessible: ${invError?.message || ''}`);
    }

    const customer = (invoice as any).customers;
    const business = (invoice as any).businesses;
    const payments = (invoice as any).payments || [];
    const communications = (invoice as any).communications || [];

    // Calculate days overdue
    const dueTime = new Date(invoice.due_date).getTime();
    const nowTime = new Date().getTime();
    const daysOverdue = Math.max(0, Math.floor((nowTime - dueTime) / (1000 * 60 * 60 * 24)));

    // Prepare AI Input (Strict rule: NO credit score, NO risk score, NO sensitive customer profiling)
    const aiInput: AICollectionInput = {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoice_number,
      originalAmount: Number(invoice.original_amount),
      amountPaid: Number(invoice.amount_paid),
      remainingBalance: Number(invoice.remaining_balance),
      dueDate: invoice.due_date,
      daysOverdue: invoice.status === 'overdue' ? daysOverdue : (invoice.status === 'paid' ? 0 : daysOverdue),
      status: invoice.status,
      customerName: customer?.name || 'Valued Client',
      customerCompany: customer?.company || 'Accounts Payable Team',
      customerEmail: customer?.email || '',
      customerPhone: customer?.phone || undefined,
      paymentHistory: payments.map((p: any) => ({
        date: p.payment_date,
        amount: Number(p.amount),
        method: p.method,
      })),
      communicationHistory: communications.map((c: any) => ({
        date: c.created_at,
        channel: c.channel,
        tone: c.tone,
        status: c.status,
      })),
      businessName: business?.name || 'PayPilot AI Workspace',
      businessCurrency: business?.currency || 'USD ($)',
    };

    // Run AI Provider
    const provider = getAIServiceProvider();
    const rawOutput = await provider.analyzeInvoice(aiInput);

    // Validate and Sanitize Output
    const validation = validateAICollectionOutput(rawOutput, aiInput.remainingBalance);
    if (!validation.isValid || !validation.sanitizedOutput) {
      throw new Error(`AI validation failed: ${validation.errors.join('; ')}`);
    }

    const clean = validation.sanitizedOutput;

    // Convert tone string to DB schema tone
    let dbTone: Database['public']['Tables']['ai_recommendations']['Row']['tone'] = 'gentle';
    if (clean.suggested_tone === 'Professional Statement') dbTone = 'professional';
    if (clean.suggested_tone === 'Firm Follow-up') dbTone = 'firm';

    // Persist into Supabase ai_recommendations table
    const { data: rec, error: recError } = await this.client
      .from('ai_recommendations')
      .insert({
        business_id: businessId,
        invoice_id: invoiceId,
        customer_name: customer?.name || customer?.company || 'Client',
        amount: Number(invoice.remaining_balance),
        days_overdue: aiInput.daysOverdue,
        priority: clean.priority,
        recommended_action: clean.recommended_action,
        reason: clean.reason,
        tone: dbTone,
        message_draft_subject: clean.message_draft_subject || `Invoice ${invoice.invoice_number} Notice`,
        message_draft: clean.message_draft,
        confidence: clean.confidence,
        status: 'pending',
      })
      .select()
      .single();

    if (recError) {
      console.warn('AI recommendation persistence notice:', recError.message);
    }

    // Log in audit trail
    await this.client.from('audit_logs').insert({
      business_id: businessId,
      action: 'GENERATE_AI_RECOMMENDATION',
      entity: 'ai_recommendation',
      entity_id: rec?.id || invoiceId,
      metadata: {
        invoice_number: invoice.invoice_number,
        priority: clean.priority,
        action: clean.recommended_action,
        confidence: clean.confidence,
      },
    });

    return { recommendation: rec, output: clean };
  }

  /**
   * 2. Analyze all actionable invoices for a business
   */
  async analyzeBusinessInvoices(businessId: string) {
    const { data: invoices, error } = await this.client
      .from('invoices')
      .select('id, status, remaining_balance')
      .eq('business_id', businessId)
      .in('status', ['overdue', 'due', 'partially_paid', 'sent'])
      .gt('remaining_balance', 0);

    if (error) throw error;

    const list = invoices || [];
    const results = [];

    for (const inv of list) {
      try {
        const res = await this.analyzeInvoice(inv.id, businessId);
        results.push(res);
      } catch (e: any) {
        console.warn(`Analysis error on invoice ${inv.id}:`, e?.message);
      }
    }

    return results;
  }

  /**
   * 3. Approve AI Recommendation -> Creates communication draft, timeline event, and audit log
   * (Does NOT dispatch external SMS/WhatsApp/email until integration is configured)
   */
  async approveRecommendation(
    recommendationId: string,
    customDraft?: {
      subject?: string;
      message: string;
      channel?: 'email' | 'sms' | 'whatsapp';
    }
  ) {
    // 1. Fetch recommendation
    const { data: rec, error: recError } = await this.client
      .from('ai_recommendations')
      .select(`
        *,
        invoices (
          id,
          invoice_number,
          remaining_balance,
          customer_id,
          customers (
            id,
            name,
            company,
            email,
            phone
          )
        )
      `)
      .eq('id', recommendationId)
      .single();

    if (recError || !rec) {
      throw new Error(`Recommendation not found: ${recError?.message || ''}`);
    }

    const invoice = (rec as any).invoices;
    const customer = invoice?.customers;
    const customerId = invoice?.customer_id || customer?.id;

    const channel = customDraft?.channel || 'email';
    const subject = customDraft?.subject || rec.message_draft_subject || `Invoice ${invoice?.invoice_number || ''} Follow-up`;
    const message = customDraft?.message || rec.message_draft;

    // 2. Mark recommendation as sent/approved
    await this.client
      .from('ai_recommendations')
      .update({ status: 'sent' })
      .eq('id', recommendationId);

    // 3. Create communication draft record in Supabase
    const { data: comm, error: commError } = await this.client
      .from('communications')
      .insert({
        business_id: rec.business_id,
        invoice_id: rec.invoice_id,
        customer_id: customerId,
        channel: channel,
        subject: subject,
        message: message,
        tone: rec.tone || 'professional',
        status: 'draft', // Stored as draft until real provider dispatch is configured
        sent_at: null,
      })
      .select()
      .single();

    if (commError) throw commError;

    // 4. Create timeline event on invoice
    await this.client.from('invoice_events').insert({
      invoice_id: rec.invoice_id,
      business_id: rec.business_id,
      event_type: 'reminder_sent',
      title: `Truthful AI Follow-up Drafted (${channel.toUpperCase()})`,
      description: subject ? `"${subject}" approved by user` : 'Approved collection draft',
      metadata: {
        communication_id: comm.id,
        recommendation_id: rec.id,
        channel,
      },
    });

    // 5. Create audit log
    await this.client.from('audit_logs').insert({
      business_id: rec.business_id,
      action: 'APPROVE_AI_RECOMMENDATION',
      entity: 'communication',
      entity_id: comm.id,
      metadata: {
        recommendation_id: rec.id,
        invoice_id: rec.invoice_id,
        channel,
      },
    });

    return {
      success: true,
      communication: comm,
      recommendationId: rec.id,
    };
  }

  /**
   * 4. Dismiss recommendation
   */
  async dismissRecommendation(recommendationId: string) {
    const { data: rec, error } = await this.client
      .from('ai_recommendations')
      .update({ status: 'dismissed' })
      .eq('id', recommendationId)
      .select()
      .single();

    if (error) throw error;

    await this.client.from('audit_logs').insert({
      business_id: rec.business_id,
      action: 'DISMISS_AI_RECOMMENDATION',
      entity: 'ai_recommendation',
      entity_id: recommendationId,
    });

    return { success: true };
  }

  /**
   * 5. Generate custom follow-up copy
   */
  async generateCustomDraft(
    invoiceId: string,
    businessId: string,
    tone: AIMessageTone,
    channel: 'email' | 'sms' | 'whatsapp'
  ) {
    const { data: invoice, error } = await this.client
      .from('invoices')
      .select(`
        *,
        customers (name, company, email, phone),
        businesses (name, currency)
      `)
      .eq('id', invoiceId)
      .eq('business_id', businessId)
      .single();

    if (error || !invoice) {
      throw new Error(`Invoice not found: ${error?.message || ''}`);
    }

    const customer = (invoice as any).customers;
    const business = (invoice as any).businesses;

    const dueTime = new Date(invoice.due_date).getTime();
    const nowTime = new Date().getTime();
    const daysOverdue = Math.max(0, Math.floor((nowTime - dueTime) / (1000 * 60 * 60 * 24)));

    const aiInput: AICollectionInput = {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoice_number,
      originalAmount: Number(invoice.original_amount),
      amountPaid: Number(invoice.amount_paid),
      remainingBalance: Number(invoice.remaining_balance),
      dueDate: invoice.due_date,
      daysOverdue: invoice.status === 'overdue' ? daysOverdue : 0,
      status: invoice.status,
      customerName: customer?.name || 'Valued Client',
      customerCompany: customer?.company || 'Accounts Payable Team',
      customerEmail: customer?.email || '',
      customerPhone: customer?.phone || undefined,
      businessName: business?.name || 'PayPilot AI Workspace',
      businessCurrency: business?.currency || 'USD ($)',
    };

    const provider = getAIServiceProvider();
    return provider.generateCustomDraft(aiInput, tone, channel);
  }
}
