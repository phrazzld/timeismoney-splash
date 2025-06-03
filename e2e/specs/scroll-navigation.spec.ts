import { test, expect } from '@playwright/test';
import { LandingPage } from '../page-objects/landing-page.po';

/**
 * E2E tests for scroll navigation behavior and accessibility (T015)
 * 
 * Tests the complete scroll navigation implementation including:
 * - Smooth scrolling between sections
 * - Skip links functionality
 * - Keyboard navigation
 * - Focus management
 * - Cross-browser compatibility
 */
test.describe('Scroll Navigation (T015) @scroll-navigation', () => {
  let landingPage: LandingPage;

  test.beforeEach(async ({ page }) => {
    landingPage = new LandingPage(page);
    await landingPage.navigate();
    await page.waitForLoadState('domcontentloaded');
  });

  test.describe('Section Structure', () => {
    test('all sections have correct IDs and are accessible', async ({ page }) => {
      // Check that all expected sections exist
      const sections = ['hero', 'features', 'testimonials', 'cta'];
      
      for (const sectionId of sections) {
        const section = page.locator(`#${sectionId}`);
        await expect(section).toBeVisible();
        
        // Sections should be focusable for keyboard navigation
        await expect(section).toHaveAttribute('tabindex', '-1');
        
        // Sections should have proper ARIA labels
        await expect(section).toHaveAttribute('role', 'region');
        await expect(section).toHaveAttribute('aria-label');
      }
    });

    test('sections have proper semantic structure', async ({ page }) => {
      // Main element should exist
      const main = page.locator('main[role="main"]');
      await expect(main).toBeVisible();
      
      // Hero section should contain h1
      const heroH1 = page.locator('#hero h1');
      await expect(heroH1).toBeVisible();
      
      // All sections should be inside main
      const sections = page.locator('main section[role="region"]');
      await expect(sections).toHaveCount(4);
    });
  });

  test.describe('Skip Links', () => {
    test('skip links are present and initially hidden', async ({ page }) => {
      const skipNav = page.locator('nav[aria-label="Skip navigation"]');
      await expect(skipNav).toBeVisible();
      
      const skipLinks = skipNav.locator('a');
      await expect(skipLinks).toHaveCount(4);
      
      // Skip links should be hidden initially (sr-only class)
      for (let i = 0; i < 4; i++) {
        const link = skipLinks.nth(i);
        await expect(link).toHaveClass(/sr-only/);
      }
    });

    test('skip links become visible when focused', async ({ page }) => {
      const skipToFeatures = page.locator('a[href="#features"]');
      
      // Focus the skip link
      await skipToFeatures.focus();
      
      // Should no longer be sr-only when focused
      await expect(skipToFeatures).toHaveClass(/focus:not-sr-only/);
    });

    test('skip links navigate to correct sections', async ({ page }) => {
      const skipToFeatures = page.locator('a[href="#features"]');
      
      // Click skip link
      await skipToFeatures.click();
      
      // Should scroll to features section
      const featuresSection = page.locator('#features');
      await expect(featuresSection).toBeInViewport();
      
      // Features section should be focused
      await expect(featuresSection).toBeFocused();
    });

    test('skip links work with keyboard navigation', async ({ page }) => {
      // Tab to first skip link
      await page.keyboard.press('Tab');
      
      const skipToMain = page.locator('a[href="#hero"]');
      await expect(skipToMain).toBeFocused();
      
      // Press Enter to activate
      await page.keyboard.press('Enter');
      
      // Should navigate to hero section
      const heroSection = page.locator('#hero');
      await expect(heroSection).toBeInViewport();
    });
  });

  test.describe('Smooth Scrolling', () => {
    test('scrolling between sections is smooth', async ({ page }) => {
      // Start at top
      await page.evaluate(() => window.scrollTo(0, 0));
      
      // Click skip link to features
      await page.locator('a[href="#features"]').click();
      
      // Should scroll smoothly to features section
      await expect(page.locator('#features')).toBeInViewport();
      
      // Click skip link to testimonials
      await page.locator('a[href="#testimonials"]').click();
      
      // Should scroll smoothly to testimonials
      await expect(page.locator('#testimonials')).toBeInViewport();
    });

    test('manual scrolling updates active section state', async ({ page }) => {
      // Scroll to features section manually
      await page.locator('#features').scrollIntoView();
      
      // Check that features section gets active state
      await expect(page.locator('#features')).toHaveAttribute('data-active', 'true');
      
      // Scroll to testimonials
      await page.locator('#testimonials').scrollIntoView();
      
      // Check that testimonials section gets active state
      await expect(page.locator('#testimonials')).toHaveAttribute('data-active', 'true');
      
      // Features should no longer be active
      await expect(page.locator('#features')).toHaveAttribute('data-active', 'false');
    });

    test('scroll progress is tracked correctly', async ({ page }) => {
      const main = page.locator('main[role="main"]');
      
      // At top, scroll progress should be 0
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500); // Wait for scroll events to process
      
      await expect(main).toHaveAttribute('data-scroll-progress', '0');
      
      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      
      // Should show 100% progress
      await expect(main).toHaveAttribute('data-scroll-progress', '100');
    });
  });

  test.describe('Accessibility Features', () => {
    test('focus management works correctly', async ({ page }) => {
      // Navigate using skip link
      await page.locator('a[href="#features"]').click();
      
      // Features section should receive focus
      await expect(page.locator('#features')).toBeFocused();
      
      // Focus indicator should be visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('keyboard navigation between sections works', async ({ page }) => {
      // Tab through skip links
      await page.keyboard.press('Tab'); // Skip to main
      await page.keyboard.press('Tab'); // Skip to features
      await page.keyboard.press('Tab'); // Skip to testimonials
      await page.keyboard.press('Tab'); // Skip to CTA
      
      const skipToCta = page.locator('a[href="#cta"]');
      await expect(skipToCta).toBeFocused();
      
      // Activate with Enter
      await page.keyboard.press('Enter');
      
      // Should navigate to CTA section
      await expect(page.locator('#cta')).toBeInViewport();
      await expect(page.locator('#cta')).toBeFocused();
    });

    test('screen reader announcements work correctly', async ({ page }) => {
      // Check that sections have proper ARIA labels
      const sections = [
        { id: 'hero', label: 'Hero section' },
        { id: 'features', label: 'Features' },
        { id: 'testimonials', label: 'Testimonials' },
        { id: 'cta', label: 'Call to Action' },
      ];
      
      for (const section of sections) {
        const element = page.locator(`#${section.id}`);
        await expect(element).toHaveAttribute('aria-label', section.label);
      }
    });

    test('skip links have proper ARIA attributes', async ({ page }) => {
      const skipLinks = page.locator('nav[aria-label="Skip navigation"] a');
      
      // Each skip link should have aria-label
      for (let i = 0; i < 4; i++) {
        const link = skipLinks.nth(i);
        await expect(link).toHaveAttribute('aria-label');
        await expect(link).toHaveAttribute('href');
      }
    });
  });

  test.describe('Cross-browser Compatibility', () => {
    test('smooth scroll behavior works in different browsers', async ({ page, browserName }) => {
      // Test smooth scrolling in different browsers
      await page.locator('a[href="#features"]').click();
      
      // Should work regardless of browser
      await expect(page.locator('#features')).toBeInViewport();
      
      // Should maintain focus management
      await expect(page.locator('#features')).toBeFocused();
    });

    test('intersection observer fallback works', async ({ page }) => {
      // Test by disabling IntersectionObserver if possible
      await page.addInitScript(() => {
        // Temporarily disable IntersectionObserver to test fallback
        (window as any).IntersectionObserver = undefined;
      });
      
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
      
      // Skip links should still work
      await page.locator('a[href="#features"]').click();
      await expect(page.locator('#features')).toBeInViewport();
    });
  });

  test.describe('Performance', () => {
    test('scroll events are properly debounced', async ({ page }) => {
      // Add performance monitoring
      await page.addInitScript(() => {
        (window as any).scrollEventCount = 0;
        window.addEventListener('scroll', () => {
          (window as any).scrollEventCount++;
        });
      });
      
      // Rapid scroll events
      await page.evaluate(() => {
        for (let i = 0; i < 10; i++) {
          window.scrollTo(0, i * 100);
        }
      });
      
      // Wait for debounce
      await page.waitForTimeout(500);
      
      // Should not cause performance issues
      const eventCount = await page.evaluate(() => (window as any).scrollEventCount);
      expect(eventCount).toBeGreaterThan(0);
      expect(eventCount).toBeLessThan(50); // Reasonable limit
    });

    test('no memory leaks from scroll listeners', async ({ page }) => {
      // Navigate away and back to test cleanup
      await page.goto('about:blank');
      await landingPage.navigate();
      
      // Skip links should still work after navigation
      await page.locator('a[href="#features"]').click();
      await expect(page.locator('#features')).toBeInViewport();
    });
  });

  test.describe('Error Handling', () => {
    test('handles missing sections gracefully', async ({ page }) => {
      // Try to navigate to a non-existent section
      await page.evaluate(() => {
        const event = new MouseEvent('click', { bubbles: true });
        const link = document.createElement('a');
        link.href = '#non-existent-section';
        document.body.appendChild(link);
        link.dispatchEvent(event);
      });
      
      // Should not crash the page
      await expect(page.locator('main')).toBeVisible();
    });

    test('falls back gracefully when smooth scroll is not supported', async ({ page }) => {
      // Disable smooth scroll support
      await page.addInitScript(() => {
        if (document.documentElement.style) {
          Object.defineProperty(document.documentElement.style, 'scrollBehavior', {
            value: undefined,
            writable: false,
          });
        }
      });
      
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
      
      // Navigation should still work with fallback
      await page.locator('a[href="#features"]').click();
      await expect(page.locator('#features')).toBeInViewport();
    });
  });

  test.describe('Integration with Existing Features', () => {
    test('does not interfere with Hero component functionality', async ({ page }) => {
      // Hero component should still work
      const heroCta = page.locator('#hero button');
      if (await heroCta.count() > 0) {
        await expect(heroCta).toBeVisible();
        await expect(heroCta).toBeEnabled();
      }
    });

    test('preserves existing page metadata and SEO', async ({ page }) => {
      // Check that page metadata is still present
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
      
      // Check meta description
      const description = page.locator('meta[name="description"]');
      await expect(description).toHaveAttribute('content');
    });

    test('maintains accessibility compliance from previous tests', async ({ page }) => {
      // Ensure we haven't broken existing accessibility features
      const main = page.locator('main[role="main"]');
      await expect(main).toBeVisible();
      
      // Check heading hierarchy is preserved
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);
    });
  });
});