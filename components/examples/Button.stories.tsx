import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

interface ButtonProps {
  /**
   * Button contents
   */
  children: React.ReactNode;
  /**
   * Optional click handler
   */
  onClick?: () => void;
  /**
   * Button variant
   */
  variant?: 'primary' | 'secondary' | 'outline';
}

const Button = ({ children, onClick, variant = 'primary' }: ButtonProps): React.JSX.Element => {
  // Map variants to Tailwind classes
  const classes = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    outline: 'border border-primary bg-transparent text-primary hover:bg-primary/10',
  };

  return (
    <button
      type="button"
      className={`px-4 py-2 rounded-md font-medium ${classes[variant]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const meta: Meta<typeof Button> = {
  title: 'Examples/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

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

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};
