-- ==============================================================================
-- PAYPILOT AI — PHASE 5: JOBS, ESTIMATES & FIELD OPERATIONS SCHEMA MIGRATION
-- Multi-Tenant RLS, Work Orders, Line Items, Estimate Approvals, and Activity Timeline
-- ==============================================================================

-- 1. ENHANCE JOBS TABLE
ALTER TABLE public.jobs
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS property_address TEXT,
    ADD COLUMN IF NOT EXISTS assigned_tech_id UUID,
    ADD COLUMN IF NOT EXISTS assigned_tech_name TEXT,
    ADD COLUMN IF NOT EXISTS estimated_duration_minutes INT DEFAULT 60,
    ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS internal_notes TEXT,
    ADD COLUMN IF NOT EXISTS customer_notes TEXT,
    ADD COLUMN IF NOT EXISTS estimate_id UUID,
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS completed_by UUID;

-- Relax & expand jobs status check to support full field operations lifecycle
DO $$
BEGIN
    ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
    ALTER TABLE public.jobs ADD CONSTRAINT jobs_status_check 
        CHECK (status IN ('NEW', 'SCHEDULED', 'DISPATCHED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'PENDING', 'INVOICED'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 2. CREATE ESTIMATES TABLE
CREATE TABLE IF NOT EXISTS public.estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    estimate_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (tax_rate >= 0),
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'VIEWED', 'APPROVED', 'REJECTED', 'EXPIRED', 'CANCELLED')),
    valid_until DATE,
    notes TEXT,
    created_by UUID,
    approved_at TIMESTAMPTZ,
    approved_by_customer_name TEXT,
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. CREATE JOB_ACTIVITIES TABLE (Field Operations Timeline)
CREATE TABLE IF NOT EXISTS public.job_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    user_id UUID,
    user_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR MULTI-TENANT QUERY ACCELERATION
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_estimates_business ON public.estimates(business_id);
CREATE INDEX IF NOT EXISTS idx_estimates_customer ON public.estimates(customer_id);
CREATE INDEX IF NOT EXISTS idx_estimates_job ON public.estimates(job_id);
CREATE INDEX IF NOT EXISTS idx_estimates_status ON public.estimates(status);
CREATE INDEX IF NOT EXISTS idx_estimates_created ON public.estimates(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_activities_job ON public.job_activities(job_id);
CREATE INDEX IF NOT EXISTS idx_job_activities_business ON public.job_activities(business_id);
CREATE INDEX IF NOT EXISTS idx_job_activities_created ON public.job_activities(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_jobs_tech ON public.jobs(assigned_tech_id);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date ON public.jobs(scheduled_date);

-- ==============================================================================
-- TRIGGERS FOR updated_at
-- ==============================================================================
CREATE TRIGGER trg_estimates_updated_at BEFORE UPDATE ON public.estimates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_activities ENABLE ROW LEVEL SECURITY;

-- 1. ESTIMATES POLICIES
CREATE POLICY "Members can view estimates"
    ON public.estimates FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can insert estimates"
    ON public.estimates FOR INSERT
    WITH CHECK (public.is_business_member(business_id));

CREATE POLICY "Members can update estimates"
    ON public.estimates FOR UPDATE
    USING (public.is_business_member(business_id));

CREATE POLICY "Admins can delete estimates"
    ON public.estimates FOR DELETE
    USING (public.is_business_admin(business_id));

-- 2. JOB ACTIVITIES POLICIES
CREATE POLICY "Members can view job activities"
    ON public.job_activities FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can insert job activities"
    ON public.job_activities FOR INSERT
    WITH CHECK (public.is_business_member(business_id));
