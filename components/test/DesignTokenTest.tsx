/**
 * Design Token Test Component
 *
 * This component is used to visually test the application of design tokens (colors, typography, spacing)
 * in both light and dark modes. It provides a comprehensive visual reference for all design tokens
 * and allows toggling between light and dark mode.
 *
 * @returns {React.ReactElement} Rendered component
 */

'use client';

import React, { useState } from 'react';

/**
 * Component that displays all design tokens in the system with a toggle for dark mode
 * Used for visual testing and verification of the design system
 *
 * @returns {React.ReactElement} Rendered component with all design tokens
 */
export const DesignTokenTest: React.FC = (): React.ReactElement => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = (): void => {
    setDarkMode(!darkMode);
    // Toggle dark class on html element
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Design Token Test</h1>
        <button
          className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded"
          onClick={toggleDarkMode}
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      {/* Colors Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Brand Colors</h2>

        {/* Primary Colors */}
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">Primary</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary rounded-md mb-2"></div>
              <span className="text-sm">primary</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/90 rounded-md mb-2"></div>
              <span className="text-sm">primary/90 (hover)</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/75 rounded-md mb-2"></div>
              <span className="text-sm">primary/75 (light)</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary-foreground rounded-md mb-2"></div>
              <span className="text-sm">primary-foreground</span>
            </div>
          </div>
        </div>

        {/* Secondary Colors */}
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">Secondary</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-secondary rounded-md mb-2"></div>
              <span className="text-sm">secondary</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-secondary/90 rounded-md mb-2"></div>
              <span className="text-sm">secondary/90 (hover)</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-secondary/75 rounded-md mb-2"></div>
              <span className="text-sm">secondary/75 (light)</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-secondary-foreground rounded-md mb-2"></div>
              <span className="text-sm">secondary-foreground</span>
            </div>
          </div>
        </div>

        {/* Accent Colors */}
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">Accent</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-accent rounded-md mb-2"></div>
              <span className="text-sm">accent</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-accent/90 rounded-md mb-2"></div>
              <span className="text-sm">accent/90 (hover)</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-accent/75 rounded-md mb-2"></div>
              <span className="text-sm">accent/75 (light)</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-accent-foreground rounded-md mb-2"></div>
              <span className="text-sm">accent-foreground</span>
            </div>
          </div>
        </div>
      </section>

      {/* Neutral + Semantic Colors */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">UI Colors</h2>

        {/* Neutral Colors */}
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">Neutral Shades</h3>
          <div className="grid grid-cols-5 gap-4">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
              <div key={shade} className="flex flex-col items-center">
                <div
                  className={`w-16 h-16 rounded-md mb-2`}
                  style={{ backgroundColor: `var(--color-neutral-${shade})` }}
                ></div>
                <span className="text-sm">neutral-{shade}</span>
              </div>
            ))}
          </div>
        </div>

        {/* UI Element Colors */}
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">UI Elements</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-background border border-border rounded-md mb-2"></div>
              <span className="text-sm">background</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-foreground rounded-md mb-2"></div>
              <span className="text-sm">foreground</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-card rounded-md mb-2"></div>
              <span className="text-sm">card</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-card-foreground rounded-md mb-2"></div>
              <span className="text-sm">card-foreground</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-muted rounded-md mb-2"></div>
              <span className="text-sm">muted</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-muted-foreground rounded-md mb-2"></div>
              <span className="text-sm">muted-foreground</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-border rounded-md mb-2"></div>
              <span className="text-sm">border</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-input rounded-md mb-2"></div>
              <span className="text-sm">input</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-ring rounded-md mb-2"></div>
              <span className="text-sm">ring</span>
            </div>
          </div>
        </div>

        {/* Semantic Colors */}
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">Semantic Colors</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-destructive rounded-md mb-2"></div>
              <span className="text-sm">destructive (error)</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-md mb-2 bg-[color:var(--chart-1)]"></div>
              <span className="text-sm">chart-1 (success)</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-md mb-2 bg-[color:var(--chart-5)]"></div>
              <span className="text-sm">chart-5 (warning)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Typography Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Typography</h2>

        {/* Font Families */}
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">Font Families</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-card rounded-md">
              <h4 className="text-lg font-medium mb-2">Sans (Geist Sans)</h4>
              <p className="font-sans">The quick brown fox jumps over the lazy dog.</p>
            </div>
            <div className="p-4 bg-card rounded-md">
              <h4 className="text-lg font-medium mb-2">Mono (Geist Mono)</h4>
              <p className="font-mono">const greeting = &quot;Hello, World!&quot;;</p>
            </div>
          </div>
        </div>

        {/* Headings */}
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">Headings</h3>
          <div className="space-y-4">
            <h1 className="text-5xl font-bold leading-tight tracking-tight">Heading 1 (5xl)</h1>
            <h2 className="text-4xl font-bold leading-tight tracking-tight">Heading 2 (4xl)</h2>
            <h3 className="text-3xl font-semibold leading-snug">Heading 3 (3xl)</h3>
            <h4 className="text-2xl font-semibold leading-snug">Heading 4 (2xl)</h4>
            <h5 className="text-xl font-semibold leading-normal">Heading 5 (xl)</h5>
            <h6 className="text-lg font-semibold leading-normal">Heading 6 (lg)</h6>
          </div>
        </div>

        {/* Body Text */}
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">Body Text</h3>
          <div className="space-y-4">
            <p className="text-lg leading-relaxed">
              Body Large (lg): Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut vel eros
              at lacus lacinia condimentum.
            </p>
            <p className="text-base leading-normal">
              Body (base): Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut vel eros at
              lacus lacinia condimentum.
            </p>
            <p className="text-sm leading-normal">
              Body Small (sm): Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut vel eros
              at lacus lacinia condimentum.
            </p>
          </div>
        </div>

        {/* Utility Text */}
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">Utility Text</h3>
          <div className="space-y-4">
            <p className="text-xs leading-normal">
              Caption (xs): Small text for captions and labels.
            </p>
            <p className="text-xs font-medium tracking-wider uppercase leading-normal">
              Overline (xs, uppercase): Used for section labels.
            </p>
            <p className="text-sm font-medium leading-normal">
              Label (sm, medium): Form labels and small headings.
            </p>
          </div>
        </div>

        {/* Code Text */}
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">Code</h3>
          <div className="space-y-4">
            <p>
              Inline <code className="font-mono text-sm px-1 py-0.5 bg-muted rounded">code</code>{' '}
              example.
            </p>
            <pre className="font-mono text-sm leading-relaxed p-4 bg-muted rounded-md">
              {`function hello() {
  console.log("Hello, world!");
  return true;
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* Spacing Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Spacing</h2>

        {/* Basic Spacing Scale */}
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">Basic Spacing Scale (8px Base Unit)</h3>
          <div className="flex flex-wrap gap-4">
            {[
              { key: 'px', label: 'px (1px)' },
              { key: '0.5', label: '0.5 (2px)' },
              { key: '1', label: '1 (4px)' },
              { key: '2', label: '2 (8px)' },
              { key: '3', label: '3 (12px)' },
              { key: '4', label: '4 (16px)' },
              { key: '6', label: '6 (24px)' },
              { key: '8', label: '8 (32px)' },
              { key: '12', label: '12 (48px)' },
              { key: '16', label: '16 (64px)' },
            ].map((spacing) => (
              <div key={spacing.key} className="flex flex-col items-center">
                <div className={`bg-primary p-${spacing.key} rounded-md mb-2`}>
                  <div className="bg-accent w-4 h-4 rounded-sm"></div>
                </div>
                <span className="text-xs">{spacing.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Spacing in Action */}
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">Spacing in Components</h3>
          <div className="space-y-4">
            <div className="p-4 bg-card rounded-md">
              <h4 className="text-lg font-medium mb-2">Card with Padding</h4>
              <p className="mb-4">
                This card has p-4 (16px) padding and mb-4 spacing between elements.
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-2 bg-primary text-primary-foreground rounded">
                  Button
                </button>
                <button className="px-3 py-2 bg-secondary text-secondary-foreground rounded">
                  Button
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="p-3 bg-card rounded-md text-center">Gap 6 (24px)</div>
              <div className="p-3 bg-card rounded-md text-center">Between</div>
              <div className="p-3 bg-card rounded-md text-center">Grid Items</div>
            </div>
          </div>
        </div>
      </section>

      {/* Input and Interactive Elements */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Interactive Elements</h2>

        {/* Buttons */}
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">Buttons</h3>
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded">
              Primary
            </button>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded">
              Secondary
            </button>
            <button className="px-4 py-2 bg-accent text-accent-foreground hover:bg-accent/90 rounded">
              Accent
            </button>
            <button className="px-4 py-2 bg-destructive text-white hover:bg-destructive/90 rounded">
              Destructive
            </button>
            <button className="px-4 py-2 bg-muted hover:bg-muted/90 rounded">Muted</button>
            <button className="px-4 py-2 border border-border bg-background hover:bg-muted rounded">
              Outline
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">Inputs</h3>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1">Text Input</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-background border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter text..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Select Input</label>
              <select className="w-full px-3 py-2 bg-background border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="check"
                className="h-4 w-4 border border-input rounded bg-background focus:outline-none focus:ring-2 focus:ring-ring text-primary"
              />
              <label htmlFor="check" className="ml-2 text-sm">
                Checkbox
              </label>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DesignTokenTest;
