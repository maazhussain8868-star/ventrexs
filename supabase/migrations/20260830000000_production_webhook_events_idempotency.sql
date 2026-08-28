-- ==============================================================================
-- VENTREXS AI — PRODUCTION WEBHOOK EVENTS & IDEMPOTENCY LEDGER MIGRATION
-- ==============================================================================

-- 1. Webhook Events Table
CREATE TABLE IF NOT EXISTS public.payment_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL CHECK (provider IN ('razorpay', 'stripe', 'google_play', 'skydo', 'demo')),
    provider_event_id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'PROCESSED' CHECK (status IN ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED', 'IGNORED')),
    error_message TEXT,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Global Idempotency Ledger Table
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
    key TEXT PRIMARY KEY,
    operation_type TEXT NOT NULL,
    response_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

-- 3. Indexes for fast query resolution
CREATE INDEX IF NOT EXISTS idx_webhook_events_provider ON public.payment_webhook_events(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON public.payment_webhook_events(provider_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON public.payment_webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_idempotency_expires ON public.idempotency_keys(expires_at);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

-- 5. Strict Service-Role Only Policies
-- Webhook events and idempotency keys contain raw payloads and are strictly managed server-side
CREATE POLICY "Service role manages payment_webhook_events"
    ON public.payment_webhook_events
    FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role manages idempotency_keys"
    ON public.idempotency_keys
    FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');
