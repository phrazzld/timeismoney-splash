import robots from '../../app/robots';

describe('robots.txt Configuration', () => {
  describe('robots() function', () => {
    test('returns proper robots.txt structure', () => {
      const robotsConfig = robots();

      expect(robotsConfig).toBeDefined();
      expect(typeof robotsConfig).toBe('object');
    });

    test('includes sitemap reference', () => {
      const robotsConfig = robots();

      expect(robotsConfig.sitemap).toBeDefined();
      expect(typeof robotsConfig.sitemap).toBe('string');
      expect(robotsConfig.sitemap).toMatch(/sitemap\.xml$/);
    });

    test('configures user agent rules', () => {
      const robotsConfig = robots();

      expect(robotsConfig.rules).toBeDefined();
      expect(Array.isArray(robotsConfig.rules)).toBe(true);
      expect(robotsConfig.rules.length).toBeGreaterThan(0);
    });

    test('allows general crawling', () => {
      const robotsConfig = robots();

      const generalRule = robotsConfig.rules?.find((rule) => rule.userAgent === '*');

      expect(generalRule).toBeDefined();
      expect(generalRule?.allow).toContain('/');
    });

    test('disallows sensitive paths', () => {
      const robotsConfig = robots();

      const generalRule = robotsConfig.rules?.find((rule) => rule.userAgent === '*');

      expect(generalRule?.disallow).toContain('/api/');
      expect(generalRule?.disallow).toContain('/_next/');
    });

    test('includes crawl delay if specified', () => {
      const robotsConfig = robots();

      const generalRule = robotsConfig.rules?.find((rule) => rule.userAgent === '*');

      if (generalRule?.crawlDelay) {
        expect(typeof generalRule.crawlDelay).toBe('number');
        expect(generalRule.crawlDelay).toBeGreaterThan(0);
      }
    });
  });

  describe('Generated robots.txt content', () => {
    test('follows proper robots.txt syntax', async () => {
      // This would test the actual output if we had access to the generated content
      const robotsConfig = robots();

      // Validate structure follows robots.txt standards
      expect(robotsConfig.rules).toBeDefined();
      expect(robotsConfig.sitemap).toBeDefined();

      // Each rule should have required fields
      robotsConfig.rules?.forEach((rule) => {
        expect(rule.userAgent).toBeDefined();
        expect(typeof rule.userAgent).toBe('string');

        if (rule.allow) {
          expect(Array.isArray(rule.allow)).toBe(true);
        }

        if (rule.disallow) {
          expect(Array.isArray(rule.disallow)).toBe(true);
        }
      });
    });

    test('sitemap URL is valid', () => {
      const robotsConfig = robots();

      expect(robotsConfig.sitemap).toMatch(/^https?:\/\/.+\/sitemap\.xml$/);
    });

    test('disallow paths are properly formatted', () => {
      const robotsConfig = robots();

      const generalRule = robotsConfig.rules?.find((rule) => rule.userAgent === '*');

      if (generalRule?.disallow) {
        generalRule.disallow.forEach((path) => {
          expect(typeof path).toBe('string');
          expect(path.startsWith('/')).toBe(true);
        });
      }
    });

    test('allow paths are properly formatted', () => {
      const robotsConfig = robots();

      const generalRule = robotsConfig.rules?.find((rule) => rule.userAgent === '*');

      if (generalRule?.allow) {
        generalRule.allow.forEach((path) => {
          expect(typeof path).toBe('string');
          expect(path.startsWith('/')).toBe(true);
        });
      }
    });
  });

  describe('Security considerations', () => {
    test('does not expose sensitive information', () => {
      const robotsConfig = robots();

      // Should not reveal admin paths, private APIs, etc.
      const allDisallowPaths = robotsConfig.rules?.flatMap((rule) => rule.disallow || []) || [];

      // Check that we're not accidentally exposing sensitive paths
      const shouldNotExpose = [
        '/admin/',
        '/private/',
        '/internal/',
        '/secret/',
        '/.env',
        '/config/',
      ];

      shouldNotExpose.forEach((sensitivePath) => {
        // If we're disallowing it, that's good - but make sure we're not allowing it elsewhere
        const isDisallowed = allDisallowPaths.some(
          (path) => path === sensitivePath || path.startsWith(sensitivePath),
        );

        if (!isDisallowed) {
          // If not explicitly disallowed, make sure it's not explicitly allowed either
          const allAllowPaths = robotsConfig.rules?.flatMap((rule) => rule.allow || []) || [];
          const isExplicitlyAllowed = allAllowPaths.some(
            (path) => path === sensitivePath || (path !== '/' && sensitivePath.startsWith(path)),
          );

          expect(isExplicitlyAllowed).toBe(false);
        }
      });
    });

    test('properly handles Next.js specific paths', () => {
      const robotsConfig = robots();

      const generalRule = robotsConfig.rules?.find((rule) => rule.userAgent === '*');

      // Should disallow Next.js internals
      expect(generalRule?.disallow).toContain('/_next/');

      // Should not expose API routes unnecessarily
      expect(generalRule?.disallow).toContain('/api/');
    });

    test('allows public assets', () => {
      const robotsConfig = robots();

      const generalRule = robotsConfig.rules?.find((rule) => rule.userAgent === '*');

      // Should allow access to public files that should be crawled
      if (generalRule?.allow) {
        // Main content should be allowed
        expect(generalRule.allow).toContain('/');
      } else {
        // If no explicit allow rules, should not have overly restrictive disallow rules
        if (generalRule?.disallow) {
          expect(generalRule.disallow).not.toContain('/');
        }
      }
    });
  });

  describe('SEO optimization', () => {
    test('includes proper sitemap URL', () => {
      const robotsConfig = robots();

      expect(robotsConfig.sitemap).toBeDefined();
      expect(robotsConfig.sitemap).toMatch(/sitemap\.xml$/);

      // Should be absolute URL
      expect(robotsConfig.sitemap).toMatch(/^https?:\/\//);
    });

    test('optimizes for search engine crawling', () => {
      const robotsConfig = robots();

      // Should have reasonable crawl delay if any
      const generalRule = robotsConfig.rules?.find((rule) => rule.userAgent === '*');

      if (generalRule?.crawlDelay) {
        // Crawl delay should be reasonable (not too aggressive)
        expect(generalRule.crawlDelay).toBeLessThanOrEqual(10);
        expect(generalRule.crawlDelay).toBeGreaterThanOrEqual(0);
      }
    });

    test('handles different user agents appropriately', () => {
      const robotsConfig = robots();

      // Should have at least a general rule
      const hasGeneralRule = robotsConfig.rules?.some((rule) => rule.userAgent === '*');
      expect(hasGeneralRule).toBe(true);

      // If there are specific bot rules, they should be properly configured
      robotsConfig.rules?.forEach((rule) => {
        expect(rule.userAgent).toBeTruthy();
        expect(typeof rule.userAgent).toBe('string');
      });
    });
  });
});
