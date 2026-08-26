-- ==============================================================================
-- PAYPILOT AI — PHASE 9: PAYMENTS & ADVANCED REVENUE OPERATIONS MIGRATION
-- ==============================================================================

-- 1. Extend PAYMENTS Table with Statuses, Providers, and Refund Tracking
ALTER TABLE public.payments
    ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'SUCCEEDED' CHECK (status IN ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED')),
    ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD',
    ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'manual',
    ADD COLUMN IF NOT EXISTS provider_transaction_id TEXT,
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS failure_reason TEXT,
    ADD COLUMN IF NOT EXISTS refunded_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (refunded_amount >= 0),
    ADD COLUMN IF NOT EXISTS secure_token TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_payments_customer ON public.payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_secure_token ON public.payments(secure_token);

-- 2. PAYMENT_REQUESTS TABLE (Secure token dispatch for /pay/[secure_token])
CREATE TABLE IF NOT EXISTS public.payment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    secure_token TEXT NOT NULL UNIQUE,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp', 'direct_link')),
    status TEXT NOT NULL DEFAULT 'SENT' CHECK (status IN ('PENDING', 'SENT', 'OPENED', 'COMPLETED', 'EXPIRED')),
    amount_requested NUMERIC(12, 2) NOT NULL CHECK (amount_requested > 0),
    expires_at TIMESTAMPTZ NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payment_requests_business ON public.payment_requests(business_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_invoice ON public.payment_requests(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_token ON public.payment_requests(secure_token);

-- 3. REFUNDS TABLE (Audit trail for full and partial payment refunds)
CREATE TABLE IF NOT EXISTS public.refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SUCCEEDED' CHECK (status IN ('PENDING', 'SUCCEEDED', 'FAILED')),
    provider_refund_id TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_refunds_business ON public.refunds(business_id);
CREATE INDEX IF NOT EXISTS idx_refunds_payment ON public.refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_invoice ON public.refunds(invoice_id);

-- 4. Multi-Tenant Row-Level Security Policies
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

-- payment_requests policies
CREATE POLICY "Members can view payment requests"
    ON public.payment_requests FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can insert payment requests"
    ON public.payment_requests FOR INSERT
    WITH CHECK (public.is_business_member(business_id));

CREATE POLICY "Members can update payment requests"
    ON public.payment_requests FOR UPDATE
    USING (public.is_business_member(business_id));

CREATE POLICY "Public can view valid payment requests by secure token"
    ON public.payment_requests FOR SELECT
    TO anon, authenticated
    USING (expires_at > now());

-- refunds policies
CREATE POLICY "Members can view refunds"
    ON public.refunds FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can insert refunds"
    ON public.refunds FOR INSERT
    WITH CHECK (public.is_business_member(business_id));

-- Service role bypass
CREATE POLICY "Service role full access on payment_requests"
    ON public.payment_requests FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access on refunds"
    ON public.refunds FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
