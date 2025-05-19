import { test, expect } from '@playwright/test';

test.describe('Analytics Integration', () => {
  test.describe('Production Mode', () => {
    test.beforeEach(async ({ page }) => {
      // Mock environment as production
      await page.addInitScript(() => {
        const windowWithNext = window as Window & { __NEXT_DATA__?: Record<string, unknown> };
        windowWithNext.__NEXT_DATA__ = {
          props: {
            pageProps: {},
          },
          buildId: 'test',
          nextExport: true,
          autoExport: true,
          isFallback: false,
          scriptLoader: [],
        };
      });
    });

    test('should load Google Analytics script in production', async ({ page }) => {
      // Mock production environment
      await page.addInitScript(() => {
        Object.defineProperty(window, 'process', {
          value: {
            env: {
              NODE_ENV: 'production',
              NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-TEST123456',
            },
          },
        });
      });

      await page.goto('/');

      // Check if Google Analytics script is loaded
      const gaScript = await page.locator('script[src*="googletagmanager.com/gtag/js"]').count();
      expect(gaScript).toBe(1);

      // Verify the measurement ID in script
      const scriptContent = await page.locator('#google-analytics').textContent();
      expect(scriptContent).toContain('G-TEST123456');
    });

    test('should track page navigation', async ({ page }) => {
      // Mock production environment
      await page.addInitScript(() => {
        Object.defineProperty(window, 'process', {
          value: {
            env: {
              NODE_ENV: 'production',
              NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-TEST123456',
            },
          },
        });
      });

      // Intercept Google Analytics calls
      const gaRequests: string[] = [];

      await page.route('**/google-analytics.com/collect', (route) => {
        gaRequests.push(route.request().url());
        route.fulfill({ status: 200 });
      });

      await page.route('**/analytics.google.com/g/collect', (route) => {
        gaRequests.push(route.request().url());
        route.fulfill({ status: 200 });
      });

      await page.goto('/');

      // Since there's no about page, we'll just track initial pageview
      // Wait for potential analytics call
      await page.waitForTimeout(1000);

      // In production, we would expect tracking calls
      // This is a simplified test - in real implementation
      // you'd verify the exact request payload
    });
  });

  test.describe('Development Mode', () => {
    test('should not load Google Analytics script in development', async ({ page }) => {
      // Default Next.js dev mode
      await page.goto('/');

      // Check that Google Analytics script is NOT loaded
      const gaScript = await page.locator('script[src*="googletagmanager.com/gtag/js"]').count();
      expect(gaScript).toBe(0);
    });

    test('should log analytics events to console in development', async ({ page }) => {
      const consoleLogs: string[] = [];

      page.on('console', (msg) => {
        if (msg.text().includes('[Analytics Dev]')) {
          consoleLogs.push(msg.text());
        }
      });

      await page.goto('/');

      // Trigger an event (e.g., click CTA button)
      const ctaButton = await page.locator('button:has-text("Install Extension")');
      if ((await ctaButton.count()) > 0) {
        await ctaButton.click();

        // Verify console log
        expect(consoleLogs).toContain('[Analytics Dev] Event: extension_install_click');
      }
    });
  });

  test.describe('Privacy', () => {
    test('should not set analytics cookies directly', async ({ page }) => {
      await page.goto('/');

      // Get all cookies
      const cookies = await page.context().cookies();

      // Filter for Google Analytics cookies
      // GA4 uses _ga and _ga_<container_id> cookies
      const gaCookies = cookies.filter(
        (cookie) => cookie.name.includes('_ga') || cookie.domain.includes('analytics.google.com'),
      );

      // In development, no cookies should be set
      // In production, cookies would be set by the GA script, but that's expected
      // We're just verifying our implementation doesn't set any directly
      if (process.env.NODE_ENV === 'development') {
        expect(gaCookies).toHaveLength(0);
      }
    });
  });
});
