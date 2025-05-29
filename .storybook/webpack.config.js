// Storybook webpack config
import path from 'path';

export default ({ config }) => {
  // Add support for TypeScript paths
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, '..'),
  };

  return config;
};
