import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Button component for user interactions. Primary variant uses the green brand color from the Time is Money extension.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
      description: 'The visual style of the button',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'The size of the button',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether the button is in a loading state',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    asChild: {
      control: 'boolean',
      description: 'Whether to render the button as a child component (using Radix UI Slot)',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Primary variants
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Destructive Button',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link Button',
  },
};

// Size variants
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

export const Default: Story = {
  args: {
    size: 'default',
    children: 'Default Size',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

export const IconOnly: Story = {
  args: {
    size: 'icon',
    children: '★',
    'aria-label': 'Star',
  },
};

// States
export const Loading: Story = {
  args: {
    isLoading: true,
    children: 'Loading',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
};

export const LoadingAndDisabled: Story = {
  args: {
    isLoading: true,
    disabled: true,
    children: 'Loading & Disabled',
  },
};

// Role examples
export const SubmitButton: Story = {
  args: {
    type: 'submit',
    children: 'Submit Form',
  },
};

export const ResetButton: Story = {
  args: {
    type: 'reset',
    variant: 'outline',
    children: 'Reset Form',
  },
};

// Usage examples
export const CTAButton: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    children: 'Download Extension',
  },
};
