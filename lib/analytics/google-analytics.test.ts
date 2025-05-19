/**
 * @jest-environment jsdom
 */

// Test for Google Analytics module

describe('Analytics: google-analytics', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalGA = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment
    process.env.NODE_ENV = originalEnv;
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = originalGA;
    // Reset window
    if (typeof window !== 'undefined') {
      const globalWindow = window as unknown as { gtag?: unknown; dataLayer?: unknown };
      delete globalWindow.gtag;
      delete globalWindow.dataLayer;
    }
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = originalGA;
  });

  describe('development mode', () => {
    it('should log events in development', async () => {
      process.env.NODE_ENV = 'development';

      await jest.isolateModulesAsync(async () => {
        const { trackEvent } = await import('./google-analytics');
        const consoleLog = jest.spyOn(console, 'log').mockImplementation();

        trackEvent('cta_click', { test: true });

        expect(consoleLog).toHaveBeenCalledWith('[Analytics Dev] Event: cta_click', { test: true });
      });
    });

    it('should log pageviews in development', async () => {
      process.env.NODE_ENV = 'development';

      await jest.isolateModulesAsync(async () => {
        const { trackPageview } = await import('./google-analytics');
        const consoleLog = jest.spyOn(console, 'log').mockImplementation();

        trackPageview('/test-page');

        expect(consoleLog).toHaveBeenCalledWith('[Analytics Dev] Pageview tracked:', '/test-page');
      });
    });
  });

  describe('production mode', () => {
    it('should not crash when tracking without gtag', async () => {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123';

      await jest.isolateModulesAsync(async () => {
        // Test that it doesn't throw
        await expect(async () => {
          const { trackEvent, trackPageview } = await import('./google-analytics');
          trackEvent('test_event');
          trackPageview();
        }).not.toThrow();
      });
    });

    it('should call gtag when available', async () => {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123';

      const mockGtag = jest.fn();
      const globalWindow = window as unknown as { gtag: unknown };
      globalWindow.gtag = mockGtag;

      await jest.isolateModulesAsync(async () => {
        const { trackEvent } = await import('./google-analytics');

        trackEvent('extension_install_click', { source: 'test' });

        expect(mockGtag).toHaveBeenCalledWith('event', 'extension_install_click', {
          source: 'test',
          send_to: 'G-TEST123',
        });
      });
    });
  });

  describe('trackConversion', () => {
    it('should track conversion events', async () => {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123';

      const mockGtag = jest.fn();
      const globalWindow = window as unknown as { gtag: unknown };
      globalWindow.gtag = mockGtag;

      await jest.isolateModulesAsync(async () => {
        const { trackConversion } = await import('./google-analytics');

        trackConversion('install_click', 10, { location: 'hero' });

        expect(mockGtag).toHaveBeenCalledWith('event', 'conversion', {
          event_category: 'conversion',
          event_label: 'install_click',
          value: 10,
          location: 'hero',
          send_to: 'G-TEST123',
        });
      });
    });
  });
});
