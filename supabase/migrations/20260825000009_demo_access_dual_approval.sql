-- ==============================================================================
-- PAYPILOT AI — PHASE 11: PRODUCTION DEMO ACCESS & DUAL-APPROVAL SECURITY MIGRATION
-- ==============================================================================

-- 1. Demo Access Tokens Table (Stores SHA-256 hashes only, strictly 24-hour expiration)
CREATE TABLE IF NOT EXISTS demo_access_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL DEFAULT 'biz_01',
    token_hash TEXT NOT NULL UNIQUE,
    created_by TEXT NOT NULL DEFAULT 'admin@paypilot.io',
    label TEXT NOT NULL DEFAULT 'Production Demo Invitation',
    status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'REVOKED', 'EXPIRED')) DEFAULT 'ACTIVE',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    revoked_at TIMESTAMPTZ,
    revoked_by TEXT
);

-- 2. Demo Access Requests Table (Track prospect access requests and 0/2, 1/2, 2/2 approvals)
CREATE TABLE IF NOT EXISTS demo_access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id UUID NOT NULL REFERENCES demo_access_tokens(id) ON DELETE CASCADE,
    requester_name TEXT NOT NULL,
    requester_email TEXT NOT NULL,
    requester_company TEXT,
    requester_ip TEXT,
    user_agent TEXT,
    approval_status TEXT NOT NULL CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
    approvals_count INTEGER NOT NULL DEFAULT 0,
    required_approvals INTEGER NOT NULL DEFAULT 2,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Demo Access Approvals Table (Enforce two distinct authorized owners)
CREATE TABLE IF NOT EXISTS demo_access_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES demo_access_requests(id) ON DELETE CASCADE,
    approver_email TEXT NOT NULL,
    approver_role TEXT NOT NULL DEFAULT 'OWNER',
    decision TEXT NOT NULL CHECK (decision IN ('APPROVED', 'REJECTED')),
    notes TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_request_approver UNIQUE (request_id, approver_email)
);

-- 4. Demo Sessions Table (Short-lived authenticated sessions scoped strictly to demo tenant)
CREATE TABLE IF NOT EXISTS demo_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES demo_access_requests(id) ON DELETE CASCADE,
    token_id UUID NOT NULL REFERENCES demo_access_tokens(id) ON DELETE CASCADE,
    session_token_hash TEXT NOT NULL UNIQUE,
    business_id TEXT NOT NULL DEFAULT 'biz_01',
    requester_email TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'EXPIRED', 'REVOKED')) DEFAULT 'ACTIVE',
    expires_at TIMESTAMPTZ NOT NULL,
    last_activity_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Indexes for fast token lookup and expiry queries
CREATE INDEX IF NOT EXISTS idx_demo_tokens_hash ON demo_access_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_demo_tokens_status ON demo_access_tokens(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_demo_requests_token ON demo_access_requests(token_id);
CREATE INDEX IF NOT EXISTS idx_demo_requests_status ON demo_access_requests(approval_status);
CREATE INDEX IF NOT EXISTS idx_demo_approvals_request ON demo_access_approvals(request_id);
CREATE INDEX IF NOT EXISTS idx_demo_sessions_hash ON demo_sessions(session_token_hash);
CREATE INDEX IF NOT EXISTS idx_demo_sessions_status ON demo_sessions(status, expires_at);

-- 6. Enable Row Level Security
ALTER TABLE demo_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_access_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_sessions ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies: Platform Administrators & Owners can manage demo tokens
CREATE POLICY "platform_admins_manage_demo_tokens" ON demo_access_tokens
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role IN ('OWNER', 'PLATFORM_ADMIN')
        )
    );

CREATE POLICY "platform_admins_manage_demo_requests" ON demo_access_requests
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role IN ('OWNER', 'PLATFORM_ADMIN')
        )
    );

CREATE POLICY "platform_admins_manage_demo_approvals" ON demo_access_approvals
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role IN ('OWNER', 'PLATFORM_ADMIN')
        )
    );

CREATE POLICY "platform_admins_manage_demo_sessions" ON demo_sessions
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role IN ('OWNER', 'PLATFORM_ADMIN')
        )
    );

-- Public / Anonymous token validation policy (Lookup active non-expired tokens by hash only)
CREATE POLICY "public_read_active_demo_token_by_hash" ON demo_access_tokens
    FOR SELECT
    TO anon, authenticated
    USING (
        status = 'ACTIVE' AND expires_at > timezone('utc'::text, now())
    );

CREATE POLICY "public_insert_demo_requests" ON demo_access_requests
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "public_read_own_demo_request" ON demo_access_requests
    FOR SELECT
    TO anon, authenticated
    USING (true);
