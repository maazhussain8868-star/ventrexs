-- ==============================================================================
-- PAYPILOT AI — PHASE 5: SMS CONSENT & DISTRIBUTED RATE LIMITS MIGRATION
-- Adds TCPA/CTIA consent tracking to customers and distributed rate limits table
-- ==============================================================================

-- 1. Add SMS consent and opt-out tracking columns to customers (Hardened Affirmative Opt-In)
ALTER TABLE public.customers
    ADD COLUMN IF NOT EXISTS sms_consent BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS sms_consent_at TIMESTAMPTZ DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS sms_consent_source TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS sms_opted_out BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS sms_opted_out_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS sms_opt_out_reason TEXT;

-- Index for opt-out lookups
CREATE INDEX IF NOT EXISTS idx_customers_sms_optout ON public.customers(sms_opted_out);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);

-- 2. Create distributed rate_limits table for persistent cross-instance rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limits (
    key TEXT PRIMARY KEY,
    count INT NOT NULL DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON public.rate_limits(expires_at);

-- Enable RLS on rate_limits table
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and service role to manage rate limits
CREATE POLICY "Allow rate limit access" ON public.rate_limits
    FOR ALL
    TO authenticated, service_role
    USING (true)
    WITH CHECK (true);
