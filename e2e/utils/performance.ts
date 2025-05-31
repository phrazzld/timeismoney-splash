import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Core Web Vitals metrics interface
 */
export interface CoreWebVitalsMetrics {
  /** Largest Contentful Paint - time to render the largest content element (ms) */
  lcp: number;
  /** First Input Delay - delay between first user interaction and browser response (ms) */
  fid: number;
  /** Cumulative Layout Shift - sum of all unexpected layout shifts */
  cls: number;
  /** Time to First Byte - time from navigation start to first byte received (ms) */
  ttfb: number;
  /** First Contentful Paint - time to render first content (ms) */
  fcp: number;
}

/**
 * Performance budget thresholds based on Core Web Vitals recommendations
 * and project requirements from T019
 */
export const PERFORMANCE_BUDGET = {
  /** Largest Contentful Paint threshold (2.5 seconds) */
  LCP_THRESHOLD: 2500,
  /** First Input Delay threshold (100 milliseconds) */
  FID_THRESHOLD: 100,
  /** Cumulative Layout Shift threshold (0.1) */
  CLS_THRESHOLD: 0.1,
  /** Time to First Byte threshold (1.8 seconds) */
  TTFB_THRESHOLD: 1800,
  /** First Contentful Paint threshold (1.8 seconds) */
  FCP_THRESHOLD: 1800,
} as const;

/**
 * Measures Core Web Vitals using the Navigation Timing API and Performance Observer
 *
 * @param page - Playwright page instance
 * @returns Promise resolving to Core Web Vitals metrics
 */
export async function measureCoreWebVitals(page: Page): Promise<CoreWebVitalsMetrics> {
  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');

  // Inject and execute performance measurement script
  const metrics = await page.evaluate((): Promise<CoreWebVitalsMetrics> => {
    return new Promise((resolve) => {
      // Initialize metrics object with default values
      const metrics: Partial<CoreWebVitalsMetrics> = {};

      // Use Performance Observer to capture Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Capture Largest Contentful Paint
          if (entry.entryType === 'largest-contentful-paint') {
            metrics.lcp = entry.startTime;
          }

          // Capture First Input Delay
          if (entry.entryType === 'first-input' && 'processingStart' in entry) {
            const firstInputEntry = entry as PerformanceEventTiming;
            metrics.fid = firstInputEntry.processingStart - entry.startTime;
          }

          // Capture Cumulative Layout Shift
          if (entry.entryType === 'layout-shift') {
            const layoutShiftEntry = entry as PerformanceEntry & {
              hadRecentInput: boolean;
              value: number;
            };
            if (!layoutShiftEntry.hadRecentInput) {
              metrics.cls = (metrics.cls || 0) + layoutShiftEntry.value;
            }
          }
        }
      });

      // Observe relevant performance entry types
      observer.observe({
        type: 'largest-contentful-paint',
        buffered: true,
      });

      observer.observe({
        type: 'first-input',
        buffered: true,
      });

      observer.observe({
        type: 'layout-shift',
        buffered: true,
      });

      // Get navigation timing metrics
      const navigation = performance.getEntriesByType(
        'navigation',
      )[0] as PerformanceNavigationTiming;

      if (navigation) {
        metrics.ttfb = navigation.responseStart - navigation.requestStart;
      }

      // Get First Contentful Paint from paint timing
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        metrics.fcp = fcpEntry.startTime;
      }

      // Wait a bit for async metrics to be captured, then resolve
      setTimeout(() => {
        resolve({
          lcp: metrics.lcp || 0,
          fid: metrics.fid || 0,
          cls: metrics.cls || 0,
          ttfb: metrics.ttfb || 0,
          fcp: metrics.fcp || 0,
        });
      }, 1000);
    });
  });

  return metrics;
}

/**
 * Asserts that performance metrics meet the defined budget thresholds
 *
 * @param metrics - Measured Core Web Vitals metrics
 * @throws Assertion error if any metric exceeds its threshold
 */
export async function assertPerformanceBudget(metrics: CoreWebVitalsMetrics): Promise<void> {
  // Assert Largest Contentful Paint is within budget
  expect(
    metrics.lcp,
    `LCP (${metrics.lcp}ms) exceeds threshold (${PERFORMANCE_BUDGET.LCP_THRESHOLD}ms)`,
  ).toBeLessThanOrEqual(PERFORMANCE_BUDGET.LCP_THRESHOLD);

  // Assert First Input Delay is within budget
  expect(
    metrics.fid,
    `FID (${metrics.fid}ms) exceeds threshold (${PERFORMANCE_BUDGET.FID_THRESHOLD}ms)`,
  ).toBeLessThanOrEqual(PERFORMANCE_BUDGET.FID_THRESHOLD);

  // Assert Cumulative Layout Shift is within budget
  expect(
    metrics.cls,
    `CLS (${metrics.cls}) exceeds threshold (${PERFORMANCE_BUDGET.CLS_THRESHOLD})`,
  ).toBeLessThanOrEqual(PERFORMANCE_BUDGET.CLS_THRESHOLD);

  // Assert Time to First Byte is within budget
  expect(
    metrics.ttfb,
    `TTFB (${metrics.ttfb}ms) exceeds threshold (${PERFORMANCE_BUDGET.TTFB_THRESHOLD}ms)`,
  ).toBeLessThanOrEqual(PERFORMANCE_BUDGET.TTFB_THRESHOLD);

  // Assert First Contentful Paint is within budget
  expect(
    metrics.fcp,
    `FCP (${metrics.fcp}ms) exceeds threshold (${PERFORMANCE_BUDGET.FCP_THRESHOLD}ms)`,
  ).toBeLessThanOrEqual(PERFORMANCE_BUDGET.FCP_THRESHOLD);
}

/**
 * Creates a performance report string for logging/debugging
 *
 * @param metrics - Measured Core Web Vitals metrics
 * @returns Formatted performance report
 */
export function formatPerformanceReport(metrics: CoreWebVitalsMetrics): string {
  return [
    'Performance Metrics Report:',
    `  LCP: ${metrics.lcp.toFixed(1)}ms (threshold: ${PERFORMANCE_BUDGET.LCP_THRESHOLD}ms)`,
    `  FID: ${metrics.fid.toFixed(1)}ms (threshold: ${PERFORMANCE_BUDGET.FID_THRESHOLD}ms)`,
    `  CLS: ${metrics.cls.toFixed(3)} (threshold: ${PERFORMANCE_BUDGET.CLS_THRESHOLD})`,
    `  TTFB: ${metrics.ttfb.toFixed(1)}ms (threshold: ${PERFORMANCE_BUDGET.TTFB_THRESHOLD}ms)`,
    `  FCP: ${metrics.fcp.toFixed(1)}ms (threshold: ${PERFORMANCE_BUDGET.FCP_THRESHOLD}ms)`,
  ].join('\n');
}
