-- ==============================================================================
-- VENTREXS AI — ADD USER_ID TO SUBSCRIPTIONS TABLE
-- Enables direct user attribution for whichever user completed the checkout
-- Reuses existing provider and provider_subscription_id columns
-- ==============================================================================

-- 1. Ensure subscriptions table exists
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'Starter',
    billing_cycle TEXT NOT NULL DEFAULT 'monthly',
    status TEXT NOT NULL DEFAULT 'pending',
    provider TEXT NOT NULL DEFAULT 'stripe',
    provider_subscription_id TEXT,
    provider_customer_id TEXT,
    price_amount NUMERIC(10, 2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    trial_ends_at TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now() + interval '30 days'),
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    checkout_session_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Add user_id column if it doesn't already exist on subscriptions
ALTER TABLE public.subscriptions
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Backfill user_id from business_members where user_id is currently NULL
UPDATE public.subscriptions s
SET user_id = bm.user_id
FROM public.business_members bm
WHERE s.business_id = bm.business_id
  AND s.user_id IS NULL
  AND bm.is_primary = true;

-- 4. High-performance indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider ON public.subscriptions(provider);
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider_sub ON public.subscriptions(provider_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_period ON public.subscriptions(status, current_period_end);

-- 5. Row Level Security: Allow users to view their own subscriptions directly or via business membership
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subscriptions' 
        AND policyname = 'Users can view their own subscriptions'
    ) THEN
        CREATE POLICY "Users can view their own subscriptions"
            ON public.subscriptions
            FOR SELECT
            USING (
                auth.uid() = user_id
                OR
                business_id IN (
                    SELECT business_id FROM public.business_members WHERE user_id = auth.uid()
                )
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subscriptions' 
        AND policyname = 'Service role manages all subscriptions'
    ) THEN
        CREATE POLICY "Service role manages all subscriptions"
            ON public.subscriptions
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;
