/**
 * Integration tests for ErrorBoundary component (T018)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';
import { AnalyticsProvider } from '../AnalyticsProvider';
import { generateCorrelationId, setCorrelationId, clearCorrelationId } from '@/lib/logging/correlation';

// Mock analytics and logging
jest.mock('@/lib/analytics', () => ({
  analytics: {
    track: jest.fn(),
    identify: jest.fn(),
    page: jest.fn(),
  },
}));

jest.mock('@/lib/logging', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('ErrorBoundary Integration Tests (T018)', () => {
  let mockAnalyticsTrack: jest.Mock;
  let mockLoggerError: jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock analytics
    const analytics = require('@/lib/analytics');
    mockAnalyticsTrack = analytics.analytics.track.mockClear();

    // Mock logger
    const logging = require('@/lib/logging');
    mockLoggerError = logging.logger.error.mockClear();

    // Suppress console.error during tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Clear correlation ID
    clearCorrelationId();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    clearCorrelationId();
  });

  // Test component that throws an error
  const ThrowError: React.FC<{ shouldThrow?: boolean; message?: string }> = ({ 
    shouldThrow = true, 
    message = 'Integration test error' 
  }) => {
    if (shouldThrow) {
      throw new Error(message);
    }
    return <div>Component rendered successfully</div>;
  };

  // Mock complex component with hooks and state
  const ComplexComponent: React.FC<{ shouldError?: boolean }> = ({ shouldError = false }) => {
    const [count, setCount] = React.useState(0);
    const [data, setData] = React.useState<string | null>(null);

    React.useEffect(() => {
      if (shouldError && count > 0) {
        throw new Error('Error in useEffect');
      }
      
      setData(`Data loaded: ${count}`);
    }, [count, shouldError]);

    return (
      <div>
        <div>Count: {count}</div>
        <div>Data: {data}</div>
        <button onClick={() => setCount(c => c + 1)}>Increment</button>
      </div>
    );
  };

  describe('Integration with Analytics Provider', () => {
    it('should integrate with AnalyticsProvider correctly', () => {
      const correlationId = generateCorrelationId();
      setCorrelationId(correlationId);

      render(
        <AnalyticsProvider>
          <ErrorBoundary testId="error-boundary">
            <ThrowError />
          </ErrorBoundary>
        </AnalyticsProvider>
      );

      // Should show error UI
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Should log error with correlation ID
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Component error caught by ErrorBoundary',
        expect.any(Error),
        expect.objectContaining({
          correlationId,
        })
      );
    });

    it('should track error events in analytics', () => {
      render(
        <AnalyticsProvider>
          <ErrorBoundary testId="error-boundary">
            <ThrowError message="Analytics integration error" />
          </ErrorBoundary>
        </AnalyticsProvider>
      );

      // Analytics should track the error
      expect(mockAnalyticsTrack).toHaveBeenCalledWith(
        'Component Error',
        expect.objectContaining({
          errorMessage: 'Analytics integration error',
          errorName: 'Error',
          errorId: expect.any(String),
        })
      );
    });

    it('should work without AnalyticsProvider', () => {
      expect(() => {
        render(
          <ErrorBoundary testId="error-boundary">
            <ThrowError />
          </ErrorBoundary>
        );
      }).not.toThrow();

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Real Component Integration', () => {
    it('should catch errors in components with hooks', async () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError} enableRetry testId="error-boundary">
          <ComplexComponent shouldError />
        </ErrorBoundary>
      );

      // Component should render initially
      expect(screen.getByText('Count: 0')).toBeInTheDocument();

      // Click increment to trigger error in useEffect
      fireEvent.click(screen.getByRole('button', { name: 'Increment' }));

      // Should catch the error
      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should recover from errors in complex components', async () => {
      let shouldError = true;

      const TestWrapper = () => (
        <ErrorBoundary enableRetry testId="error-boundary">
          <ComplexComponent shouldError={shouldError} />
        </ErrorBoundary>
      );

      const { rerender } = render(<TestWrapper />);

      // Trigger error
      fireEvent.click(screen.getByRole('button', { name: 'Increment' }));

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });

      // Fix the error condition
      shouldError = false;
      rerender(<TestWrapper />);

      // Click retry
      fireEvent.click(screen.getByRole('button', { name: /try again/i }));

      // Should recover successfully
      await waitFor(() => {
        expect(screen.getByText('Component rendered successfully')).toBeInTheDocument();
      });
    });

    it('should handle async component errors', async () => {
      const AsyncErrorComponent = () => {
        const [loading, setLoading] = React.useState(true);

        React.useEffect(() => {
          const timer = setTimeout(() => {
            setLoading(false);
            throw new Error('Async component error');
          }, 100);

          return () => clearTimeout(timer);
        }, []);

        if (loading) {
          return <div>Loading...</div>;
        }

        return <div>Async component loaded</div>;
      };

      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError} testId="error-boundary">
          <AsyncErrorComponent />
        </ErrorBoundary>
      );

      // Should show loading initially
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Wait for async error
      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      }, { timeout: 200 });

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Performance Impact Integration', () => {
    it('should not impact performance of non-erroring components', () => {
      const RenderTracker = () => {
        const renderCount = React.useRef(0);
        renderCount.current += 1;

        return <div>Render count: {renderCount.current}</div>;
      };

      const { rerender } = render(
        <ErrorBoundary testId="error-boundary">
          <RenderTracker />
        </ErrorBoundary>
      );

      expect(screen.getByText('Render count: 1')).toBeInTheDocument();

      // Re-render multiple times
      for (let i = 0; i < 5; i++) {
        rerender(
          <ErrorBoundary testId="error-boundary">
            <RenderTracker />
          </ErrorBoundary>
        );
      }

      // Component should render normally
      expect(screen.getByText('Render count: 6')).toBeInTheDocument();
    });

    it('should handle high-frequency error scenarios', async () => {
      let errorCount = 0;
      
      const HighFrequencyErrorComponent = () => {
        errorCount++;
        if (errorCount <= 10) {
          throw new Error(`High frequency error ${errorCount}`);
        }
        return <div>Finally stable</div>;
      };

      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError} enableRetry testId="error-boundary">
          <HighFrequencyErrorComponent />
        </ErrorBoundary>
      );

      // Should catch the first error
      expect(onError).toHaveBeenCalledTimes(1);

      // Retry multiple times rapidly
      for (let i = 0; i < 9; i++) {
        fireEvent.click(screen.getByRole('button', { name: /try again/i }));
        
        await waitFor(() => {
          expect(onError).toHaveBeenCalledTimes(i + 2);
        });
      }

      // Final retry should succeed
      fireEvent.click(screen.getByRole('button', { name: /try again/i }));

      await waitFor(() => {
        expect(screen.getByText('Finally stable')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation and Routing Integration', () => {
    it('should preserve error state across re-renders', () => {
      const onError = jest.fn();

      const { rerender } = render(
        <ErrorBoundary onError={onError} testId="error-boundary">
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(onError).toHaveBeenCalledTimes(1);

      // Re-render with same error component
      rerender(
        <ErrorBoundary onError={onError} testId="error-boundary">
          <ThrowError />
        </ErrorBoundary>
      );

      // Should still show error state
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      // Should not call onError again for the same error state
      expect(onError).toHaveBeenCalledTimes(1);
    });

    it('should reset error state when children change', () => {
      const onError = jest.fn();

      const { rerender } = render(
        <ErrorBoundary onError={onError} testId="error-boundary">
          <ThrowError key="error-component" />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Change to non-error component
      rerender(
        <ErrorBoundary onError={onError} testId="error-boundary">
          <div key="normal-component">Normal component</div>
        </ErrorBoundary>
      );

      // Should render the new component
      expect(screen.getByText('Normal component')).toBeInTheDocument();
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    });
  });

  describe('Production vs Development Behavior', () => {
    it('should behave differently in production vs development', () => {
      const originalEnv = process.env.NODE_ENV;

      // Test development mode
      process.env.NODE_ENV = 'development';

      const { rerender } = render(
        <ErrorBoundary showErrorDetails testId="error-boundary">
          <ThrowError message="Dev error" />
        </ErrorBoundary>
      );

      expect(screen.getByText(/error details/i)).toBeInTheDocument();
      expect(screen.getByText('Dev error')).toBeInTheDocument();

      // Test production mode
      process.env.NODE_ENV = 'production';

      rerender(
        <ErrorBoundary showErrorDetails testId="error-boundary">
          <ThrowError message="Prod error" />
        </ErrorBoundary>
      );

      expect(screen.queryByText(/error details/i)).not.toBeInTheDocument();
      expect(screen.queryByText('Prod error')).not.toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Memory Leak Prevention', () => {
    it('should clean up properly when unmounted', () => {
      const onError = jest.fn();

      const { unmount } = render(
        <ErrorBoundary onError={onError} testId="error-boundary">
          <ThrowError />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalled();

      // Unmount should not cause errors
      expect(() => unmount()).not.toThrow();
    });

    it('should handle rapid mount/unmount cycles', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <ErrorBoundary testId="error-boundary">
            <ThrowError message={`Cycle ${i}`} />
          </ErrorBoundary>
        );

        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
        unmount();
      }
    });
  });

  describe('Accessibility Integration', () => {
    it('should announce errors to screen readers', () => {
      render(
        <ErrorBoundary testId="error-boundary">
          <ThrowError />
        </ErrorBoundary>
      );

      const errorContainer = screen.getByTestId('error-boundary');
      expect(errorContainer).toHaveAttribute('role', 'alert');
      expect(errorContainer).toHaveAttribute('aria-live', 'polite');
    });

    it('should maintain focus management during errors', () => {
      const FocusableComponent = () => {
        const buttonRef = React.useRef<HTMLButtonElement>(null);

        React.useEffect(() => {
          buttonRef.current?.focus();
        }, []);

        return (
          <div>
            <button ref={buttonRef}>Focused button</button>
            <ThrowError />
          </div>
        );
      };

      render(
        <ErrorBoundary testId="error-boundary">
          <FocusableComponent />
        </ErrorBoundary>
      );

      // Should show error boundary
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Retry button should be focusable
      const retryButton = screen.getByRole('button', { name: /try again/i });
      retryButton.focus();
      expect(retryButton).toHaveFocus();
    });
  });
});