import type { Meta, StoryObj } from '@storybook/react';
import { Typography } from './Typography';

const meta: Meta<typeof Typography> = {
  title: 'Atoms/Typography',
  component: Typography,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Typography component for consistent text styling throughout the application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'bodyLarge',
        'body',
        'bodySmall',
        'caption',
        'overline',
        'label',
        'code',
        'codeBlock',
      ],
      description: 'Typography variant that defines the style and default HTML element',
    },
    as: {
      control: 'text',
      description: 'Optional element type override',
    },
    children: {
      control: 'text',
      description: 'The content to display',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply',
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

// Examples showing element override
export const ElementOverride: Story = {
  args: {
    variant: 'h2',
    as: 'div',
    children: 'This looks like an h2 but is actually a div element',
  },
};

// Example with extended content
export const LongContent: Story = {
  args: {
    variant: 'body',
    children: `Time Is Money is a Chrome extension that automatically converts prices online into hours of work, helping you make better-informed purchasing decisions by understanding the true value of your time. When you browse websites, the extension converts prices into the equivalent hours of work, based on your hourly wage. This powerful financial perspective helps you evaluate purchases not just by their monetary cost, but by the time investment they represent.`,
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

// Example with custom classes
export const CustomStyling: Story = {
  args: {
    variant: 'body',
    className: 'text-primary italic underline',
    children: 'This paragraph has custom styling applied via className prop.',
  },
};
