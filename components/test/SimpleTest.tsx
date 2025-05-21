import React from 'react';

/**
 * Props for the SimpleTest component
 *
 * @interface SimpleTestProps
 * @property {string} [text='Hello Storybook'] - The text to display in the component
 * @property {'primary' | 'secondary' | 'default'} [variant='default'] - The style variant to apply
 */
export interface SimpleTestProps {
  text?: string;
  variant?: 'primary' | 'secondary' | 'default';
}

/**
 * A simple component to test Tailwind CSS integration with Storybook.
 * This component displays text with different background colors based on the variant.
 *
 * @param {SimpleTestProps} props - Component props
 * @returns {React.ReactElement} Rendered component
 */
export const SimpleTest: React.FC<SimpleTestProps> = ({
  text = 'Hello Storybook',
  variant = 'default',
}): React.ReactElement => {
  /**
   * Returns the CSS classes to apply based on the variant
   *
   * @returns {string} Tailwind CSS class string
   */
  const getClasses = (): string => {
    const baseClasses = 'p-6 rounded-lg';

    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100`;
      case 'secondary':
        return `${baseClasses} bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100`;
      default:
        return `${baseClasses} bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100`;
    }
  };

  return (
    <div className={getClasses()}>
      <h2 className="text-2xl font-bold mb-4">{text}</h2>
      <div className="space-y-4">
        <p className="text-lg">
          This is a simple component to test that Tailwind CSS is working with Storybook.
        </p>
        <div className="flex space-x-2">
          <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 rounded">
            Label 1
          </span>
          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 rounded">
            Label 2
          </span>
          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 rounded">
            Label 3
          </span>
        </div>
      </div>
    </div>
  );
};

export default SimpleTest;
