-- AI Nexus Schema v4 - Payments & Subscriptions
-- Run this after schema-v3-byok.sql

-- ===========================================
-- PAYMENT SESSIONS (Checkout tracking)
-- ===========================================

CREATE TABLE IF NOT EXISTS public.payment_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Dodo Payments session
    session_id TEXT UNIQUE NOT NULL,
    customer_id TEXT,
    
    -- Plan details
    plan_type TEXT NOT NULL CHECK (plan_type IN ('trial', 'professional', 'team', 'enterprise')),
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'canceled')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX idx_payment_sessions_user_id ON public.payment_sessions(user_id);
CREATE INDEX idx_payment_sessions_session_id ON public.payment_sessions(session_id);

-- ===========================================
-- SUBSCRIPTIONS
-- ===========================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Payment provider
    provider TEXT DEFAULT 'dodo' CHECK (provider = 'dodo'),
    subscription_id TEXT UNIQUE NOT NULL,
    customer_id TEXT NOT NULL,
    
    -- Plan details
    plan_type TEXT NOT NULL CHECK (plan_type IN ('trial', 'professional', 'team', 'enterprise')),
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'unpaid')),
    
    -- Billing period
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_subscription_id ON public.subscriptions(subscription_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- Trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===========================================
-- PAYMENTS (Invoice tracking)
-- ===========================================

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Payment details
    provider TEXT DEFAULT 'dodo' CHECK (provider = 'dodo'),
    invoice_id TEXT UNIQUE NOT NULL,
    payment_intent_id TEXT,
    
    -- Amount
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'usd',
    
    -- Status
    status TEXT NOT NULL CHECK (status IN ('succeeded', 'failed', 'pending', 'refunded')),
    
    -- Timestamps
    paid_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_subscription_id ON public.payments(subscription_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- ===========================================
-- LICENSES (Derived from subscriptions)
-- ===========================================

-- Update existing licenses table to link with subscriptions
ALTER TABLE IF EXISTS public.licenses 
    ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES public.subscriptions(id);

CREATE INDEX IF NOT EXISTS idx_licenses_subscription_id ON public.licenses(subscription_id);

-- ===========================================
-- RLS POLICIES
-- ===========================================

ALTER TABLE public.payment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment sessions
CREATE POLICY "Users can view own payment sessions" ON public.payment_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own payments
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

-- ===========================================
-- HELPER FUNCTIONS
-- ===========================================

-- Get active subscription for user
CREATE OR REPLACE FUNCTION public.get_active_subscription(p_user_id UUID)
RETURNS TABLE (
    subscription_id UUID,
    plan_type TEXT,
    status TEXT,
    current_period_end TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.plan_type,
        s.status,
        s.current_period_end
    FROM public.subscriptions s
    WHERE s.user_id = p_user_id
    AND s.status = 'active'
    ORDER BY s.created_at DESC
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

-- Get payment history for user
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
    SELECT 
        p.id,
        p.amount,
        p.currency,
        p.status,
        p.paid_at
    FROM public.payments p
    WHERE p.user_id = p_user_id
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- GRANT PERMISSIONS
-- ===========================================

GRANT EXECUTE ON FUNCTION public.get_active_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_valid_license TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_payment_history TO authenticated;

-- ===========================================
-- DONE
-- ===========================================
