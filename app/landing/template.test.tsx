import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { LandingTemplate } from './template';
import type { HeroProps } from '@/components/organisms/Hero';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock the Hero component to isolate template testing
jest.mock('@/components/organisms/Hero', () => ({
  Hero: ({
    heading,
    subheading,
    backgroundVariant,
    variant,
    headingVariant,
    subheadingVariant,
    cta,
    className,
    ...props
  }: HeroProps): React.ReactElement => (
    <div
      data-testid="hero-mock"
      data-heading={heading}
      data-subheading={subheading}
      data-background-variant={backgroundVariant}
      data-variant={variant}
      data-heading-variant={headingVariant}
      data-subheading-variant={subheadingVariant}
      data-cta={cta ? 'has-cta' : 'no-cta'}
      className={className}
      {...props}
    >
      Mocked Hero: {heading}
    </div>
  ),
}));

describe('LandingTemplate', () => {
  const defaultHeroProps: HeroProps = {
    heading: 'Test Landing Heading',
    subheading: 'Test landing subheading content',
    backgroundVariant: 'default',
  };

  describe('Basic Rendering', () => {
    it('renders without errors', () => {
      render(<LandingTemplate heroProps={defaultHeroProps} />);

      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(
        <LandingTemplate
          heroProps={defaultHeroProps}
          className="custom-landing-class"
          data-testid="landing-template"
        />,
      );

      const template = screen.getByTestId('landing-template');
      expect(template).toHaveClass('custom-landing-class');
    });

    it('forwards additional props to main element', () => {
      render(
        <LandingTemplate
          heroProps={defaultHeroProps}
          data-testid="landing-main"
          aria-label="Landing page main content"
        />,
      );

      const main = screen.getByTestId('landing-main');
      expect(main).toHaveAttribute('aria-label', 'Landing page main content');
    });
  });

  describe('Hero Integration', () => {
    it('renders Hero component with provided props', () => {
      const heroProps: HeroProps = {
        heading: 'Custom Hero Heading',
        subheading: 'Custom hero subheading',
        backgroundVariant: 'gradient',
        variant: 'centered',
      };

      render(<LandingTemplate heroProps={heroProps} />);

      const hero = screen.getByTestId('hero-mock');
      expect(hero).toBeInTheDocument();
      expect(hero).toHaveAttribute('data-heading', 'Custom Hero Heading');
      expect(hero).toHaveAttribute('data-subheading', 'Custom hero subheading');
    });

    it('renders Hero within semantic hero section', () => {
      render(<LandingTemplate heroProps={defaultHeroProps} />);

      const heroSection = screen.getByRole('region', { name: /hero/i });
      const hero = screen.getByTestId('hero-mock');

      expect(heroSection).toBeInTheDocument();
      expect(heroSection).toContainElement(hero);
    });

    it('provides proper ARIA labeling for hero section', () => {
      render(<LandingTemplate heroProps={defaultHeroProps} />);

      const heroSection = screen.getByRole('region', { name: /hero/i });
      expect(heroSection).toHaveAttribute('aria-label', 'Hero section');
    });
  });

  describe('Semantic HTML Structure', () => {
    it('uses main element as container', () => {
      render(<LandingTemplate heroProps={defaultHeroProps} />);

      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('contains all required sections in correct order', () => {
      render(<LandingTemplate heroProps={defaultHeroProps} />);

      const main = screen.getByRole('main');
      const sections = screen.getAllByRole('region');

      // Should have hero section + 3 placeholder sections = 4 total
      expect(sections).toHaveLength(4);

      // All sections should be within main
      sections.forEach((section) => {
        expect(main).toContainElement(section);
      });
    });

    it('includes features section placeholder', () => {
      render(<LandingTemplate heroProps={defaultHeroProps} />);

      const featuresSection = screen.getByRole('region', { name: /features/i });
      expect(featuresSection).toBeInTheDocument();
    });

    it('includes testimonials section placeholder', () => {
      render(<LandingTemplate heroProps={defaultHeroProps} />);

      const testimonialsSection = screen.getByRole('region', { name: /testimonials/i });
      expect(testimonialsSection).toBeInTheDocument();
    });

    it('includes call-to-action section placeholder', () => {
      render(<LandingTemplate heroProps={defaultHeroProps} />);

      const ctaSection = screen.getByRole('region', { name: /call.to.action/i });
      expect(ctaSection).toBeInTheDocument();
    });

    it('maintains correct section order', () => {
      render(<LandingTemplate heroProps={defaultHeroProps} />);

      const main = screen.getByRole('main');
      const sections = Array.from(main.children);

      // Verify sections are in correct order
      expect(sections[0]).toHaveAttribute('aria-label', 'Hero section'); // Hero section
      expect(sections[1]).toHaveAttribute('aria-label', 'Features');
      expect(sections[2]).toHaveAttribute('aria-label', 'Testimonials');
      expect(sections[3]).toHaveAttribute('aria-label', 'Call to Action');
    });
  });

  describe('Accessibility Compliance', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<LandingTemplate heroProps={defaultHeroProps} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper landmarks for screen readers', () => {
      render(<LandingTemplate heroProps={defaultHeroProps} />);

      // Main landmark
      expect(screen.getByRole('main')).toBeInTheDocument();

      // Section landmarks
      const regions = screen.getAllByRole('region');
      expect(regions).toHaveLength(4);

      // Each region should have proper labeling
      regions.forEach((region) => {
        const hasLabel =
          region.hasAttribute('aria-label') || region.hasAttribute('aria-labelledby');
        expect(hasLabel).toBe(true);
      });
    });

    it('maintains proper heading hierarchy', () => {
      render(<LandingTemplate heroProps={defaultHeroProps} />);

      // Should have a proper h1 heading
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Test Landing Heading');

      // Hero section should be properly labeled
      const heroSection = screen.getByRole('region', { name: /hero/i });
      expect(heroSection).toHaveAttribute('aria-label', 'Hero section');
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive container classes', () => {
      render(<LandingTemplate heroProps={defaultHeroProps} data-testid="landing-template" />);

      const template = screen.getByTestId('landing-template');

      // Should have base responsive classes
      expect(template).toHaveClass('min-h-screen');
    });

    it('maintains proper spacing between sections', () => {
      render(<LandingTemplate heroProps={defaultHeroProps} data-testid="landing-template" />);

      const template = screen.getByTestId('landing-template');

      // Should have spacing classes
      expect(template).toHaveClass('space-y-16', 'lg:space-y-24');
    });
  });

  describe('Future Section Placeholders', () => {
    it('includes placeholder sections with proper structure', () => {
      render(<LandingTemplate heroProps={defaultHeroProps} />);

      const featuresSection = screen.getByRole('region', { name: /features/i });
      const testimonialsSection = screen.getByRole('region', { name: /testimonials/i });
      const ctaSection = screen.getByRole('region', { name: /call.to.action/i });

      // Each placeholder should have proper container classes
      expect(featuresSection).toHaveClass('py-16', 'lg:py-24');
      expect(testimonialsSection).toHaveClass('py-16', 'lg:py-24');
      expect(ctaSection).toHaveClass('py-16', 'lg:py-24');
    });

    it('includes placeholder content for future development', () => {
      render(<LandingTemplate heroProps={defaultHeroProps} />);

      const featuresSection = screen.getByRole('region', { name: /features/i });
      expect(featuresSection).toHaveTextContent(/features.*coming.*soon/i);

      const testimonialsSection = screen.getByRole('region', { name: /testimonials/i });
      expect(testimonialsSection).toHaveTextContent(/testimonials.*coming.*soon/i);

      const ctaSection = screen.getByRole('region', { name: /call.to.action/i });
      expect(ctaSection).toHaveTextContent(/call.*action.*coming.*soon/i);
    });
  });

  describe('TypeScript Type Safety', () => {
    it('accepts all valid Hero props', () => {
      const completeHeroProps: HeroProps = {
        heading: 'Complete Hero',
        headingVariant: 'h1',
        subheading: 'Complete subheading',
        subheadingVariant: 'bodyLarge',
        backgroundVariant: 'gradient',
        variant: 'centered',
        cta: <button>Test CTA</button>,
        className: 'hero-custom',
      };

      render(<LandingTemplate heroProps={completeHeroProps} />);

      const hero = screen.getByTestId('hero-mock');
      expect(hero).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles minimal Hero props', () => {
      const minimalProps: HeroProps = {
        heading: 'Minimal Hero',
      };

      render(<LandingTemplate heroProps={minimalProps} />);

      const hero = screen.getByTestId('hero-mock');
      expect(hero).toBeInTheDocument();
      expect(hero).toHaveAttribute('data-heading', 'Minimal Hero');
    });

    it('handles empty hero heading gracefully', () => {
      const emptyHeadingProps: HeroProps = {
        heading: '',
      };

      render(<LandingTemplate heroProps={emptyHeadingProps} />);

      const hero = screen.getByTestId('hero-mock');
      expect(hero).toBeInTheDocument();
    });

    it('renders correctly without optional props', () => {
      render(<LandingTemplate heroProps={defaultHeroProps} />);

      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(screen.getAllByRole('region')).toHaveLength(4);
    });
  });
});
