-- ==============================================================================
-- VENTREXS AI — FIX PAYWALL: REMOVE AUTO-TRIAL & DEFAULT TO PENDING
-- Enforces explicit 7-day trial initiation or real checkout payment.
-- Prevents new businesses from automatically receiving 'trialing' bypass.
-- ==============================================================================

-- 1. Ensure trial tracking columns exist on subscriptions table
ALTER TABLE public.subscriptions
    ADD COLUMN IF NOT EXISTS trial_start TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- 2. Alter column default for status to 'pending'
ALTER TABLE public.subscriptions
    ALTER COLUMN status SET DEFAULT 'pending';

-- 3. Redefine handle_new_business_owner trigger function:
-- Sets status to 'pending' instead of 'trialing'
CREATE OR REPLACE FUNCTION public.handle_new_business_owner()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NOT NULL THEN
        -- Associate current authenticated user as business owner
        INSERT INTO public.business_members (
            business_id,
            user_id,
            role,
            is_primary
        ) VALUES (
            NEW.id,
            v_user_id,
            'owner',
            true
        )
        ON CONFLICT (business_id, user_id) DO NOTHING;

        -- Initialize pending subscription (requires checkout or explicit trial to activate)
        INSERT INTO public.subscriptions (
            business_id,
            user_id,
            plan,
            billing_cycle,
            status,
            price_amount,
            currency,
            current_period_start,
            current_period_end
        ) VALUES (
            NEW.id,
            v_user_id,
            'Starter',
            'monthly',
            'pending',
            0.00,
            'USD',
            timezone('utc'::text, now()),
            timezone('utc'::text, now() + INTERVAL '30 days')
        )
        ON CONFLICT (business_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-attach trigger on businesses
DROP TRIGGER IF EXISTS trg_create_business_owner ON public.businesses;
CREATE TRIGGER trg_create_business_owner
    AFTER INSERT ON public.businesses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_business_owner();

-- 5. RPC function to start an intentional 7-day trial (one-time per user/business)
CREATE OR REPLACE FUNCTION public.start_user_free_trial(
    p_user_id UUID,
    p_business_id UUID,
    p_plan TEXT DEFAULT 'Professional'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_existing_trial RECORD;
    v_trial_end TIMESTAMPTZ;
BEGIN
    -- Check if user or business has ever consumed a trial
    SELECT id, trial_start, trial_ends_at
    INTO v_existing_trial
    FROM public.subscriptions
    WHERE (user_id = p_user_id OR business_id = p_business_id)
      AND trial_start IS NOT NULL
    LIMIT 1;

    IF v_existing_trial.id IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'A free trial has already been used for this account or workspace.'
        );
    END IF;

    v_trial_end := timezone('utc'::text, now() + INTERVAL '7 days');

    -- Upsert subscription as trialing for 7 days
    INSERT INTO public.subscriptions (
        business_id,
        user_id,
        plan,
        billing_cycle,
        status,
        trial_start,
        trial_ends_at,
        current_period_start,
        current_period_end,
        updated_at
    ) VALUES (
        p_business_id,
        p_user_id,
        p_plan,
        'monthly',
        'trialing',
        timezone('utc'::text, now()),
        v_trial_end,
        timezone('utc'::text, now()),
        v_trial_end,
        timezone('utc'::text, now())
    )
    ON CONFLICT (business_id) DO UPDATE SET
        plan = EXCLUDED.plan,
        status = 'trialing',
        trial_start = timezone('utc'::text, now()),
        trial_ends_at = v_trial_end,
        current_period_start = timezone('utc'::text, now()),
        current_period_end = v_trial_end,
        updated_at = timezone('utc'::text, now());

    RETURN jsonb_build_object(
        'success', true,
        'status', 'trialing',
        'plan', p_plan,
        'trial_ends_at', v_trial_end
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.start_user_free_trial(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.start_user_free_trial(UUID, UUID, TEXT) TO service_role;

-- 6. Retroactively demote any unpaid mock/auto-trialed records without a real payment
UPDATE public.subscriptions
SET status = 'pending'
WHERE status = 'trialing'
  AND trial_start IS NULL
  AND checkout_session_id IS NULL;
