/**
 * Performance alerting system implementation
 */

import { getCurrentCorrelationId, generateCorrelationId } from '@/lib/logging/correlation';
import type { EnhancedMetric } from '@/lib/performance/types';
import type { 
  PerformanceAlertConfig, 
  PerformanceAlert, 
  AlertSeverity 
} from './types';

/**
 * UUID v4 generator
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Validates performance alert configuration
 */
export function validatePerformanceAlertConfig(config: PerformanceAlertConfig): void {
  if (config.enabled) {
    // Check that at least one delivery method is enabled
    if (!config.enableSlack && !config.enableEmail && !config.enableWebhook) {
      throw new Error('At least one delivery method must be enabled when alerting is enabled');
    }
  }

  // Validate thresholds
  for (const [metric, threshold] of Object.entries(config.thresholds)) {
    if (threshold.warning >= threshold.error) {
      throw new Error(`Warning threshold must be less than error threshold for ${metric}`);
    }
    if (threshold.warning < 0 || threshold.error < 0) {
      throw new Error(`Thresholds must be positive for ${metric}`);
    }
  }

  if (config.cooldownMinutes <= 0) {
    throw new Error('Cooldown period must be positive');
  }

  if (config.maxAlertsPerHour < 1) {
    throw new Error('Max alerts per hour must be at least 1');
  }
}

/**
 * Calculates alert severity based on metric value and thresholds
 */
export function calculateAlertSeverity(
  metricName: string,
  value: number,
  thresholds: PerformanceAlertConfig['thresholds']
): AlertSeverity | null {
  const threshold = thresholds[metricName as keyof typeof thresholds];
  if (!threshold) {
    return null;
  }

  if (value < threshold.warning) {
    return null; // No alert needed
  }

  if (value >= threshold.error * 2) {
    return 'critical'; // Extreme degradation
  }

  if (value >= threshold.error) {
    return 'error';
  }

  return 'warning';
}

/**
 * Determines if an alert should be triggered for a metric
 */
export function shouldTriggerAlert(
  metric: EnhancedMetric,
  config: PerformanceAlertConfig,
  cooldownState: Map<string, number>,
  hourlyCount?: Map<number, number>
): boolean {
  if (!config.enabled) {
    return false;
  }

  // Check if metric exceeds threshold
  const severity = calculateAlertSeverity(metric.name, metric.value, config.thresholds);
  if (!severity) {
    return false;
  }

  // Check cooldown period
  const lastAlertTime = cooldownState.get(metric.name);
  const now = Date.now();
  const cooldownMs = config.cooldownMinutes * 60 * 1000;

  if (lastAlertTime && (now - lastAlertTime) < cooldownMs) {
    return false;
  }

  // Check hourly rate limit
  if (hourlyCount) {
    const hourKey = Math.floor(now / (60 * 60 * 1000));
    const currentHourCount = hourlyCount.get(hourKey) || 0;
    
    if (currentHourCount >= config.maxAlertsPerHour) {
      return false;
    }
  }

  return true;
}

/**
 * Creates a performance alert from a metric
 */
export function createPerformanceAlert(
  metric: EnhancedMetric,
  thresholds: PerformanceAlertConfig['thresholds']
): PerformanceAlert {
  const severity = calculateAlertSeverity(metric.name, metric.value, thresholds);
  const threshold = thresholds[metric.name as keyof typeof thresholds];

  if (!severity || !threshold) {
    throw new Error(`Cannot create alert for metric ${metric.name}`);
  }

  const thresholdValue = severity === 'warning' ? threshold.warning : threshold.error;

  return {
    id: generateUUID(),
    timestamp: new Date().toISOString(),
    correlationId: metric.correlationId || getCurrentCorrelationId() || generateCorrelationId(),
    metric: metric.name,
    value: metric.value,
    threshold: thresholdValue,
    severity,
    url: metric.url,
    userAgent: metric.userAgent,
    context: {
      rating: metric.rating,
      delta: metric.delta,
      metricId: metric.id,
      metricTimestamp: metric.timestamp,
    },
  };
}

/**
 * Performance alerter metrics
 */
interface AlerterMetrics {
  totalAlerts: number;
  alertsByMetric: Record<string, number>;
  alertsBySeverity: Record<AlertSeverity, number>;
  deliveryFailures: number;
  lastAlertTime?: number;
}

/**
 * Performance alerter interface
 */
interface PerformanceAlerter {
  initialize(config: PerformanceAlertConfig): Promise<void>;
  processMetric(metric: EnhancedMetric): Promise<void>;
  getAlertMetrics(): AlerterMetrics;
  flush(): Promise<void>;
}

/**
 * Performance alerter implementation
 */
class PerformanceAlerterImpl implements PerformanceAlerter {
  private config?: PerformanceAlertConfig;
  private cooldownState = new Map<string, number>();
  private hourlyCount = new Map<number, number>();
  private alertDelivery?: any;
  private isInitialized = false;
  private metrics: AlerterMetrics = {
    totalAlerts: 0,
    alertsByMetric: {},
    alertsBySeverity: { warning: 0, error: 0, critical: 0 },
    deliveryFailures: 0,
  };
  private cleanupTimer?: NodeJS.Timeout;

  async initialize(config: PerformanceAlertConfig): Promise<void> {
    validatePerformanceAlertConfig(config);
    this.config = config;

    if (!config.enabled) {
      return;
    }

    try {
      // In a real implementation, this would initialize alert delivery services
      // For testing, we use a mock service if available
      if ((global as any).__TEST_ALERT_DELIVERY__) {
        this.alertDelivery = (global as any).__TEST_ALERT_DELIVERY__;
      } else {
        // In production, this would initialize real delivery services
        console.warn('Alert delivery service not available - running in development mode');
        return;
      }

      this.isInitialized = true;

      // Set up cleanup timer for state management
      this.cleanupTimer = setInterval(() => {
        this.cleanupState();
      }, 300000); // Clean up every 5 minutes

      if (this.cleanupTimer.unref) {
        this.cleanupTimer.unref();
      }
    } catch (error) {
      console.error('Failed to initialize performance alerter:', error);
    }
  }

  async processMetric(metric: EnhancedMetric): Promise<void> {
    if (!this.config?.enabled || !this.isInitialized) {
      return;
    }

    try {
      // Check if alert should be triggered
      if (!shouldTriggerAlert(metric, this.config, this.cooldownState, this.hourlyCount)) {
        return;
      }

      // Create the alert
      const alert = createPerformanceAlert(metric, this.config.thresholds);

      // Update state tracking
      this.updateState(metric.name, alert.severity);

      // Deliver the alert
      await this.deliverAlert(alert);

      // Update metrics
      this.updateMetrics(alert);
    } catch (error) {
      console.warn('Failed to process performance metric for alerting:', error);
      this.metrics.deliveryFailures++;
    }
  }

  private updateState(metricName: string, severity: AlertSeverity): void {
    const now = Date.now();

    // Update cooldown state
    this.cooldownState.set(metricName, now);

    // Update hourly count
    const hourKey = Math.floor(now / (60 * 60 * 1000));
    const currentCount = this.hourlyCount.get(hourKey) || 0;
    this.hourlyCount.set(hourKey, currentCount + 1);
  }

  private async deliverAlert(alert: PerformanceAlert): Promise<void> {
    if (!this.config || !this.alertDelivery) {
      return;
    }

    const deliveryPromises: Promise<void>[] = [];

    if (this.config.enableSlack) {
      deliveryPromises.push(this.alertDelivery.deliverSlack(alert));
    }

    if (this.config.enableEmail) {
      deliveryPromises.push(this.alertDelivery.deliverEmail(alert));
    }

    if (this.config.enableWebhook) {
      deliveryPromises.push(this.alertDelivery.deliverWebhook(alert));
    }

    // Execute all deliveries in parallel, but don't fail if some fail
    const results = await Promise.allSettled(deliveryPromises);
    
    // Log any delivery failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const methods = ['slack', 'email', 'webhook'];
        console.warn(`Failed to deliver alert via ${methods[index]}:`, result.reason);
        this.metrics.deliveryFailures++;
      }
    });
  }

  private updateMetrics(alert: PerformanceAlert): void {
    this.metrics.totalAlerts++;
    this.metrics.alertsByMetric[alert.metric] = (this.metrics.alertsByMetric[alert.metric] || 0) + 1;
    this.metrics.alertsBySeverity[alert.severity]++;
    this.metrics.lastAlertTime = Date.now();
  }

  private cleanupState(): void {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    // Clean up old hourly counts
    for (const [hourKey] of this.hourlyCount.entries()) {
      const hourTimestamp = hourKey * (60 * 60 * 1000);
      if (hourTimestamp < oneHourAgo) {
        this.hourlyCount.delete(hourKey);
      }
    }

    // Clean up old cooldown state (keep for 24 hours)
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    for (const [metricName, lastAlertTime] of this.cooldownState.entries()) {
      if (lastAlertTime < oneDayAgo) {
        this.cooldownState.delete(metricName);
      }
    }
  }

  getAlertMetrics(): AlerterMetrics {
    return { ...this.metrics };
  }

  async flush(): Promise<void> {
    // In a real implementation, this would flush any pending alerts
    // For now, this is a no-op
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
 * Creates a new performance alerter instance
 */
export function createPerformanceAlerter(): PerformanceAlerter {
  return new PerformanceAlerterImpl();
}

/**
 * Global performance alerter instance
 */
export const performanceAlerter = createPerformanceAlerter();