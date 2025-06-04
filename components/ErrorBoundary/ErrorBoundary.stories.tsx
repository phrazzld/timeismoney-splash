/**
 * Storybook stories for ErrorBoundary component
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import type { ErrorBoundaryProps as _ErrorBoundaryProps } from './types';

// Component that throws an error for testing
const ThrowError: React.FC<{ message?: string; shouldThrow?: boolean }> = ({
  message = 'Test error for Storybook',
  shouldThrow = true,
}) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return (
    <div className="p-4 bg-green-100 text-green-800 rounded">Component rendered successfully!</div>
  );
};

// Component with async error
const AsyncError: React.FC = () => {
  const [shouldThrow, setShouldThrow] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShouldThrow(true);
    }, 2000);

    return (): void => clearTimeout(timer);
  }, []);

  if (shouldThrow) {
    throw new Error('Async error after 2 seconds');
  }

  return (
    <div className="p-4 bg-blue-100 text-blue-800 rounded">
      Loading... (will error in 2 seconds)
    </div>
  );
};

// Normal working component
const WorkingComponent: React.FC = () => (
  <div className="p-6 bg-green-100 text-green-800 rounded-lg">
    <h3 className="text-lg font-semibold mb-2">Working Component</h3>
    <p>This component renders without any errors.</p>
    <button className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
      Click me
    </button>
  </div>
);

// Complex component with hooks
const ComplexComponent: React.FC<{ shouldError?: boolean }> = ({ shouldError = false }) => {
  const [count, setCount] = React.useState(0);
  const [data, setData] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (shouldError && count > 2) {
      throw new Error('Error triggered by useEffect when count > 2');
    }

    setData((prev) => [...prev, `Item ${count}`]);
  }, [count, shouldError]);

  return (
    <div className="p-4 border rounded-lg">
      <h4 className="font-semibold mb-2">Complex Component with Hooks</h4>
      <p>Count: {count}</p>
      <button
        onClick={() => setCount((c) => c + 1)}
        className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Increment (will error when count &gt; 2)
      </button>
      <div className="mt-2">
        <strong>Data:</strong>
        <ul className="list-disc list-inside">
          {data.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Components/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    docs: {
      description: {
        component: `
The ErrorBoundary component catches JavaScript errors anywhere in the child component tree, 
logs those errors, and displays a fallback UI instead of crashing the entire application.

## Features

- **Error Catching**: Catches and handles component errors gracefully
- **Structured Logging**: Integrates with the application's logging system
- **Custom Fallback**: Supports custom fallback UI components
- **Retry Functionality**: Allows users to retry failed operations
- **Development Details**: Shows error details in development mode
- **Analytics Integration**: Tracks errors for monitoring
- **Accessibility**: Proper ARIA attributes for screen readers

## Use Cases

- Wrapping entire application or major sections
- Protecting critical user flows
- Providing fallback UI for external library errors
- Development debugging with detailed error information
        `,
      },
    },
  },
  argTypes: {
    children: {
      description: 'Children components to render',
      control: false,
    },
    fallback: {
      description: 'Custom fallback UI to render on error',
      control: false,
    },
    onError: {
      description: 'Callback function called when error occurs',
      control: false,
    },
    enableRetry: {
      description: 'Whether to show retry button',
      control: 'boolean',
    },
    retryButtonText: {
      description: 'Text for the retry button',
      control: 'text',
    },
    showErrorDetails: {
      description: 'Whether to show error details in development',
      control: 'boolean',
    },
    className: {
      description: 'Additional CSS classes',
      control: 'text',
    },
    testId: {
      description: 'Test ID for testing',
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

/**
 * Default error boundary with basic error handling
 */
export const Default: Story = {
  args: {
    enableRetry: true,
    showErrorDetails: true,
    testId: 'error-boundary',
  },
  render: (args) => (
    <ErrorBoundary {...args}>
      <ThrowError />
    </ErrorBoundary>
  ),
};

/**
 * Error boundary with working component (no error)
 */
export const NoError: Story = {
  args: {
    enableRetry: true,
    showErrorDetails: true,
    testId: 'error-boundary',
  },
  render: (args) => (
    <ErrorBoundary {...args}>
      <WorkingComponent />
    </ErrorBoundary>
  ),
};

/**
 * Error boundary with custom fallback UI
 */
export const CustomFallback: Story = {
  args: {
    fallback: (
      <div className="p-8 bg-purple-100 border border-purple-300 rounded-lg text-center">
        <div className="text-purple-600 text-6xl mb-4">🔮</div>
        <h2 className="text-2xl font-bold text-purple-800 mb-2">Magic Error!</h2>
        <p className="text-purple-600">Something magical went wrong, but don&apos;t worry!</p>
      </div>
    ),
    testId: 'error-boundary',
  },
  render: (args) => (
    <ErrorBoundary {...args}>
      <ThrowError message="Custom fallback error" />
    </ErrorBoundary>
  ),
};

/**
 * Error boundary with custom fallback function
 */
export const CustomFallbackFunction: Story = {
  args: {
    fallback: (error: Error) => (
      <div className="p-6 bg-orange-100 border border-orange-300 rounded-lg">
        <h2 className="text-xl font-bold text-orange-800 mb-2">Custom Error Handler</h2>
        <p className="text-orange-600 mb-2">
          Caught error: <code className="bg-orange-200 px-1 rounded">{error.message}</code>
        </p>
        <p className="text-sm text-orange-500">This is a custom fallback function.</p>
      </div>
    ),
    testId: 'error-boundary',
  },
  render: (args) => (
    <ErrorBoundary {...args}>
      <ThrowError message="Function fallback error" />
    </ErrorBoundary>
  ),
};

/**
 * Error boundary with retry disabled
 */
export const NoRetry: Story = {
  args: {
    enableRetry: false,
    showErrorDetails: true,
    testId: 'error-boundary',
  },
  render: (args) => (
    <ErrorBoundary {...args}>
      <ThrowError />
    </ErrorBoundary>
  ),
};

/**
 * Error boundary with custom retry button text
 */
export const CustomRetryText: Story = {
  args: {
    enableRetry: true,
    retryButtonText: '🔄 Reload Component',
    showErrorDetails: true,
    testId: 'error-boundary',
  },
  render: (args) => (
    <ErrorBoundary {...args}>
      <ThrowError />
    </ErrorBoundary>
  ),
};

/**
 * Error boundary with complex component that has hooks
 */
export const ComplexComponentError: Story = {
  args: {
    enableRetry: true,
    showErrorDetails: true,
    testId: 'error-boundary',
  },
  render: (args) => (
    <div className="space-y-4">
      <div className="p-4 bg-blue-100 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
        <p className="text-blue-600">
          Click the increment button more than 2 times to trigger an error in useEffect.
        </p>
      </div>
      <ErrorBoundary {...args}>
        <ComplexComponent shouldError />
      </ErrorBoundary>
    </div>
  ),
};

/**
 * Error boundary with async error (delayed)
 */
export const AsyncError: Story = {
  args: {
    enableRetry: true,
    showErrorDetails: true,
    testId: 'error-boundary',
  },
  render: (args) => (
    <div className="space-y-4">
      <div className="p-4 bg-yellow-100 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">Async Error Demo:</h3>
        <p className="text-yellow-600">This component will throw an error after 2 seconds.</p>
      </div>
      <ErrorBoundary {...args}>
        <AsyncError />
      </ErrorBoundary>
    </div>
  ),
};

/**
 * Error boundary with custom styling
 */
export const CustomStyling: Story = {
  args: {
    enableRetry: true,
    showErrorDetails: true,
    className: 'bg-gradient-to-r from-red-100 to-pink-100 border-red-300 shadow-lg',
    testId: 'error-boundary',
  },
  render: (args) => (
    <ErrorBoundary {...args}>
      <ThrowError message="Styled error boundary" />
    </ErrorBoundary>
  ),
};

/**
 * Nested error boundaries demonstration
 */
export const NestedErrorBoundaries: Story = {
  args: {},
  render: () => (
    <div className="space-y-4">
      <div className="p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Nested Error Boundaries:</h3>
        <p className="text-gray-600">Outer boundary catches errors from inner boundary.</p>
      </div>

      {/* Outer Error Boundary */}
      <ErrorBoundary
        enableRetry
        testId="outer-boundary"
        fallback={
          <div className="p-4 bg-blue-100 border border-blue-300 rounded">
            <h3 className="text-blue-800 font-semibold">Outer Boundary Caught Error</h3>
          </div>
        }
      >
        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold mb-2">Outer Component</h4>

          {/* Inner Error Boundary */}
          <ErrorBoundary
            enableRetry
            testId="inner-boundary"
            fallback={
              <div className="p-3 bg-green-100 border border-green-300 rounded">
                <h4 className="text-green-800 font-semibold">Inner Boundary Caught Error</h4>
              </div>
            }
          >
            <div className="p-3 bg-gray-50 rounded">
              <ThrowError message="Inner component error" />
            </div>
          </ErrorBoundary>
        </div>
      </ErrorBoundary>
    </div>
  ),
};

/**
 * Multiple independent error boundaries
 */
export const MultipleErrorBoundaries: Story = {
  args: {},
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ErrorBoundary enableRetry testId="boundary-1">
        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold mb-2">Section 1</h4>
          <WorkingComponent />
        </div>
      </ErrorBoundary>

      <ErrorBoundary enableRetry testId="boundary-2">
        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold mb-2">Section 2</h4>
          <ThrowError message="Section 2 error" />
        </div>
      </ErrorBoundary>

      <ErrorBoundary enableRetry testId="boundary-3">
        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold mb-2">Section 3</h4>
          <ComplexComponent />
        </div>
      </ErrorBoundary>

      <ErrorBoundary enableRetry testId="boundary-4">
        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold mb-2">Section 4</h4>
          <WorkingComponent />
        </div>
      </ErrorBoundary>
    </div>
  ),
};

/**
 * Error boundary with logging callback
 */
export const WithLogging: Story = {
  args: {
    enableRetry: true,
    showErrorDetails: true,
    onError: (error, errorInfo) => {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    },
    testId: 'error-boundary',
  },
  render: (args) => (
    <div className="space-y-4">
      <div className="p-4 bg-blue-100 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Check Console:</h3>
        <p className="text-blue-600">Error details will be logged to the browser console.</p>
      </div>
      <ErrorBoundary {...args}>
        <ThrowError message="Logged error example" />
      </ErrorBoundary>
    </div>
  ),
};
