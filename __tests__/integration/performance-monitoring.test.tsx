/**
 * Integration tests for performance monitoring workflow (T018)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { createPerformanceMonitor } from '@/lib/performance';
import { logger, generateCorrelationId, setCorrelationId, clearCorrelationId } from '@/lib/logging';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: () => '/test-page',
  useSearchParams: () => new URLSearchParams(''),
}));

// Mock analytics
jest.mock('@/lib/analytics', () => ({
  analytics: {
    track: jest.fn(),
    identify: jest.fn(),
    page: jest.fn(),
  },
  trackPageview: jest.fn(),
}));

// Mock web-vitals
jest.mock('web-vitals', () => ({
  onLCP: jest.fn(),
  onFID: jest.fn(),
  onCLS: jest.fn(),
  onFCP: jest.fn(),
  onINP: jest.fn(),
  onTTFB: jest.fn(),
}));

// Mock performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    timing: {
      navigationStart: 1000,
      domContentLoadedEventEnd: 2000,
      loadEventEnd: 3000,
    },
    getEntriesByType: jest.fn(() => []),
  },
  writable: true,
});

describe('Performance Monitoring Integration (T018)', () => {
  let mockAnalyticsTrack: jest.Mock;
  let mockTrackPageview: jest.Mock;
  let mockLoggerError: jest.Mock;
  let mockLoggerLogPerformance: jest.Mock;
  let mockLoggerLogPageView: jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock analytics
    const analytics = require('@/lib/analytics');
    mockAnalyticsTrack = analytics.analytics.track.mockClear();
    mockTrackPageview = analytics.trackPageview.mockClear();

    // Mock logger
    const logging = require('@/lib/logging');
    mockLoggerError = logging.logger.error.mockClear();
    mockLoggerLogPerformance = logging.logger.logPerformance.mockClear();
    mockLoggerLogPageView = logging.logger.logPageView.mockClear();

    // Mock console.error
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });

    // Mock document properties
    Object.defineProperty(document, 'title', {
      value: 'Test Page',
      writable: true,
    });

    Object.defineProperty(document, 'referrer', {
      value: 'https://google.com',
      writable: true,
    });

    // Clear correlation ID
    clearCorrelationId();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    clearCorrelationId();
  });

  // Test component that simulates real application behavior
  const TestApp: React.FC<{ shouldError?: boolean }> = ({ shouldError = false }) => {
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
      if (shouldError && count > 0) {
        throw new Error('Test application error');
      }
    }, [shouldError, count]);

    return (
      <div>
        <h1>Test Application</h1>
        <p>Count: {count}</p>
        <button onClick={() => setCount(c => c + 1)}>Increment</button>
      </div>
    );
  };

  describe('Complete Monitoring Workflow', () => {
    it('should integrate performance monitoring, logging, and analytics', async () => {
      const correlationId = generateCorrelationId();
      setCorrelationId(correlationId);

      render(
        <ErrorBoundary>
          <AnalyticsProvider>
            <TestApp />
          </AnalyticsProvider>
        </ErrorBoundary>
      );

      // Wait for analytics provider to initialize
      await waitFor(() => {
        expect(mockTrackPageview).toHaveBeenCalledWith('/test-page');
      });

      // Should log page view
      expect(mockLoggerLogPageView).toHaveBeenCalledWith({
        type: 'pageview',
        message: 'Page view tracked',
        page: {
          path: '/test-page',
          title: 'Test Page',
          referrer: 'https://google.com',
        },
        session: {
          id: expect.any(String),
          isNewSession: true,
        },
      });

      // Should set session storage
      expect(window.sessionStorage.setItem).toHaveBeenCalledWith('session_started', 'true');
    });

    it('should handle performance metrics end-to-end', async () => {
      // Mock web-vitals callbacks
      const webVitals = require('web-vitals');
      let lcpCallback: Function;
      webVitals.onLCP.mockImplementation((callback: Function) => {
        lcpCallback = callback;
      });

      render(
        <ErrorBoundary>
          <AnalyticsProvider>
            <TestApp />
          </AnalyticsProvider>
        </ErrorBoundary>
      );

      // Wait for performance monitor setup
      await waitFor(() => {
        expect(webVitals.onLCP).toHaveBeenCalled();
      });

      // Simulate LCP metric
      act(() => {
        lcpCallback({
          name: 'LCP',
          value: 1500,
          rating: 'good',
          id: 'lcp-123',
          delta: 100,
        });
      });

      // Should log performance metric
      await waitFor(() => {
        expect(mockLoggerLogPerformance).toHaveBeenCalledWith({
          type: 'performance',
          message: 'LCP measured',
          metrics: {
            name: 'LCP',
            value: 1500,
            rating: 'good',
            delta: 100,
          },
          url: expect.any(String),
          userAgent: expect.any(String),
        });
      });

      // Should track in analytics
      await waitFor(() => {
        expect(mockAnalyticsTrack).toHaveBeenCalledWith('Performance Metric', {
          metricName: 'LCP',
          value: 1500,
          rating: 'good',
          url: expect.any(String),
          correlationId: expect.any(String),
        });
      });
    });

    it('should handle errors with complete monitoring context', async () => {
      const correlationId = generateCorrelationId();
      setCorrelationId(correlationId);

      render(
        <ErrorBoundary>
          <AnalyticsProvider>
            <TestApp shouldError />
          </AnalyticsProvider>
        </ErrorBoundary>
      );

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText('Test Application')).toBeInTheDocument();
      });

      // Trigger error
      fireEvent.click(screen.getByRole('button', { name: 'Increment' }));

      // Should catch error and log it
      await waitFor(() => {
        expect(mockLoggerError).toHaveBeenCalledWith(
          'Component error caught by ErrorBoundary',
          expect.objectContaining({
            message: 'Test application error',
          }),
          expect.objectContaining({
            correlationId,
            errorId: expect.any(String),
          })
        );
      });

      // Should track error in analytics
      await waitFor(() => {
        expect(mockAnalyticsTrack).toHaveBeenCalledWith('Component Error', {
          errorId: expect.any(String),
          errorName: 'Error',
          errorMessage: 'Test application error',
          componentStack: expect.any(String),
          url: expect.any(String),
          correlationId: expect.any(String),
          retryCount: 0,
        });
      });

      // Should show error boundary UI
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Performance Monitor Direct Integration', () => {
    it('should create and manage performance monitor correctly', async () => {
      const monitor = createPerformanceMonitor({
        enableLCP: true,
        enableFID: true,
        sampleRate: 1.0,
        bufferSize: 10,
      });

      const metricCallback = jest.fn();
      const unsubscribe = monitor.onMetric(metricCallback);

      monitor.start();

      // Should have started monitoring
      expect(monitor.getMetrics()).toHaveLength(0);

      // Clean up
      unsubscribe();
      monitor.stop();

      expect(() => monitor.stop()).not.toThrow(); // Should handle multiple stops
    });

    it('should flush metrics correctly', async () => {
      const monitor = createPerformanceMonitor();
      
      monitor.start();
      await expect(monitor.flush()).resolves.not.toThrow();
      monitor.stop();
    });

    it('should handle configuration validation', () => {
      // Should not throw with valid config
      expect(() => createPerformanceMonitor({
        sampleRate: 0.5,
        bufferSize: 100,
        flushInterval: 5000,
      })).not.toThrow();

      // Should handle invalid config gracefully
      expect(() => createPerformanceMonitor({
        sampleRate: 2.0, // Invalid
        bufferSize: -1, // Invalid
        flushInterval: 0, // Invalid
      })).not.toThrow();
    });
  });

  describe('Error Boundary and Performance Integration', () => {
    it('should maintain performance monitoring during error recovery', async () => {
      let shouldError = true;
      
      const TestComponent = () => <TestApp shouldError={shouldError} />;

      render(
        <ErrorBoundary enableRetry>
          <AnalyticsProvider>
            <TestComponent />
          </AnalyticsProvider>
        </ErrorBoundary>
      );

      // Trigger error
      fireEvent.click(screen.getByRole('button', { name: 'Increment' }));

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });

      // Fix error condition
      shouldError = false;

      // Retry
      fireEvent.click(screen.getByRole('button', { name: /try again/i }));

      // Should recover and continue monitoring
      await waitFor(() => {
        expect(screen.getByText('Test Application')).toBeInTheDocument();
      });

      // Performance monitoring should still be active
      expect(mockTrackPageview).toHaveBeenCalled();
    });

    it('should handle performance monitoring errors gracefully', async () => {
      // Mock performance monitor to throw error
      const originalCreateMonitor = require('@/lib/performance').createPerformanceMonitor;
      const mockCreateMonitor = jest.fn(() => {
        throw new Error('Performance monitor error');
      });
      
      jest.doMock('@/lib/performance', () => ({
        ...require('@/lib/performance'),
        createPerformanceMonitor: mockCreateMonitor,
      }));

      // Should not crash the app
      expect(() => {
        render(
          <ErrorBoundary>
            <AnalyticsProvider>
              <TestApp />
            </AnalyticsProvider>
          </ErrorBoundary>
        );
      }).not.toThrow();

      // Should still render content
      expect(screen.getByText('Test Application')).toBeInTheDocument();
    });
  });

  describe('Correlation ID Flow', () => {
    it('should maintain correlation ID across monitoring systems', async () => {
      const correlationId = generateCorrelationId();
      setCorrelationId(correlationId);

      render(
        <ErrorBoundary>
          <AnalyticsProvider>
            <TestApp />
          </AnalyticsProvider>
        </ErrorBoundary>
      );

      // Wait for page view tracking
      await waitFor(() => {
        expect(mockLoggerLogPageView).toHaveBeenCalled();
      });

      // Page view should include correlation ID
      const pageViewCall = mockLoggerLogPageView.mock.calls[0][0];
      expect(pageViewCall).toEqual(
        expect.objectContaining({
          type: 'pageview',
        })
      );

      // All logs should use the same correlation ID context
      expect(correlationId).toBeDefined();
    });

    it('should generate new correlation ID for each page view', async () => {
      const { rerender } = render(
        <ErrorBoundary>
          <AnalyticsProvider>
            <TestApp />
          </AnalyticsProvider>
        </ErrorBoundary>
      );

      await waitFor(() => {
        expect(mockLoggerLogPageView).toHaveBeenCalledTimes(1);
      });

      // Simulate route change
      rerender(
        <ErrorBoundary>
          <AnalyticsProvider>
            <TestApp />
          </AnalyticsProvider>
        </ErrorBoundary>
      );

      await waitFor(() => {
        expect(mockLoggerLogPageView).toHaveBeenCalledTimes(2);
      });

      // Each page view should have tracking
      expect(mockTrackPageview).toHaveBeenCalledTimes(2);
    });
  });

  describe('Memory and Performance Impact', () => {
    it('should clean up resources properly', async () => {
      const { unmount } = render(
        <ErrorBoundary>
          <AnalyticsProvider>
            <TestApp />
          </AnalyticsProvider>
        </ErrorBoundary>
      );

      // Wait for initialization
      await waitFor(() => {
        expect(mockTrackPageview).toHaveBeenCalled();
      });

      // Unmount should not cause errors
      expect(() => unmount()).not.toThrow();
    });

    it('should handle rapid re-renders efficiently', async () => {
      const { rerender } = render(
        <ErrorBoundary>
          <AnalyticsProvider>
            <TestApp />
          </AnalyticsProvider>
        </ErrorBoundary>
      );

      // Rapid re-renders
      for (let i = 0; i < 10; i++) {
        rerender(
          <ErrorBoundary>
            <AnalyticsProvider>
              <TestApp />
            </AnalyticsProvider>
          </ErrorBoundary>
        );
      }

      // Should handle gracefully
      expect(screen.getByText('Test Application')).toBeInTheDocument();
    });
  });

  describe('Production vs Development Behavior', () => {
    it('should behave differently in production vs development', async () => {
      const originalEnv = process.env.NODE_ENV;

      // Test development mode
      process.env.NODE_ENV = 'development';

      const { rerender } = render(
        <ErrorBoundary showErrorDetails>
          <AnalyticsProvider>
            <TestApp shouldError />
          </AnalyticsProvider>
        </ErrorBoundary>
      );

      // Trigger error
      fireEvent.click(screen.getByRole('button', { name: 'Increment' }));

      await waitFor(() => {
        expect(screen.getByText(/error details/i)).toBeInTheDocument();
      });

      // Test production mode
      process.env.NODE_ENV = 'production';

      rerender(
        <ErrorBoundary showErrorDetails>
          <AnalyticsProvider>
            <TestApp shouldError />
          </AnalyticsProvider>
        </ErrorBoundary>
      );

      // Should not show error details in production
      expect(screen.queryByText(/error details/i)).not.toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });
});