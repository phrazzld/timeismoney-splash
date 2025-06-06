/**
 * ErrorBoundary component exports
 *
 * Provides graceful error handling for React components with:
 * - Error catching and logging
 * - Custom fallback UI support
 * - Retry functionality
 * - Development error details
 * - Analytics integration
 * - Accessibility features
 *
 * @example
 * ```tsx
 * import { ErrorBoundary } from '@/components/ErrorBoundary';
 *
 * <ErrorBoundary
 *   onError={(error, errorInfo) => console.log('Error:', error)}
 *   enableRetry
 *   showErrorDetails
 * >
 *   <App />
 * </ErrorBoundary>
 * ```
 */

export { ErrorBoundary } from './ErrorBoundary';
export type {
  ErrorBoundaryProps,
  ErrorBoundaryState,
  ErrorBoundaryContext,
  ErrorReport,
} from './types';
export { ErrorBoundary as default } from './ErrorBoundary';
