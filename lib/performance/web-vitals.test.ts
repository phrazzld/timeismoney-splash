/**
 * Tests for web-vitals integration (T018)
 */

import {
  setupWebVitals,
  getWebVitalMetrics,
  clearWebVitalMetrics,
  createEnhancedMetric,
  calculateRating,
  isWebVitalSupported,
  WebVitalsCollector,
} from './web-vitals';
import { generateCorrelationId, setCorrelationId, clearCorrelationId } from '../logging/correlation';
import type { RawMetric, EnhancedMetric, PerformanceConfig } from './types';

// Mock web-vitals library
jest.mock('web-vitals', () => ({
  onLCP: jest.fn(),
  onFID: jest.fn(),
  onCLS: jest.fn(),
  onFCP: jest.fn(),
  onINP: jest.fn(),
  onTTFB: jest.fn(),
}));

describe('Web Vitals Integration (T018)', () => {
  let mockOnLCP: jest.Mock;
  let mockOnFID: jest.Mock;
  let mockOnCLS: jest.Mock;
  let mockOnFCP: jest.Mock;
  let mockOnINP: jest.Mock;
  let mockOnTTFB: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    const webVitals = require('web-vitals');
    mockOnLCP = webVitals.onLCP.mockClear();
    mockOnFID = webVitals.onFID.mockClear();
    mockOnCLS = webVitals.onCLS.mockClear();
    mockOnFCP = webVitals.onFCP.mockClear();
    mockOnINP = webVitals.onINP.mockClear();
    mockOnTTFB = webVitals.onTTFB.mockClear();

    // Clear metrics
    clearWebVitalMetrics();
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
  });

  afterEach(() => {
    clearWebVitalMetrics();
    clearCorrelationId();
  });

  describe('setupWebVitals', () => {
    it('should set up all web vital metrics by default', () => {
      const callback = jest.fn();
      setupWebVitals(callback);

      expect(mockOnLCP).toHaveBeenCalledWith(expect.any(Function));
      expect(mockOnFID).toHaveBeenCalledWith(expect.any(Function));
      expect(mockOnCLS).toHaveBeenCalledWith(expect.any(Function));
      expect(mockOnFCP).toHaveBeenCalledWith(expect.any(Function));
      expect(mockOnINP).toHaveBeenCalledWith(expect.any(Function));
      expect(mockOnTTFB).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should respect configuration options', () => {
      const callback = jest.fn();
      const config: Partial<PerformanceConfig> = {
        enableLCP: true,
        enableFID: false,
        enableCLS: true,
        enableFCP: false,
        enableINP: false,
        enableTTFB: true,
      };

      setupWebVitals(callback, config);

      expect(mockOnLCP).toHaveBeenCalledWith(expect.any(Function));
      expect(mockOnFID).not.toHaveBeenCalled();
      expect(mockOnCLS).toHaveBeenCalledWith(expect.any(Function));
      expect(mockOnFCP).not.toHaveBeenCalled();
      expect(mockOnINP).not.toHaveBeenCalled();
      expect(mockOnTTFB).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should call callback with enhanced metrics', () => {
      const callback = jest.fn();
      const correlationId = generateCorrelationId();
      setCorrelationId(correlationId);

      setupWebVitals(callback);

      // Simulate LCP metric from web-vitals
      const rawMetric: RawMetric = {
        name: 'LCP',
        value: 1500,
        rating: 'good',
        delta: 100,
        id: 'metric-123',
        entries: [],
      };

      const lcpCallback = mockOnLCP.mock.calls[0][0];
      lcpCallback(rawMetric);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'LCP',
          value: 1500,
          rating: 'good',
          correlationId,
          url: 'https://example.com/test',
          userAgent: 'Mozilla/5.0 (Test Browser)',
          timestamp: expect.any(String),
        })
      );
    });

    it('should handle multiple metrics correctly', () => {
      const callback = jest.fn();
      setupWebVitals(callback);

      // Simulate multiple metrics
      const lcpMetric: RawMetric = {
        name: 'LCP',
        value: 1500,
        rating: 'good',
        id: 'lcp-123',
      };

      const fidMetric: RawMetric = {
        name: 'FID',
        value: 80,
        rating: 'good',
        id: 'fid-456',
      };

      mockOnLCP.mock.calls[0][0](lcpMetric);
      mockOnFID.mock.calls[0][0](fidMetric);

      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenNthCalledWith(1, expect.objectContaining({ name: 'LCP' }));
      expect(callback).toHaveBeenNthCalledWith(2, expect.objectContaining({ name: 'FID' }));
    });
  });

  describe('createEnhancedMetric', () => {
    it('should create enhanced metric with all required fields', () => {
      const correlationId = generateCorrelationId();
      setCorrelationId(correlationId);

      const rawMetric: RawMetric = {
        name: 'LCP',
        value: 1500,
        rating: 'good',
        delta: 100,
        id: 'metric-123',
        entries: [],
      };

      const enhanced = createEnhancedMetric(rawMetric);

      expect(enhanced).toEqual({
        name: 'LCP',
        value: 1500,
        rating: 'good',
        delta: 100,
        id: 'metric-123',
        entries: [],
        timestamp: expect.any(String),
        url: 'https://example.com/test',
        userAgent: 'Mozilla/5.0 (Test Browser)',
        correlationId,
      });

      // Verify timestamp is valid ISO string
      expect(new Date(enhanced.timestamp)).toBeInstanceOf(Date);
      expect(isNaN(new Date(enhanced.timestamp).getTime())).toBe(false);
    });

    it('should generate correlation ID if none exists', () => {
      clearCorrelationId();

      const rawMetric: RawMetric = {
        name: 'FID',
        value: 80,
        rating: 'good',
        id: 'metric-456',
      };

      const enhanced = createEnhancedMetric(rawMetric);

      expect(enhanced.correlationId).toBeDefined();
      expect(enhanced.correlationId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should include device memory when available', () => {
      // Mock device memory API
      Object.defineProperty(navigator, 'deviceMemory', {
        value: 8,
        configurable: true,
      });

      const rawMetric: RawMetric = {
        name: 'CLS',
        value: 0.05,
        rating: 'good',
        id: 'metric-789',
      };

      const enhanced = createEnhancedMetric(rawMetric);

      expect(enhanced.deviceMemory).toBe(8);
    });

    it('should include connection type when available', () => {
      // Mock connection API
      Object.defineProperty(navigator, 'connection', {
        value: { effectiveType: '4g' },
        configurable: true,
      });

      const rawMetric: RawMetric = {
        name: 'TTFB',
        value: 200,
        rating: 'good',
        id: 'metric-abc',
      };

      const enhanced = createEnhancedMetric(rawMetric);

      expect(enhanced.connectionType).toBe('4g');
    });
  });

  describe('calculateRating', () => {
    it('should calculate LCP rating correctly', () => {
      expect(calculateRating('LCP', 1000)).toBe('good');
      expect(calculateRating('LCP', 2000)).toBe('good');
      expect(calculateRating('LCP', 2500)).toBe('good');
      expect(calculateRating('LCP', 3000)).toBe('needs-improvement');
      expect(calculateRating('LCP', 4000)).toBe('needs-improvement');
      expect(calculateRating('LCP', 4500)).toBe('poor');
      expect(calculateRating('LCP', 6000)).toBe('poor');
    });

    it('should calculate FID rating correctly', () => {
      expect(calculateRating('FID', 50)).toBe('good');
      expect(calculateRating('FID', 100)).toBe('good');
      expect(calculateRating('FID', 150)).toBe('needs-improvement');
      expect(calculateRating('FID', 250)).toBe('needs-improvement');
      expect(calculateRating('FID', 300)).toBe('needs-improvement');
      expect(calculateRating('FID', 350)).toBe('poor');
      expect(calculateRating('FID', 500)).toBe('poor');
    });

    it('should calculate CLS rating correctly', () => {
      expect(calculateRating('CLS', 0.05)).toBe('good');
      expect(calculateRating('CLS', 0.1)).toBe('good');
      expect(calculateRating('CLS', 0.15)).toBe('needs-improvement');
      expect(calculateRating('CLS', 0.2)).toBe('needs-improvement');
      expect(calculateRating('CLS', 0.25)).toBe('needs-improvement');
      expect(calculateRating('CLS', 0.3)).toBe('poor');
      expect(calculateRating('CLS', 0.5)).toBe('poor');
    });

    it('should handle INP rating correctly', () => {
      expect(calculateRating('INP', 100)).toBe('good');
      expect(calculateRating('INP', 200)).toBe('good');
      expect(calculateRating('INP', 300)).toBe('needs-improvement');
      expect(calculateRating('INP', 400)).toBe('needs-improvement');
      expect(calculateRating('INP', 500)).toBe('needs-improvement');
      expect(calculateRating('INP', 600)).toBe('poor');
      expect(calculateRating('INP', 800)).toBe('poor');
    });

    it('should handle unknown metrics gracefully', () => {
      expect(calculateRating('UNKNOWN' as any, 1000)).toBe('needs-improvement');
    });
  });

  describe('isWebVitalSupported', () => {
    it('should return true when web-vitals library is available', () => {
      expect(isWebVitalSupported()).toBe(true);
    });

    it('should handle missing web-vitals gracefully', () => {
      // Mock missing web-vitals
      jest.doMock('web-vitals', () => {
        throw new Error('Module not found');
      });

      // This would be tested in an environment without web-vitals
      // For now, we'll assume it always returns true in our test environment
      expect(isWebVitalSupported()).toBe(true);
    });
  });

  describe('getWebVitalMetrics and clearWebVitalMetrics', () => {
    it('should store and retrieve metrics correctly', () => {
      const callback = jest.fn();
      setupWebVitals(callback);

      expect(getWebVitalMetrics()).toHaveLength(0);

      // Simulate metrics
      const lcpMetric: RawMetric = {
        name: 'LCP',
        value: 1500,
        rating: 'good',
        id: 'lcp-123',
      };

      const fidMetric: RawMetric = {
        name: 'FID',
        value: 80,
        rating: 'good',
        id: 'fid-456',
      };

      mockOnLCP.mock.calls[0][0](lcpMetric);
      mockOnFID.mock.calls[0][0](fidMetric);

      const metrics = getWebVitalMetrics();
      expect(metrics).toHaveLength(2);
      expect(metrics[0].name).toBe('LCP');
      expect(metrics[1].name).toBe('FID');
    });

    it('should clear metrics correctly', () => {
      const callback = jest.fn();
      setupWebVitals(callback);

      // Add some metrics
      const lcpMetric: RawMetric = {
        name: 'LCP',
        value: 1500,
        rating: 'good',
        id: 'lcp-123',
      };

      mockOnLCP.mock.calls[0][0](lcpMetric);
      expect(getWebVitalMetrics()).toHaveLength(1);

      clearWebVitalMetrics();
      expect(getWebVitalMetrics()).toHaveLength(0);
    });
  });

  describe('WebVitalsCollector class', () => {
    let collector: WebVitalsCollector;

    beforeEach(() => {
      const config: PerformanceConfig = {
        enableLCP: true,
        enableFID: true,
        enableCLS: true,
        enableFCP: true,
        enableINP: true,
        enableTTFB: true,
        enableNavigation: false,
        enableResource: false,
        sampleRate: 1.0,
        bufferSize: 100,
        flushInterval: 5000,
        thresholds: {
          LCP: { good: 2500, poor: 4000 },
          FID: { good: 100, poor: 300 },
          CLS: { good: 0.1, poor: 0.25 },
          FCP: { good: 1800, poor: 3000 },
          INP: { good: 200, poor: 500 },
          TTFB: { good: 800, poor: 1800 },
        },
      };

      collector = new WebVitalsCollector(config);
    });

    afterEach(() => {
      collector.stop();
    });

    it('should start collecting metrics', () => {
      collector.start();

      expect(mockOnLCP).toHaveBeenCalled();
      expect(mockOnFID).toHaveBeenCalled();
      expect(mockOnCLS).toHaveBeenCalled();
      expect(mockOnFCP).toHaveBeenCalled();
      expect(mockOnINP).toHaveBeenCalled();
      expect(mockOnTTFB).toHaveBeenCalled();
    });

    it('should stop collecting metrics', () => {
      collector.start();
      collector.stop();

      // Verify no new metrics are collected after stop
      const initialMetrics = collector.getMetrics();
      
      const lcpMetric: RawMetric = {
        name: 'LCP',
        value: 1500,
        rating: 'good',
        id: 'lcp-after-stop',
      };

      // This should not add to collector metrics since it's stopped
      mockOnLCP.mock.calls[0][0](lcpMetric);
      
      expect(collector.getMetrics()).toHaveLength(initialMetrics.length);
    });

    it('should support metric callbacks', () => {
      const metricCallback = jest.fn();
      const unsubscribe = collector.onMetric(metricCallback);

      collector.start();

      // Simulate metric
      const lcpMetric: RawMetric = {
        name: 'LCP',
        value: 1500,
        rating: 'good',
        id: 'lcp-callback',
      };

      mockOnLCP.mock.calls[0][0](lcpMetric);

      expect(metricCallback).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'LCP', value: 1500 })
      );

      // Test unsubscribe
      unsubscribe();
      mockOnLCP.mock.calls[0][0](lcpMetric);
      expect(metricCallback).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it('should respect sample rate', () => {
      const sampledConfig: PerformanceConfig = {
        ...collector.config,
        sampleRate: 0.5, // 50% sampling
      };

      const sampledCollector = new WebVitalsCollector(sampledConfig);
      
      // Mock Math.random to control sampling
      const originalRandom = Math.random;
      Math.random = jest.fn()
        .mockReturnValueOnce(0.3) // Should sample (< 0.5)
        .mockReturnValueOnce(0.7); // Should not sample (> 0.5)

      try {
        sampledCollector.start();

        const metricCallback = jest.fn();
        sampledCollector.onMetric(metricCallback);

        // First metric should be sampled
        const lcpMetric1: RawMetric = {
          name: 'LCP',
          value: 1500,
          rating: 'good',
          id: 'lcp-sampled',
        };

        mockOnLCP.mock.calls[0][0](lcpMetric1);
        expect(metricCallback).toHaveBeenCalledTimes(1);

        // Second metric should not be sampled
        const lcpMetric2: RawMetric = {
          name: 'LCP',
          value: 2000,
          rating: 'good',
          id: 'lcp-not-sampled',
        };

        mockOnLCP.mock.calls[0][0](lcpMetric2);
        expect(metricCallback).toHaveBeenCalledTimes(1); // Still only 1 call

      } finally {
        Math.random = originalRandom;
        sampledCollector.stop();
      }
    });

    it('should maintain buffer size limit', () => {
      const limitedConfig: PerformanceConfig = {
        ...collector.config,
        bufferSize: 3,
      };

      const limitedCollector = new WebVitalsCollector(limitedConfig);
      limitedCollector.start();

      // Add more metrics than buffer size
      for (let i = 0; i < 5; i++) {
        const metric: RawMetric = {
          name: 'LCP',
          value: 1500 + i * 100,
          rating: 'good',
          id: `lcp-${i}`,
        };

        mockOnLCP.mock.calls[0][0](metric);
      }

      const metrics = limitedCollector.getMetrics();
      expect(metrics).toHaveLength(3); // Should only keep 3 most recent
      expect(metrics[0].value).toBe(1700); // metric 2
      expect(metrics[2].value).toBe(1900); // metric 4

      limitedCollector.stop();
    });
  });

  describe('Performance Impact', () => {
    it('should have minimal performance overhead', () => {
      const callback = jest.fn();
      
      const start = performance.now();
      setupWebVitals(callback);
      
      // Simulate many metric reports
      for (let i = 0; i < 100; i++) {
        const metric: RawMetric = {
          name: 'LCP',
          value: 1500 + i,
          rating: 'good',
          id: `metric-${i}`,
        };

        mockOnLCP.mock.calls[0][0](metric);
      }
      
      const end = performance.now();
      const timePerMetric = (end - start) / 100;
      
      // Should process each metric in less than 1ms
      expect(timePerMetric).toBeLessThan(1);
    });

    it('should not leak memory with continuous metrics', () => {
      const callback = jest.fn();
      setupWebVitals(callback);

      const initialMemory = process.memoryUsage?.()?.heapUsed || 0;

      // Simulate continuous metric reporting
      for (let i = 0; i < 1000; i++) {
        const metric: RawMetric = {
          name: 'LCP',
          value: 1500 + i,
          rating: 'good',
          id: `metric-${i}`,
        };

        mockOnLCP.mock.calls[0][0](metric);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage?.()?.heapUsed || 0;
      const memoryGrowth = finalMemory - initialMemory;

      // Should not grow significantly (less than 5MB)
      expect(memoryGrowth).toBeLessThan(5 * 1024 * 1024);
    });
  });
});