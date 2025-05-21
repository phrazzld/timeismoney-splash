import React from 'react';

/**
 * Props for the HtmlElementsTest component
 * @interface HtmlElementsTestProps
 * @property {boolean} [showHeadings=true] - Whether to show heading elements section
 * @property {boolean} [showText=true] - Whether to show text elements section
 * @property {boolean} [showLists=true] - Whether to show list elements section
 * @property {boolean} [showForms=true] - Whether to show form elements section
 * @property {boolean} [showTables=true] - Whether to show table elements section
 * @property {boolean} [isPadded=true] - Whether to add padding to the container
 * @property {'default' | 'brand' | 'neutral'} [colorTheme='default'] - Color theme variant
 */
export interface HtmlElementsTestProps {
  showHeadings?: boolean;
  showText?: boolean;
  showLists?: boolean;
  showForms?: boolean;
  showTables?: boolean;
  isPadded?: boolean;
  colorTheme?: 'default' | 'brand' | 'neutral';
}

/**
 * Component for testing HTML elements with Tailwind CSS styling
 * Renders various HTML elements with tailwind classes to test styling and design system
 *
 * @param {HtmlElementsTestProps} props - Component props
 * @returns {React.ReactElement} Rendered component
 */
export const HtmlElementsTest: React.FC<HtmlElementsTestProps> = ({
  showHeadings = true,
  showText = true,
  showLists = true,
  showForms = true,
  showTables = true,
  isPadded = true,
  colorTheme = 'default',
}): React.ReactElement => {
  /**
   * Generates CSS classes for the container based on props
   *
   * @returns {string} CSS class string
   */
  const getContainerClasses = (): string => {
    const baseClasses = isPadded ? 'space-y-8 p-6' : 'space-y-4';

    switch (colorTheme) {
      case 'brand':
        return `${baseClasses} bg-primary/5 dark:bg-primary/10 rounded-lg`;
      case 'neutral':
        return `${baseClasses} bg-neutral-100 dark:bg-neutral-900 rounded-lg`;
      default:
        return `${baseClasses} bg-white dark:bg-neutral-950 rounded-lg`;
    }
  };

  return (
    <div className={getContainerClasses()}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary dark:text-primary">HTML Elements Test</h1>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
          Storybook Test
        </span>
      </div>

      {showHeadings && (
        <section className="space-y-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
          <h2 className="text-xl font-semibold">Typography - Headings</h2>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Heading 1</h1>
            <h2 className="text-3xl font-bold">Heading 2</h2>
            <h3 className="text-2xl font-bold">Heading 3</h3>
            <h4 className="text-xl font-bold">Heading 4</h4>
            <h5 className="text-lg font-bold">Heading 5</h5>
            <h6 className="text-base font-bold">Heading 6</h6>
          </div>
        </section>
      )}

      {showText && (
        <section className="space-y-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
          <h2 className="text-xl font-semibold">Typography - Text</h2>
          <div className="space-y-4">
            <p className="text-lg">
              This is a paragraph with <strong>bold text</strong>, <em>italic text</em>, and{' '}
              <a href="#" className="text-primary underline">
                a link
              </a>
              .
            </p>
            <p className="text-base">
              Regular paragraph text that might contain{' '}
              <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded text-sm font-mono">
                inline code
              </code>{' '}
              or other elements.
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              A smaller paragraph with muted text that could be used for descriptions or less
              important information.
            </p>
            <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-md font-mono text-sm overflow-x-auto">
              <pre>{`// This is a code block
const greeting = "Hello, world!";
console.log(greeting);`}</pre>
            </div>
            <blockquote className="pl-4 border-l-4 border-primary italic">
              <p>
                This is a blockquote that might contain important quotations or highlighted
                information.
              </p>
              <footer className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                — Someone Important
              </footer>
            </blockquote>
          </div>
        </section>
      )}

      {showLists && (
        <section className="space-y-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
          <h2 className="text-xl font-semibold">Lists</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-2">Unordered List</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>First item</li>
                <li>
                  Second item with{' '}
                  <a href="#" className="text-primary underline">
                    a link
                  </a>
                </li>
                <li>
                  Third item with nested list
                  <ul className="list-circle list-inside pl-4 mt-1 space-y-1">
                    <li>Nested item 1</li>
                    <li>Nested item 2</li>
                  </ul>
                </li>
                <li>Fourth item</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Ordered List</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>First item</li>
                <li>
                  Second item with <strong>bold text</strong>
                </li>
                <li>
                  Third item with nested list
                  <ol className="list-decimal list-inside pl-4 mt-1 space-y-1">
                    <li>Nested item 1</li>
                    <li>Nested item 2</li>
                  </ol>
                </li>
                <li>Fourth item</li>
              </ol>
            </div>
          </div>
        </section>
      )}

      {showForms && (
        <section className="space-y-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
          <h2 className="text-xl font-semibold">Form Elements</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="text-input" className="block text-sm font-medium">
                  Text Input
                </label>
                <input
                  id="text-input"
                  type="text"
                  className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter text"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email-input" className="block text-sm font-medium">
                  Email Input
                </label>
                <input
                  id="email-input"
                  type="email"
                  className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="textarea" className="block text-sm font-medium">
                Textarea
              </label>
              <textarea
                id="textarea"
                className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter multiple lines of text"
                rows={3}
              ></textarea>
            </div>
            <div className="space-y-2">
              <label htmlFor="select" className="block text-sm font-medium">
                Select
              </label>
              <select
                id="select"
                className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
            <div className="space-y-2">
              <span className="block text-sm font-medium">Checkboxes</span>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="checkbox-1"
                    type="checkbox"
                    className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="checkbox-1" className="ml-2 text-sm">
                    Option 1
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="checkbox-2"
                    type="checkbox"
                    className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                    defaultChecked
                  />
                  <label htmlFor="checkbox-2" className="ml-2 text-sm">
                    Option 2 (checked)
                  </label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <span className="block text-sm font-medium">Radio Buttons</span>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="radio-1"
                    type="radio"
                    name="radio-group"
                    className="h-4 w-4 border-neutral-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="radio-1" className="ml-2 text-sm">
                    Option 1
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="radio-2"
                    type="radio"
                    name="radio-group"
                    className="h-4 w-4 border-neutral-300 text-primary focus:ring-primary"
                    defaultChecked
                  />
                  <label htmlFor="radio-2" className="ml-2 text-sm">
                    Option 2 (checked)
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Primary Button
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
              >
                Secondary Button
              </button>
            </div>
          </form>
        </section>
      )}

      {showTables && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Table</h2>
          <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
              <thead className="bg-neutral-50 dark:bg-neutral-900">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-neutral-950">
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">Jane Cooper</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                    Product Designer
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-primary">Edit</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">John Doe</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                    Software Engineer
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                      Pending
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-primary">Edit</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">Alice Smith</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                    Marketing Specialist
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                      Inactive
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-primary">Edit</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default HtmlElementsTest;
