import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../supabase/types';
import { getPaymentProvider } from './providers/factory';
import { EntitlementService } from './entitlements';
import {
  BillingInterval,
  CheckoutSessionParams,
  CheckoutSessionResult,
  PaymentProvider,
  PLANS_CONFIG,
  PlanKey,
  WebhookEvent,
} from './types';

export class BillingService {
  private entitlementService: EntitlementService;

  constructor(private client: SupabaseClient<Database>) {
    this.entitlementService = new EntitlementService(client);
  }

  /**
   * 1. Create a secure checkout session for SaaS subscription upgrade/purchase
   */
  async createCheckoutSession(params: {
    businessId: string;
    plan: PlanKey;
    interval: BillingInterval;
    customerEmail: string;
    customerName?: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutSessionResult> {
    const provider = getPaymentProvider();

    // Check plan validity
    const planConfig = PLANS_CONFIG[params.plan];
    if (!planConfig) {
      throw new Error(`Invalid subscription plan: "${params.plan}"`);
    }

    const session = await provider.createCheckoutSession({
      businessId: params.businessId,
      plan: params.plan,
      interval: params.interval,
      customerEmail: params.customerEmail,
      customerName: params.customerName,
      successUrl: params.successUrl,
      cancelUrl: params.cancelUrl,
    });

    // Write audit log
    await this.client.from('audit_logs').insert({
      business_id: params.businessId,
      action: 'CHECKOUT_SESSION_CREATED',
      entity: 'subscription',
      metadata: {
        plan: params.plan,
        interval: params.interval,
        sessionId: session.sessionId,
        provider: provider.name,
      },
    });

    return session;
  }

  /**
   * 2. Process incoming payment provider webhook with strict signature validation & idempotency
   */
  async handleWebhook(
    payload: string,
    signature: string,
    secret?: string,
    customProvider?: PaymentProvider
  ): Promise<{ success: boolean; eventId?: string; duplicate?: boolean; error?: string }> {
    const provider = customProvider || getPaymentProvider();

    // 1. Verify Webhook Cryptographic Signature
    const verification = await provider.verifyWebhookSignature(payload, signature, secret);
    if (!verification.isValid || !verification.event) {
      return {
        success: false,
        error: verification.error || 'Invalid webhook signature',
      };
    }

    const event = verification.event;

    // 2. Webhook Idempotency Check (Prevent duplicate event processing)
    const { data: existingEvent } = await this.client
      .from('processed_webhook_events')
      .select('id')
      .eq('id', event.id)
      .single();

    if (existingEvent) {
      return {
        success: true,
        eventId: event.id,
        duplicate: true,
      };
    }

    const businessId = event.businessId;

    // 3. Process Webhook Event Type
    if (
      event.type === 'checkout_completed' ||
      event.type === 'subscription_created' ||
      event.type === 'subscription_updated' ||
      event.type === 'payment_succeeded'
    ) {
      if (businessId) {
        const planKey: PlanKey = event.plan || 'Starter';
        const planConfig = PLANS_CONFIG[planKey] || PLANS_CONFIG.Starter;
        const isAnnual = event.interval === 'annual';
        const price = isAnnual ? planConfig.priceAnnual : planConfig.priceMonthly;

        // Upsert subscription in Supabase
        await this.client.from('subscriptions').upsert(
          {
            business_id: businessId,
            plan: planKey,
            billing_cycle: event.interval || 'monthly',
            status: event.status || 'active',
            price_amount: price,
            currency: 'USD',
            provider: event.provider,
            provider_customer_id: event.providerCustomerId || null,
            provider_subscription_id: event.providerSubscriptionId || null,
            current_period_start: event.currentPeriodStart || new Date().toISOString(),
            current_period_end: event.currentPeriodEnd || new Date(Date.now() + 30 * 86400000).toISOString(),
            cancel_at_period_end: event.cancelAtPeriodEnd || false,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'business_id' }
        );

        // Audit log
        await this.client.from('audit_logs').insert({
          business_id: businessId,
          action: 'SUBSCRIPTION_ACTIVATED',
          entity: 'subscription',
          metadata: {
            plan: planKey,
            interval: event.interval || 'monthly',
            provider: event.provider,
            eventId: event.id,
          },
        });
      }
    } else if (event.type === 'payment_failed') {
      if (businessId) {
        await this.client
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('business_id', businessId);

        // Create in-app notification
        await this.client.from('notifications').insert({
          business_id: businessId,
          type: 'system',
          title: 'Subscription Payment Failed',
          message: 'Your recent plan renewal payment failed. Please update your billing details to maintain full feature access.',
          link_url: '/pricing',
        });

        await this.client.from('audit_logs').insert({
          business_id: businessId,
          action: 'SUBSCRIPTION_PAYMENT_FAILED',
          entity: 'subscription',
          metadata: {
            eventId: event.id,
            provider: event.provider,
          },
        });
      }
    } else if (event.type === 'subscription_cancelled') {
      if (businessId) {
        await this.client
          .from('subscriptions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('business_id', businessId);

        await this.client.from('audit_logs').insert({
          business_id: businessId,
          action: 'SUBSCRIPTION_CANCELLED',
          entity: 'subscription',
          metadata: {
            eventId: event.id,
            provider: event.provider,
          },
        });
      }
    }

    // 4. Mark Event as Processed in Webhook Idempotency Table
    await this.client.from('processed_webhook_events').insert({
      id: event.id,
      provider: event.provider,
      event_type: event.type,
      payload: (event.data as any) || {},
      processed_at: new Date().toISOString(),
    });

    return {
      success: true,
      eventId: event.id,
    };
  }

  /**
   * 3. Cancel Subscription (Immediate or at Period End) - Preserves 100% of business ledger records
   */
  async cancelSubscription(params: {
    businessId: string;
    cancelAtPeriodEnd?: boolean;
    userId?: string;
  }): Promise<{ success: boolean; status: string }> {
    const { businessId, cancelAtPeriodEnd = true, userId } = params;

    const { data: sub, error } = await this.client
      .from('subscriptions')
      .select('*')
      .eq('business_id', businessId)
      .single();

    if (error || !sub) {
      throw new Error('Subscription not found for this business.');
    }

    const provider = getPaymentProvider();
    if (sub.provider_subscription_id) {
      await provider.cancelSubscription(sub.provider_subscription_id, cancelAtPeriodEnd);
    }

    const newStatus = cancelAtPeriodEnd ? sub.status : 'cancelled';

    await this.client
      .from('subscriptions')
      .update({
        cancel_at_period_end: cancelAtPeriodEnd,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('business_id', businessId);

    // Audit log
    await this.client.from('audit_logs').insert({
      business_id: businessId,
      user_id: userId || null,
      action: 'SUBSCRIPTION_CANCELLED',
      entity: 'subscription',
      metadata: {
        cancelAtPeriodEnd,
        previousStatus: sub.status,
        newStatus,
      },
    });

    return {
      success: true,
      status: newStatus,
    };
  }

  /**
   * 4. Get active subscription details and entitlement info
   */
  async getSubscriptionDetails(businessId: string) {
    return this.entitlementService.getEffectivePlan(businessId);
  }
}
