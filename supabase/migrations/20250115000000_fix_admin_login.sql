-- =====================================================
-- FIX ADMIN LOGIN - Reset Admin Password
-- =====================================================

-- Ensure pgcrypto extension is enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Ensure admin_users table exists (if not already created)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    permissions JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop and recreate verify_admin_password function to ensure it exists
DROP FUNCTION IF EXISTS verify_admin_password(TEXT, TEXT);

CREATE OR REPLACE FUNCTION verify_admin_password(
    p_email TEXT,
    p_password TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_admin_user RECORD;
    v_is_valid BOOLEAN;
BEGIN
    -- Get admin user
    SELECT *
    INTO v_admin_user
    FROM admin_users
    WHERE LOWER(email) = LOWER(p_email)
    AND is_active = true;

    -- Check if user exists
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;

    -- Verify password using PostgreSQL crypt (not bcrypt)
    v_is_valid := (v_admin_user.password_hash = crypt(p_password, v_admin_user.password_hash));

    -- Return result
    IF v_is_valid THEN
        RETURN jsonb_build_object(
            'success', true,
            'admin_id', v_admin_user.id
        );
    ELSE
        RETURN jsonb_build_object('success', false, 'error', 'Invalid password');
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION verify_admin_password(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION verify_admin_password(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_admin_password(TEXT, TEXT) TO authenticated;

-- Create or update admin user with correct password hash format
-- Using PostgreSQL crypt (bf = blowfish, compatible with bcrypt)
INSERT INTO admin_users (email, password_hash, first_name, last_name, role, permissions, is_active)
VALUES (
    'hello@akadeadshot.work',
    crypt('Admin@123456', gen_salt('bf', 10)),
    'Admin',
    'User',
    'super_admin',
    '{"users": ["read", "write", "delete"], "products": ["read", "write", "delete"], "orders": ["read", "write", "delete"], "settings": ["read", "write"]}'::jsonb,
    true
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = crypt('Admin@123456', gen_salt('bf', 10)),
    is_active = true,
    updated_at = NOW();

-- Also create the demo admin account
INSERT INTO admin_users (email, password_hash, first_name, last_name, role, permissions, is_active)
VALUES (
    'admin@digiproplat.com',
    crypt('password', gen_salt('bf', 10)),
    'Super',
    'Admin',
    'super_admin',
    '{"all": true}'::jsonb,
    true
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = crypt('password', gen_salt('bf', 10)),
    is_active = true,
    updated_at = NOW();

-- Verify the setup
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM admin_users WHERE is_active = true;
    RAISE NOTICE 'Admin users created/updated: %', v_count;
END $$;

