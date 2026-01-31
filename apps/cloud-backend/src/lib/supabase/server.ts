import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Create Supabase client for DATABASE access only
 * Authentication is handled via JWT tokens - DO NOT use supabase.auth
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * @deprecated Use JWT auth from '@/lib/jwt-auth' instead
 * This function should not be used - authentication is handled via pure JWT
 */
export async function getUser() {
  console.warn('DEPRECATED: getUser() from supabase/server.ts should not be used. Use JWT auth instead.');
  throw new Error('Supabase auth is deprecated. Use JWT auth from @/lib/jwt-auth instead.');
}
