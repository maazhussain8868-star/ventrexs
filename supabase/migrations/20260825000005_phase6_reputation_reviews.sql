-- ==============================================================================
-- PAYPILOT AI — PHASE 6: REPUTATION & REVIEW MANAGEMENT SCHEMA MIGRATION
-- Multi-Tenant RLS, Review Automation, Feedback Gateway, and Escalation
-- ==============================================================================

-- 1. Review Settings Table
CREATE TABLE IF NOT EXISTS public.review_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE UNIQUE,
    automation_enabled BOOLEAN NOT NULL DEFAULT true,
    request_delay_hours INTEGER NOT NULL DEFAULT 24 CHECK (request_delay_hours >= 0),
    primary_platform TEXT NOT NULL DEFAULT 'google',
    google_review_url TEXT,
    direct_feedback_url TEXT,
    default_channel TEXT NOT NULL DEFAULT 'sms' CHECK (default_channel IN ('email', 'sms', 'whatsapp')),
    max_requests_per_job INTEGER NOT NULL DEFAULT 2 CHECK (max_requests_per_job >= 1),
    positive_threshold INTEGER NOT NULL DEFAULT 4 CHECK (positive_threshold >= 1 AND positive_threshold <= 5),
    email_subject_template TEXT DEFAULT 'How was your recent service with {{business_name}}?',
    email_body_template TEXT DEFAULT 'Hi {{customer_name}}, thank you for choosing {{business_name}} for {{service_name}} with {{technician_name}}. Please take a moment to share your feedback: {{feedback_url}}',
    sms_body_template TEXT DEFAULT 'Hi {{customer_name}}, thanks for choosing {{business_name}}! How was your service with {{technician_name}}? Share feedback: {{feedback_url}}',
    whatsapp_body_template TEXT DEFAULT 'Hello {{customer_name}}, thank you for trusting {{business_name}} for {{service_name}}. We would love to know how we did: {{feedback_url}}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Review Requests Table
CREATE TABLE IF NOT EXISTS public.review_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_email TEXT,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    technician_id UUID,
    technician_name TEXT,
    channel TEXT NOT NULL DEFAULT 'sms' CHECK (channel IN ('email', 'sms', 'whatsapp')),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SCHEDULED', 'SENT', 'DELIVERED', 'OPENED', 'COMPLETED', 'FAILED', 'CANCELLED')),
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    review_url TEXT,
    feedback_url TEXT,
    idempotency_key TEXT UNIQUE,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Customer Feedback Table
CREATE TABLE IF NOT EXISTS public.customer_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    review_request_id UUID REFERENCES public.review_requests(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_email TEXT,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    technician_name TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    feedback_text TEXT,
    service_aspects JSONB DEFAULT '[]'::jsonb,
    channel TEXT NOT NULL DEFAULT 'web' CHECK (channel IN ('web', 'sms', 'email', 'whatsapp')),
    follow_up_status TEXT NOT NULL DEFAULT 'NEW' CHECK (follow_up_status IN ('NEW', 'IN_REVIEW', 'CONTACTED', 'RESOLVED', 'CLOSED')),
    follow_up_notes TEXT,
    assigned_to TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Review Events Audit Trail Table
CREATE TABLE IF NOT EXISTS public.review_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    review_request_id UUID REFERENCES public.review_requests(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Review Templates Table
CREATE TABLE IF NOT EXISTS public.review_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp')),
    subject_template TEXT,
    body_template TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Fast Query Performance & Tenant Lookup
CREATE INDEX IF NOT EXISTS idx_review_settings_biz ON public.review_settings(business_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_biz ON public.review_requests(business_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_cust ON public.review_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_job ON public.review_requests(job_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_status ON public.review_requests(status);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_biz ON public.customer_feedback(business_id);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_cust ON public.customer_feedback(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_job ON public.customer_feedback(job_id);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_rating ON public.customer_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_followup ON public.customer_feedback(follow_up_status);
CREATE INDEX IF NOT EXISTS idx_review_events_req ON public.review_events(review_request_id);
CREATE INDEX IF NOT EXISTS idx_review_templates_biz ON public.review_templates(business_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.review_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_templates ENABLE ROW LEVEL SECURITY;

-- 1. RLS for review_settings
DROP POLICY IF EXISTS "Tenants can manage their own review settings" ON public.review_settings;
CREATE POLICY "Tenants can manage their own review settings"
    ON public.review_settings
    FOR ALL
    TO authenticated
    USING (public.is_business_member(business_id))
    WITH CHECK (public.is_business_member(business_id));

-- 2. RLS for review_requests
DROP POLICY IF EXISTS "Tenants can manage their own review requests" ON public.review_requests;
CREATE POLICY "Tenants can manage their own review requests"
    ON public.review_requests
    FOR ALL
    TO authenticated
    USING (public.is_business_member(business_id))
    WITH CHECK (public.is_business_member(business_id));

-- 3. RLS for customer_feedback
DROP POLICY IF EXISTS "Tenants can view and manage their customer feedback" ON public.customer_feedback;
CREATE POLICY "Tenants can view and manage their customer feedback"
    ON public.customer_feedback
    FOR ALL
    TO authenticated
    USING (public.is_business_member(business_id))
    WITH CHECK (public.is_business_member(business_id));

-- 4. RLS for review_events
DROP POLICY IF EXISTS "Tenants can view review events" ON public.review_events;
CREATE POLICY "Tenants can view review events"
    ON public.review_events
    FOR ALL
    TO authenticated
    USING (public.is_business_member(business_id))
    WITH CHECK (public.is_business_member(business_id));

-- 5. RLS for review_templates
DROP POLICY IF EXISTS "Tenants can manage review templates" ON public.review_templates;
CREATE POLICY "Tenants can manage review templates"
    ON public.review_templates
    FOR ALL
    TO authenticated
    USING (public.is_business_member(business_id))
    WITH CHECK (public.is_business_member(business_id));
