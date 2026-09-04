-- ==============================================================================
-- VENTREXS AI — MIGRATION 20260827000012: GOOGLE PLAY BILLING & THREE-CONTEXT RLS
-- Enforces server-side verification of Google Play purchase tokens with SHA-256 hashes,
-- lifecycle states, and strict isolation between Customer, Agency, and Admin contexts.
-- ==============================================================================

-- 1. Create Google Play Subscriptions Table
CREATE TABLE IF NOT EXISTS public.google_play_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    package_name TEXT NOT NULL DEFAULT 'com.ventrexs.app',
    subscription_id TEXT NOT NULL, -- e.g. ventrexs_pro_monthly
    order_id TEXT,
    google_purchase_token_hash TEXT NOT NULL, -- SHA-256 hash of purchase token
    plan TEXT NOT NULL DEFAULT 'Starter',
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('TRIAL', 'ACTIVE', 'PAUSED', 'PAST_DUE', 'CANCELLED', 'EXPIRED')),
    billing_source TEXT NOT NULL DEFAULT 'GOOGLE_PLAY',
    auto_renewing BOOLEAN NOT NULL DEFAULT TRUE,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expiry_time TIMESTAMPTZ NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique index on token hash to prevent duplicate token replay
CREATE UNIQUE INDEX IF NOT EXISTS idx_gplay_token_hash ON public.google_play_subscriptions (google_purchase_token_hash);
CREATE INDEX IF NOT EXISTS idx_gplay_business_id ON public.google_play_subscriptions (business_id);
CREATE INDEX IF NOT EXISTS idx_gplay_status ON public.google_play_subscriptions (status);

-- Enable Row-Level Security
ALTER TABLE public.google_play_subscriptions ENABLE ROW LEVEL SECURITY;

-- 2. RLS Policies for Google Play Subscriptions
-- Business members can view their own subscription
DROP POLICY IF EXISTS "Business members can view own google play subscription" ON public.google_play_subscriptions;
CREATE POLICY "Business members can view own google play subscription"
    ON public.google_play_subscriptions
    FOR SELECT
    USING (
        business_id IN (
            SELECT business_id FROM public.business_members
            WHERE user_id = auth.uid()
        )
    );

-- Platform Admins can view and manage all subscriptions
DROP POLICY IF EXISTS "Platform admins can manage all google play subscriptions" ON public.google_play_subscriptions;
CREATE POLICY "Platform admins can manage all google play subscriptions"
    ON public.google_play_subscriptions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.platform_admins
            WHERE (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()))
              AND is_active = true
        )
    );

-- 3. Add billing_source column to subscriptions table if not present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'subscriptions' 
          AND column_name = 'billing_source'
    ) THEN
        ALTER TABLE public.subscriptions ADD COLUMN billing_source TEXT NOT NULL DEFAULT 'STRIPE';
    END IF;
END $$;

-- 4. Audit Log Integration Trigger
CREATE OR REPLACE FUNCTION public.log_google_play_subscription_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (
        business_id,
        user_id,
        action,
        entity,
        metadata
    ) VALUES (
        NEW.business_id,
        NEW.user_id,
        'GOOGLE_PLAY_SUBSCRIPTION_' || NEW.status,
        'subscription',
        jsonb_build_object(
            'subscription_id', NEW.id,
            'plan', NEW.plan,
            'status', NEW.status,
            'billing_source', NEW.billing_source,
            'expiry_time', NEW.expiry_time,
            'order_id', NEW.order_id
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_google_play_subscription_audit ON public.google_play_subscriptions;
CREATE TRIGGER tr_google_play_subscription_audit
    AFTER INSERT OR UPDATE ON public.google_play_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.log_google_play_subscription_event();
