/**
 * @file app/api/agent/route.ts
 * @description Next.js App Router API route for the BrokerAgent.
 *
 * * POST /api/agent accepts a JSON body with a `message` field and returns
 *   the agent's response after executing any required tool calls.
 *
 * ! CRITICAL: This route requires a valid JWT Bearer token.
 *   Ensure OPENAI_API_KEY and JWT_SECRET are set in the environment.
 *
 * TODO: Add streaming support (Server-Sent Events) for long-running agent tasks.
 */

import { NextRequest, NextResponse } from 'next/server';
import { BrokerAgent } from '../../../lib/agent/BrokerAgent';
import { withJwtAuth, withRateLimit, withSecureHeaders } from '../../../lib/auth/SecurityMiddleware';

/**
 * Handles POST requests to /api/agent.
 * Forwards the user message to the BrokerAgent and returns the response.
 *
 * @param req - Incoming Next.js request containing `{ message: string }`.
 * @returns JSON response `{ reply: string }` or an error payload.
 */
async function handler(req: NextRequest): Promise<NextResponse> {
  // ! CRITICAL: OPENAI_API_KEY must never be exposed in the response.
  const apiKey = process.env['OPENAI_API_KEY'];

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Server misconfiguration: OPENAI_API_KEY is missing.' },
      { status: 500 },
    );
  }

  let body: { message?: unknown };
  try {
    body = (await req.json()) as { message?: unknown };
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const { message } = body;

  if (typeof message !== 'string' || !message.trim()) {
    return NextResponse.json(
      { error: 'The "message" field is required and must be a non-empty string.' },
      { status: 400 },
    );
  }

  const agent = new BrokerAgent(apiKey);

  try {
    const reply = await agent.run(message.trim());
    return NextResponse.json({ reply });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    // ? Log the full error server-side but return a generic message to the client
    //   to avoid leaking internal implementation details.
    console.error('[/api/agent] BrokerAgent error:', errorMessage);
    return NextResponse.json(
      { error: 'The agent encountered an error processing your request.' },
      { status: 502 },
    );
  }
}

// * Apply security middleware stack: rate limiting → JWT auth → secure headers
export const POST = withSecureHeaders(withRateLimit(withJwtAuth(handler)));
