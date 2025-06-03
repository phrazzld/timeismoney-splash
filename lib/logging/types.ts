/**
 * Types for structured logging system
 */

/**
 * Log levels in order of severity
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Base log entry structure
 */
export interface BaseLogEntry {
  readonly timestamp: string;
  readonly level: LogLevel;
  readonly message: string;
  readonly correlationId: string;
}

/**
 * Performance log entry for Core Web Vitals
 */
export interface PerformanceLogEntry extends BaseLogEntry {
  readonly type: 'performance';
  readonly metrics: {
    readonly name: string;
    readonly value: number;
    readonly rating: 'good' | 'needs-improvement' | 'poor';
    readonly delta?: number;
  };
  readonly url: string;
  readonly userAgent: string;
}

/**
 * Error log entry for component and application errors
 */
export interface ErrorLogEntry extends BaseLogEntry {
  readonly type: 'error';
  readonly error: {
    readonly name: string;
    readonly message: string;
    readonly stack?: string;
    readonly componentStack?: string;
  };
  readonly context?: Record<string, unknown>;
  readonly url: string;
  readonly userAgent: string;
}

/**
 * Page view log entry
 */
export interface PageViewLogEntry extends BaseLogEntry {
  readonly type: 'pageview';
  readonly page: {
    readonly path: string;
    readonly title: string;
    readonly referrer?: string;
  };
  readonly session: {
    readonly id: string;
    readonly isNewSession: boolean;
  };
  readonly user?: {
    readonly id?: string;
    readonly segment?: string;
  };
}

/**
 * Custom event log entry
 */
export interface CustomLogEntry extends BaseLogEntry {
  readonly type: 'custom';
  readonly event: {
    readonly name: string;
    readonly category: string;
    readonly properties?: Record<string, unknown>;
  };
}

/**
 * Union type for all log entry types
 */
export type LogEntry = PerformanceLogEntry | ErrorLogEntry | PageViewLogEntry | CustomLogEntry;

/**
 * Logger configuration options
 */
export interface LoggerConfig {
  readonly minLevel: LogLevel;
  readonly enableConsole: boolean;
  readonly enableRemote: boolean;
  readonly remoteEndpoint?: string;
  readonly maxEntries: number;
  readonly flushInterval: number;
}

/**
 * Correlation ID generator interface
 */
export interface CorrelationIdGenerator {
  generate(): string;
  validate(id: string): boolean;
}

/**
 * Logger interface
 */
export interface StructuredLogger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error, context?: Record<string, unknown>): void;
  logPerformance(entry: Omit<PerformanceLogEntry, 'timestamp' | 'level' | 'correlationId'>): void;
  logPageView(entry: Omit<PageViewLogEntry, 'timestamp' | 'level' | 'correlationId'>): void;
  logCustomEvent(entry: Omit<CustomLogEntry, 'timestamp' | 'level' | 'correlationId'>): void;
  flush(): Promise<void>;
}