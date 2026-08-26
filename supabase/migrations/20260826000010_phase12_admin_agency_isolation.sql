-- ==============================================================================
-- PAYPILOT AI — PHASE 12: PRIVATE ADMIN IDENTITY + PER-AGENCY TENANT PROVISIONING
-- ==============================================================================

-- 1. PLATFORM_ADMINS TABLE
-- Dedicated security directory for verified platform administrators/owners
CREATE TABLE IF NOT EXISTS public.platform_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'PLATFORM_ADMIN' CHECK (role = 'PLATFORM_ADMIN'),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
    mfa_enabled BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_by TEXT NOT NULL DEFAULT 'system_bootstrap',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_platform_admins_email ON public.platform_admins(email);
CREATE INDEX IF NOT EXISTS idx_platform_admins_user_id ON public.platform_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_admins_status ON public.platform_admins(status);

-- 2. AGENCY_MEMBERS TABLE
-- Per-agency member directory with granular role-based access control
CREATE TABLE IF NOT EXISTS public.agency_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'AGENCY_STAFF' CHECK (role IN ('AGENCY_OWNER', 'AGENCY_ADMIN', 'AGENCY_MANAGER', 'AGENCY_STAFF', 'AGENCY_VIEWER')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended', 'removed')),
    invited_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(agency_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_agency_members_agency_id ON public.agency_members(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_members_user_id ON public.agency_members(user_id);
CREATE INDEX IF NOT EXISTS idx_agency_members_role ON public.agency_members(role);
CREATE INDEX IF NOT EXISTS idx_agency_members_status ON public.agency_members(status);

-- 3. AGENCY_INVITATIONS TABLE
-- Secure, time-limited, hashed invitation tokens for agency onboarding
CREATE TABLE IF NOT EXISTS public.agency_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'AGENCY_STAFF' CHECK (role IN ('AGENCY_OWNER', 'AGENCY_ADMIN', 'AGENCY_MANAGER', 'AGENCY_STAFF', 'AGENCY_VIEWER')),
    token_hash TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED')),
    expires_at TIMESTAMPTZ NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_agency_invitations_token_hash ON public.agency_invitations(token_hash);
CREATE INDEX IF NOT EXISTS idx_agency_invitations_agency_id ON public.agency_invitations(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_invitations_email ON public.agency_invitations(email);
CREATE INDEX IF NOT EXISTS idx_agency_invitations_status ON public.agency_invitations(status);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on newly created tables
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_invitations ENABLE ROW LEVEL SECURITY;

-- 4A. platform_admins RLS Policies
-- Only active Platform Admins can read or manage platform_admins
CREATE POLICY platform_admins_admin_access ON public.platform_admins
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.platform_admins pa
            WHERE pa.user_id = auth.uid()
            AND pa.is_active = true
            AND pa.status = 'active'
        )
    );

-- 4B. agency_members RLS Policies
-- Platform Admins have full access
CREATE POLICY agency_members_platform_admin ON public.agency_members
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.platform_admins pa
            WHERE pa.user_id = auth.uid()
            AND pa.is_active = true
            AND pa.status = 'active'
        )
    );

-- Agency members can view members of their own active agency
CREATE POLICY agency_members_tenant_read ON public.agency_members
    FOR SELECT
    TO authenticated
    USING (
        agency_id IN (
            SELECT am.agency_id FROM public.agency_members am
            WHERE am.user_id = auth.uid()
            AND am.status = 'active'
        )
    );

-- Agency Owners and Admins can manage members within their own agency
CREATE POLICY agency_members_tenant_manage ON public.agency_members
    FOR ALL
    TO authenticated
    USING (
        agency_id IN (
            SELECT am.agency_id FROM public.agency_members am
            WHERE am.user_id = auth.uid()
            AND am.role IN ('AGENCY_OWNER', 'AGENCY_ADMIN')
            AND am.status = 'active'
        )
    );

-- 4C. agency_invitations RLS Policies
-- Platform Admins have full access
CREATE POLICY agency_invitations_platform_admin ON public.agency_invitations
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.platform_admins pa
            WHERE pa.user_id = auth.uid()
            AND pa.is_active = true
            AND pa.status = 'active'
        )
    );

-- Agency Owners/Admins can view and manage invitations for their agency
CREATE POLICY agency_invitations_tenant_manage ON public.agency_invitations
    FOR ALL
    TO authenticated
    USING (
        agency_id IN (
            SELECT am.agency_id FROM public.agency_members am
            WHERE am.user_id = auth.uid()
            AND am.role IN ('AGENCY_OWNER', 'AGENCY_ADMIN')
            AND am.status = 'active'
        )
    );

-- 5. INITIAL PLATFORM ADMIN IDENTITY SEEDING (Idempotent)
-- Authorizes the two platform owners without plaintext credentials
INSERT INTO public.platform_admins (email, role, status, is_active, created_by)
VALUES 
    ('owner1@paypilot.io', 'PLATFORM_ADMIN', 'active', true, 'system_bootstrap'),
    ('owner2@paypilot.io', 'PLATFORM_ADMIN', 'active', true, 'system_bootstrap')
ON CONFLICT (email) DO UPDATE 
SET is_active = true, status = 'active', updated_at = timezone('utc'::text, now());
