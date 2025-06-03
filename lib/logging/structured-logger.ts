/**
 * Structured logger implementation with JSON formatting
 */

import type { 
  LogLevel, 
  LoggerConfig, 
  StructuredLogger, 
  LogEntry,
  BaseLogEntry,
  PerformanceLogEntry,
  PageViewLogEntry,
  CustomLogEntry,
  ErrorLogEntry
} from './types';
import { getCurrentCorrelationId, generateCorrelationId } from './correlation';

/**
 * Default logger configuration
 */
const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: 'info',
  enableConsole: true,
  enableRemote: false,
  maxEntries: 1000,
  flushInterval: 30000, // 30 seconds
};

/**
 * Log levels in order of severity
 */
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Sensitive field patterns to redact from logs
 */
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /key/i,
  /auth/i,
  /credential/i,
  /bearer/i,
];

/**
 * Sanitizes error objects for safe logging
 */
export function sanitizeError(error: any): {
  name: string;
  message: string;
  stack?: string;
  componentStack?: string;
} {
  if (error === null) {
    return { name: 'Unknown', message: 'null' };
  }
  
  if (error === undefined) {
    return { name: 'Unknown', message: 'undefined' };
  }
  
  if (error instanceof Error) {
    const result: any = {
      name: error.name,
      message: error.message,
    };
    
    if (error.stack) {
      result.stack = error.stack;
    }
    
    // Handle React error boundaries component stack
    if ('componentStack' in error && typeof error.componentStack === 'string') {
      result.componentStack = error.componentStack;
    }
    
    return result;
  }
  
  // Handle non-Error objects
  return {
    name: 'Unknown',
    message: String(error),
  };
}

/**
 * Sanitizes context objects to prevent sensitive data leakage
 */
export function sanitizeContext(context: any, visited = new Set<any>()): any {
  if (context === null || context === undefined) {
    return context;
  }
  
  // Handle circular references
  if (visited.has(context)) {
    return '[Circular Reference]';
  }
  
  if (typeof context === 'function') {
    return '[Function]';
  }
  
  if (typeof context !== 'object') {
    return context;
  }
  
  visited.add(context);
  
  try {
    if (Array.isArray(context)) {
      return context.map(item => sanitizeContext(item, visited));
    }
    
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(context)) {
      // Check if key matches sensitive patterns
      const isSensitive = SENSITIVE_PATTERNS.some(pattern => pattern.test(key));
      
      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeContext(value, visited);
      }
    }
    
    return sanitized;
  } finally {
    visited.delete(context);
  }
}

/**
 * Formats a log entry as JSON string
 */
export function formatLogEntry(entry: LogEntry): string {
  try {
    return JSON.stringify(entry);
  } catch (error) {
    // Fallback for non-serializable data
    return JSON.stringify({
      ...entry,
      error: '[Serialization Error]',
      originalError: String(error),
    });
  }
}

/**
 * Gets or generates correlation ID for log entry
 */
function getCorrelationId(): string {
  return getCurrentCorrelationId() || generateCorrelationId();
}

/**
 * Checks if a log level should be logged based on minimum level
 */
function shouldLog(level: LogLevel, minLevel: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[minLevel];
}

/**
 * Validates and normalizes logger configuration
 */
function normalizeConfig(config: Partial<LoggerConfig> = {}): LoggerConfig {
  const normalized = { ...DEFAULT_CONFIG, ...config };
  
  // Validate minLevel
  if (!LOG_LEVELS.hasOwnProperty(normalized.minLevel)) {
    normalized.minLevel = DEFAULT_CONFIG.minLevel;
  }
  
  // Validate maxEntries
  if (normalized.maxEntries < 1) {
    normalized.maxEntries = DEFAULT_CONFIG.maxEntries;
  }
  
  // Validate flushInterval
  if (normalized.flushInterval < 100) {
    normalized.flushInterval = DEFAULT_CONFIG.flushInterval;
  }
  
  return normalized;
}

/**
 * Structured logger implementation
 */
export class StructuredLoggerImpl implements StructuredLogger {
  private readonly config: LoggerConfig;
  private readonly entries: LogEntry[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = normalizeConfig(config);
    this.setupFlushTimer();
  }

  /**
   * Sets up automatic flushing timer
   */
  private setupFlushTimer(): void {
    if (this.config.flushInterval > 0) {
      this.flushTimer = setInterval(() => {
        this.flush().catch(error => {
          console.error('Auto-flush failed:', error);
        });
      }, this.config.flushInterval);
      
      // Don't keep the process alive
      if (this.flushTimer.unref) {
        this.flushTimer.unref();
      }
    }
  }

  /**
   * Creates a base log entry with common fields
   */
  private createBaseEntry(level: LogLevel, message: string): BaseLogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message: message || String(message),
      correlationId: getCorrelationId(),
    };
  }

  /**
   * Logs an entry to configured outputs
   */
  private log(entry: LogEntry): void {
    if (!shouldLog(entry.level, this.config.minLevel)) {
      return;
    }
    
    // Add to in-memory storage
    this.addToEntries(entry);
    
    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }
    
    // Remote logging would be handled here
    if (this.config.enableRemote) {
      this.scheduleRemoteLog(entry);
    }
  }

  /**
   * Adds entry to in-memory storage with size limit
   */
  private addToEntries(entry: LogEntry): void {
    this.entries.push(entry);
    
    // Maintain size limit
    if (this.entries.length > this.config.maxEntries) {
      this.entries.splice(0, this.entries.length - this.config.maxEntries);
    }
  }

  /**
   * Logs entry to console with appropriate method
   */
  private logToConsole(entry: LogEntry): void {
    const formatted = formatLogEntry(entry);
    
    switch (entry.level) {
      case 'debug':
      case 'info':
        console.log(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted);
        break;
    }
  }

  /**
   * Schedules remote logging (placeholder for future implementation)
   */
  private scheduleRemoteLog(entry: LogEntry): void {
    // In a real implementation, this would queue the entry for remote transmission
    // For now, this is a no-op
  }

  /**
   * Debug level logging
   */
  debug(message: string, context?: Record<string, unknown>): void {
    const entry: CustomLogEntry = {
      ...this.createBaseEntry('debug', message),
      type: 'custom',
      event: {
        name: 'debug_log',
        category: 'debugging',
        properties: context ? sanitizeContext(context) : undefined,
      },
    };
    
    if (context) {
      (entry as any).context = sanitizeContext(context);
    }
    
    this.log(entry);
  }

  /**
   * Info level logging
   */
  info(message: string, context?: Record<string, unknown>): void {
    const entry: CustomLogEntry = {
      ...this.createBaseEntry('info', message),
      type: 'custom',
      event: {
        name: 'info_log',
        category: 'information',
        properties: context ? sanitizeContext(context) : undefined,
      },
    };
    
    if (context) {
      (entry as any).context = sanitizeContext(context);
    }
    
    this.log(entry);
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: Record<string, unknown>): void {
    const entry: CustomLogEntry = {
      ...this.createBaseEntry('warn', message),
      type: 'custom',
      event: {
        name: 'warn_log',
        category: 'warning',
        properties: context ? sanitizeContext(context) : undefined,
      },
    };
    
    if (context) {
      (entry as any).context = sanitizeContext(context);
    }
    
    this.log(entry);
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    const entry: ErrorLogEntry = {
      ...this.createBaseEntry('error', message),
      type: 'error',
      error: sanitizeError(error),
      context: context ? sanitizeContext(context) : undefined,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    };
    
    this.log(entry);
  }

  /**
   * Performance metrics logging
   */
  logPerformance(entry: Omit<PerformanceLogEntry, 'timestamp' | 'level' | 'correlationId'>): void {
    const fullEntry: PerformanceLogEntry = {
      ...this.createBaseEntry('info', entry.message),
      ...entry,
    };
    
    this.log(fullEntry);
  }

  /**
   * Page view logging
   */
  logPageView(entry: Omit<PageViewLogEntry, 'timestamp' | 'level' | 'correlationId'>): void {
    const fullEntry: PageViewLogEntry = {
      ...this.createBaseEntry('info', entry.message),
      ...entry,
    };
    
    this.log(fullEntry);
  }

  /**
   * Custom event logging
   */
  logCustomEvent(entry: Omit<CustomLogEntry, 'timestamp' | 'level' | 'correlationId'>): void {
    const fullEntry: CustomLogEntry = {
      ...this.createBaseEntry('info', entry.message),
      ...entry,
    };
    
    this.log(fullEntry);
  }

  /**
   * Flushes all pending log entries
   */
  async flush(): Promise<void> {
    try {
      // In a real implementation, this would send all pending entries to remote logging
      // For now, just clear the entries
      if (this.config.enableRemote && this.entries.length > 0) {
        // Simulate remote logging delay
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // Clear entries after successful flush
      this.entries.splice(0);
    } catch (error) {
      // Log flush error but don't throw to prevent cascading failures
      console.error('Log flush failed:', error);
    }
  }

  /**
   * Gets current entries (for testing)
   */
  getEntries(): ReadonlyArray<LogEntry> {
    return [...this.entries];
  }

  /**
   * Cleanup method
   */
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
 * Creates a new structured logger instance
 */
export function createLogger(config?: Partial<LoggerConfig>): StructuredLogger {
  return new StructuredLoggerImpl(config);
}

/**
 * Default logger instance
 */
export const logger = createLogger();