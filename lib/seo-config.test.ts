/**
 * @jest-environment node
 */

// Store original values for cleanup
const originalEnv = process.env;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Reset modules to ensure clean imports for each test
  jest.resetModules();
  // Reset environment
  process.env = { ...originalEnv };
  // Mock console.warn
  console.warn = jest.fn();
});

afterEach(() => {
  // Restore original console.warn
  console.warn = originalConsoleWarn;
});

afterAll(() => {
  // Restore original process.env
  process.env = originalEnv;
});

describe('lib/seo-config', () => {
  describe('constants', () => {
    it('exports SITE_NAME with correct value', async () => {
      const seoConfig = await import('./seo-config');
      expect(seoConfig.SITE_NAME).toBe('Time is Money');
    });

    it('exports SITE_DESCRIPTION with correct value', async () => {
      const seoConfig = await import('./seo-config');
      expect(seoConfig.SITE_DESCRIPTION).toBe(
        'Convert online prices into hours of work with the Time is Money Chrome extension. Make informed purchasing decisions by seeing the true cost in your time.',
      );
    });

    it('exports TITLE_TEMPLATE with correct value', async () => {
      const seoConfig = await import('./seo-config');
      expect(seoConfig.TITLE_TEMPLATE).toBe('%s | Time is Money');
    });
  });

  describe('SITE_URL', () => {
    it('uses environment variable when NEXT_PUBLIC_SITE_URL is set', async () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://timeismoney.works';
      const seoConfig = await import('./seo-config');
      expect(seoConfig.SITE_URL).toBe('https://timeismoney.works');
    });

    it('falls back to localhost when NEXT_PUBLIC_SITE_URL is not set', async () => {
      delete process.env.NEXT_PUBLIC_SITE_URL;
      const seoConfig = await import('./seo-config');
      expect(seoConfig.SITE_URL).toBe('http://localhost:3000');
    });
  });

  describe('build warnings', () => {
    it('logs warning in production when NEXT_PUBLIC_SITE_URL is not set', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.NEXT_PUBLIC_SITE_URL;

      await import('./seo-config');

      expect(console.warn).toHaveBeenCalledWith(
        'WARNING: NEXT_PUBLIC_SITE_URL is not set in production environment. Using fallback URL.',
      );
    });

    it('does not log warning in production when NEXT_PUBLIC_SITE_URL is set', async () => {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_SITE_URL = 'https://timeismoney.works';

      await import('./seo-config');

      expect(console.warn).not.toHaveBeenCalled();
    });

    it('does not log warning in development when NEXT_PUBLIC_SITE_URL is not set', async () => {
      process.env.NODE_ENV = 'development';
      delete process.env.NEXT_PUBLIC_SITE_URL;

      await import('./seo-config');

      expect(console.warn).not.toHaveBeenCalled();
    });

    it('does not log warning in test environment when NEXT_PUBLIC_SITE_URL is not set', async () => {
      process.env.NODE_ENV = 'test';
      delete process.env.NEXT_PUBLIC_SITE_URL;

      await import('./seo-config');

      expect(console.warn).not.toHaveBeenCalled();
    });

    it('does not log warning when NODE_ENV is not set', async () => {
      delete process.env.NODE_ENV;
      delete process.env.NEXT_PUBLIC_SITE_URL;

      await import('./seo-config');

      expect(console.warn).not.toHaveBeenCalled();
    });
  });
});
