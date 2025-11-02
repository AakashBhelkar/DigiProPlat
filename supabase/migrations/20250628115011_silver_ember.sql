/*
  # Create landing pages and page sections tables

  1. New Tables
    - `landing_pages`
      - `id` (uuid, primary key)
      - `title` (text)
      - `slug` (text, unique)
      - `product_id` (uuid, references products)
      - `user_id` (uuid, references profiles)
      - `custom_domain` (text, optional)
      - `is_published` (boolean)
      - `views_count` (integer)
      - `conversions_count` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `page_sections`
      - `id` (uuid, primary key)
      - `page_id` (uuid, references landing_pages)
      - `type` (text)
      - `content` (jsonb)
      - `styles` (jsonb)
      - `order_index` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for CRUD operations
*/

-- Create landing_pages table
CREATE TABLE IF NOT EXISTS landing_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  custom_domain text,
  is_published boolean DEFAULT false,
  views_count integer DEFAULT 0,
  conversions_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create page_sections table
CREATE TABLE IF NOT EXISTS page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES landing_pages(id) ON DELETE CASCADE,
  type text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  styles jsonb NOT NULL DEFAULT '{}',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;

-- Policies for landing_pages
CREATE POLICY "Users can read own landing pages"
  ON landing_pages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Published pages are viewable by everyone"
  ON landing_pages
  FOR SELECT
  TO public
  USING (is_published = true);

CREATE POLICY "Users can create landing pages"
  ON landing_pages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own landing pages"
  ON landing_pages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own landing pages"
  ON landing_pages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for page_sections
CREATE POLICY "Users can read sections of own pages"
  ON page_sections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM landing_pages 
      WHERE landing_pages.id = page_sections.page_id 
      AND landing_pages.user_id = auth.uid()
    )
  );

CREATE POLICY "Sections of published pages are viewable by everyone"
  ON page_sections
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM landing_pages 
      WHERE landing_pages.id = page_sections.page_id 
      AND landing_pages.is_published = true
    )
  );

CREATE POLICY "Users can create sections for own pages"
  ON page_sections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM landing_pages 
      WHERE landing_pages.id = page_sections.page_id 
      AND landing_pages.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sections of own pages"
  ON page_sections
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM landing_pages 
      WHERE landing_pages.id = page_sections.page_id 
      AND landing_pages.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sections of own pages"
  ON page_sections
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM landing_pages 
      WHERE landing_pages.id = page_sections.page_id 
      AND landing_pages.user_id = auth.uid()
    )
  );

-- Add updated_at triggers
CREATE TRIGGER update_landing_pages_updated_at
  BEFORE UPDATE ON landing_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_sections_updated_at
  BEFORE UPDATE ON page_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_landing_pages_user_id ON landing_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_product_id ON landing_pages(product_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_slug ON landing_pages(slug);
CREATE INDEX IF NOT EXISTS idx_page_sections_page_id ON page_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_page_sections_order ON page_sections(page_id, order_index);