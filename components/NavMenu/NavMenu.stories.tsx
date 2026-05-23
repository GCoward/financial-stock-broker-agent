import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { NavMenu } from './NavMenu';

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
