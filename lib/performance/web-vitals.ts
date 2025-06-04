/**
 * Web Vitals integration for Core Web Vitals monitoring
 */

import { onLCP, onCLS, onFCP, onINP, onTTFB } from 'web-vitals';
import { getCurrentCorrelationId, generateCorrelationId } from '../logging/correlation';
import type {
  RawMetric,
  EnhancedMetric,
  PerformanceConfig,
  PerformanceObserverCallback,
  PerformanceRating,
} from './types';

/**
 * In-memory storage for collected metrics
 */
let collectedMetrics: EnhancedMetric[] = [];

/**
 * Web Vitals thresholds based on Core Web Vitals guidelines
 */
const WEB_VITAL_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  INP: { good: 200, poor: 500 },
  TTFB: { good: 800, poor: 1800 },
} as const;

/**
 * Calculates performance rating based on metric value and thresholds
 */
export function calculateRating(metricName: string, value: number): PerformanceRating {
  const thresholds = WEB_VITAL_THRESHOLDS[metricName as keyof typeof WEB_VITAL_THRESHOLDS];

  if (!thresholds) {
    return 'needs-improvement';
  }

  if (value <= thresholds.good) {
    return 'good';
  } else if (value <= thresholds.poor) {
    return 'needs-improvement';
  } else {
    return 'poor';
  }
}

/**
 * Creates an enhanced metric from raw web-vitals data
 */
export function createEnhancedMetric(rawMetric: RawMetric): EnhancedMetric {
  const enhanced: { -readonly [K in keyof EnhancedMetric]: EnhancedMetric[K] } = {
    ...rawMetric,
    rating: rawMetric.rating || calculateRating(rawMetric.name, rawMetric.value),
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    correlationId: getCurrentCorrelationId() || generateCorrelationId(),
  };

  // Add device memory if available
  if (typeof navigator !== 'undefined' && 'deviceMemory' in navigator) {
    const deviceMemory = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
    if (typeof deviceMemory === 'number') {
      enhanced.deviceMemory = deviceMemory;
    }
  }

  // Add connection type if available
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as unknown as { connection?: { effectiveType?: string } })
      .connection;
    if (connection && connection.effectiveType) {
      enhanced.connectionType = connection.effectiveType;
    }
  }

  return enhanced;
}

/**
 * Checks if web-vitals library is available and supported
 */
export function isWebVitalSupported(): boolean {
  try {
    // Check if web-vitals functions are available
    return (
      typeof onLCP === 'function' && typeof onINP === 'function' && typeof onCLS === 'function'
    );
  } catch (error) {
    console.warn('Web Vitals library not available:', error);
    return false;
  }
}

/**
 * Sets up web vitals collection with optional configuration
 */
export function setupWebVitals(
  callback: PerformanceObserverCallback,
  config: Partial<PerformanceConfig> = {},
): void {
  if (!isWebVitalSupported()) {
    console.warn('Web Vitals not supported in this environment');
    return;
  }

  const defaultConfig = {
    enableLCP: true,
    enableCLS: true,
    enableFCP: true,
    enableINP: true,
    enableTTFB: true,
    ...config,
  };

  // Create wrapper function to enhance metrics and store them
  const enhancedCallback = (rawMetric: RawMetric): void => {
    try {
      const enhanced = createEnhancedMetric(rawMetric);

      // Store metric
      collectedMetrics.push(enhanced);

      // Call provided callback
      callback(enhanced);
    } catch (error) {
      console.error('Error processing web vital metric:', error);
    }
  };

  // Set up individual metric collectors based on configuration
  if (defaultConfig.enableLCP) {
    onLCP(enhancedCallback);
  }

  if (defaultConfig.enableCLS) {
    onCLS(enhancedCallback);
  }

  if (defaultConfig.enableFCP) {
    onFCP(enhancedCallback);
  }

  if (defaultConfig.enableINP) {
    onINP(enhancedCallback);
  }

  if (defaultConfig.enableTTFB) {
    onTTFB(enhancedCallback);
  }
}

/**
 * Gets all collected web vital metrics
 */
export function getWebVitalMetrics(): ReadonlyArray<EnhancedMetric> {
  return [...collectedMetrics];
}

/**
 * Clears all collected web vital metrics
 */
export function clearWebVitalMetrics(): void {
  collectedMetrics = [];
}

/**
 * Advanced Web Vitals collector class for more control
 */
export class WebVitalsCollector {
  public readonly config: PerformanceConfig;
  private isCollecting = false;
  private metrics: EnhancedMetric[] = [];
  private callbacks: Set<PerformanceObserverCallback> = new Set();

  constructor(config: PerformanceConfig) {
    this.config = config;
  }

  /**
   * Starts collecting web vital metrics
   */
  start(): void {
    if (this.isCollecting) {
      return;
    }

    if (!isWebVitalSupported()) {
      console.warn('Web Vitals not supported, collector not started');
      return;
    }

    this.isCollecting = true;

    // Set up metric collection with sampling
    const metricHandler = (rawMetric: RawMetric): void => {
      if (!this.isCollecting) {
        return;
      }

      // Apply sampling rate
      if (Math.random() > this.config.sampleRate) {
        return;
      }

      try {
        const enhanced = createEnhancedMetric(rawMetric);
        this.addMetric(enhanced);
        this.notifyCallbacks(enhanced);
      } catch (error) {
        console.error('Error processing metric in collector:', error);
      }
    };

    // Set up collectors based on configuration
    if (this.config.enableLCP) {
      onLCP(metricHandler);
    }

    if (this.config.enableCLS) {
      onCLS(metricHandler);
    }

    if (this.config.enableFCP) {
      onFCP(metricHandler);
    }

    if (this.config.enableINP) {
      onINP(metricHandler);
    }

    if (this.config.enableTTFB) {
      onTTFB(metricHandler);
    }
  }

  /**
   * Stops collecting web vital metrics
   */
  stop(): void {
    this.isCollecting = false;
    this.clearMetrics();
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
   * Flushes metrics (placeholder for remote reporting)
   */
  async flush(): Promise<void> {
    // In a real implementation, this would send metrics to a remote endpoint
    // For now, just clear the metrics
    await new Promise((resolve) => setTimeout(resolve, 10)); // Simulate async operation
    this.clearMetrics();
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
        console.error('Error in metric callback:', error);
      }
    });
  }
}
