-- ==============================================================================
-- VENTREXS AI — TRIAL EXPIRATION LIFECYCLE & AUTOMATED REMINDERS
-- 1. Adds reminder tracking columns for email idempotency (Day 5 & Day 7)
-- 2. Fast indexes for trial monitoring cron queries
-- 3. Atomic check_and_expire_subscription RPC for middleware & lazy sync
-- 4. Bulk expire_overdue_trials RPC for scheduled cron jobs
-- ==============================================================================

-- 1. Add reminder tracking columns to subscriptions table
ALTER TABLE public.subscriptions
    ADD COLUMN IF NOT EXISTS trial_day5_reminder_sent_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS trial_day7_reminder_sent_at TIMESTAMPTZ;

-- 2. Ensure index for trial monitoring & expiration checks
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_lifecycle
    ON public.subscriptions(status, trial_ends_at)
    WHERE status IN ('trialing', 'expired');

-- 3. Function to atomically check and lazily expire a user's subscription
CREATE OR REPLACE FUNCTION public.check_and_expire_subscription(p_user_id UUID)
RETURNS TABLE (
    sub_id UUID,
    business_id UUID,
    status TEXT,
    plan TEXT,
    selected_plan TEXT,
    trial_start TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    is_expired BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sub RECORD;
    v_is_expired BOOLEAN := false;
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
    -- Query active subscription directly by user_id or primary business membership
    SELECT s.id, s.business_id, s.status, s.plan, s.selected_plan, s.trial_start, s.trial_ends_at, s.current_period_end
    INTO v_sub
    FROM public.subscriptions s
    WHERE s.user_id = p_user_id
       OR s.business_id IN (
           SELECT bm.business_id FROM public.business_members bm WHERE bm.user_id = p_user_id
       )
    ORDER BY s.created_at DESC
    LIMIT 1;

    IF v_sub.id IS NOT NULL THEN
        -- Evaluate if trial has passed expiration timestamp
        IF v_sub.status = 'trialing' AND (
            (v_sub.trial_ends_at IS NOT NULL AND v_sub.trial_ends_at < v_now)
            OR (v_sub.current_period_end IS NOT NULL AND v_sub.current_period_end < v_now)
        ) THEN
            -- Lazily synchronize status in DB to 'expired'
            UPDATE public.subscriptions
            SET status = 'expired',
                updated_at = v_now
            WHERE id = v_sub.id;

            v_sub.status := 'expired';
            v_is_expired := true;
        ELSIF v_sub.status = 'expired' THEN
            v_is_expired := true;
        END IF;

        RETURN QUERY SELECT 
            v_sub.id,
            v_sub.business_id,
            v_sub.status,
            v_sub.plan,
            v_sub.selected_plan,
            v_sub.trial_start,
            v_sub.trial_ends_at,
            v_sub.current_period_end,
            v_is_expired;
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_and_expire_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_expire_subscription(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.check_and_expire_subscription(UUID) TO service_role;

-- 4. Bulk function for cron jobs to transition all overdue trials to 'expired'
CREATE OR REPLACE FUNCTION public.expire_overdue_trials()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_updated_count INTEGER := 0;
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
    WITH updated AS (
        UPDATE public.subscriptions
        SET status = 'expired',
            updated_at = v_now
        WHERE status = 'trialing'
          AND (
              (trial_ends_at IS NOT NULL AND trial_ends_at < v_now)
              OR (trial_ends_at IS NULL AND current_period_end < v_now)
          )
        RETURNING id
    )
    SELECT count(*) INTO v_updated_count FROM updated;

    RETURN v_updated_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.expire_overdue_trials() TO service_role;
