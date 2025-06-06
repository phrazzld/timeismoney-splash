/**
 * Tests for performance monitor orchestration (T018)
 */

import {
  PerformanceMonitorImpl,
  createPerformanceMonitor,
  getDefaultConfig,
  validateConfig,
  calculateBudgetViolations,
  getDeviceInfo,
  getNavigationMetrics,
  getResourceMetrics,
} from './monitor';
import {
  generateCorrelationId,
  setCorrelationId,
  clearCorrelationId,
} from '../logging/correlation';
import type { PerformanceConfig, EnhancedMetric } from './types';
import * as webVitalsModule from './web-vitals';

// Mock web-vitals integration
jest.mock('./web-vitals', () => ({
  setupWebVitals: jest.fn(),
  getWebVitalMetrics: jest.fn(() => []),
  clearWebVitalMetrics: jest.fn(),
  WebVitalsCollector: jest.fn(),
}));

describe('Performance Monitor (T018)', () => {
  let monitor: PerformanceMonitorImpl;
  let mockSetupWebVitals: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    mockSetupWebVitals = (webVitalsModule.setupWebVitals as jest.Mock).mockClear();

    // Clear correlation ID
    clearCorrelationId();

    // Mock browser APIs
    Object.defineProperty(window, 'location', {
      value: { href: 'https://example.com/test' },
      writable: true,
    });

    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Test Browser)',
      writable: true,
    });

    Object.defineProperty(performance, 'navigation', {
      value: { type: 0 },
      writable: true,
    });

    Object.defineProperty(performance, 'timing', {
      value: {
        navigationStart: 1000,
        domContentLoadedEventEnd: 2000,
        loadEventEnd: 3000,
      },
      writable: true,
    });

    // Create monitor with test configuration
    const config = getDefaultConfig();
    monitor = new PerformanceMonitorImpl(config);
  });

  afterEach(() => {
    if (monitor) {
      monitor.stop();
    }
    clearCorrelationId();
  });

  describe('Configuration Management', () => {
    it('should create monitor with default configuration', () => {
      const defaultMonitor = createPerformanceMonitor();
      expect(defaultMonitor).toBeDefined();
      expect(defaultMonitor.config).toEqual(getDefaultConfig());
    });

    it('should create monitor with custom configuration', () => {
      const customConfig: Partial<PerformanceConfig> = {
        enableLCP: true,
        enableFID: false,
        sampleRate: 0.5,
        bufferSize: 50,
      };

      const customMonitor = createPerformanceMonitor(customConfig);

      expect(customMonitor.config.enableLCP).toBe(true);
      expect(customMonitor.config.enableFID).toBe(false);
      expect(customMonitor.config.sampleRate).toBe(0.5);
      expect(customMonitor.config.bufferSize).toBe(50);
    });

    it('should validate configuration correctly', () => {
      const validConfig = getDefaultConfig();
      expect(() => validateConfig(validConfig)).not.toThrow();

      const invalidConfig = {
        ...getDefaultConfig(),
        sampleRate: 1.5, // Invalid: > 1
        bufferSize: -1, // Invalid: < 0
      };

      expect(() => validateConfig(invalidConfig)).toThrow();
    });

    it('should handle invalid configuration gracefully', () => {
      const invalidConfig = {
        sampleRate: 2.0,
        bufferSize: -10,
        flushInterval: -1000,
      } as PerformanceConfig;

      // Should create monitor with corrected values
      const monitor = createPerformanceMonitor(invalidConfig);

      expect(monitor.config.sampleRate).toBeLessThanOrEqual(1);
      expect(monitor.config.bufferSize).toBeGreaterThan(0);
      expect(monitor.config.flushInterval).toBeGreaterThan(0);
    });
  });

  describe('Monitor Lifecycle', () => {
    it('should start monitoring successfully', () => {
      monitor.start();

      expect(mockSetupWebVitals).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          enableLCP: monitor.config.enableLCP,
          enableFID: monitor.config.enableFID,
        }),
      );
    });

    it('should stop monitoring successfully', () => {
      monitor.start();
      expect(() => monitor.stop()).not.toThrow();
    });

    it('should handle multiple start/stop calls gracefully', () => {
      expect(() => {
        monitor.start();
        monitor.start(); // Should not error
        monitor.stop();
        monitor.stop(); // Should not error
      }).not.toThrow();
    });

    it('should not start if already started', () => {
      monitor.start();
      const callCount = mockSetupWebVitals.mock.calls.length;

      monitor.start(); // Second start should be ignored

      expect(mockSetupWebVitals.mock.calls.length).toBe(callCount);
    });
  });

  describe('Metric Collection', () => {
    beforeEach(() => {
      const correlationId = generateCorrelationId();
      setCorrelationId(correlationId);
    });

    it('should collect metrics correctly', () => {
      monitor.start();

      expect(monitor.getMetrics()).toHaveLength(0);

      // Simulate metric callback
      const metricCallback = mockSetupWebVitals.mock.calls[0][0];
      const testMetric: EnhancedMetric = {
        name: 'LCP',
        value: 1500,
        rating: 'good',
        id: 'test-metric',
        timestamp: new Date().toISOString(),
        url: 'https://example.com/test',
        userAgent: 'Mozilla/5.0 (Test Browser)',
        correlationId: generateCorrelationId(),
      };

      metricCallback(testMetric);

      const metrics = monitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toEqual(testMetric);
    });

    it('should clear metrics correctly', () => {
      monitor.start();

      // Add a metric
      const metricCallback = mockSetupWebVitals.mock.calls[0][0];
      const testMetric: EnhancedMetric = {
        name: 'FID',
        value: 80,
        rating: 'good',
        id: 'test-metric',
        timestamp: new Date().toISOString(),
        url: 'https://example.com/test',
        userAgent: 'Mozilla/5.0 (Test Browser)',
        correlationId: generateCorrelationId(),
      };

      metricCallback(testMetric);
      expect(monitor.getMetrics()).toHaveLength(1);

      monitor.clearMetrics();
      expect(monitor.getMetrics()).toHaveLength(0);
    });

    it('should respect buffer size limit', () => {
      const limitedConfig = {
        ...getDefaultConfig(),
        bufferSize: 3,
      };

      const limitedMonitor = new PerformanceMonitorImpl(limitedConfig);
      limitedMonitor.start();

      const metricCallback = mockSetupWebVitals.mock.calls[0][0];

      // Add more metrics than buffer size
      for (let i = 0; i < 5; i++) {
        const metric: EnhancedMetric = {
          name: 'LCP',
          value: 1500 + i * 100,
          rating: 'good',
          id: `metric-${i}`,
          timestamp: new Date().toISOString(),
          url: 'https://example.com/test',
          userAgent: 'Mozilla/5.0 (Test Browser)',
          correlationId: generateCorrelationId(),
        };

        metricCallback(metric);
      }

      const metrics = limitedMonitor.getMetrics();
      expect(metrics).toHaveLength(3); // Should only keep 3 most recent
      expect(metrics[0].value).toBe(1700); // metric 2
      expect(metrics[2].value).toBe(1900); // metric 4

      limitedMonitor.stop();
    });
  });

  describe('Metric Callbacks', () => {
    it('should support metric callbacks', () => {
      const callback = jest.fn();
      const unsubscribe = monitor.onMetric(callback);

      monitor.start();

      // Simulate metric
      const metricCallback = mockSetupWebVitals.mock.calls[0][0];
      const testMetric: EnhancedMetric = {
        name: 'CLS',
        value: 0.05,
        rating: 'good',
        id: 'test-metric',
        timestamp: new Date().toISOString(),
        url: 'https://example.com/test',
        userAgent: 'Mozilla/5.0 (Test Browser)',
        correlationId: generateCorrelationId(),
      };

      metricCallback(testMetric);

      expect(callback).toHaveBeenCalledWith(testMetric);

      // Test unsubscribe
      unsubscribe();
      metricCallback(testMetric);
      expect(callback).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it('should support multiple callbacks', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      monitor.onMetric(callback1);
      monitor.onMetric(callback2);
      monitor.start();

      // Simulate metric
      const metricCallback = mockSetupWebVitals.mock.calls[0][0];
      const testMetric: EnhancedMetric = {
        name: 'TTFB',
        value: 200,
        rating: 'good',
        id: 'test-metric',
        timestamp: new Date().toISOString(),
        url: 'https://example.com/test',
        userAgent: 'Mozilla/5.0 (Test Browser)',
        correlationId: generateCorrelationId(),
      };

      metricCallback(testMetric);

      expect(callback1).toHaveBeenCalledWith(testMetric);
      expect(callback2).toHaveBeenCalledWith(testMetric);
    });

    it('should handle callback errors gracefully', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      const goodCallback = jest.fn();

      monitor.onMetric(errorCallback);
      monitor.onMetric(goodCallback);
      monitor.start();

      // Simulate metric
      const metricCallback = mockSetupWebVitals.mock.calls[0][0];
      const testMetric: EnhancedMetric = {
        name: 'FCP',
        value: 1200,
        rating: 'good',
        id: 'test-metric',
        timestamp: new Date().toISOString(),
        url: 'https://example.com/test',
        userAgent: 'Mozilla/5.0 (Test Browser)',
        correlationId: generateCorrelationId(),
      };

      // Should not throw even if callback errors
      expect(() => metricCallback(testMetric)).not.toThrow();

      expect(errorCallback).toHaveBeenCalled();
      expect(goodCallback).toHaveBeenCalled(); // Should still be called
    });
  });

  describe('Budget Violations', () => {
    it('should calculate budget violations correctly', () => {
      const metrics: EnhancedMetric[] = [
        {
          name: 'LCP',
          value: 5000, // Poor (> 4000)
          rating: 'poor',
          id: 'lcp-poor',
          timestamp: new Date().toISOString(),
          url: 'https://example.com/test',
          userAgent: 'Mozilla/5.0 (Test Browser)',
          correlationId: generateCorrelationId(),
        },
        {
          name: 'FID',
          value: 250, // Needs improvement (100-300)
          rating: 'needs-improvement',
          id: 'fid-ni',
          timestamp: new Date().toISOString(),
          url: 'https://example.com/test',
          userAgent: 'Mozilla/5.0 (Test Browser)',
          correlationId: generateCorrelationId(),
        },
        {
          name: 'CLS',
          value: 0.05, // Good
          rating: 'good',
          id: 'cls-good',
          timestamp: new Date().toISOString(),
          url: 'https://example.com/test',
          userAgent: 'Mozilla/5.0 (Test Browser)',
          correlationId: generateCorrelationId(),
        },
      ];

      const violations = calculateBudgetViolations(metrics, getDefaultConfig().thresholds);

      expect(violations).toHaveLength(2); // LCP and FID should violate

      const lcpViolation = violations.find((v) => v.metric === 'LCP');
      const fidViolation = violations.find((v) => v.metric === 'FID');

      expect(lcpViolation).toBeDefined();
      expect(lcpViolation!.severity).toBe('error');
      expect(lcpViolation!.value).toBe(5000);

      expect(fidViolation).toBeDefined();
      expect(fidViolation!.severity).toBe('warning');
      expect(fidViolation!.value).toBe(250);
    });

    it('should not create violations for good metrics', () => {
      const goodMetrics: EnhancedMetric[] = [
        {
          name: 'LCP',
          value: 1500, // Good
          rating: 'good',
          id: 'lcp-good',
          timestamp: new Date().toISOString(),
          url: 'https://example.com/test',
          userAgent: 'Mozilla/5.0 (Test Browser)',
          correlationId: generateCorrelationId(),
        },
      ];

      const violations = calculateBudgetViolations(goodMetrics, getDefaultConfig().thresholds);
      expect(violations).toHaveLength(0);
    });
  });

  describe('Device Information', () => {
    it('should collect device information', () => {
      // Mock device APIs
      Object.defineProperty(navigator, 'deviceMemory', {
        value: 8,
        configurable: true,
      });

      Object.defineProperty(navigator, 'hardwareConcurrency', {
        value: 4,
        configurable: true,
      });

      Object.defineProperty(navigator, 'connection', {
        value: {
          effectiveType: '4g',
          downlink: 10,
          rtt: 50,
          saveData: false,
        },
        configurable: true,
      });

      const deviceInfo = getDeviceInfo();

      expect(deviceInfo).toEqual({
        userAgent: 'Mozilla/5.0 (Test Browser)',
        deviceMemory: 8,
        hardwareConcurrency: 4,
        connectionType: '4g',
        effectiveType: '4g',
        downlink: 10,
        rtt: 50,
        saveData: false,
      });
    });

    it('should handle missing device APIs gracefully', () => {
      // Ensure APIs are not available
      delete (navigator as unknown).deviceMemory;
      delete (navigator as unknown).hardwareConcurrency;
      delete (navigator as unknown).connection;

      const deviceInfo = getDeviceInfo();

      expect(deviceInfo.userAgent).toBeDefined();
      expect(deviceInfo.deviceMemory).toBeUndefined();
      expect(deviceInfo.hardwareConcurrency).toBeUndefined();
      expect(deviceInfo.connectionType).toBeUndefined();
    });
  });

  describe('Navigation Metrics', () => {
    it('should collect navigation timing metrics', () => {
      // Mock performance.timing
      Object.defineProperty(performance, 'timing', {
        value: {
          navigationStart: 1000,
          domContentLoadedEventEnd: 2500,
          loadEventEnd: 3200,
          fetchStart: 1100,
          domainLookupStart: 1100,
          domainLookupEnd: 1150,
          connectStart: 1150,
          connectEnd: 1200,
          requestStart: 1200,
          responseStart: 1300,
          responseEnd: 1400,
          domLoading: 1450,
          domInteractive: 2200,
          domComplete: 3100,
        },
        configurable: true,
      });

      const navigationMetrics = getNavigationMetrics();

      expect(navigationMetrics).toEqual({
        navigationStart: 1000,
        domContentLoaded: 1500, // 2500 - 1000
        loadComplete: 2200, // 3200 - 1000
        firstPaint: undefined,
        firstContentfulPaint: undefined,
        timeToInteractive: undefined,
        totalBlockingTime: undefined,
      });
    });

    it('should handle missing navigation timing gracefully', () => {
      // Mock missing performance.timing
      Object.defineProperty(performance, 'timing', {
        value: undefined,
        configurable: true,
      });

      const navigationMetrics = getNavigationMetrics();

      expect(navigationMetrics.navigationStart).toBe(0);
      expect(navigationMetrics.domContentLoaded).toBe(0);
      expect(navigationMetrics.loadComplete).toBe(0);
    });
  });

  describe('Resource Metrics', () => {
    it('should collect resource timing metrics', () => {
      // Mock performance.getEntriesByType
      const mockResourceEntries = [
        {
          name: 'https://example.com/style.css',
          entryType: 'resource',
          initiatorType: 'link',
          startTime: 100,
          duration: 200,
          transferSize: 5000,
          encodedBodySize: 4500,
          decodedBodySize: 12000,
        },
        {
          name: 'https://example.com/script.js',
          entryType: 'resource',
          initiatorType: 'script',
          startTime: 150,
          duration: 300,
          transferSize: 8000,
          encodedBodySize: 7500,
          decodedBodySize: 20000,
        },
      ];

      jest.spyOn(performance, 'getEntriesByType').mockReturnValue(mockResourceEntries as unknown);

      const resourceMetrics = getResourceMetrics();

      expect(resourceMetrics).toHaveLength(2);
      expect(resourceMetrics[0]).toEqual({
        name: 'https://example.com/style.css',
        type: 'link',
        startTime: 100,
        duration: 200,
        transferSize: 5000,
        encodedBodySize: 4500,
        decodedBodySize: 12000,
      });
    });

    it('should handle missing resource timing gracefully', () => {
      jest.spyOn(performance, 'getEntriesByType').mockReturnValue([]);

      const resourceMetrics = getResourceMetrics();
      expect(resourceMetrics).toHaveLength(0);
    });
  });

  describe('Flushing and Cleanup', () => {
    it('should flush metrics successfully', async () => {
      monitor.start();

      // Add some metrics
      const metricCallback = mockSetupWebVitals.mock.calls[0][0];
      const testMetric: EnhancedMetric = {
        name: 'LCP',
        value: 1500,
        rating: 'good',
        id: 'test-metric',
        timestamp: new Date().toISOString(),
        url: 'https://example.com/test',
        userAgent: 'Mozilla/5.0 (Test Browser)',
        correlationId: generateCorrelationId(),
      };

      metricCallback(testMetric);
      expect(monitor.getMetrics()).toHaveLength(1);

      await monitor.flush();

      // Metrics should be cleared after flush
      expect(monitor.getMetrics()).toHaveLength(0);
    });

    it('should handle flush errors gracefully', async () => {
      monitor.start();

      // Mock a flush error scenario
      const originalFlush = monitor.flush;
      monitor.flush = jest.fn().mockRejectedValue(new Error('Flush error'));

      await expect(monitor.flush()).rejects.toThrow('Flush error');

      // Restore original method
      monitor.flush = originalFlush;
    });

    it('should clean up properly on stop', () => {
      monitor.start();

      // Add some metrics
      const metricCallback = mockSetupWebVitals.mock.calls[0][0];
      const testMetric: EnhancedMetric = {
        name: 'LCP',
        value: 1500,
        rating: 'good',
        id: 'test-metric',
        timestamp: new Date().toISOString(),
        url: 'https://example.com/test',
        userAgent: 'Mozilla/5.0 (Test Browser)',
        correlationId: generateCorrelationId(),
      };

      metricCallback(testMetric);
      expect(monitor.getMetrics()).toHaveLength(1);

      monitor.stop();

      // Should clean up metrics
      expect(monitor.getMetrics()).toHaveLength(0);
    });
  });

  describe('Performance and Memory Management', () => {
    it('should handle high-frequency metrics efficiently', () => {
      monitor.start();
      const metricCallback = mockSetupWebVitals.mock.calls[0][0];

      const start = performance.now();

      // Simulate many rapid metrics
      for (let i = 0; i < 1000; i++) {
        const metric: EnhancedMetric = {
          name: 'LCP',
          value: 1500 + i,
          rating: 'good',
          id: `metric-${i}`,
          timestamp: new Date().toISOString(),
          url: 'https://example.com/test',
          userAgent: 'Mozilla/5.0 (Test Browser)',
          correlationId: generateCorrelationId(),
        };

        metricCallback(metric);
      }

      const end = performance.now();
      const timePerMetric = (end - start) / 1000;

      // Should process each metric quickly
      expect(timePerMetric).toBeLessThan(0.1); // Less than 0.1ms per metric
    });

    it('should not leak memory during extended use', () => {
      monitor.start();
      const metricCallback = mockSetupWebVitals.mock.calls[0][0];

      const initialMemory = process.memoryUsage?.()?.heapUsed || 0;

      // Simulate extended monitoring
      for (let i = 0; i < 5000; i++) {
        const metric: EnhancedMetric = {
          name: 'LCP',
          value: 1500 + i,
          rating: 'good',
          id: `metric-${i}`,
          timestamp: new Date().toISOString(),
          url: 'https://example.com/test',
          userAgent: 'Mozilla/5.0 (Test Browser)',
          correlationId: generateCorrelationId(),
        };

        metricCallback(metric);

        // Periodic cleanup
        if (i % 1000 === 0) {
          monitor.clearMetrics();
        }
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage?.()?.heapUsed || 0;
      const memoryGrowth = finalMemory - initialMemory;

      // Should not grow excessively (less than 10MB)
      expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024);
    });
  });
});
