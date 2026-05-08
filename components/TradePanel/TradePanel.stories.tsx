/**
 * @file TradePanel.stories.tsx
 * @description Storybook stories for the TradePanel component.
 */

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TradePanel } from './TradePanel';

const meta: Meta<typeof TradePanel> = {
  title: 'Components/TradePanel',
  component: TradePanel,
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
type Story = StoryObj<typeof TradePanel>;

/** * Default empty trade panel. */
export const Default: Story = {};

/** * Pre-filled with AAPL symbol. */
export const PreFilledSymbol: Story = {
  args: {
    defaultSymbol: 'AAPL',
  },
};

/** * Panel with a console-logging onSubmit handler. */
export const WithSubmitHandler: Story = {
  args: {
    defaultSymbol: 'TSLA',
    onSubmit: (order) => console.log('Order submitted:', order),
  },
};
