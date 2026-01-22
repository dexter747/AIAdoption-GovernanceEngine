-- AI Nexus Production Database Schema v2 - SAFE VERSION
-- This script intelligently checks what exists and only adds what's missing
-- Safe to run multiple times

-- ===========================================
-- USAGE RECORDS TABLE
-- ===========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_schema = 'public' AND table_name = 'usage_records') THEN
        CREATE TABLE public.usage_records (
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
        
        CREATE INDEX idx_usage_records_user_id ON public.usage_records(user_id);
        CREATE INDEX idx_usage_records_timestamp ON public.usage_records(timestamp);
        CREATE INDEX idx_usage_records_provider ON public.usage_records(provider);
        
        ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own usage" ON public.usage_records
            FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Service role can insert usage" ON public.usage_records
            FOR INSERT WITH CHECK (TRUE);
    END IF;
END $$;

-- ===========================================
-- API KEYS TABLE
-- ===========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_schema = 'public' AND table_name = 'api_keys') THEN
        CREATE TABLE public.api_keys (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            key_hash TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'starter', 'pro', 'enterprise')),
            is_active BOOLEAN DEFAULT TRUE,
            rate_limit INT DEFAULT 100,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            last_used TIMESTAMPTZ,
            expires_at TIMESTAMPTZ
        );
        
        CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
        CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);
        
        ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own API keys" ON public.api_keys
            FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert own API keys" ON public.api_keys
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update own API keys" ON public.api_keys
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- ===========================================
-- CHAT SESSIONS TABLE
-- ===========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_schema = 'public' AND table_name = 'chat_sessions') THEN
        CREATE TABLE public.chat_sessions (
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
        
        CREATE INDEX idx_chat_sessions_user_id ON public.chat_sessions(user_id);
        
        ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can manage own sessions" ON public.chat_sessions
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- ===========================================
-- CHAT MESSAGES TABLE
-- ===========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_schema = 'public' AND table_name = 'chat_messages') THEN
        CREATE TABLE public.chat_messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
            role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant')),
            content TEXT NOT NULL,
            tokens_used INT DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            metadata JSONB DEFAULT '{}'::JSONB
        );
        
        CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);
        
        ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can manage own messages" ON public.chat_messages
            FOR ALL USING (
                session_id IN (SELECT id FROM public.chat_sessions WHERE user_id = auth.uid())
            );
    END IF;
END $$;

-- ===========================================
-- AUDIT LOG TABLE
-- ===========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_schema = 'public' AND table_name = 'audit_log') THEN
        CREATE TABLE public.audit_log (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            actor_id UUID REFERENCES auth.users(id),
            action TEXT NOT NULL,
            resource_type TEXT NOT NULL,
            resource_id TEXT,
            details JSONB DEFAULT '{}'::JSONB,
            ip_address INET,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX idx_audit_log_actor_id ON public.audit_log(actor_id);
        CREATE INDEX idx_audit_log_action ON public.audit_log(action);
        CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at);
    END IF;
END $$;

-- ===========================================
-- UPDATE EXISTING TABLES
-- ===========================================

-- Add columns to licenses table if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'licenses') THEN
        
        -- Add key_hash column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' 
                       AND table_name = 'licenses' 
                       AND column_name = 'key_hash') THEN
            ALTER TABLE public.licenses ADD COLUMN key_hash TEXT;
        END IF;

        -- Add tier column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' 
                       AND table_name = 'licenses' 
                       AND column_name = 'tier') THEN
            ALTER TABLE public.licenses ADD COLUMN tier TEXT DEFAULT 'pro';
        END IF;

        -- Add max_machines column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' 
                       AND table_name = 'licenses' 
                       AND column_name = 'max_machines') THEN
            ALTER TABLE public.licenses ADD COLUMN max_machines INT DEFAULT 1;
        END IF;

        -- Add is_active column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' 
                       AND table_name = 'licenses' 
                       AND column_name = 'is_active') THEN
            ALTER TABLE public.licenses ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        END IF;
    END IF;
END $$;

-- Add index on licenses.key_hash if column exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'licenses' 
               AND column_name = 'key_hash') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                       WHERE schemaname = 'public' 
                       AND tablename = 'licenses' 
                       AND indexname = 'idx_licenses_key_hash') THEN
            CREATE INDEX idx_licenses_key_hash ON public.licenses(key_hash);
        END IF;
    END IF;
END $$;

-- Add is_active to device_activations if table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'device_activations') THEN
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' 
                       AND table_name = 'device_activations' 
                       AND column_name = 'is_active') THEN
            ALTER TABLE public.device_activations ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        END IF;
    END IF;
END $$;

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
    -- Check if usage_records table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'usage_records') THEN
        RETURN QUERY
        SELECT 
            COALESCE(SUM(input_tokens + output_tokens), 0)::BIGINT,
            COALESCE(SUM(cost_cents), 0)::DECIMAL,
            COUNT(*)::BIGINT
        FROM public.usage_records
        WHERE user_id = p_user_id
        AND timestamp::DATE = p_date;
    ELSE
        -- Return zeros if table doesn't exist
        RETURN QUERY SELECT 0::BIGINT, 0::DECIMAL, 0::BIGINT;
    END IF;
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
    -- Check if usage_records table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'usage_records') THEN
        RETURN QUERY
        SELECT 
            COALESCE(SUM(input_tokens + output_tokens), 0)::BIGINT,
            COALESCE(SUM(cost_cents), 0)::DECIMAL,
            COUNT(*)::BIGINT
        FROM public.usage_records
        WHERE user_id = p_user_id
        AND EXTRACT(YEAR FROM timestamp) = p_year
        AND EXTRACT(MONTH FROM timestamp) = p_month;
    ELSE
        -- Return zeros if table doesn't exist
        RETURN QUERY SELECT 0::BIGINT, 0::DECIMAL, 0::BIGINT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to chat_sessions if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'chat_sessions') THEN
        
        -- Drop trigger if exists
        DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON public.chat_sessions;
        
        -- Create trigger
        CREATE TRIGGER update_chat_sessions_updated_at
            BEFORE UPDATE ON public.chat_sessions
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
    END IF;
END $$;

-- ===========================================
-- GRANT PERMISSIONS
-- ===========================================
GRANT EXECUTE ON FUNCTION public.get_daily_usage TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_monthly_usage TO authenticated;

-- ===========================================
-- VERIFICATION
-- ===========================================

-- Show what was created
SELECT 'Schema v2 migration complete!' as status;

-- Show all tables
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns 
        WHERE table_schema = 'public' AND columns.table_name = tables.table_name) as column_count
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
