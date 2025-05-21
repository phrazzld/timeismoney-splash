# Storybook Configuration

This directory contains the configuration files for Storybook.

## Theme Support

The theme switching functionality is implemented in:

- `ThemeProvider.tsx`: Component that applies theme classes to the document root
- `preview.tsx`: Storybook preview configuration with theme decorator

## Configuration Files

- `main.ts`: Main Storybook configuration (addons, stories location)
- `manager.ts`: Configuration for the Storybook manager UI
- `postcss.config.js`: PostCSS configuration specifically for Storybook
- `tsconfig.json`: TypeScript configuration for Storybook files

## Known Issues

Current ESLint configuration has issues with Storybook files. This will be fixed in task T015.2.

## Usage

To test the theme switching:

1. Start Storybook with `pnpm storybook`
2. Use the theme toggle in the toolbar to switch between light and dark modes
3. Components using Tailwind's dark mode variant (`dark:`) will respond to theme changes
