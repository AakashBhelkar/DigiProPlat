
-- =====================================================
-- COMPLETE ADMIN LOGIN FIX
-- Run this entire script in Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/mafryhnhgopxfckrepxv/sql/new
-- =====================================================

-- Step 1: Ensure pgcrypto extension is enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Step 2: Create or replace the password verification function
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
    WHERE email = LOWER(p_email)
    AND is_active = true;

    -- Check if user exists
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;

    -- Verify password using crypt
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

-- Step 3: Grant permissions
GRANT EXECUTE ON FUNCTION verify_admin_password(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION verify_admin_password(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_admin_password(TEXT, TEXT) TO authenticated;

-- Step 4: Create/Update admin user with correct password
INSERT INTO admin_users (
    email,
    password_hash,
    first_name,
    last_name,
    role,
    permissions,
    is_active
)
VALUES (
    'hello@akadeadshot.work',
    crypt('Admin@DigiPro2025!', gen_salt('bf', 10)),
    'Admin',
    'User',
    'super_admin',
    '{"users": ["read", "write", "delete"], "products": ["read", "write", "delete"], "orders": ["read", "write", "delete"], "settings": ["read", "write"], "analytics": ["read"], "reports": ["read", "write"]}'::jsonb,
    true
)
ON CONFLICT (email)
DO UPDATE SET
    password_hash = crypt('Admin@DigiPro2025!', gen_salt('bf', 10)),
    first_name = 'Admin',
    last_name = 'User',
    role = 'super_admin',
    is_active = true,
    updated_at = NOW();

-- Step 5: Verify the setup
SELECT '=== VERIFICATION RESULTS ===' as message;

-- Check if function exists
SELECT
    'Function exists: ' || CASE WHEN EXISTS (
        SELECT 1 FROM pg_proc
        WHERE proname = 'verify_admin_password'
    ) THEN 'YES ✓' ELSE 'NO ✗' END as function_check;

-- Check if admin user exists
SELECT
    'Admin user exists: ' || CASE WHEN EXISTS (
        SELECT 1 FROM admin_users
        WHERE email = 'hello@akadeadshot.work'
    ) THEN 'YES ✓' ELSE 'NO ✗' END as admin_check;

-- Test password verification
SELECT
    'Password verification: ' || CASE
        WHEN (verify_admin_password('hello@akadeadshot.work', 'Admin@DigiPro2025!')->>'success')::boolean
        THEN 'SUCCESS ✓'
        ELSE 'FAILED ✗'
    END as password_check;

-- Show admin user details
SELECT
    'Admin Details:' as message,
    email,
    first_name,
    last_name,
    role,
    is_active,
    created_at
FROM admin_users
WHERE email = 'hello@akadeadshot.work';

-- Done message
SELECT '=== SETUP COMPLETE ===' as message;
SELECT 'You can now login with:' as message;
SELECT 'Email: hello@akadeadshot.work' as credential;
SELECT 'Password: Admin@DigiPro2025!' as credential;
