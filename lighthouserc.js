/**
 * Lighthouse CI configuration for performance monitoring
 * @see https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md
 *
 * Updated for Lighthouse v12+ compatibility and current best practices
 */

module.exports = {
  ci: {
    collect: {
      // URLs to test (will be overridden in CI with actual deployment URLs)
      url: ['http://localhost:3000'],

      // Number of runs for statistical significance
      numberOfRuns: 3,

      // Lighthouse settings optimized for v12+
      settings: {
        // Chrome flags for CI environments - updated for better stability
        chromeFlags: [
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--headless=new',
          '--disable-extensions',
          '--disable-background-timer-throttling',
          '--disable-renderer-backgrounding',
          '--disable-backgrounding-occluded-windows',
        ].join(' '),

        // Use performance preset for mobile-first testing
        preset: 'perf',

        // Updated throttling settings aligned with current Lighthouse defaults
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
          requestLatencyMs: 150,
          downloadThroughputKbps: 1638.4,
          uploadThroughputKbps: 675,
        },

        // Additional settings for consistency
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        emulatedFormFactor: 'mobile',
        locale: 'en-US',
      },
    },

    assert: {
      // Performance budget assertions - balanced for development and CI
      assertions: {
        // === CORE CATEGORY SCORES (Realistic thresholds) ===
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.85 }],
        'categories:seo': ['error', { minScore: 0.9 }],

        // === CORE WEB VITALS (Balanced thresholds) ===
        // First Contentful Paint - "Needs Improvement" threshold
        'first-contentful-paint': ['error', { maxNumericValue: 3000 }],

        // Largest Contentful Paint - "Needs Improvement" threshold
        'largest-contentful-paint': ['error', { maxNumericValue: 4000 }],

        // Cumulative Layout Shift - "Needs Improvement" threshold
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.25 }],

        // Total Blocking Time - "Needs Improvement" threshold
        'total-blocking-time': ['error', { maxNumericValue: 600 }],

        // === ADDITIONAL PERFORMANCE METRICS (Conservative) ===
        'speed-index': ['warn', { maxNumericValue: 4000 }],
        interactive: ['warn', { maxNumericValue: 5000 }],

        // === ACCESSIBILITY REQUIREMENTS (Strict) ===
        'color-contrast': ['error', { minScore: 1 }],
        'heading-order': ['error', { minScore: 1 }],
        'html-has-lang': ['error', { minScore: 1 }],
        'image-alt': ['error', { minScore: 1 }],

        // === SEO REQUIREMENTS (Important) ===
        'document-title': ['error', { minScore: 1 }],
        'meta-description': ['error', { minScore: 1 }],
        viewport: ['error', { minScore: 1 }],
      },
    },

    upload: {
      // Upload results to temporary public storage for PR comments
      target: 'temporary-public-storage',

      // Alternative: Use LHCI server for permanent storage
      // target: 'lhci',
      // serverBaseUrl: 'https://your-lhci-server.com',
      // token: process.env.LHCI_TOKEN,
    },

    // Optional: Server configuration for self-hosted LHCI server
    // server: {
    //   port: 9001,
    //   storage: {
    //     storageMethod: 'sql',
    //     sqlDialect: 'sqlite',
    //     sqlDatabasePath: './lhci.db',
    //   },
    // },
  },
};
