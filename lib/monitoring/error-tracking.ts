/**
 * Error tracking service implementation
 */

import { getCurrentCorrelationId, generateCorrelationId } from '@/lib/logging/correlation';
import { sanitizeContext } from '@/lib/logging/structured-logger';
import type { ErrorTrackingConfig, ErrorEvent, ErrorTrackingService } from './types';

/**
 * UUID v4 generator
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Validates error tracking configuration
 */
export function validateErrorTrackingConfig(config: ErrorTrackingConfig): void {
  if (config.enabled && config.dsn) {
    // Basic DSN format validation
    if (!config.dsn.startsWith('https://') || !config.dsn.includes('@')) {
      throw new Error('Invalid DSN format');
    }
  }

  if (config.sampleRate < 0 || config.sampleRate > 1) {
    throw new Error('Sample rate must be between 0 and 1');
  }

  if (!['development', 'staging', 'production'].includes(config.environment)) {
    throw new Error('Environment must be development, staging, or production');
  }

  if (config.maxBreadcrumbs < 0) {
    throw new Error('Max breadcrumbs must be positive');
  }
}

/**
 * Creates error fingerprint for grouping similar errors
 */
function createErrorFingerprint(error: ErrorEvent['error']): string[] {
  const fingerprint: string[] = [];

  // Add error name
  if (error.name) {
    fingerprint.push(error.name);
  }

  // Add normalized error message (remove dynamic parts)
  if (error.message) {
    const normalizedMessage = error.message
      .replace(/\d+/g, 'N') // Replace numbers with N
      .replace(/["'][^"']*["']/g, 'STRING') // Replace string literals
      .replace(/[a-f0-9-]{36}/g, 'UUID'); // Replace UUIDs
    fingerprint.push(normalizedMessage);
  }

  // Add stack trace location (first meaningful line)
  if (error.stack) {
    const stackLines = error.stack.split('\n');
    for (const line of stackLines) {
      if (line.includes('.js:') || line.includes('.ts:')) {
        const match = line.match(/([^/\\]+\.(js|ts)):(\d+)/);
        if (match) {
          fingerprint.push(`${match[1]}:${match[3]}`);
          break;
        }
      }
    }
  }

  return fingerprint;
}

/**
 * Creates an error event from Error object
 */
export function createErrorEvent(
  error: Error,
  options: {
    url: string;
    userAgent: string;
    level: ErrorEvent['level'];
    context?: Record<string, unknown>;
    user?: ErrorEvent['user'];
    tags?: Record<string, string>;
  },
): ErrorEvent {
  const errorData = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    componentStack: (error as Error & { componentStack?: string }).componentStack,
  };

  const errorEvent: ErrorEvent = {
    id: generateUUID(),
    timestamp: new Date().toISOString(),
    correlationId: getCurrentCorrelationId() || generateCorrelationId(),
    message: error.message,
    level: options.level,
    error: errorData,
    url: options.url,
    userAgent: options.userAgent,
    context: options.context,
    user: options.user,
    tags: options.tags,
    fingerprint: createErrorFingerprint(errorData),
  };

  return errorEvent;
}

/**
 * Sanitizes error event for remote transmission
 */
export function sanitizeErrorForRemote(errorEvent: ErrorEvent): ErrorEvent {
  return {
    ...errorEvent,
    context: errorEvent.context
      ? (sanitizeContext(errorEvent.context) as Record<string, unknown>)
      : undefined,
  };
}

/**
 * Rate limiter for error reporting
 */
class ErrorRateLimiter {
  private counts = new Map<string, { count: number; resetTime: number }>();
  private readonly maxPerMinute = 5;
  private readonly windowMs = 60000; // 1 minute

  shouldAllow(fingerprint: string): boolean {
    const now = Date.now();
    const key = fingerprint;
    const bucket = this.counts.get(key);

    if (!bucket || now > bucket.resetTime) {
      this.counts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (bucket.count >= this.maxPerMinute) {
      return false;
    }

    bucket.count++;
    return true;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, bucket] of this.counts.entries()) {
      if (now > bucket.resetTime) {
        this.counts.delete(key);
      }
    }
  }
}

/**
 * Error tracking service implementation
 */
class ErrorTrackingServiceImpl implements ErrorTrackingService {
  private config?: ErrorTrackingConfig;
  private externalService?: unknown;
  private isInitialized = false;
  private rateLimiter = new ErrorRateLimiter();
  private cleanupTimer?: NodeJS.Timeout;

  async initialize(config: ErrorTrackingConfig): Promise<void> {
    validateErrorTrackingConfig(config);
    this.config = config;

    if (!config.enabled) {
      return;
    }

    try {
      // In a real implementation, this would initialize the external service (e.g., Sentry)
      // For testing, we use a mock service if available
      const globalWithTest = global as unknown as { __TEST_ERROR_SERVICE__?: unknown };
      if (globalWithTest.__TEST_ERROR_SERVICE__) {
        this.externalService = globalWithTest.__TEST_ERROR_SERVICE__;
      } else {
        // In production, this would be something like:
        // this.externalService = await import('@sentry/nextjs');
        console.warn('Error tracking service not available - running in development mode');
        return;
      }

      const service = this.externalService as {
        init: (config: Record<string, unknown>) => Promise<void>;
      };
      await service.init({
        dsn: config.dsn,
        environment: config.environment,
        sampleRate: config.sampleRate,
        autoSessionTracking: config.enableAutoSessionTracking,
        integrations: config.enablePerformanceMonitoring ? ['BrowserTracing'] : [],
        maxBreadcrumbs: config.maxBreadcrumbs,
        beforeSend: config.beforeSend,
      });

      this.isInitialized = true;

      // Set up cleanup timer for rate limiter
      this.cleanupTimer = setInterval(() => {
        this.rateLimiter.cleanup();
      }, 300000); // Clean up every 5 minutes

      if (this.cleanupTimer.unref) {
        this.cleanupTimer.unref();
      }
    } catch (error) {
      console.error('Failed to initialize error tracking service:', error);
    }
  }

  async captureError(errorEvent: ErrorEvent): Promise<void> {
    if (!this.config?.enabled || !this.isInitialized || !this.externalService) {
      return;
    }

    try {
      // Rate limiting
      const fingerprintKey = errorEvent.fingerprint?.join('|') || errorEvent.message;
      if (!this.rateLimiter.shouldAllow(fingerprintKey)) {
        return;
      }

      // Sanitize the error event
      const sanitizedEvent = sanitizeErrorForRemote(errorEvent);

      // Send to external service
      const service = this.externalService as {
        captureException: (event: unknown) => Promise<void>;
      };
      await service.captureException(sanitizedEvent);
    } catch (error) {
      // Don't throw errors from error tracking to avoid cascading failures
      console.warn('Failed to capture error:', error);
    }
  }

  async captureMessage(
    message: string,
    level: ErrorEvent['level'],
    context?: Record<string, unknown>,
  ): Promise<void> {
    if (!this.config?.enabled || !this.isInitialized || !this.externalService) {
      return;
    }

    try {
      const service = this.externalService as {
        captureMessage: (
          message: string,
          level: string,
          options: Record<string, unknown>,
        ) => Promise<void>;
      };
      await service.captureMessage(message, level, {
        extra: context ? sanitizeContext(context) : undefined,
      });
    } catch (error) {
      console.warn('Failed to capture message:', error);
    }
  }

  setUser(user: NonNullable<ErrorEvent['user']>): void {
    if (!this.config?.enabled || !this.isInitialized || !this.externalService) {
      return;
    }

    try {
      const service = this.externalService as { setUser: (user: Record<string, unknown>) => void };
      service.setUser(user);
    } catch (error) {
      console.warn('Failed to set user context:', error);
    }
  }

  setTags(tags: Record<string, string>): void {
    if (!this.config?.enabled || !this.isInitialized || !this.externalService) {
      return;
    }

    try {
      const service = this.externalService as { setTags: (tags: Record<string, unknown>) => void };
      service.setTags(tags);
    } catch (error) {
      console.warn('Failed to set tags:', error);
    }
  }

  addBreadcrumb(message: string, category: string, data?: Record<string, unknown>): void {
    if (!this.config?.enabled || !this.isInitialized || !this.externalService) {
      return;
    }

    try {
      const service = this.externalService as {
        addBreadcrumb: (breadcrumb: Record<string, unknown>) => void;
      };
      service.addBreadcrumb({
        message,
        category,
        data: data ? sanitizeContext(data) : undefined,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.warn('Failed to add breadcrumb:', error);
    }
  }

  async flush(): Promise<void> {
    if (!this.config?.enabled || !this.isInitialized || !this.externalService) {
      return;
    }

    try {
      const service = this.externalService as { flush: () => Promise<void> };
      await service.flush();
    } catch (error) {
      console.warn('Failed to flush error tracking service:', error);
    }
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }

    this.flush().catch(() => {
      // Ignore errors during cleanup
    });
  }
}

/**
 * Creates a new error tracking service instance
 */
export function createErrorTrackingService(): ErrorTrackingService {
  return new ErrorTrackingServiceImpl();
}

/**
 * Global error tracking service instance
 */
export const errorTrackingService = createErrorTrackingService();
