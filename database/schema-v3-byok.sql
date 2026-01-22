-- AI Nexus Schema v3 - User Provider Keys (BYOK)
-- Run this in Supabase SQL Editor AFTER schema.sql and schema-v2.sql

-- ===========================================
-- USER PROVIDER KEYS (BYOK - Bring Your Own Key)
-- ===========================================
-- This table stores user's own AI provider API keys
-- Keys are encrypted before storage

CREATE TABLE IF NOT EXISTS public.user_provider_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Provider identification
    provider TEXT NOT NULL CHECK (provider IN (
        'openai', 'anthropic', 'google', 'groq', 'cohere', 
        'mistral', 'perplexity', 'deepseek', 'together', 
        'replicate', 'huggingface', 'openrouter', 
        'azure_openai', 'aws_bedrock', 'ollama'
    )),
    
    -- Key storage (encrypted)
    key_name TEXT NOT NULL DEFAULT 'Default Key',
    encrypted_key TEXT NOT NULL,  -- AES-256-GCM encrypted
    key_preview TEXT,             -- Last 4 chars for display: "...abc1"
    
    -- Provider-specific config (JSON)
    -- For Azure: { "endpoint": "https://xxx.openai.azure.com", "deployment": "gpt-4" }
    -- For AWS: { "region": "us-east-1" }
    -- For Ollama: { "base_url": "http://localhost:11434" }
    config JSONB DEFAULT '{}',
    
    -- Status tracking
    is_active BOOLEAN DEFAULT TRUE,
    is_valid BOOLEAN DEFAULT TRUE,      -- Set to false if key fails validation
    last_used_at TIMESTAMPTZ,
    last_validated_at TIMESTAMPTZ,
    validation_error TEXT,               -- Store last error message
    
    -- Usage tracking
    total_requests INT DEFAULT 0,
    total_tokens INT DEFAULT 0,
    total_cost_cents DECIMAL(10, 4) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint: one active key per provider per user
    CONSTRAINT unique_user_provider UNIQUE (user_id, provider, key_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_provider_keys_user_id ON public.user_provider_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_provider_keys_provider ON public.user_provider_keys(provider);
CREATE INDEX IF NOT EXISTS idx_user_provider_keys_active ON public.user_provider_keys(user_id, is_active) WHERE is_active = TRUE;

-- Enable RLS
ALTER TABLE public.user_provider_keys ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own keys
DROP POLICY IF EXISTS "Users can view own provider keys" ON public.user_provider_keys;
CREATE POLICY "Users can view own provider keys" ON public.user_provider_keys
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own provider keys" ON public.user_provider_keys;
CREATE POLICY "Users can insert own provider keys" ON public.user_provider_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own provider keys" ON public.user_provider_keys;
CREATE POLICY "Users can update own provider keys" ON public.user_provider_keys
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own provider keys" ON public.user_provider_keys;
CREATE POLICY "Users can delete own provider keys" ON public.user_provider_keys
    FOR DELETE USING (auth.uid() = user_id);

-- ===========================================
-- USER DATABASE CONNECTIONS
-- ===========================================
-- Stores user's database connection configurations

CREATE TABLE IF NOT EXISTS public.user_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Connection identification
    name TEXT NOT NULL,
    connection_type TEXT NOT NULL CHECK (connection_type IN (
        'postgresql', 'mysql', 'mongodb', 'sqlserver', 'oracle',
        'sap_hana', 'mariadb', 'sqlite', 'redis', 'elasticsearch',
        'salesforce', 'servicenow', 'jira', 'zendesk', 'workday'
    )),
    
    -- Connection details (encrypted)
    encrypted_config TEXT NOT NULL,  -- AES-256-GCM encrypted JSON
    -- Contains: host, port, database, username, password, ssl, etc.
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_connected BOOLEAN DEFAULT FALSE,
    last_connected_at TIMESTAMPTZ,
    last_error TEXT,
    
    -- MCP server info
    mcp_server_type TEXT CHECK (mcp_server_type IN ('npm', 'docker', 'custom')),
    mcp_process_id INT,  -- PID when running
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_user_connection_name UNIQUE (user_id, name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_connections_user_id ON public.user_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_type ON public.user_connections(connection_type);

-- Enable RLS
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can manage own connections" ON public.user_connections;
CREATE POLICY "Users can manage own connections" ON public.user_connections
    FOR ALL USING (auth.uid() = user_id);

-- ===========================================
-- HELPER FUNCTION FOR TIMESTAMPS
-- ===========================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- UPDATE TRIGGERS
-- ===========================================

-- Update updated_at on user_provider_keys
DROP TRIGGER IF EXISTS update_user_provider_keys_updated_at ON public.user_provider_keys;
CREATE TRIGGER update_user_provider_keys_updated_at
    BEFORE UPDATE ON public.user_provider_keys
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Update updated_at on user_connections
DROP TRIGGER IF EXISTS update_user_connections_updated_at ON public.user_connections;
CREATE TRIGGER update_user_connections_updated_at
    BEFORE UPDATE ON public.user_connections
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===========================================
-- HELPER FUNCTIONS
-- ===========================================

-- Get user's active provider keys (for dropdown)
CREATE OR REPLACE FUNCTION public.get_user_providers(p_user_id UUID)
RETURNS TABLE (
    provider TEXT,
    key_name TEXT,
    is_valid BOOLEAN,
    last_used_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        upk.provider,
        upk.key_name,
        upk.is_valid,
        upk.last_used_at
    FROM public.user_provider_keys upk
    WHERE upk.user_id = p_user_id
    AND upk.is_active = TRUE
    ORDER BY upk.last_used_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's active connections (for dropdown)
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
    SELECT 
        uc.id,
        uc.name,
        uc.connection_type,
        uc.is_connected,
        uc.last_connected_at
    FROM public.user_connections uc
    WHERE uc.user_id = p_user_id
    AND uc.is_active = TRUE
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

-- ===========================================
-- GRANT PERMISSIONS
-- ===========================================
GRANT EXECUTE ON FUNCTION public.get_user_providers TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_connections TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_provider_key_usage TO authenticated;

-- ===========================================
-- DONE
-- ===========================================
-- Run this after schema.sql and schema-v2.sql
