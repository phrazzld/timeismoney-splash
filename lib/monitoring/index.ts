/**
 * Monitoring and observability system
 *
 * Provides comprehensive monitoring capabilities including:
 * - Remote error tracking and reporting
 * - Performance alerting for Core Web Vitals
 * - Remote logging with structured data transmission
 * - Configuration management for monitoring services
 *
 * @example
 * ```ts
 * import { initializeMonitoring, errorTrackingService, performanceAlerter } from '@/lib/monitoring';
 *
 * // Initialize all monitoring services
 * await initializeMonitoring();
 *
 * // Capture errors
 * await errorTrackingService.captureError(errorEvent);
 *
 * // Process performance metrics
 * await performanceAlerter.processMetric(metric);
 * ```
 */

// Core types
export type {
  MonitoringConfig,
  ErrorTrackingConfig,
  PerformanceAlertConfig,
  RemoteLoggingConfig,
  ErrorEvent,
  PerformanceAlert,
  AlertSeverity,
  RemoteLogEntry,
  LogBatch,
  ErrorTrackingService,
  CircuitBreaker,
  CircuitBreakerState,
} from './types';

// Error tracking
export {
  createErrorTrackingService,
  validateErrorTrackingConfig,
  createErrorEvent,
  sanitizeErrorForRemote,
  errorTrackingService,
} from './error-tracking';

// Performance alerts
export {
  createPerformanceAlerter,
  validatePerformanceAlertConfig,
  createPerformanceAlert,
  shouldTriggerAlert,
  calculateAlertSeverity,
  performanceAlerter,
} from './performance-alerts';

// Remote logging
export {
  createRemoteLogger,
  validateRemoteLoggingConfig,
  createLogBatch,
  createRemoteLogEntry,
  remoteLogger,
} from './remote-logging';

// Configuration
export {
  getMonitoringConfig,
  getMonitoringConfigWithOverrides,
  validateEnvironmentConfig,
  logMonitoringConfig,
  ENV_VARS,
} from './config';

// Re-export logger integration
export { logger, generateCorrelationId, getCurrentCorrelationId } from '@/lib/logging';

/**
 * Monitoring service status
 */
interface MonitoringStatus {
  errorTracking: { initialized: boolean; enabled: boolean };
  performanceAlerts: { initialized: boolean; enabled: boolean };
  remoteLogging: { initialized: boolean; enabled: boolean };
  configurationValid: boolean;
  lastInitialized?: string;
}

/**
 * Global monitoring state
 */
const monitoringStatus: MonitoringStatus = {
  errorTracking: { initialized: false, enabled: false },
  performanceAlerts: { initialized: false, enabled: false },
  remoteLogging: { initialized: false, enabled: false },
  configurationValid: false,
};

/**
 * Initialize all monitoring services
 */
export async function initializeMonitoring(
  configOverrides?: Partial<import('./types').MonitoringConfig>,
): Promise<void> {
  try {
    // Get configuration
    const { getMonitoringConfigWithOverrides, validateEnvironmentConfig } = await import(
      './config'
    );
    const { errorTrackingService } = await import('./error-tracking');
    const { performanceAlerter } = await import('./performance-alerts');
    const { remoteLogger } = await import('./remote-logging');

    const config = getMonitoringConfigWithOverrides(configOverrides);
    const validation = validateEnvironmentConfig();

    // Log configuration status
    if (process.env.NODE_ENV === 'development') {
      const { logMonitoringConfig } = await import('./config');
      logMonitoringConfig();
    }

    // Update configuration status
    monitoringStatus.configurationValid = validation.isValid;

    if (!validation.isValid && process.env.NODE_ENV === 'production') {
      console.error('Monitoring configuration validation failed:', validation.errors);
      throw new Error('Invalid monitoring configuration');
    }

    // Initialize services in parallel
    const initPromises: Promise<void>[] = [];

    // Initialize error tracking
    if (config.errorTracking.enabled) {
      initPromises.push(
        errorTrackingService
          .initialize(config.errorTracking)
          .then(() => {
            monitoringStatus.errorTracking = { initialized: true, enabled: true };
          })
          .catch((error) => {
            console.error('Failed to initialize error tracking:', error);
            monitoringStatus.errorTracking = { initialized: false, enabled: false };
          }),
      );
    }

    // Initialize performance alerts
    if (config.performanceAlerts.enabled) {
      initPromises.push(
        performanceAlerter
          .initialize(config.performanceAlerts)
          .then(() => {
            monitoringStatus.performanceAlerts = { initialized: true, enabled: true };
          })
          .catch((error) => {
            console.error('Failed to initialize performance alerts:', error);
            monitoringStatus.performanceAlerts = { initialized: false, enabled: false };
          }),
      );
    }

    // Initialize remote logging
    if (config.remoteLogging.enabled) {
      initPromises.push(
        remoteLogger
          .initialize(config.remoteLogging)
          .then(() => {
            monitoringStatus.remoteLogging = { initialized: true, enabled: true };
          })
          .catch((error) => {
            console.error('Failed to initialize remote logging:', error);
            monitoringStatus.remoteLogging = { initialized: false, enabled: false };
          }),
      );
    }

    // Wait for all initializations
    await Promise.allSettled(initPromises);

    // Update last initialized time
    monitoringStatus.lastInitialized = new Date().toISOString();

    console.log('Monitoring services initialized:', {
      errorTracking: monitoringStatus.errorTracking.enabled,
      performanceAlerts: monitoringStatus.performanceAlerts.enabled,
      remoteLogging: monitoringStatus.remoteLogging.enabled,
    });
  } catch (error) {
    console.error('Failed to initialize monitoring:', error);
    throw error;
  }
}

/**
 * Get current monitoring status
 */
export function getMonitoringStatus(): MonitoringStatus {
  return { ...monitoringStatus };
}

/**
 * Check if monitoring is fully initialized
 */
export function isMonitoringInitialized(): boolean {
  return (
    monitoringStatus.errorTracking.initialized ||
    monitoringStatus.performanceAlerts.initialized ||
    monitoringStatus.remoteLogging.initialized
  );
}

/**
 * Flush all monitoring services (useful for cleanup)
 */
export async function flushMonitoring(): Promise<void> {
  const flushPromises: Promise<void>[] = [];

  if (monitoringStatus.errorTracking.initialized) {
    const { errorTrackingService } = await import('./error-tracking');
    flushPromises.push(errorTrackingService.flush());
  }

  if (monitoringStatus.performanceAlerts.initialized) {
    const { performanceAlerter } = await import('./performance-alerts');
    flushPromises.push(performanceAlerter.flush());
  }

  if (monitoringStatus.remoteLogging.initialized) {
    const { remoteLogger } = await import('./remote-logging');
    flushPromises.push(remoteLogger.flush());
  }

  await Promise.allSettled(flushPromises);
}

/**
 * Convenience function to capture an error with enhanced context
 */
export async function captureError(
  error: Error,
  context?: {
    level?: 'error' | 'warning' | 'info';
    url?: string;
    userAgent?: string;
    user?: { id?: string; segment?: string };
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    if (!monitoringStatus.errorTracking.initialized) {
      return;
    }

    const { errorTrackingService, createErrorEvent } = await import('./error-tracking');

    const errorEvent = createErrorEvent(error, {
      level: context?.level || 'error',
      url: context?.url || (typeof window !== 'undefined' ? window.location.href : 'unknown'),
      userAgent:
        context?.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'),
      context: context?.extra,
      user: context?.user,
      tags: context?.tags,
    });

    await errorTrackingService.captureError(errorEvent);
  } catch (captureError) {
    console.warn('Failed to capture error:', captureError);
  }
}

/**
 * Convenience function to process a performance metric for alerting
 */
export async function processPerformanceMetric(
  metric: import('@/lib/performance').EnhancedMetric,
): Promise<void> {
  try {
    if (!monitoringStatus.performanceAlerts.initialized) {
      return;
    }

    const { performanceAlerter } = await import('./performance-alerts');
    await performanceAlerter.processMetric(metric);
  } catch (processError) {
    console.warn('Failed to process performance metric:', processError);
  }
}

/**
 * Convenience function to send a log entry to remote logging
 */
export async function sendLogEntry(
  logEntry: import('@/lib/logging/types').LogEntry,
): Promise<void> {
  try {
    if (!monitoringStatus.remoteLogging.initialized) {
      return;
    }

    const { remoteLogger } = await import('./remote-logging');
    await remoteLogger.sendLogEntry(logEntry);
  } catch (sendError) {
    console.warn('Failed to send log entry:', sendError);
  }
}
