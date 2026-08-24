-- ==============================================================================
-- PAYPILOT AI — PHASE 1: LOCK INTERNAL TABLES RLS
-- Restricts processed_webhook_events and rate_limits to service_role ONLY.
-- Zero access for public / authenticated tenant roles.
-- ==============================================================================

-- 1. Lock processed_webhook_events
ALTER TABLE public.processed_webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow webhook idempotency access" ON public.processed_webhook_events;
DROP POLICY IF EXISTS "Service role only for processed_webhook_events" ON public.processed_webhook_events;

CREATE POLICY "Service role only for processed_webhook_events"
    ON public.processed_webhook_events
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 2. Lock rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow rate limit access" ON public.rate_limits;
DROP POLICY IF EXISTS "Service role only for rate_limits" ON public.rate_limits;

CREATE POLICY "Service role only for rate_limits"
    ON public.rate_limits
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
