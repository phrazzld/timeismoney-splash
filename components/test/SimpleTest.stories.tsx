import type { Meta, StoryObj } from '@storybook/react';
import { SimpleTest } from './SimpleTest';

const meta: Meta<typeof SimpleTest> = {
  title: 'Test/SimpleTest',
  component: SimpleTest,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    text: {
      control: 'text',
      description: 'Text to display in the component',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'default'],
      description: 'The color variant to display',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SimpleTest>;

export const Default: Story = {
  args: {
    text: 'Hello Storybook',
    variant: 'default',
  },
};

export const Primary: Story = {
  args: {
    text: 'Primary Variant',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    text: 'Secondary Variant',
    variant: 'secondary',
  },
};
