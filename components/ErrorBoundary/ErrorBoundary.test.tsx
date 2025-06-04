/**
 * Tests for ErrorBoundary component (T018)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';
import {
  generateCorrelationId,
  setCorrelationId,
  clearCorrelationId,
} from '@/lib/logging/correlation';
import * as logging from '@/lib/logging';
import type { MockLoggingModule } from '@/lib/test-types';

// Mock logging system
jest.mock('@/lib/logging', () => ({
  logger: {
    error: jest.fn(),
  },
}));

// Type the mocked module
const mockLogging = logging as unknown as MockLoggingModule;

describe('ErrorBoundary Component (T018)', () => {
  let mockLoggerError: jest.MockedFunction<typeof logging.logger.error>;
  let consoleErrorSpy: jest.SpyInstance<void, Parameters<typeof console.error>>;

  beforeEach(() => {
    // Mock logger
    mockLoggerError = mockLogging.logger.error.mockClear();

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
    message = 'Test error',
  }) => {
    if (shouldThrow) {
      throw new Error(message);
    }
    return <div>No error</div>;
  };

  describe('Error Catching and Handling', () => {
    it('should catch and handle component errors', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError} testId="error-boundary">
          <ThrowError />
        </ErrorBoundary>,
      );

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test error',
          name: 'Error',
        }),
        expect.objectContaining({
          componentStack: expect.stringContaining('ThrowError'),
        }),
      );
    });

    it('should render fallback UI when error occurs', () => {
      render(
        <ErrorBoundary testId="error-boundary">
          <ThrowError />
        </ErrorBoundary>,
      );

      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary testId="error-boundary">
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>,
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    });

    it('should render custom fallback UI when provided', () => {
      const customFallback = <div>Custom error message</div>;

      render(
        <ErrorBoundary fallback={customFallback} testId="error-boundary">
          <ThrowError />
        </ErrorBoundary>,
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    });

    it('should render custom fallback function when provided', () => {
      const customFallback = (error: Error): JSX.Element => (
        <div>Custom error: {error.message}</div>
      );

      render(
        <ErrorBoundary fallback={customFallback} testId="error-boundary">
          <ThrowError message="Custom test error" />
        </ErrorBoundary>,
      );

      expect(screen.getByText('Custom error: Custom test error')).toBeInTheDocument();
    });
  });

  describe('Error Logging Integration', () => {
    it('should log errors with structured logging', () => {
      const correlationId = generateCorrelationId();
      setCorrelationId(correlationId);

      render(
        <ErrorBoundary testId="error-boundary">
          <ThrowError message="Logging test error" />
        </ErrorBoundary>,
      );

      expect(mockLoggerError).toHaveBeenCalledWith(
        'Component error caught by ErrorBoundary',
        expect.objectContaining({
          message: 'Logging test error',
          name: 'Error',
        }),
        expect.objectContaining({
          errorId: expect.any(String),
          componentStack: expect.stringContaining('ThrowError'),
          url: expect.any(String),
          userAgent: expect.any(String),
          correlationId,
        }),
      );
    });

    it('should generate correlation ID if none exists', () => {
      clearCorrelationId();

      render(
        <ErrorBoundary testId="error-boundary">
          <ThrowError />
        </ErrorBoundary>,
      );

      const logCall = mockLoggerError.mock.calls[0];
      const context = logCall[2];

      expect(context.correlationId).toBeDefined();
      expect(context.correlationId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should include error ID for tracking', () => {
      render(
        <ErrorBoundary testId="error-boundary">
          <ThrowError />
        </ErrorBoundary>,
      );

      const logCall = mockLoggerError.mock.calls[0];
      const context = logCall[2];

      expect(context.errorId).toBeDefined();
      expect(typeof context.errorId).toBe('string');
      expect(context.errorId.length).toBeGreaterThan(0);
    });
  });

  describe('Retry Functionality', () => {
    it('should retry rendering when retry button is clicked', async () => {
      let shouldThrow = true;
      const TestComponent = (): JSX.Element => <ThrowError shouldThrow={shouldThrow} />;

      render(
        <ErrorBoundary enableRetry testId="error-boundary">
          <TestComponent />
        </ErrorBoundary>,
      );

      // Should show error UI initially
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Fix the error condition
      shouldThrow = false;

      // Click retry button
      fireEvent.click(screen.getByRole('button', { name: /try again/i }));

      // Should render children successfully after retry
      await waitFor(() => {
        expect(screen.getByText('No error')).toBeInTheDocument();
      });

      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    });

    it('should use custom retry button text when provided', () => {
      render(
        <ErrorBoundary enableRetry retryButtonText="Reload Component" testId="error-boundary">
          <ThrowError />
        </ErrorBoundary>,
      );

      expect(screen.getByRole('button', { name: 'Reload Component' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
    });

    it('should not show retry button when retry is disabled', () => {
      render(
        <ErrorBoundary enableRetry={false} testId="error-boundary">
          <ThrowError />
        </ErrorBoundary>,
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should handle retry failures gracefully', async () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary enableRetry onError={onError} testId="error-boundary">
          <ThrowError />
        </ErrorBoundary>,
      );

      // First error
      expect(onError).toHaveBeenCalledTimes(1);

      // Click retry - component still throws
      fireEvent.click(screen.getByRole('button', { name: /try again/i }));

      // Should catch the error again
      await waitFor(() => {
        expect(onError).toHaveBeenCalledTimes(2);
      });

      // Should still show error UI
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Error Details Display', () => {
    it('should show error details in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      try {
        render(
          <ErrorBoundary showErrorDetails testId="error-boundary">
            <ThrowError message="Detailed error message" />
          </ErrorBoundary>,
        );

        expect(screen.getByText(/error details/i)).toBeInTheDocument();
        expect(screen.getByText('Detailed error message')).toBeInTheDocument();
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it('should not show error details in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        render(
          <ErrorBoundary showErrorDetails testId="error-boundary">
            <ThrowError message="Detailed error message" />
          </ErrorBoundary>,
        );

        expect(screen.queryByText(/error details/i)).not.toBeInTheDocument();
        expect(screen.queryByText('Detailed error message')).not.toBeInTheDocument();
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it('should show component stack in error details', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      try {
        render(
          <ErrorBoundary showErrorDetails testId="error-boundary">
            <ThrowError />
          </ErrorBoundary>,
        );

        expect(screen.getByText(/component stack/i)).toBeInTheDocument();
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });

  describe('Accessibility and Styling', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <ErrorBoundary testId="error-boundary">
          <ThrowError />
        </ErrorBoundary>,
      );

      const errorContainer = screen.getByTestId('error-boundary');
      expect(errorContainer).toHaveAttribute('role', 'alert');
      expect(errorContainer).toHaveAttribute('aria-live', 'polite');
    });

    it('should apply custom className when provided', () => {
      render(
        <ErrorBoundary className="custom-error-class" testId="error-boundary">
          <ThrowError />
        </ErrorBoundary>,
      );

      expect(screen.getByTestId('error-boundary')).toHaveClass('custom-error-class');
    });

    it('should have proper focus management', () => {
      render(
        <ErrorBoundary testId="error-boundary">
          <ThrowError />
        </ErrorBoundary>,
      );

      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toBeInTheDocument();

      // Button should be focusable
      retryButton.focus();
      expect(retryButton).toHaveFocus();
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle null error gracefully', () => {
      const ThrowNullError = (): never => {
        throw null;
      };

      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError} testId="error-boundary">
          <ThrowNullError />
        </ErrorBoundary>,
      );

      expect(onError).toHaveBeenCalledWith(
        null,
        expect.objectContaining({
          componentStack: expect.any(String),
        }),
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should handle string errors gracefully', () => {
      const ThrowStringError = (): never => {
        throw 'String error';
      };

      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError} testId="error-boundary">
          <ThrowStringError />
        </ErrorBoundary>,
      );

      expect(onError).toHaveBeenCalledWith(
        'String error',
        expect.objectContaining({
          componentStack: expect.any(String),
        }),
      );
    });

    it('should handle very long error messages', () => {
      const longMessage = 'x'.repeat(10000);

      render(
        <ErrorBoundary testId="error-boundary">
          <ThrowError message={longMessage} />
        </ErrorBoundary>,
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should handle errors with circular references in props', () => {
      const CircularComponent = (): JSX.Element => {
        const obj: unknown = { name: 'test' };
        obj.self = obj;

        throw new Error('Error with circular reference');
      };

      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError} testId="error-boundary">
          <CircularComponent />
        </ErrorBoundary>,
      );

      expect(onError).toHaveBeenCalled();
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Performance and Memory', () => {
    it('should not leak memory with multiple errors', () => {
      const { rerender } = render(
        <ErrorBoundary testId="error-boundary">
          <ThrowError key="1" />
        </ErrorBoundary>,
      );

      // Simulate multiple error scenarios
      for (let i = 2; i <= 10; i++) {
        rerender(
          <ErrorBoundary testId="error-boundary">
            <ThrowError key={i.toString()} message={`Error ${i}`} />
          </ErrorBoundary>,
        );
      }

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should handle rapid error and retry cycles', async () => {
      let shouldThrow = true;
      const TestComponent = (): JSX.Element => <ThrowError shouldThrow={shouldThrow} />;

      render(
        <ErrorBoundary enableRetry testId="error-boundary">
          <TestComponent />
        </ErrorBoundary>,
      );

      // Rapid error/retry cycles
      for (let i = 0; i < 5; i++) {
        shouldThrow = true;
        fireEvent.click(screen.getByRole('button', { name: /try again/i }));

        await waitFor(() => {
          expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
        });

        shouldThrow = false;
        fireEvent.click(screen.getByRole('button', { name: /try again/i }));

        await waitFor(() => {
          expect(screen.getByText('No error')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Integration with Other Components', () => {
    it('should work with async components', async () => {
      const AsyncComponent = (): JSX.Element => {
        const [shouldThrow, _setShouldThrow] = React.useState(true);

        React.useEffect(() => {
          if (shouldThrow) {
            throw new Error('Async error');
          }
        }, [shouldThrow]);

        return <div>Async component loaded</div>;
      };

      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError} testId="error-boundary">
          <AsyncComponent />
        </ErrorBoundary>,
      );

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });

    it('should work with nested error boundaries', () => {
      const NestedComponent = (): JSX.Element => <ThrowError message="Nested error" />;

      const outerOnError = jest.fn();
      const innerOnError = jest.fn();

      render(
        <ErrorBoundary onError={outerOnError} testId="outer-boundary">
          <div>
            <ErrorBoundary onError={innerOnError} testId="inner-boundary">
              <NestedComponent />
            </ErrorBoundary>
          </div>
        </ErrorBoundary>,
      );

      // Inner boundary should catch the error
      expect(innerOnError).toHaveBeenCalled();
      expect(outerOnError).not.toHaveBeenCalled();

      // Inner boundary should show error UI
      expect(screen.getByTestId('inner-boundary')).toBeInTheDocument();
    });

    it('should work with context providers', () => {
      const TestContext = React.createContext<string>('default');

      const ContextConsumer = (): never => {
        const value = React.useContext(TestContext);
        throw new Error(`Context error: ${value}`);
      };

      const onError = jest.fn();

      render(
        <TestContext.Provider value="test-value">
          <ErrorBoundary onError={onError} testId="error-boundary">
            <ContextConsumer />
          </ErrorBoundary>
        </TestContext.Provider>,
      );

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Context error: test-value',
        }),
        expect.any(Object),
      );
    });
  });
});
