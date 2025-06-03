/**
 * Tests for performance alerting system
 */

import {
  createPerformanceAlerter,
  validatePerformanceAlertConfig,
  createPerformanceAlert,
  shouldTriggerAlert,
  calculateAlertSeverity,
} from '@/lib/monitoring/performance-alerts';
import type { PerformanceAlertConfig, PerformanceAlert } from '@/lib/monitoring/types';
import type { EnhancedMetric } from '@/lib/performance/types';

// Mock alert delivery
const mockAlertDelivery = {
  deliverSlack: jest.fn(),
  deliverEmail: jest.fn(),
  deliverWebhook: jest.fn(),
};

// Mock correlation ID
jest.mock('@/lib/logging/correlation', () => ({
  getCurrentCorrelationId: jest.fn(() => 'test-correlation-id-123'),
  generateCorrelationId: jest.fn(() => 'generated-correlation-id-456'),
}));

describe('Performance Alerting System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset global state
    delete (global as any).__TEST_ALERT_DELIVERY__;
  });

  describe('Configuration Validation', () => {
    it('should validate valid performance alert configuration', () => {
      const validConfig: PerformanceAlertConfig = {
        enabled: true,
        thresholds: {
          lcp: { warning: 2500, error: 4000 },
          fid: { warning: 100, error: 300 },
          cls: { warning: 0.1, error: 0.25 },
          fcp: { warning: 1800, error: 3000 },
        },
        cooldownMinutes: 15,
        maxAlertsPerHour: 10,
        enableSlack: true,
        enableEmail: false,
        enableWebhook: true,
      };

      expect(() => validatePerformanceAlertConfig(validConfig)).not.toThrow();
    });

    it('should reject invalid threshold configuration', () => {
      const invalidConfig: PerformanceAlertConfig = {
        enabled: true,
        thresholds: {
          lcp: { warning: 4000, error: 2500 }, // Warning > Error (invalid)
          fid: { warning: 100, error: 300 },
          cls: { warning: 0.1, error: 0.25 },
          fcp: { warning: 1800, error: 3000 },
        },
        cooldownMinutes: 15,
        maxAlertsPerHour: 10,
        enableSlack: false,
        enableEmail: false,
        enableWebhook: false,
      };

      expect(() => validatePerformanceAlertConfig(invalidConfig))
        .toThrow('Warning threshold must be less than error threshold for lcp');
    });

    it('should reject negative cooldown period', () => {
      const invalidConfig: PerformanceAlertConfig = {
        enabled: true,
        thresholds: {
          lcp: { warning: 2500, error: 4000 },
          fid: { warning: 100, error: 300 },
          cls: { warning: 0.1, error: 0.25 },
          fcp: { warning: 1800, error: 3000 },
        },
        cooldownMinutes: -5, // Invalid: negative
        maxAlertsPerHour: 10,
        enableSlack: false,
        enableEmail: false,
        enableWebhook: false,
      };

      expect(() => validatePerformanceAlertConfig(invalidConfig))
        .toThrow('Cooldown period must be positive');
    });

    it('should reject invalid max alerts per hour', () => {
      const invalidConfig: PerformanceAlertConfig = {
        enabled: true,
        thresholds: {
          lcp: { warning: 2500, error: 4000 },
          fid: { warning: 100, error: 300 },
          cls: { warning: 0.1, error: 0.25 },
          fcp: { warning: 1800, error: 3000 },
        },
        cooldownMinutes: 15,
        maxAlertsPerHour: 0, // Invalid: must be at least 1
        enableSlack: false,
        enableEmail: false,
        enableWebhook: false,
      };

      expect(() => validatePerformanceAlertConfig(invalidConfig))
        .toThrow('Max alerts per hour must be at least 1');
    });

    it('should require at least one delivery method when enabled', () => {
      const invalidConfig: PerformanceAlertConfig = {
        enabled: true,
        thresholds: {
          lcp: { warning: 2500, error: 4000 },
          fid: { warning: 100, error: 300 },
          cls: { warning: 0.1, error: 0.25 },
          fcp: { warning: 1800, error: 3000 },
        },
        cooldownMinutes: 15,
        maxAlertsPerHour: 10,
        enableSlack: false,
        enableEmail: false,
        enableWebhook: false,
      };

      expect(() => validatePerformanceAlertConfig(invalidConfig))
        .toThrow('At least one delivery method must be enabled when alerting is enabled');
    });
  });

  describe('Alert Severity Calculation', () => {
    const thresholds = {
      lcp: { warning: 2500, error: 4000 },
      fid: { warning: 100, error: 300 },
      cls: { warning: 0.1, error: 0.25 },
      fcp: { warning: 1800, error: 3000 },
    };

    it('should calculate warning severity for LCP', () => {
      const severity = calculateAlertSeverity('lcp', 3000, thresholds);
      expect(severity).toBe('warning');
    });

    it('should calculate error severity for LCP', () => {
      const severity = calculateAlertSeverity('lcp', 5000, thresholds);
      expect(severity).toBe('error');
    });

    it('should calculate critical severity for extreme values', () => {
      const severity = calculateAlertSeverity('lcp', 10000, thresholds);
      expect(severity).toBe('critical');
    });

    it('should return null for values below warning threshold', () => {
      const severity = calculateAlertSeverity('lcp', 2000, thresholds);
      expect(severity).toBeNull();
    });

    it('should handle unknown metrics gracefully', () => {
      const severity = calculateAlertSeverity('unknown-metric' as any, 1000, thresholds);
      expect(severity).toBeNull();
    });

    it('should calculate CLS severity correctly', () => {
      expect(calculateAlertSeverity('cls', 0.15, thresholds)).toBe('warning');
      expect(calculateAlertSeverity('cls', 0.3, thresholds)).toBe('error');
      expect(calculateAlertSeverity('cls', 0.5, thresholds)).toBe('critical');
    });
  });

  describe('Alert Triggering Logic', () => {
    const config: PerformanceAlertConfig = {
      enabled: true,
      thresholds: {
        lcp: { warning: 2500, error: 4000 },
        fid: { warning: 100, error: 300 },
        cls: { warning: 0.1, error: 0.25 },
        fcp: { warning: 1800, error: 3000 },
      },
      cooldownMinutes: 15,
      maxAlertsPerHour: 10,
      enableSlack: true,
      enableEmail: false,
      enableWebhook: false,
    };

    it('should trigger alert for metric exceeding threshold', () => {
      const metric: EnhancedMetric = {
        name: 'lcp',
        value: 3000,
        rating: 'needs-improvement',
        delta: 100,
        id: 'test-id',
        timestamp: Date.now(),
        url: 'https://example.com',
        userAgent: 'Test Agent',
        correlationId: 'test-correlation',
      };

      const shouldTrigger = shouldTriggerAlert(metric, config, new Map());
      expect(shouldTrigger).toBe(true);
    });

    it('should not trigger alert for metric below threshold', () => {
      const metric: EnhancedMetric = {
        name: 'lcp',
        value: 2000,
        rating: 'good',
        delta: 100,
        id: 'test-id',
        timestamp: Date.now(),
        url: 'https://example.com',
        userAgent: 'Test Agent',
        correlationId: 'test-correlation',
      };

      const shouldTrigger = shouldTriggerAlert(metric, config, new Map());
      expect(shouldTrigger).toBe(false);
    });

    it('should respect cooldown period', () => {
      const metric: EnhancedMetric = {
        name: 'lcp',
        value: 3000,
        rating: 'needs-improvement',
        delta: 100,
        id: 'test-id',
        timestamp: Date.now(),
        url: 'https://example.com',
        userAgent: 'Test Agent',
        correlationId: 'test-correlation',
      };

      const cooldownState = new Map();
      const now = Date.now();

      // First alert should trigger
      expect(shouldTriggerAlert(metric, config, cooldownState)).toBe(true);
      
      // Set cooldown state
      cooldownState.set('lcp', now);

      // Second alert within cooldown should not trigger
      expect(shouldTriggerAlert(metric, config, cooldownState)).toBe(false);

      // Alert after cooldown should trigger
      cooldownState.set('lcp', now - (16 * 60 * 1000)); // 16 minutes ago
      expect(shouldTriggerAlert(metric, config, cooldownState)).toBe(true);
    });

    it('should respect hourly rate limit', () => {
      const metric: EnhancedMetric = {
        name: 'lcp',
        value: 3000,
        rating: 'needs-improvement',
        delta: 100,
        id: 'test-id',
        timestamp: Date.now(),
        url: 'https://example.com',
        userAgent: 'Test Agent',
        correlationId: 'test-correlation',
      };

      const cooldownState = new Map();
      const hourlyCount = new Map();
      const now = Date.now();
      const hourKey = Math.floor(now / (60 * 60 * 1000));

      // Set count to max
      hourlyCount.set(hourKey, config.maxAlertsPerHour);

      // Should not trigger due to rate limit
      const shouldTrigger = shouldTriggerAlert(metric, config, cooldownState, hourlyCount);
      expect(shouldTrigger).toBe(false);
    });
  });

  describe('Performance Alert Creation', () => {
    it('should create performance alert with correlation ID', () => {
      const metric: EnhancedMetric = {
        name: 'lcp',
        value: 3000,
        rating: 'needs-improvement',
        delta: 100,
        id: 'test-id',
        timestamp: Date.now(),
        url: 'https://example.com',
        userAgent: 'Test Agent',
        correlationId: 'test-correlation',
      };

      const thresholds = {
        lcp: { warning: 2500, error: 4000 },
        fid: { warning: 100, error: 300 },
        cls: { warning: 0.1, error: 0.25 },
        fcp: { warning: 1800, error: 3000 },
      };

      const alert = createPerformanceAlert(metric, thresholds);

      expect(alert).toMatchObject({
        correlationId: 'test-correlation',
        metric: 'lcp',
        value: 3000,
        threshold: 2500,
        severity: 'warning',
        url: 'https://example.com',
        userAgent: 'Test Agent',
      });

      expect(alert.id).toMatch(/^[a-f0-9-]{36}$/); // UUID format
      expect(alert.timestamp).toMatch(/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$/); // ISO format
    });

    it('should include performance context in alert', () => {
      const metric: EnhancedMetric = {
        name: 'cls',
        value: 0.3,
        rating: 'poor',
        delta: 0.05,
        id: 'test-id',
        timestamp: Date.now(),
        url: 'https://example.com/page',
        userAgent: 'Mozilla/5.0 Test Agent',
        correlationId: 'test-correlation',
      };

      const thresholds = {
        lcp: { warning: 2500, error: 4000 },
        fid: { warning: 100, error: 300 },
        cls: { warning: 0.1, error: 0.25 },
        fcp: { warning: 1800, error: 3000 },
      };

      const alert = createPerformanceAlert(metric, thresholds);

      expect(alert.context).toEqual({
        rating: 'poor',
        delta: 0.05,
        metricId: 'test-id',
        metricTimestamp: metric.timestamp,
      });
    });
  });

  describe('Performance Alerter Service', () => {
    it('should initialize alerter with valid configuration', async () => {
      const config: PerformanceAlertConfig = {
        enabled: true,
        thresholds: {
          lcp: { warning: 2500, error: 4000 },
          fid: { warning: 100, error: 300 },
          cls: { warning: 0.1, error: 0.25 },
          fcp: { warning: 1800, error: 3000 },
        },
        cooldownMinutes: 15,
        maxAlertsPerHour: 10,
        enableSlack: true,
        enableEmail: false,
        enableWebhook: false,
      };

      const alerter = createPerformanceAlerter();
      await expect(alerter.initialize(config)).resolves.not.toThrow();
    });

    it('should process performance metric and trigger alert', async () => {
      const config: PerformanceAlertConfig = {
        enabled: true,
        thresholds: {
          lcp: { warning: 2500, error: 4000 },
          fid: { warning: 100, error: 300 },
          cls: { warning: 0.1, error: 0.25 },
          fcp: { warning: 1800, error: 3000 },
        },
        cooldownMinutes: 15,
        maxAlertsPerHour: 10,
        enableSlack: true,
        enableEmail: false,
        enableWebhook: false,
      };

      (global as any).__TEST_ALERT_DELIVERY__ = mockAlertDelivery;

      const alerter = createPerformanceAlerter();
      await alerter.initialize(config);

      const metric: EnhancedMetric = {
        name: 'lcp',
        value: 3000,
        rating: 'needs-improvement',
        delta: 100,
        id: 'test-id',
        timestamp: Date.now(),
        url: 'https://example.com',
        userAgent: 'Test Agent',
        correlationId: 'test-correlation',
      };

      await alerter.processMetric(metric);

      expect(mockAlertDelivery.deliverSlack).toHaveBeenCalledWith(
        expect.objectContaining({
          metric: 'lcp',
          value: 3000,
          severity: 'warning',
        })
      );
    });

    it('should not process alerts when disabled', async () => {
      const config: PerformanceAlertConfig = {
        enabled: false,
        thresholds: {
          lcp: { warning: 2500, error: 4000 },
          fid: { warning: 100, error: 300 },
          cls: { warning: 0.1, error: 0.25 },
          fcp: { warning: 1800, error: 3000 },
        },
        cooldownMinutes: 15,
        maxAlertsPerHour: 10,
        enableSlack: true,
        enableEmail: false,
        enableWebhook: false,
      };

      (global as any).__TEST_ALERT_DELIVERY__ = mockAlertDelivery;

      const alerter = createPerformanceAlerter();
      await alerter.initialize(config);

      const metric: EnhancedMetric = {
        name: 'lcp',
        value: 5000, // Well above threshold
        rating: 'poor',
        delta: 100,
        id: 'test-id',
        timestamp: Date.now(),
        url: 'https://example.com',
        userAgent: 'Test Agent',
        correlationId: 'test-correlation',
      };

      await alerter.processMetric(metric);

      expect(mockAlertDelivery.deliverSlack).not.toHaveBeenCalled();
    });

    it('should handle alert delivery failures gracefully', async () => {
      const config: PerformanceAlertConfig = {
        enabled: true,
        thresholds: {
          lcp: { warning: 2500, error: 4000 },
          fid: { warning: 100, error: 300 },
          cls: { warning: 0.1, error: 0.25 },
          fcp: { warning: 1800, error: 3000 },
        },
        cooldownMinutes: 15,
        maxAlertsPerHour: 10,
        enableSlack: true,
        enableEmail: false,
        enableWebhook: false,
      };

      const failingAlertDelivery = {
        ...mockAlertDelivery,
        deliverSlack: jest.fn().mockRejectedValue(new Error('Slack service unavailable')),
      };

      (global as any).__TEST_ALERT_DELIVERY__ = failingAlertDelivery;

      const alerter = createPerformanceAlerter();
      await alerter.initialize(config);

      const metric: EnhancedMetric = {
        name: 'lcp',
        value: 3000,
        rating: 'needs-improvement',
        delta: 100,
        id: 'test-id',
        timestamp: Date.now(),
        url: 'https://example.com',
        userAgent: 'Test Agent',
        correlationId: 'test-correlation',
      };

      // Should not throw even if delivery fails
      await expect(alerter.processMetric(metric)).resolves.not.toThrow();
    });

    it('should track alert metrics', async () => {
      const config: PerformanceAlertConfig = {
        enabled: true,
        thresholds: {
          lcp: { warning: 2500, error: 4000 },
          fid: { warning: 100, error: 300 },
          cls: { warning: 0.1, error: 0.25 },
          fcp: { warning: 1800, error: 3000 },
        },
        cooldownMinutes: 15,
        maxAlertsPerHour: 10,
        enableSlack: true,
        enableEmail: false,
        enableWebhook: false,
      };

      (global as any).__TEST_ALERT_DELIVERY__ = mockAlertDelivery;

      const alerter = createPerformanceAlerter();
      await alerter.initialize(config);

      const metric: EnhancedMetric = {
        name: 'lcp',
        value: 3000,
        rating: 'needs-improvement',
        delta: 100,
        id: 'test-id',
        timestamp: Date.now(),
        url: 'https://example.com',
        userAgent: 'Test Agent',
        correlationId: 'test-correlation',
      };

      await alerter.processMetric(metric);

      const metrics = alerter.getAlertMetrics();
      expect(metrics.totalAlerts).toBe(1);
      expect(metrics.alertsByMetric.lcp).toBe(1);
      expect(metrics.alertsBySeverity.warning).toBe(1);
    });
  });
});