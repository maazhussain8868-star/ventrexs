-- ==============================================================================
-- VENTREXS AI — PRODUCTION SAAS SUBSCRIPTIONS & REVENUE LEDGER MIGRATION
-- ==============================================================================

-- 1. SaaS Subscriptions Table
CREATE TABLE IF NOT EXISTS public.saas_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
    account_type TEXT NOT NULL CHECK (account_type IN ('BUSINESS', 'AGENCY')),
    plan TEXT NOT NULL,
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
    status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled', 'canceled', 'incomplete', 'paused', 'expired')),
    provider TEXT NOT NULL CHECK (provider IN ('razorpay', 'stripe', 'google_play', 'skydo', 'demo')),
    provider_customer_id TEXT,
    provider_subscription_id TEXT,
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_saas_sub_tenant_isolation CHECK (
        (business_id IS NOT NULL AND agency_id IS NULL) OR
        (business_id IS NULL AND agency_id IS NOT NULL)
    )
);

-- 2. SaaS Revenue Ledger Table (Strictly Platform Revenue)
CREATE TABLE IF NOT EXISTS public.saas_revenue_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
    plan TEXT NOT NULL,
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
    provider TEXT NOT NULL CHECK (provider IN ('razorpay', 'stripe', 'google_play', 'skydo', 'demo')),
    provider_transaction_id TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    amount_cents BIGINT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'SUCCEEDED' CHECK (status IN ('SUCCEEDED', 'PENDING', 'FAILED', 'REFUNDED')),
    payment_purpose TEXT NOT NULL DEFAULT 'SAAS_SUBSCRIPTION' CHECK (payment_purpose = 'SAAS_SUBSCRIPTION'),
    receipt_number TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_saas_rev_tenant_isolation CHECK (
        (business_id IS NOT NULL AND agency_id IS NULL) OR
        (business_id IS NULL AND agency_id IS NOT NULL)
    )
);

-- 3. High Performance Indexes
CREATE INDEX IF NOT EXISTS idx_saas_sub_business ON public.saas_subscriptions(business_id);
CREATE INDEX IF NOT EXISTS idx_saas_sub_agency ON public.saas_subscriptions(agency_id);
CREATE INDEX IF NOT EXISTS idx_saas_sub_user ON public.saas_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_saas_sub_status ON public.saas_subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_saas_rev_business ON public.saas_revenue_ledger(business_id);
CREATE INDEX IF NOT EXISTS idx_saas_rev_agency ON public.saas_revenue_ledger(agency_id);
CREATE INDEX IF NOT EXISTS idx_saas_rev_provider_tx ON public.saas_revenue_ledger(provider_transaction_id);
CREATE INDEX IF NOT EXISTS idx_saas_rev_purpose ON public.saas_revenue_ledger(payment_purpose);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.saas_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_revenue_ledger ENABLE ROW LEVEL SECURITY;

-- 5. Business & Agency Tenant Isolation Policies
-- Businesses can read their own subscriptions
CREATE POLICY "Businesses read own saas subscription"
    ON public.saas_subscriptions
    FOR SELECT
    USING (
        business_id IN (
            SELECT business_id FROM public.business_members WHERE user_id = auth.uid()
        )
    );

-- Agencies can read their own subscriptions
CREATE POLICY "Agencies read own saas subscription"
    ON public.saas_subscriptions
    FOR SELECT
    USING (
        agency_id IN (
            SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid()
        )
    );

-- Businesses can read their own SaaS revenue ledger entries
CREATE POLICY "Businesses read own saas revenue records"
    ON public.saas_revenue_ledger
    FOR SELECT
    USING (
        business_id IN (
            SELECT business_id FROM public.business_members WHERE user_id = auth.uid()
        )
    );

-- Agencies can read their own SaaS revenue ledger entries
CREATE POLICY "Agencies read own saas revenue records"
    ON public.saas_revenue_ledger
    FOR SELECT
    USING (
        agency_id IN (
            SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid()
        )
    );

-- Service role has full management
CREATE POLICY "Service role manages saas_subscriptions"
    ON public.saas_subscriptions
    FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role manages saas_revenue_ledger"
    ON public.saas_revenue_ledger
    FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');
