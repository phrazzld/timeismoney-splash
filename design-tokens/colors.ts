/**
 * Brand Color Palette for Time is Money
 * Extracted from logo-01.png and logo-02.png
 *
 * The primary color is a vibrant green from the hourglass logos,
 * with supporting colors to create a cohesive time/money theme.
 */

export const brandColors = {
  // Primary colors - from logo
  primary: {
    DEFAULT: 'oklch(0.7 0.2 145)', // Vibrant green (#5CB85C approx)
    hover: 'oklch(0.65 0.2 145)', // Slightly darker for hover states
    light: 'oklch(0.85 0.15 145)', // Lighter variant
    dark: 'oklch(0.5 0.2 145)', // Darker variant
  },

  // Secondary colors - complementary
  secondary: {
    DEFAULT: 'oklch(0.6 0.15 130)', // Teal-green
    hover: 'oklch(0.55 0.15 130)',
    light: 'oklch(0.8 0.1 130)',
    dark: 'oklch(0.4 0.15 130)',
  },

  // Accent colors - hourglass sand/gold theme
  accent: {
    DEFAULT: 'oklch(0.8 0.15 85)', // Sand/gold color
    hover: 'oklch(0.75 0.15 85)',
    light: 'oklch(0.9 0.1 85)',
    dark: 'oklch(0.6 0.15 85)',
  },

  // Neutral colors for text and backgrounds
  neutral: {
    50: 'oklch(0.98 0 0)', // Near white
    100: 'oklch(0.96 0 0)',
    200: 'oklch(0.9 0 0)',
    300: 'oklch(0.8 0 0)',
    400: 'oklch(0.6 0 0)',
    500: 'oklch(0.5 0 0)',
    600: 'oklch(0.4 0 0)',
    700: 'oklch(0.3 0 0)',
    800: 'oklch(0.2 0 0)',
    900: 'oklch(0.1 0 0)', // Near black
  },

  // Semantic colors
  success: {
    DEFAULT: 'oklch(0.7 0.2 145)', // Same as primary for consistency
    light: 'oklch(0.85 0.15 145)',
    dark: 'oklch(0.5 0.2 145)',
  },

  warning: {
    DEFAULT: 'oklch(0.8 0.2 85)', // Yellow-orange
    light: 'oklch(0.9 0.15 85)',
    dark: 'oklch(0.6 0.2 85)',
  },

  error: {
    DEFAULT: 'oklch(0.6 0.2 25)', // Red
    light: 'oklch(0.8 0.15 25)',
    dark: 'oklch(0.4 0.2 25)',
  },

  // Background colors
  background: {
    DEFAULT: 'oklch(0.99 0 0)', // Light mode background
    secondary: 'oklch(0.97 0 0)',
    dark: 'oklch(0.1 0 0)', // Dark mode background
    darkSecondary: 'oklch(0.15 0 0)',
  },
};

// Alternative hex values for reference and fallback
export const hexColors = {
  primary: {
    DEFAULT: '#5CB85C', // Extracted from logo
    hover: '#4CAE4C',
    light: '#A5D6A5',
    dark: '#388E3C',
  },
  secondary: {
    DEFAULT: '#26A69A',
    hover: '#00897B',
    light: '#80CBC4',
    dark: '#00695C',
  },
  accent: {
    DEFAULT: '#FFB74D',
    hover: '#FFA726',
    light: '#FFE0B2',
    dark: '#F57C00',
  },
  // ... rest of hex colors if needed
};
