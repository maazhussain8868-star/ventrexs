/**
 * VENTREXS AI — PHASE 14: STRIPE WEBHOOK HANDLER
 * Cryptographic signature verification, idempotency checking,
 * and ledger separation between international SaaS subscriptions and invoices.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/types';
import { StripeCustomerPaymentAdapter } from '../adapters/stripe-adapter';
import { IdempotencyManager } from '../idempotency';

export class StripeWebhookHandler {
  private adapter: StripeCustomerPaymentAdapter;

  constructor(
    private client: SupabaseClient<Database>,
    apiKey?: string,
    webhookSecret?: string
  ) {
    this.adapter = new StripeCustomerPaymentAdapter(apiKey, webhookSecret);
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
        error: verification.error || 'Invalid Stripe webhook signature.',
      };
    }

    const eventId = verification.eventId;
    const eventType = verification.eventType || 'unknown';
    const data = verification.data || {};

    const idempotencyKey = `webhook_stripe_${eventId}`;
    const existing = await IdempotencyManager.check(idempotencyKey);
    if (existing) {
      return {
        success: true,
        eventId,
        duplicate: true,
      };
    }

    try {
      if (eventType === 'payment_intent.succeeded') {
        const businessId = data.metadata?.business_id;
        const invoiceId = data.metadata?.invoice_id;
        const amount = Number(data.amount) / 100;

        if (businessId && invoiceId) {
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
              currency: data.currency ? data.currency.toUpperCase() : 'USD',
              method: 'Credit Card' as any,
              status: 'SUCCEEDED',
              provider: 'stripe',
              provider_transaction_id: data.id,
              payment_date: new Date().toISOString(),
              notes: `Settled via Stripe webhook (${eventId})`,
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
