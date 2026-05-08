const config = {
  stories: ['../components/**/*.stories.@(tsx|mdx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],

  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
};

export default config;
