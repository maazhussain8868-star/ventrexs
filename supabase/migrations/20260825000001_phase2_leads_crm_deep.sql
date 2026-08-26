-- ==============================================================================
-- PAYPILOT AI — PHASE 2: LEADS & CRM DEEP FUNCTIONALITY SCHEMA MIGRATION
-- Multi-Tenant Architecture, Row Level Security, Lead Notes & Lead Scoring
-- ==============================================================================

-- 1. ADD COMPANY AND SCORE COLUMNS TO LEADS
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS company TEXT,
  ADD COLUMN IF NOT EXISTS score INTEGER NOT NULL DEFAULT 50 CHECK (score >= 0 AND score <= 100);

-- 2. CREATE LEAD_NOTES TABLE
CREATE TABLE IF NOT EXISTS public.lead_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_lead_notes_lead ON public.lead_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_notes_business ON public.lead_notes(business_id);
CREATE INDEX IF NOT EXISTS idx_lead_notes_created_at ON public.lead_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads(score);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON public.leads(assigned_user_id);

-- 4. TRIGGER FOR updated_at
CREATE TRIGGER trg_lead_notes_updated_at BEFORE UPDATE ON public.lead_notes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. ROW LEVEL SECURITY (RLS) FOR LEAD_NOTES
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view lead notes"
    ON public.lead_notes FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can insert lead notes"
    ON public.lead_notes FOR INSERT
    WITH CHECK (public.is_business_member(business_id));

CREATE POLICY "Members can update their own lead notes or admins"
    ON public.lead_notes FOR UPDATE
    USING (public.is_business_member(business_id));

CREATE POLICY "Admins or authors can delete lead notes"
    ON public.lead_notes FOR DELETE
    USING (public.is_business_member(business_id));
