/**
 * Lighthouse CI configuration and validation utilities
 */

import type { 
  LighthouseConfig, 
  PerformanceBudgetConfig, 
  PerformanceBudget,
  BundleStats,
  BundleAnalysis,
} from './lighthouse-types';

/**
 * Default performance budget thresholds
 */
const DEFAULT_BUDGETS: Required<Omit<PerformanceBudgetConfig, 'enableWarnings' | 'warningThresholds'>> = {
  performance: 95,
  accessibility: 95,
  bestPractices: 90,
  seo: 95,
  lcp: 2500,    // 2.5s - "good" threshold
  fid: 100,     // 100ms - "good" threshold
  cls: 0.1,     // 0.1 - "good" threshold
  fcp: 1800,    // 1.8s - optimistic target
  tbt: 300,     // 300ms - reasonable target
  tti: 3000,    // 3s - interactive threshold
  si: 3000,     // 3s - speed index target
};

/**
 * Bundle size budgets (in bytes)
 */
const BUNDLE_BUDGETS = {
  maxTotalSize: 300000,      // 300KB
  maxGzippedSize: 100000,    // 100KB gzipped
  maxChunkSize: 200000,      // 200KB per chunk
  vendorThreshold: 150000,   // 150KB vendor chunk warning
};

/**
 * Validates a Lighthouse CI configuration
 */
export function validateLighthouseConfig(config: LighthouseConfig): boolean {
  if (!config.ci) {
    throw new Error('Invalid configuration format: missing ci section');
  }

  const { collect, assert } = config.ci;

  // Validate collect configuration
  if (!collect) {
    throw new Error('Missing collect configuration');
  }

  if (!collect.url || !Array.isArray(collect.url) || collect.url.length === 0) {
    throw new Error('Missing or invalid URL configuration');
  }

  // Validate URL format
  for (const url of collect.url) {
    try {
      new URL(url);
    } catch {
      throw new Error(`Invalid URL format: ${url}`);
    }
  }

  // Validate assert configuration
  if (!assert) {
    throw new Error('Missing assert configuration');
  }

  if (!assert.assertions || Object.keys(assert.assertions).length === 0) {
    throw new Error('No assertions defined');
  }

  // Validate assertion values
  for (const [key, [level, config]] of Object.entries(assert.assertions)) {
    if (level !== 'error' && level !== 'warn') {
      throw new Error(`Invalid assertion level: ${level}`);
    }

    if (config.minScore !== undefined) {
      if (config.minScore < 0 || config.minScore > 1) {
        throw new Error(`Invalid performance score threshold: ${config.minScore}`);
      }
    }

    if (config.maxNumericValue !== undefined) {
      if (config.maxNumericValue < 0) {
        throw new Error(`Invalid numeric threshold: ${config.maxNumericValue}`);
      }
    }
  }

  return true;
}

/**
 * Creates performance budget assertions for Lighthouse CI
 */
export function createPerformanceBudgets(
  config: PerformanceBudgetConfig & { enableWarnings?: boolean; warningThresholds?: any }
): PerformanceBudget {
  // Validate input values
  if (config.performance !== undefined && (config.performance < 0 || config.performance > 100)) {
    throw new Error('Invalid performance score: must be between 0 and 100');
  }

  if (config.lcp !== undefined && config.lcp < 0) {
    throw new Error('Invalid LCP threshold: must be positive');
  }

  if (config.cls !== undefined && (config.cls < 0 || config.cls > 1)) {
    throw new Error('Invalid CLS threshold: must be between 0 and 1');
  }

  // Merge with defaults
  const budgets = { ...DEFAULT_BUDGETS, ...config };

  const assertions: PerformanceBudget = {
    // Lighthouse categories
    'categories:performance': ['error', { minScore: budgets.performance / 100 }],
    'categories:accessibility': ['error', { minScore: budgets.accessibility / 100 }],
    'categories:best-practices': ['error', { minScore: budgets.bestPractices / 100 }],
    'categories:seo': ['error', { minScore: budgets.seo / 100 }],

    // Core Web Vitals
    'first-contentful-paint': ['error', { maxNumericValue: budgets.fcp }],
    'largest-contentful-paint': ['error', { maxNumericValue: budgets.lcp }],
    'cumulative-layout-shift': ['error', { maxNumericValue: budgets.cls }],
    'max-potential-fid': ['error', { maxNumericValue: budgets.fid }],

    // Additional performance metrics
    'total-blocking-time': ['error', { maxNumericValue: budgets.tbt }],
    'speed-index': ['error', { maxNumericValue: budgets.si }],
    'interactive': ['error', { maxNumericValue: budgets.tti }],
  };

  // Add warning thresholds if enabled
  if (config.enableWarnings && config.warningThresholds) {
    const warnings = config.warningThresholds;

    if (warnings.lcp) {
      assertions['largest-contentful-paint-warning'] = ['warn', { maxNumericValue: warnings.lcp }];
    }

    if (warnings.fid) {
      assertions['max-potential-fid-warning'] = ['warn', { maxNumericValue: warnings.fid }];
    }

    if (warnings.cls) {
      assertions['cumulative-layout-shift-warning'] = ['warn', { maxNumericValue: warnings.cls }];
    }

    if (warnings.fcp) {
      assertions['first-contentful-paint-warning'] = ['warn', { maxNumericValue: warnings.fcp }];
    }
  }

  return assertions;
}

/**
 * Analyzes bundle size and provides optimization recommendations
 */
export function analyzeBundleSize(stats: BundleStats): BundleAnalysis {
  const { size, gzippedSize, chunks } = stats;
  const recommendations: string[] = [];

  // Check total size budget
  const isWithinBudget = size <= BUNDLE_BUDGETS.maxTotalSize && 
                        gzippedSize <= BUNDLE_BUDGETS.maxGzippedSize;

  if (!isWithinBudget) {
    if (size > BUNDLE_BUDGETS.maxTotalSize) {
      recommendations.push('Total bundle size exceeds budget (300KB)');
      recommendations.push('Consider code splitting for large chunks');
    }

    if (gzippedSize > BUNDLE_BUDGETS.maxGzippedSize) {
      recommendations.push('Gzipped bundle size exceeds budget (100KB)');
    }
  }

  // Analyze individual chunks
  const chunksWithPercentage = chunks.map(chunk => ({
    ...chunk,
    percentage: Math.round((chunk.size / size) * 100),
  }));

  for (const chunk of chunksWithPercentage) {
    if (chunk.size > BUNDLE_BUDGETS.maxChunkSize) {
      recommendations.push(`Chunk "${chunk.name}" is too large (${Math.round(chunk.size / 1000)}KB)`);
    }

    if (chunk.name === 'vendor' && chunk.size > BUNDLE_BUDGETS.vendorThreshold) {
      recommendations.push(`Vendor chunk is too large (${Math.round(chunk.size / 1000)}KB), consider splitting`);
      recommendations.push('Review third-party dependencies for optimization opportunities');
    }
  }

  // General optimization recommendations
  if (size > BUNDLE_BUDGETS.maxTotalSize * 0.8) { // Within 80% of budget
    recommendations.push('Consider implementing tree shaking to eliminate unused code');
    recommendations.push('Review and minimize third-party dependencies');
  }

  if (!isWithinBudget) {
    recommendations.push('Optimize vendor bundle size');
    recommendations.push('Implement dynamic imports for non-critical features');
  }

  return {
    totalSize: size,
    gzippedSize,
    isWithinBudget,
    recommendations,
    chunks: chunksWithPercentage,
  };
}

/**
 * Creates a complete Lighthouse CI configuration
 */
export function createLighthouseConfig(
  urls: string[],
  budgetConfig: PerformanceBudgetConfig = {},
  options: {
    numberOfRuns?: number;
    preset?: 'mobile' | 'desktop';
    upload?: boolean;
  } = {}
): LighthouseConfig {
  const { numberOfRuns = 3, preset = 'mobile', upload = false } = options;

  const config: LighthouseConfig = {
    ci: {
      collect: {
        url: urls,
        numberOfRuns,
        settings: {
          chromeFlags: '--no-sandbox --disable-dev-shm-usage',
          preset,
        },
      },
      assert: {
        assertions: createPerformanceBudgets(budgetConfig),
      },
    },
  };

  if (upload) {
    config.ci.upload = {
      target: 'temporary-public-storage',
    };
  }

  return config;
}

/**
 * Validates Core Web Vitals thresholds against industry standards
 */
export function validateCoreWebVitals(metrics: {
  lcp?: number;
  fid?: number;
  cls?: number;
}): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  let isValid = true;

  // LCP (Largest Contentful Paint)
  if (metrics.lcp !== undefined) {
    if (metrics.lcp > 4000) {
      warnings.push('LCP threshold is too lenient (> 4s is poor)');
      isValid = false;
    } else if (metrics.lcp > 2500) {
      warnings.push('LCP threshold needs improvement (> 2.5s)');
    }
  }

  // FID (First Input Delay)
  if (metrics.fid !== undefined) {
    if (metrics.fid > 300) {
      warnings.push('FID threshold is too lenient (> 300ms is poor)');
      isValid = false;
    } else if (metrics.fid > 100) {
      warnings.push('FID threshold needs improvement (> 100ms)');
    }
  }

  // CLS (Cumulative Layout Shift)
  if (metrics.cls !== undefined) {
    if (metrics.cls > 0.25) {
      warnings.push('CLS threshold is too lenient (> 0.25 is poor)');
      isValid = false;
    } else if (metrics.cls > 0.1) {
      warnings.push('CLS threshold needs improvement (> 0.1)');
    }
  }

  return { isValid, warnings };
}

/**
 * Default Lighthouse CI configuration for the project
 */
export const DEFAULT_LIGHTHOUSE_CONFIG = createLighthouseConfig(
  ['http://localhost:3000'],
  {
    performance: 95,
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    fcp: 1800,
    tbt: 300,
  },
  {
    numberOfRuns: 3,
    preset: 'mobile',
    upload: true,
  }
);