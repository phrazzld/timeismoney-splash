/**
 * Tests for remote logging system
 */

import {
  createRemoteLogger,
  validateRemoteLoggingConfig,
  createLogBatch,
  createRemoteLogEntry,
} from '@/lib/monitoring/remote-logging';
import type { RemoteLoggingConfig, RemoteLogEntry } from '@/lib/monitoring/types';
import type { LogEntry } from '@/lib/logging/types';

// Mock HTTP client
const mockHttpClient = {
  post: jest.fn(),
};

// Mock correlation ID
jest.mock('@/lib/logging/correlation', () => ({
  getCurrentCorrelationId: jest.fn(() => 'test-correlation-id-123'),
  generateCorrelationId: jest.fn(() => 'generated-correlation-id-456'),
}));

describe('Remote Logging System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset global state
    delete (global as unknown).__TEST_HTTP_CLIENT__;
  });

  describe('Configuration Validation', () => {
    it('should validate valid remote logging configuration', () => {
      const validConfig: RemoteLoggingConfig = {
        enabled: true,
        endpoint: 'https://api.logging-service.com/logs',
        apiKey: 'test-api-key-123',
        batchSize: 50,
        flushInterval: 30000,
        maxRetries: 3,
        retryBackoffMs: 1000,
      };

      expect(() => validateRemoteLoggingConfig(validConfig)).not.toThrow();
    });

    it('should reject invalid endpoint URL', () => {
      const invalidConfig: RemoteLoggingConfig = {
        enabled: true,
        endpoint: 'invalid-url',
        apiKey: 'test-api-key-123',
        batchSize: 50,
        flushInterval: 30000,
        maxRetries: 3,
        retryBackoffMs: 1000,
      };

      expect(() => validateRemoteLoggingConfig(invalidConfig)).toThrow(
        'Invalid endpoint URL format',
      );
    });

    it('should reject invalid batch size', () => {
      const invalidConfig: RemoteLoggingConfig = {
        enabled: true,
        endpoint: 'https://api.logging-service.com/logs',
        apiKey: 'test-api-key-123',
        batchSize: 0, // Invalid: must be positive
        flushInterval: 30000,
        maxRetries: 3,
        retryBackoffMs: 1000,
      };

      expect(() => validateRemoteLoggingConfig(invalidConfig)).toThrow(
        'Batch size must be positive',
      );
    });

    it('should reject invalid flush interval', () => {
      const invalidConfig: RemoteLoggingConfig = {
        enabled: true,
        endpoint: 'https://api.logging-service.com/logs',
        apiKey: 'test-api-key-123',
        batchSize: 50,
        flushInterval: 50, // Invalid: too small
        maxRetries: 3,
        retryBackoffMs: 1000,
      };

      expect(() => validateRemoteLoggingConfig(invalidConfig)).toThrow(
        'Flush interval must be at least 100ms',
      );
    });

    it('should reject negative retry configuration', () => {
      const invalidConfig: RemoteLoggingConfig = {
        enabled: true,
        endpoint: 'https://api.logging-service.com/logs',
        apiKey: 'test-api-key-123',
        batchSize: 50,
        flushInterval: 30000,
        maxRetries: -1, // Invalid: negative
        retryBackoffMs: 1000,
      };

      expect(() => validateRemoteLoggingConfig(invalidConfig)).toThrow(
        'Max retries must be non-negative',
      );
    });

    it('should require endpoint and API key when enabled', () => {
      const invalidConfig: RemoteLoggingConfig = {
        enabled: true,
        // endpoint missing
        apiKey: 'test-api-key-123',
        batchSize: 50,
        flushInterval: 30000,
        maxRetries: 3,
        retryBackoffMs: 1000,
      };

      expect(() => validateRemoteLoggingConfig(invalidConfig)).toThrow(
        'Endpoint is required when remote logging is enabled',
      );
    });
  });

  describe('Remote Log Entry Creation', () => {
    it('should create remote log entry from structured log entry', () => {
      const logEntry: LogEntry = {
        timestamp: '2024-01-01T12:00:00.000Z',
        level: 'info',
        message: 'Test log message',
        correlationId: 'test-correlation-123',
        type: 'custom',
        event: {
          name: 'test_event',
          category: 'testing',
          properties: { key: 'value' },
        },
      };

      const remoteEntry = createRemoteLogEntry(logEntry, 'client', 'production');

      expect(remoteEntry).toMatchObject({
        timestamp: '2024-01-01T12:00:00.000Z',
        level: 'info',
        message: 'Test log message',
        correlationId: 'test-correlation-123',
        type: 'custom',
        source: 'client',
        environment: 'production',
        data: {
          event: {
            name: 'test_event',
            category: 'testing',
            properties: { key: 'value' },
          },
        },
      });

      expect(remoteEntry.id).toMatch(/^[a-f0-9-]{36}$/); // UUID format
    });

    it('should handle performance log entries', () => {
      const logEntry: LogEntry = {
        timestamp: '2024-01-01T12:00:00.000Z',
        level: 'info',
        message: 'LCP measured',
        correlationId: 'test-correlation-123',
        type: 'performance',
        metrics: {
          name: 'lcp',
          value: 2500,
          rating: 'good',
          delta: 100,
        },
        url: 'https://example.com',
        userAgent: 'Test Agent',
      };

      const remoteEntry = createRemoteLogEntry(logEntry, 'client', 'production');

      expect(remoteEntry.type).toBe('performance');
      expect(remoteEntry.data).toEqual({
        metrics: {
          name: 'lcp',
          value: 2500,
          rating: 'good',
          delta: 100,
        },
        url: 'https://example.com',
        userAgent: 'Test Agent',
      });
    });

    it('should handle error log entries', () => {
      const logEntry: LogEntry = {
        timestamp: '2024-01-01T12:00:00.000Z',
        level: 'error',
        message: 'Application error',
        correlationId: 'test-correlation-123',
        type: 'error',
        error: {
          name: 'TypeError',
          message: 'Cannot read property',
          stack: 'TypeError: Cannot read property\\n    at file.js:10:5',
        },
        context: { userId: '123' },
        url: 'https://example.com',
        userAgent: 'Test Agent',
      };

      const remoteEntry = createRemoteLogEntry(logEntry, 'client', 'production');

      expect(remoteEntry.type).toBe('error');
      expect(remoteEntry.data).toEqual({
        error: {
          name: 'TypeError',
          message: 'Cannot read property',
          stack: 'TypeError: Cannot read property\\n    at file.js:10:5',
        },
        context: { userId: '123' },
        url: 'https://example.com',
        userAgent: 'Test Agent',
      });
    });

    it('should sanitize sensitive data in log entries', () => {
      const logEntry: LogEntry = {
        timestamp: '2024-01-01T12:00:00.000Z',
        level: 'info',
        message: 'User action',
        correlationId: 'test-correlation-123',
        type: 'custom',
        event: {
          name: 'user_action',
          category: 'interaction',
          properties: {
            userId: '123',
            password: 'secret123', // Should be sanitized
            authToken: 'bearer-token', // Should be sanitized
            normalData: 'safe-value',
          },
        },
      };

      const remoteEntry = createRemoteLogEntry(logEntry, 'client', 'production');

      expect(remoteEntry.data.event.properties).toEqual({
        userId: '123',
        password: '[REDACTED]',
        authToken: '[REDACTED]',
        normalData: 'safe-value',
      });
    });
  });

  describe('Log Batch Creation', () => {
    it('should create log batch with metadata', () => {
      const entries: RemoteLogEntry[] = [
        {
          id: 'entry-1',
          timestamp: '2024-01-01T12:00:00.000Z',
          correlationId: 'test-correlation-1',
          level: 'info',
          message: 'Test message 1',
          type: 'custom',
          data: { event: { name: 'test1', category: 'testing' } },
          source: 'client',
          environment: 'production',
        },
        {
          id: 'entry-2',
          timestamp: '2024-01-01T12:01:00.000Z',
          correlationId: 'test-correlation-2',
          level: 'warn',
          message: 'Test message 2',
          type: 'custom',
          data: { event: { name: 'test2', category: 'testing' } },
          source: 'client',
          environment: 'production',
        },
      ];

      const batch = createLogBatch(entries, {
        source: 'timeismoney-splash',
        version: '1.0.0',
        environment: 'production',
      });

      expect(batch).toMatchObject({
        entries,
        metadata: {
          source: 'timeismoney-splash',
          version: '1.0.0',
          environment: 'production',
        },
      });

      expect(batch.id).toMatch(/^[a-f0-9-]{36}$/); // UUID format
      expect(batch.timestamp).toMatch(/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$/); // ISO format
    });

    it('should handle empty batch', () => {
      const batch = createLogBatch([], {
        source: 'timeismoney-splash',
        version: '1.0.0',
        environment: 'production',
      });

      expect(batch.entries).toHaveLength(0);
      expect(batch.metadata).toBeDefined();
    });
  });

  describe('Remote Logger Service', () => {
    it('should initialize remote logger with valid configuration', async () => {
      const config: RemoteLoggingConfig = {
        enabled: true,
        endpoint: 'https://api.logging-service.com/logs',
        apiKey: 'test-api-key-123',
        batchSize: 50,
        flushInterval: 30000,
        maxRetries: 3,
        retryBackoffMs: 1000,
      };

      const logger = createRemoteLogger();
      await expect(logger.initialize(config)).resolves.not.toThrow();
    });

    it('should not initialize when disabled', async () => {
      const config: RemoteLoggingConfig = {
        enabled: false,
        batchSize: 50,
        flushInterval: 30000,
        maxRetries: 3,
        retryBackoffMs: 1000,
      };

      const logger = createRemoteLogger();
      await expect(logger.initialize(config)).resolves.not.toThrow();
    });

    it('should buffer log entries until batch size is reached', async () => {
      const config: RemoteLoggingConfig = {
        enabled: true,
        endpoint: 'https://api.logging-service.com/logs',
        apiKey: 'test-api-key-123',
        batchSize: 3,
        flushInterval: 60000, // Long interval to test batching
        maxRetries: 3,
        retryBackoffMs: 1000,
      };

      mockHttpClient.post.mockResolvedValue({ ok: true, status: 200 });
      (global as unknown).__TEST_HTTP_CLIENT__ = mockHttpClient;

      const logger = createRemoteLogger();
      await logger.initialize(config);

      const logEntry: LogEntry = {
        timestamp: '2024-01-01T12:00:00.000Z',
        level: 'info',
        message: 'Test message',
        correlationId: 'test-correlation-123',
        type: 'custom',
        event: { name: 'test', category: 'testing' },
      };

      // Send 2 entries - should not trigger send yet
      await logger.sendLogEntry(logEntry);
      await logger.sendLogEntry(logEntry);

      expect(mockHttpClient.post).not.toHaveBeenCalled();

      // Send 3rd entry - should trigger batch send
      await logger.sendLogEntry(logEntry);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'https://api.logging-service.com/logs',
        expect.objectContaining({
          entries: expect.arrayContaining([expect.objectContaining({ message: 'Test message' })]),
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key-123',
          }),
        }),
      );
    });

    it('should flush logs on interval', async () => {
      const config: RemoteLoggingConfig = {
        enabled: true,
        endpoint: 'https://api.logging-service.com/logs',
        apiKey: 'test-api-key-123',
        batchSize: 50,
        flushInterval: 100, // Short interval for testing
        maxRetries: 3,
        retryBackoffMs: 1000,
      };

      mockHttpClient.post.mockResolvedValue({ ok: true, status: 200 });
      (global as unknown).__TEST_HTTP_CLIENT__ = mockHttpClient;

      const logger = createRemoteLogger();
      await logger.initialize(config);

      const logEntry: LogEntry = {
        timestamp: '2024-01-01T12:00:00.000Z',
        level: 'info',
        message: 'Test message',
        correlationId: 'test-correlation-123',
        type: 'custom',
        event: { name: 'test', category: 'testing' },
      };

      await logger.sendLogEntry(logEntry);

      // Wait for flush interval
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'https://api.logging-service.com/logs',
        expect.objectContaining({
          entries: expect.arrayContaining([expect.objectContaining({ message: 'Test message' })]),
        }),
        expect.any(Object),
      );
    });

    it('should retry failed requests with exponential backoff', async () => {
      const config: RemoteLoggingConfig = {
        enabled: true,
        endpoint: 'https://api.logging-service.com/logs',
        apiKey: 'test-api-key-123',
        batchSize: 1,
        flushInterval: 60000,
        maxRetries: 2,
        retryBackoffMs: 100,
      };

      // Mock first two calls to fail, third to succeed
      mockHttpClient.post
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true, status: 200 });

      (global as unknown).__TEST_HTTP_CLIENT__ = mockHttpClient;

      const logger = createRemoteLogger();
      await logger.initialize(config);

      const logEntry: LogEntry = {
        timestamp: '2024-01-01T12:00:00.000Z',
        level: 'info',
        message: 'Test message',
        correlationId: 'test-correlation-123',
        type: 'custom',
        event: { name: 'test', category: 'testing' },
      };

      await logger.sendLogEntry(logEntry);

      // Wait for retries to complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      expect(mockHttpClient.post).toHaveBeenCalledTimes(3);
    });

    it('should handle circuit breaker for repeated failures', async () => {
      const config: RemoteLoggingConfig = {
        enabled: true,
        endpoint: 'https://api.logging-service.com/logs',
        apiKey: 'test-api-key-123',
        batchSize: 1,
        flushInterval: 60000,
        maxRetries: 1,
        retryBackoffMs: 100,
      };

      // Mock all calls to fail
      mockHttpClient.post.mockRejectedValue(new Error('Service unavailable'));
      (global as unknown).__TEST_HTTP_CLIENT__ = mockHttpClient;

      const logger = createRemoteLogger();
      await logger.initialize(config);

      const logEntry: LogEntry = {
        timestamp: '2024-01-01T12:00:00.000Z',
        level: 'info',
        message: 'Test message',
        correlationId: 'test-correlation-123',
        type: 'custom',
        event: { name: 'test', category: 'testing' },
      };

      // Send multiple entries - circuit breaker should open after failures
      for (let i = 0; i < 10; i++) {
        await logger.sendLogEntry({ ...logEntry, message: `Message ${i}` });
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // Circuit breaker should limit the number of actual HTTP calls
      expect(mockHttpClient.post.mock.calls.length).toBeLessThan(20); // Much less than 10 * 2 retries
    });

    it('should handle invalid API responses gracefully', async () => {
      const config: RemoteLoggingConfig = {
        enabled: true,
        endpoint: 'https://api.logging-service.com/logs',
        apiKey: 'test-api-key-123',
        batchSize: 1,
        flushInterval: 60000,
        maxRetries: 1,
        retryBackoffMs: 100,
      };

      mockHttpClient.post.mockResolvedValue({ ok: false, status: 400, statusText: 'Bad Request' });
      (global as unknown).__TEST_HTTP_CLIENT__ = mockHttpClient;

      const logger = createRemoteLogger();
      await logger.initialize(config);

      const logEntry: LogEntry = {
        timestamp: '2024-01-01T12:00:00.000Z',
        level: 'info',
        message: 'Test message',
        correlationId: 'test-correlation-123',
        type: 'custom',
        event: { name: 'test', category: 'testing' },
      };

      // Should not throw even if API returns error
      await expect(logger.sendLogEntry(logEntry)).resolves.not.toThrow();
    });

    it('should provide transmission metrics', async () => {
      const config: RemoteLoggingConfig = {
        enabled: true,
        endpoint: 'https://api.logging-service.com/logs',
        apiKey: 'test-api-key-123',
        batchSize: 1,
        flushInterval: 60000,
        maxRetries: 3,
        retryBackoffMs: 100,
      };

      mockHttpClient.post.mockResolvedValue({ ok: true, status: 200 });
      (global as unknown).__TEST_HTTP_CLIENT__ = mockHttpClient;

      const logger = createRemoteLogger();
      await logger.initialize(config);

      const logEntry: LogEntry = {
        timestamp: '2024-01-01T12:00:00.000Z',
        level: 'info',
        message: 'Test message',
        correlationId: 'test-correlation-123',
        type: 'custom',
        event: { name: 'test', category: 'testing' },
      };

      await logger.sendLogEntry(logEntry);

      const metrics = logger.getTransmissionMetrics();
      expect(metrics.totalBatches).toBe(1);
      expect(metrics.totalEntries).toBe(1);
      expect(metrics.successfulTransmissions).toBe(1);
      expect(metrics.failedTransmissions).toBe(0);
    });
  });
});
