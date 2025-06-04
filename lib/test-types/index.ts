/**
 * Common type definitions for test mocks and utilities
 */

import type { jest } from '@jest/globals';

/**
 * Analytics service mock interface
 */
export interface MockAnalyticsService {
  track: jest.MockedFunction<(event: string, properties?: Record<string, unknown>) => void>;
  identify: jest.MockedFunction<(userId: string, traits?: Record<string, unknown>) => void>;
  page: jest.MockedFunction<(name?: string, properties?: Record<string, unknown>) => void>;
}

/**
 * Analytics module mock interface
 */
export interface MockAnalyticsModule {
  analytics: MockAnalyticsService;
  trackPageview: jest.MockedFunction<(url: string, title?: string) => void>;
}

/**
 * Logger service mock interface
 */
export interface MockLoggerService {
  debug: jest.MockedFunction<(message: string, context?: Record<string, unknown>) => void>;
  info: jest.MockedFunction<(message: string, context?: Record<string, unknown>) => void>;
  warn: jest.MockedFunction<(message: string, context?: Record<string, unknown>) => void>;
  error: jest.MockedFunction<
    (message: string, error?: Error, context?: Record<string, unknown>) => void
  >;
}

/**
 * Logging module mock interface
 */
export interface MockLoggingModule {
  logger: MockLoggerService;
}

/**
 * Web-vitals module mock interface
 */
export interface MockWebVitalsModule {
  onLCP: jest.MockedFunction<(callback: (metric: unknown) => void) => void>;
  onFID: jest.MockedFunction<(callback: (metric: unknown) => void) => void>;
  onCLS: jest.MockedFunction<(callback: (metric: unknown) => void) => void>;
  onFCP: jest.MockedFunction<(callback: (metric: unknown) => void) => void>;
  onINP: jest.MockedFunction<(callback: (metric: unknown) => void) => void>;
  onTTFB: jest.MockedFunction<(callback: (metric: unknown) => void) => void>;
}

/**
 * Next.js navigation mock interface
 */
export interface MockNextNavigation {
  usePathname: jest.MockedFunction<() => string>;
  useSearchParams: jest.MockedFunction<() => URLSearchParams>;
  useRouter: jest.MockedFunction<
    () => {
      push: jest.MockedFunction<(url: string) => void>;
      replace: jest.MockedFunction<(url: string) => void>;
      back: jest.MockedFunction<() => void>;
      forward: jest.MockedFunction<() => void>;
      refresh: jest.MockedFunction<() => void>;
    }
  >;
}

/**
 * Error tracking service mock interface
 */
export interface MockErrorTrackingService {
  init: jest.MockedFunction<(config: unknown) => void>;
  captureException: jest.MockedFunction<(error: Error, context?: Record<string, unknown>) => void>;
  captureMessage: jest.MockedFunction<
    (message: string, level?: string, context?: Record<string, unknown>) => void
  >;
  setUser: jest.MockedFunction<(user: Record<string, unknown>) => void>;
  setTags: jest.MockedFunction<(tags: Record<string, string>) => void>;
  addBreadcrumb: jest.MockedFunction<
    (message: string, category?: string, data?: Record<string, unknown>) => void
  >;
  flush: jest.MockedFunction<() => Promise<void>>;
}

/**
 * Correlation ID module mock interface
 */
export interface MockCorrelationModule {
  getCurrentCorrelationId: jest.MockedFunction<() => string | undefined>;
  generateCorrelationId: jest.MockedFunction<() => string>;
  setCorrelationId: jest.MockedFunction<(id: string) => void>;
  clearCorrelationId: jest.MockedFunction<() => void>;
  withCorrelationId: jest.MockedFunction<<T>(id: string, fn: () => T) => T>;
}

/**
 * Performance API mock interface
 */
export interface MockPerformanceAPI {
  now: jest.MockedFunction<() => number>;
  timing: {
    navigationStart: number;
    domContentLoadedEventEnd: number;
    loadEventEnd: number;
    responseStart: number;
    requestStart: number;
  };
  getEntriesByType: jest.MockedFunction<(type: string) => PerformanceEntry[]>;
  getEntriesByName: jest.MockedFunction<(name: string) => PerformanceEntry[]>;
  mark: jest.MockedFunction<(name: string) => void>;
  measure: jest.MockedFunction<(name: string, startMark?: string, endMark?: string) => void>;
}

/**
 * HTTP client mock interface
 */
export interface MockHttpClient {
  get: jest.MockedFunction<
    (url: string, config?: unknown) => Promise<{ ok: boolean; status: number; data: unknown }>
  >;
  post: jest.MockedFunction<
    (
      url: string,
      data: unknown,
      config?: unknown,
    ) => Promise<{ ok: boolean; status: number; data: unknown }>
  >;
  put: jest.MockedFunction<
    (
      url: string,
      data: unknown,
      config?: unknown,
    ) => Promise<{ ok: boolean; status: number; data: unknown }>
  >;
  delete: jest.MockedFunction<
    (url: string, config?: unknown) => Promise<{ ok: boolean; status: number }>
  >;
}

/**
 * Intersection Observer mock interface
 */
export interface MockIntersectionObserver {
  observe: jest.MockedFunction<(target: Element) => void>;
  unobserve: jest.MockedFunction<(target: Element) => void>;
  disconnect: jest.MockedFunction<() => void>;
  trigger: (entries: Partial<IntersectionObserverEntry>[]) => void;
}

/**
 * Console mock interface
 */
export interface MockConsole {
  log: jest.MockedFunction<(...args: unknown[]) => void>;
  warn: jest.MockedFunction<(...args: unknown[]) => void>;
  error: jest.MockedFunction<(...args: unknown[]) => void>;
  debug: jest.MockedFunction<(...args: unknown[]) => void>;
  info: jest.MockedFunction<(...args: unknown[]) => void>;
}

/**
 * Utility type for extracting mock type from a module
 */
export type MockedModule<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? jest.MockedFunction<(...args: A) => R>
    : T[K] extends object
      ? MockedModule<T[K]>
      : T[K];
};

/**
 * Type guard to check if a function is a Jest mock
 */
export function isMockFunction<T extends (...args: unknown[]) => unknown>(
  fn: T | jest.MockedFunction<T>,
): fn is jest.MockedFunction<T> {
  return typeof fn === 'function' && 'mockClear' in fn;
}

/**
 * Helper to create a typed mock function
 */
export function createMockFunction<
  T extends (...args: unknown[]) => unknown,
>(): jest.MockedFunction<T> {
  return jest.fn() as jest.MockedFunction<T>;
}

/**
 * Helper to create a typed mock object
 */
export function createMockObject<T extends Record<string, unknown>>(
  mockImplementation: Partial<MockedModule<T>>,
): MockedModule<T> {
  return mockImplementation as MockedModule<T>;
}
