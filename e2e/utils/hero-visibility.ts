import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Viewport configuration for different device types
 */
export const VIEWPORT_CONFIGS = {
  mobile: { width: 375, height: 667, name: 'Mobile (iPhone SE)' },
  tablet: { width: 768, height: 1024, name: 'Tablet (iPad)' },
  desktop: { width: 1920, height: 1080, name: 'Desktop (1080p)' },
  desktopLarge: { width: 2560, height: 1440, name: 'Desktop (1440p)' },
} as const;

/**
 * Hero visibility metrics interface
 */
export interface HeroVisibilityMetrics {
  /** Whether the hero is above the fold */
  readonly isAboveFold: boolean;
  /** Percentage of hero visible in viewport */
  readonly visiblePercentage: number;
  /** Distance from top of viewport to hero top edge */
  readonly distanceFromTop: number;
  /** Hero element bounding box */
  readonly boundingBox: { x: number; y: number; width: number; height: number } | null;
  /** Viewport dimensions */
  readonly viewportSize: { readonly width: number; readonly height: number } | null;
  /** Viewport configuration name */
  readonly viewportName: string;
}

/**
 * Configuration for hero visibility testing
 */
export const HERO_VISIBILITY_CONFIG = {
  /** Minimum percentage of hero that should be visible above fold */
  MIN_VISIBLE_PERCENTAGE: 80,
  /** Maximum distance from top of viewport for hero to be considered above fold */
  MAX_DISTANCE_FROM_TOP: 100,
  /** Selector for hero section */
  HERO_SELECTOR: 'section[aria-label="Hero section"]',
  /** Timeout for hero element to appear */
  HERO_TIMEOUT: 10000,
} as const;

/**
 * Gets the hero element with error handling
 *
 * @param page - Playwright page instance
 * @returns Promise resolving to hero section locator
 */
export async function getHeroElement(page: Page): Promise<Locator> {
  const heroElement = page.locator(HERO_VISIBILITY_CONFIG.HERO_SELECTOR);

  // Wait for hero element to be visible
  await heroElement.waitFor({
    state: 'visible',
    timeout: HERO_VISIBILITY_CONFIG.HERO_TIMEOUT,
  });

  return heroElement;
}

/**
 * Measures hero visibility metrics for the current viewport
 *
 * @param page - Playwright page instance
 * @param viewportName - Name of the current viewport configuration
 * @returns Promise resolving to hero visibility metrics
 */
export async function measureHeroVisibility(
  page: Page,
  viewportName: string = 'current',
): Promise<HeroVisibilityMetrics> {
  const heroElement = await getHeroElement(page);
  const boundingBox = await heroElement.boundingBox();
  const viewportSize = page.viewportSize();

  if (!boundingBox || !viewportSize) {
    return {
      isAboveFold: false,
      visiblePercentage: 0,
      distanceFromTop: 0,
      boundingBox: null,
      viewportSize: null,
      viewportName,
    };
  }

  // Calculate visibility metrics
  const heroTop = boundingBox.y;
  const heroBottom = boundingBox.y + boundingBox.height;
  const viewportHeight = viewportSize.height;

  // Calculate visible portion of hero within viewport
  const visibleTop = Math.max(heroTop, 0);
  const visibleBottom = Math.min(heroBottom, viewportHeight);
  const visibleHeight = Math.max(0, visibleBottom - visibleTop);
  const visiblePercentage = (visibleHeight / boundingBox.height) * 100;

  // Hero is above fold if it starts within the viewport and majority is visible
  const isAboveFold =
    heroTop >= 0 &&
    heroTop <= HERO_VISIBILITY_CONFIG.MAX_DISTANCE_FROM_TOP &&
    visiblePercentage >= HERO_VISIBILITY_CONFIG.MIN_VISIBLE_PERCENTAGE;

  return {
    isAboveFold,
    visiblePercentage,
    distanceFromTop: heroTop,
    boundingBox,
    viewportSize,
    viewportName,
  };
}

/**
 * Asserts that the hero section is visible above the fold
 *
 * @param page - Playwright page instance
 * @param viewportName - Name of the current viewport (for error messages)
 * @throws Assertion error if hero is not above fold
 */
export async function assertHeroAboveFold(
  page: Page,
  viewportName: string = 'current',
): Promise<void> {
  const metrics = await measureHeroVisibility(page, viewportName);

  // Assert hero element exists and has valid bounding box
  expect(
    metrics.boundingBox,
    `Hero section not found or not visible in ${viewportName} viewport`,
  ).toBeTruthy();

  // Assert hero is positioned above the fold
  expect(
    metrics.isAboveFold,
    `Hero section is not above fold in ${viewportName} viewport. ` +
      `Distance from top: ${metrics.distanceFromTop}px, ` +
      `Visible percentage: ${metrics.visiblePercentage.toFixed(1)}%`,
  ).toBe(true);

  // Additional assertion for visible percentage
  expect(
    metrics.visiblePercentage,
    `Hero section visible percentage (${metrics.visiblePercentage.toFixed(1)}%) ` +
      `is below minimum threshold (${HERO_VISIBILITY_CONFIG.MIN_VISIBLE_PERCENTAGE}%) ` +
      `in ${viewportName} viewport`,
  ).toBeGreaterThanOrEqual(HERO_VISIBILITY_CONFIG.MIN_VISIBLE_PERCENTAGE);

  // Additional assertion for distance from top
  expect(
    metrics.distanceFromTop,
    `Hero section is too far from top (${metrics.distanceFromTop}px) ` +
      `in ${viewportName} viewport. Maximum allowed: ${HERO_VISIBILITY_CONFIG.MAX_DISTANCE_FROM_TOP}px`,
  ).toBeLessThanOrEqual(HERO_VISIBILITY_CONFIG.MAX_DISTANCE_FROM_TOP);
}

/**
 * Tests hero visibility across multiple viewport configurations
 *
 * @param page - Playwright page instance
 * @param viewports - Array of viewport configurations to test
 * @returns Promise resolving to array of visibility metrics for each viewport
 */
export async function testHeroAcrossViewports(
  page: Page,
  viewports: ReadonlyArray<{ width: number; height: number; name: string }> = Object.values(
    VIEWPORT_CONFIGS,
  ),
): Promise<readonly HeroVisibilityMetrics[]> {
  const results: HeroVisibilityMetrics[] = [];

  for (const viewport of viewports) {
    // Set viewport size
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    // Wait for any layout adjustments
    await page.waitForTimeout(500);

    // Measure hero visibility
    const metrics = await measureHeroVisibility(page, viewport.name);
    results.push(metrics);

    // Assert hero is above fold for this viewport
    await assertHeroAboveFold(page, viewport.name);
  }

  return results;
}

/**
 * Asserts that hero content (heading and CTA) is accessible and visible
 *
 * @param page - Playwright page instance
 * @throws Assertion error if hero content is not accessible
 */
export async function assertHeroContentAccessible(page: Page): Promise<void> {
  // Check that hero heading exists and is visible
  const heroHeading = page.locator('h1').first();
  await expect(heroHeading).toBeVisible();

  // Check that hero text content is not empty
  const headingText = await heroHeading.textContent();
  expect(headingText?.trim().length, 'Hero heading should not be empty').toBeGreaterThan(0);

  // Check that CTA button exists and is visible
  const ctaButton = page.locator('button:has-text("Get Chrome Extension")');
  await expect(ctaButton).toBeVisible();
  await expect(ctaButton).toBeEnabled();

  // Check that CTA button is keyboard accessible
  await ctaButton.focus();
  await expect(ctaButton).toBeFocused();
}

/**
 * Formats hero visibility metrics into a readable report
 *
 * @param metrics - Hero visibility metrics to format
 * @returns Formatted visibility report
 */
export function formatHeroVisibilityReport(metrics: HeroVisibilityMetrics): string {
  const boundingBoxText = metrics.boundingBox
    ? `(${metrics.boundingBox.x}, ${metrics.boundingBox.y}, ${metrics.boundingBox.width}x${metrics.boundingBox.height})`
    : 'null';

  const viewportText = metrics.viewportSize
    ? `${metrics.viewportSize.width}x${metrics.viewportSize.height}`
    : 'null';

  return [
    `Hero Visibility Report - ${metrics.viewportName}:`,
    `  Above Fold: ${metrics.isAboveFold ? 'Yes' : 'No'}`,
    `  Visible Percentage: ${metrics.visiblePercentage.toFixed(1)}%`,
    `  Distance from Top: ${metrics.distanceFromTop}px`,
    `  Bounding Box: ${boundingBoxText}`,
    `  Viewport Size: ${viewportText}`,
  ].join('\n');
}
