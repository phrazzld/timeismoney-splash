import type { CoreEvent, EventProps } from './types';

/**
 * Initialize Google Analytics
 * Called when gtag script loads
 */
export function initializeAnalytics(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]): void {
    window.dataLayer?.push(args);
  };

  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (measurementId && window.gtag) {
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      send_page_view: false, // We'll handle this manually for better SPA tracking
    });
  }
}

/**
 * Track a custom event with optional properties
 * In development, logs to console instead of sending to GA
 */
export function trackEvent(eventName: CoreEvent, props?: EventProps): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics Dev] Event: ${eventName}`, props);
    return;
  }

  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!measurementId) {
    return;
  }

  try {
    window.gtag('event', eventName, {
      ...props,
      send_to: measurementId,
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

/**
 * Track a page view
 * In development, logs to console instead of sending to GA
 */
export function trackPageview(url?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics Dev] Pageview tracked:', url || window.location.pathname);
    return;
  }

  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!measurementId) {
    return;
  }

  try {
    window.gtag('event', 'page_view', {
      page_location: url || window.location.href,
      page_path: url || window.location.pathname,
      send_to: measurementId,
    });
  } catch (error) {
    console.error('Failed to track pageview:', error);
  }
}

/**
 * Track a conversion event (e.g., extension install click)
 * This is a specialized function for tracking key conversion events
 */
export function trackConversion(eventName: string, value?: number, props?: EventProps): void {
  trackEvent('conversion', {
    ...props,
    event_category: 'conversion',
    event_label: eventName,
    value,
  });
}
