-- ==============================================================================
-- PAYPILOT AI — BACKEND FOUNDATION SCHEMA MIGRATION
-- Multi-Tenant Architecture, Row Level Security, Halal-First Integrity
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. PROFILES TABLE (User profiles linked to Supabase auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'member')),
    phone TEXT,
    address TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 2. BUSINESSES TABLE (Multi-tenant business workspaces)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    industry TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    tax_id TEXT,
    currency TEXT NOT NULL DEFAULT 'USD ($)',
    payment_terms_days INTEGER NOT NULL DEFAULT 14 CHECK (payment_terms_days >= 0),
    default_notes TEXT,
    stripe_connected BOOLEAN NOT NULL DEFAULT FALSE,
    ach_connected BOOLEAN NOT NULL DEFAULT FALSE,
    auto_reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. BUSINESS_MEMBERS TABLE (Join table linking users to businesses with roles)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.business_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'member')),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_business_member UNIQUE (business_id, user_id)
);

-- ==============================================================================
-- 4. CUSTOMERS TABLE (Business clients / Accounts Receivable debtors)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    payment_terms INTEGER NOT NULL DEFAULT 14 CHECK (payment_terms >= 0),
    risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
    credit_score INTEGER NOT NULL DEFAULT 750 CHECK (credit_score >= 300 AND credit_score <= 850),
    preferred_contact TEXT NOT NULL DEFAULT 'email' CHECK (preferred_contact IN ('email', 'phone', 'sms')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 5. INVOICES TABLE (Halal-First Accounts Receivable Records)
-- Strict Rule: remaining_balance = original_amount - amount_paid
-- Zero interest, zero riba, zero debt trading, zero late penalties.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    invoice_number TEXT NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (tax_rate >= 0),
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    original_amount NUMERIC(12, 2) NOT NULL CHECK (original_amount >= 0),
    amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (amount_paid >= 0),
    remaining_balance NUMERIC(12, 2) NOT NULL CHECK (remaining_balance >= 0),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'due', 'overdue', 'partially_paid', 'paid', 'disputed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    paid_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_business_invoice_number UNIQUE (business_id, invoice_number),
    CONSTRAINT chk_halal_balance CHECK (remaining_balance = (original_amount - amount_paid))
);

-- ==============================================================================
-- 6. INVOICE_ITEMS TABLE (Line items for invoices)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00 CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    line_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (line_total >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 7. PAYMENTS TABLE (Settlement transactions applied to original invoice amount)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    method TEXT NOT NULL CHECK (method IN ('ACH Transfer', 'Credit Card', 'Bank Wire', 'Check', 'Other')),
    reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 8. INVOICE_EVENTS TABLE (Audit timeline of invoice lifecycle)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.invoice_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('created', 'sent', 'viewed', 'reminder_sent', 'payment_received', 'status_changed', 'note_added')),
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 9. COMMUNICATIONS TABLE (Drafted and dispatched customer follow-ups)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp')),
    subject TEXT,
    message TEXT NOT NULL,
    tone TEXT NOT NULL DEFAULT 'professional' CHECK (tone IN ('gentle', 'professional', 'firm', 'urgent')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'queued', 'sent', 'delivered', 'failed')),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 10. AI_RECOMMENDATIONS TABLE (Truthful AI Copilot Suggestions)
-- Suggestions only: No interest, no penalties, no loans, no debt trading.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    customer_name TEXT,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (amount >= 0),
    days_overdue INTEGER NOT NULL DEFAULT 0 CHECK (days_overdue >= 0),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    recommended_action TEXT NOT NULL,
    reason TEXT NOT NULL,
    tone TEXT NOT NULL DEFAULT 'gentle' CHECK (tone IN ('gentle', 'professional', 'firm', 'urgent')),
    message_draft_subject TEXT,
    message_draft TEXT NOT NULL,
    confidence NUMERIC(5, 2) NOT NULL DEFAULT 0.90 CHECK (confidence >= 0.00 AND confidence <= 1.00),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 11. NOTIFICATIONS TABLE (In-app notifications feed)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('payment', 'overdue', 'copilot', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 12. SUBSCRIPTIONS TABLE (SaaS subscription tiers)
-- Plans: Starter ($19/mo), Professional ($49/mo), Enterprise (custom)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'Starter' CHECK (plan IN ('Starter', 'Professional', 'Enterprise')),
    billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
    status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled')),
    price_amount NUMERIC(10, 2) NOT NULL DEFAULT 19.00 CHECK (price_amount >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    trial_ends_at TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now() + interval '30 days'),
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 13. AUDIT_LOGS TABLE (Immutable audit trail of actions)
-- Never store sensitive credentials or passwords.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR HIGH PERFORMANCE MULTI-TENANT QUERIES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_business_members_user ON public.business_members(user_id);
CREATE INDEX IF NOT EXISTS idx_business_members_business ON public.business_members(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_business ON public.customers(business_id);
CREATE INDEX IF NOT EXISTS idx_invoices_business ON public.invoices(business_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_business ON public.payments(business_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_events_invoice ON public.invoice_events(invoice_id);
CREATE INDEX IF NOT EXISTS idx_communications_business ON public.communications(business_id);
CREATE INDEX IF NOT EXISTS idx_communications_invoice ON public.communications(invoice_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_business ON public.ai_recommendations(business_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_invoice ON public.ai_recommendations(invoice_id);
CREATE INDEX IF NOT EXISTS idx_notifications_business_user ON public.notifications(business_id, user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_business ON public.audit_logs(business_id);

-- ==============================================================================
-- DATABASE HELPER FUNCTIONS & TRIGGERS
-- ==============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_businesses_updated_at BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_business_members_updated_at BEFORE UPDATE ON public.business_members FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger on payment insert: Validates payment <= remaining balance, updates invoice balance & status, creates timeline event
CREATE OR REPLACE FUNCTION public.handle_payment_applied()
RETURNS TRIGGER AS $$
DECLARE
    v_inv RECORD;
    v_new_paid NUMERIC(12, 2);
    v_new_remaining NUMERIC(12, 2);
    v_new_status TEXT;
    v_paid_date DATE;
BEGIN
    SELECT * INTO v_inv FROM public.invoices WHERE id = NEW.invoice_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invoice with ID % does not exist', NEW.invoice_id;
    END IF;

    IF NEW.amount > v_inv.remaining_balance THEN
        RAISE EXCEPTION 'Payment amount (%) exceeds remaining invoice balance (%)', NEW.amount, v_inv.remaining_balance;
    END IF;

    v_new_paid := v_inv.amount_paid + NEW.amount;
    v_new_remaining := v_inv.original_amount - v_new_paid;

    IF v_new_remaining = 0 THEN
        v_new_status := 'paid';
        v_paid_date := CURRENT_DATE;
    ELSE
        v_new_status := 'partially_paid';
        v_paid_date := NULL;
    END IF;

    UPDATE public.invoices
    SET amount_paid = v_new_paid,
        remaining_balance = v_new_remaining,
        status = v_new_status,
        paid_date = COALESCE(v_paid_date, paid_date),
        updated_at = timezone('utc'::text, now())
    WHERE id = NEW.invoice_id;

    -- Add timeline event
    INSERT INTO public.invoice_events (
        invoice_id,
        business_id,
        event_type,
        title,
        description,
        metadata
    ) VALUES (
        NEW.invoice_id,
        NEW.business_id,
        'payment_received',
        'Payment Received ($' || TO_CHAR(NEW.amount, 'FM999,999,990.00') || ')',
        'Settled via ' || NEW.method || COALESCE(' • Ref: ' || NEW.reference, ''),
        jsonb_build_object('amount', NEW.amount, 'method', NEW.method, 'payment_id', NEW.id)
    );

    -- Add audit log
    INSERT INTO public.audit_logs (
        business_id,
        user_id,
        action,
        entity,
        entity_id,
        metadata
    ) VALUES (
        NEW.business_id,
        auth.uid(),
        'RECORD_PAYMENT',
        'payment',
        NEW.id::text,
        jsonb_build_object('invoice_id', NEW.invoice_id, 'amount', NEW.amount, 'method', NEW.method)
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_payments_applied
AFTER INSERT ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.handle_payment_applied();

-- Helper function to check if current user is member of business
CREATE OR REPLACE FUNCTION public.is_business_member(p_business_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.business_members
        WHERE business_id = p_business_id AND user_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function to check if current user is admin/owner of business
CREATE OR REPLACE FUNCTION public.is_business_admin(p_business_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.business_members
        WHERE business_id = p_business_id AND user_id = p_user_id AND role IN ('owner', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 2. BUSINESSES
CREATE POLICY "Members can view their businesses"
    ON public.businesses FOR SELECT
    USING (public.is_business_member(id));

CREATE POLICY "Authenticated users can create businesses"
    ON public.businesses FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update their businesses"
    ON public.businesses FOR UPDATE
    USING (public.is_business_admin(id));

-- 3. BUSINESS_MEMBERS
CREATE POLICY "Members can view business memberships"
    ON public.business_members FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Admins or self-creators can insert memberships"
    ON public.business_members FOR INSERT
    WITH CHECK (user_id = auth.uid() OR public.is_business_admin(business_id));

CREATE POLICY "Admins can update memberships"
    ON public.business_members FOR UPDATE
    USING (public.is_business_admin(business_id));

CREATE POLICY "Admins can delete memberships"
    ON public.business_members FOR DELETE
    USING (public.is_business_admin(business_id));

-- 4. CUSTOMERS
CREATE POLICY "Members can view customers"
    ON public.customers FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can insert customers"
    ON public.customers FOR INSERT
    WITH CHECK (public.is_business_member(business_id));

CREATE POLICY "Members can update customers"
    ON public.customers FOR UPDATE
    USING (public.is_business_member(business_id));

CREATE POLICY "Admins can delete customers"
    ON public.customers FOR DELETE
    USING (public.is_business_admin(business_id));

-- 5. INVOICES
CREATE POLICY "Members can view invoices"
    ON public.invoices FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can insert invoices"
    ON public.invoices FOR INSERT
    WITH CHECK (public.is_business_member(business_id));

CREATE POLICY "Members can update invoices"
    ON public.invoices FOR UPDATE
    USING (public.is_business_member(business_id));

CREATE POLICY "Admins can delete invoices"
    ON public.invoices FOR DELETE
    USING (public.is_business_admin(business_id));

-- 6. INVOICE_ITEMS
CREATE POLICY "Members can view invoice items"
    ON public.invoice_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.invoices
        WHERE invoices.id = invoice_items.invoice_id
        AND public.is_business_member(invoices.business_id)
    ));

CREATE POLICY "Members can insert invoice items"
    ON public.invoice_items FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.invoices
        WHERE invoices.id = invoice_items.invoice_id
        AND public.is_business_member(invoices.business_id)
    ));

CREATE POLICY "Members can update invoice items"
    ON public.invoice_items FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.invoices
        WHERE invoices.id = invoice_items.invoice_id
        AND public.is_business_member(invoices.business_id)
    ));

CREATE POLICY "Admins can delete invoice items"
    ON public.invoice_items FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.invoices
        WHERE invoices.id = invoice_items.invoice_id
        AND public.is_business_admin(invoices.business_id)
    ));

-- 7. PAYMENTS
CREATE POLICY "Members can view payments"
    ON public.payments FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can insert payments"
    ON public.payments FOR INSERT
    WITH CHECK (public.is_business_member(business_id));

CREATE POLICY "Admins can delete payments"
    ON public.payments FOR DELETE
    USING (public.is_business_admin(business_id));

-- 8. INVOICE_EVENTS
CREATE POLICY "Members can view invoice events"
    ON public.invoice_events FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can insert invoice events"
    ON public.invoice_events FOR INSERT
    WITH CHECK (public.is_business_member(business_id));

-- 9. COMMUNICATIONS
CREATE POLICY "Members can view communications"
    ON public.communications FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can insert communications"
    ON public.communications FOR INSERT
    WITH CHECK (public.is_business_member(business_id));

CREATE POLICY "Members can update communications"
    ON public.communications FOR UPDATE
    USING (public.is_business_member(business_id));

CREATE POLICY "Admins can delete communications"
    ON public.communications FOR DELETE
    USING (public.is_business_admin(business_id));

-- 10. AI_RECOMMENDATIONS
CREATE POLICY "Members can view recommendations"
    ON public.ai_recommendations FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can update recommendations"
    ON public.ai_recommendations FOR UPDATE
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can insert recommendations"
    ON public.ai_recommendations FOR INSERT
    WITH CHECK (public.is_business_member(business_id));

-- 11. NOTIFICATIONS
CREATE POLICY "Users can view notifications for their business"
    ON public.notifications FOR SELECT
    USING (public.is_business_member(business_id) AND (user_id = auth.uid() OR user_id IS NULL));

CREATE POLICY "Users can update their notifications"
    ON public.notifications FOR UPDATE
    USING (public.is_business_member(business_id) AND (user_id = auth.uid() OR user_id IS NULL));

CREATE POLICY "Users can delete their notifications"
    ON public.notifications FOR DELETE
    USING (public.is_business_member(business_id) AND (user_id = auth.uid() OR user_id IS NULL));

CREATE POLICY "Members can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (public.is_business_member(business_id));

-- 12. SUBSCRIPTIONS
CREATE POLICY "Members can view subscriptions"
    ON public.subscriptions FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Admins can update subscriptions"
    ON public.subscriptions FOR UPDATE
    USING (public.is_business_admin(business_id));

-- 13. AUDIT_LOGS
CREATE POLICY "Members can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Members can insert audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (public.is_business_member(business_id) OR business_id IS NULL);
