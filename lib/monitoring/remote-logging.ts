/**
 * Remote logging system implementation
 */

import { sanitizeContext } from '@/lib/logging/structured-logger';
import type { LogEntry } from '@/lib/logging/types';
import type {
  RemoteLoggingConfig,
  RemoteLogEntry,
  LogBatch,
  RemoteLoggingResult,
  CircuitBreaker,
  CircuitBreakerState,
  CircuitBreakerConfig,
} from './types';

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
 * Validates remote logging configuration
 */
export function validateRemoteLoggingConfig(config: RemoteLoggingConfig): void {
  if (config.enabled) {
    if (!config.endpoint) {
      throw new Error('Endpoint is required when remote logging is enabled');
    }

    if (!config.apiKey) {
      throw new Error('API key is required when remote logging is enabled');
    }

    try {
      new URL(config.endpoint);
    } catch {
      throw new Error('Invalid endpoint URL format');
    }
  }

  if (config.batchSize <= 0) {
    throw new Error('Batch size must be positive');
  }

  if (config.flushInterval < 100) {
    throw new Error('Flush interval must be at least 100ms');
  }

  if (config.maxRetries < 0) {
    throw new Error('Max retries must be non-negative');
  }

  if (config.retryBackoffMs <= 0) {
    throw new Error('Retry backoff must be positive');
  }
}

/**
 * Creates a remote log entry from a structured log entry
 */
export function createRemoteLogEntry(
  logEntry: LogEntry,
  source: 'client' | 'server',
  environment: string,
): RemoteLogEntry {
  // Extract relevant data based on log entry type
  let data: Record<string, unknown> = {};

  switch (logEntry.type) {
    case 'performance':
      data = {
        metrics: logEntry.metrics,
        url: logEntry.url,
        userAgent: logEntry.userAgent,
      };
      break;

    case 'error':
      data = {
        error: logEntry.error,
        context: logEntry.context,
        url: logEntry.url,
        userAgent: logEntry.userAgent,
      };
      break;

    case 'pageview':
      data = {
        page: logEntry.page,
        session: logEntry.session,
        user: logEntry.user,
      };
      break;

    case 'custom':
      data = {
        event: logEntry.event,
      };
      break;
  }

  // Sanitize the data
  const sanitizedData = sanitizeContext(data);

  return {
    id: generateUUID(),
    timestamp: logEntry.timestamp,
    correlationId: logEntry.correlationId,
    level: logEntry.level,
    message: logEntry.message,
    type: logEntry.type,
    data: sanitizedData,
    source,
    environment,
  };
}

/**
 * Creates a log batch for transmission
 */
export function createLogBatch(
  entries: ReadonlyArray<RemoteLogEntry>,
  metadata: LogBatch['metadata'],
): LogBatch {
  return {
    id: generateUUID(),
    timestamp: new Date().toISOString(),
    entries,
    metadata,
  };
}

/**
 * Circuit breaker implementation
 */
class CircuitBreakerImpl implements CircuitBreaker {
  private _state: CircuitBreakerState = 'closed';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime?: number;
  private nextAttemptTime = 0;

  constructor(private config: CircuitBreakerConfig) {}

  get state(): CircuitBreakerState {
    return this._state;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this._state === 'open') {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error('Circuit breaker is open');
      }
      // Try to transition to half-open
      this._state = 'half-open';
      this.successCount = 0;
    }

    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), this.config.timeoutMs),
        ),
      ]);

      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this._state === 'half-open') {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this._state = 'closed';
        this.failureCount = 0;
      }
    } else {
      this.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this._state === 'half-open' || this.failureCount >= this.config.failureThreshold) {
      this._state = 'open';
      this.nextAttemptTime = Date.now() + this.config.resetTimeoutMs;
    }
  }

  getMetrics(): {
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    lastFailureTime: Date | null;
  } {
    return {
      totalCalls: this.failureCount + this.successCount,
      successfulCalls: this.successCount,
      failedCalls: this.failureCount,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

/**
 * Transmission metrics
 */
interface TransmissionMetrics {
  totalBatches: number;
  totalEntries: number;
  successfulTransmissions: number;
  failedTransmissions: number;
  lastTransmissionTime?: number;
  averageBatchSize: number;
}

/**
 * Remote logger interface
 */
interface RemoteLogger {
  initialize(config: RemoteLoggingConfig): Promise<void>;
  sendLogEntry(logEntry: LogEntry): Promise<void>;
  flush(): Promise<void>;
  getTransmissionMetrics(): TransmissionMetrics;
}

/**
 * Remote logger implementation
 */
class RemoteLoggerImpl implements RemoteLogger {
  private config?: RemoteLoggingConfig;
  private buffer: RemoteLogEntry[] = [];
  private httpClient?: unknown;
  private circuitBreaker?: CircuitBreaker;
  private isInitialized = false;
  private flushTimer?: NodeJS.Timeout;
  private metrics: TransmissionMetrics = {
    totalBatches: 0,
    totalEntries: 0,
    successfulTransmissions: 0,
    failedTransmissions: 0,
    averageBatchSize: 0,
  };

  async initialize(config: RemoteLoggingConfig): Promise<void> {
    validateRemoteLoggingConfig(config);
    this.config = config;

    if (!config.enabled) {
      return;
    }

    try {
      // In a real implementation, this would set up HTTP client
      // For testing, we use a mock client if available
      if ((global as unknown).__TEST_HTTP_CLIENT__) {
        this.httpClient = (global as unknown).__TEST_HTTP_CLIENT__;
      } else {
        // In production, this would be a real HTTP client
        console.warn('HTTP client not available - running in development mode');
        return;
      }

      // Initialize circuit breaker
      this.circuitBreaker = new CircuitBreakerImpl({
        failureThreshold: 5,
        successThreshold: 3,
        timeoutMs: 10000,
        resetTimeoutMs: 60000,
      });

      this.isInitialized = true;

      // Set up flush timer
      if (config.flushInterval > 0) {
        this.flushTimer = setInterval(() => {
          this.flush().catch((error) => {
            console.warn('Auto-flush failed:', error);
          });
        }, config.flushInterval);

        if (this.flushTimer.unref) {
          this.flushTimer.unref();
        }
      }
    } catch (error) {
      console.error('Failed to initialize remote logger:', error);
    }
  }

  async sendLogEntry(logEntry: LogEntry): Promise<void> {
    if (!this.config?.enabled || !this.isInitialized) {
      return;
    }

    try {
      // Convert to remote log entry
      const remoteEntry = createRemoteLogEntry(
        logEntry,
        'client',
        this.config.endpoint?.includes('localhost') ? 'development' : 'production',
      );

      // Add to buffer
      this.buffer.push(remoteEntry);

      // Check if batch size is reached
      if (this.buffer.length >= this.config.batchSize) {
        await this.flush();
      }
    } catch (error) {
      console.warn('Failed to send log entry:', error);
    }
  }

  async flush(): Promise<void> {
    if (!this.config?.enabled || !this.isInitialized || this.buffer.length === 0) {
      return;
    }

    const batch = createLogBatch(this.buffer, {
      source: 'timeismoney-splash',
      version: '1.0.0',
      environment: this.config.endpoint?.includes('localhost') ? 'development' : 'production',
    });

    // Clear buffer immediately to prevent duplicate sends
    const entriesCount = this.buffer.length;
    this.buffer = [];

    try {
      await this.transmitBatch(batch);

      // Update success metrics
      this.metrics.totalBatches++;
      this.metrics.totalEntries += entriesCount;
      this.metrics.successfulTransmissions++;
      this.metrics.lastTransmissionTime = Date.now();
      this.updateAverageBatchSize();
    } catch (error) {
      console.warn('Failed to transmit log batch:', error);
      this.metrics.failedTransmissions++;

      // In a real implementation, failed entries might be queued for retry
      // For now, we just log the failure
    }
  }

  private async transmitBatch(batch: LogBatch): Promise<RemoteLoggingResult> {
    if (!this.config || !this.httpClient || !this.circuitBreaker) {
      throw new Error('Remote logger not properly initialized');
    }

    const result = await this.circuitBreaker.execute(async () => {
      return await this.sendWithRetry(batch);
    });

    return result;
  }

  private async sendWithRetry(batch: LogBatch): Promise<RemoteLoggingResult> {
    if (!this.config || !this.httpClient) {
      throw new Error('Remote logger not properly initialized');
    }

    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt <= this.config.maxRetries) {
      try {
        const response = await this.httpClient.post(this.config.endpoint, batch, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.apiKey}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return {
          success: true,
          timestamp: new Date().toISOString(),
          batchId: batch.id,
          entriesCount: batch.entries.length,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        attempt++;

        if (attempt <= this.config.maxRetries) {
          // Exponential backoff
          const backoffMs = this.config.retryBackoffMs * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }
      }
    }

    // All retries exhausted
    return {
      success: false,
      timestamp: new Date().toISOString(),
      batchId: batch.id,
      entriesCount: batch.entries.length,
      error: lastError?.message || 'Unknown error',
    };
  }

  private updateAverageBatchSize(): void {
    if (this.metrics.totalBatches > 0) {
      this.metrics.averageBatchSize = this.metrics.totalEntries / this.metrics.totalBatches;
    }
  }

  getTransmissionMetrics(): TransmissionMetrics {
    return { ...this.metrics };
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }

    // Final flush attempt
    this.flush().catch(() => {
      // Ignore errors during cleanup
    });
  }
}

/**
 * Creates a new remote logger instance
 */
export function createRemoteLogger(): RemoteLogger {
  return new RemoteLoggerImpl();
}

/**
 * Global remote logger instance
 */
export const remoteLogger = createRemoteLogger();
