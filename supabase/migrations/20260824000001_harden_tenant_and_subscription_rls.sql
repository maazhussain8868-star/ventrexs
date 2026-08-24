-- ==============================================================================
-- PAYPILOT AI — PHASE 3 CRITICAL SECURITY REMEDIATION MIGRATION
-- 1. Tighten business_members INSERT policy to prevent unauthorized cross-tenant self-assignment
-- 2. Add SECURITY DEFINER trigger to automatically assign new business creator as primary owner
-- 3. Restrict subscriptions UPDATE/INSERT/DELETE exclusively to service_role (prevent client plan escalation)
-- ==============================================================================

-- 1. Harden business_members INSERT Policy
DROP POLICY IF EXISTS "Admins or self-creators can insert memberships" ON public.business_members;
DROP POLICY IF EXISTS "Admins can insert memberships" ON public.business_members;

CREATE POLICY "Admins can insert memberships"
    ON public.business_members FOR INSERT
    WITH CHECK (public.is_business_admin(business_id));

-- 2. Create trigger to securely assign creator as business owner upon business creation
CREATE OR REPLACE FUNCTION public.handle_new_business_owner()
RETURNS TRIGGER AS $$
BEGIN
    -- Only attach owner if authenticated user exists
    IF auth.uid() IS NOT NULL THEN
        INSERT INTO public.business_members (
            business_id,
            user_id,
            role,
            is_primary
        ) VALUES (
            NEW.id,
            auth.uid(),
            'owner',
            true
        )
        ON CONFLICT (business_id, user_id) DO NOTHING;

        -- Initialize Starter trial subscription securely under service role privileges
        INSERT INTO public.subscriptions (
            business_id,
            plan,
            billing_cycle,
            status,
            price_amount,
            currency,
            period_start,
            period_end
        ) VALUES (
            NEW.id,
            'Starter',
            'monthly',
            'trialing',
            19.00,
            'USD',
            timezone('utc'::text, now()),
            timezone('utc'::text, now() + INTERVAL '14 days')
        )
        ON CONFLICT (business_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_create_business_owner ON public.businesses;
CREATE TRIGGER trg_create_business_owner
    AFTER INSERT ON public.businesses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_business_owner();

-- 3. Lock subscriptions table mutations strictly to service_role
DROP POLICY IF EXISTS "Admins can update subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Service role updates subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Service role inserts subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Service role deletes subscriptions" ON public.subscriptions;

CREATE POLICY "Service role updates subscriptions"
    ON public.subscriptions FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role inserts subscriptions"
    ON public.subscriptions FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "Service role deletes subscriptions"
    ON public.subscriptions FOR DELETE
    TO service_role
    USING (true);
