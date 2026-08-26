-- ==============================================================================
-- PAYPILOT AI — PHASE 10: PRODUCTION LAUNCH, AGENCY & WHITE-LABEL MIGRATION
-- ==============================================================================

-- 1. AGENCIES TABLE
CREATE TABLE IF NOT EXISTS public.agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    plan_tier TEXT NOT NULL DEFAULT 'Agency Starter' CHECK (plan_tier IN ('Agency Starter', 'Agency Growth', 'Agency Enterprise')),
    max_businesses INTEGER NOT NULL DEFAULT 10,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_agencies_slug ON public.agencies(slug);
CREATE INDEX IF NOT EXISTS idx_agencies_owner ON public.agencies(owner_id);

-- 2. AGENCY_BUSINESSES JUNCTION TABLE
CREATE TABLE IF NOT EXISTS public.agency_businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'manager' CHECK (role IN ('owner', 'manager', 'viewer')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(agency_id, business_id)
);

CREATE INDEX IF NOT EXISTS idx_agency_businesses_agency ON public.agency_businesses(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_businesses_business ON public.agency_businesses(business_id);

-- 3. AGENCY_BRANDING (White-Label Configuration)
CREATE TABLE IF NOT EXISTS public.agency_branding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID UNIQUE REFERENCES public.agencies(id) ON DELETE CASCADE,
    business_id UUID UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE,
    brand_name TEXT NOT NULL,
    logo_url TEXT,
    favicon_url TEXT,
    primary_color TEXT NOT NULL DEFAULT '#0284c7',
    secondary_color TEXT NOT NULL DEFAULT '#0f172a',
    accent_color TEXT NOT NULL DEFAULT '#059669',
    login_headline TEXT,
    login_tagline TEXT,
    email_sender_name TEXT,
    support_email TEXT,
    support_phone TEXT,
    footer_text TEXT,
    custom_privacy_url TEXT,
    custom_terms_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_agency_branding_agency ON public.agency_branding(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_branding_business ON public.agency_branding(business_id);

-- 4. CUSTOM_DOMAINS TABLE
CREATE TABLE IF NOT EXISTS public.custom_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    domain TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFYING', 'VERIFIED', 'ACTIVE', 'FAILED', 'REMOVED')),
    txt_verification_token TEXT NOT NULL,
    ssl_status TEXT NOT NULL DEFAULT 'pending' CHECK (ssl_status IN ('pending', 'issuing', 'active', 'failed')),
    verified_at TIMESTAMPTZ,
    last_checked_at TIMESTAMPTZ,
    failure_reason TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON public.custom_domains(domain);
CREATE INDEX IF NOT EXISTS idx_custom_domains_agency ON public.custom_domains(agency_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_business ON public.custom_domains(business_id);

-- 5. FEATURE_FLAGS TABLE
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_key TEXT NOT NULL,
    scope TEXT NOT NULL CHECK (scope IN ('global', 'agency', 'business')),
    target_id UUID, -- agency_id or business_id if scoped
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(flag_key, scope, target_id)
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON public.feature_flags(flag_key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_scope ON public.feature_flags(scope, target_id);

-- 6. AUDIT_EVENTS TABLE (Immutable Append-Only Log)
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_email TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    event_type TEXT NOT NULL,
    description TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_events_business ON public.audit_events(business_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_agency ON public.audit_events(agency_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_type ON public.audit_events(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_events_created ON public.audit_events(created_at DESC);

-- 7. DATA_EXPORT_REQUESTS & DELETION_REQUESTS
CREATE TABLE IF NOT EXISTS public.data_export_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    format TEXT NOT NULL DEFAULT 'json' CHECK (format IN ('json', 'csv', 'zip')),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED')),
    download_url TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'REVIEWED', 'CONFIRMED', 'EXECUTED', 'REJECTED')),
    reason TEXT NOT NULL,
    reviewed_by UUID REFERENCES auth.users(id),
    confirmed_at TIMESTAMPTZ,
    executed_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. SYSTEM_HEALTH_EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.system_health_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('HEALTHY', 'DEGRADED', 'OUTAGE')),
    response_time_ms INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_health_component ON public.system_health_events(component);
CREATE INDEX IF NOT EXISTS idx_health_created ON public.system_health_events(created_at DESC);

-- 9. Row Level Security Policies
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_events ENABLE ROW LEVEL SECURITY;

-- Helper function for agency membership check
CREATE OR REPLACE FUNCTION public.is_agency_member(target_agency_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.agencies
    WHERE id = target_agency_id AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
CREATE POLICY "Agency owners can view own agency" ON public.agencies
    FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Agency owners can view own assigned businesses" ON public.agency_businesses
    FOR SELECT USING (public.is_agency_member(agency_id));

CREATE POLICY "Agency owners can manage branding" ON public.agency_branding
    FOR ALL USING (public.is_agency_member(agency_id));

CREATE POLICY "Agency owners can manage domains" ON public.custom_domains
    FOR ALL USING (public.is_agency_member(agency_id));

CREATE POLICY "Members can view feature flags" ON public.feature_flags
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Members can view own audit events" ON public.audit_events
    FOR SELECT USING (business_id IS NOT NULL AND public.is_business_member(business_id));

CREATE POLICY "Service role full access on Phase 10 tables" ON public.agencies FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on agency_businesses" ON public.agency_businesses FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on agency_branding" ON public.agency_branding FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on custom_domains" ON public.custom_domains FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on feature_flags" ON public.feature_flags FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on audit_events" ON public.audit_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on data_export_requests" ON public.data_export_requests FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on deletion_requests" ON public.deletion_requests FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on system_health_events" ON public.system_health_events FOR ALL TO service_role USING (true) WITH CHECK (true);
