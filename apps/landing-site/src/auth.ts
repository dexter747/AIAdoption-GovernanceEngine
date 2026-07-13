/**
 * Auth exports for landing site
 * Pure JWT authentication - no NextAuth, no Supabase
 */

export * from './lib/jwt-auth';

// Legacy compatibility exports
export async function auth() {
  // Server-side session check - would need to read cookies in API context
  return null;
}

export async function signIn() {
  // Redirect to /api/auth/google
  throw new Error('Use /api/auth/google endpoint for sign in');
}

export async function signOut() {
  // Redirect to /api/auth/session with DELETE method
  throw new Error('Use /api/auth/session endpoint for sign out');
}
