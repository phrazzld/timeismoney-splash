/**
 * Performance monitoring system with Core Web Vitals integration
 *
 * This module provides comprehensive performance monitoring with:
 * - Core Web Vitals tracking (LCP, FID, CLS, FCP, INP, TTFB)
 * - Resource and navigation timing metrics
 * - Performance budget monitoring and violations
 * - Device information collection
 * - Structured logging integration
 *
 * @example
 * ```ts
 * import { createPerformanceMonitor, logger } from '@/lib/performance';
 *
 * // Create and start performance monitor
 * const monitor = createPerformanceMonitor({
 *   enableLCP: true,
 *   enableFID: true,
 *   sampleRate: 1.0,
 *   bufferSize: 100,
 * });
 *
 * // Subscribe to metrics
 * monitor.onMetric(metric => {
 *   logger.logPerformance({
 *     type: 'performance',
 *     message: `${metric.name} measured`,
 *     metrics: {
 *       name: metric.name,
 *       value: metric.value,
 *       rating: metric.rating,
 *     },
 *     url: metric.url,
 *     userAgent: metric.userAgent,
 *   });
 * });
 *
 * monitor.start();
 * ```
 */

// Core types
export type {
  WebVitalMetric,
  PerformanceRating,
  RawMetric,
  EnhancedMetric,
  PerformanceConfig,
  PerformanceThresholds,
  NavigationMetrics,
  ResourceMetric,
  DeviceInfo,
  BudgetViolation,
  PerformanceObserverCallback,
  PerformanceMonitor,
  PerformanceReport,
} from './types';

// Web Vitals integration
export {
  setupWebVitals,
  getWebVitalMetrics,
  clearWebVitalMetrics,
  createEnhancedMetric,
  calculateRating,
  isWebVitalSupported,
  WebVitalsCollector,
} from './web-vitals';

// Performance monitor
export {
  createPerformanceMonitor,
  PerformanceMonitorImpl,
  getDefaultConfig,
  validateConfig,
  calculateBudgetViolations,
  getDeviceInfo,
  getNavigationMetrics,
  getResourceMetrics,
} from './monitor';

// Re-export logging for convenience
export { logger } from '../logging';
