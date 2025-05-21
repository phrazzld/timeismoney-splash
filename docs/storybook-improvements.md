# Storybook Improvements

This document outlines recommended improvements to the Storybook setup that were identified during testing.

## Path Resolution

The current Storybook setup has issues with Next.js path aliases (`@/lib/utils`, etc.). Two possible fixes:

1. **Add webpack configuration**:
   - Create a `.storybook/webpack.config.js` file with path alias resolution
   - Example implementation provided in this PR

2. **Simplify component imports in stories**:
   - Use relative imports in story files rather than path aliases
   - Duplicate utility functions locally when needed for test components

## Tailwind CSS Configuration

For Tailwind CSS 4, the PostCSS plugin has moved to a separate package:

```js
// postcss.config.mjs
const config = {
  plugins: {
    '@tailwindcss/postcss': {}, // Previously 'tailwindcss'
    autoprefixer: {},
  },
};

export default config;
```

## Theme Decorator

The current theme implementation in Storybook should be enhanced:

1. Create a robust ThemeProvider decorator that applies theme classes
2. Ensure consistent dark mode application across all components
3. Add a theme toggle in the Storybook toolbar

## Documentation

Add comprehensive documentation for the Storybook setup:

1. How to create new stories
2. How to use the theme toggle
3. Best practices for component documentation
4. Guidelines for accessibility testing

## CI/CD Integration

Set up continuous integration for Storybook:

1. Automated visual testing with Chromatic or similar tools
2. Deploy Storybook to a static hosting service on each merge to main

## Component State Management

Improve state management within stories:

1. Add examples of controlled vs. uncontrolled components
2. Demonstrate context usage where appropriate
3. Show form validation examples

These improvements should be prioritized according to the project roadmap.