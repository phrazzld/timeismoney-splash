import type { Meta, StoryObj } from '@storybook/react';
import { Typography } from './Typography';
import { typographyPresets } from '../../../design-tokens/typography';

/**
 * The Typography component provides a consistent set of text styles across the application.
 * It maps semantic variants to appropriate HTML elements and Tailwind CSS classes.
 *
 * ## Features
 * - Predefined typography styles with appropriate defaults
 * - Semantic HTML elements with the ability to override via the `as` prop
 * - Full compatibility with Tailwind CSS through className merging
 * - Support for light and dark mode
 * - Accessible by default with semantic HTML elements
 *
 * ## Accessibility
 * - Uses semantic HTML elements by default (h1-h6, p, etc.)
 * - Allows element override when needed while maintaining visual style
 * - Maintains appropriate contrast in both light and dark modes
 *
 * ## Usage Guidelines
 * - Use heading variants (h1-h6) for section headings, following hierarchical structure
 * - Use body variants for paragraph text
 * - Use utility variants (caption, overline, label) for specific UI contexts
 * - When overriding HTML element with `as` prop, ensure it makes semantic sense
 */
const meta: Meta<typeof Typography> = {
  title: 'Atoms/Typography',
  component: Typography,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Typography component for consistent text styling throughout the application, based on the design system typography tokens.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: Object.keys(typographyPresets),
      description:
        'Typography variant that defines the style and default HTML element. Each variant maps to appropriate font size, weight, line height, and letter spacing based on the design system.',
      table: {
        defaultValue: { summary: 'Required' },
        type: { summary: 'string' },
      },
    },
    as: {
      control: 'text',
      description:
        'Optional element type override. Allows you to render a different HTML element while maintaining the styling of the selected variant.',
      table: {
        defaultValue: { summary: 'Based on variant' },
        type: { summary: 'React.ElementType' },
      },
    },
    children: {
      control: 'text',
      description: 'The content to display within the typography element.',
      table: {
        type: { summary: 'React.ReactNode' },
      },
    },
    className: {
      control: 'text',
      description:
        'Additional CSS classes to apply to the typography element. These will be merged with the variant-specific classes.',
      table: {
        defaultValue: { summary: 'undefined' },
        type: { summary: 'string' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Typography>;

// Primary examples showing each variant
export const Heading1: Story = {
  args: {
    variant: 'h1',
    children: 'Heading 1',
  },
};

export const Heading2: Story = {
  args: {
    variant: 'h2',
    children: 'Heading 2',
  },
};

export const Heading3: Story = {
  args: {
    variant: 'h3',
    children: 'Heading 3',
  },
};

export const Heading4: Story = {
  args: {
    variant: 'h4',
    children: 'Heading 4',
  },
};

export const Heading5: Story = {
  args: {
    variant: 'h5',
    children: 'Heading 5',
  },
};

export const Heading6: Story = {
  args: {
    variant: 'h6',
    children: 'Heading 6',
  },
};

export const BodyLarge: Story = {
  args: {
    variant: 'bodyLarge',
    children:
      'This is a larger paragraph of text that demonstrates the bodyLarge styling. It should be clear and readable, with appropriate line height and spacing for comfortable reading.',
  },
};

export const Body: Story = {
  args: {
    variant: 'body',
    children:
      'This is a standard paragraph of text that demonstrates the body styling. It should be clear and readable, with appropriate line height and spacing for comfortable reading.',
  },
};

export const BodySmall: Story = {
  args: {
    variant: 'bodySmall',
    children: 'This is smaller text, useful for secondary content.',
  },
};

export const Caption: Story = {
  args: {
    variant: 'caption',
    children: 'This is caption text, useful for captions, footnotes or less important information.',
  },
};

export const Overline: Story = {
  args: {
    variant: 'overline',
    children: 'THIS IS OVERLINE TEXT',
  },
};

export const Label: Story = {
  args: {
    variant: 'label',
    children: 'This is a label',
  },
};

export const Code: Story = {
  args: {
    variant: 'code',
    children: 'const hourlyWage = 25; // Your hourly rate in dollars',
  },
};

export const CodeBlock: Story = {
  args: {
    variant: 'codeBlock',
    children: `function convertPriceToHours(price, hourlyRate) {
  if (hourlyRate <= 0) {
    throw new Error('Hourly rate must be greater than zero');
  }
  return price / hourlyRate;
}`,
  },
};

/**
 * The Typography component allows overriding the default HTML element with the `as` prop.
 * This is useful when you need to maintain the visual styling but use a different
 * HTML element for semantic or layout purposes.
 */
export const ElementOverride: Story = {
  args: {
    variant: 'h2',
    as: 'div',
    children: 'This looks like an h2 but is actually a div element',
  },
};

/**
 * Typography components handle long content appropriately, maintaining
 * readability with proper line height and spacing.
 */
export const LongContent: Story = {
  args: {
    variant: 'body',
    children: `Time Is Money is a Chrome extension that automatically converts prices online into hours of work, helping you make better-informed purchasing decisions by understanding the true value of your time. When you browse websites, the extension converts prices into the equivalent hours of work, based on your hourly wage. This powerful financial perspective helps you evaluate purchases not just by their monetary cost, but by the time investment they represent.`,
  },
};

/**
 * Custom styling can be applied to Typography components via the className prop,
 * which gets merged with the default variant styling.
 */
export const CustomStyling: Story = {
  args: {
    variant: 'body',
    className: 'text-primary-DEFAULT italic underline',
    children: 'This paragraph has custom styling applied via className prop.',
  },
};

/**
 * This story demonstrates all Typography variants in a single view,
 * allowing you to see how they relate to each other in the typographic hierarchy.
 */
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6">
      <Typography variant="h1">Heading 1 (h1)</Typography>
      <Typography variant="h2">Heading 2 (h2)</Typography>
      <Typography variant="h3">Heading 3 (h3)</Typography>
      <Typography variant="h4">Heading 4 (h4)</Typography>
      <Typography variant="h5">Heading 5 (h5)</Typography>
      <Typography variant="h6">Heading 6 (h6)</Typography>
      <Typography variant="bodyLarge">
        Body Large - This is a larger paragraph of text that demonstrates the bodyLarge styling. It
        should be clear and readable, with appropriate line height and spacing for comfortable
        reading.
      </Typography>
      <Typography variant="body">
        Body - This is a standard paragraph of text that demonstrates the body styling. It should be
        clear and readable, with appropriate line height and spacing for comfortable reading.
      </Typography>
      <Typography variant="bodySmall">
        Body Small - This is smaller text, useful for secondary content that doesn't need to be as
        prominent.
      </Typography>
      <Typography variant="caption">
        Caption - This is caption text, useful for captions, footnotes or less important
        information.
      </Typography>
      <Typography variant="overline">
        OVERLINE - THIS TEXT IS TYPICALLY USED ABOVE A HEADING
      </Typography>
      <Typography variant="label">
        Label - Typically used for form labels or small UI elements
      </Typography>
      <Typography variant="code">const hourlyWage = 25; // Your hourly rate in dollars</Typography>
      <Typography variant="codeBlock">{`function convertPriceToHours(price, hourlyRate) {
  if (hourlyRate <= 0) {
    throw new Error('Hourly rate must be greater than zero');
  }
  return price / hourlyRate;
}`}</Typography>
    </div>
  ),
  parameters: {
    controls: { disable: true },
  },
};

/**
 * This story demonstrates how Typography components appear in dark mode.
 * The component maintains proper contrast and readability in both light and dark themes.
 */
export const DarkMode: Story = {
  render: () => (
    <div className="space-y-4 p-4 bg-background-dark text-white rounded-md">
      <Typography variant="h2">Typography in Dark Mode</Typography>
      <Typography variant="body">
        This example shows how Typography components look when rendered in dark mode. The component
        maintains proper contrast and readability regardless of the theme.
      </Typography>
      <Typography variant="bodySmall" className="text-neutral-400">
        Secondary text often uses muted colors in dark mode for proper hierarchy.
      </Typography>
      <Typography variant="caption" className="text-neutral-500">
        Caption text is even more subtle but still readable.
      </Typography>
      <Typography variant="overline" className="text-primary-light">
        ACCENT TEXT CAN USE BRAND COLORS
      </Typography>
      <Typography variant="code" className="bg-background-darkSecondary p-2 rounded">
        // Code text in dark mode often has dedicated styling const darkMode = true;
      </Typography>
    </div>
  ),
  parameters: {
    controls: { disable: true },
  },
};

/**
 * This story demonstrates common real-world Typography usage patterns.
 * It shows how to use multiple Typography variants together to create
 * a hierarchical and readable content structure.
 */
export const UsageExample: Story = {
  render: () => (
    <div className="max-w-2xl space-y-6 p-6 border rounded-md">
      <Typography variant="overline">PRODUCT FEATURE</Typography>
      <Typography variant="h2">Save Time Making Purchase Decisions</Typography>
      <Typography variant="bodyLarge">
        Time Is Money automatically converts online prices into work hours, giving you a new
        perspective on your spending.
      </Typography>

      <div className="space-y-3 mt-6">
        <Typography variant="h4">How It Works</Typography>
        <Typography variant="body">
          When you browse online stores, the extension instantly converts price tags into the
          equivalent hours of work based on your personal hourly wage.
        </Typography>
        <Typography variant="bodySmall" className="text-neutral-600">
          All calculations happen locally in your browser. Your financial data never leaves your
          device.
        </Typography>
      </div>

      <div className="mt-4 p-4 bg-neutral-100 rounded-md">
        <Typography variant="label" className="block mb-2">
          Example Calculation
        </Typography>
        <Typography variant="code" className="block mb-2">
          $120 item ÷ $30/hour = 4 hours of work
        </Typography>
        <Typography variant="caption">
          Is that new gadget really worth a half-day of your time?
        </Typography>
      </div>
    </div>
  ),
  parameters: {
    controls: { disable: true },
  },
};

/**
 * This story demonstrates the accessibility features of the Typography component.
 * The component uses semantic HTML elements by default and maintains proper contrast.
 */
export const AccessibilityExample: Story = {
  render: () => (
    <div className="space-y-4">
      <Typography variant="h2">Accessibility Features</Typography>
      <Typography variant="body">
        Typography components use semantic HTML elements by default to ensure proper document
        structure:
      </Typography>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <Typography variant="bodySmall" as="span">
            Heading variants (h1-h6) render as their corresponding HTML elements
          </Typography>
        </li>
        <li>
          <Typography variant="bodySmall" as="span">
            Body variants render as paragraph elements
          </Typography>
        </li>
        <li>
          <Typography variant="bodySmall" as="span">
            When you need to override the HTML element, you can use the{' '}
            <code className="text-code">as</code> prop
          </Typography>
        </li>
      </ul>
      <div className="mt-4 p-4 border border-neutral-200 rounded">
        <Typography variant="h5">HTML Inspection Example</Typography>
        <Typography variant="code" className="block mt-2">
          {'<h2 class="...">Heading 2</h2>'}
        </Typography>
        <Typography variant="code" className="block mt-1">
          {'<p class="...">Body text</p>'}
        </Typography>
        <Typography variant="code" className="block mt-1">
          {'<h2 class="..." role="presentation">Non-semantic heading</h2>'}
        </Typography>
      </div>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
};
