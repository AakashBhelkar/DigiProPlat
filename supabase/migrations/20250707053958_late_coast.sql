/*
  # Fix user registration trigger

  1. New Functions
    - `handle_new_user()` - Creates profile entries for new users automatically
  
  2. New Triggers
    - `on_auth_user_created` - Executes handle_new_user when new users sign up
  
  3. Security
    - Function runs with security definer to ensure proper permissions
    - Handles user metadata extraction from auth.users table
  
  This migration fixes the "Database error saving new user" issue by ensuring
  that when a user signs up through Supabase Auth, a corresponding profile
  is automatically created in the public.profiles table.
*/

-- Create a function to automatically create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, first_name, last_name)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists (to avoid conflicts)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a trigger that calls the function when a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();