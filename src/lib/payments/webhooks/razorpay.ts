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
      } else if (eventType.startsWith('payment.') || eventType.startsWith('order.')) {
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
      let payingUserId = subEntity.notes?.user_id || subEntity.notes?.userId;
      if (!payingUserId && businessId) {
        const { data: member } = await this.client
          .from('business_members')
          .select('user_id')
          .eq('business_id', businessId)
          .order('is_primary', { ascending: false })
          .limit(1)
          .maybeSingle();
        payingUserId = member?.user_id;
      }

      await this.client.from('subscriptions').upsert(
        {
          business_id: businessId,
          ...(payingUserId ? { user_id: payingUserId } : {}),
          plan: planKey as any,
          status: 'active',
          billing_cycle: (subEntity.notes?.interval || 'monthly') as any,
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

      try {
        await this.client.from('subscription_events').insert({
          business_id: businessId,
          event_type: 'SUBSCRIPTION_ACTIVATED',
          to_plan: planKey,
          metadata: { provider: 'razorpay', eventId, subscriptionId: subEntity.id },
        });
      } catch {
        // Non-blocking
      }
    } else if (eventType === 'subscription.cancelled') {
      await this.client
        .from('subscriptions')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('business_id', businessId);

      try {
        await this.client.from('subscription_events').insert({
          business_id: businessId,
          event_type: 'SUBSCRIPTION_CANCELLED',
          metadata: { provider: 'razorpay', eventId, subscriptionId: subEntity.id },
        });
      } catch {
        // Non-blocking
      }
    }
  }

  private async processPaymentEvent(eventType: string, data: any, eventId: string) {
    const payEntity = data.payment?.entity || data.entity || {};
    const orderEntity = data.order?.entity || {};
    const notes = payEntity.notes || orderEntity.notes || data.notes || {};
    const invoiceId = notes.invoice_id || notes.invoiceId;
    const businessId = notes.business_id || notes.businessId;
    const planKey = notes.plan;
    const billingCycle = notes.interval || 'monthly';

    // A) Invoice Payment Handler
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
      return;
    }

    // B) SaaS Subscription Payment Handler (payment.captured or order.paid)
    if ((eventType === 'payment.captured' || eventType === 'order.paid') && businessId && !invoiceId) {
      const finalPlan = planKey || 'Starter';
      const paymentId = payEntity.id || orderEntity.id || eventId;
      const currency = payEntity.currency || orderEntity.currency || 'INR';
      const amountUnit = Number(payEntity.amount || orderEntity.amount || 0) / 100;
      const now = new Date();
      const periodEnd = new Date(now);
      if (billingCycle === 'annual') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      let payingUserId = notes.user_id || notes.userId;
      if (!payingUserId && businessId) {
        const { data: member } = await this.client
          .from('business_members')
          .select('user_id')
          .eq('business_id', businessId)
          .order('is_primary', { ascending: false })
          .limit(1)
          .maybeSingle();
        payingUserId = member?.user_id;
      }

      await this.client.from('subscriptions').upsert(
        {
          business_id: businessId,
          ...(payingUserId ? { user_id: payingUserId } : {}),
          plan: finalPlan as any,
          billing_cycle: billingCycle as any,
          status: 'active',
          selected_plan: finalPlan as any,
          selected_billing_cycle: billingCycle as any,
          checkout_session_id: payEntity.order_id || orderEntity.id || undefined,
          price_amount: amountUnit,
          currency,
          provider: 'razorpay',
          provider_subscription_id: paymentId,
          provider_customer_id: payEntity.customer_id || null,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: false,
          updated_at: now.toISOString(),
        },
        { onConflict: 'business_id' }
      );

      try {
        await this.client.from('subscription_events').insert({
          business_id: businessId,
          event_type: 'SUBSCRIPTION_ACTIVATED',
          to_plan: finalPlan,
          metadata: {
            provider: 'razorpay',
            eventId,
            paymentId,
            orderId: payEntity.order_id || orderEntity.id,
            billingCycle,
          },
        });
      } catch {
        // Non-blocking
      }
      return;
    }

    // C) Payment Failed Handler
    if (eventType === 'payment.failed' && businessId && !invoiceId) {
      const { data: currentSub } = await this.client
        .from('subscriptions')
        .select('status')
        .eq('business_id', businessId)
        .maybeSingle();

      if (currentSub && currentSub.status !== 'active') {
        await this.client
          .from('subscriptions')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('business_id', businessId);

        try {
          await this.client.from('subscription_events').insert({
            business_id: businessId,
            event_type: 'PAYMENT_FAILED',
            metadata: {
              provider: 'razorpay',
              eventId,
              error: payEntity.error_description || payEntity.error_reason,
            },
          });
        } catch {
          // Non-blocking
        }
      }
    }
  }
}
