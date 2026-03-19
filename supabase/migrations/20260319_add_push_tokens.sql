-- Push notification tokens for Firebase Cloud Messaging
-- Stores FCM device tokens for tenants and users
CREATE TABLE IF NOT EXISTS push_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  fcm_token text NOT NULL,
  device_type text DEFAULT 'web', -- web, android, ios
  device_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(fcm_token)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_tenant_id ON push_tokens(tenant_id);

-- RLS policies
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Users can manage their own tokens
CREATE POLICY "Users manage own tokens"
  ON push_tokens
  FOR ALL
  USING (auth.uid() = user_id);

-- Admins can read tokens for notification sending
CREATE POLICY "Admins read tokens for sending"
  ON push_tokens
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'manager')
    )
  );
