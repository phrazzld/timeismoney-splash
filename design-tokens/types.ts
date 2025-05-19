/**
 * TypeScript interfaces for design tokens
 */

interface ColorScale {
  DEFAULT: string;
  hover: string;
  light: string;
  dark: string;
}

interface NeutralScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

interface BackgroundColors {
  DEFAULT: string;
  secondary: string;
  dark: string;
  darkSecondary: string;
}

export interface BrandColors {
  primary: ColorScale;
  secondary: ColorScale;
  accent: ColorScale;
  neutral: NeutralScale;
  success: Omit<ColorScale, 'hover'>;
  warning: Omit<ColorScale, 'hover'>;
  error: Omit<ColorScale, 'hover'>;
  background: BackgroundColors;
}

export interface TypographyTokens {
  fontFamily: {
    sans: string[];
    mono: string[];
  };
  fontSize: Record<
    string,
    [string, { lineHeight: string; letterSpacing?: string; fontWeight?: string }]
  >;
}

export interface SpacingTokens {
  [key: string]: string;
}
