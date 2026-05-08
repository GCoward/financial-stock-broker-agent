/**
 * @file PortfolioCard.tsx
 * @description Displays a single portfolio position with P&L metrics.
 *
 * * Follows WCAG 2.1 AA standards:
 *   - Meaningful aria-labels on all interactive elements.
 *   - Colour is never the sole indicator of status (text labels accompany colours).
 *   - Focus-visible ring on all focusable elements.
 *
 * TODO: Add a sparkline chart for 30-day price history.
 */

'use client';

import type { PositionPnL } from '../../lib/utils/PortfolioCalculator';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Props for the PortfolioCard component.
 *
 * @property position    - The P&L breakdown for this position.
 * @property onTradeClick - Optional callback triggered when "Trade" is pressed.
 */
export interface PortfolioCardProps {
  position: PositionPnL;
  onTradeClick?: (symbol: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * PortfolioCard renders a summary card for a single stock position.
 * Displays cost basis, market value, and unrealised P&L.
 *
 * @param props - {@link PortfolioCardProps}
 */
export function PortfolioCard({ position, onTradeClick }: PortfolioCardProps) {
  const isProfit = position.unrealizedPnL >= 0;
  const pnlColour = isProfit ? 'text-emerald-400' : 'text-red-400';
  const pnlBg = isProfit ? 'bg-emerald-950/40' : 'bg-red-950/40';
  const pnlLabel = isProfit ? 'profit' : 'loss';

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const formatPercent = (value: number) =>
    `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

  return (
    <article
      className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg"
      aria-label={`Portfolio position for ${position.symbol}`}
    >
      {/* Header */}
      <header className="mb-4 flex items-center justify-between">
        <span className="text-xl font-bold tracking-wide text-slate-50">
          {position.symbol}
        </span>
        <span className="rounded-full bg-slate-800 px-3 py-0.5 text-sm text-slate-400">
          {position.shares} {position.shares === 1 ? 'share' : 'shares'}
        </span>
      </header>

      {/* Metrics grid */}
      <dl className="grid grid-cols-2 gap-3">
        <div>
          <dt className="text-xs text-slate-500 uppercase tracking-wider">Cost Basis</dt>
          <dd className="mt-0.5 text-sm font-medium text-slate-200">
            {formatCurrency(position.costBasis)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500 uppercase tracking-wider">Market Value</dt>
          <dd className="mt-0.5 text-sm font-medium text-slate-200">
            {formatCurrency(position.marketValue)}
          </dd>
        </div>
        <div className={`col-span-2 rounded-lg px-3 py-2 ${pnlBg}`}>
          <dt className="text-xs text-slate-400 uppercase tracking-wider">
            Unrealised {pnlLabel}
          </dt>
          <dd className={`mt-0.5 text-base font-semibold ${pnlColour}`}>
            {/* Colour + text label ensures accessible status indication */}
            {formatCurrency(position.unrealizedPnL)}{' '}
            <span className="text-sm font-normal">
              ({formatPercent(position.unrealizedPnLPercent)})
            </span>
          </dd>
        </div>
      </dl>

      {/* Trade button */}
      {onTradeClick && (
        <footer className="mt-4">
          <button
            type="button"
            onClick={() => onTradeClick(position.symbol)}
            aria-label={`Open trade panel for ${position.symbol}`}
            className="w-full rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white
                       transition-colors hover:bg-brand-500
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                       focus-visible:outline-brand-500"
          >
            Trade
          </button>
        </footer>
      )}
    </article>
  );
}
