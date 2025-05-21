import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from './Icon';
import * as LucideIcons from 'lucide-react';

// Create an array of all icon names
const iconNames = Object.keys(LucideIcons).filter(
  // Filter out non-icon exports
  (name) =>
    typeof LucideIcons[name as keyof typeof LucideIcons] === 'function' &&
    name !== 'createLucideIcon' &&
    name !== 'default',
) as Array<keyof typeof LucideIcons>;

const meta: Meta<typeof Icon> = {
  title: 'Atoms/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Icon component that renders a Lucide icon. The primary icons for the Time is Money app are Clock and DollarSign.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: iconNames,
      description: 'Name of the icon from lucide-react',
    },
    size: {
      control: { type: 'number', min: 12, max: 96, step: 4 },
      description: 'Size of the icon in pixels',
    },
    color: {
      control: 'color',
      description: 'Color of the icon',
    },
    strokeWidth: {
      control: { type: 'number', min: 0.5, max: 4, step: 0.5 },
      description: 'Stroke width of the icon',
    },
  },
  args: {
    name: 'Clock',
    size: 24,
    color: 'currentColor',
    strokeWidth: 2,
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

// Core icons for Time is Money app
export const ClockIcon: Story = {
  args: {
    name: 'Clock',
  },
};

export const DollarSignIcon: Story = {
  args: {
    name: 'DollarSign',
  },
};

export const TimerIcon: Story = {
  args: {
    name: 'Timer',
  },
};

export const HourglassIcon: Story = {
  args: {
    name: 'Hourglass',
  },
};

export const CoinsIcon: Story = {
  args: {
    name: 'Coins',
  },
};

export const WalletIcon: Story = {
  args: {
    name: 'Wallet',
  },
};

export const PiggyBankIcon: Story = {
  args: {
    name: 'PiggyBank',
  },
};

// Sizes
export const Small: Story = {
  args: {
    name: 'Clock',
    size: 16,
  },
};

export const Medium: Story = {
  args: {
    name: 'Clock',
    size: 24,
  },
};

export const Large: Story = {
  args: {
    name: 'Clock',
    size: 48,
  },
};

// Colors
export const PrimaryColor: Story = {
  args: {
    name: 'Clock',
    color: 'var(--primary)',
  },
};

export const SecondaryColor: Story = {
  args: {
    name: 'Clock',
    color: 'var(--secondary)',
  },
};

export const AccentColor: Story = {
  args: {
    name: 'Clock',
    color: 'var(--accent)',
  },
};

// Stroke width
export const ThinStroke: Story = {
  args: {
    name: 'Clock',
    strokeWidth: 1,
  },
};

export const ThickStroke: Story = {
  args: {
    name: 'Clock',
    strokeWidth: 3,
  },
};

// Common icon grid display
export const IconGrid: Story = {
  render: () => (
    <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-4 p-4">
      {[
        'Clock',
        'Timer',
        'Hourglass',
        'DollarSign',
        'Coins',
        'Wallet',
        'PiggyBank',
        'TrendingUp',
        'BarChart',
        'LineChart',
        'Settings',
      ].map((name) => (
        <div
          key={name}
          className="flex flex-col items-center justify-center p-4 border rounded bg-card"
        >
          <Icon name={name as keyof typeof LucideIcons} className="mb-2" />
          <span className="text-xs text-center">{name}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'A grid of common icons used in the Time is Money app',
      },
    },
  },
};
