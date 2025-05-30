import * as React from 'react';
import { cn } from '@/lib/utils';
import { Hero, type HeroProps } from '@/components/organisms/Hero';

/**
 * Props for the LandingTemplate component
 */
export interface LandingTemplateProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Props to pass to the Hero organism component
   */
  readonly heroProps: HeroProps;

  /**
   * Additional CSS classes for the main container
   */
  readonly className?: string;

  /**
   * Children elements for future section injection
   */
  readonly children?: React.ReactNode;
}

/**
 * Landing page template component that provides semantic structure
 * for marketing pages with Hero integration and placeholder sections.
 *
 * This template follows semantic HTML5 structure with proper ARIA
 * landmarks for accessibility and SEO optimization.
 *
 * ## Features
 * - Semantic HTML5 structure with proper landmarks
 * - Hero organism integration as primary above-fold content
 * - Placeholder sections for future content development
 * - Full accessibility compliance with WCAG 2.1 AA
 * - Responsive design with mobile-first approach
 *
 * ## Sections Structure
 * - Hero section (primary above-fold content)
 * - Features section placeholder
 * - Testimonials section placeholder
 * - Call-to-action section placeholder
 *
 * @example
 * ```tsx
 * <LandingTemplate
 *   heroProps={{
 *     heading: "Transform Your Shopping",
 *     subheading: "See prices in hours of work",
 *     backgroundVariant: "gradient"
 *   }}
 * />
 * ```
 */
export const LandingTemplate: React.FC<LandingTemplateProps> = ({
  heroProps,
  className,
  children,
  ...props
}) => {
  // Generate unique ID for hero heading to support proper heading hierarchy
  const heroHeadingId = React.useId() + '-hero-heading';

  // Main container styling - full height with responsive section spacing
  const mainClasses = cn('min-h-screen', 'space-y-16 lg:space-y-24', className);

  // Shared section styling for placeholder content areas
  const sectionClasses = cn('py-16 lg:py-24', 'container mx-auto px-4 sm:px-6 lg:px-8');

  // Placeholder content styling for future development indicators
  const placeholderClasses = cn('text-center text-gray-500 italic text-lg');

  return (
    <main className={mainClasses} role="main" {...props}>
      {/* Hero Section - Primary above-fold content */}
      <section role="region" aria-label="Hero section">
        {/* Hidden heading for ARIA labeling */}
        <h1 id={heroHeadingId} className="sr-only">
          {heroProps.heading}
        </h1>
        <Hero
          {...heroProps}
          // Ensure hero heading gets the correct variant
          headingVariant={heroProps.headingVariant || 'h1'}
        />
      </section>

      {/* Features Section Placeholder */}
      <section className={sectionClasses} role="region" aria-label="Features">
        <div className={placeholderClasses}>Features section coming soon</div>
      </section>

      {/* Testimonials Section Placeholder */}
      <section className={sectionClasses} role="region" aria-label="Testimonials">
        <div className={placeholderClasses}>Testimonials section coming soon</div>
      </section>

      {/* Call to Action Section Placeholder */}
      <section className={sectionClasses} role="region" aria-label="Call to Action">
        <div className={placeholderClasses}>Call to Action section coming soon</div>
      </section>

      {/* Future children injection point */}
      {children}
    </main>
  );
};

export default LandingTemplate;
