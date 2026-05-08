/**
 * @file SecurityMiddleware.ts
 * @description JWT verification, rate limiting, and security-header utilities
 *              for Next.js API routes.
 *
 * ! CRITICAL: JWT_SECRET must be a cryptographically-random string of at
 *   least 32 characters stored in an environment variable.  Never hard-code
 *   it or check it into source control.
 *
 * * This module exports three composable middleware factories:
 *   - withJwtAuth      – verifies Bearer tokens on incoming requests.
 *   - withRateLimit    – enforces per-IP request quotas using an in-memory
 *                        sliding-window counter (swap for Redis in production).
 *   - withSecureHeaders – sets Helmet-style HTTP security headers.
 *
 * ? Next.js App Router does not support Express middleware directly.
 *   These utilities are plain higher-order functions that accept and return
 *   a Next.js `NextRequest → NextResponse` handler function.
 *
 * TODO: Replace the in-memory rate-limit store with an Upstash Redis adapter
 *       so that limits are shared across serverless function instances.
 * TODO: Add PKCE support and refresh-token rotation once OAuth 2.0 is wired in.
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Decoded JWT payload stored inside a verified token. */
export interface JwtPayload {
  sub: string;
  email: string;
  role: 'USER' | 'ADMIN';
  iat?: number;
  exp?: number;
}

/** Handler signature compatible with Next.js App Router route handlers. */
export type RouteHandler = (
  req: NextRequest,
  ctx?: { params?: Promise<Record<string, string>> | Record<string, string> },
) => Promise<NextResponse> | NextResponse;

/** Augmented request carrying the verified JWT payload. */
export interface AuthenticatedRequest extends NextRequest {
  jwtPayload: JwtPayload;
}

/** Rate-limit sliding-window entry keyed by IP address. */
interface RateLimitEntry {
  count: number;
  windowStart: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// ! CRITICAL: Rotate JWT_SECRET regularly and store it in AWS Secrets Manager
//   or an equivalent secrets management solution.
const JWT_SECRET = process.env['JWT_SECRET'] ?? '';

/** Default rate-limit configuration – 60 requests per 60-second window. */
const DEFAULT_RATE_LIMIT = {
  maxRequests: 60,
  windowMs: 60_000,
};

// ---------------------------------------------------------------------------
// In-Memory Rate-Limit Store
// ---------------------------------------------------------------------------

// ? This Map is cleared on every cold start of a serverless function.
//   For persistent cross-instance rate limiting, swap for a Redis store.
const rateLimitStore = new Map<string, RateLimitEntry>();

// ---------------------------------------------------------------------------
// withJwtAuth
// ---------------------------------------------------------------------------

/**
 * Higher-order function that wraps a route handler with JWT Bearer-token
 * verification.  Returns 401 if the token is missing or invalid.
 *
 * * Attach the verified payload to the request object so downstream handlers
 *   can access identity information without re-decoding the token.
 *
 * @param handler - The route handler to protect.
 * @returns A new handler that first verifies the JWT.
 *
 * @example
 * ```ts
 * export const GET = withJwtAuth(async (req) => {
 *   const { sub } = (req as AuthenticatedRequest).jwtPayload;
 *   return NextResponse.json({ userId: sub });
 * });
 * ```
 */
export function withJwtAuth(handler: RouteHandler): RouteHandler {
  return async (req, ctx) => {
    // ! CRITICAL: Absence of JWT_SECRET is a misconfiguration that must never
    //   reach production.  Fail loudly in development to surface it early.
    if (!JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set.');
      return NextResponse.json(
        { error: 'Server misconfiguration: JWT_SECRET is missing.' },
        { status: 500 },
      );
    }

    const authHeader = req.headers.get('authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json(
        { error: 'Missing or malformed Authorization header.' },
        { status: 401 },
      );
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

      // Attach payload to the request object for downstream access.
      // ? Using Object.defineProperty keeps the TypeScript type clean while
      //   avoiding a runtime cast in every handler.
      Object.defineProperty(req, 'jwtPayload', {
        value: payload,
        writable: false,
        enumerable: false,
        configurable: false,
      });

      return handler(req, ctx);
    } catch (err) {
      const isExpired = err instanceof jwt.TokenExpiredError;
      return NextResponse.json(
        { error: isExpired ? 'Token has expired.' : 'Invalid token.' },
        { status: 401 },
      );
    }
  };
}

// ---------------------------------------------------------------------------
// withRateLimit
// ---------------------------------------------------------------------------

/**
 * Higher-order function that enforces a sliding-window rate limit per
 * client IP address.  Returns 429 when the limit is exceeded.
 *
 * @param handler    - The route handler to rate-limit.
 * @param maxRequests - Maximum allowed requests per window (default 60).
 * @param windowMs    - Window duration in milliseconds (default 60 000).
 * @returns A new handler that first checks the rate limit.
 *
 * @example
 * ```ts
 * export const POST = withRateLimit(withJwtAuth(myHandler), 30, 60_000);
 * ```
 */
export function withRateLimit(
  handler: RouteHandler,
  maxRequests = DEFAULT_RATE_LIMIT.maxRequests,
  windowMs = DEFAULT_RATE_LIMIT.windowMs,
): RouteHandler {
  return async (req, ctx) => {
    // ? Prefer X-Forwarded-For when behind a load balancer; fall back to
    //   127.0.0.1 for local development where the header is absent.
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1';

    const now = Date.now();
    const entry = rateLimitStore.get(ip);

    if (!entry || now - entry.windowStart >= windowMs) {
      // Start a fresh window for this IP.
      rateLimitStore.set(ip, { count: 1, windowStart: now });
    } else {
      entry.count += 1;

      if (entry.count > maxRequests) {
        const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000);
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          {
            status: 429,
            headers: { 'Retry-After': String(retryAfter) },
          },
        );
      }
    }

    return handler(req, ctx);
  };
}

// ---------------------------------------------------------------------------
// withSecureHeaders
// ---------------------------------------------------------------------------

/**
 * Applies Helmet-inspired HTTP security headers to every response.
 *
 * * Headers applied:
 *   - Content-Security-Policy  – restricts resource origins.
 *   - Strict-Transport-Security – forces HTTPS for 1 year.
 *   - X-Content-Type-Options   – prevents MIME sniffing.
 *   - X-Frame-Options          – blocks clickjacking.
 *   - Referrer-Policy          – limits referrer leakage.
 *   - Permissions-Policy       – disables unused browser features.
 *
 * @param handler - The route handler to wrap.
 * @returns A new handler whose responses include security headers.
 *
 * TODO: Tighten CSP once all third-party script domains are catalogued.
 */
export function withSecureHeaders(handler: RouteHandler): RouteHandler {
  return async (req, ctx) => {
    const response = await handler(req, ctx);

    // ! CRITICAL: Update the CSP connect-src directive to enumerate all
    //   permitted API domains before going to production.
    response.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "connect-src 'self' https://api.openai.com",
        "font-src 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
      ].join('; '),
    );

    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=()',
    );

    return response;
  };
}

// ---------------------------------------------------------------------------
// Utility: signToken
// ---------------------------------------------------------------------------

/**
 * Signs a new short-lived JWT for the given user payload.
 *
 * ! CRITICAL: This helper is server-side only.  Import it exclusively from
 *   API routes or server actions – never from client components.
 *
 * @param payload  - The user identity data to embed in the token.
 * @param expiresIn - Token lifetime (default '1h').
 * @returns Signed JWT string.
 */
export function signToken(
  payload: Omit<JwtPayload, 'iat' | 'exp'>,
  expiresIn: jwt.SignOptions['expiresIn'] = '1h',
): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set.');
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}
