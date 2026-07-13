import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Public client (anon key) - for client-side use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client (service role key) - bypasses RLS, server-side only
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Types for our database
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: 'free' | 'professional' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  subscription_id: string | null;
  payment_provider: 'lemonsqueezy' | 'paypal' | 'razorpay';
  provider_payment_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  user?: User;
}

export interface Download {
  id: string;
  user_id: string;
  version: string;
  platform: 'windows' | 'macos' | 'linux';
  ip_address: string | null;
  created_at: string;
  user?: User;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'professional' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid';
  payment_provider: string | null;
  subscription_id: string | null;
  amount: number;
  currency: string;
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface DashboardStats {
  totalUsers: number;
  totalDownloads: number;
  totalRevenue: number;
  activeUsers: number;
  userGrowth: number;
  downloadGrowth: number;
  revenueGrowth: number;
  activeUserGrowth: number;
}
