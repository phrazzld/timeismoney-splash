'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Hero, type HeroProps } from '@/components/organisms/Hero';
import { useScrollNavigation } from '@/lib/hooks/useScrollNavigation';

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

  // Navigation sections configuration
  const navigationSections = React.useMemo(() => [
    { id: 'hero', label: 'Hero section' },
    { id: 'features', label: 'Features' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'cta', label: 'Call to Action' },
  ], []);

  // Initialize scroll navigation
  const { activeSection, scrollToSection, scrollProgress } = useScrollNavigation({
    sections: navigationSections,
    threshold: 0.5,
    debounceMs: 300,
    focusOnScroll: true,
  });

  // Skip link click handler
  const handleSkipLinkClick = React.useCallback(
    async (event: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
      event.preventDefault();
      try {
        await scrollToSection(sectionId);
      } catch (error) {
        console.error('Skip link navigation failed:', error);
        // Fallback to native link behavior
        const element = document.getElementById(sectionId);
        element?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [scrollToSection]
  );

  // Main container styling - full height with responsive section spacing
  const mainClasses = cn('min-h-screen', 'space-y-16 lg:space-y-24', className);

  // Shared section styling for placeholder content areas
  const sectionClasses = cn('py-16 lg:py-24', 'container mx-auto px-4 sm:px-6 lg:px-8');

  // Placeholder content styling for future development indicators
  const placeholderClasses = cn('text-center text-gray-500 italic text-lg');

  // Skip link styling - hidden until focused
  const skipLinkClasses = cn(
    'sr-only focus:not-sr-only',
    'absolute top-4 left-4 z-50',
    'bg-white text-gray-900 px-4 py-2 rounded',
    'border border-gray-300 shadow-lg',
    'focus:outline-none focus:ring-2 focus:ring-blue-500'
  );

  return (
    <>
      {/* Skip Links for Accessibility */}
      <nav aria-label="Skip navigation">
        <a
          href="#hero"
          className={skipLinkClasses}
          onClick={(e) => handleSkipLinkClick(e, 'hero')}
          aria-label="Skip to main content"
        >
          Skip to main content
        </a>
        <a
          href="#features"
          className={skipLinkClasses}
          onClick={(e) => handleSkipLinkClick(e, 'features')}
          aria-label="Skip to features section"
        >
          Skip to features
        </a>
        <a
          href="#testimonials"
          className={skipLinkClasses}
          onClick={(e) => handleSkipLinkClick(e, 'testimonials')}
          aria-label="Skip to testimonials section"
        >
          Skip to testimonials
        </a>
        <a
          href="#cta"
          className={skipLinkClasses}
          onClick={(e) => handleSkipLinkClick(e, 'cta')}
          aria-label="Skip to call to action section"
        >
          Skip to call to action
        </a>
      </nav>

      <main 
        className={mainClasses} 
        role="main" 
        data-scroll-progress={scrollProgress}
        {...props}
      >
        {/* Hero Section - Primary above-fold content */}
        <section 
          id="hero"
          role="region" 
          aria-label="Hero section"
          tabIndex={-1}
          data-active={activeSection === 'hero'}
        >
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
        <section 
          id="features"
          className={sectionClasses} 
          role="region" 
          aria-label="Features"
          tabIndex={-1}
          data-active={activeSection === 'features'}
        >
          <div className={placeholderClasses}>Features section coming soon</div>
        </section>

        {/* Testimonials Section Placeholder */}
        <section 
          id="testimonials"
          className={sectionClasses} 
          role="region" 
          aria-label="Testimonials"
          tabIndex={-1}
          data-active={activeSection === 'testimonials'}
        >
          <div className={placeholderClasses}>Testimonials section coming soon</div>
        </section>

        {/* Call to Action Section Placeholder */}
        <section 
          id="cta"
          className={sectionClasses} 
          role="region" 
          aria-label="Call to Action"
          tabIndex={-1}
          data-active={activeSection === 'cta'}
        >
          <div className={placeholderClasses}>Call to Action section coming soon</div>
        </section>

        {/* Future children injection point */}
        {children}
      </main>
    </>
  );
};

export default LandingTemplate;
