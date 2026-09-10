-- Migration: 20260910000001_check_user_auth_provider.sql
-- Description: Function to check whether an email in auth.users has a password or only OAuth (e.g. Google) identities.
-- Used to provide specific, friendly guidance when an OAuth-only user attempts email/password login or signup.

CREATE OR REPLACE FUNCTION public.check_user_auth_provider(target_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public, pg_temp
AS $$
DECLARE
    v_user RECORD;
    v_has_password boolean := false;
    v_has_google boolean := false;
    v_providers text[] := ARRAY[]::text[];
BEGIN
    -- Look up the user by email in auth.users
    SELECT id, encrypted_password, raw_app_meta_data
    INTO v_user
    FROM auth.users
    WHERE lower(email) = lower(trim(target_email))
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'exists', false,
            'hasPassword', false,
            'hasGoogle', false,
            'isGoogleOnly', false,
            'providers', '[]'::jsonb
        );
    END IF;

    -- 1. Check encrypted_password on auth.users
    IF v_user.encrypted_password IS NOT NULL AND length(v_user.encrypted_password) > 0 THEN
        v_has_password := true;
        v_providers := array_append(v_providers, 'email');
    END IF;

    -- 2. Check auth.identities table if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'auth' AND table_name = 'identities'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM auth.identities
            WHERE user_id = v_user.id AND provider = 'google'
        ) THEN
            v_has_google := true;
            IF NOT ('google' = ANY(v_providers)) THEN
                v_providers := array_append(v_providers, 'google');
            END IF;
        END IF;

        IF EXISTS (
            SELECT 1 FROM auth.identities
            WHERE user_id = v_user.id AND provider = 'email'
        ) THEN
            v_has_password := true;
            IF NOT ('email' = ANY(v_providers)) THEN
                v_providers := array_append(v_providers, 'email');
            END IF;
        END IF;
    END IF;

    -- 3. Check raw_app_meta_data for provider info
    IF v_user.raw_app_meta_data IS NOT NULL THEN
        IF v_user.raw_app_meta_data->>'provider' = 'google' THEN
            v_has_google := true;
            IF NOT ('google' = ANY(v_providers)) THEN
                v_providers := array_append(v_providers, 'google');
            END IF;
        END IF;

        IF (v_user.raw_app_meta_data->'providers') IS NOT NULL THEN
            IF v_user.raw_app_meta_data->'providers' @> '["google"]'::jsonb THEN
                v_has_google := true;
                IF NOT ('google' = ANY(v_providers)) THEN
                    v_providers := array_append(v_providers, 'google');
                END IF;
            END IF;
            IF v_user.raw_app_meta_data->'providers' @> '["email"]'::jsonb THEN
                v_has_password := true;
                IF NOT ('email' = ANY(v_providers)) THEN
                    v_providers := array_append(v_providers, 'email');
                END IF;
            END IF;
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'exists', true,
        'hasPassword', v_has_password,
        'hasGoogle', v_has_google,
        'isGoogleOnly', (v_has_google AND NOT v_has_password),
        'providers', to_jsonb(v_providers)
    );
END;
$$;

-- Secure access: Allow service_role to execute this function
REVOKE ALL ON FUNCTION public.check_user_auth_provider(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_user_auth_provider(text) TO service_role;
