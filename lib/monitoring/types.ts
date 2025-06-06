/**
 * Types for monitoring and observability system
 */

/**
 * Error tracking configuration
 */
export interface ErrorTrackingConfig {
  readonly enabled: boolean;
  readonly dsn?: string;
  readonly environment: 'development' | 'staging' | 'production';
  readonly sampleRate: number;
  readonly enableAutoSessionTracking: boolean;
  readonly enablePerformanceMonitoring: boolean;
  readonly maxBreadcrumbs: number;
  readonly beforeSend?: (_event: ErrorEvent) => ErrorEvent | null;
}

/**
 * Performance alert configuration
 */
export interface PerformanceAlertConfig {
  readonly enabled: boolean;
  readonly thresholds: {
    readonly lcp: { warning: number; error: number };
    readonly fid: { warning: number; error: number };
    readonly cls: { warning: number; error: number };
    readonly fcp: { warning: number; error: number };
  };
  readonly cooldownMinutes: number;
  readonly maxAlertsPerHour: number;
  readonly enableSlack: boolean;
  readonly enableEmail: boolean;
  readonly enableWebhook: boolean;
}

/**
 * Remote logging configuration
 */
export interface RemoteLoggingConfig {
  readonly enabled: boolean;
  readonly endpoint?: string;
  readonly apiKey?: string;
  readonly batchSize: number;
  readonly flushInterval: number;
  readonly maxRetries: number;
  readonly retryBackoffMs: number;
}

/**
 * Overall monitoring configuration
 */
export interface MonitoringConfig {
  readonly errorTracking: ErrorTrackingConfig;
  readonly performanceAlerts: PerformanceAlertConfig;
  readonly remoteLogging: RemoteLoggingConfig;
}

/**
 * Error event structure for external reporting
 */
export interface ErrorEvent {
  readonly id: string;
  readonly timestamp: string;
  readonly correlationId: string;
  readonly message: string;
  readonly level: 'error' | 'warning' | 'info';
  readonly error: {
    readonly name: string;
    readonly message: string;
    readonly stack?: string;
    readonly componentStack?: string;
  };
  readonly context?: Record<string, unknown>;
  readonly url: string;
  readonly userAgent: string;
  readonly user?: {
    readonly id?: string;
    readonly segment?: string;
  };
  readonly tags?: Record<string, string>;
  readonly fingerprint?: ReadonlyArray<string>;
}

/**
 * Performance alert severity levels
 */
export type AlertSeverity = 'warning' | 'error' | 'critical';

/**
 * Performance alert structure
 */
export interface PerformanceAlert {
  readonly id: string;
  readonly timestamp: string;
  readonly correlationId: string;
  readonly metric: string;
  readonly value: number;
  readonly threshold: number;
  readonly severity: AlertSeverity;
  readonly url: string;
  readonly userAgent: string;
  readonly context?: Record<string, unknown>;
}

/**
 * Alert delivery mechanism
 */
export interface AlertDelivery {
  readonly type: 'slack' | 'email' | 'webhook';
  readonly enabled: boolean;
  readonly endpoint?: string;
  readonly apiKey?: string;
  readonly template?: string;
}

/**
 * Alert delivery result
 */
export interface AlertDeliveryResult {
  readonly success: boolean;
  readonly timestamp: string;
  readonly type: AlertDelivery['type'];
  readonly error?: string;
  readonly retryAfter?: number;
}

/**
 * Remote log entry for transmission
 */
export interface RemoteLogEntry {
  readonly id: string;
  readonly timestamp: string;
  readonly correlationId: string;
  readonly level: 'debug' | 'info' | 'warn' | 'error';
  readonly message: string;
  readonly type: 'performance' | 'error' | 'pageview' | 'custom';
  readonly data: Record<string, unknown>;
  readonly source: 'client' | 'server';
  readonly environment: string;
}

/**
 * Batch of log entries for transmission
 */
export interface LogBatch {
  readonly id: string;
  readonly timestamp: string;
  readonly entries: ReadonlyArray<RemoteLogEntry>;
  readonly metadata: {
    readonly source: string;
    readonly version: string;
    readonly environment: string;
  };
}

/**
 * Remote logging result
 */
export interface RemoteLoggingResult {
  readonly success: boolean;
  readonly timestamp: string;
  readonly batchId: string;
  readonly entriesCount: number;
  readonly error?: string;
  readonly retryAfter?: number;
}

/**
 * Circuit breaker states
 */
export type CircuitBreakerState = 'closed' | 'open' | 'half-open';

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  readonly failureThreshold: number;
  readonly successThreshold: number;
  readonly timeoutMs: number;
  readonly resetTimeoutMs: number;
}

/**
 * Circuit breaker for external service calls
 */
export interface CircuitBreaker {
  readonly state: CircuitBreakerState;
  execute<T>(_fn: () => Promise<T>): Promise<T>;
  getMetrics(): {
    readonly totalCalls: number;
    readonly successfulCalls: number;
    readonly failedCalls: number;
    readonly lastFailureTime?: number;
  };
}

/**
 * Error tracking service interface
 */
export interface ErrorTrackingService {
  initialize(_config: ErrorTrackingConfig): Promise<void>;
  captureError(_error: ErrorEvent): Promise<void>;
  captureMessage(
    _message: string,
    _level: ErrorEvent['level'],
    _context?: Record<string, unknown>,
  ): Promise<void>;
  setUser(_user: NonNullable<ErrorEvent['user']>): void;
  setTags(_tags: Record<string, string>): void;
  addBreadcrumb(_message: string, _category: string, _data?: Record<string, unknown>): void;
  flush(): Promise<void>;
}
