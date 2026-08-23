import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../supabase/types';
import { PlanKey, PlanLimits, PLANS_CONFIG } from './types';

export class EntitlementService {
  constructor(private client?: SupabaseClient<Database> | null) {}

  /**
   * Checks if subscription status represents an active, valid entitlement
   */
  static isSubscriptionActive(subscription?: {
    status?: string | null;
    trial_ends_at?: string | null;
    trial_end?: string | null;
  } | null): boolean {
    if (!subscription || !subscription.status) return false;

    const status = subscription.status.toLowerCase();

    if (status === 'active') {
      return true;
    }

    if (status === 'trialing') {
      const trialEndDate = subscription.trial_end || subscription.trial_ends_at;
      if (!trialEndDate) return true;
      return new Date(trialEndDate).getTime() > Date.now();
    }

    // Statuses like 'past_due', 'cancelled', 'canceled', 'incomplete', 'paused' are inactive
    return false;
  }

  /**
   * Resolves effective plan configuration for a business
   */
  async getEffectivePlan(businessId: string): Promise<{
    plan: PlanKey;
    isActive: boolean;
    status: string;
    limits: PlanLimits;
    features: string[];
  }> {
    let sub: any = null;

    if (this.client) {
      try {
        const { data } = await this.client
          .from('subscriptions')
          .select('*')
          .eq('business_id', businessId)
          .single();
        sub = data;
      } catch (e) {}
    }

    const isActive = EntitlementService.isSubscriptionActive(sub);
    const planKey: PlanKey = (sub?.plan as PlanKey) || 'Starter';
    const planConfig = PLANS_CONFIG[planKey] || PLANS_CONFIG.Starter;

    if (!isActive) {
      // Graceful degradation: read-only access, restrictions on premium features
      return {
        plan: planKey,
        isActive: false,
        status: sub?.status || 'inactive',
        limits: {
          maxInvoicesPerMonth: 10,
          maxRemindersPerMonth: 20,
          aiCopilot: false,
          multiUser: false,
          customSms: false,
          customWhatsapp: false,
          advancedReports: false,
          apiAccess: false,
        },
        features: ['Read-only Ledger Access', 'Graceful Record Retention'],
      };
    }

    return {
      plan: planKey,
      isActive: true,
      status: sub?.status || 'active',
      limits: planConfig.limits,
      features: planConfig.features,
    };
  }

  /**
   * Server-side feature entitlement verification
   */
  async checkFeatureAccess(businessId: string, feature: keyof PlanLimits): Promise<{
    hasAccess: boolean;
    reason?: string;
    plan: PlanKey;
  }> {
    const effective = await this.getEffectivePlan(businessId);

    if (!effective.isActive) {
      return {
        hasAccess: false,
        reason: `Subscription is ${effective.status}. Please upgrade or renew your plan to use ${feature}.`,
        plan: effective.plan,
      };
    }

    const hasAccess = Boolean(effective.limits[feature]);
    if (!hasAccess) {
      return {
        hasAccess: false,
        reason: `The "${feature}" feature requires a higher tier plan (Current: ${effective.plan}).`,
        plan: effective.plan,
      };
    }

    return {
      hasAccess: true,
      plan: effective.plan,
    };
  }
}
