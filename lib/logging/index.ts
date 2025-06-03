/**
 * Structured logging system with correlation ID support
 * 
 * This module provides a comprehensive logging solution with:
 * - Structured JSON logging
 * - Correlation ID management for request tracing
 * - Automatic sanitization of sensitive data
 * - Performance monitoring integration
 * - Error boundary integration
 * 
 * @example
 * ```ts
 * import { logger, generateCorrelationId, setCorrelationId } from '@/lib/logging';
 * 
 * // Set correlation ID for request tracing
 * const correlationId = generateCorrelationId();
 * setCorrelationId(correlationId);
 * 
 * // Log structured data
 * logger.info('User action completed', { userId: '123', action: 'login' });
 * 
 * // Log performance metrics
 * logger.logPerformance({
 *   type: 'performance',
 *   message: 'LCP measured',
 *   metrics: { name: 'LCP', value: 1500, rating: 'good' },
 *   url: window.location.href,
 *   userAgent: navigator.userAgent,
 * });
 * ```
 */

// Core types
export type {
  LogLevel,
  LogEntry,
  BaseLogEntry,
  PerformanceLogEntry,
  ErrorLogEntry,
  PageViewLogEntry,
  CustomLogEntry,
  LoggerConfig,
  StructuredLogger,
  CorrelationIdGenerator,
} from './types';

// Correlation ID management
export {
  generateCorrelationId,
  getCurrentCorrelationId,
  setCorrelationId,
  clearCorrelationId,
  withCorrelationId,
  validateCorrelationId,
  CorrelationIdManager,
} from './correlation';

// Structured logger
export {
  createLogger,
  logger,
  StructuredLoggerImpl,
  sanitizeError,
  sanitizeContext,
  formatLogEntry,
} from './structured-logger';

// Convenience re-exports
export { logger as default } from './structured-logger';