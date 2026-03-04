-- =============================================================================
-- Velanova AI Adoption & Governance Engine — Complete Database Schema
-- =============================================================================
-- Single file combining ALL tables: core platform + 7 use-case modules.
--
-- Sections:
--   A. Extensions & Functions
--   B. Core Platform Tables (16 tables)
--   C. Email Auth Extension (1 table + ALTER)
--   D. Business Intelligence Tables (3 tables)
--   E. Project Intelligence Tables (4 tables)
--   F. Resource & Capacity Tables (3 tables)  — depends on E
--   G. Regulatory Intelligence Tables (3 tables)
--   H. Procurement & Contract Tables (3 tables)
--   I. KYC & Onboarding Tables (4 tables)
--   J. Fraud Detection Tables (4 tables)
--   K. Views, Triggers, RLS Policies
--   L. Grants & Comments
--
-- Total: 41 tables + 1 view + functions + RLS + triggers
-- Run in Supabase SQL Editor on a FRESH project.
-- =============================================================================

-- =============================================================================
-- A. EXTENSIONS & UTILITY FUNCTIONS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Updated-at trigger function (used by core tables)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Alias (used in some core files)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Alias used by use-case migration tables
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- B. CORE PLATFORM TABLES
-- =============================================================================

-- B1. USERS (supports Supabase Auth, NextAuth, and email/password)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('trial', 'free', 'starter', 'professional', 'team', 'enterprise')),
  auth_provider TEXT DEFAULT 'nextauth',
  password_hash TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- B2. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT DEFAULT 'dodo' CHECK (provider IN ('dodo', 'paypal', 'razorpay')),
  subscription_id TEXT UNIQUE,
  customer_id TEXT,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('trial', 'starter', 'professional', 'team', 'enterprise', 'custom')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended', 'past_due', 'unpaid')),
  amount INTEGER NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'usd',
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancellation_date TIMESTAMPTZ,
  cancellation_reason TEXT,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscription_id ON public.subscriptions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON public.subscriptions(current_period_end);

-- B3. LICENSES
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

-- B4. LICENSE ACTIVATIONS (Device Tracking)
CREATE TABLE IF NOT EXISTS public.license_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID REFERENCES public.licenses(id) ON DELETE CASCADE NOT NULL,
  device_id TEXT NOT NULL,
  device_name TEXT,
  device_os TEXT,
  platform TEXT,
  app_version TEXT,
  ip_address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  last_checked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(license_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_license_activations_license_id ON public.license_activations(license_id);
CREATE INDEX IF NOT EXISTS idx_license_activations_device_id ON public.license_activations(device_id);

-- Legacy alias view
CREATE OR REPLACE VIEW public.device_activations AS
  SELECT id, license_id, device_id, device_name, device_os,
         platform, app_version, ip_address, is_active,
         activated_at, last_checked_at AS last_seen_at, activated_at AS created_at
  FROM public.license_activations;

-- B5. PAYMENT SESSIONS
CREATE TABLE IF NOT EXISTS public.payment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  customer_id TEXT,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('trial', 'starter', 'professional', 'team', 'enterprise', 'custom')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  amount INTEGER NOT NULL DEFAULT 0,
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

-- B6. PAYMENTS
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

-- B7. INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
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

-- B8. USAGE RECORDS (per-request logging)
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

-- B9. USAGE LOGS (aggregated for billing)
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

-- B10. API KEYS
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  key_hash TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'starter', 'pro', 'enterprise')),
  is_active BOOLEAN DEFAULT TRUE,
  rate_limit INT DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash);

-- B11. USER PROVIDER KEYS (BYOK)
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
  encrypted_key TEXT NOT NULL,
  key_preview TEXT,
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

-- B12. USER DATABASE CONNECTIONS
CREATE TABLE IF NOT EXISTS public.user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  connection_type TEXT NOT NULL CHECK (connection_type IN (
    'postgresql', 'mysql', 'mongodb', 'sqlserver', 'oracle',
    'sap_hana', 'mariadb', 'sqlite', 'redis', 'elasticsearch',
    'salesforce', 'servicenow', 'jira', 'zendesk', 'workday'
  )),
  encrypted_config TEXT NOT NULL,
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

-- B13. CHAT SESSIONS
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

-- B14. CHAT MESSAGES
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

-- B15. TEAM MEMBERS
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

-- B16. AUDIT LOG
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
-- C. EMAIL AUTH EXTENSION
-- =============================================================================

-- Auth tokens table for verification & password reset
CREATE TABLE IF NOT EXISTS public.auth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email_verification', 'password_reset')),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON public.auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id ON public.auth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires ON public.auth_tokens(expires_at);

-- =============================================================================
-- D. BUSINESS INTELLIGENCE — UC7: Legacy System Query
-- =============================================================================

-- D1. Saved Queries
CREATE TABLE IF NOT EXISTS public.saved_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  connection_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  natural_language TEXT NOT NULL,
  generated_sql TEXT,
  connection_type TEXT,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  run_count INTEGER DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_queries_user ON public.saved_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_queries_favorite ON public.saved_queries(user_id, is_favorite) WHERE is_favorite = TRUE;

-- D2. Query History
CREATE TABLE IF NOT EXISTS public.query_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  connection_id UUID,
  connection_name TEXT,
  connection_type TEXT,
  natural_language TEXT NOT NULL,
  generated_sql TEXT,
  result_summary TEXT,
  row_count INTEGER,
  execution_ms INTEGER,
  ai_model TEXT,
  ai_provider TEXT,
  tokens_used INTEGER DEFAULT 0,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'error', 'timeout')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_query_history_user ON public.query_history(user_id);
CREATE INDEX IF NOT EXISTS idx_query_history_created ON public.query_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_query_history_connection ON public.query_history(connection_id);

-- D3. Query Visualizations
CREATE TABLE IF NOT EXISTS public.query_visualizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  saved_query_id UUID REFERENCES public.saved_queries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  chart_type TEXT NOT NULL CHECK (chart_type IN ('bar', 'line', 'pie', 'area', 'scatter', 'table')),
  chart_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_query_viz_user ON public.query_visualizations(user_id);

-- =============================================================================
-- E. PROJECT INTELLIGENCE — UC5
-- =============================================================================

-- E1. Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  start_date DATE,
  target_end_date DATE,
  actual_end_date DATE,
  budget NUMERIC(12, 2),
  spent NUMERIC(12, 2) DEFAULT 0,
  health_score INTEGER DEFAULT 100 CHECK (health_score BETWEEN 0 AND 100),
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_user ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);

-- E2. Project Tasks
CREATE TABLE IF NOT EXISTS public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'blocked')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assignee TEXT,
  due_date DATE,
  estimated_hours NUMERIC(6, 1),
  actual_hours NUMERIC(6, 1),
  dependencies UUID[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON public.project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON public.project_tasks(status);

-- E3. Project Risks
CREATE TABLE IF NOT EXISTS public.project_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('technical', 'resource', 'schedule', 'budget', 'scope', 'external', 'general')),
  likelihood TEXT NOT NULL DEFAULT 'medium' CHECK (likelihood IN ('low', 'medium', 'high', 'critical')),
  impact TEXT NOT NULL DEFAULT 'medium' CHECK (impact IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'mitigating', 'resolved', 'accepted')),
  mitigation TEXT,
  owner TEXT,
  ai_detected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_risks_project ON public.project_risks(project_id);

-- E4. Project Insights (AI-generated)
CREATE TABLE IF NOT EXISTS public.project_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('health', 'risk', 'recommendation', 'forecast', 'anomaly')),
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  ai_model TEXT,
  ai_provider TEXT,
  is_dismissed BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_insights_project ON public.project_insights(project_id);
CREATE INDEX IF NOT EXISTS idx_project_insights_type ON public.project_insights(type);

-- =============================================================================
-- F. RESOURCE & CAPACITY — UC6  (depends on E: projects)
-- =============================================================================

-- F1. Resources
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'developer',
  department TEXT,
  skills TEXT[] DEFAULT '{}',
  cost_rate NUMERIC(8, 2) DEFAULT 0,
  available_hours_week NUMERIC(4, 1) DEFAULT 40,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'offboarded')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resources_user ON public.resources(user_id);

-- F2. Resource Allocations
CREATE TABLE IF NOT EXISTS public.resource_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  project_name TEXT NOT NULL,
  allocated_hours NUMERIC(6, 1) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  role_on_project TEXT,
  utilization_pct NUMERIC(5, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resource_allocations_user ON public.resource_allocations(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_resource ON public.resource_allocations(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_dates ON public.resource_allocations(start_date, end_date);

-- F3. Capacity Plans
CREATE TABLE IF NOT EXISTS public.capacity_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  ai_analysis JSONB DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_capacity_plans_user ON public.capacity_plans(user_id);

-- =============================================================================
-- G. REGULATORY INTELLIGENCE — UC2
-- =============================================================================

-- G1. Regulatory Sources
CREATE TABLE IF NOT EXISTS public.regulatory_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT,
  type TEXT NOT NULL DEFAULT 'website' CHECK (type IN ('website', 'rss', 'api', 'document', 'manual')),
  jurisdiction TEXT DEFAULT 'Jersey',
  sector TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  check_frequency TEXT DEFAULT 'daily' CHECK (check_frequency IN ('hourly', 'daily', 'weekly', 'manual')),
  last_checked_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reg_sources_user ON public.regulatory_sources(user_id);

-- G2. Regulatory Changes
CREATE TABLE IF NOT EXISTS public.regulatory_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  source_id UUID REFERENCES public.regulatory_sources(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  summary TEXT,
  body TEXT,
  change_type TEXT NOT NULL DEFAULT 'update' CHECK (change_type IN ('new_regulation', 'amendment', 'guidance', 'consultation', 'enforcement', 'update')),
  jurisdiction TEXT DEFAULT 'Jersey',
  sector TEXT[] DEFAULT '{}',
  effective_date DATE,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'assessed', 'implemented', 'dismissed')),
  ai_impact_summary TEXT,
  ai_action_items TEXT[] DEFAULT '{}',
  ai_risk_score INTEGER CHECK (ai_risk_score BETWEEN 0 AND 100),
  tags TEXT[] DEFAULT '{}',
  external_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reg_changes_user ON public.regulatory_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_reg_changes_status ON public.regulatory_changes(status);
CREATE INDEX IF NOT EXISTS idx_reg_changes_severity ON public.regulatory_changes(severity);

-- G3. Compliance Assessments
CREATE TABLE IF NOT EXISTS public.compliance_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  change_id UUID NOT NULL REFERENCES public.regulatory_changes(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL DEFAULT 'impact' CHECK (assessment_type IN ('impact', 'gap', 'action_plan')),
  current_compliance TEXT DEFAULT 'unknown' CHECK (current_compliance IN ('compliant', 'partial', 'non_compliant', 'unknown')),
  required_actions JSONB DEFAULT '[]',
  deadline DATE,
  assigned_to TEXT,
  ai_analysis JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_compliance_assessments_user ON public.compliance_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_change ON public.compliance_assessments(change_id);

-- =============================================================================
-- H. PROCUREMENT & CONTRACT RISK — UC4
-- =============================================================================

-- H1. Contracts
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  vendor TEXT NOT NULL,
  contract_type TEXT NOT NULL DEFAULT 'service' CHECK (contract_type IN ('service', 'license', 'maintenance', 'consulting', 'procurement', 'lease', 'other')),
  value NUMERIC(14, 2),
  currency TEXT DEFAULT 'GBP',
  start_date DATE,
  end_date DATE,
  renewal_date DATE,
  auto_renew BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'active', 'expiring', 'expired', 'terminated')),
  risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
  department TEXT,
  owner TEXT,
  document_url TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contracts_user ON public.contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_vendor ON public.contracts(vendor);

-- H2. Contract Clauses
CREATE TABLE IF NOT EXISTS public.contract_clauses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  clause_type TEXT NOT NULL DEFAULT 'general' CHECK (clause_type IN ('termination', 'liability', 'indemnity', 'sla', 'data_protection', 'ip', 'confidentiality', 'payment', 'force_majeure', 'general')),
  title TEXT NOT NULL,
  content TEXT,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  ai_assessment TEXT,
  ai_recommendation TEXT,
  flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contract_clauses_contract ON public.contract_clauses(contract_id);

-- H3. Procurement Reviews
CREATE TABLE IF NOT EXISTS public.procurement_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  review_type TEXT NOT NULL DEFAULT 'risk' CHECK (review_type IN ('risk', 'compliance', 'value', 'renewal')),
  overall_risk TEXT DEFAULT 'medium' CHECK (overall_risk IN ('low', 'medium', 'high', 'critical')),
  findings JSONB DEFAULT '[]',
  recommendations TEXT[] DEFAULT '{}',
  ai_summary TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'action_required')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_procurement_reviews_contract ON public.procurement_reviews(contract_id);

-- =============================================================================
-- I. KYC & CLIENT ONBOARDING — UC1
-- =============================================================================

-- I1. Clients
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL DEFAULT 'individual' CHECK (entity_type IN ('individual', 'corporate', 'trust', 'fund')),
  jurisdiction TEXT DEFAULT 'JE',
  email TEXT,
  phone TEXT,
  address JSONB DEFAULT '{}',
  risk_rating TEXT DEFAULT 'standard' CHECK (risk_rating IN ('low', 'standard', 'enhanced', 'high', 'pep')),
  overall_risk_score INTEGER CHECK (overall_risk_score >= 0 AND overall_risk_score <= 100),
  status TEXT NOT NULL DEFAULT 'prospect' CHECK (status IN ('prospect', 'onboarding', 'active', 'suspended', 'offboarded')),
  source_of_wealth TEXT,
  source_of_funds TEXT,
  industry TEXT,
  pep_status BOOLEAN DEFAULT false,
  sanctions_checked BOOLEAN DEFAULT false,
  adverse_media_checked BOOLEAN DEFAULT false,
  last_review_date TIMESTAMPTZ,
  next_review_date TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_user ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_risk ON public.clients(risk_rating);

-- I2. KYC Checks
CREATE TABLE IF NOT EXISTS public.kyc_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL CHECK (check_type IN ('identity', 'address', 'sanctions', 'pep', 'adverse_media', 'source_of_wealth', 'source_of_funds', 'ubo', 'enhanced_due_diligence')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'passed', 'failed', 'expired', 'needs_review')),
  result JSONB DEFAULT '{}',
  ai_assessment TEXT,
  ai_risk_flags TEXT[] DEFAULT '{}',
  ai_confidence NUMERIC(4,2),
  provider TEXT,
  reference_id TEXT,
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kyc_checks_client ON public.kyc_checks(client_id);
CREATE INDEX IF NOT EXISTS idx_kyc_checks_status ON public.kyc_checks(status);

-- I3. KYC Documents
CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('passport', 'national_id', 'driving_license', 'utility_bill', 'bank_statement', 'tax_return', 'incorporation_cert', 'shareholder_register', 'trust_deed', 'financial_statement', 'other')),
  file_name TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'expired')),
  ai_extracted_data JSONB DEFAULT '{}',
  ai_verification_result JSONB DEFAULT '{}',
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kyc_docs_client ON public.kyc_documents(client_id);

-- I4. Onboarding Workflows
CREATE TABLE IF NOT EXISTS public.onboarding_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  template TEXT DEFAULT 'standard',
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'blocked', 'completed', 'cancelled')),
  current_step INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 0,
  steps JSONB DEFAULT '[]',
  completion_pct NUMERIC(5,2) DEFAULT 0,
  ai_recommendations TEXT[] DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  deadline TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_client ON public.onboarding_workflows(client_id);

-- =============================================================================
-- J. FRAUD DETECTION & ANOMALY — UC3
-- =============================================================================

-- J1. Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  transaction_ref TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'payment' CHECK (type IN ('payment', 'transfer', 'withdrawal', 'deposit', 'refund', 'adjustment')),
  amount NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  source_account TEXT,
  destination_account TEXT,
  counterparty TEXT,
  country_code TEXT DEFAULT 'JE',
  channel TEXT DEFAULT 'online' CHECK (channel IN ('online', 'mobile', 'branch', 'atm', 'wire', 'api')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'reversed', 'flagged', 'blocked')),
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  flagged BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_txn_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_txn_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_txn_flagged ON public.transactions(flagged) WHERE flagged = true;
CREATE INDEX IF NOT EXISTS idx_txn_timestamp ON public.transactions(timestamp DESC);

-- J2. Fraud Alerts
CREATE TABLE IF NOT EXISTS public.fraud_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('anomaly', 'pattern', 'velocity', 'amount', 'geographic', 'behavioral', 'sanctions', 'rules_based')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'confirmed_fraud', 'false_positive', 'escalated', 'resolved')),
  title TEXT NOT NULL,
  description TEXT,
  ai_confidence NUMERIC(4,2),
  ai_reasoning TEXT,
  ai_recommended_action TEXT,
  indicators JSONB DEFAULT '[]',
  assigned_to TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alerts_user ON public.fraud_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.fraud_alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON public.fraud_alerts(severity);

-- J3. Fraud Patterns
CREATE TABLE IF NOT EXISTS public.fraud_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('velocity', 'amount', 'geographic', 'temporal', 'network', 'behavioral', 'custom')),
  description TEXT,
  detection_rules JSONB DEFAULT '{}',
  ai_generated BOOLEAN DEFAULT false,
  severity TEXT DEFAULT 'medium',
  is_active BOOLEAN DEFAULT true,
  matches_count INTEGER DEFAULT 0,
  false_positive_rate NUMERIC(5,2) DEFAULT 0,
  last_triggered TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patterns_user ON public.fraud_patterns(user_id);

-- J4. Fraud Investigations
CREATE TABLE IF NOT EXISTS public.fraud_investigations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  alert_id UUID REFERENCES public.fraud_alerts(id) ON DELETE SET NULL,
  case_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'pending_info', 'escalated', 'closed_fraud', 'closed_legitimate')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  title TEXT NOT NULL,
  summary TEXT,
  findings JSONB DEFAULT '[]',
  total_exposure NUMERIC(15,2) DEFAULT 0,
  ai_analysis TEXT,
  ai_risk_assessment JSONB DEFAULT '{}',
  assigned_to TEXT,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_investigations_user ON public.fraud_investigations(user_id);

-- =============================================================================
-- K. TRIGGERS
-- =============================================================================

-- Core table triggers (update_updated_at_column)
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

-- BI triggers (set_updated_at)
CREATE TRIGGER set_saved_queries_updated_at BEFORE UPDATE ON public.saved_queries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_query_viz_updated_at BEFORE UPDATE ON public.query_visualizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Project triggers
CREATE TRIGGER set_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_project_tasks_updated_at BEFORE UPDATE ON public.project_tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_project_risks_updated_at BEFORE UPDATE ON public.project_risks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Resource triggers
CREATE TRIGGER set_resources_updated_at BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_resource_allocations_updated_at BEFORE UPDATE ON public.resource_allocations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_capacity_plans_updated_at BEFORE UPDATE ON public.capacity_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Regulatory triggers
CREATE TRIGGER set_reg_sources_updated_at BEFORE UPDATE ON public.regulatory_sources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_reg_changes_updated_at BEFORE UPDATE ON public.regulatory_changes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_comp_assessments_updated_at BEFORE UPDATE ON public.compliance_assessments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Procurement triggers
CREATE TRIGGER set_contracts_updated_at BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_procurement_reviews_updated_at BEFORE UPDATE ON public.procurement_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- KYC triggers
CREATE TRIGGER set_clients_updated BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_kyc_checks_updated BEFORE UPDATE ON public.kyc_checks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_kyc_docs_updated BEFORE UPDATE ON public.kyc_documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_onboarding_updated BEFORE UPDATE ON public.onboarding_workflows
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Fraud triggers
CREATE TRIGGER set_txn_updated BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_alerts_updated BEFORE UPDATE ON public.fraud_alerts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_patterns_updated BEFORE UPDATE ON public.fraud_patterns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_investigations_updated BEFORE UPDATE ON public.fraud_investigations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- K2. HELPER FUNCTIONS
-- =============================================================================

-- Auto-create user profile on Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, auth_provider)
  VALUES (
    NEW.id, NEW.email,
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
  year TEXT; month TEXT; sequence INT;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');
  month := TO_CHAR(NOW(), 'MM');
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 9) AS INTEGER)), 0) + 1
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

-- Get daily usage
CREATE OR REPLACE FUNCTION public.get_daily_usage(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (total_tokens BIGINT, total_cost DECIMAL, request_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT COALESCE(SUM(input_tokens + output_tokens), 0)::BIGINT,
         COALESCE(SUM(cost_cents), 0)::DECIMAL,
         COUNT(*)::BIGINT
  FROM public.usage_records WHERE user_id = p_user_id AND timestamp::DATE = p_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get monthly usage
CREATE OR REPLACE FUNCTION public.get_monthly_usage(
  p_user_id UUID,
  p_year INT DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INT,
  p_month INT DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)::INT
)
RETURNS TABLE (total_tokens BIGINT, total_cost DECIMAL, request_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT COALESCE(SUM(input_tokens + output_tokens), 0)::BIGINT,
         COALESCE(SUM(cost_cents), 0)::DECIMAL,
         COUNT(*)::BIGINT
  FROM public.usage_records
  WHERE user_id = p_user_id
    AND EXTRACT(YEAR FROM timestamp) = p_year
    AND EXTRACT(MONTH FROM timestamp) = p_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get active subscription
CREATE OR REPLACE FUNCTION public.get_active_subscription(p_user_id UUID)
RETURNS TABLE (id UUID, plan_type TEXT, status TEXT, current_period_end TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.plan_type, s.status, s.current_period_end
  FROM public.subscriptions s
  WHERE s.user_id = p_user_id AND s.status = 'active'
  ORDER BY s.current_period_end DESC LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check valid license
CREATE OR REPLACE FUNCTION public.has_valid_license(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE v_sub RECORD;
BEGIN
  SELECT * INTO v_sub FROM public.subscriptions
  WHERE user_id = p_user_id AND status = 'active' AND current_period_end > NOW() LIMIT 1;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Current-period usage for billing
CREATE OR REPLACE FUNCTION public.get_current_period_usage(p_user_id UUID)
RETURNS TABLE (total_queries BIGINT, total_tokens BIGINT, total_cost DECIMAL) AS $$
DECLARE period_start TIMESTAMPTZ;
BEGIN
  SELECT current_period_start INTO period_start
  FROM public.subscriptions WHERE user_id = p_user_id AND status = 'active'
  ORDER BY current_period_end DESC LIMIT 1;
  IF period_start IS NULL THEN period_start := DATE_TRUNC('month', NOW()); END IF;
  RETURN QUERY
  SELECT COUNT(CASE WHEN usage_type = 'query' THEN 1 END)::BIGINT,
         COALESCE(SUM(CASE WHEN usage_type = 'tokens' THEN amount ELSE 0 END), 0)::BIGINT,
         COALESCE(SUM(cost), 0)::DECIMAL
  FROM public.usage_logs WHERE user_id = p_user_id AND timestamp >= period_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check plan limits
CREATE OR REPLACE FUNCTION public.check_plan_limits(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE v_plan TEXT; v_usage RECORD; v_limits JSONB;
BEGIN
  SELECT plan_type INTO v_plan FROM public.subscriptions
  WHERE user_id = p_user_id AND status = 'active' ORDER BY current_period_end DESC LIMIT 1;
  IF v_plan IS NULL THEN v_plan := 'starter'; END IF;
  SELECT * INTO v_usage FROM public.get_current_period_usage(p_user_id);
  v_limits := CASE v_plan
    WHEN 'starter' THEN '{"tokens":1000000,"queries_per_day":50}'::jsonb
    WHEN 'professional' THEN '{"tokens":10000000,"queries_per_day":500}'::jsonb
    WHEN 'enterprise' THEN '{"tokens":100000000,"queries_per_day":9999}'::jsonb
    ELSE '{"tokens":999999999,"queries_per_day":99999}'::jsonb END;
  RETURN jsonb_build_object('plan_type', v_plan,
    'usage', jsonb_build_object('queries', v_usage.total_queries, 'tokens', v_usage.total_tokens, 'cost', v_usage.total_cost),
    'limits', v_limits,
    'exceeded', v_usage.total_tokens > (v_limits->>'tokens')::bigint);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user providers
CREATE OR REPLACE FUNCTION public.get_user_providers(p_user_id UUID)
RETURNS TABLE (provider TEXT, key_name TEXT, is_valid BOOLEAN, last_used_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY SELECT upk.provider, upk.key_name, upk.is_valid, upk.last_used_at
  FROM public.user_provider_keys upk WHERE upk.user_id = p_user_id AND upk.is_active = TRUE
  ORDER BY upk.last_used_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user connections
CREATE OR REPLACE FUNCTION public.get_user_connections(p_user_id UUID)
RETURNS TABLE (id UUID, name TEXT, connection_type TEXT, is_connected BOOLEAN, last_connected_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY SELECT uc.id, uc.name, uc.connection_type, uc.is_connected, uc.last_connected_at
  FROM public.user_connections uc WHERE uc.user_id = p_user_id AND uc.is_active = TRUE
  ORDER BY uc.last_connected_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update provider key usage stats
CREATE OR REPLACE FUNCTION public.update_provider_key_usage(p_key_id UUID, p_tokens INT, p_cost_cents DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_provider_keys
  SET total_requests = total_requests + 1, total_tokens = total_tokens + p_tokens,
      total_cost_cents = total_cost_cents + p_cost_cents, last_used_at = NOW()
  WHERE id = p_key_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get payment history
CREATE OR REPLACE FUNCTION public.get_payment_history(p_user_id UUID)
RETURNS TABLE (payment_id UUID, amount DECIMAL, currency TEXT, status TEXT, paid_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY SELECT p.id, p.amount, p.currency, p.status, p.paid_at
  FROM public.payments p WHERE p.user_id = p_user_id ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- K3. ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Core tables
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
ALTER TABLE public.auth_tokens ENABLE ROW LEVEL SECURITY;

-- Use-case tables
ALTER TABLE public.saved_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_visualizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capacity_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_investigations ENABLE ROW LEVEL SECURITY;

-- ── Core RLS Policies ──

CREATE POLICY "Service role full access on users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own licenses" ON public.licenses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own device activations" ON public.license_activations
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.licenses WHERE licenses.id = license_activations.license_id AND licenses.user_id = auth.uid()));

CREATE POLICY "Users can view own payment sessions" ON public.payment_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own payment sessions" ON public.payment_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own invoices" ON public.invoices FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own usage records" ON public.usage_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can insert usage records" ON public.usage_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own usage logs" ON public.usage_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage logs" ON public.usage_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own API keys" ON public.api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own API keys" ON public.api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own API keys" ON public.api_keys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own API keys" ON public.api_keys FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own provider keys" ON public.user_provider_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own provider keys" ON public.user_provider_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own provider keys" ON public.user_provider_keys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own provider keys" ON public.user_provider_keys FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own connections" ON public.user_connections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own chat sessions" ON public.chat_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own chat messages" ON public.chat_messages
  FOR ALL USING (session_id IN (SELECT cs.id FROM public.chat_sessions cs WHERE cs.user_id = auth.uid()));
CREATE POLICY "Team owners can view their team" ON public.team_members FOR SELECT USING (auth.uid() = team_owner_id OR auth.uid() = user_id);
CREATE POLICY "Team owners can manage their team" ON public.team_members FOR ALL USING (auth.uid() = team_owner_id);

CREATE POLICY "Service role manages auth tokens" ON public.auth_tokens FOR ALL USING (true) WITH CHECK (true);

-- ── BI RLS Policies ──
CREATE POLICY "saved_queries_user_policy" ON public.saved_queries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "query_history_user_policy" ON public.query_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "query_viz_user_policy" ON public.query_visualizations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "saved_queries_service" ON public.saved_queries FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "query_history_service" ON public.query_history FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "query_viz_service" ON public.query_visualizations FOR ALL USING (auth.role() = 'service_role');

-- ── Project RLS Policies ──
CREATE POLICY "projects_owner" ON public.projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "project_tasks_owner" ON public.project_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "project_risks_owner" ON public.project_risks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "project_insights_owner" ON public.project_insights FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "projects_service" ON public.projects FOR ALL TO service_role USING (true);
CREATE POLICY "project_tasks_service" ON public.project_tasks FOR ALL TO service_role USING (true);
CREATE POLICY "project_risks_service" ON public.project_risks FOR ALL TO service_role USING (true);
CREATE POLICY "project_insights_service" ON public.project_insights FOR ALL TO service_role USING (true);

-- ── Resource RLS Policies ──
CREATE POLICY "resources_owner" ON public.resources FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "resource_allocations_owner" ON public.resource_allocations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "capacity_plans_owner" ON public.capacity_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "resources_service" ON public.resources FOR ALL TO service_role USING (true);
CREATE POLICY "resource_allocations_service" ON public.resource_allocations FOR ALL TO service_role USING (true);
CREATE POLICY "capacity_plans_service" ON public.capacity_plans FOR ALL TO service_role USING (true);

-- ── Regulatory RLS Policies ──
CREATE POLICY "reg_sources_owner" ON public.regulatory_sources FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "reg_changes_owner" ON public.regulatory_changes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "comp_assessments_owner" ON public.compliance_assessments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "reg_sources_service" ON public.regulatory_sources FOR ALL TO service_role USING (true);
CREATE POLICY "reg_changes_service" ON public.regulatory_changes FOR ALL TO service_role USING (true);
CREATE POLICY "comp_assessments_service" ON public.compliance_assessments FOR ALL TO service_role USING (true);

-- ── Procurement RLS Policies ──
CREATE POLICY "contracts_owner" ON public.contracts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "contract_clauses_owner" ON public.contract_clauses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "procurement_reviews_owner" ON public.procurement_reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "contracts_service" ON public.contracts FOR ALL TO service_role USING (true);
CREATE POLICY "contract_clauses_service" ON public.contract_clauses FOR ALL TO service_role USING (true);
CREATE POLICY "procurement_reviews_service" ON public.procurement_reviews FOR ALL TO service_role USING (true);

-- ── KYC RLS Policies ──
CREATE POLICY "clients_user" ON public.clients FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "kyc_checks_user" ON public.kyc_checks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "kyc_docs_user" ON public.kyc_documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "onboarding_user" ON public.onboarding_workflows FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "clients_service" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "kyc_checks_service" ON public.kyc_checks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "kyc_docs_service" ON public.kyc_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "onboarding_service" ON public.onboarding_workflows FOR ALL USING (true) WITH CHECK (true);

-- ── Fraud RLS Policies ──
CREATE POLICY "txn_user" ON public.transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "alerts_user" ON public.fraud_alerts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "patterns_user" ON public.fraud_patterns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "investigations_user" ON public.fraud_investigations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "txn_service" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "alerts_service" ON public.fraud_alerts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "patterns_service" ON public.fraud_patterns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "investigations_service" ON public.fraud_investigations FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- L. GRANTS & COMMENTS
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

-- Table Comments
COMMENT ON TABLE public.users IS 'User profiles — Supabase Auth, NextAuth, email/password';
COMMENT ON COLUMN public.users.password_hash IS 'bcrypt hash for email/password auth';
COMMENT ON COLUMN public.users.email_verified IS 'Email verification status';
COMMENT ON TABLE public.subscriptions IS 'User subscription records';
COMMENT ON TABLE public.licenses IS 'Desktop app license keys';
COMMENT ON TABLE public.license_activations IS 'Device activations for licenses';
COMMENT ON TABLE public.payment_sessions IS 'Payment checkout sessions';
COMMENT ON TABLE public.usage_logs IS 'Usage tracking for billing';
COMMENT ON TABLE public.usage_records IS 'Detailed per-request usage records';
COMMENT ON TABLE public.team_members IS 'Team member management';
COMMENT ON TABLE public.invoices IS 'Invoice records';
COMMENT ON TABLE public.user_provider_keys IS 'User BYOK AI provider API keys (encrypted)';
COMMENT ON TABLE public.user_connections IS 'User database connection configs (encrypted)';
COMMENT ON TABLE public.chat_sessions IS 'Desktop app chat session sync';
COMMENT ON TABLE public.chat_messages IS 'Desktop app chat message sync';
COMMENT ON TABLE public.audit_log IS 'Admin audit trail — no RLS, service_role only';
COMMENT ON TABLE public.auth_tokens IS 'Tokens for email verification and password reset';
COMMENT ON TABLE public.saved_queries IS 'BI: User saved NL→SQL queries';
COMMENT ON TABLE public.query_history IS 'BI: Query execution history';
COMMENT ON TABLE public.query_visualizations IS 'BI: Saved chart configurations';
COMMENT ON TABLE public.projects IS 'Project Intelligence: Projects';
COMMENT ON TABLE public.project_tasks IS 'Project Intelligence: Tasks';
COMMENT ON TABLE public.project_risks IS 'Project Intelligence: Risks';
COMMENT ON TABLE public.project_insights IS 'Project Intelligence: AI-generated insights';
COMMENT ON TABLE public.resources IS 'Resource Planning: Team resources';
COMMENT ON TABLE public.resource_allocations IS 'Resource Planning: Allocations';
COMMENT ON TABLE public.capacity_plans IS 'Resource Planning: Capacity plans';
COMMENT ON TABLE public.regulatory_sources IS 'Regulatory: Monitored sources';
COMMENT ON TABLE public.regulatory_changes IS 'Regulatory: Change tracker';
COMMENT ON TABLE public.compliance_assessments IS 'Regulatory: Compliance assessments';
COMMENT ON TABLE public.contracts IS 'Procurement: Contract records';
COMMENT ON TABLE public.contract_clauses IS 'Procurement: Contract clauses';
COMMENT ON TABLE public.procurement_reviews IS 'Procurement: AI-powered reviews';
COMMENT ON TABLE public.clients IS 'KYC: Client records';
COMMENT ON TABLE public.kyc_checks IS 'KYC: Due-diligence checks';
COMMENT ON TABLE public.kyc_documents IS 'KYC: Uploaded documents';
COMMENT ON TABLE public.onboarding_workflows IS 'KYC: Onboarding workflows';
COMMENT ON TABLE public.transactions IS 'Fraud: Transaction records';
COMMENT ON TABLE public.fraud_alerts IS 'Fraud: AI-generated alerts';
COMMENT ON TABLE public.fraud_patterns IS 'Fraud: Detection patterns';
COMMENT ON TABLE public.fraud_investigations IS 'Fraud: Investigation cases';

-- =============================================================================
-- DONE
-- =============================================================================
DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE '  Velanova AI Adoption & Governance Engine';
  RAISE NOTICE '  Complete schema created successfully!';
  RAISE NOTICE '  41 tables + 1 view + functions + RLS + triggers';
  RAISE NOTICE '============================================================';
END $$;
