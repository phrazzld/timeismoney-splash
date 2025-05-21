import React from 'react';

/**
 * Props for the TailwindTest component
 *
 * @interface TailwindTestProps
 * @property {'primary' | 'secondary' | 'neutral'} [variant='primary'] - Color variant to display
 */
export interface TailwindTestProps {
  variant?: 'primary' | 'secondary' | 'neutral';
}

/**
 * Component for testing Tailwind CSS color and utility classes
 * Displays various elements with different Tailwind styles
 *
 * @param {TailwindTestProps} props - Component props
 * @returns {React.ReactElement} Rendered component
 */
export const TailwindTest: React.FC<TailwindTestProps> = ({
  variant = 'primary',
}): React.ReactElement => {
  /**
   * Returns the appropriate Tailwind CSS classes based on the selected variant
   *
   * @returns {string} CSS class string for background and text colors
   */
  const getColorClass = (): string => {
    switch (variant) {
      case 'primary':
        return 'bg-primary text-primary-foreground';
      case 'secondary':
        return 'bg-secondary text-secondary-foreground';
      case 'neutral':
        return 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold">Tailwind CSS Test Component</h2>

      <div className={`${getColorClass()} p-4 rounded-md shadow-md`}>
        <p>This box uses Tailwind classes and should display the {variant} color</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-950 p-4 rounded-md shadow-md">
          <p className="text-black dark:text-white">Light/Dark Mode Text</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md shadow-md">
          <p className="text-gray-800 dark:text-gray-200">Gray Scale Test</p>
        </div>
        <div className="p-4 rounded-md shadow-md border border-neutral-200 dark:border-neutral-800">
          <p className="font-mono text-sm">Monospace Typography Test</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-100 rounded-full">
          Tag 1
        </span>
        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-100 rounded-full">
          Tag 2
        </span>
        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-100 rounded-full">
          Tag 3
        </span>
      </div>
    </div>
  );
};

export default TailwindTest;
