/**
 * @file proxy.ts
 * @description Next.js Edge Proxy for global request-level security.
 *
 * * Runs on every matched request before it reaches any API route or page.
 *   Responsible for:
 *   - Adding security headers to all responses.
 *   - Enforcing Authorization header presence on protected routes.
 *
 * ! CRITICAL: Edge Proxy runs in the Edge Runtime, which does NOT
 *   support Node.js built-ins like `crypto` or `jsonwebtoken`.
 *   Use the Web Crypto API or a lightweight JWT library for token inspection.
 *
 * ? The actual token verification is intentionally lightweight here –
 *   full JWT signature verification happens inside the API-route middleware
 *   (SecurityMiddleware.ts) using the full Node.js runtime.
 *
 * TODO: Upgrade to full edge-compatible JWT verification once an edge-safe
 *       library is selected (e.g. jose).
 */

import { NextRequest, NextResponse } from 'next/server';

/** Routes that require a valid JWT token in the Authorization header. */
const PROTECTED_API_ROUTES = ['/api/agent'];

/**
 * Next.js Edge Proxy function (formerly "middleware").
 * Enforces basic auth-header presence on protected routes and sets
 * global security headers on all responses.
 *
 * @param req - Incoming Edge request.
 * @returns NextResponse (either a 401 or the next handler with security headers).
 */
export function proxy(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  // * Guard protected API routes – full JWT verification happens in the route handler.
  if (PROTECTED_API_ROUTES.some((route) => pathname.startsWith(route))) {
    const authHeader = req.headers.get('authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header is required.' },
        { status: 401 },
      );
    }
  }

  const response = NextResponse.next();

  // Apply security headers globally
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except Next.js internals and static assets:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
