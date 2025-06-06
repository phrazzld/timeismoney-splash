import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Use AxeBuilder result type directly to avoid import issues
 */
export type AxeResults = Awaited<ReturnType<AxeBuilder['analyze']>>;

/**
 * Accessibility configuration for axe-core
 */
export const ACCESSIBILITY_CONFIG = {
  /** WCAG 2.1 AA compliance rules and tags */
  TAGS: ['wcag2a', 'wcag2aa', 'wcag21aa'],

  /** Rules to disable (if any exceptions are needed) */
  DISABLED_RULES: [],

  /** Minimum impact level to report as violations */
  MIN_IMPACT_LEVEL: 'serious' as const,

  /** Include experimental rules */
  INCLUDE_EXPERIMENTAL: false,
} as const;

/**
 * Runs comprehensive accessibility audit using axe-core
 *
 * @param page - Playwright page instance
 * @param options - Optional configuration overrides
 * @returns Promise resolving to axe accessibility results
 */
export async function runAxeAudit(
  page: Page,
  options: {
    readonly includeTags?: string[];
    readonly excludeRules?: string[];
    readonly includeExperimental?: boolean;
  } = {},
): Promise<AxeResults> {
  // Wait for page to be fully loaded and stable
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  // Get tags as a mutable array
  const tagsToUse = options.includeTags || [...ACCESSIBILITY_CONFIG.TAGS];

  // Configure axe-core builder
  const axeBuilder = new AxeBuilder({ page })
    // Include WCAG 2.1 AA tags by default
    .include('body')
    .withTags(tagsToUse)
    .options({
      // Configure to be strict about WCAG 2.1 AA compliance
      runOnly: {
        type: 'tag',
        values: tagsToUse,
      },
    });

  // Disable any specified rules
  const rulesToDisable = [...ACCESSIBILITY_CONFIG.DISABLED_RULES, ...(options.excludeRules || [])];

  if (rulesToDisable.length > 0) {
    axeBuilder.disableRules(rulesToDisable);
  }

  // Run the accessibility audit and return results directly
  return await axeBuilder.analyze();
}

/**
 * Asserts that accessibility audit results have no violations
 *
 * @param results - Axe accessibility audit results
 * @param allowedImpactLevels - Impact levels to ignore (default: none)
 * @throws Assertion error if violations are found
 */
export async function assertNoViolations(
  results: AxeResults,
  allowedImpactLevels: string[] = [],
): Promise<void> {
  // Filter violations by impact level
  const significantViolations = results.violations.filter(
    (violation) => violation.impact && !allowedImpactLevels.includes(violation.impact),
  );

  // If violations found, create detailed error message
  if (significantViolations.length > 0) {
    const violationReport = formatViolationReport(significantViolations);
    throw new Error(`Accessibility violations found:\n${violationReport}`);
  }

  // Use Playwright's expect for consistent test reporting
  expect(significantViolations, 'Expected no accessibility violations').toHaveLength(0);
}

/**
 * Asserts that no critical or serious accessibility violations exist
 *
 * @param results - Axe accessibility audit results
 * @throws Assertion error if critical or serious violations are found
 */
export async function assertNoCriticalViolations(results: AxeResults): Promise<void> {
  const criticalViolations = results.violations.filter(
    (violation) => violation.impact === 'critical' || violation.impact === 'serious',
  );

  if (criticalViolations.length > 0) {
    const violationReport = formatViolationReport(criticalViolations);
    throw new Error(`Critical accessibility violations found:\n${violationReport}`);
  }

  expect(
    criticalViolations,
    'Expected no critical or serious accessibility violations',
  ).toHaveLength(0);
}

/**
 * Formats accessibility violations into a readable report
 *
 * @param violations - Array of accessibility violations
 * @returns Formatted violation report string
 */
export function formatViolationReport(violations: AxeResults['violations']): string {
  return violations
    .map((violation) => {
      const nodeCount = violation.nodes.length;
      const nodeText = nodeCount === 1 ? 'node' : 'nodes';

      return [
        `\n  ${violation.impact?.toUpperCase() || 'UNKNOWN'}: ${violation.id}`,
        `  Description: ${violation.description}`,
        `  Help: ${violation.help}`,
        `  Help URL: ${violation.helpUrl}`,
        `  Affected ${nodeText}: ${nodeCount}`,
        ...violation.nodes
          .slice(0, 3)
          .map((node, index) => `    ${index + 1}. ${String(node.target)}`),
        ...(nodeCount > 3 ? [`    ... and ${nodeCount - 3} more`] : []),
      ].join('\n');
    })
    .join('\n');
}

/**
 * Creates a summary report of accessibility audit results
 *
 * @param results - Axe accessibility audit results
 * @returns Formatted summary report
 */
export function formatAccessibilityReport(results: AxeResults): string {
  const violationsByImpact = {
    critical: results.violations.filter((v) => v.impact === 'critical').length,
    serious: results.violations.filter((v) => v.impact === 'serious').length,
    moderate: results.violations.filter((v) => v.impact === 'moderate').length,
    minor: results.violations.filter((v) => v.impact === 'minor').length,
  };

  return [
    'Accessibility Audit Report:',
    `  URL: ${results.url}`,
    `  Timestamp: ${results.timestamp}`,
    `  Total Violations: ${results.violations.length}`,
    `    Critical: ${violationsByImpact.critical}`,
    `    Serious: ${violationsByImpact.serious}`,
    `    Moderate: ${violationsByImpact.moderate}`,
    `    Minor: ${violationsByImpact.minor}`,
    `  Passed Rules: ${results.passes.length}`,
    `  Incomplete Tests: ${results.incomplete.length}`,
  ].join('\n');
}
