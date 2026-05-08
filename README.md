# Financial Stock Broker Agent

> An autonomous AI-powered broker agent for real-time portfolio management and mock trade execution — built with Next.js, OpenAI Function Calling, and a security-first architecture.

[![CI](https://github.com/GCoward/financial-stock-broker-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/GCoward/financial-stock-broker-agent/actions/workflows/ci.yml)

---

## Professional Rigor

| Pillar | Tooling |
|---|---|
| **Unit Testing** | Jest + Testing Library – full coverage of `PortfolioCalculator` |
| **Component Docs** | Storybook 10 with a11y addon (`@storybook/addon-a11y`) |
| **Security** | JWT auth, rate limiting, Helmet-style headers, env-var guards |
| **Accessibility** | WCAG 2.1 AA – aria-labels, role="alert", visible focus rings |
| **CI/CD** | GitHub Actions – lint → test → build on every push |
| **TypeScript** | Strict mode throughout; no `any` |

---

## Tech Stack

- **Frontend:** Next.js 16 (App Router) · Tailwind CSS · Lucide React
- **Backend:** Next.js API Routes (TypeScript)
- **AI:** OpenAI SDK – Function Calling (`gpt-4o-mini`)
- **Infrastructure:** AWS S3 (logs) · AWS DynamoDB (user data) *(adapters planned)*
- **Testing:** Jest (unit) · Storybook (component)
- **Documentation:** JSDoc · Storybook · PATTERNS.md

---

## Project Structure

```
financial-stock-broker-agent/
├── .github/workflows/ci.yml        # CI pipeline
├── .storybook/                     # Storybook configuration
├── app/
│   ├── api/
│   │   ├── agent/route.ts          # POST /api/agent – broker agent endpoint
│   │   └── auth/route.ts           # POST /api/auth  – JWT issuance
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Dashboard/                  # Compound component orchestrator
│   ├── PortfolioCard/              # Single-position P&L card + stories
│   └── TradePanel/                 # Trade order form + stories
├── lib/
│   ├── agent/BrokerAgent.ts        # OpenAI Function Calling agent
│   ├── auth/SecurityMiddleware.ts  # JWT, rate-limit, secure headers
│   └── utils/PortfolioCalculator.ts# Pure P&L utility functions
├── middleware.ts                   # Next.js Edge Middleware
├── tests/unit/                     # Jest unit tests
├── styles/globals.css
├── PATTERNS.md                     # Architectural patterns reference
└── .env.example                    # Required environment variables
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- An [OpenAI API key](https://platform.openai.com/api-keys)

### Installation

```bash
npm install
cp .env.example .env.local
# Fill in .env.local with your secrets
npm run dev
```

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm test` | Run Jest unit tests |
| `npm run storybook` | Launch Storybook component explorer |
| `npm run build-storybook` | Build static Storybook |

---

## Environment Variables

See [`.env.example`](.env.example) for all required variables.

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | OpenAI API key for the broker agent |
| `JWT_SECRET` | ≥32-character random string for signing JWTs |
| `DEMO_EMAIL` | Demo user email (replace with real auth in production) |
| `DEMO_PASSWORD` | Demo user password (replace with bcrypt + DB lookup) |

---

## Security-First Roadmap

1. **Environment** – All secrets loaded from env vars; `.env.local` excluded from git.
2. **Transport** – HTTPS enforced via HSTS header.
3. **Authentication** – JWT Bearer tokens verified on every protected route.
4. **Rate Limiting** – Per-IP sliding-window counters (swap to Redis for production).
5. **Security Headers** – CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.
6. **Input Validation** – All API route bodies validated before processing.
7. **Secrets Management** – Migrate to AWS Secrets Manager for production.
8. **Audit Logging** – Log all trade events to AWS S3 *(planned)*.
9. **MFA** – Add TOTP-based multi-factor authentication *(planned)*.
10. **Penetration Testing** – Schedule before first public release.

---

## Coding Patterns

See [PATTERNS.md](PATTERNS.md) for a full catalogue of architectural patterns including:
- Higher-Order Function Middleware
- OpenAI Function Calling Agent Loop
- Compound Components
- Pure Utility Functions
- Environment Variable Guard Pattern

---

## Accessibility

All UI components meet **WCAG 2.1 AA** requirements:
- Descriptive `aria-label` on every interactive element.
- `role="alert"` for dynamic error messages.
- Visible focus rings on all focusable controls.
- Colour is never the sole indicator of meaning.
- Semantic HTML (`<header>`, `<main>`, `<article>`, `<section>`, `<dl>`).

---

## Contributing

1. Fork the repo and create a feature branch.
2. Run `npm test` and `npm run lint` before opening a PR.
3. All new components must have a Storybook story and JSDoc.
4. Follow the [Better Comments](https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments) convention:
   - `// !` critical security notes
   - `// ?` architectural explanations
   - `// *` high-level functionality
   - `// TODO` future roadmap items

---

## License

MIT
