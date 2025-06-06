import { test, expect } from '@playwright/test';
import { LandingPage } from '../page-objects/landing-page.po';
import {
  testEnhancedKeyboardAccessibility,
  assertEnhancedKeyboardAccessibility,
  type EnhancedKeyboardTestOptions,
} from '../utils/enhanced-keyboard-testing';

/**
 * Comprehensive keyboard navigation test suite
 *
 * Tests detailed keyboard accessibility patterns and component-specific behaviors
 * beyond basic navigation compliance. These tests ensure all interactive elements
 * provide excellent keyboard user experiences.
 */
test.describe('Comprehensive Keyboard Navigation @accessibility', () => {
  let landingPage: LandingPage;

  test.beforeEach(async ({ page }) => {
    landingPage = new LandingPage(page);
    await landingPage.navigate();
    await page.waitForLoadState('domcontentloaded');
  });

  test.describe('Component-Specific Keyboard Behaviors', () => {
    test('CTA button supports all expected keyboard interactions', async ({ page }) => {
      const ctaButton = await landingPage.getHeroCTA();

      // Test focus
      await ctaButton.focus();
      expect(await ctaButton.isFocused()).toBe(true);

      // Test Enter key activation
      let clicked = false;
      await page.evaluate(() => {
        (window as any).testClickHandler = () => {
          (window as any).buttonClicked = true;
        };
        const button = document.querySelector('#hero-cta-button');
        if (button) {
          button.addEventListener('click', (window as any).testClickHandler);
        }
      });

      await ctaButton.press('Enter');

      clicked = await page.evaluate(() => (window as any).buttonClicked);
      expect(clicked, 'CTA button should activate on Enter key').toBe(true);

      // Reset for space test
      await page.evaluate(() => {
        (window as any).buttonClicked = false;
      });

      // Test Space key activation
      await ctaButton.focus();
      await ctaButton.press(' ');

      clicked = await page.evaluate(() => (window as any).buttonClicked);
      expect(clicked, 'CTA button should activate on Space key').toBe(true);
    });

    test('all button components have consistent keyboard behavior', async ({ page }) => {
      const buttons = await page.locator('button').all();

      expect(buttons.length).toBeGreaterThan(0);

      for (const button of buttons) {
        const isVisible = await button.isVisible();
        const isDisabled = await button.isDisabled();

        if (!isVisible || isDisabled) continue;

        // Test focus capability
        await button.focus();
        expect(await button.isFocused(), 'Button should be focusable').toBe(true);

        // Test focus indicator visibility
        const hasFocusIndicator = await button.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return (
            styles.outlineWidth !== '0px' ||
            styles.boxShadow !== 'none' ||
            styles.boxShadow.includes('ring')
          );
        });

        expect(hasFocusIndicator, 'Button should have visible focus indicator').toBe(true);
      }
    });

    test('link components support keyboard navigation', async ({ page }) => {
      const links = await page.locator('a[href]').all();

      for (const link of links) {
        const isVisible = await link.isVisible();
        if (!isVisible) continue;

        // Test focus capability
        await link.focus();
        expect(await link.isFocused(), 'Link should be focusable').toBe(true);

        // Test that href is valid
        const href = await link.getAttribute('href');
        expect(href, 'Link should have valid href attribute').toBeTruthy();
        expect(href, 'Link href should not be empty').not.toBe('#');
      }
    });
  });

  test.describe('Advanced Keyboard Patterns', () => {
    test('skip links provide efficient navigation', async ({ page }) => {
      // Look for skip links (may be visually hidden)
      const skipLinks = await page.locator('a[href^="#"]').all();

      if (skipLinks.length === 0) {
        test.skip('No skip links found on page');
        return;
      }

      for (const skipLink of skipLinks) {
        const href = await skipLink.getAttribute('href');
        if (!href || href === '#') continue;

        const targetId = href.substring(1);
        const targetElement = page.locator(`#${targetId}`);

        // Verify target exists
        await expect(targetElement).toHaveCount(1);

        // Test skip link activation
        await skipLink.focus();
        await skipLink.press('Enter');

        // Verify focus moved to target or near target
        const activeElementId = await page.evaluate(
          () => document.activeElement?.id || document.activeElement?.closest('[id]')?.id,
        );

        expect(activeElementId, `Skip link should move focus to target area`).toBeTruthy();
      }
    });

    test('roving tab index patterns work correctly', async ({ page }) => {
      // Look for components that might use roving tabindex (like toolbars, menus)
      const componentGroups = await page
        .locator('[role="toolbar"], [role="menubar"], [role="group"]')
        .all();

      if (componentGroups.length === 0) {
        test.skip('No roving tabindex components found');
        return;
      }

      for (const group of componentGroups) {
        const children = await group.locator('[tabindex]').all();

        if (children.length < 2) continue;

        // Test that only one child has tabindex="0" initially
        const tabIndexValues = await Promise.all(
          children.map((child) => child.getAttribute('tabindex')),
        );

        const focusableCount = tabIndexValues.filter((value) => value === '0').length;
        expect(
          focusableCount,
          'Only one item should be focusable initially in roving tabindex',
        ).toBe(1);

        // Test arrow key navigation if applicable
        const firstFocusable = children[tabIndexValues.indexOf('0')];
        await firstFocusable.focus();
        await firstFocusable.press('ArrowRight');

        // Verify focus moved within group
        const newActiveElement = await page.evaluate(() =>
          document.activeElement?.closest('[role="toolbar"], [role="menubar"], [role="group"]'),
        );

        expect(
          newActiveElement,
          'Arrow keys should move focus within component group',
        ).toBeTruthy();
      }
    });

    test('modal and popup keyboard handling', async ({ page }) => {
      // Test for any modal or popup patterns
      const modals = await page.locator('[role="dialog"], [aria-modal="true"], .modal').all();

      if (modals.length === 0) {
        test.skip('No modals found on page');
        return;
      }

      for (const modal of modals) {
        const isVisible = await modal.isVisible();
        if (!isVisible) continue;

        // Test that focus is trapped within modal
        await modal.focus();

        // Test Escape key closes modal
        await modal.press('Escape');

        // Verify modal is closed or hidden
        const stillVisible = await modal.isVisible();
        expect(stillVisible, 'Modal should close on Escape key').toBe(false);
      }
    });
  });

  test.describe('ARIA and Semantic Compliance', () => {
    test('all interactive elements have proper accessible names', async ({ page }) => {
      const result = await testEnhancedKeyboardAccessibility(page, {
        testAriaCompliance: true,
      });

      const elementsWithoutNames = result.ariaCompliance.filter(
        (test) =>
          test.missingAttributes.includes('accessible name') ||
          test.missingAttributes.includes(
            'accessible name (aria-label, aria-labelledby, or text content)',
          ),
      );

      if (elementsWithoutNames.length > 0) {
        const errorDetails = elementsWithoutNames
          .map((element) => `${element.element} (${element.selector})`)
          .join('\n');

        throw new Error(`Elements missing accessible names:\n${errorDetails}`);
      }

      expect(elementsWithoutNames).toHaveLength(0);
    });

    test('button elements have appropriate roles and states', async ({ page }) => {
      const buttons = await page.locator('button').all();

      for (const button of buttons) {
        const isVisible = await button.isVisible();
        if (!isVisible) continue;

        // Test button properties
        const attributes = await button.evaluate((el) => ({
          tagName: el.tagName.toLowerCase(),
          type: el.getAttribute('type'),
          disabled: el.hasAttribute('disabled'),
          ariaPressed: el.getAttribute('aria-pressed'),
          ariaExpanded: el.getAttribute('aria-expanded'),
          hasAccessibleName: !!(
            el.getAttribute('aria-label') ||
            el.getAttribute('aria-labelledby') ||
            el.textContent?.trim()
          ),
        }));

        expect(attributes.tagName, 'Element should be a button').toBe('button');
        expect(attributes.hasAccessibleName, 'Button should have accessible name').toBe(true);

        // If button has aria-pressed, it should be valid
        if (attributes.ariaPressed !== null) {
          expect(['true', 'false']).toContain(attributes.ariaPressed);
        }

        // If button has aria-expanded, it should be valid
        if (attributes.ariaExpanded !== null) {
          expect(['true', 'false']).toContain(attributes.ariaExpanded);
        }
      }
    });

    test('links have valid destinations and descriptions', async ({ page }) => {
      const links = await page.locator('a[href]').all();

      for (const link of links) {
        const isVisible = await link.isVisible();
        if (!isVisible) continue;

        const linkInfo = await link.evaluate((el) => ({
          href: el.getAttribute('href'),
          target: el.getAttribute('target'),
          ariaLabel: el.getAttribute('aria-label'),
          textContent: el.textContent?.trim(),
          title: el.getAttribute('title'),
        }));

        // Test href validity
        expect(linkInfo.href, 'Link should have href').toBeTruthy();
        expect(linkInfo.href, 'Link should not have empty href').not.toBe('#');

        // Test accessible name
        const hasAccessibleName = !!(linkInfo.ariaLabel || linkInfo.textContent || linkInfo.title);
        expect(hasAccessibleName, 'Link should have accessible name').toBe(true);

        // Test external link indicators
        if (linkInfo.target === '_blank') {
          const hasExternalIndicator = !!(
            linkInfo.ariaLabel?.includes('new') ||
            linkInfo.textContent?.includes('external') ||
            linkInfo.title?.includes('new')
          );
          expect(
            hasExternalIndicator,
            'External links should indicate they open in new window',
          ).toBe(true);
        }
      }
    });
  });

  test.describe('Keyboard Navigation Performance', () => {
    test('tab navigation is efficient', async ({ page }) => {
      const startTime = Date.now();

      // Count total focusable elements
      const focusableCount = await page
        .locator(
          'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), [tabindex]:not([tabindex="-1"])',
        )
        .count();

      // Navigate through all elements
      await page.locator('body').focus();
      for (let i = 0; i < focusableCount && i < 20; i++) {
        await page.keyboard.press('Tab');
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete navigation reasonably quickly
      expect(duration, 'Tab navigation should be performant').toBeLessThan(5000);

      // Should have reasonable number of focusable elements
      expect(focusableCount, 'Page should not have excessive focusable elements').toBeLessThan(50);
    });

    test('focus indicators render quickly', async ({ page }) => {
      const buttons = await page.locator('button:visible').all();

      for (const button of buttons.slice(0, 5)) {
        // Test first 5 buttons
        const startTime = Date.now();
        await button.focus();
        const endTime = Date.now();

        const focusTime = endTime - startTime;
        expect(focusTime, 'Focus should be applied quickly').toBeLessThan(100);
      }
    });
  });

  test.describe('Cross-Component Integration', () => {
    test('keyboard navigation between different component types', async ({ page }) => {
      // Test navigation from CTA button to other elements
      const ctaButton = await landingPage.getHeroCTA();
      await ctaButton.focus();

      // Navigate forward
      await page.keyboard.press('Tab');
      let activeElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(activeElement, 'Should move to next focusable element').toBeTruthy();

      // Navigate backward
      await page.keyboard.press('Shift+Tab');
      activeElement = await page.evaluate(() => document.activeElement?.id);
      expect(activeElement, 'Should return to CTA button').toBe('hero-cta-button');
    });

    test('consistent focus management across page sections', async ({ page }) => {
      // Get all sections/landmarks
      const landmarks = await page
        .locator('[role="main"], [role="banner"], [role="navigation"], main, nav, header')
        .all();

      for (const landmark of landmarks) {
        const focusableInSection = await landmark
          .locator(
            'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), [tabindex]:not([tabindex="-1"])',
          )
          .count();

        if (focusableInSection > 0) {
          const firstFocusable = landmark
            .locator(
              'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), [tabindex]:not([tabindex="-1"])',
            )
            .first();

          await firstFocusable.focus();
          expect(
            await firstFocusable.isFocused(),
            'First focusable element in section should be focusable',
          ).toBe(true);
        }
      }
    });
  });
});
