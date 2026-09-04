-- ==============================================================================
-- VENTREXS AI — TRANSACTIONAL USER WORKSPACE PROVISIONING & MEMBERSHIP REPAIR
-- Guarantees that any authenticated user (Google, Apple, or Email) possesses an
-- authorized business workspace and verified business_members role.
-- ==============================================================================

-- 1. Helper function: Transactionally ensure profile, business workspace, and membership
CREATE OR REPLACE FUNCTION public.ensure_user_workspace_membership(
    p_user_id UUID,
    p_email TEXT,
    p_name TEXT DEFAULT NULL,
    p_business_name TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_business_id UUID;
    v_name TEXT;
    v_biz_name TEXT;
    v_role TEXT := 'owner';
    v_result JSONB;
BEGIN
    -- Fallback name formatting
    v_name := COALESCE(NULLIF(TRIM(p_name), ''), split_part(p_email, '@', 1), 'Business Owner');
    v_biz_name := COALESCE(NULLIF(TRIM(p_business_name), ''), v_name || '''s Business');

    -- 1. Ensure Profile exists
    INSERT INTO public.profiles (id, email, name, role, updated_at)
    VALUES (p_user_id, p_email, v_name, v_role, timezone('utc'::text, now()))
    ON CONFLICT (id) DO UPDATE 
    SET 
        email = EXCLUDED.email,
        name = COALESCE(NULLIF(public.profiles.name, ''), EXCLUDED.name),
        updated_at = timezone('utc'::text, now());

    -- 2. Check if user already has an active primary membership
    SELECT business_id INTO v_business_id
    FROM public.business_members
    WHERE user_id = p_user_id
    ORDER BY is_primary DESC, created_at ASC
    LIMIT 1;

    IF v_business_id IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', true,
            'business_id', v_business_id,
            'user_id', p_user_id,
            'role', v_role,
            'status', 'existing_membership'
        );
    END IF;

    -- 3. Check if user has an existing business workspace matching their email
    SELECT id INTO v_business_id
    FROM public.businesses
    WHERE email = p_email
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_business_id IS NOT NULL THEN
        -- Link membership to existing business
        INSERT INTO public.business_members (business_id, user_id, role, is_primary)
        VALUES (v_business_id, p_user_id, v_role, true)
        ON CONFLICT (business_id, user_id) DO NOTHING;

        RETURN jsonb_build_object(
            'success', true,
            'business_id', v_business_id,
            'user_id', p_user_id,
            'role', v_role,
            'status', 'linked_existing_business'
        );
    END IF;

    -- 4. Create new business workspace transactionally
    INSERT INTO public.businesses (
        name,
        email,
        currency,
        payment_terms_days,
        auto_reminder_enabled,
        created_at,
        updated_at
    ) VALUES (
        v_biz_name,
        p_email,
        'USD ($)',
        14,
        true,
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    )
    RETURNING id INTO v_business_id;

    -- 5. Link user as owner in business_members
    INSERT INTO public.business_members (
        business_id,
        user_id,
        role,
        is_primary,
        created_at,
        updated_at
    ) VALUES (
        v_business_id,
        p_user_id,
        v_role,
        true,
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    )
    ON CONFLICT (business_id, user_id) DO NOTHING;

    -- 6. Initialize default pending subscription (strictly non-active until payment)
    INSERT INTO public.subscriptions (
        business_id,
        user_id,
        plan,
        billing_cycle,
        status,
        price_amount,
        currency,
        created_at,
        updated_at
    ) VALUES (
        v_business_id,
        p_user_id,
        'Starter',
        'monthly',
        'pending',
        29.00,
        'USD',
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    )
    ON CONFLICT (business_id) DO NOTHING;

    RETURN jsonb_build_object(
        'success', true,
        'business_id', v_business_id,
        'user_id', p_user_id,
        'role', v_role,
        'status', 'created_new_workspace'
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger on auth.users: automatically initializes profile and workspace on signup
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    v_name TEXT;
    v_biz_name TEXT;
BEGIN
    v_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1),
        'Business Owner'
    );
    v_biz_name := COALESCE(
        NEW.raw_user_meta_data->>'business_name',
        v_name || '''s Business'
    );

    PERFORM public.ensure_user_workspace_membership(
        NEW.id,
        NEW.email,
        v_name,
        v_biz_name
    );

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Never block auth user creation if workspace trigger encounters an issue
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to auth.users safely
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users'
    ) THEN
        DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
        CREATE TRIGGER trg_on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_new_auth_user();
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping auth.users trigger installation: %', SQLERRM;
END $$;
