-- ==============================================================================
-- PAYPILOT AI — SERVICE BUSINESS & CRM FOUNDATION SCHEMA MIGRATION
-- Multi-Tenant Architecture, Row Level Security, Service Business Operations
-- ==============================================================================

-- 1. EXTEND BUSINESSES TABLE WITH SERVICE BUSINESS ATTRIBUTES
ALTER TABLE public.businesses 
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS service_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS services JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS business_hours JSONB NOT NULL DEFAULT '{"weekdays": "8:00 AM - 6:00 PM", "weekends": "9:00 AM - 4:00 PM", "emergency24_7": true}'::jsonb,
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'America/New_York',
  ADD COLUMN IF NOT EXISTS about TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- ==============================================================================
-- 2. LEADS TABLE (CRM Incoming Requests & Inquiries)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    source TEXT NOT NULL DEFAULT 'Website' CHECK (source IN ('Website', 'Phone Call', 'Google', 'Referral', 'Angi', 'Yelp', 'Facebook', 'Thumbtack', 'Direct', 'Other')),
    service_requested TEXT,
    status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'ESTIMATE_SENT', 'BOOKED', 'WON', 'LOST')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    estimated_value NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (estimated_value >= 0),
    assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_user_name TEXT,
    notes TEXT,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. LEAD_ACTIVITIES TABLE (Audit & Activity Timeline for Leads)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.lead_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('status_change', 'note', 'call', 'email', 'sms', 'estimate_created', 'booking_created', 'stage_change')),
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 4. APPOINTMENTS TABLE (Field & Service Scheduling)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    service_type TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    address TEXT,
    technician_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_appointment_time CHECK (end_time >= start_time)
);

-- ==============================================================================
-- 5. JOBS TABLE (Service Work Orders & Execution)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    service_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'INVOICED', 'CANCELLED')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    scheduled_date DATE,
    estimated_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (estimated_total >= 0),
    actual_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (actual_total >= 0),
    technician_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR HIGH PERFORMANCE MULTI-TENANT QUERIES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_leads_business ON public.leads(business_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead ON public.lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_business ON public.lead_activities(business_id);
CREATE INDEX IF NOT EXISTS idx_appointments_business ON public.appointments(business_id);
CREATE INDEX IF NOT EXISTS idx_appointments_time ON public.appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_jobs_business ON public.jobs(business_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);

-- ==============================================================================
-- TRIGGERS FOR updated_at
-- ==============================================================================
CREATE TRIGGER trg_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- 1. LEADS POLICIES
CREATE POLICY "Members can view leads"
    ON public.leads FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can insert leads"
    ON public.leads FOR INSERT
    WITH CHECK (public.is_business_member(business_id));

CREATE POLICY "Members can update leads"
    ON public.leads FOR UPDATE
    USING (public.is_business_member(business_id));

CREATE POLICY "Admins can delete leads"
    ON public.leads FOR DELETE
    USING (public.is_business_admin(business_id));

-- 2. LEAD_ACTIVITIES POLICIES
CREATE POLICY "Members can view lead activities"
    ON public.lead_activities FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can insert lead activities"
    ON public.lead_activities FOR INSERT
    WITH CHECK (public.is_business_member(business_id));

-- 3. APPOINTMENTS POLICIES
CREATE POLICY "Members can view appointments"
    ON public.appointments FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can insert appointments"
    ON public.appointments FOR INSERT
    WITH CHECK (public.is_business_member(business_id));

CREATE POLICY "Members can update appointments"
    ON public.appointments FOR UPDATE
    USING (public.is_business_member(business_id));

CREATE POLICY "Admins can delete appointments"
    ON public.appointments FOR DELETE
    USING (public.is_business_admin(business_id));

-- 4. JOBS POLICIES
CREATE POLICY "Members can view jobs"
    ON public.jobs FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can insert jobs"
    ON public.jobs FOR INSERT
    WITH CHECK (public.is_business_member(business_id));

CREATE POLICY "Members can update jobs"
    ON public.jobs FOR UPDATE
    USING (public.is_business_member(business_id));

CREATE POLICY "Admins can delete jobs"
    ON public.jobs FOR DELETE
    USING (public.is_business_admin(business_id));
