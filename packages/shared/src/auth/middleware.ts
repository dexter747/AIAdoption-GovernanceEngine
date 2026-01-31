/**
 * Universal Auth Middleware
 * Works with Express, Next.js API routes, and any Node.js HTTP server
 */

import { verifyToken, extractTokenFromHeader, AuthResult, JWTPayload } from './jwt';

export interface AuthenticatedRequest {
  user?: JWTPayload;
  token?: string;
}

export type NextFunction = () => void | Promise<void>;

export interface AuthMiddlewareOptions {
  optional?: boolean; // If true, continues even without valid auth
  requiredPlan?: ('trial' | 'free' | 'professional' | 'team' | 'enterprise')[];
}

/**
 * Express-style middleware for JWT authentication
 */
export function authMiddleware(options: AuthMiddlewareOptions = {}) {
  return (req: any, res: any, next: NextFunction) => {
    const authHeader = req.headers?.authorization || req.headers?.Authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      if (options.optional) {
        return next();
      }
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = verifyToken(token);

    if (!result.success) {
      if (options.optional) {
        return next();
      }
      return res.status(401).json({ error: result.error || 'Invalid token' });
    }

    // Check plan requirements
    if (options.requiredPlan && options.requiredPlan.length > 0) {
      const userPlan = result.user?.plan || 'trial';
      if (!options.requiredPlan.includes(userPlan)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: options.requiredPlan,
          current: userPlan,
        });
      }
    }

    // Attach user to request
    req.user = result.user;
    req.token = token;
    
    next();
  };
}

/**
 * Verify auth for Next.js API routes or standalone use
 */
export function verifyAuth(authHeader: string | undefined): AuthResult {
  const token = extractTokenFromHeader(authHeader);
  
  if (!token) {
    return { success: false, error: 'No token provided' };
  }

  return verifyToken(token);
}

/**
 * Get user from request headers
 */
export function getUserFromRequest(req: { headers: Record<string, string | undefined> }): JWTPayload | null {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = extractTokenFromHeader(authHeader);
  
  if (!token) return null;
  
  const result = verifyToken(token);
  return result.success ? result.user || null : null;
}

/**
 * Check if user has required plan
 */
export function hasRequiredPlan(
  user: JWTPayload | null | undefined,
  requiredPlans: ('trial' | 'free' | 'professional' | 'team' | 'enterprise')[]
): boolean {
  if (!user) return false;
  const userPlan = user.plan || 'trial';
  return requiredPlans.includes(userPlan);
}

/**
 * Plan hierarchy for checking upgrades
 */
export const PLAN_HIERARCHY: Record<string, number> = {
  trial: 0,
  free: 1,
  professional: 2,
  team: 3,
  enterprise: 4,
};

/**
 * Check if user's plan is at least the required level
 */
export function hasPlanLevel(
  user: JWTPayload | null | undefined,
  minimumPlan: 'trial' | 'free' | 'professional' | 'team' | 'enterprise'
): boolean {
  if (!user) return false;
  const userPlan = user.plan || 'trial';
  return PLAN_HIERARCHY[userPlan] >= PLAN_HIERARCHY[minimumPlan];
}
