import * as React from 'react';
import { cn } from '../../../lib/utils';
import { HeroContent, type HeroContentProps } from '../../molecules/HeroContent';

/**
 * Props for the Hero organism component
 *
 * @interface HeroProps
 * @extends {Omit<HeroContentProps, 'className'>}
 */
export interface HeroProps extends Omit<HeroContentProps, 'className'> {
  /**
   * Background variant for visual treatment
   * @default 'default'
   */
  readonly backgroundVariant?: 'default' | 'gradient' | 'pattern';

  /**
   * Additional CSS classes for the container
   */
  readonly className?: string;
}

/**
 * Mapping of background variants to their corresponding CSS classes
 */
export const backgroundVariantMap: Record<NonNullable<HeroProps['backgroundVariant']>, string> = {
  default: 'bg-white',
  gradient: 'bg-gradient-to-br from-blue-50 via-white to-green-50',
  pattern: 'bg-gray-50',
};

/**
 * Hero organism component that provides layout composition for hero sections.
 *
 * This organism composes the HeroContent molecule within a responsive container,
 * handling layout concerns, background treatments, and spacing while delegating
 * content structure to the HeroContent molecule.
 *
 * ## Features
 * - Responsive container with proper spacing and constraints
 * - Background variant options for visual variety
 * - Seamless composition with HeroContent molecule
 * - Separation of layout and content concerns
 * - Mobile-first responsive design
 *
 * ## Atomic Design Hierarchy
 * - **Organism**: Hero (layout, container, backgrounds)
 * - **Molecule**: HeroContent (content structure, semantic HTML)
 * - **Atoms**: Typography (individual text styling)
 *
 * @example
 * ```tsx
 * <Hero
 *   heading="Welcome to Our Platform"
 *   subheading="Transform your workflow today"
 *   backgroundVariant="gradient"
 *   cta={<Button variant="primary">Get Started</Button>}
 * />
 * ```
 *
 * @param {HeroProps} props - Component props
 * @returns {React.ReactElement} Rendered Hero organism with composed content
 */
export const Hero: React.FC<HeroProps> = ({
  backgroundVariant = 'default',
  className,
  // Extract HeroContent props to pass through
  heading,
  headingVariant,
  subheading,
  subheadingVariant,
  cta,
  variant,
  ...props
}) => {
  // Combine container classes
  const containerClasses = cn(
    // Base layout - full width container
    'w-full',
    // Background treatment
    backgroundVariantMap[backgroundVariant],
    // Responsive padding
    'px-4 sm:px-6 lg:px-8',
    'py-12 sm:py-16 lg:py-20',
    // Custom classes
    className,
  );

  // Combine content container classes for proper centering and max width
  const contentContainerClasses = cn(
    // Responsive container with max width
    'mx-auto',
    'max-w-7xl',
    // Responsive content centering
    'w-full',
  );

  return (
    <div className={containerClasses} {...props}>
      <div className={contentContainerClasses}>
        <HeroContent
          heading={heading}
          headingVariant={headingVariant}
          subheading={subheading}
          subheadingVariant={subheadingVariant}
          cta={cta}
          variant={variant}
        />
      </div>
    </div>
  );
};

export default Hero;
