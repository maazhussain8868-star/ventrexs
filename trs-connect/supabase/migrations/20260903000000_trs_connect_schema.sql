-- ==============================================================================
-- TRS CONNECT - PRODUCTION DATABASE SCHEMA & HARDENED RLS POLICIES
-- SECURITY AUDIT COMPLIANT: STRICT ROLE-BASED ACCESS CONTROL & AUDIT LOGGING
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ENUMS (MANDATED ROLES & STATUSES)
-- ------------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('MEMBER', 'VOLUNTEER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE membership_status AS ENUM ('none', 'pending', 'approved', 'rejected', 'suspended');
CREATE TYPE issue_status AS ENUM ('submitted', 'under_review', 'assigned', 'resolved');
CREATE TYPE issue_category AS ENUM (
    'Roads & Potholes',
    'Water Supply & Pipelines',
    'Electricity & Transformers',
    'Sanitation & Garbage',
    'Streetlights & Safety',
    'Drainage & Sewage',
    'Parks & Public Amenities'
);
CREATE TYPE event_category AS ENUM (
    'Community Welfare Camp',
    'Youth Leadership Meet',
    'Townhall with MLA',
    'Public Tree Plantation',
    'Health & Eye Screening'
);

-- ------------------------------------------------------------------------------
-- 2. HELPER FUNCTIONS FOR AUTHORIZATION
-- ------------------------------------------------------------------------------
-- Checks if current authenticated user has Moderator, Admin, or Super Admin privileges
CREATE OR REPLACE FUNCTION public.is_admin_or_moderator(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role IN ('MODERATOR', 'ADMIN', 'SUPER_ADMIN')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Checks if current user is Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role = 'SUPER_ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 3. CITIZEN PROFILES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email TEXT,
    constituency TEXT NOT NULL,
    ward TEXT NOT NULL,
    address TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'MEMBER',
    is_member BOOLEAN NOT NULL DEFAULT FALSE,
    is_volunteer BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. MEMBERSHIPS & VERIFICATION LIFECYCLE
-- Never auto-approves: Status begins strictly as 'pending'
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    application_number VARCHAR(50) NOT NULL UNIQUE,
    membership_number VARCHAR(50) UNIQUE, -- NULL until officially APPROVED
    status membership_status NOT NULL DEFAULT 'pending',
    category VARCHAR(50) NOT NULL DEFAULT 'General Citizen',
    applied_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_date TIMESTAMPTZ,
    valid_till TIMESTAMPTZ,
    qr_code_url TEXT, -- NULL until approved
    verification_badge TEXT DEFAULT 'Pending Verification',
    reviewed_by UUID REFERENCES public.profiles(id),
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. VOLUNTEERS (DATA MINIMIZATION COMPLIANT)
-- Explicitly removed blood group and emergency contact per privacy standard
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.volunteers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    domains TEXT[] NOT NULL DEFAULT '{}',
    availability VARCHAR(50) NOT NULL DEFAULT 'Weekends Only',
    skills TEXT[] NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    hours_logged NUMERIC(6, 2) NOT NULL DEFAULT 0,
    missions_completed INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. CITIZEN ISSUES (PRIVATE PER-USER ACCESS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reporter_name TEXT NOT NULL,
    reporter_phone VARCHAR(20) NOT NULL,
    title TEXT NOT NULL,
    category issue_category NOT NULL,
    description TEXT NOT NULL,
    photo_url TEXT,
    location_name TEXT NOT NULL,
    constituency TEXT NOT NULL,
    ward TEXT NOT NULL,
    status issue_status NOT NULL DEFAULT 'submitted',
    assigned_department TEXT,
    assigned_officer TEXT,
    assigned_officer_contact VARCHAR(20),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. EVENTS & REGISTRATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category event_category NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    venue TEXT NOT NULL,
    constituency TEXT NOT NULL,
    ward TEXT,
    banner_url TEXT,
    speaker_info TEXT DEFAULT 'Pending Official Confirmation',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    pass_code VARCHAR(50) NOT NULL UNIQUE,
    attended BOOLEAN NOT NULL DEFAULT FALSE,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- ------------------------------------------------------------------------------
-- 8. ANNOUNCEMENTS & NOTIFICATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    tag VARCHAR(50) NOT NULL DEFAULT 'Public Notice',
    constituency TEXT,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    published_by UUID REFERENCES public.profiles(id),
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'general',
    read BOOLEAN NOT NULL DEFAULT FALSE,
    action_screen TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. CONSENT RECORDS & IMMUTABLE AUDIT LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    consent_type VARCHAR(50) NOT NULL, -- 'voluntary_membership', 'terms_of_use', 'sms_notifications'
    agreed BOOLEAN NOT NULL DEFAULT TRUE,
    agreed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_name TEXT,
    action TEXT NOT NULL, -- 'MEMBERSHIP_APPROVED', 'MEMBERSHIP_REJECTED', 'ISSUE_STATUS_UPDATED', etc.
    target_table VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES — PRODUCTION GRADE
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 10.1 Profiles: Users can only read their own profile; admins can view all
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "Users can update own profile except role" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- 10.2 Memberships: Users can read own membership. Insert ONLY with pending status.
CREATE POLICY "Users can view own membership" ON public.memberships
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "Users can submit membership application" ON public.memberships
    FOR INSERT WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can update membership approval" ON public.memberships
    FOR UPDATE USING (public.is_admin_or_moderator(auth.uid()));

-- 10.3 Issues: Users CANNOT read other users' private issues. Only admins can read all.
CREATE POLICY "Users can only read own issues" ON public.issues
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "Users can report issues" ON public.issues
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submitted issue" ON public.issues
    FOR UPDATE USING (auth.uid() = user_id AND status = 'submitted')
    WITH CHECK (auth.uid() = user_id AND status = 'submitted');

CREATE POLICY "Admins can update issue status" ON public.issues
    FOR UPDATE USING (public.is_admin_or_moderator(auth.uid()));

-- 10.4 Volunteers: Users can view and update own volunteer record
CREATE POLICY "Users view own volunteer profile" ON public.volunteers
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "Users insert own volunteer profile" ON public.volunteers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own volunteer profile" ON public.volunteers
    FOR UPDATE USING (auth.uid() = user_id);

-- 10.5 Events: Public events readable by all authenticated users; write only by Admins
CREATE POLICY "Events readable by authenticated users" ON public.events
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Only admins can manage events" ON public.events
    FOR ALL USING (public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "Users manage own event RSVPs" ON public.event_registrations
    FOR ALL USING (auth.uid() = user_id);

-- 10.6 Announcements: Readable by all; manageable only by Admins
CREATE POLICY "Announcements readable by everyone" ON public.announcements
    FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Admins publish announcements" ON public.announcements
    FOR ALL USING (public.is_admin_or_moderator(auth.uid()));

-- 10.7 Notifications: Strictly private to recipient user
CREATE POLICY "Notifications strictly private" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- 10.8 Consents: Immutable; users can view & insert own; no updates/deletes permitted
CREATE POLICY "Users view own consent records" ON public.consents
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "Users insert consent records" ON public.consents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10.9 Audit Logs: Immutable; NO user inserts or updates; only Super Admin reads
CREATE POLICY "Super admins view audit logs" ON public.audit_logs
    FOR SELECT USING (public.is_super_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 11. STORAGE BUCKET SECURITY POLICIES (Avatars & Issue Attachments)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) 
VALUES ('issue_attachments', 'issue_attachments', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own issue attachments"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'issue_attachments' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users view own issue attachments"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'issue_attachments' 
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR public.is_admin_or_moderator(auth.uid())
    )
);

CREATE POLICY "Users upload own avatars"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users view own avatars"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ------------------------------------------------------------------------------
-- 12. ETHICAL & STATUTORY NON-PROFILING GUARANTEE
-- ------------------------------------------------------------------------------
-- In strict adherence to organizational policy and citizen privacy rights:
-- 1. No political persuasion scoring or profiling is stored or inferred.
-- 2. Caste, religion, ethnicity, or sensitive health attributes are strictly prohibited.
-- 3. Approximate constituency selection is used solely for local service discovery.
