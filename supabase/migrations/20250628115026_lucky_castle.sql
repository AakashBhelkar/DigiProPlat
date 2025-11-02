/*
  # Create transactions and analytics tables

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `product_id` (uuid, references products, optional)
      - `type` (enum: sale, withdrawal, refund, deposit)
      - `amount` (decimal)
      - `status` (enum: pending, completed, failed)
      - `payment_method` (text)
      - `stripe_payment_id` (text, optional)
      - `description` (text)
      - `created_at` (timestamp)

    - `page_analytics`
      - `id` (uuid, primary key)
      - `page_id` (uuid, references landing_pages)
      - `date` (date)
      - `views` (integer)
      - `unique_visitors` (integer)
      - `conversions` (integer)
      - `revenue` (decimal)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for user access
*/

-- Create transaction type enum
CREATE TYPE transaction_type AS ENUM ('sale', 'withdrawal', 'refund', 'deposit');

-- Create transaction status enum
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed');

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  type transaction_type NOT NULL,
  amount decimal(10,2) NOT NULL,
  status transaction_status DEFAULT 'pending',
  payment_method text,
  stripe_payment_id text,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create page_analytics table
CREATE TABLE IF NOT EXISTS page_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES landing_pages(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  views integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  conversions integer DEFAULT 0,
  revenue decimal(10,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  UNIQUE(page_id, date)
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_analytics ENABLE ROW LEVEL SECURITY;

-- Policies for transactions
CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies for page_analytics
CREATE POLICY "Users can read analytics of own pages"
  ON page_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM landing_pages 
      WHERE landing_pages.id = page_analytics.page_id 
      AND landing_pages.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert analytics for own pages"
  ON page_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM landing_pages 
      WHERE landing_pages.id = page_analytics.page_id 
      AND landing_pages.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update analytics of own pages"
  ON page_analytics
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM landing_pages 
      WHERE landing_pages.id = page_analytics.page_id 
      AND landing_pages.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_product_id ON transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_page_analytics_page_id ON page_analytics(page_id);
CREATE INDEX IF NOT EXISTS idx_page_analytics_date ON page_analytics(date);

-- Function to update wallet balance on transaction completion
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE profiles 
    SET wallet_balance = wallet_balance + NEW.amount
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update wallet balance
CREATE TRIGGER update_wallet_on_transaction
  AFTER UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_wallet_balance();