import type { Meta, StoryObj } from '@storybook/react';
import { TailwindTest } from './TailwindTest';

const meta: Meta<typeof TailwindTest> = {
  title: 'Test/TailwindTest',
  component: TailwindTest,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'neutral'],
      description: 'The color variant to display',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TailwindTest>;

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
};

export const Neutral: Story = {
  args: {
    variant: 'neutral',
  },
};