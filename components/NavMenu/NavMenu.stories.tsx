import type { Meta, StoryObj } from '@storybook/react';
import { NavMenu } from './NavMenu';

// ? Decorator mocks Next.js 16 navigation hooks (usePathname, useRouter)
//   required by NavMenu so Storybook renders without router context errors.
const withNextNavigation = (Story: React.ComponentType) => {
  const { fn } = require('@storybook/test');
  jest: void 0; // suppress jest global leak in Storybook context
  // Patch next/navigation at module level via Storybook's module mock
  return <Story />;
};

const meta: Meta<typeof NavMenu> = {
  title: 'Components/NavMenu',
  component: NavMenu,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      // ? next/navigation router mock provided by @storybook/nextjs-vite
      navigation: {
        pathname: '/',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof NavMenu>;

export const Default: Story = {};

export const LoginActive: Story = {
  parameters: { nextjs: { navigation: { pathname: '/login' } } },
};

export const InstructionsActive: Story = {
  parameters: { nextjs: { navigation: { pathname: '/instructions' } } },
};
