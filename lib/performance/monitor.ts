/**
 * Performance monitor orchestration and management
 */

import { setupWebVitals, WebVitalsCollector } from './web-vitals';
import type {
  PerformanceConfig,
  PerformanceMonitor,
  EnhancedMetric,
  PerformanceObserverCallback,
  BudgetViolation,
  DeviceInfo,
  NavigationMetrics,
  ResourceMetric,
  PerformanceThresholds,
} from './types';

/**
 * Default performance monitoring configuration
 */
const DEFAULT_CONFIG: PerformanceConfig = {
  enableLCP: true,
  enableFID: true,
  enableCLS: true,
  enableFCP: true,
  enableINP: true,
  enableTTFB: true,
  enableNavigation: true,
  enableResource: true,
  sampleRate: 1.0,
  bufferSize: 1000,
  flushInterval: 30000, // 30 seconds
  thresholds: {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    INP: { good: 200, poor: 500 },
    TTFB: { good: 800, poor: 1800 },
  },
};

/**
 * Gets the default performance monitoring configuration
 */
export function getDefaultConfig(): PerformanceConfig {
  return { ...DEFAULT_CONFIG };
}

/**
 * Validates performance monitoring configuration
 */
export function validateConfig(config: PerformanceConfig): void {
  if (config.sampleRate < 0 || config.sampleRate > 1) {
    throw new Error('Sample rate must be between 0 and 1');
  }

  if (config.bufferSize < 1) {
    throw new Error('Buffer size must be at least 1');
  }

  if (config.flushInterval < 100) {
    throw new Error('Flush interval must be at least 100ms');
  }

  // Validate thresholds
  Object.entries(config.thresholds).forEach(([metric, thresholds]) => {
    if (thresholds.good < 0 || thresholds.poor < 0) {
      throw new Error(`Invalid thresholds for ${metric}: values must be positive`);
    }

    if (thresholds.good >= thresholds.poor) {
      throw new Error(`Invalid thresholds for ${metric}: good must be less than poor`);
    }
  });
}

/**
 * Normalizes and validates configuration, applying defaults for missing values
 */
function normalizeConfig(config: Partial<PerformanceConfig> = {}): PerformanceConfig {
  const normalized = { ...DEFAULT_CONFIG, ...config };

  // Apply bounds to numeric values
  normalized.sampleRate = Math.max(0, Math.min(1, normalized.sampleRate));
  normalized.bufferSize = Math.max(1, normalized.bufferSize);
  normalized.flushInterval = Math.max(100, normalized.flushInterval);

  return normalized;
}

/**
 * Calculates budget violations based on metrics and thresholds
 */
export function calculateBudgetViolations(
  metrics: ReadonlyArray<EnhancedMetric>,
  thresholds: PerformanceThresholds,
): BudgetViolation[] {
  const violations: BudgetViolation[] = [];

  metrics.forEach((metric) => {
    const threshold = thresholds[metric.name];
    if (!threshold) {
      return;
    }

    let violation: BudgetViolation | null = null;

    if (metric.value > threshold.poor) {
      violation = {
        metric: metric.name,
        value: metric.value,
        threshold: threshold.poor,
        severity: 'error',
        timestamp: metric.timestamp,
        url: metric.url,
      };
    } else if (metric.value > threshold.good) {
      violation = {
        metric: metric.name,
        value: metric.value,
        threshold: threshold.good,
        severity: 'warning',
        timestamp: metric.timestamp,
        url: metric.url,
      };
    }

    if (violation) {
      violations.push(violation);
    }
  });

  return violations;
}

/**
 * Collects device information for performance context
 */
export function getDeviceInfo(): DeviceInfo {
  const deviceInfo: { -readonly [K in keyof DeviceInfo]?: DeviceInfo[K] } = {
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
  };

  if (typeof navigator !== 'undefined') {
    // Device memory (experimental API)
    if ('deviceMemory' in navigator) {
      const deviceMemory = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
      if (typeof deviceMemory === 'number') {
        deviceInfo.deviceMemory = deviceMemory;
      }
    }

    // Hardware concurrency
    if ('hardwareConcurrency' in navigator) {
      deviceInfo.hardwareConcurrency = navigator.hardwareConcurrency;
    }

    // Network information (experimental API)
    if ('connection' in navigator) {
      const connection = (
        navigator as unknown as {
          connection?: {
            effectiveType?: string;
            downlink?: number;
            rtt?: number;
            saveData?: boolean;
          };
        }
      ).connection;
      if (connection) {
        deviceInfo.connectionType = connection.effectiveType;
        deviceInfo.effectiveType = connection.effectiveType;
        deviceInfo.downlink = connection.downlink;
        deviceInfo.rtt = connection.rtt;
        deviceInfo.saveData = connection.saveData;
      }
    }
  }

  return deviceInfo as DeviceInfo;
}

/**
 * Collects navigation timing metrics
 */
export function getNavigationMetrics(): NavigationMetrics {
  const defaultMetrics: NavigationMetrics = {
    navigationStart: 0,
    domContentLoaded: 0,
    loadComplete: 0,
    firstPaint: undefined,
    firstContentfulPaint: undefined,
    timeToInteractive: undefined,
    totalBlockingTime: undefined,
  };

  if (typeof performance === 'undefined' || !performance.timing) {
    return defaultMetrics;
  }

  const timing = performance.timing;
  const navigationStart = timing.navigationStart;

  const metrics: { -readonly [K in keyof NavigationMetrics]?: NavigationMetrics[K] } = {
    navigationStart,
    domContentLoaded: timing.domContentLoadedEventEnd - navigationStart,
    loadComplete: timing.loadEventEnd - navigationStart,
    firstPaint: undefined,
    firstContentfulPaint: undefined,
    timeToInteractive: undefined,
    totalBlockingTime: undefined,
  };

  // Try to get paint metrics from performance entries
  if (performance.getEntriesByType) {
    try {
      const paintEntries = performance.getEntriesByType('paint');

      const firstPaint = paintEntries.find((entry) => entry.name === 'first-paint');
      if (firstPaint) {
        metrics.firstPaint = firstPaint.startTime;
      }

      const firstContentfulPaint = paintEntries.find(
        (entry) => entry.name === 'first-contentful-paint',
      );
      if (firstContentfulPaint) {
        metrics.firstContentfulPaint = firstContentfulPaint.startTime;
      }
    } catch {
      // Paint entries not available or not supported
    }
  }

  return metrics as NavigationMetrics;
}

/**
 * Collects resource timing metrics
 */
export function getResourceMetrics(): ResourceMetric[] {
  if (typeof performance === 'undefined' || !performance.getEntriesByType) {
    return [];
  }

  try {
    const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    return resourceEntries.map((entry) => ({
      name: entry.name,
      type: entry.initiatorType,
      startTime: entry.startTime,
      duration: entry.duration,
      transferSize: entry.transferSize,
      encodedBodySize: entry.encodedBodySize,
      decodedBodySize: entry.decodedBodySize,
    }));
  } catch (error) {
    console.warn('Failed to collect resource metrics:', error);
    return [];
  }
}

/**
 * Performance monitor implementation
 */
export class PerformanceMonitorImpl implements PerformanceMonitor {
  public readonly config: PerformanceConfig;
  private isStarted = false;
  private metrics: EnhancedMetric[] = [];
  private callbacks: Set<PerformanceObserverCallback> = new Set();
  private flushTimer?: NodeJS.Timeout;
  private webVitalsCollector?: WebVitalsCollector;

  constructor(config: PerformanceConfig) {
    this.config = normalizeConfig(config);
    try {
      validateConfig(this.config);
    } catch (error) {
      console.warn('Invalid performance config, using defaults:', error);
      this.config = getDefaultConfig();
    }
  }

  /**
   * Starts performance monitoring
   */
  start(): void {
    if (this.isStarted) {
      return;
    }

    this.isStarted = true;

    try {
      // Set up web vitals collection
      this.setupWebVitalsCollection();

      // Set up automatic flushing
      this.setupAutoFlush();

      console.debug('Performance monitoring started');
    } catch (error) {
      console.error('Failed to start performance monitoring:', error);
      this.isStarted = false;
    }
  }

  /**
   * Stops performance monitoring
   */
  stop(): void {
    if (!this.isStarted) {
      return;
    }

    this.isStarted = false;

    // Clean up timers
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }

    // Stop web vitals collector
    if (this.webVitalsCollector) {
      this.webVitalsCollector.stop();
      this.webVitalsCollector = undefined;
    }

    // Clear metrics
    this.clearMetrics();

    console.debug('Performance monitoring stopped');
  }

  /**
   * Gets all collected metrics
   */
  getMetrics(): ReadonlyArray<EnhancedMetric> {
    return [...this.metrics];
  }

  /**
   * Clears all collected metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Adds a callback for metric notifications
   */
  onMetric(callback: PerformanceObserverCallback): () => void {
    this.callbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Flushes all collected metrics
   */
  async flush(): Promise<void> {
    try {
      if (this.metrics.length === 0) {
        return;
      }

      // In a real implementation, this would send metrics to a remote endpoint
      // For now, we'll just simulate the flush operation
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Clear metrics after successful flush
      this.clearMetrics();

      console.debug('Performance metrics flushed');
    } catch (error) {
      console.error('Failed to flush performance metrics:', error);
      throw error;
    }
  }

  /**
   * Sets up web vitals collection
   */
  private setupWebVitalsCollection(): void {
    const metricHandler = (metric: EnhancedMetric): void => {
      if (!this.isStarted) {
        return;
      }

      try {
        this.addMetric(metric);
        this.notifyCallbacks(metric);
      } catch (error) {
        console.error('Error handling web vital metric:', error);
      }
    };

    // Use the basic setup for now
    setupWebVitals(metricHandler, this.config);

    // Alternative: Use advanced collector (commented out for now)
    // this.webVitalsCollector = new WebVitalsCollector(this.config);
    // this.webVitalsCollector.onMetric(metricHandler);
    // this.webVitalsCollector.start();
  }

  /**
   * Sets up automatic flushing
   */
  private setupAutoFlush(): void {
    if (this.config.flushInterval > 0) {
      this.flushTimer = setInterval(() => {
        this.flush().catch((error) => {
          console.error('Auto-flush failed:', error);
        });
      }, this.config.flushInterval);

      // Don't keep the process alive
      if (this.flushTimer.unref) {
        this.flushTimer.unref();
      }
    }
  }

  /**
   * Adds a metric to the collection with buffer management
   */
  private addMetric(metric: EnhancedMetric): void {
    this.metrics.push(metric);

    // Maintain buffer size limit
    if (this.metrics.length > this.config.bufferSize) {
      this.metrics.splice(0, this.metrics.length - this.config.bufferSize);
    }
  }

  /**
   * Notifies all registered callbacks
   */
  private notifyCallbacks(metric: EnhancedMetric): void {
    this.callbacks.forEach((callback) => {
      try {
        callback(metric);
      } catch (error) {
        console.error('Error in performance metric callback:', error);
      }
    });
  }
}

/**
 * Creates a new performance monitor instance
 */
export function createPerformanceMonitor(config?: Partial<PerformanceConfig>): PerformanceMonitor {
  const normalizedConfig = normalizeConfig(config);
  return new PerformanceMonitorImpl(normalizedConfig);
}
