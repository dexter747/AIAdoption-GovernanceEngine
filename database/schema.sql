-- AI Nexus Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'professional', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Licenses table
CREATE TABLE public.licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  license_key TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('professional', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'expired', 'cancelled')),
  device_limit INTEGER DEFAULT 1,
  devices_activated INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  last_validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Device activations
CREATE TABLE public.device_activations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  license_id UUID NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_name TEXT,
  device_os TEXT,
  ip_address TEXT,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(license_id, device_id)
);

-- Subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('professional', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'unpaid')),
  payment_provider TEXT CHECK (payment_provider IN ('dodo', 'paypal', 'razorpay')),
  subscription_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  payment_provider TEXT NOT NULL CHECK (payment_provider IN ('dodo', 'paypal', 'razorpay')),
  provider_payment_id TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking (for desktop app)
CREATE TABLE public.usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  license_id UUID REFERENCES public.licenses(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('ai_query', 'database_connection', 'login', 'logout')),
  provider TEXT, -- AI provider (openai, anthropic, etc.)
  model TEXT, -- AI model used
  tokens_used INTEGER,
  cost DECIMAL(10,4),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API keys (for desktop app)
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google', 'cohere', 'mistral', 'groq', 'perplexity')),
  encrypted_key TEXT NOT NULL,
  key_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_licenses_user_id ON public.licenses(user_id);
CREATE INDEX idx_licenses_status ON public.licenses(status);
CREATE INDEX idx_device_activations_license_id ON public.device_activations(license_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_provider_payment_id ON public.payments(provider_payment_id);
CREATE INDEX idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at ON public.usage_logs(created_at);
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_licenses_updated_at BEFORE UPDATE ON public.licenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users (users can only see their own data)
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for licenses
CREATE POLICY "Users can view own licenses" ON public.licenses
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for device activations
CREATE POLICY "Users can view own device activations" ON public.device_activations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.licenses
      WHERE licenses.id = device_activations.license_id
      AND licenses.user_id = auth.uid()
    )
  );

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for payments
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for usage logs
CREATE POLICY "Users can view own usage" ON public.usage_logs
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for API keys
CREATE POLICY "Users can view own API keys" ON public.api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys" ON public.api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys" ON public.api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys" ON public.api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Schema created successfully! You can now use these tables.';
END $$;
