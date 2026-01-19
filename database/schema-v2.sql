-- AI Nexus Production Database Schema v2
-- Run this in Supabase SQL Editor
-- This schema adds usage tracking, API keys, and chat history

-- ===========================================
-- USAGE RECORDS
-- ===========================================
CREATE TABLE IF NOT EXISTS public.usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    input_tokens INT DEFAULT 0,
    output_tokens INT DEFAULT 0,
    cost_cents DECIMAL(10, 4) DEFAULT 0,
    duration_ms INT DEFAULT 0,
    request_type TEXT DEFAULT 'chat' CHECK (request_type IN ('chat', 'embeddings', 'images', 'audio')),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::JSONB
);

CREATE INDEX IF NOT EXISTS idx_usage_records_user_id ON public.usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_timestamp ON public.usage_records(timestamp);
CREATE INDEX IF NOT EXISTS idx_usage_records_provider ON public.usage_records(provider);

-- Enable RLS
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own usage" ON public.usage_records;
CREATE POLICY "Users can view own usage" ON public.usage_records
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert usage" ON public.usage_records;
CREATE POLICY "Service role can insert usage" ON public.usage_records
    FOR INSERT WITH CHECK (TRUE);

-- ===========================================
-- API KEYS
-- ===========================================
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    key_hash TEXT UNIQUE NOT NULL, -- SHA256 hash of API key
    name TEXT NOT NULL,
    tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'starter', 'pro', 'enterprise')),
    is_active BOOLEAN DEFAULT TRUE,
    rate_limit INT DEFAULT 100, -- Requests per minute
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own API keys" ON public.api_keys;
CREATE POLICY "Users can view own API keys" ON public.api_keys
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own API keys" ON public.api_keys;
CREATE POLICY "Users can insert own API keys" ON public.api_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own API keys" ON public.api_keys;
CREATE POLICY "Users can update own API keys" ON public.api_keys
    FOR UPDATE USING (auth.uid() = user_id);

-- ===========================================
-- CHAT SESSIONS (for Desktop App sync)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Chat',
    provider TEXT,
    model TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_archived BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::JSONB
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own sessions" ON public.chat_sessions;
CREATE POLICY "Users can manage own sessions" ON public.chat_sessions
    FOR ALL USING (auth.uid() = user_id);

-- ===========================================
-- CHAT MESSAGES
-- ===========================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant')),
    content TEXT NOT NULL,
    tokens_used INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::JSONB
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own messages" ON public.chat_messages;
CREATE POLICY "Users can manage own messages" ON public.chat_messages
    FOR ALL USING (
        session_id IN (SELECT id FROM public.chat_sessions WHERE user_id = auth.uid())
    );

-- ===========================================
-- AUDIT LOG (Admin only)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB DEFAULT '{}'::JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_actor_id ON public.audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);

-- No RLS - admin only via service role

-- ===========================================
-- UPDATE LICENSE TABLE (add key_hash)
-- ===========================================
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS key_hash TEXT;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'pro';
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS max_machines INT DEFAULT 1;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create index on key_hash
CREATE INDEX IF NOT EXISTS idx_licenses_key_hash ON public.licenses(key_hash);

-- ===========================================
-- LICENSE ACTIVATIONS (rename from device_activations)
-- ===========================================
-- Keep existing device_activations table, add is_active column
ALTER TABLE public.device_activations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- ===========================================
-- HELPER FUNCTIONS
-- ===========================================

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
CREATE OR REPLACE FUNCTION public.get_monthly_usage(p_user_id UUID, p_year INT DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INT, p_month INT DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)::INT)
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

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to chat_sessions
DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON public.chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===========================================
-- GRANT PERMISSIONS
-- ===========================================
GRANT EXECUTE ON FUNCTION public.get_daily_usage TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_monthly_usage TO authenticated;

-- ===========================================
-- DONE
-- ===========================================
-- Run this in Supabase SQL Editor to add production tables
