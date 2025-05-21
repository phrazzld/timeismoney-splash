import type { Config } from 'tailwindcss';
import { brandColors } from './design-tokens/colors';
import {
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
} from './design-tokens/typography';
import { spacingTokens } from './design-tokens/spacing';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Map brandColors to Tailwind's color format
        primary: {
          DEFAULT: brandColors.primary.DEFAULT,
          hover: brandColors.primary.hover,
          light: brandColors.primary.light,
          dark: brandColors.primary.dark,
        },
        secondary: {
          DEFAULT: brandColors.secondary.DEFAULT,
          hover: brandColors.secondary.hover,
          light: brandColors.secondary.light,
          dark: brandColors.secondary.dark,
        },
        accent: {
          DEFAULT: brandColors.accent.DEFAULT,
          hover: brandColors.accent.hover,
          light: brandColors.accent.light,
          dark: brandColors.accent.dark,
        },
        // Neutral scale
        neutral: {
          50: brandColors.neutral[50],
          100: brandColors.neutral[100],
          200: brandColors.neutral[200],
          300: brandColors.neutral[300],
          400: brandColors.neutral[400],
          500: brandColors.neutral[500],
          600: brandColors.neutral[600],
          700: brandColors.neutral[700],
          800: brandColors.neutral[800],
          900: brandColors.neutral[900],
        },
        // Semantic colors
        success: {
          DEFAULT: brandColors.success.DEFAULT,
          light: brandColors.success.light,
          dark: brandColors.success.dark,
        },
        warning: {
          DEFAULT: brandColors.warning.DEFAULT,
          light: brandColors.warning.light,
          dark: brandColors.warning.dark,
        },
        error: {
          DEFAULT: brandColors.error.DEFAULT,
          light: brandColors.error.light,
          dark: brandColors.error.dark,
        },
        // Background colors
        background: {
          DEFAULT: brandColors.background.DEFAULT,
          secondary: brandColors.background.secondary,
          dark: brandColors.background.dark,
          darkSecondary: brandColors.background.darkSecondary,
        },
      },
      fontFamily: {
        sans: fontFamilies.sans.split(',').map((font) => font.trim()),
        mono: fontFamilies.mono.split(',').map((font) => font.trim()),
      },
      fontSize: {
        xs: fontSizes.xs,
        sm: fontSizes.sm,
        base: fontSizes.base,
        lg: fontSizes.lg,
        xl: fontSizes.xl,
        '2xl': fontSizes['2xl'],
        '3xl': fontSizes['3xl'],
        '4xl': fontSizes['4xl'],
        '5xl': fontSizes['5xl'],
        '6xl': fontSizes['6xl'],
        '7xl': fontSizes['7xl'],
        '8xl': fontSizes['8xl'],
        '9xl': fontSizes['9xl'],
      },
      fontWeight: {
        light: fontWeights.light.toString(),
        normal: fontWeights.normal.toString(),
        medium: fontWeights.medium.toString(),
        semibold: fontWeights.semibold.toString(),
        bold: fontWeights.bold.toString(),
      },
      lineHeight: {
        none: lineHeights.none,
        tight: lineHeights.tight,
        snug: lineHeights.snug,
        normal: lineHeights.normal,
        relaxed: lineHeights.relaxed,
        loose: lineHeights.loose,
      },
      letterSpacing: {
        tighter: letterSpacings.tighter,
        tight: letterSpacings.tight,
        normal: letterSpacings.normal,
        wide: letterSpacings.wide,
        wider: letterSpacings.wider,
        widest: letterSpacings.widest,
      },
      // Spacing scale based on 8px grid system
      spacing: spacingTokens,
    },
  },
  plugins: [],
};

export default config;
