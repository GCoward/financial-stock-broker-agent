# Coding Patterns

This document catalogues the major architectural and coding patterns used in the **Financial Stock Broker Agent** project.

---

## 1. Higher-Order Function Middleware

**Location:** `lib/auth/SecurityMiddleware.ts`

Security concerns (JWT verification, rate limiting, secure headers) are implemented as higher-order functions that wrap Next.js App Router route handlers.

```ts
// Compose middleware stack
export const POST = withSecureHeaders(withRateLimit(withJwtAuth(handler)));
```

**Benefits:**
- Each middleware is independently testable.
- Middleware can be composed in any order without modifying handlers.
- Follows the Open/Closed Principle – add new security layers without touching existing routes.

---

## 2. Function Calling Agent Pattern

**Location:** `lib/agent/BrokerAgent.ts`

The `BrokerAgent` class encapsulates OpenAI's tool/function-calling workflow as a single `run(message)` method.  Internally it follows a **two-turn agentic loop**:

1. Send user message → model returns tool calls.
2. Execute tool calls → send results back → model returns final answer.

This pattern keeps all AI orchestration logic in one place, making it easy to extend with new tools.

---

## 3. Compound Components

**Location:** `components/Dashboard/Dashboard.tsx`

The `Dashboard` component acts as an orchestrator that owns shared state (selected symbol) and passes it down to `PortfolioCard` and `TradePanel` as props.  Neither child component knows about the other – they communicate exclusively through the parent.

```
Dashboard
  ├── PortfolioCard (emits: onTradeClick)
  └── TradePanel    (receives: defaultSymbol, emits: onSubmit)
```

---

## 4. Pure Utility Functions

**Location:** `lib/utils/PortfolioCalculator.ts`

All financial calculations are implemented as pure functions with no side effects.  This makes them:
- Easy to unit-test with deterministic inputs/outputs.
- Reusable in both browser and server environments.
- Composable: `calculatePortfolioSummary` delegates to `calculatePositionPnL`.

---

## 5. Serverless API Route Pattern

**Location:** `app/api/agent/route.ts`, `app/api/auth/route.ts`

Next.js App Router API routes are kept thin:
1. Validate the request body.
2. Call the appropriate service (`BrokerAgent`, `signToken`).
3. Return a JSON response.

Business logic lives in `lib/`, not in the route file.

---

## 6. Environment Variable Guard Pattern

**Location:** `lib/agent/BrokerAgent.ts`, `lib/auth/SecurityMiddleware.ts`

All secret access points check for undefined env vars at the call site and **fail loudly** with a descriptive error rather than silently proceeding with an empty/undefined value.

```ts
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set.');
}
```

This surfaces misconfigurations early in development before they become production security incidents.
