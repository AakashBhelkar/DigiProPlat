-- =====================================================
-- FIX USER LOGIN - CREATE PROFILES AND TRIGGERS
-- Run this ENTIRE script in Supabase SQL Editor
-- =====================================================

-- Step 1: Create trigger function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, first_name, last_name, wallet_balance, kyc_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    0.00,
    'pending'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Create profiles for existing users who don't have one
INSERT INTO public.profiles (id, username, first_name, last_name, wallet_balance, kyc_status)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'username', SPLIT_PART(email, '@', 1)),
  COALESCE(raw_user_meta_data->>'first_name', 'User'),
  COALESCE(raw_user_meta_data->>'last_name', ''),
  0.00,
  'pending'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Step 4: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;

-- Step 5: Update RLS policies for profiles (make them less restrictive for now)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.profiles;

-- Allow users to read their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile (for manual creation)
CREATE POLICY "Users can create their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Step 6: Verify the setup
SELECT '=== VERIFICATION RESULTS ===' as message;

-- Check if trigger function exists
SELECT
  'Trigger function exists: ' || CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user'
  ) THEN 'YES ✓' ELSE 'NO ✗' END as function_check;

-- Check if trigger exists
SELECT
  'Trigger exists: ' || CASE WHEN EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN 'YES ✓' ELSE 'NO ✗' END as trigger_check;

-- Check existing profiles
SELECT
  'Total profiles: ' || COUNT(*)::TEXT as profile_count
FROM public.profiles;

-- Show all profiles
SELECT
  'User Profiles:' as message,
  id,
  username,
  first_name,
  last_name,
  kyc_status,
  created_at
FROM public.profiles
ORDER BY created_at DESC;

-- Step 7: Grant execute permission on the trigger function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

SELECT '=== SETUP COMPLETE ===' as message;
SELECT 'Try logging in again - your profile should now be created automatically!' as next_step;
