import React from 'react';
import { Typography } from '@/components/atoms/Typography';
import { typographyPresets } from '@/design-tokens/typography';
import { cn } from '@/lib/utils';

/**
 * Props for the HeroContent molecule component
 */
export interface HeroContentProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Main heading content (required)
   */
  readonly heading: string;

  /**
   * Typography variant for the heading
   * @default 'h1'
   */
  readonly headingVariant?: keyof typeof typographyPresets;

  /**
   * Optional subheading content
   */
  readonly subheading?: string;

  /**
   * Typography variant for the subheading
   * @default 'bodyLarge'
   */
  readonly subheadingVariant?: keyof typeof typographyPresets;

  /**
   * Optional CTA content slot
   */
  readonly cta?: React.ReactNode;

  /**
   * Layout variant for content alignment
   * @default 'default'
   */
  readonly variant?: 'default' | 'centered';

  /**
   * Additional CSS classes
   */
  readonly className?: string;
}

/**
 * HeroContent molecule component for hero sections.
 *
 * Composes Typography atoms to provide flexible, semantic content structure
 * for hero sections. Supports heading, optional subheading, and CTA slot
 * with responsive design and accessibility features.
 *
 * @example
 * ```tsx
 * <HeroContent
 *   heading="Welcome to Time is Money"
 *   subheading="Convert prices into hours of work"
 *   cta={<Button>Get Started</Button>}
 * />
 * ```
 *
 * @param props - Component props
 * @returns Rendered HeroContent component
 */
export const HeroContent: React.FC<HeroContentProps> = ({
  heading,
  headingVariant = 'h1',
  subheading,
  subheadingVariant = 'bodyLarge',
  cta,
  variant = 'default',
  className,
  ...props
}) => {
  // Generate unique ID for heading to support ARIA labeling
  const headingId = React.useId();

  // Determine layout classes based on variant
  const layoutClasses = {
    default: 'text-left',
    centered: 'text-center',
  };

  // Combine all container classes
  const containerClasses = cn(
    // Base layout
    'space-y-6',
    // Variant-specific layout
    layoutClasses[variant],
    // Custom classes
    className,
  );

  return (
    <section className={containerClasses} aria-labelledby={headingId} role="region" {...props}>
      {/* Main Heading */}
      <Typography variant={headingVariant} id={headingId}>
        {heading}
      </Typography>

      {/* Optional Subheading */}
      {subheading && <Typography variant={subheadingVariant}>{subheading}</Typography>}

      {/* CTA Slot - renders provided CTA or placeholder */}
      <div
        className={cn('cta-container', variant === 'centered' ? 'flex justify-center' : '')}
        data-testid={cta ? 'hero-cta-content' : 'hero-cta-placeholder'}
      >
        {cta || (
          <div className="hidden" aria-hidden="true" data-testid="hero-cta-placeholder-content">
            {/* Placeholder for future CTA integration */}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroContent;
