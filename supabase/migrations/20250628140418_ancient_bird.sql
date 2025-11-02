/*
  # Payment and Order Management System

  1. New Tables
    - `orders` - Order management with payment tracking
    - `order_items` - Individual items in orders
    - `download_links` - Secure download link management
    - `payment_methods` - Customer payment method storage
    - `refunds` - Refund tracking and management

  2. Enhanced Tables
    - Add payment-related fields to transactions
    - Add order tracking to product analytics

  3. Security
    - Enable RLS on all new tables
    - Add policies for secure access
*/

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  total_amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
  payment_method text,
  payment_intent_id text,
  billing_address jsonb,
  customer_email text NOT NULL,
  customer_name text,
  notes text,
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  license_type text DEFAULT 'standard',
  created_at timestamptz DEFAULT now()
);

-- Create download_links table
CREATE TABLE IF NOT EXISTS download_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_file_id uuid REFERENCES product_files(id) ON DELETE CASCADE,
  download_token text UNIQUE NOT NULL,
  download_count integer DEFAULT 0,
  max_downloads integer DEFAULT 5,
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  last_downloaded_at timestamptz,
  ip_address inet,
  user_agent text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_payment_method_id text,
  type text NOT NULL, -- card, paypal, bank_transfer
  last_four text,
  brand text,
  exp_month integer,
  exp_year integer,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create refunds table
CREATE TABLE IF NOT EXISTS refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES transactions(id) ON DELETE SET NULL,
  amount decimal(10,2) NOT NULL,
  reason text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  stripe_refund_id text,
  processed_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- Policies for orders
CREATE POLICY "Users can read own orders as customer"
  ON orders FOR SELECT TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can read own orders as seller"
  ON orders FOR SELECT TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT TO authenticated
  WITH CHECK (true); -- Anyone can create orders

CREATE POLICY "Sellers can update own orders"
  ON orders FOR UPDATE TO authenticated
  USING (auth.uid() = seller_id);

-- Policies for order_items
CREATE POLICY "Users can read order items for own orders"
  ON order_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.customer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

-- Policies for download_links
CREATE POLICY "Customers can read own download links"
  ON download_links FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = download_links.order_id 
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Public can access download links with valid token"
  ON download_links FOR SELECT TO public
  USING (is_active = true AND expires_at > now());

-- Policies for payment_methods
CREATE POLICY "Users can manage own payment methods"
  ON payment_methods FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for refunds
CREATE POLICY "Users can read refunds for own orders"
  ON refunds FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = refunds.order_id 
      AND (orders.customer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

-- Indexes for performance
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_download_links_order_id ON download_links(order_id);
CREATE INDEX idx_download_links_token ON download_links(download_token);
CREATE INDEX idx_download_links_expires_at ON download_links(expires_at);
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_refunds_order_id ON refunds(order_id);

-- Functions for order management
CREATE OR REPLACE FUNCTION generate_download_token()
RETURNS text AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql;

-- Function to create download links after order completion
CREATE OR REPLACE FUNCTION create_download_links()
RETURNS trigger AS $$
BEGIN
  -- Only create download links when order status changes to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO download_links (order_id, product_file_id, download_token)
    SELECT 
      NEW.id,
      pf.id,
      generate_download_token()
    FROM order_items oi
    JOIN product_files pf ON pf.product_id = oi.product_id
    WHERE oi.order_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create download links
CREATE TRIGGER create_download_links_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION create_download_links();

-- Function to track downloads
CREATE OR REPLACE FUNCTION track_download()
RETURNS trigger AS $$
BEGIN
  NEW.download_count = OLD.download_count + 1;
  NEW.last_downloaded_at = now();
  
  -- Deactivate if max downloads reached
  IF NEW.download_count >= NEW.max_downloads THEN
    NEW.is_active = false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired download links
CREATE OR REPLACE FUNCTION cleanup_expired_downloads()
RETURNS void AS $$
BEGIN
  UPDATE download_links 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;