import type { Meta, StoryObj } from '@storybook/react';
import { HeroContent } from './HeroContent';
import { Button } from '@/components/atoms/Button';

/**
 * The HeroContent molecule component provides flexible content structure for hero sections.
 * It composes Typography atoms to create semantic, accessible, and responsive hero content.
 *
 * ## Features
 * - Semantic HTML structure with proper heading hierarchy
 * - Typography atom integration for consistent text styling
 * - Optional subheading and CTA slot for flexible content
 * - Layout variants for different design needs
 * - Full accessibility compliance with ARIA labeling
 * - Mobile-first responsive design
 *
 * ## Accessibility
 * - Uses semantic section element with proper ARIA labeling
 * - Maintains heading hierarchy through Typography atom integration
 * - Screen reader friendly content structure
 * - Keyboard navigation support for interactive elements
 *
 * ## Usage Guidelines
 * - Use for hero sections that need flexible content structure
 * - Always provide a clear, descriptive heading
 * - Use subheading to provide additional context when needed
 * - CTA slot accepts any React content for maximum flexibility
 * - Choose appropriate heading variants based on page structure
 * - Consider layout variant based on design requirements
 */
const meta: Meta<typeof HeroContent> = {
  title: 'Molecules/HeroContent',
  component: HeroContent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible molecule component for hero section content structure.',
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
      description: 'Layout variant for content alignment',
      control: 'select',
      options: ['default', 'centered'],
    },
    cta: {
      description: 'Optional CTA content slot',
      control: false,
    },
    className: {
      description: 'Additional CSS classes',
      control: 'text',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default HeroContent with just a heading. This is the minimal required configuration.
 */
export const Default: Story = {
  args: {
    heading: 'Welcome to Time is Money',
  },
};

/**
 * HeroContent with both heading and subheading for additional context.
 */
export const WithSubheading: Story = {
  args: {
    heading: 'Transform Your Shopping Decisions',
    subheading:
      'Convert online prices into hours of work to see the true cost of purchases in the time it takes to earn them.',
  },
};

/**
 * HeroContent with a call-to-action button to demonstrate the CTA slot functionality.
 */
export const WithCTA: Story = {
  args: {
    heading: 'Start Making Informed Decisions',
    subheading: 'See prices in hours of work instead of dollars.',
    cta: (
      <Button variant="primary" size="lg">
        Download Extension
      </Button>
    ),
  },
};

/**
 * Complete HeroContent with all elements: heading, subheading, and CTA.
 */
export const Complete: Story = {
  args: {
    heading: 'Time is Money Chrome Extension',
    subheading:
      'Transform online prices into hours of work to make better purchasing decisions. See the true cost in time instead of dollars.',
    cta: (
      <div className="flex gap-4">
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
 * Centered layout variant for designs that need center-aligned content.
 */
export const Centered: Story = {
  args: {
    heading: 'Centered Hero Content',
    subheading: 'This content is center-aligned for a different visual impact.',
    variant: 'centered',
    cta: <Button variant="primary">Call to Action</Button>,
  },
};

/**
 * Different heading variants to show typography flexibility.
 */
export const HeadingVariants: Story = {
  render: () => (
    <div className="space-y-12">
      <HeroContent
        heading="Heading 1 Variant"
        headingVariant="h1"
        subheading="This uses the h1 typography variant"
      />
      <HeroContent
        heading="Heading 2 Variant"
        headingVariant="h2"
        subheading="This uses the h2 typography variant"
      />
      <HeroContent
        heading="Heading 3 Variant"
        headingVariant="h3"
        subheading="This uses the h3 typography variant"
      />
    </div>
  ),
};

/**
 * Different subheading variants to show typography options.
 */
export const SubheadingVariants: Story = {
  render: () => (
    <div className="space-y-12">
      <HeroContent
        heading="Body Large Subheading"
        subheading="This subheading uses the bodyLarge variant for emphasis"
        subheadingVariant="bodyLarge"
      />
      <HeroContent
        heading="Body Subheading"
        subheading="This subheading uses the standard body variant"
        subheadingVariant="body"
      />
      <HeroContent
        heading="Body Small Subheading"
        subheading="This subheading uses the bodySmall variant for subtle text"
        subheadingVariant="bodySmall"
      />
    </div>
  ),
};

/**
 * Example with longer content to demonstrate how the component handles extensive text.
 */
export const LongContent: Story = {
  args: {
    heading: 'A Comprehensive Solution for Modern Online Shopping Decisions',
    subheading:
      "The Time is Money Chrome extension revolutionizes how you think about online purchases by automatically converting prices from dollars into hours of work. This powerful tool helps you make more informed financial decisions by showing you exactly how much of your time each purchase represents. Whether you're buying a coffee, a gadget, or planning a major purchase, you'll always know the true cost in terms of your most valuable resource: time.",
    cta: (
      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="primary" size="lg">
          Download Free Extension
        </Button>
        <Button variant="outline" size="lg">
          Watch Demo Video
        </Button>
        <Button variant="ghost" size="lg">
          Read Documentation
        </Button>
      </div>
    ),
  },
};

/**
 * Minimal example with the shortest possible content.
 */
export const Minimal: Story = {
  args: {
    heading: 'Time is Money',
  },
};

/**
 * Example showing how the component can be customized with additional styling.
 */
export const CustomStyled: Story = {
  args: {
    heading: 'Custom Styled Hero',
    subheading: 'This hero content has custom background and padding applied.',
    className: 'bg-gradient-to-r from-blue-50 to-green-50 p-8 rounded-lg border',
    cta: <Button variant="primary">Explore Features</Button>,
  },
};

/**
 * Dark mode example to show how the component works with dark backgrounds.
 */
export const DarkMode: Story = {
  args: {
    heading: 'Dark Mode Hero',
    subheading: 'Hero content designed to work well in dark mode environments.',
    variant: 'centered',
    className: 'bg-gray-900 text-white p-8 rounded-lg',
    cta: <Button variant="outline">Learn More</Button>,
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
};

/**
 * Responsive example showing how content adapts across different screen sizes.
 */
export const Responsive: Story = {
  args: {
    heading: 'Responsive Hero Content',
    subheading:
      'This content is designed to work perfectly across all screen sizes, from mobile to desktop.',
    cta: (
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Button variant="primary" size="lg" className="w-full sm:w-auto">
          Primary Action
        </Button>
        <Button variant="outline" size="lg" className="w-full sm:w-auto">
          Secondary Action
        </Button>
      </div>
    ),
  },
  parameters: {
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1024px',
            height: '768px',
          },
        },
      },
    },
  },
};
