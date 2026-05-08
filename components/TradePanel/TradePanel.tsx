/**
 * @file TradePanel.tsx
 * @description Accessible trade-order form supporting BUY and SELL orders.
 *
 * * All form controls have explicit labels and ARIA attributes in accordance
 *   with WCAG 2.1 AA success criteria 1.3.1, 3.3.2, and 4.1.3.
 *
 * TODO: Add real-time price preview (fetched via /api/agent) when symbol changes.
 * TODO: Implement server-side order validation before submission.
 */

'use client';

import { useState } from 'react';
import type { TradeSide } from '../../lib/agent/BrokerAgent';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Props for the TradePanel component.
 *
 * @property defaultSymbol - Pre-filled ticker symbol (optional).
 * @property onSubmit      - Callback invoked with order details on submission.
 */
export interface TradePanelProps {
  defaultSymbol?: string;
  onSubmit?: (order: { symbol: string; side: TradeSide; amount: number }) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * TradePanel renders a controlled form for placing BUY or SELL orders.
 * Validates symbol (non-empty) and amount (positive integer) before calling
 * the onSubmit callback.
 *
 * @param props - {@link TradePanelProps}
 */
export function TradePanel({ defaultSymbol = '', onSubmit }: TradePanelProps) {
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [side, setSide] = useState<TradeSide>('BUY');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  /** Validates form fields and fires the onSubmit callback. */
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmedSymbol = symbol.trim().toUpperCase();
    const parsedAmount = parseInt(amount, 10);

    if (!trimmedSymbol) {
      setError('Please enter a valid stock symbol.');
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be a positive whole number.');
      return;
    }

    onSubmit?.({ symbol: trimmedSymbol, side, amount: parsedAmount });
    setSymbol('');
    setAmount('');
  }

  const buttonColour =
    side === 'BUY'
      ? 'bg-emerald-600 hover:bg-emerald-500'
      : 'bg-red-600 hover:bg-red-500';

  return (
    <section
      aria-labelledby="trade-panel-heading"
      className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
    >
      <h2
        id="trade-panel-heading"
        className="mb-4 text-lg font-semibold text-slate-50"
      >
        Place Order
      </h2>

      {/* Error alert – role="alert" ensures screen readers announce it. */}
      {error && (
        <p role="alert" className="mb-3 rounded-lg bg-red-950/50 px-4 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Symbol */}
        <div>
          <label
            htmlFor="trade-symbol"
            className="mb-1 block text-sm font-medium text-slate-300"
          >
            Symbol
          </label>
          <input
            id="trade-symbol"
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="e.g. AAPL"
            aria-required="true"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-slate-50
                       placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1
                       focus:ring-brand-500"
          />
        </div>

        {/* Side toggle */}
        <fieldset>
          <legend className="mb-1 text-sm font-medium text-slate-300">Order side</legend>
          <div className="flex gap-3">
            {(['BUY', 'SELL'] as TradeSide[]).map((option) => (
              <label key={option} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="side"
                  value={option}
                  checked={side === option}
                  onChange={() => setSide(option)}
                  className="accent-brand-500"
                />
                <span
                  className={`text-sm font-semibold ${option === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}
                >
                  {option}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Amount */}
        <div>
          <label
            htmlFor="trade-amount"
            className="mb-1 block text-sm font-medium text-slate-300"
          >
            Number of shares
          </label>
          <input
            id="trade-amount"
            type="number"
            min={1}
            step={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 10"
            aria-required="true"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-slate-50
                       placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1
                       focus:ring-brand-500"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={`w-full rounded-xl px-4 py-3 text-sm font-bold text-white transition-colors
                      focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                      focus-visible:outline-brand-500 ${buttonColour}`}
          aria-label={`${side} ${amount || '0'} shares of ${symbol || 'unknown symbol'}`}
        >
          {side} Shares
        </button>
      </form>
    </section>
  );
}
