-- ==============================================================================
-- PAYPILOT AI — PHASE 6: WHATSAPP COMMUNICATION ENGINE MIGRATION
-- Adds WhatsApp Business API consent tracking, opt-out management, and template metadata
-- ==============================================================================

-- 1. Add WhatsApp consent and opt-out tracking columns to customers
ALTER TABLE public.customers
    ADD COLUMN IF NOT EXISTS whatsapp_consent BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS whatsapp_consent_at TIMESTAMPTZ DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS whatsapp_consent_source TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS whatsapp_opted_out BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS whatsapp_opted_out_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS whatsapp_opt_out_reason TEXT;

-- 2. Add template metadata column to communications table for WhatsApp Business templates
ALTER TABLE public.communications
    ADD COLUMN IF NOT EXISTS template_name TEXT,
    ADD COLUMN IF NOT EXISTS template_language TEXT DEFAULT 'en_US',
    ADD COLUMN IF NOT EXISTS template_variables JSONB DEFAULT '{}'::jsonb;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_whatsapp_optout ON public.customers(whatsapp_opted_out);
CREATE INDEX IF NOT EXISTS idx_communications_template ON public.communications(template_name);
