/**
 * Monitoring configuration management
 */

import type { 
  MonitoringConfig, 
  ErrorTrackingConfig, 
  PerformanceAlertConfig, 
  RemoteLoggingConfig 
} from './types';

/**
 * Environment variable names for monitoring configuration
 */
const ENV_VARS = {
  // Error tracking
  SENTRY_DSN: 'NEXT_PUBLIC_SENTRY_DSN',
  SENTRY_ENVIRONMENT: 'SENTRY_ENVIRONMENT',
  SENTRY_SAMPLE_RATE: 'SENTRY_SAMPLE_RATE',
  
  // Performance alerts
  ALERT_WEBHOOK_URL: 'MONITORING_WEBHOOK_URL',
  ALERT_EMAIL_ENDPOINT: 'ALERT_EMAIL_ENDPOINT',
  SLACK_WEBHOOK_URL: 'SLACK_WEBHOOK_URL',
  ALERT_COOLDOWN_MINUTES: 'ALERT_COOLDOWN_MINUTES',
  
  // Remote logging
  LOGGING_ENDPOINT: 'LOGGING_ENDPOINT',
  LOGGING_API_KEY: 'LOGGING_API_KEY',
  LOGGING_BATCH_SIZE: 'LOGGING_BATCH_SIZE',
  LOGGING_FLUSH_INTERVAL: 'LOGGING_FLUSH_INTERVAL',
} as const;

/**
 * Default error tracking configuration
 */
function getDefaultErrorTrackingConfig(): ErrorTrackingConfig {
  const environment = process.env.NODE_ENV || 'development';
  
  return {
    enabled: environment === 'production' && Boolean(process.env[ENV_VARS.SENTRY_DSN]),
    dsn: process.env[ENV_VARS.SENTRY_DSN],
    environment: (process.env[ENV_VARS.SENTRY_ENVIRONMENT] || environment) as ErrorTrackingConfig['environment'],
    sampleRate: parseFloat(process.env[ENV_VARS.SENTRY_SAMPLE_RATE] || '1.0'),
    enableAutoSessionTracking: true,
    enablePerformanceMonitoring: true,
    maxBreadcrumbs: 100,
  };
}

/**
 * Default performance alert configuration
 */
function getDefaultPerformanceAlertConfig(): PerformanceAlertConfig {
  const environment = process.env.NODE_ENV || 'development';
  
  return {
    enabled: environment === 'production' && (
      Boolean(process.env[ENV_VARS.SLACK_WEBHOOK_URL]) ||
      Boolean(process.env[ENV_VARS.ALERT_EMAIL_ENDPOINT]) ||
      Boolean(process.env[ENV_VARS.ALERT_WEBHOOK_URL])
    ),
    thresholds: {
      lcp: { warning: 2500, error: 4000 },
      fid: { warning: 100, error: 300 },
      cls: { warning: 0.1, error: 0.25 },
      fcp: { warning: 1800, error: 3000 },
    },
    cooldownMinutes: parseInt(process.env[ENV_VARS.ALERT_COOLDOWN_MINUTES] || '15', 10),
    maxAlertsPerHour: 10,
    enableSlack: Boolean(process.env[ENV_VARS.SLACK_WEBHOOK_URL]),
    enableEmail: Boolean(process.env[ENV_VARS.ALERT_EMAIL_ENDPOINT]),
    enableWebhook: Boolean(process.env[ENV_VARS.ALERT_WEBHOOK_URL]),
  };
}

/**
 * Default remote logging configuration
 */
function getDefaultRemoteLoggingConfig(): RemoteLoggingConfig {
  const environment = process.env.NODE_ENV || 'development';
  
  return {
    enabled: environment === 'production' && Boolean(process.env[ENV_VARS.LOGGING_ENDPOINT]),
    endpoint: process.env[ENV_VARS.LOGGING_ENDPOINT],
    apiKey: process.env[ENV_VARS.LOGGING_API_KEY],
    batchSize: parseInt(process.env[ENV_VARS.LOGGING_BATCH_SIZE] || '50', 10),
    flushInterval: parseInt(process.env[ENV_VARS.LOGGING_FLUSH_INTERVAL] || '30000', 10),
    maxRetries: 3,
    retryBackoffMs: 1000,
  };
}

/**
 * Validates environment variable configuration
 */
export function validateEnvironmentConfig(): { 
  isValid: boolean; 
  errors: string[]; 
  warnings: string[]; 
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const environment = process.env.NODE_ENV || 'development';

  // Only validate production configuration in production
  if (environment === 'production') {
    // Error tracking validation
    if (process.env[ENV_VARS.SENTRY_DSN]) {
      if (!process.env[ENV_VARS.SENTRY_DSN].includes('@') || 
          !process.env[ENV_VARS.SENTRY_DSN].startsWith('https://')) {
        errors.push('Invalid Sentry DSN format');
      }
    } else {
      warnings.push('Sentry DSN not configured - error tracking disabled');
    }

    // Sample rate validation
    if (process.env[ENV_VARS.SENTRY_SAMPLE_RATE]) {
      const sampleRate = parseFloat(process.env[ENV_VARS.SENTRY_SAMPLE_RATE]);
      if (isNaN(sampleRate) || sampleRate < 0 || sampleRate > 1) {
        errors.push('Sentry sample rate must be between 0 and 1');
      }
    }

    // Alert configuration validation
    const hasAlertConfig = Boolean(
      process.env[ENV_VARS.SLACK_WEBHOOK_URL] ||
      process.env[ENV_VARS.ALERT_EMAIL_ENDPOINT] ||
      process.env[ENV_VARS.ALERT_WEBHOOK_URL]
    );

    if (!hasAlertConfig) {
      warnings.push('No alert delivery methods configured - performance alerts disabled');
    }

    // Webhook URL validation
    if (process.env[ENV_VARS.SLACK_WEBHOOK_URL] && 
        !process.env[ENV_VARS.SLACK_WEBHOOK_URL].startsWith('https://')) {
      errors.push('Slack webhook URL must use HTTPS');
    }

    if (process.env[ENV_VARS.ALERT_WEBHOOK_URL] && 
        !process.env[ENV_VARS.ALERT_WEBHOOK_URL].startsWith('https://')) {
      errors.push('Alert webhook URL must use HTTPS');
    }

    // Remote logging validation
    if (process.env[ENV_VARS.LOGGING_ENDPOINT]) {
      if (!process.env[ENV_VARS.LOGGING_ENDPOINT].startsWith('https://')) {
        errors.push('Logging endpoint must use HTTPS');
      }
      
      if (!process.env[ENV_VARS.LOGGING_API_KEY]) {
        errors.push('Logging API key is required when endpoint is configured');
      }
    } else {
      warnings.push('Remote logging endpoint not configured - logs will only be local');
    }

    // Numeric configuration validation
    if (process.env[ENV_VARS.ALERT_COOLDOWN_MINUTES]) {
      const cooldown = parseInt(process.env[ENV_VARS.ALERT_COOLDOWN_MINUTES], 10);
      if (isNaN(cooldown) || cooldown <= 0) {
        errors.push('Alert cooldown minutes must be a positive number');
      }
    }

    if (process.env[ENV_VARS.LOGGING_BATCH_SIZE]) {
      const batchSize = parseInt(process.env[ENV_VARS.LOGGING_BATCH_SIZE], 10);
      if (isNaN(batchSize) || batchSize <= 0) {
        errors.push('Logging batch size must be a positive number');
      }
    }

    if (process.env[ENV_VARS.LOGGING_FLUSH_INTERVAL]) {
      const flushInterval = parseInt(process.env[ENV_VARS.LOGGING_FLUSH_INTERVAL], 10);
      if (isNaN(flushInterval) || flushInterval < 100) {
        errors.push('Logging flush interval must be at least 100ms');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Gets the complete monitoring configuration from environment variables
 */
export function getMonitoringConfig(): MonitoringConfig {
  return {
    errorTracking: getDefaultErrorTrackingConfig(),
    performanceAlerts: getDefaultPerformanceAlertConfig(),
    remoteLogging: getDefaultRemoteLoggingConfig(),
  };
}

/**
 * Gets monitoring configuration with overrides
 */
export function getMonitoringConfigWithOverrides(
  overrides: Partial<MonitoringConfig> = {}
): MonitoringConfig {
  const defaultConfig = getMonitoringConfig();
  
  return {
    errorTracking: { ...defaultConfig.errorTracking, ...overrides.errorTracking },
    performanceAlerts: { ...defaultConfig.performanceAlerts, ...overrides.performanceAlerts },
    remoteLogging: { ...defaultConfig.remoteLogging, ...overrides.remoteLogging },
  };
}

/**
 * Logging configuration for debugging
 */
export function logMonitoringConfig(): void {
  const config = getMonitoringConfig();
  const validation = validateEnvironmentConfig();
  
  console.log('Monitoring Configuration:');
  console.log('- Error Tracking:', config.errorTracking.enabled ? 'ENABLED' : 'DISABLED');
  console.log('- Performance Alerts:', config.performanceAlerts.enabled ? 'ENABLED' : 'DISABLED');
  console.log('- Remote Logging:', config.remoteLogging.enabled ? 'ENABLED' : 'DISABLED');
  
  if (validation.warnings.length > 0) {
    console.warn('Configuration Warnings:', validation.warnings);
  }
  
  if (validation.errors.length > 0) {
    console.error('Configuration Errors:', validation.errors);
  }
}

/**
 * Environment variable names export for reference
 */
export { ENV_VARS };