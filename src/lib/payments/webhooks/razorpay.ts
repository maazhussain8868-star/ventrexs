/**
 * VENTREXS AI — PHASE 14: RAZORPAY WEBHOOK HANDLER
 * Cryptographic HMAC-SHA256 signature verification, idempotency checking,
 * and strict ledger separation between SaaS subscriptions and customer invoices.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/types';
import { RazorpayPaymentAdapter } from '../adapters/razorpay-adapter';
import { IdempotencyManager } from '../idempotency';

export interface RazorpayWebhookProcessingResult {
  success: boolean;
  eventId?: string;
  duplicate?: boolean;
  eventType?: string;
  error?: string;
}

export class RazorpayWebhookHandler {
  private adapter: RazorpayPaymentAdapter;

  constructor(
    private client: SupabaseClient<Database>,
    webhookSecret?: string
  ) {
    this.adapter = new RazorpayPaymentAdapter(undefined, undefined, webhookSecret);
  }

  /**
   * Process raw incoming Razorpay webhook payload with strict verification
   */
  async handleWebhook(
    rawPayload: string,
    signature: string,
    secret?: string
  ): Promise<RazorpayWebhookProcessingResult> {
    // 1. Verify Cryptographic HMAC Signature
    const verification = await this.adapter.verifyWebhookSignature(rawPayload, signature, secret);
    if (!verification.isValid || !verification.eventId) {
      return {
        success: false,
        error: verification.error || 'Invalid Razorpay webhook signature.',
      };
    }

    const eventId = verification.eventId;
    const eventType = verification.eventType || 'unknown';
    const payloadData = verification.data || {};

    // 2. Check Idempotency Key (Prevent duplicate processing & double-charging)
    const idempotencyKey = `webhook_rzp_${eventId}`;
    const existing = await IdempotencyManager.check(idempotencyKey);
    if (existing) {
      return {
        success: true,
        eventId,
        duplicate: true,
        eventType,
      };
    }

    try {
      // 3. Store Webhook Event Record
      try {
        await this.client.from('payment_webhook_events' as any).insert({
          provider: 'razorpay',
          provider_event_id: eventId,
          event_type: eventType,
          payload: payloadData,
          status: 'PROCESSING',
          received_at: new Date().toISOString(),
        });
      } catch {
        // Fallback or existing table schema
      }

      // 4. Handle Event by Purpose
      if (eventType.startsWith('subscription.')) {
        await this.processSubscriptionEvent(eventType, payloadData, eventId);
      } else if (eventType.startsWith('payment.')) {
        await this.processPaymentEvent(eventType, payloadData, eventId);
      }

      // 5. Mark as processed in Idempotency Store
      await IdempotencyManager.set(idempotencyKey, 'webhook', { eventId, eventType, processedAt: new Date().toISOString() });

      // 6. Record Audit Log
      try {
        await this.client.from('audit_logs').insert({
          action: 'WEBHOOK_PROCESSED',
          entity: 'payment_webhook',
          metadata: {
            provider: 'razorpay',
            eventId,
            eventType,
          },
        });
      } catch {
        // Non-blocking
      }

      return {
        success: true,
        eventId,
        eventType,
      };
    } catch (err: any) {
      return {
        success: false,
        eventId,
        eventType,
        error: err.message || 'Error processing Razorpay webhook event.',
      };
    }
  }

  private async processSubscriptionEvent(eventType: string, data: any, eventId: string) {
    const subEntity = data.subscription?.entity || data.entity || {};
    const businessId = subEntity.notes?.business_id || subEntity.notes?.businessId;

    if (!businessId) return;

    if (eventType === 'subscription.activated' || eventType === 'subscription.charged') {
      const planKey = subEntity.notes?.plan || 'Starter';
      await this.client.from('subscriptions').upsert(
        {
          business_id: businessId,
          plan: planKey as any,
          status: 'active',
          billing_cycle: 'monthly',
          provider: 'razorpay',
          provider_subscription_id: subEntity.id,
          provider_customer_id: subEntity.customer_id || null,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'business_id' }
      );

      await this.client.from('subscription_events').insert({
        business_id: businessId,
        event_type: 'SUBSCRIPTION_ACTIVATED',
        to_plan: planKey,
        metadata: { provider: 'razorpay', eventId, subscriptionId: subEntity.id },
      });
    } else if (eventType === 'subscription.cancelled') {
      await this.client
        .from('subscriptions')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('business_id', businessId);

      await this.client.from('subscription_events').insert({
        business_id: businessId,
        event_type: 'SUBSCRIPTION_CANCELLED',
        metadata: { provider: 'razorpay', eventId, subscriptionId: subEntity.id },
      });
    }
  }

  private async processPaymentEvent(eventType: string, data: any, eventId: string) {
    const payEntity = data.payment?.entity || data.entity || {};
    const invoiceId = payEntity.notes?.invoice_id || payEntity.notes?.invoiceId;
    const businessId = payEntity.notes?.business_id || payEntity.notes?.businessId;

    if (eventType === 'payment.captured' && invoiceId && businessId) {
      const amount = Number(payEntity.amount) / 100;

      // Check if payment transaction already recorded
      const { data: existingPayment } = await this.client
        .from('payments')
        .select('id')
        .eq('provider_transaction_id', payEntity.id)
        .maybeSingle();

      if (!existingPayment) {
        // Fetch invoice to update balances
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
            currency: payEntity.currency || 'INR',
            method: 'UPI' as any,
            status: 'SUCCEEDED',
            provider: 'razorpay',
            provider_transaction_id: payEntity.id,
            payment_date: new Date().toISOString(),
            notes: `Settled via Razorpay webhook (${eventId})`,
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
  }
}
