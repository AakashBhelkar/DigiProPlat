-- =====================================================
-- CREATE ADMIN PASSWORD VERIFICATION FUNCTION
-- =====================================================

-- Ensure pgcrypto is enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop function if exists
DROP FUNCTION IF EXISTS verify_admin_password(TEXT, TEXT);

-- Create function to verify admin password
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION verify_admin_password(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION verify_admin_password(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_admin_password(TEXT, TEXT) TO authenticated;

-- Test the function (optional)
-- SELECT verify_admin_password('hello@akadeadshot.work', 'Admin@DigiPro2025!');
