/**
 * PostCSS configuration for Storybook
 * This ensures Tailwind CSS works correctly in Storybook
 */
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};