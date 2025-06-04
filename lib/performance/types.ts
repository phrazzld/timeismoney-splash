/**
 * Types for performance monitoring and Lighthouse CI configuration
 */

/**
 * Performance rating for Web Vitals metrics
 */
export type PerformanceRating = 'good' | 'needs-improvement' | 'poor';

/**
 * Raw metric data from web-vitals library
 */
export interface RawMetric {
  readonly name: string;
  readonly value: number;
  readonly rating?: PerformanceRating;
  readonly delta?: number;
  readonly id?: string;
  readonly entries?: readonly PerformanceEntry[];
}

/**
 * Enhanced metric with additional context
 */
export interface EnhancedMetric extends RawMetric {
  readonly timestamp: string;
  readonly url: string;
  readonly userAgent: string;
  readonly correlationId: string;
  readonly deviceMemory?: number;
  readonly connectionType?: string;
  readonly rating: PerformanceRating;
}

/**
 * Performance monitoring configuration
 */
export interface PerformanceConfig {
  readonly enableLCP: boolean;
  readonly enableFID: boolean;
  readonly enableCLS: boolean;
  readonly enableFCP: boolean;
  readonly enableINP: boolean;
  readonly enableTTFB: boolean;
  readonly enableNavigation: boolean;
  readonly enableResource: boolean;
  readonly sampleRate: number;
  readonly bufferSize: number;
  readonly flushInterval: number;
  readonly thresholds: PerformanceThresholds;
}

/**
 * Performance thresholds for different metrics
 */
export interface PerformanceThresholds {
  readonly [metricName: string]: {
    readonly good: number;
    readonly poor: number;
  };
}

/**
 * Navigation timing metrics
 */
export interface NavigationMetrics {
  readonly navigationStart: number;
  readonly domContentLoaded: number;
  readonly loadComplete: number;
  readonly firstPaint?: number;
  readonly firstContentfulPaint?: number;
  readonly timeToInteractive?: number;
  readonly totalBlockingTime?: number;
}

/**
 * Resource timing metric
 */
export interface ResourceMetric {
  readonly name: string;
  readonly type: string;
  readonly startTime: number;
  readonly duration: number;
  readonly transferSize: number;
  readonly encodedBodySize: number;
  readonly decodedBodySize: number;
}

/**
 * Device information for performance context
 */
export interface DeviceInfo {
  readonly userAgent: string;
  readonly deviceMemory?: number;
  readonly hardwareConcurrency?: number;
  readonly connectionType?: string;
  readonly effectiveType?: string;
  readonly downlink?: number;
  readonly rtt?: number;
  readonly saveData?: boolean;
}

/**
 * Budget violation data
 */
export interface BudgetViolation {
  readonly metric: string;
  readonly value: number;
  readonly threshold: number;
  readonly severity: 'warning' | 'error';
  readonly timestamp: string;
  readonly url?: string;
}

/**
 * Callback for performance metric observations
 */
export type PerformanceObserverCallback = (metric: EnhancedMetric) => void;

/**
 * Performance monitor interface
 */
export interface PerformanceMonitor {
  readonly config: PerformanceConfig;
  start(): void;
  stop(): void;
  getMetrics(): ReadonlyArray<EnhancedMetric>;
  clearMetrics(): void;
  onMetric(callback: PerformanceObserverCallback): () => void;
  flush(): Promise<void>;
}

/**
 * Performance report summary
 */
export interface PerformanceReport {
  readonly timestamp: string;
  readonly url: string;
  readonly metrics: ReadonlyArray<EnhancedMetric>;
  readonly budgetViolations: ReadonlyArray<BudgetViolation>;
  readonly deviceInfo: DeviceInfo;
  readonly navigationMetrics: NavigationMetrics;
  readonly resourceMetrics: ReadonlyArray<ResourceMetric>;
}

/**
 * Web Vitals metric data
 */
export interface WebVitalMetric {
  readonly name: string;
  readonly value: number;
  readonly rating: PerformanceRating;
  readonly delta?: number;
  readonly url?: string;
  readonly userAgent?: string;
  readonly id?: string;
  readonly timestamp?: number;
  readonly correlationId?: string;
}

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
