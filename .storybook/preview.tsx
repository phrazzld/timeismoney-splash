import type { Preview, StoryContext } from '@storybook/react';
import { ThemeProvider } from './ThemeProvider';
import '../app/globals.css';
import React from 'react';

/**
 * Storybook preview configuration with theme support
 * This preview setup configures theme switching for components in Storybook
 */
const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: 'oklch(0.99 0 0)',
        },
        {
          name: 'dark',
          value: 'oklch(0.1 0 0)',
        },
      ],
    },
    themes: {
      default: 'light',
      list: [
        { name: 'light', class: '', color: 'oklch(0.99 0 0)' },
        { name: 'dark', class: 'dark', color: 'oklch(0.1 0 0)' },
      ],
    },
  },
  decorators: [
    /**
     * Theme decorator that applies the correct class based on the selected theme
     */
    (Story: React.ComponentType, context: StoryContext): React.ReactNode => {
      // Get the theme value from Storybook globals context
      const theme = context.globals.theme || 'light';

      return (
        <ThemeProvider theme={theme}>
          <Story />
        </ThemeProvider>
      );
    },
  ],
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        showName: true,
      },
    },
  },
};

export default preview;
