-- =====================================================
-- VERIFY AND SETUP ADMIN ACCOUNT
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Check if pgcrypto extension is installed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Step 2: Check if admin_users table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name = 'admin_users'
);

-- Step 3: Check existing admin users
SELECT id, email, first_name, last_name, role, is_active, last_login, created_at
FROM admin_users;

-- Step 4: Delete existing admin if any (optional - run only if you need to recreate)
-- DELETE FROM admin_users WHERE email = 'hello@akadeadshot.work';

-- Step 5: Insert or Update admin user with correct password
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

-- Step 6: Verify the admin was created/updated
SELECT
    id,
    email,
    first_name,
    last_name,
    role,
    permissions,
    is_active,
    created_at,
    updated_at
FROM admin_users
WHERE email = 'hello@akadeadshot.work';

-- Step 7: Test password verification (this should return true)
SELECT
    email,
    (password_hash = crypt('Admin@DigiPro2025!', password_hash)) as password_is_correct
FROM admin_users
WHERE email = 'hello@akadeadshot.work';

-- =====================================================
-- Expected Results:
-- =====================================================
-- Step 1: Should show "CREATE EXTENSION" or "already exists"
-- Step 2: Should return "true" (t)
-- Step 3: Shows all admin users (may be empty initially)
-- Step 5: Should show "INSERT 0 1" or "UPDATE 1"
-- Step 6: Should show your admin user details
-- Step 7: Should show "t" (true) for password_is_correct
-- =====================================================
