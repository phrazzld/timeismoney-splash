import type { Meta, StoryObj } from '@storybook/react';
import { ThemeTest } from './ThemeTest';

/**
 * This story demonstrates the theme switching functionality in Storybook.
 * It uses the ThemeTest component which has various elements styled for both
 * light and dark modes.
 */
const meta: Meta<typeof ThemeTest> = {
  title: 'Test/ThemeTest',
  component: ThemeTest,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A component designed to test theme switching functionality in Storybook. Use the theme toggle in the toolbar to switch between light and dark modes.',
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'The title to display at the top of the component',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ThemeTest>;

/**
 * The default view of the ThemeTest component. Use the theme toggle in the Storybook toolbar
 * to switch between light and dark modes and see how the component's appearance changes.
 * This demonstrates the theme switching functionality.
 */
export const Default: Story = {
  args: {
    title: 'Theme Test Component',
  },
};

/**
 * Version with a custom title.
 */
export const CustomTitle: Story = {
  args: {
    title: 'Custom Title for Theme Test',
  },
};
