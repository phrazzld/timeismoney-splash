import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { HeroContent } from './HeroContent';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('HeroContent', () => {
  describe('Basic Rendering', () => {
    it('renders with required heading prop', () => {
      render(<HeroContent heading="Test Heading" />);

      const heading = screen.getByRole('heading', { name: 'Test Heading' });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H1');
    });

    it('renders as a semantic section element', () => {
      render(<HeroContent heading="Test Heading" />);

      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
      expect(section.tagName).toBe('SECTION');
    });

    it('applies default heading variant when not specified', () => {
      render(<HeroContent heading="Test Heading" />);

      const heading = screen.getByRole('heading', { name: 'Test Heading' });
      // Should have h1 variant classes
      expect(heading).toHaveClass('text-5xl', 'font-bold');
    });

    it('accepts and applies custom className', () => {
      render(<HeroContent heading="Test Heading" className="custom-class" />);

      const section = screen.getByRole('region');
      expect(section).toHaveClass('custom-class');
    });

    it('forwards additional HTML attributes', () => {
      render(<HeroContent heading="Test Heading" data-testid="hero-content" />);

      const section = screen.getByTestId('hero-content');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Typography Integration', () => {
    it('renders custom heading variant when specified', () => {
      render(<HeroContent heading="Test Heading" headingVariant="h2" />);

      const heading = screen.getByRole('heading', { name: 'Test Heading' });
      expect(heading.tagName).toBe('H2');
      expect(heading).toHaveClass('text-4xl', 'font-bold');
    });

    it('renders subheading when provided', () => {
      render(<HeroContent heading="Main Heading" subheading="This is a subheading" />);

      const subheading = screen.getByText('This is a subheading');
      expect(subheading).toBeInTheDocument();
      expect(subheading.tagName).toBe('P');
      expect(subheading).toHaveClass('text-lg');
    });

    it('does not render subheading when not provided', () => {
      render(<HeroContent heading="Main Heading" />);

      // Should only have one text element (the heading)
      const textElements = screen.getAllByText(/heading/i);
      expect(textElements).toHaveLength(1);
    });

    it('renders custom subheading variant when specified', () => {
      render(
        <HeroContent
          heading="Main Heading"
          subheading="Custom subheading"
          subheadingVariant="body"
        />,
      );

      const subheading = screen.getByText('Custom subheading');
      expect(subheading).toHaveClass('text-base');
    });

    it('maintains proper heading hierarchy', () => {
      render(
        <HeroContent
          heading="Main Heading"
          headingVariant="h1"
          subheading="Subheading text"
          subheadingVariant="bodyLarge"
        />,
      );

      const heading = screen.getByRole('heading', { level: 1 });
      const subheading = screen.getByText('Subheading text');

      expect(heading).toBeInTheDocument();
      expect(subheading).toBeInTheDocument();

      // Subheading should not be a heading element when using body variants
      expect(subheading.tagName).toBe('P');
    });
  });

  describe('Optional Features', () => {
    it('renders CTA content when provided', () => {
      const ctaContent = <button>Call to Action</button>;

      render(<HeroContent heading="Main Heading" cta={ctaContent} />);

      const ctaButton = screen.getByRole('button', { name: 'Call to Action' });
      expect(ctaButton).toBeInTheDocument();
    });

    it('does not render CTA section when not provided', () => {
      render(<HeroContent heading="Main Heading" />);

      const buttons = screen.queryAllByRole('button');
      expect(buttons).toHaveLength(0);
    });

    it('renders with default layout variant', () => {
      render(<HeroContent heading="Test Heading" />);

      const section = screen.getByRole('region');
      // Should have default layout classes (left-aligned)
      expect(section).toHaveClass('text-left');
    });

    it('renders with centered variant when specified', () => {
      render(<HeroContent heading="Test Heading" variant="centered" />);

      const section = screen.getByRole('region');
      expect(section).toHaveClass('text-center');
    });
  });

  describe('Content Layout', () => {
    it('organizes content in proper vertical order', () => {
      render(
        <HeroContent
          heading="Main Heading"
          subheading="Subheading text"
          cta={<button>CTA Button</button>}
        />,
      );

      const section = screen.getByRole('region');
      const heading = screen.getByRole('heading');
      const subheading = screen.getByText('Subheading text');
      const cta = screen.getByRole('button');

      // Verify they're all in the same container
      expect(section).toContainElement(heading);
      expect(section).toContainElement(subheading);
      expect(section).toContainElement(cta);

      // Verify order in DOM
      const children = Array.from(section.children);
      const headingIndex = children.indexOf(heading);
      const subheadingIndex = children.indexOf(subheading);
      const ctaContainerIndex = children.findIndex(
        (child) => child.querySelector('button') === cta,
      );

      expect(headingIndex).toBeLessThan(subheadingIndex);
      expect(subheadingIndex).toBeLessThan(ctaContainerIndex);
    });

    it('applies proper spacing between elements', () => {
      render(
        <HeroContent
          heading="Main Heading"
          subheading="Subheading text"
          cta={<button>CTA Button</button>}
        />,
      );

      const section = screen.getByRole('region');
      // Should have spacing classes for vertical layout
      expect(section).toHaveClass('space-y-6');
    });
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <HeroContent
          heading="Accessible Heading"
          subheading="Accessible subheading text"
          cta={<button>Accessible CTA</button>}
        />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides appropriate ARIA labeling', () => {
      render(<HeroContent heading="Hero Section Heading" subheading="Hero section description" />);

      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('aria-labelledby');

      const heading = screen.getByRole('heading');
      expect(heading).toHaveAttribute('id');
      expect(section.getAttribute('aria-labelledby')).toBe(heading.getAttribute('id'));
    });

    it('maintains semantic structure for screen readers', () => {
      render(
        <HeroContent heading="Main Content" subheading="Supporting text" headingVariant="h1" />,
      );

      // Should have proper heading hierarchy
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();

      // Section should be identifiable
      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
    });
  });

  describe('TypeScript Type Safety', () => {
    it('accepts all valid heading variants', () => {
      // These should not cause TypeScript errors
      const validVariants = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;

      validVariants.forEach((variant) => {
        render(
          <HeroContent key={variant} heading={`Heading ${variant}`} headingVariant={variant} />,
        );
      });

      // All headings should render
      validVariants.forEach((variant) => {
        expect(screen.getByText(`Heading ${variant}`)).toBeInTheDocument();
      });
    });

    it('accepts all valid subheading variants', () => {
      // These should not cause TypeScript errors
      const validVariants = ['body', 'bodyLarge', 'bodySmall'] as const;

      validVariants.forEach((variant) => {
        render(
          <HeroContent
            key={variant}
            heading="Test Heading"
            subheading={`Subheading ${variant}`}
            subheadingVariant={variant}
          />,
        );
      });

      // All subheadings should render
      validVariants.forEach((variant) => {
        expect(screen.getByText(`Subheading ${variant}`)).toBeInTheDocument();
      });
    });

    it('accepts all valid layout variants', () => {
      const validVariants = ['default', 'centered'] as const;

      validVariants.forEach((variant) => {
        render(<HeroContent key={variant} heading="Test Heading" variant={variant} />);
      });

      // Both should render successfully
      expect(screen.getAllByText('Test Heading')).toHaveLength(validVariants.length);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty heading gracefully', () => {
      render(<HeroContent heading="" />);

      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
      expect(heading).toBeEmptyDOMElement();
    });

    it('handles very long content appropriately', () => {
      const longHeading = 'A'.repeat(200);
      const longSubheading = 'B'.repeat(500);

      render(<HeroContent heading={longHeading} subheading={longSubheading} />);

      expect(screen.getByText(longHeading)).toBeInTheDocument();
      expect(screen.getByText(longSubheading)).toBeInTheDocument();
    });

    it('handles complex CTA content', () => {
      const complexCta = (
        <div>
          <button>Primary Action</button>
          <button>Secondary Action</button>
        </div>
      );

      render(<HeroContent heading="Test Heading" cta={complexCta} />);

      expect(screen.getByRole('button', { name: 'Primary Action' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Secondary Action' })).toBeInTheDocument();
    });
  });
});
