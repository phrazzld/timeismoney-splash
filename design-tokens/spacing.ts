/**
 * Spacing Design Tokens for Time is Money
 *
 * Based on an 8px grid system with additional values for fine-tuning
 */

import type { SpacingTokens } from './types';

/**
 * Spacing tokens using an 8px base unit
 * Follows a consistent scale for spacing throughout the application
 *
 * - 'px' is for 1px borders and hairlines
 * - '0.5' (2px) and '1' (4px) are for very small gaps
 * - Values from 2-20 follow an 8px progression
 * - Larger values are provided for sections and layouts
 */
export const spacingTokens: SpacingTokens = {
  // Special values
  px: '1px', // Hairline
  '0': '0px', // Zero spacing
  '0.5': '2px', // Tiny spacing
  '1': '4px', // Very small spacing

  // Core 8px-based scale
  '2': '8px', // Base unit
  '3': '12px', // 1.5x base
  '4': '16px', // 2x base
  '5': '20px', // 2.5x base
  '6': '24px', // 3x base
  '8': '32px', // 4x base
  '10': '40px', // 5x base
  '12': '48px', // 6x base
  '14': '56px', // 7x base
  '16': '64px', // 8x base
  '18': '72px', // 9x base
  '20': '80px', // 10x base

  // Larger spacings for sections and layouts
  '24': '96px', // 12x base
  '28': '112px', // 14x base
  '32': '128px', // 16x base
  '36': '144px', // 18x base
  '40': '160px', // 20x base
  '48': '192px', // 24x base
  '56': '224px', // 28x base
  '64': '256px', // 32x base
  '72': '288px', // 36x base
  '80': '320px', // 40x base
  '96': '384px', // 48x base
};

/**
 * Named spacing aliases for semantic usage
 * These provide more descriptive names for common spacing values
 */
export const semanticSpacing = {
  none: spacingTokens['0'],
  hairline: spacingTokens['px'],
  tiny: spacingTokens['0.5'],
  xs: spacingTokens['1'],
  sm: spacingTokens['2'],
  md: spacingTokens['4'],
  lg: spacingTokens['6'],
  xl: spacingTokens['8'],
  '2xl': spacingTokens['12'],
  '3xl': spacingTokens['16'],
  '4xl': spacingTokens['24'],
  '5xl': spacingTokens['32'],
  '6xl': spacingTokens['48'],
  '7xl': spacingTokens['64'],
  '8xl': spacingTokens['96'],

  // Common component spacings
  buttonPadding: spacingTokens['3'],
  inputPadding: spacingTokens['2'],
  cardPadding: spacingTokens['4'],
  sectionPadding: spacingTokens['8'],
  pagePadding: spacingTokens['6'],
};

export default spacingTokens;
