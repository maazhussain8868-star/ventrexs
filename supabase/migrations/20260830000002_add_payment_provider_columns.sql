-- ==============================================================================
-- VENTREXS AI — SUBSCRIPTION TABLE PROVIDER COLUMNS + WEBHOOK EVENTS TABLE
-- Required for Razorpay + Stripe payment integration
-- ==============================================================================

-- 1. Add provider and provider IDs to subscriptions table
ALTER TABLE public.subscriptions
    ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'stripe',
    ADD COLUMN IF NOT EXISTS provider_subscription_id TEXT,
    ADD COLUMN IF NOT EXISTS provider_customer_id TEXT,
    ADD COLUMN IF NOT EXISTS price_amount NUMERIC(10, 2) DEFAULT 0.00;

-- 2. Update subscriptions provider check constraint
DO $$
BEGIN
    ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_provider_check;
    ALTER TABLE public.subscriptions
        ADD CONSTRAINT subscriptions_provider_check
        CHECK (provider IN ('razorpay', 'stripe', 'google_play', 'manual', 'demo', 'skydo'));
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Notice updating subscriptions provider constraint: %', SQLERRM;
END $$;

-- 3. Update plan constraint to match PLANS_CONFIG
DO $$
BEGIN
    ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
    ALTER TABLE public.subscriptions
        ADD CONSTRAINT subscriptions_plan_check
        CHECK (plan IN (
            'Starter', 'Professional', 'Enterprise',
            'AgencyStarter', 'AgencyGrowth', 'AgencyEnterprise'
        ));
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Notice updating subscriptions plan constraint: %', SQLERRM;
END $$;

-- 4. Create payment_webhook_events table if not exists
--    Stores all incoming webhook events for idempotency and auditing
CREATE TABLE IF NOT EXISTS public.payment_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL,
    provider_event_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PROCESSING' CHECK (status IN ('PROCESSING', 'PROCESSED', 'FAILED', 'DUPLICATE')),
    payload JSONB DEFAULT '{}'::jsonb,
    error TEXT,
    received_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_webhook_provider_event UNIQUE (provider, provider_event_id)
);

-- 5. Index for webhook idempotency checks
CREATE INDEX IF NOT EXISTS idx_payment_webhook_events_provider_event
    ON public.payment_webhook_events(provider, provider_event_id);

-- 6. Create subscription_events table if not exists
--    Audit trail for subscription lifecycle changes
CREATE TABLE IF NOT EXISTS public.subscription_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    from_plan TEXT,
    to_plan TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_subscription_events_business
    ON public.subscription_events(business_id);

-- 7. Create idempotency_keys table for payment dedup
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    entity_type TEXT,
    entity_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_idempotency_keys_key ON public.idempotency_keys(key);
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_expires ON public.idempotency_keys(expires_at);

-- 8. Row Level Security for new tables
ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

-- Webhook events: only service_role can access (webhooks use admin client)
CREATE POLICY IF NOT EXISTS "service_role_full_access_webhook_events"
    ON public.payment_webhook_events
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Subscription events: business members can read their own
CREATE POLICY IF NOT EXISTS "business_members_read_subscription_events"
    ON public.subscription_events
    FOR SELECT
    TO authenticated
    USING (
        business_id IN (
            SELECT business_id FROM public.business_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY IF NOT EXISTS "service_role_full_access_subscription_events"
    ON public.subscription_events
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Idempotency keys: service_role only
CREATE POLICY IF NOT EXISTS "service_role_full_access_idempotency"
    ON public.idempotency_keys
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 9. Update existing subscriptions to have a provider value
UPDATE public.subscriptions
SET provider = 'stripe'
WHERE provider IS NULL;
