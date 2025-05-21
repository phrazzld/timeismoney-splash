import React from 'react';

/**
 * Props for the ThemeTest component
 */
export interface ThemeTestProps {
  /**
   * Optional title to display
   */
  title?: string;
}

/**
 * A component to test theme switching functionality in Storybook.
 * Displays various elements with theme-specific styles.
 */
export const ThemeTest: React.FC<ThemeTestProps> = ({
  title = 'Theme Test Component'
}): React.ReactNode => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-white mb-4">
          Theme Switching Test
        </h2>
        
        <p className="text-neutral-600 dark:text-neutral-300 mb-4">
          This component demonstrates theme switching between light and dark modes.
          Use the theme toggle in the Storybook toolbar to switch between themes.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded">
            <h3 className="font-medium text-primary dark:text-primary/90 mb-2">
              Primary Color Section
            </h3>
            <p className="text-neutral-700 dark:text-neutral-200 text-sm">
              This section uses the primary color with different opacities.
            </p>
          </div>
          
          <div className="bg-neutral-100 dark:bg-neutral-700 p-4 rounded">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              Neutral Color Section
            </h3>
            <p className="text-neutral-700 dark:text-neutral-300 text-sm">
              This section uses neutral colors for a more subtle appearance.
            </p>
          </div>
        </div>
      </div>
      
      <div className="text-sm text-neutral-500 dark:text-neutral-400 italic">
        Toggle the theme using the Theme control in the Storybook toolbar.
      </div>
    </div>
  );
};

export default ThemeTest;