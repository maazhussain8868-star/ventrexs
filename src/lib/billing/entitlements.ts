import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../supabase/types';
import { PlanKey, PlanLimits, PLANS_CONFIG, UsageMetric, SubscriptionStatus } from './types';

export interface UsageSummary {
  metric: UsageMetric;
  currentUsage: number;
  limit: number;
  remaining: number;
  isUnlimited: boolean;
  percentageUsed: number;
}

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
   * Calculate trial days remaining
   */
  static getTrialDaysRemaining(subscription?: {
    status?: string | null;
    trial_ends_at?: string | null;
    trial_end?: string | null;
  } | null): number {
    if (!subscription || subscription.status !== 'trialing') return 0;
    const endDateStr = subscription.trial_end || subscription.trial_ends_at;
    if (!endDateStr) return 14;
    const end = new Date(endDateStr).getTime();
    const now = Date.now();
    if (end <= now) return 0;
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  }

  /**
   * Resolves effective plan configuration for a business
   */
  async getEffectivePlan(businessId: string): Promise<{
    plan: PlanKey;
    isActive: boolean;
    isTrial: boolean;
    trialDaysRemaining: number;
    status: SubscriptionStatus;
    limits: PlanLimits;
    features: string[];
    priceAmount: number;
    billingCycle: 'monthly' | 'annual';
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    providerSubscriptionId?: string;
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
    const isTrial = sub?.status === 'trialing';
    const trialDaysRemaining = EntitlementService.getTrialDaysRemaining(sub);
    const planKey: PlanKey = (sub?.plan as PlanKey) || 'Starter';
    const planConfig = PLANS_CONFIG[planKey] || PLANS_CONFIG.Starter;
    const status: SubscriptionStatus = (sub?.status as SubscriptionStatus) || (isActive ? 'active' : 'inactive' as any);

    if (!isActive) {
      // Graceful degradation: read-only access, minimal essential quotas
      return {
        plan: planKey,
        isActive: false,
        isTrial: false,
        trialDaysRemaining: 0,
        status,
        limits: {
          maxInvoicesPerMonth: 10,
          maxRemindersPerMonth: 20,
          maxLeads: 25,
          maxJobsPerMonth: 5,
          maxEstimatesPerMonth: 5,
          maxAiChatsPerMonth: 0,
          maxSmsPerMonth: 0,
          maxEmailPerMonth: 10,
          maxWhatsappPerMonth: 0,
          maxReviewsPerMonth: 0,
          maxTeamSeats: 1,
          aiCopilot: false,
          aiReceptionist: false,
          multiUser: false,
          customSms: false,
          customWhatsapp: false,
          reputationManagement: false,
          advancedReports: false,
          apiAccess: false,
        },
        features: ['Read-only Ledger Access', 'Graceful Record Retention'],
        priceAmount: sub?.price_amount || 0,
        billingCycle: sub?.billing_cycle || 'monthly',
        currentPeriodEnd: sub?.current_period_end || new Date().toISOString(),
        cancelAtPeriodEnd: sub?.cancel_at_period_end || false,
        providerSubscriptionId: sub?.provider_subscription_id || undefined,
      };
    }

    return {
      plan: planKey,
      isActive: true,
      isTrial,
      trialDaysRemaining,
      status,
      limits: planConfig.limits,
      features: planConfig.features,
      priceAmount: sub?.price_amount || planConfig.priceMonthly,
      billingCycle: sub?.billing_cycle || 'monthly',
      currentPeriodEnd: sub?.current_period_end || new Date(Date.now() + 30 * 86400000).toISOString(),
      cancelAtPeriodEnd: sub?.cancel_at_period_end || false,
      providerSubscriptionId: sub?.provider_subscription_id || undefined,
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
        reason: `Subscription is ${effective.status}. Please upgrade or renew your plan to use ${String(feature)}.`,
        plan: effective.plan,
      };
    }

    const hasAccess = Boolean(effective.limits[feature]);
    if (!hasAccess) {
      return {
        hasAccess: false,
        reason: `The "${String(feature)}" feature requires a higher tier plan (Current: ${effective.plan}).`,
        plan: effective.plan,
      };
    }

    return {
      hasAccess: true,
      plan: effective.plan,
    };
  }

  /**
   * Record metric usage for the active billing period (idempotent upsert & counter increment)
   */
  async recordUsage(businessId: string, metric: UsageMetric, amount: number = 1): Promise<{ success: boolean; currentCount: number }> {
    if (!this.client) {
      return { success: true, currentCount: amount };
    }

    try {
      const startOfMonth = new Date();
      startOfMonth.setUTCDate(1);
      startOfMonth.setUTCHours(0, 0, 0, 0);

      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setUTCMonth(endOfMonth.getUTCMonth() + 1);
      endOfMonth.setUTCMilliseconds(-1);

      const periodStart = startOfMonth.toISOString();
      const periodEnd = endOfMonth.toISOString();

      // Check existing usage record
      const { data: existing } = await this.client
        .from('usage_records')
        .select('*')
        .eq('business_id', businessId)
        .eq('metric', metric)
        .eq('period_start', periodStart)
        .maybeSingle();

      const newCount = (existing?.usage_count || 0) + amount;

      if (existing) {
        await this.client
          .from('usage_records')
          .update({
            usage_count: newCount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await this.client
          .from('usage_records')
          .insert({
            business_id: businessId,
            metric,
            period_start: periodStart,
            period_end: periodEnd,
            usage_count: newCount,
            updated_at: new Date().toISOString(),
          });
      }

      return { success: true, currentCount: newCount };
    } catch (err) {
      return { success: false, currentCount: amount };
    }
  }

  /**
   * Get current period usage count for a single metric
   */
  async getUsage(businessId: string, metric: UsageMetric): Promise<number> {
    if (!this.client) return 0;

    try {
      const startOfMonth = new Date();
      startOfMonth.setUTCDate(1);
      startOfMonth.setUTCHours(0, 0, 0, 0);
      const periodStart = startOfMonth.toISOString();

      const { data } = await this.client
        .from('usage_records')
        .select('usage_count')
        .eq('business_id', businessId)
        .eq('metric', metric)
        .eq('period_start', periodStart)
        .maybeSingle();

      return data?.usage_count || 0;
    } catch (err) {
      return 0;
    }
  }

  /**
   * Get all usage summaries vs plan caps for a business
   */
  async getAllUsage(businessId: string): Promise<Record<UsageMetric, UsageSummary>> {
    const effective = await this.getEffectivePlan(businessId);
    const limits = effective.limits;

    const metricToLimitMap: Record<UsageMetric, number> = {
      ai_receptionist_chats: limits.maxAiChatsPerMonth,
      sms_messages: limits.maxSmsPerMonth,
      email_messages: limits.maxEmailPerMonth,
      whatsapp_messages: limits.maxWhatsappPerMonth,
      jobs_created: limits.maxJobsPerMonth,
      estimates_created: limits.maxEstimatesPerMonth,
      review_requests_sent: limits.maxReviewsPerMonth,
      team_members_count: limits.maxTeamSeats,
    };

    const metrics: UsageMetric[] = [
      'ai_receptionist_chats',
      'sms_messages',
      'email_messages',
      'whatsapp_messages',
      'jobs_created',
      'estimates_created',
      'review_requests_sent',
      'team_members_count',
    ];

    const result: Partial<Record<UsageMetric, UsageSummary>> = {};

    for (const metric of metrics) {
      const usage = await this.getUsage(businessId, metric);
      const limit = metricToLimitMap[metric] || 100;
      const isUnlimited = limit >= 100000;
      const remaining = isUnlimited ? 999999 : Math.max(0, limit - usage);
      const percentageUsed = isUnlimited ? 0 : Math.min(100, Math.round((usage / limit) * 100));

      result[metric] = {
        metric,
        currentUsage: usage,
        limit,
        remaining,
        isUnlimited,
        percentageUsed,
      };
    }

    return result as Record<UsageMetric, UsageSummary>;
  }

  /**
   * Strict server-side usage limit assertion
   */
  async assertUsageLimit(businessId: string, metric: UsageMetric, increment: number = 1): Promise<{ allowed: boolean; reason?: string }> {
    const effective = await this.getEffectivePlan(businessId);
    if (!effective.isActive) {
      return {
        allowed: false,
        reason: `Subscription is ${effective.status}. Please activate or renew your subscription.`,
      };
    }

    const currentUsage = await this.getUsage(businessId, metric);
    const summaries = await this.getAllUsage(businessId);
    const summary = summaries[metric];

    if (!summary.isUnlimited && (currentUsage + increment) > summary.limit) {
      return {
        allowed: false,
        reason: `Monthly quota exceeded for ${metric.replace(/_/g, ' ')} (${currentUsage}/${summary.limit}). Please upgrade your plan to increase limits.`,
      };
    }

    return { allowed: true };
  }
}
