-- ==============================================================================
-- PAYPILOT AI — OMNIDIMENSION AI RECEPTIONIST PROVISIONING & TELEPHONY SCHEMA
-- Multi-Tenant Agent IDs, Inbound Phone Numbers, Trial Cost Tagging
-- ==============================================================================

-- 1. EXTEND BUSINESSES TABLE WITH OMNIDIMENSION AGENT & PHONE NUMBER
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS omnidimension_agent_id TEXT,
  ADD COLUMN IF NOT EXISTS receptionist_phone_number TEXT,
  ADD COLUMN IF NOT EXISTS receptionist_provisioned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS receptionist_status TEXT NOT NULL DEFAULT 'unprovisioned',
  ADD COLUMN IF NOT EXISTS receptionist_provisioning_tier TEXT DEFAULT 'paid',
  ADD COLUMN IF NOT EXISTS receptionist_metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2. CREATE INDEXES FOR FAST TELEPHONY & WEBHOOK LOOKUPS
CREATE INDEX IF NOT EXISTS idx_businesses_receptionist_phone ON public.businesses(receptionist_phone_number);
CREATE INDEX IF NOT EXISTS idx_businesses_omnidimension_agent ON public.businesses(omnidimension_agent_id);
CREATE INDEX IF NOT EXISTS idx_businesses_receptionist_status ON public.businesses(receptionist_status);
CREATE INDEX IF NOT EXISTS idx_businesses_provisioning_tier ON public.businesses(receptionist_provisioning_tier);

-- 3. ENSURE USAGE_RECORDS ACCEPTS 'ai_receptionist_minutes'
COMMENT ON COLUMN public.businesses.receptionist_phone_number IS 'Dedicated inbound DID phone number assigned to the business OmniDimension AI agent';
COMMENT ON COLUMN public.businesses.receptionist_provisioning_tier IS 'Tracks whether the telephony resource was provisioned under free trial or paid subscription for cost attribution';
