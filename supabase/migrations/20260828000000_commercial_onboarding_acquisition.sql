-- ==============================================================================
-- 20260828000000_commercial_onboarding_acquisition.sql
-- Ventrexs AI Commercial Launch: Acquisition Attribution, Signup Types, & Onboarding State
-- ==============================================================================

-- 1. Create Acquisition Attribution Table
CREATE TABLE IF NOT EXISTS public.acquisition_attribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL,
  acquisition_source TEXT NOT NULL DEFAULT 'DIRECT',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  landing_page TEXT DEFAULT '/',
  referrer TEXT,
  first_touch_at TIMESTAMPTZ DEFAULT now(),
  last_touch_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add Onboarding State & Account Type Columns
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'BUSINESS_OWNER';

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'IN_PROGRESS',
  ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'US',
  ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'Service Contractor';

ALTER TABLE public.agencies
  ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'IN_PROGRESS',
  ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS target_market TEXT,
  ADD COLUMN IF NOT EXISTS team_size TEXT DEFAULT '1-5';

-- 3. Indexes for fast analytical and tenancy lookups
CREATE INDEX IF NOT EXISTS idx_acq_user_id ON public.acquisition_attribution(user_id);
CREATE INDEX IF NOT EXISTS idx_acq_business_id ON public.acquisition_attribution(business_id);
CREATE INDEX IF NOT EXISTS idx_acq_agency_id ON public.acquisition_attribution(agency_id);
CREATE INDEX IF NOT EXISTS idx_acq_source ON public.acquisition_attribution(acquisition_source);
CREATE INDEX IF NOT EXISTS idx_acq_campaign ON public.acquisition_attribution(utm_campaign);

-- 4. Enable RLS on Acquisition Attribution
ALTER TABLE public.acquisition_attribution ENABLE ROW LEVEL SECURITY;

-- Admins can read all acquisition attribution
CREATE POLICY "Admins can view acquisition attribution"
  ON public.acquisition_attribution
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.platform_admins
      WHERE user_id = auth.uid()
    )
  );

-- Users can view their own acquisition record
CREATE POLICY "Users can view own acquisition attribution"
  ON public.acquisition_attribution
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
  );

-- Service role and authenticated signup insertion policy
CREATE POLICY "Enable insert for authenticated and anon during signup"
  ON public.acquisition_attribution
  FOR INSERT
  WITH CHECK (true);
