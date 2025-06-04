/**
 * Types for Lighthouse CI configuration and performance monitoring
 */

// Import common types
import type { BudgetViolation } from './types';

/**
 * Lighthouse CI configuration types
 */
export interface LighthouseConfig {
  readonly ci: {
    readonly collect: LighthouseCollectConfig;
    readonly assert: LighthouseAssertConfig;
    readonly upload?: LighthouseUploadConfig;
  };
}

export interface LighthouseCollectConfig {
  readonly url: ReadonlyArray<string>;
  readonly numberOfRuns?: number;
  readonly settings?: {
    readonly chromeFlags?: string;
    readonly preset?: 'mobile' | 'desktop';
    readonly throttling?: 'mobile' | 'desktop';
    readonly formFactor?: 'mobile' | 'desktop';
  };
}

export interface LighthouseAssertConfig {
  readonly assertions: Record<string, [string, { minScore?: number; maxNumericValue?: number }]>;
}

export interface LighthouseUploadConfig {
  readonly target: 'temporary-public-storage' | 'lhci';
  readonly serverBaseUrl?: string;
  readonly token?: string;
}

/**
 * Performance budget configuration
 */
export interface PerformanceBudgetConfig {
  readonly performance?: number;
  readonly accessibility?: number;
  readonly bestPractices?: number;
  readonly seo?: number;
  readonly lcp?: number;
  readonly fid?: number;
  readonly cls?: number;
  readonly fcp?: number;
  readonly tbt?: number;
  readonly tti?: number;
  readonly si?: number;
  readonly enableWarnings?: boolean;
  readonly warningThresholds?: {
    readonly lcp?: number;
    readonly fid?: number;
    readonly cls?: number;
    readonly fcp?: number;
  };
}

export type PerformanceBudget = Record<
  string,
  [string, { minScore?: number; maxNumericValue?: number }]
>;

/**
 * Bundle analysis types
 */
export interface BundleStats {
  readonly size: number;
  readonly gzippedSize: number;
  readonly chunks: ReadonlyArray<{
    readonly name: string;
    readonly size: number;
  }>;
}

export interface BundleAnalysis {
  readonly totalSize: number;
  readonly gzippedSize: number;
  readonly isWithinBudget: boolean;
  readonly recommendations: ReadonlyArray<string>;
  readonly chunks: ReadonlyArray<{
    readonly name: string;
    readonly size: number;
    readonly percentage: number;
  }>;
}

/**
 * Performance audit result types
 */
export interface LighthouseResult {
  readonly url: string;
  readonly timestamp: string;
  readonly scores: {
    readonly performance: number;
    readonly accessibility: number;
    readonly bestPractices: number;
    readonly seo: number;
  };
  readonly metrics: {
    readonly lcp: number;
    readonly fid: number;
    readonly cls: number;
    readonly fcp: number;
    readonly tbt: number;
    readonly tti: number;
    readonly si: number;
  };
  readonly budgetViolations: ReadonlyArray<BudgetViolation>;
}

/**
 * Performance monitoring alert configuration
 */
export interface PerformanceAlert {
  readonly id: string;
  readonly name: string;
  readonly metric: string;
  readonly threshold: number;
  readonly comparison: 'greater_than' | 'less_than';
  readonly enabled: boolean;
  readonly recipients: ReadonlyArray<string>;
}

export interface PerformanceAlertConfig {
  readonly alerts: ReadonlyArray<PerformanceAlert>;
  readonly cooldownMinutes: number;
  readonly maxAlertsPerHour: number;
}

/**
 * CI performance test configuration
 */
export interface CIPerformanceConfig {
  readonly lighthouse: LighthouseConfig;
  readonly budgets: PerformanceBudgetConfig;
  readonly alerts: PerformanceAlertConfig;
  readonly failOnBudgetViolation: boolean;
  readonly uploadResults: boolean;
  readonly compareToBaseline: boolean;
}

/**
 * Performance optimization recommendation
 */
export interface OptimizationRecommendation {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly impact: 'high' | 'medium' | 'low';
  readonly effort: 'high' | 'medium' | 'low';
  readonly category: 'loading' | 'interactivity' | 'visual-stability' | 'seo';
  readonly implementationSteps: ReadonlyArray<string>;
}

/**
 * Performance test result summary
 */
export interface PerformanceTestSummary {
  readonly timestamp: string;
  readonly url: string;
  readonly device: 'mobile' | 'desktop';
  readonly passed: boolean;
  readonly score: number;
  readonly metrics: Record<string, number>;
  readonly violations: ReadonlyArray<string>;
  readonly recommendations: ReadonlyArray<OptimizationRecommendation>;
}

/**
 * GitHub Actions workflow configuration
 */
export interface GitHubWorkflowConfig {
  readonly name: string;
  readonly triggers: ReadonlyArray<'push' | 'pull_request' | 'schedule' | 'workflow_dispatch'>;
  readonly nodeVersion: string;
  readonly lighthouseConfig: {
    readonly configPath: string;
    readonly uploadResults?: boolean;
    readonly failOnBudgetViolation?: boolean;
    readonly budgets?: PerformanceBudgetConfig;
    readonly prComments?: boolean;
    readonly serverToken?: string;
  };
  readonly schedule?: string;
  readonly cacheStrategy?: 'npm' | 'yarn' | 'pnpm';
  readonly bundleAnalysis?: boolean;
  readonly environments?: ReadonlyArray<{
    readonly name: string;
    readonly url: string;
  }>;
  readonly slackNotifications?: {
    readonly webhook: string;
    readonly channel: string;
  };
}

/**
 * Workflow execution result
 */
export interface WorkflowResult {
  readonly passed: boolean;
  readonly timestamp: string;
  readonly overallScore: number;
  readonly reports: ReadonlyArray<{
    readonly url: string;
    readonly passed: boolean;
    readonly scores: Record<string, number>;
    readonly metrics: Record<string, number>;
    readonly budgetViolations: ReadonlyArray<{
      readonly metric: string;
      readonly actual: number;
      readonly budget: number;
    }>;
  }>;
  readonly summary: {
    readonly totalUrls: number;
    readonly passedUrls: number;
    readonly failedUrls: number;
    readonly averagePerformanceScore: number;
  };
}
