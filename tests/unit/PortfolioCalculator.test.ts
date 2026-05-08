/**
 * @file PortfolioCalculator.test.ts
 * @description Jest unit tests for the PortfolioCalculator utility module.
 *
 * * Tests cover all four exported functions:
 *   - calculatePositionPnL
 *   - calculatePortfolioSummary
 *   - calculateRealizedPnL
 *   - calculatePositionWeights
 */

import {
  calculatePositionPnL,
  calculatePortfolioSummary,
  calculateRealizedPnL,
  calculatePositionWeights,
  type Position,
  type Trade,
} from '../../lib/utils/PortfolioCalculator';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const applePosition: Position = {
  symbol: 'AAPL',
  shares: 10,
  avgCostBasis: 150,
  currentPrice: 189.84,
};

const teslaPosition: Position = {
  symbol: 'TSLA',
  shares: 5,
  avgCostBasis: 300,
  currentPrice: 245.11,
};

const flatPosition: Position = {
  symbol: 'FLAT',
  shares: 20,
  avgCostBasis: 100,
  currentPrice: 100,
};

const zeroPosition: Position = {
  symbol: 'ZERO',
  shares: 10,
  avgCostBasis: 0,
  currentPrice: 0,
};

// ---------------------------------------------------------------------------
// calculatePositionPnL
// ---------------------------------------------------------------------------

describe('calculatePositionPnL', () => {
  it('returns the correct cost basis', () => {
    const result = calculatePositionPnL(applePosition);
    expect(result.costBasis).toBe(1500);
  });

  it('returns the correct market value', () => {
    const result = calculatePositionPnL(applePosition);
    expect(result.marketValue).toBe(1898.4);
  });

  it('returns the correct unrealised P&L', () => {
    const result = calculatePositionPnL(applePosition);
    expect(result.unrealizedPnL).toBe(398.4);
  });

  it('returns the correct unrealised P&L %', () => {
    const result = calculatePositionPnL(applePosition);
    expect(result.unrealizedPnLPercent).toBeCloseTo(26.56, 1);
  });

  it('returns 0 % P&L for a flat position', () => {
    const result = calculatePositionPnL(flatPosition);
    expect(result.unrealizedPnL).toBe(0);
    expect(result.unrealizedPnLPercent).toBe(0);
  });

  it('handles negative P&L (position at a loss)', () => {
    const result = calculatePositionPnL(teslaPosition);
    expect(result.unrealizedPnL).toBeLessThan(0);
  });

  it('returns 0 P&L % when cost basis is zero', () => {
    const result = calculatePositionPnL(zeroPosition);
    expect(result.unrealizedPnLPercent).toBe(0);
  });

  it('includes the symbol in the result', () => {
    const result = calculatePositionPnL(applePosition);
    expect(result.symbol).toBe('AAPL');
  });

  it('includes the shares in the result', () => {
    const result = calculatePositionPnL(applePosition);
    expect(result.shares).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// calculatePortfolioSummary
// ---------------------------------------------------------------------------

describe('calculatePortfolioSummary', () => {
  it('returns correct total cost basis for multiple positions', () => {
    const summary = calculatePortfolioSummary([applePosition, teslaPosition]);
    // AAPL: 10 * 150 = 1500 | TSLA: 5 * 300 = 1500 → total 3000
    expect(summary.totalCostBasis).toBe(3000);
  });

  it('returns correct total market value', () => {
    const summary = calculatePortfolioSummary([applePosition, teslaPosition]);
    // AAPL: 10 * 189.84 = 1898.4 | TSLA: 5 * 245.11 = 1225.55 → 3123.95
    expect(summary.totalMarketValue).toBeCloseTo(3123.95, 2);
  });

  it('returns correct total unrealised P&L', () => {
    const summary = calculatePortfolioSummary([applePosition, teslaPosition]);
    expect(summary.totalUnrealizedPnL).toBeCloseTo(123.95, 1);
  });

  it('returns 0 unrealised P&L for all-flat portfolio', () => {
    const summary = calculatePortfolioSummary([flatPosition]);
    expect(summary.totalUnrealizedPnL).toBe(0);
    expect(summary.totalUnrealizedPnLPercent).toBe(0);
  });

  it('returns an empty positions array for empty input', () => {
    const summary = calculatePortfolioSummary([]);
    expect(summary.positions).toHaveLength(0);
    expect(summary.totalCostBasis).toBe(0);
    expect(summary.totalMarketValue).toBe(0);
  });

  it('includes one PositionPnL entry per position', () => {
    const summary = calculatePortfolioSummary([applePosition, teslaPosition, flatPosition]);
    expect(summary.positions).toHaveLength(3);
  });

  it('returns 0 % P&L when total cost basis is zero', () => {
    const summary = calculatePortfolioSummary([zeroPosition]);
    expect(summary.totalUnrealizedPnLPercent).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// calculateRealizedPnL
// ---------------------------------------------------------------------------

describe('calculateRealizedPnL', () => {
  it('returns 0 when there are no trades', () => {
    expect(calculateRealizedPnL([])).toBe(0);
  });

  it('returns 0 when only BUY trades exist', () => {
    const trades: Trade[] = [
      { symbol: 'AAPL', side: 'BUY', shares: 10, pricePerShare: 150 },
    ];
    expect(calculateRealizedPnL(trades)).toBe(0);
  });

  it('calculates a simple profit correctly', () => {
    const trades: Trade[] = [
      { symbol: 'AAPL', side: 'BUY', shares: 10, pricePerShare: 150 },
      { symbol: 'AAPL', side: 'SELL', shares: 10, pricePerShare: 200 },
    ];
    // Profit = 10 * (200 - 150) = 500
    expect(calculateRealizedPnL(trades)).toBe(500);
  });

  it('calculates a loss correctly', () => {
    const trades: Trade[] = [
      { symbol: 'TSLA', side: 'BUY', shares: 5, pricePerShare: 300 },
      { symbol: 'TSLA', side: 'SELL', shares: 5, pricePerShare: 245 },
    ];
    // Loss = 5 * (245 - 300) = -275
    expect(calculateRealizedPnL(trades)).toBe(-275);
  });

  it('handles partial sell correctly', () => {
    const trades: Trade[] = [
      { symbol: 'AAPL', side: 'BUY', shares: 10, pricePerShare: 100 },
      { symbol: 'AAPL', side: 'SELL', shares: 5, pricePerShare: 120 },
    ];
    // Profit = 5 * (120 - 100) = 100
    expect(calculateRealizedPnL(trades)).toBe(100);
  });

  it('handles sell when no shares held (ignores excess sell)', () => {
    const trades: Trade[] = [
      { symbol: 'AAPL', side: 'SELL', shares: 5, pricePerShare: 200 },
    ];
    expect(calculateRealizedPnL(trades)).toBe(0);
  });

  it('handles multiple buy-sell cycles', () => {
    const trades: Trade[] = [
      { symbol: 'MSFT', side: 'BUY', shares: 10, pricePerShare: 400 },
      { symbol: 'MSFT', side: 'SELL', shares: 10, pricePerShare: 420 },
      { symbol: 'MSFT', side: 'BUY', shares: 10, pricePerShare: 410 },
      { symbol: 'MSFT', side: 'SELL', shares: 10, pricePerShare: 415 },
    ];
    // Cycle 1: 10 * (420 - 400) = 200
    // Cycle 2: 10 * (415 - 410) = 50
    expect(calculateRealizedPnL(trades)).toBe(250);
  });
});

// ---------------------------------------------------------------------------
// calculatePositionWeights
// ---------------------------------------------------------------------------

describe('calculatePositionWeights', () => {
  it('returns 0 weights for an empty positions array', () => {
    expect(calculatePositionWeights([])).toEqual([]);
  });

  it('returns 100 % weight for a single position', () => {
    const result = calculatePositionWeights([applePosition]);
    expect(result[0]?.weight).toBe(100);
  });

  it('weights sum to approximately 100 for multiple positions', () => {
    const result = calculatePositionWeights([applePosition, teslaPosition]);
    const total = result.reduce((acc, r) => acc + r.weight, 0);
    expect(total).toBeCloseTo(100, 0);
  });

  it('returns 0 % weight for all positions when total value is zero', () => {
    const result = calculatePositionWeights([zeroPosition]);
    expect(result[0]?.weight).toBe(0);
  });

  it('returns the symbol for each position', () => {
    const result = calculatePositionWeights([applePosition, teslaPosition]);
    const symbols = result.map((r) => r.symbol);
    expect(symbols).toContain('AAPL');
    expect(symbols).toContain('TSLA');
  });

  it('a higher-value position has a larger weight', () => {
    // AAPL: 10 * 189.84 = 1898.4 > TSLA: 5 * 245.11 = 1225.55
    const result = calculatePositionWeights([applePosition, teslaPosition]);
    const aapl = result.find((r) => r.symbol === 'AAPL')!;
    const tsla = result.find((r) => r.symbol === 'TSLA')!;
    expect(aapl.weight).toBeGreaterThan(tsla.weight);
  });
});
