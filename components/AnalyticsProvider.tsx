'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageview } from '@/lib/analytics';
import { createPerformanceMonitor, type EnhancedMetric } from '@/lib/performance';
import { logger, generateCorrelationId, setCorrelationId } from '@/lib/logging';
import { processPerformanceMetric, sendLogEntry } from '@/lib/monitoring';

/**
 * Internal component that uses useSearchParams and sets up monitoring
 */
function AnalyticsTracker(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Generate correlation ID for this page view
    const correlationId = generateCorrelationId();
    setCorrelationId(correlationId);

    // Track page view whenever pathname or search params change
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    // Log page view with structured logging
    const pageViewEntry = {
      type: 'pageview' as const,
      message: 'Page view tracked',
      page: {
        path: pathname,
        title: document.title,
        referrer: document.referrer || undefined,
      },
      session: {
        id: generateCorrelationId(), // Simple session ID for demo
        isNewSession: !sessionStorage.getItem('session_started'),
      },
    };

    logger.logPageView(pageViewEntry);

    // Send page view to remote logging
    sendLogEntry({
      timestamp: new Date().toISOString(),
      level: 'info',
      correlationId,
      ...pageViewEntry,
    }).catch(() => {
      // Remote logging not available, continue silently
    });

    // Mark session as started
    sessionStorage.setItem('session_started', 'true');

    // Track with analytics
    trackPageview(url);

    // Set up performance monitoring for this page
    const performanceMonitor = createPerformanceMonitor({
      enableLCP: true,
      enableFID: true,
      enableCLS: true,
      enableFCP: true,
      enableINP: true,
      enableTTFB: true,
      sampleRate: 1.0, // 100% sampling for demo
      bufferSize: 50,
    });

    // Subscribe to performance metrics
    const unsubscribe = performanceMonitor.onMetric((metric: EnhancedMetric) => {
      // Log performance metric with structured logging
      const logEntry = {
        type: 'performance' as const,
        message: `${metric.name} measured`,
        metrics: {
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta || 0,
        },
        url: metric.url || 'unknown',
        userAgent: metric.userAgent || 'unknown',
      };

      logger.logPerformance(logEntry);

      // Send to remote logging
      sendLogEntry({
        timestamp: new Date().toISOString(),
        level: 'info',
        correlationId: metric.correlationId || generateCorrelationId(),
        ...logEntry,
      }).catch(() => {
        // Remote logging not available, continue silently
      });

      // Process metric for performance alerting
      processPerformanceMetric(metric).catch(() => {
        // Performance alerting not available, continue silently
      });

      // Track performance in analytics
      import('@/lib/analytics')
        .then(({ trackEvent }) => {
          trackEvent('performance_metric', {
            metricName: metric.name,
            value: metric.value,
            rating: metric.rating,
            url: metric.url,
            correlationId: metric.correlationId,
          });
        })
        .catch(() => {
          // Analytics not available, continue silently
        });
    });

    // Start monitoring
    performanceMonitor.start();

    // Cleanup on unmount or route change
    return (): void => {
      unsubscribe();
      performanceMonitor.stop();
    };
  }, [pathname, searchParams]);

  return null;
}

/**
 * Analytics provider component that tracks page views and performance metrics
 * on route changes in the Next.js App Router
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <>
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
      {children}
    </>
  );
}
