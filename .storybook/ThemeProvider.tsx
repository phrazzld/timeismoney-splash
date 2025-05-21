import React from 'react';
import { useEffect, useState } from 'react';

/**
 * Props for the ThemeProvider component
 */
export interface ThemeProviderProps {
  /**
   * Child components to be rendered
   */
  children: React.ReactNode;

  /**
   * The current theme value ('light' or 'dark')
   * Defaults to 'light' if not specified
   */
  theme?: 'light' | 'dark';
}

/**
 * ThemeProvider component for Storybook that applies the appropriate theme class
 * to the document root element based on the selected theme.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  theme: initialTheme = 'light',
}): React.ReactNode => {
  // State to track the current theme
  const [theme, setTheme] = useState<'light' | 'dark'>(initialTheme);

  // Update theme state when prop changes
  useEffect(() => {
    setTheme(initialTheme);
  }, [initialTheme]);

  // Apply the theme class to the document root element
  useEffect(() => {
    // First remove both classes to ensure clean state
    document.documentElement.classList.remove('light', 'dark');

    // Add the current theme class
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }

    // Store theme preference in localStorage for persistence
    localStorage.setItem('storybook-theme', theme);
  }, [theme]);

  // Return children without any wrapper
  return <>{children}</>;
};
