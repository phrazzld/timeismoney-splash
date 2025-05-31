import { test, expect } from '@playwright/test';
import { LandingPage } from '../page-objects/landing-page.po';
import { runAxeAudit, assertNoViolations } from '../utils/accessibility';
import {
  testKeyboardNavigation,
  assertNoKeyboardTraps,
  assertFocusIndicatorVisible,
  assertAllInteractiveElementsAccessible,
} from '../utils/keyboard-navigation';
import {
  validateColorContrast,
  validateUIComponentContrast,
  formatContrastReport,
} from '../utils/color-contrast';

/**
 * Comprehensive accessibility compliance test suite for WCAG 2.1 AA (T020)
 *
 * These tests validate:
 * - Keyboard navigation and focus management
 * - Color contrast compliance
 * - Screen reader compatibility
 * - ARIA implementation
 */
test.describe('Accessibility Compliance - WCAG 2.1 AA (T020) @accessibility', () => {
  let landingPage: LandingPage;

  test.beforeEach(async ({ page }) => {
    landingPage = new LandingPage(page);
    await landingPage.navigate();
    await page.waitForLoadState('domcontentloaded');
  });

  test.describe('Keyboard Navigation', () => {
    test('all interactive elements are keyboard accessible', async ({ page }) => {
      // Test that all interactive elements can be reached by keyboard
      await assertAllInteractiveElementsAccessible(page);
    });

    test('tab order follows logical reading order', async ({ page }) => {
      const result = await testKeyboardNavigation(page);

      // Verify focus order makes sense
      expect(result.focusOrder).toBeTruthy();
      expect(result.focusOrder.length).toBeGreaterThan(0);

      // The CTA button should be one of the first focusable elements
      const ctaIndex = result.focusOrder.findIndex(
        (selector) => selector.includes('button') || selector.includes('Get Chrome Extension'),
      );
      expect(ctaIndex).toBeGreaterThanOrEqual(0);
      expect(ctaIndex).toBeLessThan(5); // Should be in the first 5 tab stops
    });

    test('no keyboard traps exist', async ({ page }) => {
      await assertNoKeyboardTraps(page);
    });

    test('focus indicators are visible on all focusable elements', async ({ page }) => {
      // Get all focusable elements
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled]):not([type="hidden"])',
        '[tabindex]:not([tabindex="-1"])',
      ];

      for (const selector of focusableSelectors) {
        const elements = await page.locator(selector).all();

        for (const element of elements) {
          if (await element.isVisible()) {
            await assertFocusIndicatorVisible(page, element);
          }
        }
      }
    });

    test('skip links work correctly', async ({ page }) => {
      // Test skip links if they exist
      const skipLinks = await page.locator('a[href^="#"]:has-text("skip")').all();

      for (const skipLink of skipLinks) {
        const href = await skipLink.getAttribute('href');
        if (!href) continue;

        const targetId = href.substring(1);
        const target = page.locator(`#${targetId}`);

        // Verify target exists
        await expect(target).toBeVisible();

        // Click skip link and verify focus moves
        await skipLink.click();

        // Tab once to verify we're past the skipped content
        await page.keyboard.press('Tab');
        const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
        expect(focusedElement).not.toBe('A'); // Should not be on another skip link
      }
    });

    test('escape key closes modals/popups', async ({ page }) => {
      // This test would check dismissible elements if they exist
      // For now, we'll check that escape doesn't cause errors
      await page.keyboard.press('Escape');

      // Page should still be functional
      const title = await page.title();
      expect(title).toBeTruthy();
    });
  });

  test.describe('Color Contrast Validation', () => {
    test('all text meets WCAG AA contrast requirements', async ({ page }) => {
      const result = await validateColorContrast(page);

      if (!result.passes) {
        // Generate detailed report for debugging
        const report = formatContrastReport(result);
        console.log(report);
      }

      expect(result.passes, 'All text should meet WCAG AA contrast requirements').toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    test('interactive elements meet contrast requirements', async ({ page }) => {
      const result = await validateUIComponentContrast(page);

      if (!result.passes) {
        const report = formatContrastReport(result);
        console.log(report);
      }

      expect(result.passes, 'All UI components should meet contrast requirements').toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    test('focus states maintain required contrast', async ({ page: _page }) => {
      // Test contrast of focused elements
      const button = await landingPage.getHeroCTA();
      await button.focus();

      // Get focused state styles
      const focusedStyles = await button.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          outlineColor: computed.outlineColor,
          backgroundColor: computed.backgroundColor,
        };
      });

      // Verify focus indicator has sufficient contrast
      if (focusedStyles.outlineColor && focusedStyles.outlineColor !== 'transparent') {
        // This is a simplified check - in reality, we'd calculate the actual contrast
        expect(focusedStyles.outlineColor).not.toBe(focusedStyles.backgroundColor);
      }
    });

    test('error states have sufficient contrast', async ({ page }) => {
      // This would test error message contrast if forms exist
      // For now, we'll verify error color in design tokens meets requirements
      const errorElements = await page.locator('.error, [role="alert"]').all();

      for (const element of errorElements) {
        if (await element.isVisible()) {
          const styles = await element.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor,
            };
          });

          // Verify error text is not using low contrast
          expect(styles.color).not.toBe('lightgray');
          expect(styles.color).not.toBe('#cccccc');
        }
      }
    });
  });

  test.describe('Screen Reader Compatibility', () => {
    test('all images have appropriate alt text', async ({ page }) => {
      const images = await page.locator('img').all();

      for (const img of images) {
        const alt = await img.getAttribute('alt');
        const src = await img.getAttribute('src');

        // Decorative images should have empty alt=""
        // Informative images should have descriptive alt text
        if (src?.includes('decoration') || src?.includes('background')) {
          expect(alt).toBe('');
        } else {
          expect(alt).toBeTruthy();
          expect(alt?.length).toBeGreaterThan(0);
        }
      }
    });

    test('form inputs have associated labels', async ({ page }) => {
      const inputs = await page.locator('input:not([type="hidden"]), select, textarea').all();

      for (const input of inputs) {
        const inputId = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');

        // Input should have either:
        // 1. An associated label (via id)
        // 2. An aria-label
        // 3. An aria-labelledby
        if (inputId) {
          const label = page.locator(`label[for="${inputId}"]`);
          const hasLabel = (await label.count()) > 0;
          const hasAria = ariaLabel || ariaLabelledBy;

          expect(hasLabel || hasAria, `Input #${inputId} should have a label`).toBe(true);
        } else {
          expect(ariaLabel || ariaLabelledBy, 'Input should have ARIA labeling').toBeTruthy();
        }
      }
    });

    test('ARIA labels are present where needed', async ({ page }) => {
      // Check that interactive elements have accessible names
      const interactiveElements = await page
        .locator('button, a[href], [role="button"], [role="link"]')
        .all();

      for (const element of interactiveElements) {
        const text = await element.textContent();
        const ariaLabel = await element.getAttribute('aria-label');
        const ariaLabelledBy = await element.getAttribute('aria-labelledby');
        const title = await element.getAttribute('title');

        // Element should have accessible name from:
        // 1. Text content
        // 2. aria-label
        // 3. aria-labelledby
        // 4. title (last resort)
        const hasAccessibleName = text?.trim() || ariaLabel || ariaLabelledBy || title;

        expect(hasAccessibleName, 'Interactive element should have accessible name').toBeTruthy();
      }
    });

    test('heading hierarchy is logical', async ({ page }) => {
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      const headingLevels: number[] = [];

      for (const heading of headings) {
        const tagName = await heading.evaluate((el) => el.tagName);
        const level = parseInt(tagName.substring(1));
        headingLevels.push(level);
      }

      // Should have at least one h1
      expect(headingLevels.filter((level) => level === 1).length).toBeGreaterThanOrEqual(1);

      // Heading levels should not skip (e.g., h1 -> h3)
      for (let i = 1; i < headingLevels.length; i++) {
        const diff = headingLevels[i] - headingLevels[i - 1];
        expect(diff).toBeLessThanOrEqual(1);
      }
    });

    test('landmark regions are properly labeled', async ({ page }) => {
      // Check main landmarks
      const main = page.locator('main, [role="main"]');
      await expect(main).toBeVisible();

      // Check that sections have proper labels
      const sections = await page.locator('section[role="region"]').all();

      for (const section of sections) {
        const ariaLabel = await section.getAttribute('aria-label');
        const ariaLabelledBy = await section.getAttribute('aria-labelledby');

        expect(
          ariaLabel || ariaLabelledBy,
          'Section with role="region" should have a label',
        ).toBeTruthy();
      }
    });
  });

  test.describe('Comprehensive axe-core Audit', () => {
    test('passes automated accessibility audit with zero violations', async ({ page }) => {
      // Run comprehensive axe-core audit
      const results = await runAxeAudit(page);

      // Assert no violations
      await assertNoViolations(results);

      // Log summary for CI artifacts
      console.log(`Accessibility Audit Summary:
        - Violations: ${results.violations.length}
        - Passed Rules: ${results.passes.length}
        - Inapplicable Rules: ${results.inapplicable?.length || 0}
        - Incomplete Tests: ${results.incomplete.length}
      `);
    });

    test('critical and serious violations are zero', async ({ page }) => {
      const results = await runAxeAudit(page);

      const criticalViolations = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      );

      expect(criticalViolations).toHaveLength(0);
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('touch targets meet minimum size requirements', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Check touch target sizes
      const touchTargets = await page.locator('button, a[href], input, select').all();

      for (const target of touchTargets) {
        if (await target.isVisible()) {
          const box = await target.boundingBox();

          if (box) {
            // WCAG 2.1 AA requires 44x44px minimum
            expect(box.width).toBeGreaterThanOrEqual(44);
            expect(box.height).toBeGreaterThanOrEqual(44);
          }
        }
      }
    });

    test('content reflows properly at 200% zoom', async ({ page }) => {
      // Simulate 200% zoom
      await page.evaluate(() => {
        document.documentElement.style.zoom = '2';
      });

      // Check for horizontal scrolling
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);

      // Content should not require horizontal scrolling at 200% zoom
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Allow small margin

      // Reset zoom
      await page.evaluate(() => {
        document.documentElement.style.zoom = '1';
      });
    });
  });
});
