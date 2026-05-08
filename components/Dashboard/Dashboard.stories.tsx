/**
 * @file Dashboard.stories.tsx
 * @description Storybook stories for the Dashboard component.
 */

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Dashboard } from './Dashboard';

const meta: Meta<typeof Dashboard> = {
  title: 'Components/Dashboard',
  component: Dashboard,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#020617' }],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dashboard>;

/** * Full dashboard with mock portfolio data. */
export const Default: Story = {};
