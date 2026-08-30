-- ==============================================================================
-- VENTREXS AI — ADD PENDING SUBSCRIPTION STATUS + CHECKOUT STARTED STATE
-- Enables proper billing gate: users must complete payment before workspace access
-- ==============================================================================

-- 1. Update status constraint to include 'pending' and 'checkout_started'
DO $$
BEGIN
    ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
    ALTER TABLE public.subscriptions
        ADD CONSTRAINT subscriptions_status_check
        CHECK (status IN (
            'pending',
            'checkout_started',
            'trialing',
            'active',
            'past_due',
            'cancelled',
            'canceled',
            'incomplete',
            'paused',
            'expired'
        ));
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Notice updating subscriptions status constraint: %', SQLERRM;
END $$;

-- 2. Update saas_subscriptions status constraint if it exists
DO $$
BEGIN
    ALTER TABLE public.saas_subscriptions DROP CONSTRAINT IF EXISTS saas_subscriptions_status_check;
    ALTER TABLE public.saas_subscriptions
        ADD CONSTRAINT saas_subscriptions_status_check
        CHECK (status IN (
            'pending',
            'checkout_started',
            'trialing',
            'active',
            'past_due',
            'cancelled',
            'canceled',
            'incomplete',
            'paused',
            'expired'
        ));
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Notice updating saas_subscriptions status constraint: %', SQLERRM;
END $$;

-- 3. Add checkout_session_id and plan selection columns
ALTER TABLE public.subscriptions
    ADD COLUMN IF NOT EXISTS checkout_session_id TEXT,
    ADD COLUMN IF NOT EXISTS selected_plan TEXT,
    ADD COLUMN IF NOT EXISTS selected_billing_cycle TEXT DEFAULT 'monthly';

-- 4. Fast subscription status function for middleware/server
CREATE OR REPLACE FUNCTION public.get_user_subscription_status(p_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT COALESCE(s.status, 'incomplete')
    FROM public.business_members bm
    LEFT JOIN public.subscriptions s ON s.business_id = bm.business_id
    WHERE bm.user_id = p_user_id
      AND bm.is_primary = true
    LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_subscription_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_subscription_status(UUID) TO service_role;

-- 5. Index for checkout_session_id lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_checkout_session
    ON public.subscriptions(checkout_session_id)
    WHERE checkout_session_id IS NOT NULL;
