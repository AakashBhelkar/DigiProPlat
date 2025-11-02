/*
  # Admin System Enhancements

  1. Enhanced Tables
    - Add more detailed logging capabilities
    - Improve analytics tracking
    - Add user activity monitoring
    - Enhanced reporting system

  2. New Functions
    - User activity tracking
    - Automated analytics updates
    - Enhanced audit logging
*/

-- Add user activity tracking
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Add email notifications queue
CREATE TABLE IF NOT EXISTS email_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  template_name text,
  template_data jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  scheduled_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Add system configuration table
CREATE TABLE IF NOT EXISTS system_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  category text DEFAULT 'general',
  is_public boolean DEFAULT false,
  updated_by uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add user sessions tracking
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  ip_address inet,
  user_agent text,
  last_activity timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for user_activity_logs
CREATE POLICY "Users can read own activity logs"
  ON user_activity_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can read all activity logs"
  ON user_activity_logs
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

-- Policies for email_notifications (admin only)
CREATE POLICY "Admin can manage email notifications"
  ON email_notifications
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

-- Policies for system_config
CREATE POLICY "Admin can manage system config"
  ON system_config
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

CREATE POLICY "Public config is readable by all"
  ON system_config
  FOR SELECT
  TO public
  USING (is_public = true);

-- Policies for user_sessions
CREATE POLICY "Users can read own sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can read all sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

-- Indexes for performance
CREATE INDEX idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_created_at ON user_activity_logs(created_at);
CREATE INDEX idx_user_activity_logs_action ON user_activity_logs(action);
CREATE INDEX idx_email_notifications_status ON email_notifications(status);
CREATE INDEX idx_email_notifications_scheduled_at ON email_notifications(scheduled_at);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_activity_logs (user_id, action, resource_type, resource_id)
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add activity logging triggers
CREATE TRIGGER log_product_activity
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION log_user_activity();

CREATE TRIGGER log_landing_page_activity
  AFTER INSERT OR UPDATE OR DELETE ON landing_pages
  FOR EACH ROW EXECUTE FUNCTION log_user_activity();

CREATE TRIGGER log_transaction_activity
  AFTER INSERT OR UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION log_user_activity();

-- Function to clean up old sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions WHERE expires_at < now();
  DELETE FROM admin_sessions WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default system configuration
INSERT INTO system_config (key, value, description, category, is_public) VALUES
('site_name', '"DigiProPlat"', 'Site name displayed in headers', 'general', true),
('maintenance_mode', 'false', 'Enable maintenance mode', 'general', false),
('allow_registrations', 'true', 'Allow new user registrations', 'general', false),
('commission_rate', '5.0', 'Platform commission rate percentage', 'payments', false),
('min_withdrawal', '50.0', 'Minimum withdrawal amount', 'payments', false),
('max_file_size', '104857600', 'Maximum file upload size in bytes', 'uploads', false),
('allowed_file_types', '["pdf", "zip", "rar", "jpg", "png", "gif", "mp4", "mp3"]', 'Allowed file types for uploads', 'uploads', false)
ON CONFLICT (key) DO NOTHING;

-- Update triggers for system_config
CREATE TRIGGER update_system_config_updated_at
  BEFORE UPDATE ON system_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();