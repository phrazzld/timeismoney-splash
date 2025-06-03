/**
 * Tests for Lighthouse CI configuration (T021)
 */

import { validateLighthouseConfig, createPerformanceBudgets, analyzeBundleSize } from '@/lib/performance/lighthouse-config';
import type { LighthouseConfig, PerformanceBudget, BundleAnalysis } from '@/lib/performance/lighthouse-types';

describe('Lighthouse Configuration (T021)', () => {
  describe('validateLighthouseConfig', () => {
    it('should validate a correct Lighthouse configuration', () => {
      const validConfig: LighthouseConfig = {
        ci: {
          collect: {
            url: ['http://localhost:3000'],
            numberOfRuns: 3,
            settings: {
              chromeFlags: '--no-sandbox',
            },
          },
          assert: {
            assertions: {
              'categories:performance': ['error', { minScore: 0.95 }],
              'categories:accessibility': ['error', { minScore: 0.95 }],
              'categories:best-practices': ['error', { minScore: 0.95 }],
              'categories:seo': ['error', { minScore: 0.95 }],
            },
          },
        },
      };

      expect(() => validateLighthouseConfig(validConfig)).not.toThrow();
      expect(validateLighthouseConfig(validConfig)).toBe(true);
    });

    it('should reject configuration with missing required fields', () => {
      const incompleteConfig = {
        ci: {
          collect: {
            url: ['http://localhost:3000'],
          },
          // Missing assert configuration
        },
      } as LighthouseConfig;

      expect(() => validateLighthouseConfig(incompleteConfig)).toThrow('Missing assert configuration');
    });

    it('should reject configuration with invalid performance score threshold', () => {
      const invalidConfig: LighthouseConfig = {
        ci: {
          collect: {
            url: ['http://localhost:3000'],
            numberOfRuns: 3,
          },
          assert: {
            assertions: {
              'categories:performance': ['error', { minScore: 1.5 }], // Invalid: > 1
            },
          },
        },
      };

      expect(() => validateLighthouseConfig(invalidConfig)).toThrow('Invalid performance score threshold');
    });

    it('should validate Core Web Vitals assertions', () => {
      const configWithWebVitals: LighthouseConfig = {
        ci: {
          collect: {
            url: ['http://localhost:3000'],
            numberOfRuns: 3,
          },
          assert: {
            assertions: {
              'categories:performance': ['error', { minScore: 0.95 }],
              'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
              'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
              'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
              'max-potential-fid': ['error', { maxNumericValue: 100 }],
            },
          },
        },
      };

      expect(() => validateLighthouseConfig(configWithWebVitals)).not.toThrow();
      expect(validateLighthouseConfig(configWithWebVitals)).toBe(true);
    });

    it('should handle configuration with upload settings', () => {
      const configWithUpload: LighthouseConfig = {
        ci: {
          collect: {
            url: ['http://localhost:3000'],
            numberOfRuns: 3,
          },
          assert: {
            assertions: {
              'categories:performance': ['error', { minScore: 0.95 }],
            },
          },
          upload: {
            target: 'temporary-public-storage',
          },
        },
      };

      expect(() => validateLighthouseConfig(configWithUpload)).not.toThrow();
      expect(validateLighthouseConfig(configWithUpload)).toBe(true);
    });
  });

  describe('createPerformanceBudgets', () => {
    it('should create performance budgets with Core Web Vitals targets', () => {
      const budgets = createPerformanceBudgets({
        performance: 95,
        lcp: 2500,
        fid: 100,
        cls: 0.1,
        fcp: 1800,
        tbt: 300,
      });

      expect(budgets).toEqual({
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'max-potential-fid': ['error', { maxNumericValue: 100 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        'interactive': ['error', { maxNumericValue: 3000 }],
      });
    });

    it('should apply default values for missing budget parameters', () => {
      const budgets = createPerformanceBudgets({
        performance: 90,
      });

      expect(budgets['categories:performance']).toEqual(['error', { minScore: 0.9 }]);
      expect(budgets['largest-contentful-paint']).toEqual(['error', { maxNumericValue: 2500 }]);
      expect(budgets['cumulative-layout-shift']).toEqual(['error', { maxNumericValue: 0.1 }]);
    });

    it('should handle strict budget configuration', () => {
      const strictBudgets = createPerformanceBudgets({
        performance: 98,
        lcp: 2000,
        fid: 50,
        cls: 0.05,
        fcp: 1500,
        tbt: 200,
      });

      expect(strictBudgets['categories:performance']).toEqual(['error', { minScore: 0.98 }]);
      expect(strictBudgets['largest-contentful-paint']).toEqual(['error', { maxNumericValue: 2000 }]);
      expect(strictBudgets['cumulative-layout-shift']).toEqual(['error', { maxNumericValue: 0.05 }]);
    });

    it('should reject invalid budget values', () => {
      expect(() => createPerformanceBudgets({
        performance: 105, // Invalid: > 100
      })).toThrow('Invalid performance score');

      expect(() => createPerformanceBudgets({
        lcp: -100, // Invalid: negative
      })).toThrow('Invalid LCP threshold');

      expect(() => createPerformanceBudgets({
        cls: 2, // Invalid: > 1
      })).toThrow('Invalid CLS threshold');
    });
  });

  describe('Bundle Analysis Integration', () => {
    it('should analyze bundle size and provide recommendations', () => {
      const mockBundleStats = {
        size: 250000, // 250KB
        gzippedSize: 80000, // 80KB
        chunks: [
          { name: 'main', size: 150000 },
          { name: 'vendor', size: 100000 },
        ],
      };

      const analysis = analyzeBundleSize(mockBundleStats);

      expect(analysis).toEqual({
        totalSize: 250000,
        gzippedSize: 80000,
        isWithinBudget: true, // Under 300KB budget
        recommendations: [],
        chunks: expect.arrayContaining([
          expect.objectContaining({ name: 'main', size: 150000 }),
          expect.objectContaining({ name: 'vendor', size: 100000 }),
        ]),
      });
    });

    it('should flag bundles exceeding size budgets', () => {
      const largeBundleStats = {
        size: 500000, // 500KB - exceeds budget
        gzippedSize: 180000, // 180KB
        chunks: [
          { name: 'main', size: 300000 },
          { name: 'vendor', size: 200000 },
        ],
      };

      const analysis = analyzeBundleSize(largeBundleStats);

      expect(analysis.isWithinBudget).toBe(false);
      expect(analysis.recommendations).toContain('Consider code splitting for large chunks');
      expect(analysis.recommendations).toContain('Optimize vendor bundle size');
    });

    it('should provide specific recommendations for optimization', () => {
      const heavyVendorBundle = {
        size: 400000,
        gzippedSize: 120000,
        chunks: [
          { name: 'main', size: 100000 },
          { name: 'vendor', size: 300000 }, // Very large vendor chunk
        ],
      };

      const analysis = analyzeBundleSize(heavyVendorBundle);

      expect(analysis.recommendations).toContain('Vendor chunk is too large (300KB), consider splitting');
      expect(analysis.recommendations).toContain('Review third-party dependencies for optimization opportunities');
    });
  });

  describe('Performance Assertion Helpers', () => {
    it('should create assertion for Core Web Vitals compliance', () => {
      const assertion = createPerformanceBudgets({
        performance: 95,
        lcp: 2500,
        fid: 100,
        cls: 0.1,
      });

      // Verify all Core Web Vitals are covered
      expect(assertion).toHaveProperty('largest-contentful-paint');
      expect(assertion).toHaveProperty('max-potential-fid');
      expect(assertion).toHaveProperty('cumulative-layout-shift');
      expect(assertion).toHaveProperty('first-contentful-paint');

      // Verify thresholds match targets
      expect(assertion['largest-contentful-paint']).toEqual(['error', { maxNumericValue: 2500 }]);
      expect(assertion['max-potential-fid']).toEqual(['error', { maxNumericValue: 100 }]);
      expect(assertion['cumulative-layout-shift']).toEqual(['error', { maxNumericValue: 0.1 }]);
    });

    it('should create warnings for near-threshold values', () => {
      const budgets = createPerformanceBudgets({
        performance: 95,
        enableWarnings: true,
        warningThresholds: {
          lcp: 2000, // Warning at 2s, error at 2.5s
          fid: 80,   // Warning at 80ms, error at 100ms
        },
      });

      expect(budgets).toHaveProperty('largest-contentful-paint-warning');
      expect(budgets['largest-contentful-paint-warning']).toEqual(['warn', { maxNumericValue: 2000 }]);
    });
  });

  describe('CI Configuration Validation', () => {
    it('should validate CI-specific settings', () => {
      const ciConfig: LighthouseConfig = {
        ci: {
          collect: {
            url: ['http://localhost:3000'],
            numberOfRuns: 3,
            settings: {
              chromeFlags: '--no-sandbox --disable-dev-shm-usage',
              preset: 'desktop',
            },
          },
          assert: {
            assertions: createPerformanceBudgets({ performance: 95 }),
          },
        },
      };

      expect(validateLighthouseConfig(ciConfig)).toBe(true);
    });

    it('should validate mobile and desktop presets', () => {
      const mobileConfig: LighthouseConfig = {
        ci: {
          collect: {
            url: ['http://localhost:3000'],
            numberOfRuns: 3,
            settings: {
              preset: 'mobile',
            },
          },
          assert: {
            assertions: createPerformanceBudgets({ performance: 90 }), // More lenient for mobile
          },
        },
      };

      expect(validateLighthouseConfig(mobileConfig)).toBe(true);
    });

    it('should handle multiple URL configurations', () => {
      const multiUrlConfig: LighthouseConfig = {
        ci: {
          collect: {
            url: [
              'http://localhost:3000',
              'http://localhost:3000/about',
              'http://localhost:3000/contact',
            ],
            numberOfRuns: 2,
          },
          assert: {
            assertions: createPerformanceBudgets({ performance: 95 }),
          },
        },
      };

      expect(validateLighthouseConfig(multiUrlConfig)).toBe(true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed configuration gracefully', () => {
      const malformedConfig = {
        ci: 'invalid',
      } as any;

      expect(() => validateLighthouseConfig(malformedConfig)).toThrow('Invalid configuration format');
    });

    it('should validate URL format', () => {
      const invalidUrlConfig: LighthouseConfig = {
        ci: {
          collect: {
            url: ['not-a-valid-url'],
            numberOfRuns: 3,
          },
          assert: {
            assertions: createPerformanceBudgets({ performance: 95 }),
          },
        },
      };

      expect(() => validateLighthouseConfig(invalidUrlConfig)).toThrow('Invalid URL format');
    });

    it('should handle empty assertions', () => {
      const emptyAssertionsConfig: LighthouseConfig = {
        ci: {
          collect: {
            url: ['http://localhost:3000'],
            numberOfRuns: 3,
          },
          assert: {
            assertions: {},
          },
        },
      };

      expect(() => validateLighthouseConfig(emptyAssertionsConfig)).toThrow('No assertions defined');
    });
  });
});