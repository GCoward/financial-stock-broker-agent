/**
 * @file PortfolioCalculator.ts
 * @description Pure utility functions for portfolio profit/loss calculations.
 *
 * * All functions in this module are pure (no side-effects) and are fully
 *   unit-tested in tests/unit/PortfolioCalculator.test.ts.
 *
 * ? This module is intentionally free of any framework or IO dependencies
 *   so that it can be used in both browser and server environments.
 *
 * TODO: Add support for fractional shares once brokerage API supports it.
 * TODO: Implement tax-lot accounting (FIFO / LIFO / specific identification).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single position in a portfolio. */
export interface Position {
  /** Ticker symbol, e.g. "AAPL". */
  symbol: string;
  /** Number of shares held (must be > 0). */
  shares: number;
  /** Average cost per share (must be > 0). */
  avgCostBasis: number;
  /** Current market price per share (must be ≥ 0). */
  currentPrice: number;
}

/** Profit/loss breakdown for a single position. */
export interface PositionPnL {
  symbol: string;
  shares: number;
  costBasis: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

/** Aggregate portfolio summary. */
export interface PortfolioSummary {
  totalCostBasis: number;
  totalMarketValue: number;
  totalUnrealizedPnL: number;
  totalUnrealizedPnLPercent: number;
  positions: PositionPnL[];
}

/** A realised trade used to compute realised profit/loss. */
export interface Trade {
  symbol: string;
  side: 'BUY' | 'SELL';
  shares: number;
  pricePerShare: number;
}

// ---------------------------------------------------------------------------
// Calculation Functions
// ---------------------------------------------------------------------------

/**
 * Calculates the unrealised profit/loss for a single position.
 *
 * @param position - The portfolio position to evaluate.
 * @returns PositionPnL containing cost basis, market value, and P&L figures.
 *
 * @example
 * ```ts
 * const pnl = calculatePositionPnL({
 *   symbol: 'AAPL', shares: 10, avgCostBasis: 150, currentPrice: 189.84,
 * });
 * // pnl.unrealizedPnL === 398.4
 * ```
 */
export function calculatePositionPnL(position: Position): PositionPnL {
  const costBasis = round(position.shares * position.avgCostBasis);
  const marketValue = round(position.shares * position.currentPrice);
  const unrealizedPnL = round(marketValue - costBasis);
  const unrealizedPnLPercent =
    costBasis === 0 ? 0 : round((unrealizedPnL / costBasis) * 100);

  return {
    symbol: position.symbol,
    shares: position.shares,
    costBasis,
    marketValue,
    unrealizedPnL,
    unrealizedPnLPercent,
  };
}

/**
 * Calculates an aggregate portfolio summary across all positions.
 *
 * * Iterates each position via calculatePositionPnL and aggregates totals.
 *
 * @param positions - Array of portfolio positions.
 * @returns PortfolioSummary with totals and per-position breakdowns.
 */
export function calculatePortfolioSummary(positions: Position[]): PortfolioSummary {
  const positionPnLs = positions.map(calculatePositionPnL);

  const totalCostBasis = round(positionPnLs.reduce((acc, p) => acc + p.costBasis, 0));
  const totalMarketValue = round(positionPnLs.reduce((acc, p) => acc + p.marketValue, 0));
  const totalUnrealizedPnL = round(totalMarketValue - totalCostBasis);
  const totalUnrealizedPnLPercent =
    totalCostBasis === 0
      ? 0
      : round((totalUnrealizedPnL / totalCostBasis) * 100);

  return {
    totalCostBasis,
    totalMarketValue,
    totalUnrealizedPnL,
    totalUnrealizedPnLPercent,
    positions: positionPnLs,
  };
}

/**
 * Calculates the realised profit/loss from a sequence of trades.
 *
 * ? Uses a simple FIFO cost basis approach:
 *   - BUY trades increase the running cost pool.
 *   - SELL trades realise profit/loss against the current average cost.
 *
 * @param trades - Ordered list of trades (chronological order assumed).
 * @returns Total realised P&L in dollars.
 *
 * TODO: Implement full FIFO lot accounting for tax optimisation.
 */
export function calculateRealizedPnL(trades: Trade[]): number {
  let totalShares = 0;
  let totalCost = 0;
  let realizedPnL = 0;

  for (const trade of trades) {
    if (trade.side === 'BUY') {
      totalCost += trade.shares * trade.pricePerShare;
      totalShares += trade.shares;
    } else if (trade.side === 'SELL' && totalShares > 0) {
      const avgCost = totalShares > 0 ? totalCost / totalShares : 0;
      const sharesToSell = Math.min(trade.shares, totalShares);
      realizedPnL += sharesToSell * (trade.pricePerShare - avgCost);
      totalCost -= sharesToSell * avgCost;
      totalShares -= sharesToSell;
    }
  }

  return round(realizedPnL);
}

/**
 * Calculates the percentage weight of each position relative to total
 * portfolio market value.
 *
 * @param positions - Array of portfolio positions.
 * @returns Array of { symbol, weight } objects where weight is 0–100.
 */
export function calculatePositionWeights(
  positions: Position[],
): Array<{ symbol: string; weight: number }> {
  const totalValue = positions.reduce(
    (acc, p) => acc + p.shares * p.currentPrice,
    0,
  );

  if (totalValue === 0) {
    return positions.map((p) => ({ symbol: p.symbol, weight: 0 }));
  }

  return positions.map((p) => ({
    symbol: p.symbol,
    weight: round(((p.shares * p.currentPrice) / totalValue) * 100),
  }));
}

// ---------------------------------------------------------------------------
// Private Helpers
// ---------------------------------------------------------------------------

/**
 * Rounds a number to two decimal places using standard rounding.
 *
 * @param value - The number to round.
 * @returns The value rounded to 2 decimal places.
 */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}
