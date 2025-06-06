import { test, expect } from '@playwright/test';
import { LandingPage } from '../page-objects/landing-page.po';
import { measureCoreWebVitals, assertPerformanceBudget } from '../utils/performance';
import { runAxeAudit, assertNoViolations } from '../utils/accessibility';
import { assertHeroAboveFold } from '../utils/hero-visibility';

/**
 * Comprehensive E2E test suite for landing page validation (T019)
 *
 * Tests functional, performance, and accessibility requirements
 * across multiple viewports with CI enforcement of budgets.
 */
test.describe('Landing Page - Comprehensive Validation (T019)', () => {
  let landingPage: LandingPage;

  test.beforeEach(async ({ page }) => {
    landingPage = new LandingPage(page);
  });

  test.describe('Functional Validation', () => {
    test('should load landing page successfully', async ({ page }) => {
      await landingPage.navigate();
      await page.waitForLoadState('domcontentloaded');

      // Verify page loads without errors
      expect(page.url()).toContain('/');

      // Verify essential elements are present
      const title = await landingPage.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
    });

    test('should render Hero section above fold', async ({ page }) => {
      await landingPage.navigate();
      await page.waitForLoadState('domcontentloaded');

      // Test Hero visibility above fold
      await assertHeroAboveFold(page);
    });

    test('should have functional CTA button', async ({ page }) => {
      await landingPage.navigate();
      await page.waitForLoadState('domcontentloaded');

      // Verify CTA button is present and clickable
      const ctaButton = await landingPage.getHeroCTA();
      expect(ctaButton).toBeTruthy();

      await expect(ctaButton).toBeVisible();
      await expect(ctaButton).toBeEnabled();
    });
  });

  test.describe('Performance Validation', () => {
    test('should meet Core Web Vitals thresholds', async ({ page }) => {
      await landingPage.navigate();

      // Measure Core Web Vitals
      const metrics = await measureCoreWebVitals(page);

      // Assert performance budget compliance
      await assertPerformanceBudget(metrics);
    });

    test('should load within performance budget', async ({ page }) => {
      const startTime = Date.now();

      await landingPage.navigate();
      await page.waitForLoadState('domcontentloaded');

      const loadTime = Date.now() - startTime;

      // Page should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should not cause layout shifts during load', async ({ page }) => {
      await landingPage.navigate();

      const metrics = await measureCoreWebVitals(page);

      // CLS should be less than 0.1
      expect(metrics.cls).toBeLessThan(0.1);
    });
  });

  test.describe('Accessibility Validation', () => {
    test('should pass axe-core WCAG 2.1 AA audit', async ({ page }) => {
      await landingPage.navigate();
      await page.waitForLoadState('domcontentloaded');

      // Run accessibility audit
      const results = await runAxeAudit(page);

      // Assert no violations
      await assertNoViolations(results);
    });

    test('should support keyboard navigation', async ({ page }) => {
      await landingPage.navigate();
      await page.waitForLoadState('domcontentloaded');

      // Test tab navigation to CTA button
      await page.keyboard.press('Tab');

      const ctaButton = await landingPage.getHeroCTA();
      await expect(ctaButton).toBeFocused();
    });

    test('should have proper ARIA landmarks', async ({ page }) => {
      await landingPage.navigate();
      await page.waitForLoadState('domcontentloaded');

      // Verify main landmark exists
      const main = page.locator('main[role="main"]');
      await expect(main).toBeVisible();

      // Verify hero section has proper labeling
      const heroSection = page.locator('section[aria-label="Hero section"]');
      await expect(heroSection).toBeVisible();
    });
  });

  test.describe('Cross-Viewport Validation', () => {
    test('should render correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await landingPage.navigate();
      await page.waitForLoadState('domcontentloaded');

      // Verify Hero is above fold on mobile
      await assertHeroAboveFold(page);

      // Verify CTA button is accessible
      const ctaButton = await landingPage.getHeroCTA();
      await expect(ctaButton).toBeVisible();
    });

    test('should render correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await landingPage.navigate();
      await page.waitForLoadState('domcontentloaded');

      // Verify Hero is above fold on tablet
      await assertHeroAboveFold(page);
    });

    test('should render correctly on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await landingPage.navigate();
      await page.waitForLoadState('domcontentloaded');

      // Verify Hero is above fold on desktop
      await assertHeroAboveFold(page);
    });
  });
});
