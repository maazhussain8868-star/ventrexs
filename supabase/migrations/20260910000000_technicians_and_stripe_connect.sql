-- ==============================================================================
-- VENTREXS AI — TECHNICIANS & STRIPE CONNECT EXPRESS MIGRATION
-- Multi-Tenant Employee/Technician Management + Direct Merchant Settlement
-- ==============================================================================

-- 1. CREATE TECHNICIANS TABLE
CREATE TABLE IF NOT EXISTS public.technicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'technician',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deactivated')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for fast multi-tenant querying
CREATE INDEX IF NOT EXISTS idx_technicians_business ON public.technicians(business_id);
CREATE INDEX IF NOT EXISTS idx_technicians_status ON public.technicians(status);
CREATE INDEX IF NOT EXISTS idx_technicians_created_at ON public.technicians(created_at DESC);

-- 2. ENABLE ROW LEVEL SECURITY (RLS) FOR TECHNICIANS
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Members can view technicians" ON public.technicians;
    CREATE POLICY "Members can view technicians"
        ON public.technicians FOR SELECT
        USING (public.is_business_member(business_id));

    DROP POLICY IF EXISTS "Members can insert technicians" ON public.technicians;
    CREATE POLICY "Members can insert technicians"
        ON public.technicians FOR INSERT
        WITH CHECK (public.is_business_member(business_id));

    DROP POLICY IF EXISTS "Members can update technicians" ON public.technicians;
    CREATE POLICY "Members can update technicians"
        ON public.technicians FOR UPDATE
        USING (public.is_business_member(business_id));

    DROP POLICY IF EXISTS "Admins can delete technicians" ON public.technicians;
    CREATE POLICY "Admins can delete technicians"
        ON public.technicians FOR DELETE
        USING (public.is_business_admin(business_id));
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Notice creating technicians RLS policies: %', SQLERRM;
END $$;

-- 3. ADD STRIPE CONNECT EXPRESS FIELDS TO BUSINESSES
ALTER TABLE public.businesses
    ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
    ADD COLUMN IF NOT EXISTS stripe_details_submitted BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_businesses_stripe_account_id ON public.businesses(stripe_account_id);

-- 4. LINK JOBS TO TECHNICIANS TABLE
-- Ensure jobs table has technician_id column with foreign key to technicians
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'jobs' 
        AND column_name = 'technician_id'
    ) THEN
        ALTER TABLE public.jobs ADD COLUMN technician_id UUID REFERENCES public.technicians(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_jobs_technician_id ON public.jobs(technician_id);
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_tech_id ON public.jobs(assigned_tech_id);
