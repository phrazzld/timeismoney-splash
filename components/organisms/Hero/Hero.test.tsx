import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Hero } from './Hero';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Hero', () => {
  describe('Basic Rendering', () => {
    it('renders with required heading prop', () => {
      render(<Hero heading="Test Hero Heading" />);

      const heading = screen.getByRole('heading', { name: 'Test Hero Heading' });
      expect(heading).toBeInTheDocument();
    });

    it('renders within a responsive container', () => {
      render(<Hero heading="Test Heading" data-testid="hero-container" />);

      const container = screen.getByTestId('hero-container');
      expect(container).toBeInTheDocument();

      // Should have responsive container classes
      expect(container).toHaveClass('w-full');
    });

    it('applies default background variant', () => {
      render(<Hero heading="Test Heading" data-testid="hero-container" />);

      const container = screen.getByTestId('hero-container');
      expect(container).toHaveClass('bg-white');
    });

    it('accepts and applies custom className', () => {
      render(
        <Hero heading="Test Heading" className="custom-hero-class" data-testid="hero-container" />,
      );

      const container = screen.getByTestId('hero-container');
      expect(container).toHaveClass('custom-hero-class');
    });
  });

  describe('Background Variants', () => {
    it('applies gradient background variant', () => {
      render(
        <Hero heading="Test Heading" backgroundVariant="gradient" data-testid="hero-container" />,
      );

      const container = screen.getByTestId('hero-container');
      expect(container).toHaveClass(
        'bg-gradient-to-br',
        'from-blue-50',
        'via-white',
        'to-green-50',
      );
    });

    it('applies pattern background variant', () => {
      render(
        <Hero heading="Test Heading" backgroundVariant="pattern" data-testid="hero-container" />,
      );

      const container = screen.getByTestId('hero-container');
      expect(container).toHaveClass('bg-gray-50');
    });

    it('applies default background when no variant specified', () => {
      render(<Hero heading="Test Heading" data-testid="hero-container" />);

      const container = screen.getByTestId('hero-container');
      expect(container).toHaveClass('bg-white');
    });
  });

  describe('HeroContent Composition', () => {
    it('renders HeroContent with all passed props', () => {
      render(
        <Hero
          heading="Composed Heading"
          subheading="Composed Subheading"
          headingVariant="h2"
          subheadingVariant="body"
          variant="centered"
          cta={<button>Test CTA</button>}
        />,
      );

      // Should render heading with correct variant
      const heading = screen.getByRole('heading', { name: 'Composed Heading' });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H2');

      // Should render subheading
      const subheading = screen.getByText('Composed Subheading');
      expect(subheading).toBeInTheDocument();

      // Should render CTA
      const cta = screen.getByRole('button', { name: 'Test CTA' });
      expect(cta).toBeInTheDocument();

      // Should be centered (HeroContent should have centered layout)
      const heroSection = screen.getByRole('region');
      expect(heroSection).toHaveClass('text-center');
    });

    it('renders without optional props', () => {
      render(<Hero heading="Minimal Hero" />);

      const heading = screen.getByRole('heading', { name: 'Minimal Hero' });
      expect(heading).toBeInTheDocument();

      // Should not have subheading
      const buttons = screen.queryAllByRole('button');
      expect(buttons).toHaveLength(0);
    });
  });

  describe('Responsive Container', () => {
    it('applies responsive padding classes', () => {
      render(<Hero heading="Test Heading" data-testid="hero-container" />);

      const container = screen.getByTestId('hero-container');

      // Should have responsive padding
      expect(container).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
      expect(container).toHaveClass('py-12', 'sm:py-16', 'lg:py-20');
    });

    it('applies max-width constraints to content', () => {
      render(<Hero heading="Test Heading" />);

      // Find the inner content container (child of the main container)
      const container = screen.getByRole('region').parentElement;
      expect(container).toHaveClass('max-w-7xl', 'mx-auto');
    });
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Hero
          heading="Accessible Hero"
          subheading="Accessible description"
          cta={<button>Accessible CTA</button>}
        />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('maintains semantic structure from HeroContent', () => {
      render(<Hero heading="Semantic Hero" subheading="Semantic description" />);

      // Should have semantic section from HeroContent
      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();

      // Should have proper heading
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('TypeScript Type Safety', () => {
    it('accepts all valid background variants', () => {
      const validVariants = ['default', 'gradient', 'pattern'] as const;

      validVariants.forEach((variant) => {
        render(<Hero key={variant} heading={`Hero ${variant}`} backgroundVariant={variant} />);
      });

      // All should render successfully
      validVariants.forEach((variant) => {
        expect(screen.getByText(`Hero ${variant}`)).toBeInTheDocument();
      });
    });

    it('forwards HeroContent props correctly', () => {
      // Test that HeroContent prop types are properly forwarded
      render(
        <Hero
          heading="Type Test"
          headingVariant="h3"
          subheading="Type test subheading"
          subheadingVariant="bodySmall"
          variant="centered"
        />,
      );

      const heading = screen.getByRole('heading', { name: 'Type Test' });
      expect(heading.tagName).toBe('H3');

      const subheading = screen.getByText('Type test subheading');
      expect(subheading).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty heading gracefully', () => {
      render(<Hero heading="" />);

      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
      expect(heading).toBeEmptyDOMElement();
    });

    it('handles complex CTA content', () => {
      const complexCta = (
        <div>
          <button>Primary Action</button>
          <button>Secondary Action</button>
        </div>
      );

      render(<Hero heading="Complex CTA Hero" cta={complexCta} />);

      expect(screen.getByRole('button', { name: 'Primary Action' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Secondary Action' })).toBeInTheDocument();
    });

    it('combines background variant and custom className', () => {
      render(
        <Hero
          heading="Combined Classes"
          backgroundVariant="gradient"
          className="custom-spacing border-2"
          data-testid="hero-container"
        />,
      );

      const container = screen.getByTestId('hero-container');

      // Should have both background variant and custom classes
      expect(container).toHaveClass('bg-gradient-to-br', 'custom-spacing', 'border-2');
    });
  });
});
