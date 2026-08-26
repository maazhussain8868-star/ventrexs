-- ==============================================================================
-- PAYPILOT AI — PHASE 4: MULTI-CHANNEL COMMUNICATION AUTOMATION MIGRATION
-- Adds Communication Templates, Consents, Approvals, Queue, and Pipeline Integration
-- ==============================================================================

-- 1. COMMUNICATION TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS public.communication_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp')),
    category TEXT NOT NULL CHECK (category IN (
        'appointment_confirmation',
        'appointment_reminder',
        'estimate_notification',
        'invoice_notification',
        'payment_confirmation',
        'follow_up',
        'lead_welcome',
        'custom'
    )),
    subject_template TEXT,
    body_template TEXT NOT NULL,
    variables JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. COMMUNICATION CONSENTS TABLE (Multi-Channel Consent & Opt-Out Registry)
CREATE TABLE IF NOT EXISTS public.communication_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp')),
    opted_in BOOLEAN NOT NULL DEFAULT FALSE,
    consent_source TEXT,
    consent_at TIMESTAMPTZ,
    opted_out BOOLEAN NOT NULL DEFAULT FALSE,
    opted_out_at TIMESTAMPTZ,
    opt_out_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_consent_target CHECK (customer_id IS NOT NULL OR lead_id IS NOT NULL)
);

-- 3. ENHANCE COMMUNICATIONS TABLE WITH AUTOMATION, APPROVAL & QUEUE ATTRIBUTES
ALTER TABLE public.communications
    ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.communication_templates(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS trigger_type TEXT,
    ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'auto_approved' CHECK (approval_status IN ('auto_approved', 'pending_approval', 'approved', 'rejected')),
    ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
    ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN NOT NULL DEFAULT FALSE;

-- 4. PERFORMANCE & LOOKUP INDEXES
CREATE INDEX IF NOT EXISTS idx_comm_templates_business ON public.communication_templates(business_id);
CREATE INDEX IF NOT EXISTS idx_comm_templates_channel ON public.communication_templates(channel);
CREATE INDEX IF NOT EXISTS idx_comm_consents_business ON public.communication_consents(business_id);
CREATE INDEX IF NOT EXISTS idx_comm_consents_customer ON public.communication_consents(customer_id);
CREATE INDEX IF NOT EXISTS idx_comm_consents_lead ON public.communication_consents(lead_id);
CREATE INDEX IF NOT EXISTS idx_comm_consents_channel ON public.communication_consents(channel);
CREATE INDEX IF NOT EXISTS idx_comm_consents_optout ON public.communication_consents(opted_out);
CREATE INDEX IF NOT EXISTS idx_communications_idempotency ON public.communications(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_communications_lead ON public.communications(lead_id);
CREATE INDEX IF NOT EXISTS idx_communications_approval ON public.communications(approval_status);

-- 5. AUTO-UPDATE TRIGGERS
CREATE TRIGGER trg_comm_templates_updated_at BEFORE UPDATE ON public.communication_templates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_comm_consents_updated_at BEFORE UPDATE ON public.communication_consents FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.communication_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_consents ENABLE ROW LEVEL SECURITY;

-- Communication Templates RLS
CREATE POLICY "Members can view templates"
    ON public.communication_templates FOR SELECT
    USING (business_id IS NULL OR public.is_business_member(business_id));

CREATE POLICY "Members can insert templates"
    ON public.communication_templates FOR INSERT
    WITH CHECK (business_id IS NOT NULL AND public.is_business_member(business_id));

CREATE POLICY "Members can update their business templates"
    ON public.communication_templates FOR UPDATE
    USING (business_id IS NOT NULL AND public.is_business_member(business_id))
    WITH CHECK (business_id IS NOT NULL AND public.is_business_member(business_id));

CREATE POLICY "Members can delete their business templates"
    ON public.communication_templates FOR DELETE
    USING (business_id IS NOT NULL AND public.is_business_member(business_id));

-- Communication Consents RLS
CREATE POLICY "Members can view consents"
    ON public.communication_consents FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can insert consents"
    ON public.communication_consents FOR INSERT
    WITH CHECK (public.is_business_member(business_id));

CREATE POLICY "Members can update consents"
    ON public.communication_consents FOR UPDATE
    USING (public.is_business_member(business_id))
    WITH CHECK (public.is_business_member(business_id));

CREATE POLICY "Members can delete consents"
    ON public.communication_consents FOR DELETE
    USING (public.is_business_member(business_id));
