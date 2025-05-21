# Storybook Setup Documentation

This document outlines the Storybook configuration used in the Time is Money project.

## Installation

Storybook is already installed with the following dependencies:

- `storybook` (v8.6.14)
- `@storybook/nextjs` (v8.6.14)
- `@storybook/react` (v8.6.14)
- `@storybook/addon-essentials` (v8.6.14)
- `@storybook/addon-interactions` (v8.6.14)
- `@storybook/addon-links` (v8.6.14)
- `@storybook/addon-a11y` (v8.6.14)
- `webpack` (v5.99.9) - required as a peer dependency

## Configuration

The Storybook configuration is defined in the `.storybook/` directory with the following key files:

1. **main.ts** - Main configuration file that defines:

   - Story glob patterns: `../components/**/*.stories.@(js|jsx|ts|tsx)`, `../app/**/*.stories.@(js|jsx|ts|tsx)`
   - Addons: links, essentials, interactions, a11y
   - Framework: Next.js
   - Static directories: `../public`

2. **preview.ts** - Default preview configuration:

   - Imports global CSS from `../app/globals.css`
   - Configures parameter defaults (actions, controls, backgrounds)
   - Sets up themes for light/dark mode

3. **preview.tsx** - Enhanced preview with React components:

   - Adds theme decorator to wrap stories
   - Configures toolbar for theme switching

4. **ThemeProvider.tsx** - Custom component for theme handling:
   - Toggles between light and dark themes
   - Updates document classes to match the selected theme

## Usage

To run Storybook, use the following command:

```bash
pnpm storybook
```

This will start Storybook on [http://localhost:6006](http://localhost:6006).

To build Storybook for static deployment:

```bash
pnpm build-storybook
```

## Existing Stories

The project already has several components with stories:

- `/components/atoms/Button/Button.stories.tsx`
- `/components/atoms/Icon/Icon.stories.tsx`
- `/components/atoms/Logo/Logo.stories.tsx`
- `/components/atoms/Typography/Typography.stories.tsx`
- `/components/examples/Button.stories.tsx`

## Theme Support

The Storybook configuration includes support for both light and dark themes, with a theme toggle in the toolbar. This allows for testing components in both color schemes.

## Accessibility Testing

The `@storybook/addon-a11y` addon is configured to provide accessibility testing for components. This helps ensure that UI components meet WCAG 2.1 AA standards.

## Visual Regression Testing

Chromatic is integrated for visual regression testing (task T028). It's configured to run on the Storybook build and captures snapshots for comparison.
