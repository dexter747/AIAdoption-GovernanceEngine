-- =============================================================================
-- Velanova - Unified Database Schema
-- =============================================================================
-- Single migration file for a fresh Supabase database.
-- Merges: schema.sql, schema-v2, schema-v3-byok, schema-v4-payments,
--          schema-v5-nextauth-users, schema-v6-complete-payments
--
-- Run this in Supabase SQL Editor on a NEW project.
-- Date: February 18, 2026
-- =============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. USERS (supports both Supabase Auth and NextAuth)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('trial', 'free', 'starter', 'professional', 'team', 'enterprise')),
  auth_provider TEXT DEFAULT 'nextauth', -- 'supabase', 'nextauth', 'email'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

COMMENT ON TABLE public.users IS 'User profiles - supports both Supabase Auth and NextAuth users';
COMMENT ON COLUMN public.users.auth_provider IS 'Authentication provider: supabase, nextauth, or email';

-- =============================================================================
-- 2. SUBSCRIPTIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Payment provider
  provider TEXT DEFAULT 'dodo' CHECK (provider IN ('dodo', 'paypal', 'razorpay')),
  subscription_id TEXT UNIQUE,
  customer_id TEXT,
  
  -- Plan details
  plan_type TEXT NOT NULL CHECK (plan_type IN ('trial', 'starter', 'professional', 'team', 'enterprise', 'custom')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended', 'past_due', 'unpaid')),
  
  -- Amount
  amount INTEGER NOT NULL DEFAULT 0, -- in cents
  currency TEXT DEFAULT 'usd',
  
  -- Billing period
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancellation_date TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  -- Trial
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscription_id ON public.subscriptions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON public.subscriptions(current_period_end);

-- =============================================================================
-- 3. LICENSES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  license_key TEXT UNIQUE NOT NULL,
  key_hash TEXT,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('starter', 'professional', 'team', 'enterprise', 'custom')),
  tier TEXT DEFAULT 'pro',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended', 'deactivated')),
  
  is_active BOOLEAN DEFAULT TRUE,
  device_limit INTEGER DEFAULT 1,
  max_machines INT DEFAULT 1,
  devices_activated INTEGER DEFAULT 0,
  
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_validated_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_licenses_user_id ON public.licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_license_key ON public.licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_key_hash ON public.licenses(key_hash);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON public.licenses(status);
CREATE INDEX IF NOT EXISTS idx_licenses_subscription_id ON public.licenses(subscription_id);
CREATE INDEX IF NOT EXISTS idx_licenses_expires_at ON public.licenses(expires_at);

-- =============================================================================
-- 4. LICENSE ACTIVATIONS (Device Tracking)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.license_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID REFERENCES public.licenses(id) ON DELETE CASCADE NOT NULL,
  device_id TEXT NOT NULL,
  device_name TEXT,
  device_os TEXT,
  platform TEXT, -- 'darwin', 'win32', 'linux'
  app_version TEXT,
  ip_address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  last_checked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(license_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_license_activations_license_id ON public.license_activations(license_id);
CREATE INDEX IF NOT EXISTS idx_license_activations_device_id ON public.license_activations(device_id);

-- Legacy alias view for code referencing device_activations
CREATE OR REPLACE VIEW public.device_activations AS
  SELECT
    id, license_id, device_id, device_name, device_os,
    platform, app_version, ip_address, is_active,
    activated_at, last_checked_at AS last_seen_at, activated_at AS created_at
  FROM public.license_activations;

-- =============================================================================
-- 5. PAYMENT SESSIONS (Checkout tracking)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.payment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  customer_id TEXT,
  
  plan_type TEXT NOT NULL CHECK (plan_type IN ('trial', 'starter', 'professional', 'team', 'enterprise', 'custom')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  amount INTEGER NOT NULL DEFAULT 0, -- in cents
  currency TEXT DEFAULT 'usd',
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'expired', 'canceled')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_payment_sessions_user_id ON public.payment_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_session_id ON public.payment_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_status ON public.payment_sessions(status);

-- =============================================================================
-- 6. PAYMENTS / INVOICES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  provider TEXT DEFAULT 'dodo' CHECK (provider IN ('dodo', 'paypal', 'razorpay')),
  invoice_id TEXT UNIQUE,
  provider_payment_id TEXT,
  payment_intent_id TEXT,
  
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON public.payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- =============================================================================
-- 7. USAGE TRACKING
-- =============================================================================

-- Detailed usage records (per-request logging)
CREATE TABLE IF NOT EXISTS public.usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INT DEFAULT 0,
  output_tokens INT DEFAULT 0,
  cost_cents DECIMAL(10, 4) DEFAULT 0,
  duration_ms INT DEFAULT 0,
  request_type TEXT DEFAULT 'chat' CHECK (request_type IN ('chat', 'embeddings', 'images', 'audio')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_usage_records_user_id ON public.usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_timestamp ON public.usage_records(timestamp);
CREATE INDEX IF NOT EXISTS idx_usage_records_provider ON public.usage_records(provider);

-- Aggregated usage logs (for billing / plan limits)
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  license_id UUID REFERENCES public.licenses(id) ON DELETE SET NULL,
  usage_type TEXT NOT NULL CHECK (usage_type IN ('query', 'tokens', 'connection', 'ai_query', 'database_connection', 'login', 'logout')),
  amount INTEGER NOT NULL DEFAULT 1,
  provider TEXT,
  model TEXT,
  tokens_used INTEGER,
  cost DECIMAL(10, 6),
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_timestamp ON public.usage_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_usage_logs_usage_type ON public.usage_logs(usage_type);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_timestamp ON public.usage_logs(user_id, timestamp);

-- =============================================================================
-- 8. API KEYS (platform-issued API keys for programmatic access)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  key_hash TEXT UNIQUE NOT NULL, -- SHA256 hash of the API key
  name TEXT NOT NULL,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'starter', 'pro', 'enterprise')),
  is_active BOOLEAN DEFAULT TRUE,
  rate_limit INT DEFAULT 100, -- Requests per minute
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash);

-- =============================================================================
-- 9. USER PROVIDER KEYS (BYOK - Bring Your Own Key)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_provider_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  provider TEXT NOT NULL CHECK (provider IN (
    'openai', 'anthropic', 'google', 'groq', 'cohere',
    'mistral', 'perplexity', 'deepseek', 'together',
    'replicate', 'huggingface', 'openrouter',
    'azure_openai', 'aws_bedrock', 'ollama'
  )),
  
  key_name TEXT NOT NULL DEFAULT 'Default Key',
  encrypted_key TEXT NOT NULL,  -- AES-256-GCM encrypted
  key_preview TEXT,             -- Last 4 chars for display: "...abc1"
  
  -- Provider-specific config (JSON)
  config JSONB DEFAULT '{}',
  
  is_active BOOLEAN DEFAULT TRUE,
  is_valid BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  last_validated_at TIMESTAMPTZ,
  validation_error TEXT,
  
  total_requests INT DEFAULT 0,
  total_tokens INT DEFAULT 0,
  total_cost_cents DECIMAL(10, 4) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_provider UNIQUE (user_id, provider, key_name)
);

CREATE INDEX IF NOT EXISTS idx_user_provider_keys_user_id ON public.user_provider_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_provider_keys_provider ON public.user_provider_keys(provider);
CREATE INDEX IF NOT EXISTS idx_user_provider_keys_active ON public.user_provider_keys(user_id, is_active) WHERE is_active = TRUE;

-- =============================================================================
-- 10. USER DATABASE CONNECTIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  connection_type TEXT NOT NULL CHECK (connection_type IN (
    'postgresql', 'mysql', 'mongodb', 'sqlserver', 'oracle',
    'sap_hana', 'mariadb', 'sqlite', 'redis', 'elasticsearch',
    'salesforce', 'servicenow', 'jira', 'zendesk', 'workday'
  )),
  
  encrypted_config TEXT NOT NULL,  -- AES-256-GCM encrypted JSON
  
  is_active BOOLEAN DEFAULT TRUE,
  is_connected BOOLEAN DEFAULT FALSE,
  last_connected_at TIMESTAMPTZ,
  last_error TEXT,
  
  mcp_server_type TEXT CHECK (mcp_server_type IN ('npm', 'docker', 'custom')),
  mcp_process_id INT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_connection_name UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_user_connections_user_id ON public.user_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_type ON public.user_connections(connection_type);

-- =============================================================================
-- 11. CHAT SESSIONS & MESSAGES (Desktop App sync)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Chat',
  provider TEXT,
  model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant')),
  content TEXT NOT NULL,
  tokens_used INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);

-- =============================================================================
-- 12. TEAM MEMBERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  UNIQUE(team_owner_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_owner_id ON public.team_members(team_owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON public.team_members(status);

-- =============================================================================
-- 13. AUDIT LOG (Admin only)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_actor_id ON public.audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Updated-at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Alias used in some files
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_licenses_updated_at BEFORE UPDATE ON public.licenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_provider_keys_updated_at BEFORE UPDATE ON public.user_provider_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_connections_updated_at BEFORE UPDATE ON public.user_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create user profile on Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, auth_provider)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'supabase'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
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
  FROM public.invoices
  WHERE invoice_number LIKE 'INV-' || year || month || '%';
  
  RETURN 'INV-' || year || month || '-' || LPAD(sequence::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := public.generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number_trigger
  BEFORE INSERT ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_invoice_number();

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Get user's daily usage
CREATE OR REPLACE FUNCTION public.get_daily_usage(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  total_tokens BIGINT,
  total_cost DECIMAL,
  request_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(input_tokens + output_tokens), 0)::BIGINT,
    COALESCE(SUM(cost_cents), 0)::DECIMAL,
    COUNT(*)::BIGINT
  FROM public.usage_records
  WHERE user_id = p_user_id
    AND timestamp::DATE = p_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's monthly usage
CREATE OR REPLACE FUNCTION public.get_monthly_usage(
  p_user_id UUID,
  p_year INT DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INT,
  p_month INT DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)::INT
)
RETURNS TABLE (
  total_tokens BIGINT,
  total_cost DECIMAL,
  request_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(input_tokens + output_tokens), 0)::BIGINT,
    COALESCE(SUM(cost_cents), 0)::DECIMAL,
    COUNT(*)::BIGINT
  FROM public.usage_records
  WHERE user_id = p_user_id
    AND EXTRACT(YEAR FROM timestamp) = p_year
    AND EXTRACT(MONTH FROM timestamp) = p_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get active subscription for user
CREATE OR REPLACE FUNCTION public.get_active_subscription(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  plan_type TEXT,
  status TEXT,
  current_period_end TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.plan_type, s.status, s.current_period_end
  FROM public.subscriptions s
  WHERE s.user_id = p_user_id
    AND s.status = 'active'
  ORDER BY s.current_period_end DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has valid license
CREATE OR REPLACE FUNCTION public.has_valid_license(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_subscription RECORD;
BEGIN
  SELECT * INTO v_subscription
  FROM public.subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
    AND current_period_end > NOW()
  LIMIT 1;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current-period usage for billing
CREATE OR REPLACE FUNCTION public.get_current_period_usage(p_user_id UUID)
RETURNS TABLE (
  total_queries BIGINT,
  total_tokens BIGINT,
  total_cost DECIMAL
) AS $$
DECLARE
  period_start TIMESTAMPTZ;
BEGIN
  SELECT current_period_start INTO period_start
  FROM public.subscriptions
  WHERE user_id = p_user_id AND status = 'active'
  ORDER BY current_period_end DESC LIMIT 1;
  
  IF period_start IS NULL THEN
    period_start := DATE_TRUNC('month', NOW());
  END IF;
  
  RETURN QUERY
  SELECT
    COUNT(CASE WHEN usage_type = 'query' THEN 1 END)::BIGINT,
    COALESCE(SUM(CASE WHEN usage_type = 'tokens' THEN amount ELSE 0 END), 0)::BIGINT,
    COALESCE(SUM(cost), 0)::DECIMAL
  FROM public.usage_logs
  WHERE user_id = p_user_id AND timestamp >= period_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check plan limits
CREATE OR REPLACE FUNCTION public.check_plan_limits(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_plan_type TEXT;
  v_usage RECORD;
  v_limits JSONB;
BEGIN
  SELECT plan_type INTO v_plan_type
  FROM public.subscriptions
  WHERE user_id = p_user_id AND status = 'active'
  ORDER BY current_period_end DESC LIMIT 1;
  
  IF v_plan_type IS NULL THEN v_plan_type := 'starter'; END IF;
  
  SELECT * INTO v_usage FROM public.get_current_period_usage(p_user_id);
  
  v_limits := CASE v_plan_type
    WHEN 'starter' THEN '{"tokens": 1000000, "queries_per_day": 50}'::jsonb
    WHEN 'professional' THEN '{"tokens": 10000000, "queries_per_day": 500}'::jsonb
    WHEN 'enterprise' THEN '{"tokens": 100000000, "queries_per_day": 9999}'::jsonb
    ELSE '{"tokens": 999999999, "queries_per_day": 99999}'::jsonb
  END;
  
  RETURN jsonb_build_object(
    'plan_type', v_plan_type,
    'usage', jsonb_build_object(
      'queries', v_usage.total_queries,
      'tokens', v_usage.total_tokens,
      'cost', v_usage.total_cost
    ),
    'limits', v_limits,
    'exceeded', v_usage.total_tokens > (v_limits->>'tokens')::bigint
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's active provider keys
CREATE OR REPLACE FUNCTION public.get_user_providers(p_user_id UUID)
RETURNS TABLE (
  provider TEXT,
  key_name TEXT,
  is_valid BOOLEAN,
  last_used_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT upk.provider, upk.key_name, upk.is_valid, upk.last_used_at
  FROM public.user_provider_keys upk
  WHERE upk.user_id = p_user_id AND upk.is_active = TRUE
  ORDER BY upk.last_used_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's active database connections
CREATE OR REPLACE FUNCTION public.get_user_connections(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  connection_type TEXT,
  is_connected BOOLEAN,
  last_connected_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT uc.id, uc.name, uc.connection_type, uc.is_connected, uc.last_connected_at
  FROM public.user_connections uc
  WHERE uc.user_id = p_user_id AND uc.is_active = TRUE
  ORDER BY uc.last_connected_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update provider key usage stats
CREATE OR REPLACE FUNCTION public.update_provider_key_usage(
  p_key_id UUID,
  p_tokens INT,
  p_cost_cents DECIMAL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_provider_keys
  SET
    total_requests = total_requests + 1,
    total_tokens = total_tokens + p_tokens,
    total_cost_cents = total_cost_cents + p_cost_cents,
    last_used_at = NOW()
  WHERE id = p_key_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get payment history
CREATE OR REPLACE FUNCTION public.get_payment_history(p_user_id UUID)
RETURNS TABLE (
  payment_id UUID,
  amount DECIMAL,
  currency TEXT,
  status TEXT,
  paid_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.amount, p.currency, p.status, p.paid_at
  FROM public.payments p
  WHERE p.user_id = p_user_id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_provider_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
-- audit_log: no RLS - admin only via service role

-- --- USERS ---
CREATE POLICY "Service role full access on users" ON public.users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- --- SUBSCRIPTIONS ---
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- --- LICENSES ---
CREATE POLICY "Users can view own licenses" ON public.licenses
  FOR SELECT USING (auth.uid() = user_id);

-- --- LICENSE ACTIVATIONS ---
CREATE POLICY "Users can view own device activations" ON public.license_activations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.licenses
      WHERE licenses.id = license_activations.license_id
        AND licenses.user_id = auth.uid()
    )
  );

-- --- PAYMENT SESSIONS ---
CREATE POLICY "Users can view own payment sessions" ON public.payment_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payment sessions" ON public.payment_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- --- PAYMENTS ---
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- --- INVOICES ---
CREATE POLICY "Users can view own invoices" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id);

-- --- USAGE RECORDS ---
CREATE POLICY "Users can view own usage records" ON public.usage_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert usage records" ON public.usage_records
  FOR INSERT WITH CHECK (true);

-- --- USAGE LOGS ---
CREATE POLICY "Users can view own usage logs" ON public.usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage logs" ON public.usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- --- API KEYS ---
CREATE POLICY "Users can view own API keys" ON public.api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys" ON public.api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys" ON public.api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys" ON public.api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- --- USER PROVIDER KEYS ---
CREATE POLICY "Users can view own provider keys" ON public.user_provider_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own provider keys" ON public.user_provider_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own provider keys" ON public.user_provider_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own provider keys" ON public.user_provider_keys
  FOR DELETE USING (auth.uid() = user_id);

-- --- USER CONNECTIONS ---
CREATE POLICY "Users can manage own connections" ON public.user_connections
  FOR ALL USING (auth.uid() = user_id);

-- --- CHAT ---
CREATE POLICY "Users can manage own chat sessions" ON public.chat_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own chat messages" ON public.chat_messages
  FOR ALL USING (
    session_id IN (SELECT id FROM public.chat_sessions WHERE user_id = auth.uid())
  );

-- --- TEAM MEMBERS ---
CREATE POLICY "Team owners can view their team" ON public.team_members
  FOR SELECT USING (auth.uid() = team_owner_id OR auth.uid() = user_id);

CREATE POLICY "Team owners can manage their team" ON public.team_members
  FOR ALL USING (auth.uid() = team_owner_id);

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_daily_usage TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_monthly_usage TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_valid_license TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_period_usage TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_plan_limits TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_providers TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_connections TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_provider_key_usage TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_payment_history TO authenticated;

-- =============================================================================
-- TABLE COMMENTS
-- =============================================================================
COMMENT ON TABLE public.payment_sessions IS 'Tracks payment checkout sessions';
COMMENT ON TABLE public.subscriptions IS 'User subscription records';
COMMENT ON TABLE public.licenses IS 'Desktop app license keys';
COMMENT ON TABLE public.license_activations IS 'Device activations for licenses';
COMMENT ON TABLE public.usage_logs IS 'Usage tracking for billing';
COMMENT ON TABLE public.usage_records IS 'Detailed per-request usage records';
COMMENT ON TABLE public.team_members IS 'Team member management';
COMMENT ON TABLE public.invoices IS 'Invoice records';
COMMENT ON TABLE public.user_provider_keys IS 'User BYOK AI provider API keys (encrypted)';
COMMENT ON TABLE public.user_connections IS 'User database connection configs (encrypted)';
COMMENT ON TABLE public.chat_sessions IS 'Desktop app chat session sync';
COMMENT ON TABLE public.chat_messages IS 'Desktop app chat message sync';
COMMENT ON TABLE public.audit_log IS 'Admin audit trail - no RLS, service_role only';

-- =============================================================================
-- DONE
-- =============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Velanova unified schema created successfully!';
  RAISE NOTICE 'Tables: users, subscriptions, licenses, license_activations, payment_sessions,';
  RAISE NOTICE '        payments, invoices, usage_records, usage_logs, api_keys,';
  RAISE NOTICE '        user_provider_keys, user_connections, chat_sessions, chat_messages,';
  RAISE NOTICE '        team_members, audit_log';
END $$;
