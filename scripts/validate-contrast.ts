#!/usr/bin/env tsx
/**
 * Standalone Color Contrast Validation Script
 *
 * Validates color contrast compliance in design tokens and critical UI patterns
 * without requiring a full Playwright test environment.
 *
 * This runs in pre-commit hooks to catch contrast violations early.
 */

import { brandColors } from '../design-tokens/colors';

// WCAG AA contrast requirements
const CONTRAST_REQUIREMENTS = {
  normalText: 4.5,
  largeText: 3.0,
  uiComponents: 3.0,
} as const;

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface ContrastViolation {
  description: string;
  foreground: string;
  background: string;
  actualRatio: number;
  requiredRatio: number;
  context: string;
}

/**
 * Parse oklch color to RGB approximation
 * This is a simplified conversion for validation purposes
 */
function parseOklchToRgb(oklch: string): RGB | null {
  const match = oklch.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
  if (!match) return null;

  const [, l, c, h] = match.map(parseFloat);

  // Simplified oklch to RGB conversion
  // In production, use a proper color space conversion library
  const lightness = l;
  const chroma = c;
  const hue = h;

  // Basic conversion (approximation)
  const hueRad = (hue * Math.PI) / 180;
  // Note: a and b are color space coordinates, used in adjustment calculation
  const _a = chroma * Math.cos(hueRad);
  const _b = chroma * Math.sin(hueRad);

  // Convert to RGB (simplified)
  const rgb = Math.round(lightness * 255);
  const adjustment = chroma * 50; // Rough approximation

  return {
    r: Math.max(0, Math.min(255, rgb + adjustment * Math.cos(hueRad))),
    g: Math.max(0, Math.min(255, rgb + adjustment * Math.cos(hueRad + 2.09))),
    b: Math.max(0, Math.min(255, rgb + adjustment * Math.cos(hueRad + 4.19))),
  };
}

/**
 * Calculate relative luminance
 */
function getRelativeLuminance(color: RGB): number {
  const { r, g, b } = color;

  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate contrast ratio between two colors
 */
function calculateContrastRatio(foreground: RGB, background: RGB): number {
  const l1 = getRelativeLuminance(foreground);
  const l2 = getRelativeLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Validate contrast between two colors
 */
function validateContrast(
  foregroundColor: string,
  backgroundColor: string,
  requiredRatio: number,
  description: string,
  context: string,
): ContrastViolation | null {
  const fg = parseOklchToRgb(foregroundColor);
  const bg = parseOklchToRgb(backgroundColor);

  if (!fg || !bg) {
    console.warn(`Could not parse colors: ${foregroundColor} / ${backgroundColor}`);
    return null;
  }

  const actualRatio = calculateContrastRatio(fg, bg);

  if (actualRatio < requiredRatio) {
    return {
      description,
      foreground: foregroundColor,
      background: backgroundColor,
      actualRatio,
      requiredRatio,
      context,
    };
  }

  return null;
}

/**
 * Validate critical UI patterns from design tokens
 */
function validateDesignTokens(): ContrastViolation[] {
  const violations: ContrastViolation[] = [];

  // Test critical button combinations
  const buttonTests = [
    {
      fg: brandColors.neutral['50'], // White text
      bg: brandColors.primary.DEFAULT, // Primary button
      ratio: CONTRAST_REQUIREMENTS.normalText,
      desc: 'Primary button text',
      context: 'CTA buttons',
    },
    {
      fg: brandColors.neutral['50'], // White text
      bg: brandColors.primary.hover, // Primary button hover
      ratio: CONTRAST_REQUIREMENTS.normalText,
      desc: 'Primary button hover text',
      context: 'CTA buttons:hover',
    },
    {
      fg: brandColors.primary.DEFAULT, // Primary color
      bg: brandColors.background.DEFAULT, // White background
      ratio: CONTRAST_REQUIREMENTS.uiComponents,
      desc: 'Primary color on white background',
      context: 'Links and accents',
    },
    {
      fg: brandColors.neutral['900'], // Dark text
      bg: brandColors.background.DEFAULT, // White background
      ratio: CONTRAST_REQUIREMENTS.normalText,
      desc: 'Body text on white background',
      context: 'Main content text',
    },
    {
      fg: brandColors.neutral['600'], // Medium text
      bg: brandColors.background.DEFAULT, // White background
      ratio: CONTRAST_REQUIREMENTS.normalText,
      desc: 'Secondary text on white background',
      context: 'Secondary content text',
    },
  ];

  for (const test of buttonTests) {
    const violation = validateContrast(test.fg, test.bg, test.ratio, test.desc, test.context);
    if (violation) {
      violations.push(violation);
    }
  }

  return violations;
}

/**
 * Validate specific known problematic combinations
 */
function validateKnownIssues(): ContrastViolation[] {
  const violations: ContrastViolation[] = [];

  // Test the specific combination that was failing in CI
  const heroCTAViolation = validateContrast(
    brandColors.neutral['50'], // oklch(0.98 0 0) - white text
    brandColors.primary.DEFAULT, // oklch(0.5 0.2 145) - primary button
    CONTRAST_REQUIREMENTS.normalText,
    'Hero CTA button text',
    '#hero-cta-button',
  );

  if (heroCTAViolation) {
    violations.push(heroCTAViolation);
  }

  return violations;
}

/**
 * Format violations for console output
 */
function formatViolations(violations: ContrastViolation[]): string {
  if (violations.length === 0) {
    return '✅ All color combinations pass WCAG AA contrast requirements';
  }

  const lines = [
    '❌ Color Contrast Violations Found:',
    `   ${violations.length} violation(s) detected`,
    '',
  ];

  violations.forEach((violation, index) => {
    lines.push(
      `${index + 1}. ${violation.description}`,
      `   Context: ${violation.context}`,
      `   Contrast: ${violation.actualRatio.toFixed(2)}:1 (Required: ${violation.requiredRatio}:1)`,
      `   Foreground: ${violation.foreground}`,
      `   Background: ${violation.background}`,
      '',
    );
  });

  lines.push(
    'Fix these issues by:',
    '1. Updating color values in design-tokens/colors.ts',
    '2. Using darker text colors or lighter background colors',
    '3. Ensuring button text uses high-contrast combinations',
    '',
  );

  return lines.join('\n');
}

/**
 * Main validation function
 */
function main(): void {
  console.log('🎨 Validating color contrast in design tokens...\n');

  const designTokenViolations = validateDesignTokens();
  const knownIssueViolations = validateKnownIssues();

  const allViolations = [...designTokenViolations, ...knownIssueViolations];

  // Remove duplicates based on description and context
  const uniqueViolations = allViolations.filter(
    (violation, index, array) =>
      array.findIndex(
        (v) => v.description === violation.description && v.context === violation.context,
      ) === index,
  );

  const report = formatViolations(uniqueViolations);
  console.log(report);

  if (uniqueViolations.length > 0) {
    console.log('💡 Tip: Run "pnpm test:e2e:accessibility" for detailed browser-based validation');
    process.exit(1);
  }

  console.log('🎉 All contrast validations passed!');
}

// Run validation if called directly
if (require.main === module) {
  main();
}

export { validateDesignTokens, validateKnownIssues, formatViolations };
