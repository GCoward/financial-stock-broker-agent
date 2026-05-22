import Link from 'next/link';

export default function InstructionsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 md:px-8">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-700 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/30">
        <header className="mb-8">
          <p className="mb-2 text-sm uppercase tracking-[0.24em] text-slate-400">Instructions</p>
          <h1 className="text-4xl font-semibold text-white">How to use the Financial Stock Broker Agent</h1>
          <p className="mt-4 text-slate-300">
            A step-by-step guide for signing in, reviewing your portfolio, placing trades, and interpreting the agent's responses.
          </p>
        </header>

        <section className="space-y-8">
          <article className="rounded-3xl bg-slate-950/80 p-6 ring-1 ring-slate-700/60">
            <h2 className="mb-4 text-2xl font-semibold text-white">1. Open the app</h2>
            <ol className="space-y-3 pl-5 text-slate-300 marker:text-sky-400">
              <li>Navigate to the home page at <span className="font-medium text-slate-100">/</span>.</li>
              <li>Sign in if authentication is enabled, or use the demo credentials configured in <span className="font-mono text-sky-300">.env.local</span>.</li>
              <li>Wait for the dashboard to load your portfolio data and trade controls.</li>
            </ol>
          </article>

          <article className="rounded-3xl bg-slate-950/80 p-6 ring-1 ring-slate-700/60">
            <h2 className="mb-4 text-2xl font-semibold text-white">2. Review your portfolio overview</h2>
            <p className="mb-4 text-slate-300">
              The dashboard shows the current status of your holdings, including total value and recent performance. Use this section to confirm that the agent has access to your latest portfolio snapshot.
            </p>
            <ul className="space-y-3 pl-5 marker:text-sky-400 text-slate-300">
              <li>Check the portfolio total and available cash balance.</li>
              <li>Inspect each holding card for position size, current market price, and profit/loss.</li>
              <li>Look for any alerts or notes from the agent about portfolio health.</li>
            </ul>
          </article>

          <article className="rounded-3xl bg-slate-950/80 p-6 ring-1 ring-slate-700/60">
            <h2 className="mb-4 text-2xl font-semibold text-white">3. Place a trade</h2>
            <p className="mb-4 text-slate-300">
              Use the trade panel to submit buy or sell orders. The agent will process the request and update the portfolio summary once the trade is executed.</p>
            <ol className="space-y-3 pl-5 text-slate-300 marker:text-sky-400">
              <li>Choose the stock symbol you want to trade.</li>
              <li>Select either <strong>Buy</strong> or <strong>Sell</strong>.</li>
              <li>Enter the quantity or dollar amount for the order.</li>
              <li>Review the order details, then submit the trade.</li>
            </ol>
          </article>

          <article className="rounded-3xl bg-slate-950/80 p-6 ring-1 ring-slate-700/60">
            <h2 className="mb-4 text-2xl font-semibold text-white">4. Read the agent response</h2>
            <p className="mb-4 text-slate-300">
              After submitting a trade, the agent returns a confirmation message. Pay attention to the response so you can confirm the order outcome and any follow-up recommendations.</p>
            <ul className="space-y-3 pl-5 marker:text-sky-400 text-slate-300">
              <li>If the trade succeeds, the updated position and portfolio totals should refresh.</li>
              <li>If the agent reports an issue, follow the instructions provided and correct the order details.</li>
              <li>Look for explanations about risk, allocation, or partial fills when applicable.</li>
            </ul>
          </article>

          <article className="rounded-3xl bg-slate-950/80 p-6 ring-1 ring-slate-700/60">
            <h2 className="mb-4 text-2xl font-semibold text-white">5. Verify results and continue</h2>
            <p className="mb-4 text-slate-300">
              After a trade completes, verify that your portfolio reflects the new holdings and balances. Use the dashboard as your single source of truth for ongoing trade decisions.</p>
            <ul className="space-y-3 pl-5 marker:text-sky-400 text-slate-300">
              <li>Confirm the new position appears in the portfolio list.</li>
              <li>Check that cash and total value were updated correctly.</li>
              <li>Repeat the process for additional trades as needed.</li>
            </ul>
          </article>

          <article className="rounded-3xl bg-slate-950/80 p-6 ring-1 ring-slate-700/60">
            <h2 className="mb-4 text-2xl font-semibold text-white">Troubleshooting</h2>
            <div className="space-y-3 text-slate-300">
              <p>If something does not work as expected:</p>
              <ul className="space-y-2 pl-5 marker:text-sky-400">
                <li>Refresh the page to reload the dashboard data.</li>
                <li>Check the browser console for network or API errors.</li>
                <li>Confirm your environment variables are set correctly in <span className="font-mono text-sky-300">.env.local</span>.</li>
              </ul>
            </div>
          </article>

          <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-6 text-slate-300">
            <p className="text-base">
              Return to the <Link href="/" className="font-semibold text-sky-300 underline hover:text-sky-200">home dashboard</Link> anytime to resume trading.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
