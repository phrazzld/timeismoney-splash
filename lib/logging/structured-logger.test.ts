/**
 * Tests for structured logger implementation (T018)
 */

import { 
  StructuredLoggerImpl, 
  createLogger, 
  sanitizeError, 
  sanitizeContext,
  formatLogEntry 
} from './structured-logger';
import { generateCorrelationId, setCorrelationId, clearCorrelationId } from './correlation';
import type { LogLevel, LoggerConfig, LogEntry } from './types';

describe('Structured Logger (T018)', () => {
  let logger: StructuredLoggerImpl;
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleWarn: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;

  beforeEach(() => {
    // Mock console methods
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
    
    // Clear correlation ID
    clearCorrelationId();
    
    // Create logger with test configuration
    const config: LoggerConfig = {
      minLevel: 'debug',
      enableConsole: true,
      enableRemote: false,
      maxEntries: 100,
      flushInterval: 1000,
    };
    
    logger = new StructuredLoggerImpl(config);
  });

  afterEach(() => {
    // Restore console methods
    mockConsoleLog.mockRestore();
    mockConsoleWarn.mockRestore();
    mockConsoleError.mockRestore();
    
    // Clear correlation ID
    clearCorrelationId();
  });

  describe('Logger Configuration', () => {
    it('should create logger with default configuration', () => {
      const defaultLogger = createLogger();
      expect(defaultLogger).toBeDefined();
    });

    it('should create logger with custom configuration', () => {
      const config: LoggerConfig = {
        minLevel: 'warn',
        enableConsole: false,
        enableRemote: true,
        remoteEndpoint: 'https://api.example.com/logs',
        maxEntries: 500,
        flushInterval: 5000,
      };
      
      const customLogger = createLogger(config);
      expect(customLogger).toBeDefined();
    });

    it('should respect minimum log level configuration', () => {
      const warnLogger = createLogger({ 
        minLevel: 'warn',
        enableConsole: true,
        enableRemote: false,
        maxEntries: 100,
        flushInterval: 1000,
      });
      
      warnLogger.debug('Debug message');
      warnLogger.info('Info message');
      warnLogger.warn('Warn message');
      warnLogger.error('Error message');
      
      // Only warn and error should be logged
      expect(mockConsoleLog).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalledTimes(1);
      expect(mockConsoleError).toHaveBeenCalledTimes(1);
    });
  });

  describe('Basic Logging Methods', () => {
    beforeEach(() => {
      const correlationId = generateCorrelationId();
      setCorrelationId(correlationId);
    });

    it('should log debug messages', () => {
      logger.debug('Debug message');
      
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      const logCall = mockConsoleLog.mock.calls[0][0];
      const parsed = JSON.parse(logCall);
      
      expect(parsed.level).toBe('debug');
      expect(parsed.message).toBe('Debug message');
      expect(parsed.correlationId).toBeDefined();
      expect(parsed.timestamp).toBeDefined();
    });

    it('should log info messages', () => {
      logger.info('Info message');
      
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      const logCall = mockConsoleLog.mock.calls[0][0];
      const parsed = JSON.parse(logCall);
      
      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('Info message');
    });

    it('should log warn messages', () => {
      logger.warn('Warning message');
      
      expect(mockConsoleWarn).toHaveBeenCalledTimes(1);
      const logCall = mockConsoleWarn.mock.calls[0][0];
      const parsed = JSON.parse(logCall);
      
      expect(parsed.level).toBe('warn');
      expect(parsed.message).toBe('Warning message');
    });

    it('should log error messages', () => {
      const error = new Error('Test error');
      logger.error('Error message', error);
      
      expect(mockConsoleError).toHaveBeenCalledTimes(1);
      const logCall = mockConsoleError.mock.calls[0][0];
      const parsed = JSON.parse(logCall);
      
      expect(parsed.level).toBe('error');
      expect(parsed.message).toBe('Error message');
      expect(parsed.error).toBeDefined();
      expect(parsed.error.name).toBe('Error');
      expect(parsed.error.message).toBe('Test error');
    });

    it('should include context data when provided', () => {
      const context = { userId: '123', action: 'login' };
      logger.info('User action', context);
      
      const logCall = mockConsoleLog.mock.calls[0][0];
      const parsed = JSON.parse(logCall);
      
      expect(parsed.context).toEqual(context);
    });
  });

  describe('Specialized Logging Methods', () => {
    beforeEach(() => {
      const correlationId = generateCorrelationId();
      setCorrelationId(correlationId);
    });

    it('should log performance metrics', () => {
      logger.logPerformance({
        type: 'performance',
        message: 'Core Web Vital measured',
        metrics: {
          name: 'LCP',
          value: 1500,
          rating: 'good',
          delta: 100,
        },
        url: 'https://example.com',
        userAgent: 'Mozilla/5.0...',
      });
      
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      const logCall = mockConsoleLog.mock.calls[0][0];
      const parsed = JSON.parse(logCall);
      
      expect(parsed.type).toBe('performance');
      expect(parsed.metrics.name).toBe('LCP');
      expect(parsed.metrics.value).toBe(1500);
      expect(parsed.metrics.rating).toBe('good');
    });

    it('should log page views', () => {
      logger.logPageView({
        type: 'pageview',
        message: 'Page viewed',
        page: {
          path: '/landing',
          title: 'Landing Page',
          referrer: 'https://google.com',
        },
        session: {
          id: 'session-123',
          isNewSession: true,
        },
        user: {
          id: 'user-456',
          segment: 'premium',
        },
      });
      
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      const logCall = mockConsoleLog.mock.calls[0][0];
      const parsed = JSON.parse(logCall);
      
      expect(parsed.type).toBe('pageview');
      expect(parsed.page.path).toBe('/landing');
      expect(parsed.session.isNewSession).toBe(true);
      expect(parsed.user.segment).toBe('premium');
    });

    it('should log custom events', () => {
      logger.logCustomEvent({
        type: 'custom',
        message: 'Custom event occurred',
        event: {
          name: 'button_click',
          category: 'interaction',
          properties: {
            buttonId: 'cta-button',
            location: 'hero',
          },
        },
      });
      
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      const logCall = mockConsoleLog.mock.calls[0][0];
      const parsed = JSON.parse(logCall);
      
      expect(parsed.type).toBe('custom');
      expect(parsed.event.name).toBe('button_click');
      expect(parsed.event.properties.buttonId).toBe('cta-button');
    });
  });

  describe('Error Sanitization', () => {
    it('should sanitize standard errors correctly', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';
      
      const sanitized = sanitizeError(error);
      
      expect(sanitized.name).toBe('Error');
      expect(sanitized.message).toBe('Test error');
      expect(sanitized.stack).toBe('Error: Test error\n    at test.js:1:1');
    });

    it('should handle errors without stack traces', () => {
      const error = new Error('Test error');
      delete (error as any).stack;
      
      const sanitized = sanitizeError(error);
      
      expect(sanitized.name).toBe('Error');
      expect(sanitized.message).toBe('Test error');
      expect(sanitized.stack).toBeUndefined();
    });

    it('should handle React error boundaries with component stack', () => {
      const error = new Error('Component error') as any;
      error.componentStack = '\n    in Component (at App.js:1:1)';
      
      const sanitized = sanitizeError(error);
      
      expect(sanitized.componentStack).toBe('\n    in Component (at App.js:1:1)');
    });

    it('should handle non-Error objects', () => {
      const nonError = { message: 'Not an error' };
      
      const sanitized = sanitizeError(nonError as any);
      
      expect(sanitized.name).toBe('Unknown');
      expect(sanitized.message).toBe('[object Object]');
    });

    it('should handle null and undefined errors', () => {
      const nullSanitized = sanitizeError(null as any);
      const undefinedSanitized = sanitizeError(undefined as any);
      
      expect(nullSanitized.name).toBe('Unknown');
      expect(nullSanitized.message).toBe('null');
      
      expect(undefinedSanitized.name).toBe('Unknown');
      expect(undefinedSanitized.message).toBe('undefined');
    });
  });

  describe('Context Sanitization', () => {
    it('should sanitize context objects safely', () => {
      const context = {
        userId: '123',
        password: 'secret',
        token: 'abc123',
        apiKey: 'key456',
        safe: 'value',
      };
      
      const sanitized = sanitizeContext(context);
      
      expect(sanitized.userId).toBe('123');
      expect(sanitized.safe).toBe('value');
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.token).toBe('[REDACTED]');
      expect(sanitized.apiKey).toBe('[REDACTED]');
    });

    it('should handle nested objects', () => {
      const context = {
        user: {
          id: '123',
          credentials: {
            password: 'secret',
            token: 'abc123',
          },
        },
        safe: 'value',
      };
      
      const sanitized = sanitizeContext(context);
      
      expect(sanitized.user.id).toBe('123');
      expect(sanitized.safe).toBe('value');
      expect(sanitized.user.credentials.password).toBe('[REDACTED]');
      expect(sanitized.user.credentials.token).toBe('[REDACTED]');
    });

    it('should handle arrays safely', () => {
      const context = {
        items: [
          { id: '1', secret: 'hidden' },
          { id: '2', safe: 'visible' },
        ],
      };
      
      const sanitized = sanitizeContext(context);
      
      expect(sanitized.items[0].id).toBe('1');
      expect(sanitized.items[0].secret).toBe('[REDACTED]');
      expect(sanitized.items[1].safe).toBe('visible');
    });

    it('should handle circular references', () => {
      const context: any = { id: '123' };
      context.self = context;
      
      const sanitized = sanitizeContext(context);
      
      expect(sanitized.id).toBe('123');
      expect(sanitized.self).toBe('[Circular Reference]');
    });

    it('should handle functions and undefined values', () => {
      const context = {
        fn: () => 'test',
        undef: undefined,
        nil: null,
        safe: 'value',
      };
      
      const sanitized = sanitizeContext(context);
      
      expect(sanitized.fn).toBe('[Function]');
      expect(sanitized.undef).toBeUndefined();
      expect(sanitized.nil).toBeNull();
      expect(sanitized.safe).toBe('value');
    });
  });

  describe('Log Formatting', () => {
    it('should format log entries correctly', () => {
      const correlationId = generateCorrelationId();
      const timestamp = new Date().toISOString();
      
      const entry: LogEntry = {
        type: 'performance',
        timestamp,
        level: 'info',
        message: 'Performance metric',
        correlationId,
        metrics: {
          name: 'LCP',
          value: 1500,
          rating: 'good',
        },
        url: 'https://example.com',
        userAgent: 'Mozilla/5.0...',
      };
      
      const formatted = formatLogEntry(entry);
      const parsed = JSON.parse(formatted);
      
      expect(parsed.timestamp).toBe(timestamp);
      expect(parsed.level).toBe('info');
      expect(parsed.correlationId).toBe(correlationId);
      expect(parsed.metrics.name).toBe('LCP');
    });

    it('should produce valid JSON', () => {
      const correlationId = generateCorrelationId();
      setCorrelationId(correlationId);
      
      logger.info('Test message', { complex: { nested: 'value' } });
      
      const logCall = mockConsoleLog.mock.calls[0][0];
      
      expect(() => JSON.parse(logCall)).not.toThrow();
    });

    it('should handle special characters and unicode', () => {
      const correlationId = generateCorrelationId();
      setCorrelationId(correlationId);
      
      logger.info('Message with 特殊字符 and "quotes" and \n newlines');
      
      const logCall = mockConsoleLog.mock.calls[0][0];
      const parsed = JSON.parse(logCall);
      
      expect(parsed.message).toBe('Message with 特殊字符 and "quotes" and \n newlines');
    });
  });

  describe('Performance and Memory Management', () => {
    it('should handle high-frequency logging efficiently', () => {
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        logger.info(`Message ${i}`, { index: i });
      }
      
      const end = performance.now();
      const timePerLog = (end - start) / 1000;
      
      // Should log each message in less than 1ms
      expect(timePerLog).toBeLessThan(1);
    });

    it('should respect maximum entries limit', () => {
      const limitedLogger = createLogger({
        minLevel: 'debug',
        enableConsole: false,
        enableRemote: false,
        maxEntries: 5,
        flushInterval: 1000,
      });
      
      // Add more entries than the limit
      for (let i = 0; i < 10; i++) {
        limitedLogger.info(`Message ${i}`);
      }
      
      // Should only keep the most recent 5 entries
      const entries = (limitedLogger as any).getEntries();
      expect(entries).toHaveLength(5);
      expect(entries[0].message).toBe('Message 5');
      expect(entries[4].message).toBe('Message 9');
    });

    it('should not leak memory during extended use', () => {
      const initialMemory = process.memoryUsage?.()?.heapUsed || 0;
      
      // Simulate extended logging
      for (let i = 0; i < 10000; i++) {
        logger.info(`Message ${i}`, { 
          large: 'x'.repeat(100),
          complex: { nested: { deep: { value: i } } }
        });
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

  describe('Async Operations and Flushing', () => {
    it('should flush logs successfully', async () => {
      logger.info('Message 1');
      logger.warn('Message 2');
      logger.error('Message 3');
      
      await expect(logger.flush()).resolves.toBeUndefined();
    });

    it('should handle flush errors gracefully', async () => {
      const errorLogger = createLogger({
        minLevel: 'debug',
        enableConsole: true,
        enableRemote: true,
        remoteEndpoint: 'invalid-url',
        maxEntries: 100,
        flushInterval: 1000,
      });
      
      errorLogger.info('Test message');
      
      // Should not throw even if remote logging fails
      await expect(errorLogger.flush()).resolves.toBeUndefined();
    });

    it('should support concurrent logging operations', async () => {
      const promises = Array.from({ length: 100 }, async (_, index) => {
        const correlationId = generateCorrelationId();
        
        return new Promise<void>(resolve => {
          setTimeout(() => {
            setCorrelationId(correlationId);
            logger.info(`Concurrent message ${index}`);
            resolve();
          }, Math.random() * 10);
        });
      });
      
      await Promise.all(promises);
      
      // All messages should be logged
      expect(mockConsoleLog).toHaveBeenCalledTimes(100);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle logger creation with invalid configuration', () => {
      const invalidConfig = {
        minLevel: 'invalid' as LogLevel,
        enableConsole: true,
        enableRemote: false,
        maxEntries: -1,
        flushInterval: 0,
      };
      
      // Should create logger with fallback values
      expect(() => createLogger(invalidConfig)).not.toThrow();
    });

    it('should handle extremely large log messages', () => {
      const largeMessage = 'x'.repeat(1000000); // 1MB message
      
      expect(() => logger.info(largeMessage)).not.toThrow();
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
    });

    it('should handle null and undefined messages', () => {
      expect(() => logger.info(null as any)).not.toThrow();
      expect(() => logger.info(undefined as any)).not.toThrow();
      
      expect(mockConsoleLog).toHaveBeenCalledTimes(2);
    });

    it('should handle logging when correlation ID is not set', () => {
      clearCorrelationId();
      
      logger.info('Message without correlation ID');
      
      const logCall = mockConsoleLog.mock.calls[0][0];
      const parsed = JSON.parse(logCall);
      
      expect(parsed.correlationId).toBeDefined();
      expect(parsed.correlationId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
  });
});