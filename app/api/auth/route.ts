/**
 * @file app/api/auth/route.ts
 * @description Authentication endpoint for issuing JWT tokens.
 *
 * * POST /api/auth accepts `{ email, password }` and returns a signed JWT.
 *   This is a mock implementation – replace the credential check with a real
 *   database lookup before production deployment.
 *
 * ! CRITICAL: Passwords must never be stored in plain text.
 *   Replace the mock validation with bcrypt.compare() against hashed DB records.
 *
 * TODO: Implement refresh-token rotation and a /api/auth/refresh endpoint.
 * TODO: Add MFA (TOTP) support.
 */

import { NextRequest, NextResponse } from 'next/server';
import { signToken, withRateLimit, withSecureHeaders } from '../../../lib/auth/SecurityMiddleware';

/**
 * Handles POST requests to /api/auth.
 * Returns a signed JWT on successful credential verification.
 *
 * @param req - Incoming request containing `{ email: string, password: string }`.
 * @returns JSON `{ token: string }` on success or an error payload.
 */
async function handler(req: NextRequest): Promise<NextResponse> {
  let body: { email?: unknown; password?: unknown };
  try {
    body = (await req.json()) as { email?: unknown; password?: unknown };
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const { email, password } = body;

  if (typeof email !== 'string' || typeof password !== 'string') {
    return NextResponse.json(
      { error: 'Both "email" and "password" fields are required strings.' },
      { status: 400 },
    );
  }

  // ! CRITICAL: Replace this mock check with a bcrypt.compare() call against
  //   the hashed password stored in your database.
  const isValidCredentials = email === process.env['DEMO_EMAIL'] && password === process.env['DEMO_PASSWORD'];

  if (!isValidCredentials) {
    // ? Return 401 without specifying which field is incorrect to prevent
    //   user enumeration attacks.
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  try {
    const token = signToken({ sub: 'user-001', email, role: 'USER' });
    return NextResponse.json({ token });
  } catch (err) {
    console.error('[/api/auth] Token signing failed:', err);
    return NextResponse.json({ error: 'Authentication service unavailable.' }, { status: 500 });
  }
}

// * Rate limit auth endpoint more aggressively to deter brute-force attacks.
export const POST = withSecureHeaders(withRateLimit(handler, 10, 60_000));
