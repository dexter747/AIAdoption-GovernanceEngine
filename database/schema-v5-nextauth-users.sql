-- AI Nexus Database Schema Migration v5 - Support NextAuth Users
-- This migration modifies the users table to work with NextAuth (not just Supabase Auth)
-- Run this in Supabase SQL Editor after schema.sql

-- Drop the foreign key constraint to auth.users (if it exists)
-- This allows users from NextAuth to be stored directly

DO $$ 
BEGIN
  -- Check if the constraint exists and drop it
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_id_fkey' AND table_name = 'users'
  ) THEN
    ALTER TABLE public.users DROP CONSTRAINT users_id_fkey;
    RAISE NOTICE 'Dropped foreign key constraint users_id_fkey';
  END IF;
END $$;

-- Modify users table to have auto-generated UUID if not provided
-- and add trial plan option
ALTER TABLE public.users 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4(),
  DROP CONSTRAINT IF EXISTS users_plan_check;

-- Add trial to the plan options
ALTER TABLE public.users 
  ADD CONSTRAINT users_plan_check 
  CHECK (plan IN ('trial', 'free', 'professional', 'team', 'enterprise'));

-- Add auth_provider column to track where the user came from
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'nextauth';

-- Update existing users to have auth_provider set
UPDATE public.users SET auth_provider = 'supabase' WHERE auth_provider IS NULL;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Create a function to automatically set updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for users table (enable if not already)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage all users
CREATE POLICY IF NOT EXISTS "Service role can manage all users" ON public.users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow users to read their own data
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT
  USING (auth.uid() = id OR auth.role() = 'service_role');

-- Allow users to update their own data
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE
  USING (auth.uid() = id OR auth.role() = 'service_role');

COMMENT ON TABLE public.users IS 'User profiles - supports both Supabase Auth and NextAuth users';
COMMENT ON COLUMN public.users.auth_provider IS 'Authentication provider: supabase, nextauth, or email';
