const { mergeConfig } = require('vite');

module.exports = {
  async viteFinal(config) {
    return mergeConfig(config, {
      css: {
        modules: {
          localsConvention: 'camelCase',
        },
      },
    });
  },
  "stories": [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions"
  ],
  "framework": "@storybook/react",
  "core": {
    "builder": "@storybook/builder-vite"
  },
  "features": {
    "storyStoreV7": true
  }
}
