import type { Meta, StoryObj } from '@storybook/react';
import { Logo } from './Logo';

const meta: Meta<typeof Logo> = {
  title: 'Atoms/Logo',
  component: Logo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Logo component for the Time is Money application. Uses optimized Next.js Image component to render the logo.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'square'],
      description: 'The variant of the logo',
    },
    width: {
      control: { type: 'number', min: 32, max: 500, step: 8 },
      description: 'The width of the logo in pixels',
    },
    height: {
      control: { type: 'number', min: 32, max: 300, step: 8 },
      description: 'The height of the logo in pixels (optional)',
    },
    alt: {
      control: 'text',
      description: 'Alternative text for the logo',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Logo>;

// Default variant
export const Default: Story = {
  args: {
    variant: 'default',
    width: 200,
  },
};

// Square variant
export const Square: Story = {
  args: {
    variant: 'square',
    width: 100,
  },
};

// Small logo
export const Small: Story = {
  args: {
    variant: 'default',
    width: 120,
  },
};

// Large logo
export const Large: Story = {
  args: {
    variant: 'default',
    width: 320,
  },
};

// Custom sizing
export const CustomSizing: Story = {
  args: {
    variant: 'default',
    width: 300,
    height: 100, // Custom height that doesn't match the default aspect ratio
  },
};

// Logo in header example
export const LogoInHeader: Story = {
  render: () => (
    <header className="flex items-center justify-between w-full p-4 bg-background border-b">
      <Logo variant="default" width={150} />
      <div className="flex gap-4">
        <span className="text-sm">Menu item 1</span>
        <span className="text-sm">Menu item 2</span>
        <span className="text-sm">Menu item 3</span>
      </div>
    </header>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Example of the logo used in a header component',
      },
    },
  },
};
