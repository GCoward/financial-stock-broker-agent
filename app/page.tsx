import Link from 'next/link';
import { Bot, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

const FEATURES = [
  {
    icon: Bot,
    title: 'AI-Powered Decisions',
    description: 'GPT-4o-mini analyses your portfolio and executes trades via OpenAI Function Calling.',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time P&L',
    description: 'Live unrealised profit and loss across all positions with per-share breakdowns.',
  },
  {
    icon: ShieldCheck,
    title: 'Security-First',
    description: 'JWT auth, rate limiting, CSP headers, and env-var secrets keep your data safe.',
  },
  {
    icon: Zap,
    title: 'Instant Execution',
    description: 'Place BUY and SELL orders in one click — the agent handles the rest.',
  },
] as const;

/** Mock portfolio rows shown in the screenshot preview */
const MOCK_POSITIONS = [
  { symbol: 'AAPL', shares: 10, value: '$1,898.40', pnl: '+$398.40', positive: true },
  { symbol: 'TSLA', shares: 5,  value: '$1,225.55', pnl: '-$274.45', positive: false },
  { symbol: 'NVDA', shares: 3,  value: '$2,626.20', pnl: '+$1,126.20', positive: true },
  { symbol: 'MSFT', shares: 8,  value: '$3,322.08', pnl: '+$362.08', positive: true },
];

/**
 * HomePage is the public-facing landing page.
 * Shows an intro, feature highlights, app screenshots and a CTA to log in.
 */
export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)]">

      {/* ── Hero ── */}
      <section aria-labelledby="hero-heading" className="px-4 py-20 text-center md:py-28">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-800 bg-sky-950/50 px-4 py-1.5 text-xs font-medium text-sky-400">
          <Bot size={14} aria-hidden="true" /> Powered by OpenAI Function Calling
        </div>
        <h1 id="hero-heading" className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight text-slate-50 md:text-5xl">
          Your autonomous AI stock broker
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-400 md:text-lg">
          Manage your portfolio, track real-time P&amp;L, and execute trades — all driven by an AI agent that thinks for you.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-sky-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          >
            Get Started
          </Link>
          <Link
            href="/instructions"
            className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 transition-colors hover:border-slate-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          >
            How it works
          </Link>
        </div>
      </section>

      {/* ── Screenshots ── */}
      <section aria-labelledby="screenshots-heading" className="px-4 pb-20 md:px-8">
        <h2 id="screenshots-heading" className="mb-8 text-center text-xl font-bold text-slate-200">
          See it in action
        </h2>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">

          {/* Screenshot 1 – Portfolio overview */}
          <figure className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
            <div className="border-b border-slate-800 px-4 py-2.5 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
              <span className="ml-3 text-xs text-slate-500">Portfolio Overview</span>
            </div>
            <div className="p-4 space-y-2" aria-hidden="true">
              {/* Summary bar */}
              <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-800/60 p-3 text-center">
                <div>
                  <p className="text-[10px] uppercase text-slate-500">Cost Basis</p>
                  <p className="text-xs font-semibold text-slate-200">$9,072.00</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-500">Market Value</p>
                  <p className="text-xs font-semibold text-slate-200">$9,072.23</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-500">P&L</p>
                  <p className="text-xs font-semibold text-emerald-400">+$1,612.23</p>
                </div>
              </div>
              {/* Position rows */}
              {MOCK_POSITIONS.map((p) => (
                <div key={p.symbol} className="flex items-center justify-between rounded-lg bg-slate-800/40 px-3 py-2">
                  <div>
                    <span className="text-xs font-bold text-slate-100">{p.symbol}</span>
                    <span className="ml-2 text-[10px] text-slate-500">{p.shares} shares</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-300">{p.value}</p>
                    <p className={`text-[10px] font-semibold ${p.positive ? 'text-emerald-400' : 'text-red-400'}`}>{p.pnl}</p>
                  </div>
                </div>
              ))}
            </div>
            <figcaption className="border-t border-slate-800 px-4 py-2.5 text-xs text-slate-500">
              Real-time portfolio positions with unrealised P&amp;L
            </figcaption>
          </figure>

          {/* Screenshot 2 – Trade panel */}
          <figure className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
            <div className="border-b border-slate-800 px-4 py-2.5 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
              <span className="ml-3 text-xs text-slate-500">Trade Panel</span>
            </div>
            <div className="p-4 space-y-3" aria-hidden="true">
              <p className="text-sm font-semibold text-slate-200">Place Order</p>
              <div className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs text-slate-400">
                AAPL
              </div>
              <div className="flex gap-3">
                <div className="flex-1 rounded-xl border border-emerald-700/60 bg-emerald-950/30 px-4 py-2.5 text-center text-xs font-bold text-emerald-400">BUY</div>
                <div className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-center text-xs font-semibold text-slate-400">SELL</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs text-slate-400">
                10 shares
              </div>
              <div className="rounded-xl bg-emerald-600 px-4 py-2.5 text-center text-xs font-bold text-white">
                BUY Shares
              </div>
              <div className="mt-2 space-y-1.5 rounded-xl border border-slate-800 bg-slate-800/40 p-3">
                <p className="text-[10px] font-semibold text-slate-400">Recent Orders</p>
                {[
                  { side: 'BUY', qty: 10, sym: 'AAPL', time: '14:32:01' },
                  { side: 'SELL', qty: 2, sym: 'TSLA', time: '14:28:44' },
                ].map((o, i) => (
                  <div key={i} className="flex justify-between text-[10px] text-slate-400">
                    <span>
                      <span className={o.side === 'BUY' ? 'text-emerald-400' : 'text-red-400'}>{o.side}</span>
                      {' '}{o.qty}× {o.sym}
                    </span>
                    <span className="text-slate-600">{o.time}</span>
                  </div>
                ))}
              </div>
            </div>
            <figcaption className="border-t border-slate-800 px-4 py-2.5 text-xs text-slate-500">
              One-click BUY / SELL order execution
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── Features ── */}
      <section aria-labelledby="features-heading" className="border-t border-slate-800 px-4 py-16 md:px-8">
        <h2 id="features-heading" className="mb-10 text-center text-xl font-bold text-slate-200">
          Everything you need
        </h2>
        <ul role="list" className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <li key={title} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="mb-3 inline-flex rounded-xl bg-sky-600/15 p-2.5">
                <Icon size={20} className="text-sky-400" aria-hidden="true" />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-slate-100">{title}</h3>
              <p className="text-xs leading-relaxed text-slate-400">{description}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── CTA ── */}
      <section aria-labelledby="cta-heading" className="border-t border-slate-800 px-4 py-16 text-center">
        <h2 id="cta-heading" className="text-2xl font-bold text-slate-50">Ready to start trading?</h2>
        <p className="mt-2 text-sm text-slate-400">Create a free account and let the agent manage your portfolio.</p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-xl bg-sky-600 px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
        >
          Log in / Sign up
        </Link>
      </section>

    </main>
  );
}
