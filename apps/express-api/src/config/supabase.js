/**
 * Supabase Client Configuration
 * Creates and exports Supabase client for database operations
 */

import { createClient } from '@supabase/supabase-js';
import { config } from './index.js';

let supabaseClient = null;

/**
 * Create or get Supabase client instance
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function createSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = config.supabase.url;
  const supabaseKey = config.supabase.serviceKey;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Supabase URL and Service Key are required. Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.'
    );
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseClient;
}

/**
 * Get Supabase client for user context (with RLS)
 * @param {string} userAccessToken - User's Supabase access token
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function createUserSupabaseClient(userAccessToken) {
  const supabaseUrl = config.supabase.url;
  const supabaseAnonKey = config.supabase.anonKey;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key are required for user context.');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
      },
    },
  });
}

export default { createSupabaseClient, createUserSupabaseClient };
