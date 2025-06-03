/**
 * Lighthouse CI configuration for performance monitoring
 * @see https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md
 */

const { createPerformanceBudgets } = require('./lib/performance/lighthouse-config');

module.exports = {
  ci: {
    collect: {
      // URLs to test (will be overridden in CI with actual deployment URLs)
      url: ['http://localhost:3000'],
      
      // Number of runs for statistical significance
      numberOfRuns: 3,
      
      // Lighthouse settings
      settings: {
        // Chrome flags for CI environments
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --headless',
        
        // Use mobile preset for primary testing (mobile-first approach)
        preset: 'mobile',
        
        // Throttling settings (mobile 3G by default)
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
        },
      },
    },
    
    assert: {
      // Performance budget assertions
      assertions: {
        // Core categories - strict requirements
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.90 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        
        // Core Web Vitals - "good" thresholds
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'max-potential-fid': ['error', { maxNumericValue: 100 }],
        
        // Additional performance metrics
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        'interactive': ['error', { maxNumericValue: 3000 }],
        
        // Warning thresholds (more lenient)
        'first-contentful-paint': ['warn', { maxNumericValue: 1500 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.05 }],
        'total-blocking-time': ['warn', { maxNumericValue: 200 }],
      },
    },
    
    upload: {
      // Upload results to temporary public storage for PR comments
      target: 'temporary-public-storage',
      
      // Uncomment and configure for LHCI server
      // target: 'lhci',
      // serverBaseUrl: 'https://your-lhci-server.com',
      // token: process.env.LHCI_TOKEN,
    },
    
    // Server configuration (if using LHCI server)
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