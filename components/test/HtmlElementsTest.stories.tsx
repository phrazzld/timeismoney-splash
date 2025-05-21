import type { Meta, StoryObj } from '@storybook/react';
import { HtmlElementsTest } from './HtmlElementsTest';

const meta: Meta<typeof HtmlElementsTest> = {
  title: 'Test/HtmlElementsTest',
  component: HtmlElementsTest,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A comprehensive test component to verify that Storybook is correctly set up with Tailwind CSS and all styles are applied properly. This component includes various HTML elements and Tailwind utilities to test typography, spacing, colors, and responsive design.',
      },
    },
    a11y: {
      // Additional accessibility configurations can be added here
      config: {
        rules: [
          {
            // Example of enabling a specific rule
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
  argTypes: {
    showHeadings: {
      control: 'boolean',
      description: 'Display heading typography examples',
      defaultValue: true,
    },
    showText: {
      control: 'boolean',
      description: 'Display text and paragraph examples',
      defaultValue: true,
    },
    showLists: {
      control: 'boolean',
      description: 'Display ordered and unordered lists',
      defaultValue: true,
    },
    showForms: {
      control: 'boolean',
      description: 'Display form elements like inputs, checkboxes, etc.',
      defaultValue: true,
    },
    showTables: {
      control: 'boolean',
      description: 'Display table examples',
      defaultValue: true,
    },
    isPadded: {
      control: 'boolean',
      description: 'Add padding to the container',
      defaultValue: true,
    },
    colorTheme: {
      control: 'select',
      options: ['default', 'brand', 'neutral'],
      description: 'Container background theme',
      defaultValue: 'default',
    },
  },
};

export default meta;
type Story = StoryObj<typeof HtmlElementsTest>;

/**
 * The default story shows all HTML elements with default styling.
 */
export const Default: Story = {
  args: {
    showHeadings: true,
    showText: true,
    showLists: true,
    showForms: true,
    showTables: true,
    isPadded: true,
    colorTheme: 'default',
  },
};

/**
 * This story shows the component with a brand color theme background.
 */
export const BrandTheme: Story = {
  args: {
    ...Default.args,
    colorTheme: 'brand',
  },
};

/**
 * This story only shows typography elements.
 */
export const TypographyOnly: Story = {
  args: {
    ...Default.args,
    showHeadings: true,
    showText: true,
    showLists: false,
    showForms: false,
    showTables: false,
  },
};

/**
 * This story only shows form elements.
 */
export const FormsOnly: Story = {
  args: {
    ...Default.args,
    showHeadings: false,
    showText: false,
    showLists: false,
    showForms: true,
    showTables: false,
  },
};

/**
 * This story shows a more compact layout with less padding.
 */
export const Compact: Story = {
  args: {
    ...Default.args,
    isPadded: false,
  },
};
