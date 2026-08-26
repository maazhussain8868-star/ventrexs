/**
 * VENTREXS AI — PHASE 14: SKYDO WEBHOOK HANDLER
 * Webhook signature verification and customer invoice payment reconciliation
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/types';
import { SkydoPaymentAdapter } from '../adapters/skydo-adapter';
import { IdempotencyManager } from '../idempotency';

export class SkydoWebhookHandler {
  private adapter: SkydoPaymentAdapter;

  constructor(
    private client: SupabaseClient<Database>,
    apiKey?: string,
    webhookSecret?: string
  ) {
    this.adapter = new SkydoPaymentAdapter(apiKey, webhookSecret);
  }

  async handleWebhook(
    rawPayload: string,
    signature: string,
    secret?: string
  ): Promise<{ success: boolean; eventId?: string; duplicate?: boolean; error?: string }> {
    const verification = await this.adapter.verifyWebhookSignature(rawPayload, signature, secret);
    if (!verification.isValid || !verification.eventId) {
      return {
        success: false,
        error: verification.error || 'Invalid Skydo webhook signature.',
      };
    }

    const eventId = verification.eventId;
    const eventType = verification.eventType || 'payment_received';
    const data = verification.data || {};

    const idempotencyKey = `webhook_skydo_${eventId}`;
    const existing = await IdempotencyManager.check(idempotencyKey);
    if (existing) {
      return {
        success: true,
        eventId,
        duplicate: true,
      };
    }

    try {
      if (eventType === 'payment_received' || eventType === 'payment.settled') {
        const invoiceId = data.invoice_id || data.invoiceId;
        const businessId = data.business_id || data.businessId;
        const amount = Number(data.amount || 0);

        if (invoiceId && businessId && amount > 0) {
          const { data: inv } = await this.client
            .from('invoices')
            .select('*')
            .eq('id', invoiceId)
            .eq('business_id', businessId)
            .single();

          if (inv) {
            const newPaid = Math.round((Number(inv.payments_received || 0) + amount) * 100) / 100;
            const newRemaining = Math.max(0, Math.round((Number(inv.original_amount) - newPaid) * 100) / 100);

            await this.client.from('payments').insert({
              business_id: businessId,
              invoice_id: invoiceId,
              amount,
              currency: data.currency || 'USD',
              method: 'Bank Wire' as any,
              status: 'SUCCEEDED',
              provider: 'skydo',
              provider_transaction_id: data.id || eventId,
              payment_date: new Date().toISOString(),
              notes: `Cross-border settlement via Skydo (${eventId})`,
            });

            await this.client
              .from('invoices')
              .update({
                payments_received: newPaid,
                remaining_balance: newRemaining,
                status: newRemaining <= 0.001 ? 'paid' : 'partially_paid',
                updated_at: new Date().toISOString(),
              })
              .eq('id', invoiceId);
          }
        }
      }

      await IdempotencyManager.set(idempotencyKey, 'webhook', { eventId, eventType, processedAt: new Date().toISOString() });

      return {
        success: true,
        eventId,
      };
    } catch (err: any) {
      return {
        success: false,
        eventId,
        error: err.message,
      };
    }
  }
}
