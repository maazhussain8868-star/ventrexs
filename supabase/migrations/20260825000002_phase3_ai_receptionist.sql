-- ==============================================================================
-- PAYPILOT AI — PHASE 3: AI RECEPTIONIST SCHEMA MIGRATION
-- Multi-Tenant Architecture, Row Level Security, Service Knowledge & Engine
-- ==============================================================================

-- 1. RECEPTIONIST SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.receptionist_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE UNIQUE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    greeting TEXT NOT NULL DEFAULT 'Hi! Thanks for reaching out. How can we help you today?',
    business_description TEXT NOT NULL DEFAULT 'Professional residential and commercial service business.',
    tone TEXT NOT NULL DEFAULT 'professional' CHECK (tone IN ('professional', 'friendly', 'emergency_first', 'concise')),
    languages JSONB NOT NULL DEFAULT '["en"]'::jsonb,
    after_hours_message TEXT NOT NULL DEFAULT 'We are currently outside regular business hours. For immediate emergencies, our on-call technician will be notified right away.',
    emergency_instructions TEXT NOT NULL DEFAULT 'Flag urgent HVAC/plumbing leaks or safety risks immediately for emergency dispatch.',
    booking_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    booking_lead_time_hours INTEGER NOT NULL DEFAULT 2 CHECK (booking_lead_time_hours >= 0),
    booking_max_days_ahead INTEGER NOT NULL DEFAULT 14 CHECK (booking_max_days_ahead >= 1),
    human_handoff_keywords JSONB NOT NULL DEFAULT '["human", "agent", "person", "manager", "dispute", "lawyer", "complaint", "billing problem"]'::jsonb,
    faqs JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. RECEPTIONIST SERVICES KNOWLEDGE TABLE
CREATE TABLE IF NOT EXISTS public.receptionist_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    description TEXT NOT NULL DEFAULT '',
    typical_duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (typical_duration_minutes > 0),
    emergency_available BOOLEAN NOT NULL DEFAULT FALSE,
    booking_eligible BOOLEAN NOT NULL DEFAULT TRUE,
    base_price NUMERIC(10, 2) DEFAULT 0.00,
    qualification_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. RECEPTIONIST CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.receptionist_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    channel TEXT NOT NULL DEFAULT 'WEB_CHAT' CHECK (channel IN ('WEB_CHAT', 'SMS', 'WHATSAPP', 'VOICE', 'EMAIL', 'SIMULATED')),
    state TEXT NOT NULL DEFAULT 'NEW' CHECK (state IN ('NEW', 'COLLECTING_INFO', 'QUALIFYING', 'READY_TO_BOOK', 'BOOKING', 'BOOKED', 'HANDOFF_REQUIRED', 'COMPLETED')),
    detected_intent TEXT DEFAULT 'UNKNOWN',
    intent_confidence NUMERIC(4, 3) DEFAULT 0.000,
    customer_name TEXT,
    customer_phone TEXT,
    customer_email TEXT,
    customer_address TEXT,
    service_requested TEXT,
    urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'urgent')),
    handoff_required BOOLEAN NOT NULL DEFAULT FALSE,
    handoff_reason TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. RECEPTIONIST MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.receptionist_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES public.receptionist_conversations(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('CUSTOMER', 'AI', 'HUMAN_AGENT', 'SYSTEM')),
    content TEXT NOT NULL,
    structured_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_receptionist_settings_business ON public.receptionist_settings(business_id);
CREATE INDEX IF NOT EXISTS idx_receptionist_services_business ON public.receptionist_services(business_id);
CREATE INDEX IF NOT EXISTS idx_receptionist_conversations_business ON public.receptionist_conversations(business_id);
CREATE INDEX IF NOT EXISTS idx_receptionist_conversations_state ON public.receptionist_conversations(state);
CREATE INDEX IF NOT EXISTS idx_receptionist_messages_conv ON public.receptionist_messages(conversation_id);

-- 6. TRIGGERS FOR updated_at
CREATE TRIGGER trg_receptionist_settings_updated_at BEFORE UPDATE ON public.receptionist_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_receptionist_services_updated_at BEFORE UPDATE ON public.receptionist_services FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_receptionist_conversations_updated_at BEFORE UPDATE ON public.receptionist_conversations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.receptionist_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receptionist_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receptionist_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receptionist_messages ENABLE ROW LEVEL SECURITY;

-- Receptionist Settings RLS
CREATE POLICY "Members can view receptionist settings"
    ON public.receptionist_settings FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can insert receptionist settings"
    ON public.receptionist_settings FOR INSERT
    WITH CHECK (public.is_business_member(business_id));

CREATE POLICY "Members can update receptionist settings"
    ON public.receptionist_settings FOR UPDATE
    USING (public.is_business_member(business_id));

-- Receptionist Services RLS
CREATE POLICY "Members can view receptionist services"
    ON public.receptionist_services FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can insert receptionist services"
    ON public.receptionist_services FOR INSERT
    WITH CHECK (public.is_business_member(business_id));

CREATE POLICY "Members can update receptionist services"
    ON public.receptionist_services FOR UPDATE
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can delete receptionist services"
    ON public.receptionist_services FOR DELETE
    USING (public.is_business_member(business_id));

-- Receptionist Conversations RLS
CREATE POLICY "Members can view receptionist conversations"
    ON public.receptionist_conversations FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can insert receptionist conversations"
    ON public.receptionist_conversations FOR INSERT
    WITH CHECK (public.is_business_member(business_id));

CREATE POLICY "Members can update receptionist conversations"
    ON public.receptionist_conversations FOR UPDATE
    USING (public.is_business_member(business_id));

-- Receptionist Messages RLS
CREATE POLICY "Members can view receptionist messages"
    ON public.receptionist_messages FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can insert receptionist messages"
    ON public.receptionist_messages FOR INSERT
    WITH CHECK (public.is_business_member(business_id));
