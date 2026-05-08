/**
 * @file Dashboard.tsx
 * @description Main portfolio dashboard with positions overview and trade panel.
 *
 * * Compound Component pattern: Dashboard composes PortfolioCard and TradePanel
 *   into a cohesive layout without either child needing to know about the other.
 *
 * ? The selected symbol is managed as local state here so the TradePanel
 *   pre-fills correctly when a user clicks "Trade" on a PortfolioCard.
 *
 * TODO: Replace mock positions with live data fetched from /api/agent.
 * TODO: Add real-time WebSocket updates for price changes.
 */

'use client';

import { useState } from 'react';
import { PortfolioCard } from '../PortfolioCard/PortfolioCard';
import { TradePanel } from '../TradePanel/TradePanel';
import { calculatePortfolioSummary } from '../../lib/utils/PortfolioCalculator';
import type { Position } from '../../lib/utils/PortfolioCalculator';
import type { TradeSide } from '../../lib/agent/BrokerAgent';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

// ? Replace these with real API data in production.
const MOCK_POSITIONS: Position[] = [
  { symbol: 'AAPL', shares: 10, avgCostBasis: 150, currentPrice: 189.84 },
  { symbol: 'TSLA', shares: 5, avgCostBasis: 300, currentPrice: 245.11 },
  { symbol: 'NVDA', shares: 3, avgCostBasis: 500, currentPrice: 875.4 },
  { symbol: 'MSFT', shares: 8, avgCostBasis: 370, currentPrice: 415.26 },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Dashboard is the top-level page component for the broker agent application.
 * It orchestrates the portfolio summary, position cards, and the trade panel.
 */
export function Dashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [tradeHistory, setTradeHistory] = useState<
    Array<{ symbol: string; side: TradeSide; amount: number; timestamp: string }>
  >([]);

  const summary = calculatePortfolioSummary(MOCK_POSITIONS);

  const isProfit = summary.totalUnrealizedPnL >= 0;
  const pnlColour = isProfit ? 'text-emerald-400' : 'text-red-400';

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

  /** Handles trade submission from TradePanel and records it in history. */
  function handleTradeSubmit(order: { symbol: string; side: TradeSide; amount: number }) {
    setTradeHistory((prev) => [
      { ...order, timestamp: new Date().toLocaleTimeString() },
      ...prev,
    ]);
    setSelectedSymbol('');
    // TODO: POST to /api/agent for actual order execution.
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Page header */}
      <header>
        <h1 className="text-3xl font-bold text-slate-50">
          Autonomous Stock Broker Agent
        </h1>
        <p className="mt-1 text-slate-400">
          AI-driven portfolio management powered by OpenAI Function Calling.
        </p>
      </header>

      {/* Portfolio summary banner */}
      <section
        aria-label="Portfolio summary"
        className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:grid-cols-3"
      >
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">Total Cost Basis</p>
          <p className="mt-1 text-xl font-semibold text-slate-200">
            {formatCurrency(summary.totalCostBasis)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">Market Value</p>
          <p className="mt-1 text-xl font-semibold text-slate-200">
            {formatCurrency(summary.totalMarketValue)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">Unrealised P&L</p>
          <p className={`mt-1 text-xl font-semibold ${pnlColour}`}>
            {formatCurrency(summary.totalUnrealizedPnL)}{' '}
            <span className="text-sm font-normal">
              ({summary.totalUnrealizedPnL >= 0 ? '+' : ''}
              {summary.totalUnrealizedPnLPercent.toFixed(2)}%)
            </span>
          </p>
        </div>
      </section>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Position cards */}
        <section aria-label="Portfolio positions" className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-slate-200">Positions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {summary.positions.map((position) => (
              <PortfolioCard
                key={position.symbol}
                position={position}
                onTradeClick={setSelectedSymbol}
              />
            ))}
          </div>
        </section>

        {/* Trade panel */}
        <aside aria-label="Trade panel">
          <TradePanel
            defaultSymbol={selectedSymbol}
            onSubmit={handleTradeSubmit}
          />

          {/* Recent trades */}
          {tradeHistory.length > 0 && (
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-300">Recent Orders</h3>
              <ul className="space-y-2" aria-label="Recent trade orders">
                {tradeHistory.slice(0, 5).map((trade, index) => (
                  <li key={index} className="flex items-center justify-between text-xs text-slate-400">
                    <span>
                      <span
                        className={trade.side === 'BUY' ? 'text-emerald-400' : 'text-red-400'}
                      >
                        {trade.side}
                      </span>{' '}
                      {trade.amount}× {trade.symbol}
                    </span>
                    <span className="text-slate-600">{trade.timestamp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
