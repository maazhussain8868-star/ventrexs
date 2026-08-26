-- ==============================================================================
-- PAYPILOT AI — PHASE 7: SAAS MONETIZATION, SUBSCRIPTIONS & USAGE MIGRATION
-- Adds usage tracking records, subscription event audit trails, and multi-tenant RLS
-- ==============================================================================

-- 1. Create usage_records table to track period-based metric consumption per tenant
CREATE TABLE IF NOT EXISTS public.usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    metric TEXT NOT NULL CHECK (metric IN (
        'ai_receptionist_chats',
        'sms_messages',
        'email_messages',
        'whatsapp_messages',
        'jobs_created',
        'estimates_created',
        'review_requests_sent',
        'team_members_count'
    )),
    period_start TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, date_trunc('month', now())),
    period_end TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, (date_trunc('month', now()) + interval '1 month' - interval '1 second')),
    usage_count INTEGER NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_business_metric_period UNIQUE (business_id, metric, period_start)
);

-- 2. Create subscription_events table for commercial lifecycle audit logs
CREATE TABLE IF NOT EXISTS public.subscription_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'CHECKOUT_INITIATED',
        'SUBSCRIPTION_CREATED',
        'SUBSCRIPTION_UPDATED',
        'PLAN_UPGRADED',
        'PLAN_DOWNGRADED',
        'PAYMENT_SUCCEEDED',
        'PAYMENT_FAILED',
        'CANCELLATION_REQUESTED',
        'SUBSCRIPTION_CANCELLED',
        'SUBSCRIPTION_REACTIVATED',
        'TRIAL_EXPIRED',
        'PORTAL_SESSION_ACCESSED'
    )),
    from_plan TEXT,
    to_plan TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_usage_records_biz_period ON public.usage_records(business_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_usage_records_metric ON public.usage_records(metric);
CREATE INDEX IF NOT EXISTS idx_sub_events_biz ON public.subscription_events(business_id);
CREATE INDEX IF NOT EXISTS idx_sub_events_created ON public.subscription_events(created_at DESC);

-- 4. Enable Row Level Security
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for usage_records
DROP POLICY IF EXISTS "Business members can view their usage records" ON public.usage_records;
DROP POLICY IF EXISTS "Service role manages usage records" ON public.usage_records;

CREATE POLICY "Business members can view their usage records"
    ON public.usage_records FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Service role manages usage records"
    ON public.usage_records FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 6. RLS Policies for subscription_events
DROP POLICY IF EXISTS "Business members can view their subscription events" ON public.subscription_events;
DROP POLICY IF EXISTS "Service role manages subscription events" ON public.subscription_events;

CREATE POLICY "Business members can view their subscription events"
    ON public.subscription_events FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Service role manages subscription events"
    ON public.subscription_events FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
