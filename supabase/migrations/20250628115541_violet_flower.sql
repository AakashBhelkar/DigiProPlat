/*
  # Admin System Setup

  1. New Tables
    - `admin_users` - Admin user accounts with roles and permissions
    - `admin_sessions` - Admin login sessions and activity tracking
    - `platform_analytics` - System-wide analytics and metrics
    - `content_reports` - User reports and content moderation
    - `system_logs` - Audit trail for admin actions

  2. Security
    - Enable RLS on all admin tables
    - Add policies for admin access only
    - Create admin role management system
*/

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role text NOT NULL DEFAULT 'moderator' CHECK (role IN ('super_admin', 'admin', 'moderator', 'support')),
  permissions jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  ip_address inet,
  user_agent text,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Platform analytics table
CREATE TABLE IF NOT EXISTS platform_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date DEFAULT CURRENT_DATE,
  total_users integer DEFAULT 0,
  new_users integer DEFAULT 0,
  active_users integer DEFAULT 0,
  total_products integer DEFAULT 0,
  new_products integer DEFAULT 0,
  total_sales integer DEFAULT 0,
  total_revenue numeric(12,2) DEFAULT 0.00,
  page_views integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  conversion_rate numeric(5,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  UNIQUE(date)
);

-- Content reports table
CREATE TABLE IF NOT EXISTS content_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reported_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reported_product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  reported_page_id uuid REFERENCES landing_pages(id) ON DELETE CASCADE,
  report_type text NOT NULL CHECK (report_type IN ('spam', 'inappropriate', 'copyright', 'fraud', 'other')),
  description text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  admin_notes text,
  reviewed_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- System logs table
CREATE TABLE IF NOT EXISTS system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Admin policies (will be implemented in application logic)
CREATE POLICY "Admin users can manage admin accounts"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin users can view analytics"
  ON platform_analytics
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

CREATE POLICY "Admin users can manage reports"
  ON content_reports
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin', 'moderator'));

CREATE POLICY "Admin users can view logs"
  ON system_logs
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

-- Indexes for performance
CREATE INDEX idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX idx_admin_sessions_expires_at ON admin_sessions(expires_at);
CREATE INDEX idx_platform_analytics_date ON platform_analytics(date);
CREATE INDEX idx_content_reports_status ON content_reports(status);
CREATE INDEX idx_content_reports_type ON content_reports(report_type);
CREATE INDEX idx_system_logs_admin_id ON system_logs(admin_id);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default super admin (password should be changed immediately)
INSERT INTO admin_users (email, password_hash, first_name, last_name, role, permissions)
VALUES (
  'admin@digiproplat.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: "password"
  'Super',
  'Admin',
  'super_admin',
  '["all"]'::jsonb
) ON CONFLICT (email) DO NOTHING;