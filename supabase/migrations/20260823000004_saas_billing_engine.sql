-- ==============================================================================
-- PAYPILOT AI — PHASE 7: SAAS BILLING & SUBSCRIPTIONS MIGRATION
-- Adds payment provider mapping, webhook idempotency tracking, and expanded subscription statuses
-- ==============================================================================

-- 1. Add provider tracking and trial interval columns to subscriptions
ALTER TABLE public.subscriptions
    ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'mock',
    ADD COLUMN IF NOT EXISTS provider_customer_id TEXT,
    ADD COLUMN IF NOT EXISTS provider_subscription_id TEXT,
    ADD COLUMN IF NOT EXISTS trial_start TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ;

-- 2. Update status constraint to include all Phase 7 lifecycle states
DO $$
BEGIN
    ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
    ALTER TABLE public.subscriptions
        ADD CONSTRAINT subscriptions_status_check
        CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled', 'canceled', 'incomplete', 'paused'));
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Notice updating subscriptions status constraint: %', SQLERRM;
END $$;

-- 3. Create processed_webhook_events table for strict webhook idempotency
CREATE TABLE IF NOT EXISTS public.processed_webhook_events (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_provider ON public.processed_webhook_events(provider);
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider_sub ON public.subscriptions(provider_subscription_id);

-- 4. Enable RLS on processed_webhook_events
ALTER TABLE public.processed_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow webhook idempotency access" ON public.processed_webhook_events
    FOR ALL
    TO authenticated, service_role
    USING (true)
    WITH CHECK (true);
