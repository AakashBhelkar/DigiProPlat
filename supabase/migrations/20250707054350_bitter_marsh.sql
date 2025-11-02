/*
  # Fix user subscriptions RLS policy

  1. Security Updates
    - Add INSERT policy for user_subscriptions table
    - Allow authenticated users to create their own subscription records
    - Ensure proper RLS enforcement for new user registration

  2. Changes
    - Add policy for INSERT operations on user_subscriptions
    - Allow users to create subscriptions where user_id matches auth.uid()
*/

-- Add INSERT policy for user_subscriptions
CREATE POLICY "Users can create own subscription"
  ON user_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Ensure the existing policies are properly configured
DROP POLICY IF EXISTS "Users can read own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON user_subscriptions;

CREATE POLICY "Users can read own subscription"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON user_subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);