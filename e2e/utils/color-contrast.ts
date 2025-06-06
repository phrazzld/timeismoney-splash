import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * WCAG AA contrast requirements
 */
export const CONTRAST_REQUIREMENTS = {
  /** Normal text requires 4.5:1 contrast ratio */
  normalText: 4.5,
  /** Large text (18pt+ or 14pt+ bold) requires 3:1 contrast ratio */
  largeText: 3.0,
  /** UI components and graphical objects require 3:1 contrast ratio */
  uiComponents: 3.0,
} as const;

/**
 * Result of color contrast validation
 */
export interface ContrastValidationResult {
  /** Total number of text elements tested */
  totalElements: number;
  /** Number of elements that passed contrast requirements */
  passingElements: number;
  /** Number of elements that failed contrast requirements */
  failingElements: number;
  /** Detailed violations */
  violations: ContrastViolation[];
  /** Overall pass/fail status */
  passes: boolean;
}

/**
 * Details of a contrast violation
 */
export interface ContrastViolation {
  /** CSS selector for the element */
  selector: string;
  /** Actual contrast ratio */
  actualRatio: number;
  /** Required contrast ratio */
  requiredRatio: number;
  /** Foreground color */
  foregroundColor: string;
  /** Background color */
  backgroundColor: string;
  /** Font size in pixels */
  fontSize: number;
  /** Font weight */
  fontWeight: string;
  /** Sample text from the element */
  text: string;
}

/**
 * RGB color representation
 */
interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Validates color contrast for all text elements on the page
 *
 * @param page - Playwright page instance
 * @returns Comprehensive contrast validation results
 */
export async function validateColorContrast(page: Page): Promise<ContrastValidationResult> {
  const violations: ContrastViolation[] = [];
  let totalElements = 0;
  let passingElements = 0;

  // Get all text-containing elements
  const textSelectors = [
    'p',
    'span',
    'div',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'a',
    'button',
    'label',
    'td',
    'th',
    'li',
    'dd',
    'dt',
    '[role="button"]',
    '[role="link"]',
    '[role="heading"]',
  ];

  for (const selector of textSelectors) {
    const elements = await page.locator(selector).all();

    for (const element of elements) {
      // Skip if element is not visible or has no text
      if (!(await element.isVisible())) continue;

      const text = await element.textContent();
      if (!text?.trim()) continue;

      totalElements++;

      // Get computed styles
      const styles = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight,
        };
      });

      // Get effective background color (traverse up the DOM if needed)
      const effectiveBackgroundColor = await getEffectiveBackgroundColor(page, element);

      // Calculate contrast ratio
      const foreground = parseColor(styles.color);
      const background = parseColor(effectiveBackgroundColor);

      if (!foreground || !background) {
        continue;
      }

      const contrastRatio = calculateContrastRatio(foreground, background);

      // Determine required ratio
      const fontSize = parseFloat(styles.fontSize);
      const isBold = parseInt(styles.fontWeight) >= 700;
      const isLargeText = fontSize >= 18 || (fontSize >= 14 && isBold);
      const requiredRatio = isLargeText
        ? CONTRAST_REQUIREMENTS.largeText
        : CONTRAST_REQUIREMENTS.normalText;

      // Check if it passes
      if (contrastRatio < requiredRatio) {
        const elementSelector = await element.evaluate((el) => {
          if (el.id) return `#${el.id}`;
          if (el.className) return `${el.tagName.toLowerCase()}.${el.className.split(' ')[0]}`;
          return el.tagName.toLowerCase();
        });

        violations.push({
          selector: elementSelector,
          actualRatio: contrastRatio,
          requiredRatio,
          foregroundColor: styles.color,
          backgroundColor: effectiveBackgroundColor,
          fontSize,
          fontWeight: styles.fontWeight,
          text: text.substring(0, 50),
        });
      } else {
        passingElements++;
      }
    }
  }

  return {
    totalElements,
    passingElements,
    failingElements: violations.length,
    violations,
    passes: violations.length === 0,
  };
}

/**
 * Gets the effective background color of an element
 * Traverses up the DOM tree to find the first non-transparent background
 *
 * @param page - Playwright page instance
 * @param element - Element to check
 * @returns Effective background color
 */
async function getEffectiveBackgroundColor(page: Page, element: Locator): Promise<string> {
  return await element.evaluate((el) => {
    let currentEl: Element | null = el;
    let backgroundColor = 'rgba(0, 0, 0, 0)';

    while (currentEl && currentEl !== document.body) {
      const computed = window.getComputedStyle(currentEl);
      const bg = computed.backgroundColor;

      // Check if background is not transparent
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        backgroundColor = bg;
        break;
      }

      currentEl = currentEl.parentElement;
    }

    // If still transparent, use white as default
    if (backgroundColor === 'rgba(0, 0, 0, 0)') {
      backgroundColor = 'rgb(255, 255, 255)';
    }

    return backgroundColor;
  });
}

/**
 * Parses a CSS color string into RGB values
 *
 * @param color - CSS color string
 * @returns RGB color object or null if parsing fails
 */
function parseColor(color: string): RGBColor | null {
  // Handle rgb() and rgba() formats
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
    };
  }

  // Handle hex format
  const hexMatch = color.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1], 16),
      g: parseInt(hexMatch[2], 16),
      b: parseInt(hexMatch[3], 16),
    };
  }

  // Handle oklch format (convert to RGB approximation)
  const oklchMatch = color.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
  if (oklchMatch) {
    // Simplified conversion - in production, use a proper color space conversion library
    const l = parseFloat(oklchMatch[1]);
    const rgb = Math.round(l * 255);
    return { r: rgb, g: rgb, b: rgb };
  }

  return null;
}

/**
 * Calculates the contrast ratio between two colors
 * Using WCAG 2.1 formula
 *
 * @param foreground - Foreground color
 * @param background - Background color
 * @returns Contrast ratio
 */
function calculateContrastRatio(foreground: RGBColor, background: RGBColor): number {
  const l1 = getRelativeLuminance(foreground);
  const l2 = getRelativeLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calculates relative luminance of a color
 *
 * @param color - RGB color
 * @returns Relative luminance value
 */
function getRelativeLuminance(color: RGBColor): number {
  const { r, g, b } = color;

  // Convert to sRGB
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  // Apply gamma correction
  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  // Calculate luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Gets the contrast ratio for a specific element
 *
 * @param page - Playwright page instance
 * @param selector - CSS selector for the element
 * @returns Contrast ratio or null if element not found
 */
export async function getElementContrast(page: Page, selector: string): Promise<number | null> {
  const element = page.locator(selector).first();

  if (!(await element.count())) {
    return null;
  }

  const styles = await element.evaluate((el) => {
    const computed = window.getComputedStyle(el);
    return {
      color: computed.color,
      backgroundColor: computed.backgroundColor,
    };
  });

  const effectiveBackgroundColor = await getEffectiveBackgroundColor(page, element);

  const foreground = parseColor(styles.color);
  const background = parseColor(effectiveBackgroundColor);

  if (!foreground || !background) {
    return null;
  }

  return calculateContrastRatio(foreground, background);
}

/**
 * Asserts that a contrast ratio meets WCAG requirements
 *
 * @param contrast - Actual contrast ratio
 * @param fontSize - Font size in pixels
 * @param isBold - Whether text is bold
 * @throws Error if contrast doesn't meet requirements
 */
export async function assertContrastCompliance(
  contrast: number,
  fontSize: number,
  isBold: boolean = false,
): Promise<void> {
  const isLargeText = fontSize >= 18 || (fontSize >= 14 && isBold);
  const requiredRatio = isLargeText
    ? CONTRAST_REQUIREMENTS.largeText
    : CONTRAST_REQUIREMENTS.normalText;

  expect(
    contrast,
    `Contrast ratio ${contrast.toFixed(2)}:1 does not meet WCAG AA requirement of ${requiredRatio}:1`,
  ).toBeGreaterThanOrEqual(requiredRatio);
}

/**
 * Validates contrast for specific UI components
 *
 * @param page - Playwright page instance
 * @returns Validation results for UI components
 */
export async function validateUIComponentContrast(page: Page): Promise<ContrastValidationResult> {
  const violations: ContrastViolation[] = [];
  let totalElements = 0;
  let passingElements = 0;

  // Check buttons, inputs, and other UI components
  const uiSelectors = [
    'button',
    'input[type="text"]',
    'input[type="email"]',
    'input[type="password"]',
    'input[type="search"]',
    'select',
    'textarea',
    '[role="button"]',
    'a.button', // Link styled as button
  ];

  for (const selector of uiSelectors) {
    const elements = await page.locator(selector).all();

    for (const element of elements) {
      if (!(await element.isVisible())) continue;

      totalElements++;

      // Get border and background colors
      const styles = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          borderColor: computed.borderColor,
          backgroundColor: computed.backgroundColor,
          color: computed.color,
        };
      });

      // Check border contrast (for form fields)
      if (styles.borderColor && styles.borderColor !== 'transparent') {
        const background = await getEffectiveBackgroundColor(page, element);
        const border = parseColor(styles.borderColor);
        const bg = parseColor(background);

        if (border && bg) {
          const borderContrast = calculateContrastRatio(border, bg);

          if (borderContrast < CONTRAST_REQUIREMENTS.uiComponents) {
            const elementSelector = await element.evaluate((el) => {
              if (el.id) return `#${el.id}`;
              return el.tagName.toLowerCase();
            });

            violations.push({
              selector: elementSelector,
              actualRatio: borderContrast,
              requiredRatio: CONTRAST_REQUIREMENTS.uiComponents,
              foregroundColor: styles.borderColor,
              backgroundColor: background,
              fontSize: 0, // N/A for borders
              fontWeight: 'normal',
              text: 'UI Component Border',
            });
          } else {
            passingElements++;
          }
        }
      }
    }
  }

  return {
    totalElements,
    passingElements,
    failingElements: violations.length,
    violations,
    passes: violations.length === 0,
  };
}

/**
 * Formats a contrast validation report for display
 *
 * @param result - Contrast validation result
 * @returns Formatted report string
 */
export function formatContrastReport(result: ContrastValidationResult): string {
  const lines = [
    'Color Contrast Validation Report:',
    `  Total Elements Tested: ${result.totalElements}`,
    `  Passing Elements: ${result.passingElements}`,
    `  Failing Elements: ${result.failingElements}`,
    `  Overall Status: ${result.passes ? 'PASS' : 'FAIL'}`,
  ];

  if (result.violations.length > 0) {
    lines.push('\nViolations:');
    result.violations.forEach((violation, index) => {
      lines.push(
        `\n  ${index + 1}. ${violation.selector}`,
        `     Text: "${violation.text}"`,
        `     Contrast: ${violation.actualRatio.toFixed(2)}:1 (Required: ${violation.requiredRatio}:1)`,
        `     Foreground: ${violation.foregroundColor}`,
        `     Background: ${violation.backgroundColor}`,
        `     Font: ${violation.fontSize}px ${violation.fontWeight}`,
      );
    });
  }

  return lines.join('\n');
}
