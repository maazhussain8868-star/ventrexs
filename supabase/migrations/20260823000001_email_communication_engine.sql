-- ==============================================================================
-- PAYPILOT AI — PHASE 4: EMAIL COMMUNICATION ENGINE MIGRATION
-- Enhances communications table with delivery metadata, provider tracking, and status lifecycle
-- ==============================================================================

-- 1. Add provider tracking and delivery metadata columns
ALTER TABLE public.communications
    ADD COLUMN IF NOT EXISTS provider_message_id TEXT,
    ADD COLUMN IF NOT EXISTS error_message TEXT,
    ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending';

-- 2. Update status check constraint to include all Phase 4 lifecycle states
-- Allowed: draft, approved, sending, sent, failed, cancelled
DO $$
BEGIN
    -- Drop existing check constraint if present
    ALTER TABLE public.communications DROP CONSTRAINT IF EXISTS communications_status_check;
    
    -- Add updated status check constraint
    ALTER TABLE public.communications
        ADD CONSTRAINT communications_status_check
        CHECK (status IN ('draft', 'approved', 'sending', 'sent', 'failed', 'cancelled'));
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Notice updating communications status constraint: %', SQLERRM;
END $$;

-- 3. Add index for provider message lookup and delivery status queries
CREATE INDEX IF NOT EXISTS idx_communications_provider_msg ON public.communications(provider_message_id);
CREATE INDEX IF NOT EXISTS idx_communications_status ON public.communications(status);
CREATE INDEX IF NOT EXISTS idx_communications_delivery ON public.communications(delivery_status);
