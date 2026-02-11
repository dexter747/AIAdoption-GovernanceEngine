-- AI Nexus - Payment & License System Schema
-- Version 6: Complete Payment, Subscription, License & Usage System
-- Date: February 11, 2026

-- ============================================================================
-- PAYMENT SESSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('starter', 'professional', 'enterprise', 'custom')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'expired')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_payment_sessions_user_id ON payment_sessions(user_id);
CREATE INDEX idx_payment_sessions_session_id ON payment_sessions(session_id);
CREATE INDEX idx_payment_sessions_status ON payment_sessions(status);

-- ============================================================================
-- SUBSCRIPTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('starter', 'professional', 'enterprise', 'custom')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended', 'past_due')),
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancellation_date TIMESTAMPTZ,
  cancellation_reason TEXT,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_period_end ON subscriptions(current_period_end);

-- ============================================================================
-- LICENSES
-- ============================================================================

CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  license_key TEXT UNIQUE NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('starter', 'professional', 'enterprise', 'custom')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended', 'deactivated')),
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_validated_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_licenses_user_id ON licenses(user_id);
CREATE INDEX idx_licenses_license_key ON licenses(license_key);
CREATE INDEX idx_licenses_status ON licenses(status);
CREATE INDEX idx_licenses_expires_at ON licenses(expires_at);

-- ============================================================================
-- LICENSE ACTIVATIONS (Device Tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS license_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID REFERENCES licenses(id) ON DELETE CASCADE NOT NULL,
  device_id TEXT NOT NULL,
  device_name TEXT,
  platform TEXT, -- 'darwin', 'win32', 'linux'
  app_version TEXT,
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  last_checked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(license_id, device_id)
);

CREATE INDEX idx_license_activations_license_id ON license_activations(license_id);
CREATE INDEX idx_license_activations_device_id ON license_activations(device_id);

-- ============================================================================
-- USAGE LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  license_id UUID REFERENCES licenses(id) ON DELETE SET NULL,
  usage_type TEXT NOT NULL CHECK (usage_type IN ('query', 'tokens', 'connection')),
  amount INTEGER NOT NULL DEFAULT 1,
  provider TEXT, -- AI provider (openai, anthropic, etc)
  model TEXT, -- AI model (gpt-4, claude-3, etc)
  cost DECIMAL(10, 6), -- cost in dollars
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_timestamp ON usage_logs(timestamp);
CREATE INDEX idx_usage_logs_usage_type ON usage_logs(usage_type);
CREATE INDEX idx_usage_logs_user_timestamp ON usage_logs(user_id, timestamp);

-- ============================================================================
-- TEAM MEMBERS (for multi-user plans)
-- ============================================================================

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  UNIQUE(team_owner_id, user_id)
);

CREATE INDEX idx_team_members_owner_id ON team_members(team_owner_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_status ON team_members(status);

-- ============================================================================
-- INVOICES
-- ============================================================================

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  items JSONB NOT NULL, -- line items
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status ON invoices(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE payment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE license_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Payment Sessions Policies
CREATE POLICY "Users can view their own payment sessions"
  ON payment_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment sessions"
  ON payment_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Subscriptions Policies
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Licenses Policies
CREATE POLICY "Users can view their own licenses"
  ON licenses FOR SELECT
  USING (auth.uid() = user_id);

-- License Activations Policies
CREATE POLICY "Users can view their license activations"
  ON license_activations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM licenses
      WHERE licenses.id = license_activations.license_id
      AND licenses.user_id = auth.uid()
    )
  );

-- Usage Logs Policies
CREATE POLICY "Users can view their own usage"
  ON usage_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
  ON usage_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Team Members Policies
CREATE POLICY "Team owners can view their team"
  ON team_members FOR SELECT
  USING (auth.uid() = team_owner_id OR auth.uid() = user_id);

CREATE POLICY "Team owners can manage their team"
  ON team_members FOR ALL
  USING (auth.uid() = team_owner_id);

-- Invoices Policies
CREATE POLICY "Users can view their own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  year TEXT;
  month TEXT;
  sequence INT;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');
  month := TO_CHAR(NOW(), 'MM');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM 9) AS INTEGER)
  ), 0) + 1
  INTO sequence
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year || month || '%';
  
  RETURN 'INV-' || year || month || '-' || LPAD(sequence::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Auto-generate invoice number before insert
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number_trigger
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_number();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get active subscription for user
CREATE OR REPLACE FUNCTION get_active_subscription(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  plan_type TEXT,
  status TEXT,
  current_period_end TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.plan_type, s.status, s.current_period_end
  FROM subscriptions s
  WHERE s.user_id = p_user_id
    AND s.status = 'active'
  ORDER BY s.current_period_end DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Get usage for current period
CREATE OR REPLACE FUNCTION get_current_period_usage(p_user_id UUID)
RETURNS TABLE (
  total_queries BIGINT,
  total_tokens BIGINT,
  total_cost DECIMAL
) AS $$
DECLARE
  period_start TIMESTAMPTZ;
BEGIN
  -- Get current subscription period start
  SELECT current_period_start INTO period_start
  FROM subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
  ORDER BY current_period_end DESC
  LIMIT 1;
  
  IF period_start IS NULL THEN
    period_start := DATE_TRUNC('month', NOW());
  END IF;
  
  RETURN QUERY
  SELECT
    COUNT(CASE WHEN usage_type = 'query' THEN 1 END) as total_queries,
    COALESCE(SUM(CASE WHEN usage_type = 'tokens' THEN amount ELSE 0 END), 0) as total_tokens,
    COALESCE(SUM(cost), 0) as total_cost
  FROM usage_logs
  WHERE user_id = p_user_id
    AND timestamp >= period_start;
END;
$$ LANGUAGE plpgsql;

-- Check if user has exceeded plan limits
CREATE OR REPLACE FUNCTION check_plan_limits(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_plan_type TEXT;
  v_usage RECORD;
  v_limits JSONB;
  v_result JSONB;
BEGIN
  -- Get user's plan
  SELECT plan_type INTO v_plan_type
  FROM subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
  ORDER BY current_period_end DESC
  LIMIT 1;
  
  IF v_plan_type IS NULL THEN
    v_plan_type := 'starter';
  END IF;
  
  -- Get usage
  SELECT * INTO v_usage FROM get_current_period_usage(p_user_id);
  
  -- Define limits
  v_limits := CASE v_plan_type
    WHEN 'starter' THEN '{"tokens": 1000000, "queries_per_day": 50}'::jsonb
    WHEN 'professional' THEN '{"tokens": 10000000, "queries_per_day": 500}'::jsonb
    WHEN 'enterprise' THEN '{"tokens": 100000000, "queries_per_day": 9999}'::jsonb
    ELSE '{"tokens": 999999999, "queries_per_day": 99999}'::jsonb
  END;
  
  -- Build result
  v_result := jsonb_build_object(
    'plan_type', v_plan_type,
    'usage', jsonb_build_object(
      'queries', v_usage.total_queries,
      'tokens', v_usage.total_tokens,
      'cost', v_usage.total_cost
    ),
    'limits', v_limits,
    'exceeded', v_usage.total_tokens > (v_limits->>'tokens')::bigint
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL DATA (Optional)
-- ============================================================================

-- You can insert sample data here for testing

COMMENT ON TABLE payment_sessions IS 'Tracks payment checkout sessions';
COMMENT ON TABLE subscriptions IS 'User subscription records';
COMMENT ON TABLE licenses IS 'Desktop app license keys';
COMMENT ON TABLE license_activations IS 'Device activations for licenses';
COMMENT ON TABLE usage_logs IS 'Usage tracking for billing';
COMMENT ON TABLE team_members IS 'Team member management';
COMMENT ON TABLE invoices IS 'Invoice records';
