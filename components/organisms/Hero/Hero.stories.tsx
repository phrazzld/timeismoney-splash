import type { Meta, StoryObj } from '@storybook/react';
import { Hero } from './Hero';
import { Button } from '@/components/atoms/Button';

/**
 * The Hero organism component provides complete layout composition for hero sections.
 * It composes the HeroContent molecule within responsive containers with background options.
 *
 * ## Features
 * - Responsive container with proper spacing and max-width constraints
 * - Multiple background variant options for visual variety
 * - Seamless composition with HeroContent molecule functionality
 * - Complete separation of layout (organism) and content (molecule) concerns
 * - Mobile-first responsive design with progressive enhancement
 *
 * ## Atomic Design Hierarchy
 * - **Organism**: Hero (layout, container, backgrounds, spacing)
 * - **Molecule**: HeroContent (content structure, semantic HTML)
 * - **Atoms**: Typography, Button (individual styling components)
 *
 * ## Usage Guidelines
 * - Use for complete hero sections that need layout containers
 * - Choose background variants based on design requirements
 * - All HeroContent props are available through prop delegation
 * - Container handles responsive behavior automatically
 * - Background variants provide consistent visual treatments
 */
const meta: Meta<typeof Hero> = {
  title: 'Organisms/Hero',
  component: Hero,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A complete hero organism that composes HeroContent within responsive containers.',
      },
    },
  },
  argTypes: {
    heading: {
      description: 'Main heading content (required)',
      control: 'text',
    },
    headingVariant: {
      description: 'Typography variant for the heading',
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    },
    subheading: {
      description: 'Optional subheading content',
      control: 'text',
    },
    subheadingVariant: {
      description: 'Typography variant for the subheading',
      control: 'select',
      options: ['body', 'bodyLarge', 'bodySmall'],
    },
    variant: {
      description: 'Content alignment variant',
      control: 'select',
      options: ['default', 'centered'],
    },
    backgroundVariant: {
      description: 'Background treatment variant',
      control: 'select',
      options: ['default', 'gradient', 'pattern'],
    },
    cta: {
      description: 'Optional CTA content slot',
      control: false,
    },
    className: {
      description: 'Additional CSS classes for container',
      control: 'text',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default Hero organism with minimal configuration demonstrating basic layout composition.
 */
export const Default: Story = {
  args: {
    heading: 'Transform Your Shopping Decisions',
    subheading: 'Convert online prices into hours of work to see the true cost of purchases.',
  },
};

/**
 * Hero with gradient background variant for enhanced visual appeal.
 */
export const GradientBackground: Story = {
  args: {
    heading: 'Time is Money Chrome Extension',
    subheading: 'Make informed purchasing decisions by seeing prices in hours of work.',
    backgroundVariant: 'gradient',
    cta: (
      <Button variant="primary" size="lg">
        Download Extension
      </Button>
    ),
  },
};

/**
 * Hero with pattern background and centered content layout.
 */
export const PatternBackgroundCentered: Story = {
  args: {
    heading: 'See Prices in Time',
    subheading: 'Transform your relationship with money by understanding the true cost in time.',
    backgroundVariant: 'pattern',
    variant: 'centered',
    cta: (
      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="primary" size="lg">
          Get Started
        </Button>
        <Button variant="outline" size="lg">
          Learn More
        </Button>
      </div>
    ),
  },
};

/**
 * Complete Hero with all features including multiple CTAs and gradient background.
 */
export const Complete: Story = {
  args: {
    heading: 'Smart Shopping with Time Perspective',
    subheading:
      'The Time is Money Chrome extension automatically converts prices into hours of work, helping you make better financial decisions by showing the true cost in time.',
    backgroundVariant: 'gradient',
    variant: 'centered',
    cta: (
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="primary" size="lg">
          Install Extension
        </Button>
        <Button variant="outline" size="lg">
          Watch Demo
        </Button>
        <Button variant="ghost" size="lg">
          Read Guide
        </Button>
      </div>
    ),
  },
};

/**
 * Minimal Hero demonstrating the simplest possible configuration.
 */
export const Minimal: Story = {
  args: {
    heading: 'Time is Money',
  },
};

/**
 * Hero with long content to demonstrate how the organism handles extensive text.
 */
export const LongContent: Story = {
  args: {
    heading: 'Revolutionize Your Online Shopping Experience with Time-Based Price Conversion',
    subheading:
      "The Time is Money Chrome extension is a powerful financial awareness tool that fundamentally changes how you perceive online purchases. By automatically converting dollar amounts into hours of work based on your hourly wage, this extension provides immediate insight into the true cost of items in terms of your most valuable resource: time. Whether you're considering a daily coffee purchase, shopping for electronics, or making major buying decisions, you'll always know exactly how many hours of your life each purchase represents.",
    backgroundVariant: 'gradient',
    cta: (
      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="primary" size="lg">
          Transform Your Shopping
        </Button>
        <Button variant="outline" size="lg">
          See How It Works
        </Button>
      </div>
    ),
  },
};

/**
 * Hero designed for dark mode environments to test theme compatibility.
 */
export const DarkMode: Story = {
  args: {
    heading: 'Dark Mode Hero Section',
    subheading: 'Hero content optimized for dark themes with proper contrast and readability.',
    backgroundVariant: 'pattern',
    variant: 'centered',
    cta: (
      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="outline" size="lg">
          Dark Theme Action
        </Button>
        <Button variant="ghost" size="lg">
          Secondary Action
        </Button>
      </div>
    ),
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story:
          'Demonstrates Hero component compatibility with dark themes. Tests background variants and text contrast in dark mode environments.',
      },
    },
  },
};
