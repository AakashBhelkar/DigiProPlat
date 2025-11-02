/*
  # Create products and product files tables

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `tags` (text array)
      - `price` (decimal)
      - `user_id` (uuid, references profiles)
      - `is_public` (boolean)
      - `sales_count` (integer)
      - `total_revenue` (decimal)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `product_files`
      - `id` (uuid, primary key)
      - `product_id` (uuid, references products)
      - `name` (text)
      - `file_size` (bigint)
      - `file_type` (text)
      - `storage_path` (text)
      - `download_count` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for CRUD operations
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  price decimal(10,2) NOT NULL DEFAULT 0.00,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  is_public boolean DEFAULT false,
  sales_count integer DEFAULT 0,
  total_revenue decimal(10,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create product_files table
CREATE TABLE IF NOT EXISTS product_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  storage_path text NOT NULL,
  download_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_files ENABLE ROW LEVEL SECURITY;

-- Policies for products
CREATE POLICY "Users can read own products"
  ON products
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public products are viewable by everyone"
  ON products
  FOR SELECT
  TO public
  USING (is_public = true);

CREATE POLICY "Users can create products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON products
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for product_files
CREATE POLICY "Users can read files of own products"
  ON product_files
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_files.product_id 
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read files of public products"
  ON product_files
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_files.product_id 
      AND products.is_public = true
    )
  );

CREATE POLICY "Users can create files for own products"
  ON product_files
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_files.product_id 
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update files of own products"
  ON product_files
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_files.product_id 
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete files of own products"
  ON product_files
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_files.product_id 
      AND products.user_id = auth.uid()
    )
  );

-- Add updated_at trigger for products
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_public ON products(is_public);
CREATE INDEX IF NOT EXISTS idx_product_files_product_id ON product_files(product_id);