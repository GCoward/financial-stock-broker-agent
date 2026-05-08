/**
 * @file PortfolioCard.stories.tsx
 * @description Storybook stories for the PortfolioCard component.
 */

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PortfolioCard } from './PortfolioCard';

const meta: Meta<typeof PortfolioCard> = {
  title: 'Components/PortfolioCard',
  component: PortfolioCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#0f172a' }],
    },
  },
};

export default meta;
type Story = StoryObj<typeof PortfolioCard>;

/** * Profitable position – green P&L indicators. */
export const Profit: Story = {
  args: {
    position: {
      symbol: 'AAPL',
      shares: 10,
      costBasis: 1500,
      marketValue: 1898.4,
      unrealizedPnL: 398.4,
      unrealizedPnLPercent: 26.56,
    },
  },
};

/** * Loss position – red P&L indicators. */
export const Loss: Story = {
  args: {
    position: {
      symbol: 'TSLA',
      shares: 5,
      costBasis: 1500,
      marketValue: 1225.55,
      unrealizedPnL: -274.45,
      unrealizedPnLPercent: -18.3,
    },
  },
};

/** * Flat position – no P&L change. */
export const Flat: Story = {
  args: {
    position: {
      symbol: 'FLAT',
      shares: 20,
      costBasis: 2000,
      marketValue: 2000,
      unrealizedPnL: 0,
      unrealizedPnLPercent: 0,
    },
  },
};

/** * Card with an active onTradeClick handler. */
export const WithTradeButton: Story = {
  args: {
    position: {
      symbol: 'NVDA',
      shares: 3,
      costBasis: 2626.2,
      marketValue: 2626.2,
      unrealizedPnL: 0,
      unrealizedPnLPercent: 0,
    },
    onTradeClick: (symbol: string) => alert(`Trade clicked for ${symbol}`),
  },
};
