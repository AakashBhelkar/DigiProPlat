/*
  # Create subscription plans and user subscriptions

  1. New Tables
    - `subscription_plans`
      - `id` (uuid, primary key)
      - `name` (text: free, pro, business)
      - `price` (decimal)
      - `features` (jsonb array)
      - `limits` (jsonb object)
      - `is_active` (boolean)
      - `created_at` (timestamp)

    - `user_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `plan_id` (uuid, references subscription_plans)
      - `status` (enum: active, cancelled, expired)
      - `current_period_start` (timestamp)
      - `current_period_end` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add appropriate policies
*/

-- Create subscription status enum
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired');

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0.00,
  features jsonb NOT NULL DEFAULT '[]',
  limits jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES subscription_plans(id),
  status subscription_status DEFAULT 'active',
  current_period_start timestamptz DEFAULT now(),
  current_period_end timestamptz DEFAULT (now() + interval '1 month'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for subscription_plans (public read)
CREATE POLICY "Subscription plans are viewable by everyone"
  ON subscription_plans
  FOR SELECT
  TO public
  USING (is_active = true);

-- Policies for user_subscriptions
CREATE POLICY "Users can read own subscription"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON user_subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default subscription plans
INSERT INTO subscription_plans (name, price, features, limits) VALUES
('free', 0.00, 
 '["5 Products", "Basic Analytics", "1GB Storage"]',
 '{"products": 5, "storage": 1, "customDomain": false, "aiGenerations": 5}'
),
('pro', 29.00,
 '["Unlimited Products", "Advanced Analytics", "100GB Storage", "Custom Domain", "AI Generation"]',
 '{"products": -1, "storage": 100, "customDomain": true, "aiGenerations": 100}'
),
('business', 99.00,
 '["Everything in Pro", "Priority Support", "White Label", "API Access", "Advanced Integrations"]',
 '{"products": -1, "storage": 500, "customDomain": true, "aiGenerations": -1}'
);