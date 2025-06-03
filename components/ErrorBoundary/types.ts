/**
 * Types for Error Boundary component
 */

import type { ReactNode, ErrorInfo } from 'react';

/**
 * Error boundary state
 */
export interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly error?: Error;
  readonly errorInfo?: ErrorInfo;
  readonly errorId: string;
}

/**
 * Error boundary props
 */
export interface ErrorBoundaryProps {
  /**
   * Children to render when no error has occurred
   */
  readonly children: ReactNode;

  /**
   * Custom fallback UI to render when an error occurs
   */
  readonly fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo) => ReactNode);

  /**
   * Callback called when an error is caught
   */
  readonly onError?: (error: Error, errorInfo: ErrorInfo) => void;

  /**
   * Whether to automatically retry rendering after an error
   */
  readonly enableRetry?: boolean;

  /**
   * Custom retry button text
   */
  readonly retryButtonText?: string;

  /**
   * Whether to show technical error details in development
   */
  readonly showErrorDetails?: boolean;

  /**
   * Custom CSS classes for styling
   */
  readonly className?: string;

  /**
   * Test ID for testing purposes
   */
  readonly testId?: string;
}

/**
 * Error boundary context for nested error boundaries
 */
export interface ErrorBoundaryContext {
  readonly hasParentBoundary: boolean;
  readonly reportError: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Error report for logging and analytics
 */
export interface ErrorReport {
  readonly errorId: string;
  readonly error: {
    readonly name: string;
    readonly message: string;
    readonly stack?: string;
  };
  readonly errorInfo: {
    readonly componentStack: string;
  };
  readonly timestamp: string;
  readonly url: string;
  readonly userAgent: string;
  readonly correlationId: string;
  readonly context?: Record<string, unknown>;
}