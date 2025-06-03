/**
 * Tests for error tracking service
 */

import {
  createErrorTrackingService,
  validateErrorTrackingConfig,
  createErrorEvent,
  sanitizeErrorForRemote,
} from '@/lib/monitoring/error-tracking';
import type { ErrorTrackingConfig, ErrorEvent } from '@/lib/monitoring/types';

// Mock external error service
const mockErrorService = {
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  setTags: jest.fn(),
  addBreadcrumb: jest.fn(),
  flush: jest.fn(),
};

// Mock correlation ID
jest.mock('@/lib/logging/correlation', () => ({
  getCurrentCorrelationId: jest.fn(() => 'test-correlation-id-123'),
  generateCorrelationId: jest.fn(() => 'generated-correlation-id-456'),
}));

describe('Error Tracking Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset global variables
    delete (global as any).__TEST_ERROR_SERVICE__;
  });

  describe('Configuration Validation', () => {
    it('should validate valid error tracking configuration', () => {
      const validConfig: ErrorTrackingConfig = {
        enabled: true,
        dsn: 'https://valid-dsn@sentry.io/project',
        environment: 'production',
        sampleRate: 1.0,
        enableAutoSessionTracking: true,
        enablePerformanceMonitoring: true,
        maxBreadcrumbs: 100,
      };

      expect(() => validateErrorTrackingConfig(validConfig)).not.toThrow();
    });

    it('should reject invalid DSN format', () => {
      const invalidConfig: ErrorTrackingConfig = {
        enabled: true,
        dsn: 'invalid-dsn-format',
        environment: 'production',
        sampleRate: 1.0,
        enableAutoSessionTracking: true,
        enablePerformanceMonitoring: true,
        maxBreadcrumbs: 100,
      };

      expect(() => validateErrorTrackingConfig(invalidConfig))
        .toThrow('Invalid DSN format');
    });

    it('should reject invalid sample rate', () => {
      const invalidConfig: ErrorTrackingConfig = {
        enabled: true,
        dsn: 'https://valid-dsn@sentry.io/project',
        environment: 'production',
        sampleRate: 2.0, // Invalid: > 1.0
        enableAutoSessionTracking: true,
        enablePerformanceMonitoring: true,
        maxBreadcrumbs: 100,
      };

      expect(() => validateErrorTrackingConfig(invalidConfig))
        .toThrow('Sample rate must be between 0 and 1');
    });

    it('should reject invalid environment', () => {
      const invalidConfig = {
        enabled: true,
        dsn: 'https://valid-dsn@sentry.io/project',
        environment: 'invalid-env', // Invalid environment
        sampleRate: 1.0,
        enableAutoSessionTracking: true,
        enablePerformanceMonitoring: true,
        maxBreadcrumbs: 100,
      } as ErrorTrackingConfig;

      expect(() => validateErrorTrackingConfig(invalidConfig))
        .toThrow('Environment must be development, staging, or production');
    });

    it('should reject negative maxBreadcrumbs', () => {
      const invalidConfig: ErrorTrackingConfig = {
        enabled: true,
        dsn: 'https://valid-dsn@sentry.io/project',
        environment: 'production',
        sampleRate: 1.0,
        enableAutoSessionTracking: true,
        enablePerformanceMonitoring: true,
        maxBreadcrumbs: -10, // Invalid: negative
      };

      expect(() => validateErrorTrackingConfig(invalidConfig))
        .toThrow('Max breadcrumbs must be positive');
    });
  });

  describe('Error Event Creation', () => {
    it('should create error event with correlation ID', () => {
      const error = new Error('Test error message');
      error.stack = 'Error: Test error message\\n    at test.js:1:1';

      const errorEvent = createErrorEvent(error, {
        url: 'https://example.com/test',
        userAgent: 'Test Agent',
        level: 'error',
      });

      expect(errorEvent).toMatchObject({
        correlationId: 'test-correlation-id-123',
        message: 'Test error message',
        level: 'error',
        error: {
          name: 'Error',
          message: 'Test error message',
          stack: expect.stringContaining('test.js:1:1'),
        },
        url: 'https://example.com/test',
        userAgent: 'Test Agent',
      });

      expect(errorEvent.id).toMatch(/^[a-f0-9-]{36}$/); // UUID format
      expect(errorEvent.timestamp).toMatch(/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$/); // ISO format
    });

    it('should create error event with component stack', () => {
      const error = new Error('React component error') as any;
      error.componentStack = 'in TestComponent (at App.js:10:5)';

      const errorEvent = createErrorEvent(error, {
        url: 'https://example.com/test',
        userAgent: 'Test Agent',
        level: 'error',
      });

      expect(errorEvent.error.componentStack).toBe('in TestComponent (at App.js:10:5)');
    });

    it('should create error event with context data', () => {
      const error = new Error('Test error');
      const context = {
        userId: '123',
        action: 'button-click',
        metadata: { component: 'CTA' },
      };

      const errorEvent = createErrorEvent(error, {
        url: 'https://example.com/test',
        userAgent: 'Test Agent',
        level: 'error',
        context,
      });

      expect(errorEvent.context).toEqual(context);
    });

    it('should generate fingerprint for error grouping', () => {
      const error = new Error('TypeError: Cannot read property');
      error.stack = 'TypeError: Cannot read property\\n    at utils.js:42:10';

      const errorEvent = createErrorEvent(error, {
        url: 'https://example.com/test',
        userAgent: 'Test Agent',
        level: 'error',
      });

      expect(errorEvent.fingerprint).toEqual([
        'TypeError',
        'Cannot read property',
        'utils.js:42',
      ]);
    });
  });

  describe('Error Sanitization', () => {
    it('should sanitize sensitive data from error context', () => {
      const errorEvent: ErrorEvent = {
        id: 'test-id',
        timestamp: new Date().toISOString(),
        correlationId: 'test-correlation',
        message: 'Test error',
        level: 'error',
        error: {
          name: 'Error',
          message: 'Test error',
        },
        url: 'https://example.com',
        userAgent: 'Test Agent',
        context: {
          userId: '123',
          password: 'secret123', // Should be redacted
          authToken: 'bearer-token', // Should be redacted  
          apiKey: 'key-123', // Should be redacted
          normalData: 'safe-value',
        },
      };

      const sanitized = sanitizeErrorForRemote(errorEvent);

      expect(sanitized.context).toEqual({
        userId: '123',
        password: '[REDACTED]',
        authToken: '[REDACTED]',
        apiKey: '[REDACTED]',
        normalData: 'safe-value',
      });
    });

    it('should handle circular references in context', () => {
      const circular: any = { name: 'test' };
      circular.self = circular;

      const errorEvent: ErrorEvent = {
        id: 'test-id',
        timestamp: new Date().toISOString(),
        correlationId: 'test-correlation',
        message: 'Test error',
        level: 'error',
        error: {
          name: 'Error',
          message: 'Test error',
        },
        url: 'https://example.com',
        userAgent: 'Test Agent',
        context: { circular },
      };

      const sanitized = sanitizeErrorForRemote(errorEvent);

      expect(sanitized.context?.circular).toEqual({
        name: 'test',
        self: '[Circular Reference]',
      });
    });

    it('should preserve error stack traces', () => {
      const errorEvent: ErrorEvent = {
        id: 'test-id',
        timestamp: new Date().toISOString(),
        correlationId: 'test-correlation',
        message: 'Test error',
        level: 'error',
        error: {
          name: 'TypeError',
          message: 'Cannot read property',
          stack: 'TypeError: Cannot read property\\n    at file.js:10:5',
          componentStack: 'in Component (at App.js:20:10)',
        },
        url: 'https://example.com',
        userAgent: 'Test Agent',
      };

      const sanitized = sanitizeErrorForRemote(errorEvent);

      expect(sanitized.error.stack).toBe('TypeError: Cannot read property\\n    at file.js:10:5');
      expect(sanitized.error.componentStack).toBe('in Component (at App.js:20:10)');
    });
  });

  describe('Error Tracking Service', () => {
    it('should initialize error tracking service with valid config', async () => {
      const config: ErrorTrackingConfig = {
        enabled: true,
        dsn: 'https://valid-dsn@sentry.io/project',
        environment: 'production',
        sampleRate: 1.0,
        enableAutoSessionTracking: true,
        enablePerformanceMonitoring: true,
        maxBreadcrumbs: 100,
      };

      // Mock the external service
      (global as any).__TEST_ERROR_SERVICE__ = mockErrorService;

      const service = createErrorTrackingService();
      await service.initialize(config);

      expect(mockErrorService.init).toHaveBeenCalledWith({
        dsn: config.dsn,
        environment: config.environment,
        sampleRate: config.sampleRate,
        autoSessionTracking: config.enableAutoSessionTracking,
        integrations: expect.any(Array),
        maxBreadcrumbs: config.maxBreadcrumbs,
      });
    });

    it('should not initialize when disabled', async () => {
      const config: ErrorTrackingConfig = {
        enabled: false,
        environment: 'development',
        sampleRate: 1.0,
        enableAutoSessionTracking: false,
        enablePerformanceMonitoring: false,
        maxBreadcrumbs: 50,
      };

      const service = createErrorTrackingService();
      await service.initialize(config);

      expect(mockErrorService.init).not.toHaveBeenCalled();
    });

    it('should capture error with sanitization', async () => {
      const config: ErrorTrackingConfig = {
        enabled: true,
        dsn: 'https://valid-dsn@sentry.io/project',
        environment: 'production',
        sampleRate: 1.0,
        enableAutoSessionTracking: true,
        enablePerformanceMonitoring: true,
        maxBreadcrumbs: 100,
      };

      (global as any).__TEST_ERROR_SERVICE__ = mockErrorService;

      const service = createErrorTrackingService();
      await service.initialize(config);

      const errorEvent: ErrorEvent = {
        id: 'test-id',
        timestamp: new Date().toISOString(),
        correlationId: 'test-correlation',
        message: 'Test error',
        level: 'error',
        error: {
          name: 'Error',
          message: 'Test error',
        },
        url: 'https://example.com',
        userAgent: 'Test Agent',
        context: {
          password: 'secret', // Should be sanitized
          normalData: 'safe',
        },
      };

      await service.captureError(errorEvent);

      expect(mockErrorService.captureException).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test error',
          context: {
            password: '[REDACTED]',
            normalData: 'safe',
          },
        })
      );
    });

    it('should handle capture errors gracefully', async () => {
      const config: ErrorTrackingConfig = {
        enabled: true,
        dsn: 'https://valid-dsn@sentry.io/project',
        environment: 'production',
        sampleRate: 1.0,
        enableAutoSessionTracking: true,
        enablePerformanceMonitoring: true,
        maxBreadcrumbs: 100,
      };

      // Mock service that throws errors
      const failingService = {
        ...mockErrorService,
        captureException: jest.fn().mockRejectedValue(new Error('Service unavailable')),
      };

      (global as any).__TEST_ERROR_SERVICE__ = failingService;

      const service = createErrorTrackingService();
      await service.initialize(config);

      const errorEvent: ErrorEvent = {
        id: 'test-id',
        timestamp: new Date().toISOString(),
        correlationId: 'test-correlation',
        message: 'Test error',
        level: 'error',
        error: {
          name: 'Error',
          message: 'Test error',
        },
        url: 'https://example.com',
        userAgent: 'Test Agent',
      };

      // Should not throw even if external service fails
      await expect(service.captureError(errorEvent)).resolves.not.toThrow();
    });

    it('should set user context', async () => {
      const config: ErrorTrackingConfig = {
        enabled: true,
        dsn: 'https://valid-dsn@sentry.io/project',
        environment: 'production',
        sampleRate: 1.0,
        enableAutoSessionTracking: true,
        enablePerformanceMonitoring: true,
        maxBreadcrumbs: 100,
      };

      (global as any).__TEST_ERROR_SERVICE__ = mockErrorService;

      const service = createErrorTrackingService();
      await service.initialize(config);

      const user = { id: 'user-123', segment: 'premium' };
      service.setUser(user);

      expect(mockErrorService.setUser).toHaveBeenCalledWith(user);
    });

    it('should add breadcrumbs with sanitization', async () => {
      const config: ErrorTrackingConfig = {
        enabled: true,
        dsn: 'https://valid-dsn@sentry.io/project',
        environment: 'production',
        sampleRate: 1.0,
        enableAutoSessionTracking: true,
        enablePerformanceMonitoring: true,
        maxBreadcrumbs: 100,
      };

      (global as any).__TEST_ERROR_SERVICE__ = mockErrorService;

      const service = createErrorTrackingService();
      await service.initialize(config);

      service.addBreadcrumb('User clicked button', 'user_action', {
        buttonId: 'cta-button',
        password: 'secret', // Should be sanitized
      });

      expect(mockErrorService.addBreadcrumb).toHaveBeenCalledWith({
        message: 'User clicked button',
        category: 'user_action',
        data: {
          buttonId: 'cta-button',
          password: '[REDACTED]',
        },
        timestamp: expect.any(Number),
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should implement rate limiting for error reports', async () => {
      const config: ErrorTrackingConfig = {
        enabled: true,
        dsn: 'https://valid-dsn@sentry.io/project',
        environment: 'production',
        sampleRate: 1.0,
        enableAutoSessionTracking: true,
        enablePerformanceMonitoring: true,
        maxBreadcrumbs: 100,
      };

      (global as any).__TEST_ERROR_SERVICE__ = mockErrorService;

      const service = createErrorTrackingService();
      await service.initialize(config);

      const errorEvent: ErrorEvent = {
        id: 'test-id',
        timestamp: new Date().toISOString(),
        correlationId: 'test-correlation',
        message: 'Repeated error',
        level: 'error',
        error: {
          name: 'Error',
          message: 'Repeated error',
        },
        url: 'https://example.com',
        userAgent: 'Test Agent',
      };

      // Send same error multiple times rapidly
      for (let i = 0; i < 10; i++) {
        await service.captureError({ ...errorEvent, id: \`test-id-\${i}\` });
      }

      // Should be rate limited after initial calls
      expect(mockErrorService.captureException).toHaveBeenCalledTimes(5); // Assuming limit of 5 per minute
    });
  });
});