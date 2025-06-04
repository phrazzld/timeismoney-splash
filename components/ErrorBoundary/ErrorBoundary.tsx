'use client';

/**
 * ErrorBoundary component for graceful error handling
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logging';
import { getCurrentCorrelationId, generateCorrelationId } from '@/lib/logging/correlation';
import { captureError } from '@/lib/monitoring';
import type { ErrorBoundaryProps, ErrorBoundaryState, ErrorReport } from './types';

/**
 * ErrorBoundary component that catches JavaScript errors anywhere in the child
 * component tree, logs those errors, and displays a fallback UI instead of the
 * component tree that crashed.
 *
 * Features:
 * - Catches and handles component errors gracefully
 * - Integrates with structured logging system
 * - Supports custom fallback UI
 * - Provides retry functionality
 * - Shows error details in development mode
 * - Tracks errors with correlation IDs
 * - Accessible error reporting
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={<CustomErrorUI />}
 *   onError={(error, errorInfo) => console.log('Error caught:', error)}
 *   enableRetry
 * >
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      errorId: '',
    };
  }

  /**
   * Static method called when an error is caught
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state to trigger fallback UI
    return {
      hasError: true,
      error,
      errorId: generateCorrelationId(),
    };
  }

  /**
   * Called when an error is caught during rendering
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    try {
      // Create error report
      const errorReport = this.createErrorReport(error, errorInfo);

      // Log the error with structured logging
      this.logError(error, errorInfo, errorReport);

      // Track error in analytics if available
      this.trackError(error, errorInfo, errorReport);

      // Capture error in monitoring system
      this.captureErrorInMonitoring(error, errorInfo, errorReport);

      // Call custom error handler if provided
      if (this.props.onError) {
        this.props.onError(error, errorInfo);
      }
    } catch (reportingError) {
      // Prevent infinite loops if error reporting itself fails
      console.error('Failed to report error:', reportingError);
      console.error('Original error:', error);
    }
  }

  /**
   * Called when component updates
   */
  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    const { children } = this.props;
    const { hasError } = this.state;

    // Reset error state if children change (indicating navigation or component change)
    if (hasError && prevProps.children !== children) {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        errorId: '',
      });
      this.retryCount = 0;
    }
  }

  /**
   * Creates a structured error report
   */
  private createErrorReport(error: Error, errorInfo: ErrorInfo): ErrorReport {
    const correlationId = getCurrentCorrelationId() || generateCorrelationId();

    return {
      errorId: this.state.errorId,
      error: {
        name: error?.name || 'Unknown',
        message: error?.message || String(error),
        stack: error?.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      correlationId,
      context: {
        retryCount: this.retryCount,
        maxRetries: this.maxRetries,
      },
    };
  }

  /**
   * Logs the error using structured logging
   */
  private logError(error: Error, errorInfo: ErrorInfo, errorReport: ErrorReport): void {
    logger.error('Component error caught by ErrorBoundary', error, {
      errorId: errorReport.errorId,
      componentStack: errorInfo.componentStack,
      url: errorReport.url,
      userAgent: errorReport.userAgent,
      correlationId: errorReport.correlationId,
      retryCount: this.retryCount,
    });
  }

  /**
   * Tracks the error in analytics if available
   */
  private trackError(error: Error, errorInfo: ErrorInfo, errorReport: ErrorReport): void {
    try {
      // Try to import analytics dynamically
      import('@/lib/analytics')
        .then(({ analytics }) => {
          analytics.track('Component Error', {
            errorId: errorReport.errorId,
            errorName: errorReport.error.name,
            errorMessage: errorReport.error.message,
            componentStack: errorInfo.componentStack,
            url: errorReport.url,
            correlationId: errorReport.correlationId,
            retryCount: this.retryCount,
          });
        })
        .catch(() => {
          // Analytics not available, continue silently
        });
    } catch {
      // Analytics tracking failed, continue silently
    }
  }

  /**
   * Captures the error in the monitoring system
   */
  private captureErrorInMonitoring(
    error: Error,
    errorInfo: ErrorInfo,
    errorReport: ErrorReport,
  ): void {
    try {
      // Create enhanced error with component stack
      const enhancedError = new Error(error.message);
      enhancedError.name = error.name;
      enhancedError.stack = error.stack;
      (enhancedError as unknown).componentStack = errorInfo.componentStack;

      // Capture error with enhanced context
      captureError(enhancedError, {
        level: 'error',
        url: errorReport.url,
        userAgent: errorReport.userAgent,
        tags: {
          errorId: errorReport.errorId,
          source: 'ErrorBoundary',
          retryCount: this.retryCount.toString(),
        },
        extra: {
          errorId: errorReport.errorId,
          componentStack: errorInfo.componentStack,
          correlationId: errorReport.correlationId,
          retryCount: this.retryCount,
          maxRetries: this.maxRetries,
          timestamp: errorReport.timestamp,
        },
      }).catch(() => {
        // Monitoring not available, continue silently
      });
    } catch {
      // Monitoring capture failed, continue silently
    }
  }

  /**
   * Handles retry button click
   */
  private handleRetry = (): void => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount += 1;

      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        errorId: '',
      });

      // Log retry attempt
      logger.info('ErrorBoundary retry attempted', {
        retryCount: this.retryCount,
        maxRetries: this.maxRetries,
        errorId: this.state.errorId,
      });
    }
  };

  /**
   * Renders the component
   */
  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const {
      children,
      fallback,
      enableRetry = true,
      retryButtonText = 'Try Again',
      showErrorDetails = false,
      className,
      testId,
    } = this.props;

    // Render children normally if no error
    if (!hasError) {
      return children;
    }

    // Render custom fallback if provided
    if (fallback) {
      if (typeof fallback === 'function' && error && errorInfo) {
        return fallback(error, errorInfo);
      }
      return fallback;
    }

    // Render default error UI
    return this.renderDefaultErrorUI(error, errorInfo, {
      enableRetry,
      retryButtonText,
      showErrorDetails,
      className,
      testId,
    });
  }

  /**
   * Renders the default error UI
   */
  private renderDefaultErrorUI(
    error: Error | undefined,
    errorInfo: ErrorInfo | undefined,
    options: {
      enableRetry: boolean;
      retryButtonText: string;
      showErrorDetails: boolean;
      className?: string;
      testId?: string;
    },
  ): ReactNode {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const canRetry = options.enableRetry && this.retryCount < this.maxRetries;

    const containerClasses = cn(
      'flex flex-col items-center justify-center',
      'p-8 border border-red-200 rounded-lg bg-red-50',
      'text-center space-y-4',
      options.className,
    );

    const headingClasses = cn('text-xl font-semibold text-red-800');

    const textClasses = cn('text-red-600 max-w-md');

    const buttonClasses = cn(
      'px-4 py-2 bg-red-600 text-white rounded',
      'hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500',
      'transition-colors duration-200',
    );

    const detailsClasses = cn(
      'mt-6 p-4 bg-red-100 rounded border border-red-200',
      'text-left text-sm text-red-800 max-w-2xl',
    );

    return (
      <div
        className={containerClasses}
        role="alert"
        aria-live="polite"
        data-testid={options.testId}
      >
        <div className="flex items-center space-x-2">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h2 className={headingClasses}>Something went wrong</h2>
        </div>

        <p className={textClasses}>
          An unexpected error occurred. We apologize for the inconvenience.
          {canRetry && ' You can try again or refresh the page.'}
        </p>

        {canRetry && (
          <button onClick={this.handleRetry} className={buttonClasses} type="button">
            {options.retryButtonText}
          </button>
        )}

        {this.retryCount >= this.maxRetries && (
          <p className="text-sm text-red-500">
            Maximum retry attempts reached. Please refresh the page.
          </p>
        )}

        {options.showErrorDetails && isDevelopment && error && (
          <details className={detailsClasses}>
            <summary className="font-semibold cursor-pointer">
              Error Details (Development Mode)
            </summary>
            <div className="mt-2 space-y-2">
              <div>
                <strong>Error:</strong> {error.message}
              </div>
              {error.stack && (
                <div>
                  <strong>Stack Trace:</strong>
                  <pre className="mt-1 text-xs overflow-auto whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </div>
              )}
              {errorInfo?.componentStack && (
                <div>
                  <strong>Component Stack:</strong>
                  <pre className="mt-1 text-xs overflow-auto whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
              <div>
                <strong>Error ID:</strong> {this.state.errorId}
              </div>
              <div>
                <strong>Retry Count:</strong> {this.retryCount} / {this.maxRetries}
              </div>
            </div>
          </details>
        )}
      </div>
    );
  }
}

export default ErrorBoundary;
