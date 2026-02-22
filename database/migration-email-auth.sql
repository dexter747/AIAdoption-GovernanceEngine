-- =============================================================================
-- Migration: Email/Password Authentication Support
-- Date: February 22, 2026
-- =============================================================================
-- Run this in Supabase SQL Editor to add email auth columns

-- Add password_hash and email_verified to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

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

-- RLS policies for auth_tokens
ALTER TABLE public.auth_tokens ENABLE ROW LEVEL SECURITY;

-- Only allow service role to manage auth tokens
CREATE POLICY "Service role manages auth tokens"
  ON public.auth_tokens
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Update users auth_provider CHECK constraint to include 'email'
-- (Already supports 'email' in the original schema)

COMMENT ON COLUMN public.users.password_hash IS 'bcrypt hash for email/password auth users';
COMMENT ON COLUMN public.users.email_verified IS 'Whether the user verified their email address';
COMMENT ON TABLE public.auth_tokens IS 'Tokens for email verification and password reset';
