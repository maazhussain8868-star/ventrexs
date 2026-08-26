-- ==============================================================================
-- VENTREXS AI — PHASE 14: PAYMENT PROVIDERS, SUBSCRIPTIONS & REVENUE OPS
-- Multi-Provider Abstraction, Strict Ledger Isolation & Webhook Idempotency
-- ==============================================================================

-- 1. PAYMENT TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    purpose TEXT NOT NULL CHECK (purpose IN ('SAAS_SUBSCRIPTION', 'CUSTOMER_INVOICE', 'DEMO')),
    provider TEXT NOT NULL CHECK (provider IN ('razorpay', 'stripe', 'skydo', 'india_upi', 'manual', 'demo', 'ach')),
    provider_payment_id TEXT,
    provider_customer_id TEXT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED')),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    subscription_id UUID,
    idempotency_key TEXT UNIQUE,
    refunded_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (refunded_amount >= 0),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_business ON public.payment_transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_purpose ON public.payment_transactions(purpose);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider ON public.payment_transactions(provider);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_invoice ON public.payment_transactions(invoice_id);

-- 2. PAYMENT WEBHOOK EVENTS TABLE (Replay protection & signature audit)
CREATE TABLE IF NOT EXISTS public.payment_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL,
    provider_event_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED')),
    received_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    CONSTRAINT uq_payment_webhook_provider_event UNIQUE (provider, provider_event_id)
);

CREATE INDEX IF NOT EXISTS idx_payment_webhook_events_provider ON public.payment_webhook_events(provider);
CREATE INDEX IF NOT EXISTS idx_payment_webhook_events_event_id ON public.payment_webhook_events(provider_event_id);

-- 3. PAYMENT IDEMPOTENCY KEYS TABLE
CREATE TABLE IF NOT EXISTS public.payment_idempotency_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    scope TEXT NOT NULL CHECK (scope IN ('checkout', 'payment', 'refund', 'webhook', 'subscription_activation')),
    resource_id TEXT,
    response_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'COMPLETED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payment_idempotency_keys_key ON public.payment_idempotency_keys(key);
CREATE INDEX IF NOT EXISTS idx_payment_idempotency_keys_expires ON public.payment_idempotency_keys(expires_at);

-- 4. PAYMENT RECONCILIATION RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.payment_reconciliation_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    total_transactions_count INT NOT NULL DEFAULT 0,
    total_amount_collected NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    total_amount_refunded NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    matched_count INT NOT NULL DEFAULT 0,
    discrepancy_count INT NOT NULL DEFAULT 0,
    discrepancies JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. ROW-LEVEL SECURITY POLICIES
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_reconciliation_records ENABLE ROW LEVEL SECURITY;

-- payment_transactions policies
CREATE POLICY "Tenant members can view their own payment transactions"
    ON public.payment_transactions FOR SELECT
    USING (business_id IS NOT NULL AND public.is_business_member(business_id));

CREATE POLICY "Tenant members can insert their own payment transactions"
    ON public.payment_transactions FOR INSERT
    WITH CHECK (business_id IS NOT NULL AND public.is_business_member(business_id));

CREATE POLICY "Platform admins can view all payment transactions"
    ON public.payment_transactions FOR SELECT
    TO authenticated
    USING (public.is_platform_admin());

-- payment_webhook_events policies (Internal / Admin / Service Role only)
CREATE POLICY "Platform admins can view webhook events"
    ON public.payment_webhook_events FOR SELECT
    TO authenticated
    USING (public.is_platform_admin());

-- payment_reconciliation_records policies (Internal / Admin / Service Role only)
CREATE POLICY "Platform admins can view reconciliation records"
    ON public.payment_reconciliation_records FOR SELECT
    TO authenticated
    USING (public.is_platform_admin());

-- Service role full access bypass for all tables
CREATE POLICY "Service role full access on payment_transactions"
    ON public.payment_transactions FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access on payment_webhook_events"
    ON public.payment_webhook_events FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access on payment_idempotency_keys"
    ON public.payment_idempotency_keys FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access on payment_reconciliation_records"
    ON public.payment_reconciliation_records FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
