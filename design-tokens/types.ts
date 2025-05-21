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

export interface FontFamilies {
  sans: string;
  mono: string;
}

export interface FontSizes {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
  '7xl': string;
  '8xl': string;
  '9xl': string;
}

export interface FontWeights {
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
}

export interface LineHeights {
  none: string;
  tight: string;
  snug: string;
  normal: string;
  relaxed: string;
  loose: string;
}

export interface LetterSpacings {
  tighter: string;
  tight: string;
  normal: string;
  wide: string;
  wider: string;
  widest: string;
}

export interface TypographyTokens {
  fontFamilies: FontFamilies;
  fontSizes: FontSizes;
  fontWeights: FontWeights;
  lineHeights: LineHeights;
  letterSpacings: LetterSpacings;
}

export interface TypographyPreset {
  fontSize: string;
  fontWeight: number;
  lineHeight: string;
  letterSpacing: string;
  fontFamily: string;
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
}

export interface TypographyPresets {
  h1: TypographyPreset;
  h2: TypographyPreset;
  h3: TypographyPreset;
  h4: TypographyPreset;
  h5: TypographyPreset;
  h6: TypographyPreset;
  bodyLarge: TypographyPreset;
  body: TypographyPreset;
  bodySmall: TypographyPreset;
  caption: TypographyPreset;
  overline: TypographyPreset;
  label: TypographyPreset;
  code: TypographyPreset;
  codeBlock: TypographyPreset;
}

export interface SpacingTokens {
  [key: string]: string;
}
