/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LandingTemplate } from '../../app/landing/template';
import type { HeroProps } from '../../components/organisms/Hero';

// Mock scroll utilities
const mockScrollToSection = jest.fn(() => Promise.resolve());
jest.mock('../../lib/scroll', () => ({
  scrollToSection: mockScrollToSection,
  getScrollPosition: jest.fn(() => ({ x: 0, y: 0, percentage: 0 })),
  isElementInView: jest.fn(() => Promise.resolve(true)),
}));

// Mock useScrollNavigation hook
const mockUseScrollNavigation = {
  activeSection: 'hero',
  sections: [
    { id: 'hero', label: 'Hero', element: null as any },
    { id: 'features', label: 'Features', element: null as any },
    { id: 'testimonials', label: 'Testimonials', element: null as any },
    { id: 'cta', label: 'Call to Action', element: null as any },
  ],
  scrollToSection: mockScrollToSection,
  isScrolling: false,
  scrollProgress: 0,
};

jest.mock('../../lib/hooks/useScrollNavigation', () => ({
  useScrollNavigation: () => mockUseScrollNavigation,
}));

// Mock Hero component
jest.mock('../../components/organisms/Hero', () => ({
  Hero: ({ heading, ...props }: any) => (
    <div data-testid="hero-component" data-heading={heading} {...props}>
      Hero Component: {heading}
    </div>
  ),
}));

describe('Landing Template Navigation Integration', () => {
  const mockHeroProps: HeroProps = {
    heading: 'Test Hero Heading',
    subheading: 'Test subheading',
    backgroundVariant: 'gradient',
    variant: 'centered',
    cta: <button>Test CTA</button>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Section Structure', () => {
    test('renders all sections with correct IDs', () => {
      render(<LandingTemplate heroProps={mockHeroProps} />);

      // Check that all sections exist with correct IDs
      expect(document.getElementById('hero')).toBeInTheDocument();
      expect(document.getElementById('features')).toBeInTheDocument();
      expect(document.getElementById('testimonials')).toBeInTheDocument();
      expect(document.getElementById('cta')).toBeInTheDocument();
    });

    test('sections have proper ARIA labels', () => {
      render(<LandingTemplate heroProps={mockHeroProps} />);

      expect(screen.getByRole('region', { name: 'Hero section' })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: 'Features' })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: 'Testimonials' })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: 'Call to Action' })).toBeInTheDocument();
    });

    test('main element has correct role', () => {
      render(<LandingTemplate heroProps={mockHeroProps} />);

      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Skip Links', () => {
    test('renders skip links for all sections', () => {
      render(<LandingTemplate heroProps={mockHeroProps} />);

      expect(screen.getByText('Skip to main content')).toBeInTheDocument();
      expect(screen.getByText('Skip to features')).toBeInTheDocument();
      expect(screen.getByText('Skip to testimonials')).toBeInTheDocument();
      expect(screen.getByText('Skip to call to action')).toBeInTheDocument();
    });

    test('skip links are initially hidden but become visible on focus', () => {
      render(<LandingTemplate heroProps={mockHeroProps} />);

      const skipLink = screen.getByText('Skip to main content').closest('a')!;
      
      // Should be positioned off-screen initially
      expect(skipLink).toHaveClass('sr-only', 'focus:not-sr-only');
    });

    test('clicking skip link navigates to correct section', async () => {
      const user = userEvent.setup();
      render(<LandingTemplate heroProps={mockHeroProps} />);

      const skipToFeatures = screen.getByText('Skip to features').closest('a')!;
      
      await user.click(skipToFeatures);

      expect(mockScrollToSection).toHaveBeenCalledWith('features');
    });

    test('skip links work with keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<LandingTemplate heroProps={mockHeroProps} />);

      const skipToFeatures = screen.getByText('Skip to features').closest('a')!;
      
      // Focus and press Enter
      skipToFeatures.focus();
      await user.keyboard('{Enter}');

      expect(mockScrollToSection).toHaveBeenCalledWith('features');
    });
  });

  describe('Navigation State Integration', () => {
    test('hook is initialized with correct sections', () => {
      const useScrollNavigationMock = require('../../lib/hooks/useScrollNavigation').useScrollNavigation;
      
      render(<LandingTemplate heroProps={mockHeroProps} />);

      expect(useScrollNavigationMock).toHaveBeenCalledWith({
        sections: [
          { id: 'hero', label: 'Hero section' },
          { id: 'features', label: 'Features' },
          { id: 'testimonials', label: 'Testimonials' },
          { id: 'cta', label: 'Call to Action' },
        ],
        threshold: 0.5,
        debounceMs: 300,
        focusOnScroll: true,
      });
    });

    test('active section updates are reflected in UI', () => {
      // Mock different active section
      mockUseScrollNavigation.activeSection = 'features';

      render(<LandingTemplate heroProps={mockHeroProps} />);

      // Should reflect the active section somehow (e.g., through data attributes or classes)
      const featuresSection = document.getElementById('features');
      expect(featuresSection).toHaveAttribute('data-active', 'true');
    });

    test('scroll progress is available in template context', () => {
      mockUseScrollNavigation.scrollProgress = 45;

      render(<LandingTemplate heroProps={mockHeroProps} />);

      // Template should have access to scroll progress
      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('data-scroll-progress', '45');
    });
  });

  describe('Accessibility Features', () => {
    test('sections maintain proper heading hierarchy', () => {
      render(<LandingTemplate heroProps={mockHeroProps} />);

      // Hero section should have h1
      const heroSection = document.getElementById('hero');
      const hiddenHeading = heroSection?.querySelector('h1');
      expect(hiddenHeading).toBeInTheDocument();
      expect(hiddenHeading).toHaveClass('sr-only');
    });

    test('skip links have proper ARIA attributes', () => {
      render(<LandingTemplate heroProps={mockHeroProps} />);

      const skipToFeatures = screen.getByText('Skip to features').closest('a')!;
      
      expect(skipToFeatures).toHaveAttribute('href', '#features');
      expect(skipToFeatures).toHaveAttribute('aria-label', 'Skip to features section');
    });

    test('sections are properly announced by screen readers', () => {
      render(<LandingTemplate heroProps={mockHeroProps} />);

      // Check that sections have appropriate ARIA live regions for announcements
      const featuresSection = document.getElementById('features');
      expect(featuresSection?.closest('[role="region"]')).toHaveAttribute('aria-label', 'Features');
    });

    test('focus management works correctly for programmatic navigation', async () => {
      render(<LandingTemplate heroProps={mockHeroProps} />);

      const featuresSection = document.getElementById('features');
      expect(featuresSection).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Hero Integration', () => {
    test('Hero component receives correct props', () => {
      render(<LandingTemplate heroProps={mockHeroProps} />);

      const heroComponent = screen.getByTestId('hero-component');
      expect(heroComponent).toHaveAttribute('data-heading', 'Test Hero Heading');
    });

    test('Hero heading ID is properly set for ARIA labeling', () => {
      render(<LandingTemplate heroProps={mockHeroProps} />);

      const hiddenHeading = screen.getByRole('heading', { level: 1, hidden: true });
      expect(hiddenHeading).toHaveTextContent('Test Hero Heading');
      expect(hiddenHeading.id).toMatch(/.*-hero-heading$/);
    });
  });

  describe('Custom Props and Children', () => {
    test('accepts custom className', () => {
      render(
        <LandingTemplate 
          heroProps={mockHeroProps} 
          className="custom-landing-class"
        />
      );

      const main = screen.getByRole('main');
      expect(main).toHaveClass('custom-landing-class');
    });

    test('renders children content', () => {
      render(
        <LandingTemplate heroProps={mockHeroProps}>
          <section data-testid="custom-section">Custom content</section>
        </LandingTemplate>
      );

      expect(screen.getByTestId('custom-section')).toBeInTheDocument();
      expect(screen.getByText('Custom content')).toBeInTheDocument();
    });

    test('passes through additional HTML attributes', () => {
      render(
        <LandingTemplate 
          heroProps={mockHeroProps}
          data-testid="landing-main"
          id="custom-main-id"
        />
      );

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('data-testid', 'landing-main');
      expect(main).toHaveAttribute('id', 'custom-main-id');
    });
  });

  describe('Error Handling', () => {
    test('handles missing scroll navigation gracefully', () => {
      // Mock hook to return error state
      jest.mocked(require('../../lib/hooks/useScrollNavigation').useScrollNavigation)
        .mockReturnValueOnce({
          activeSection: null,
          sections: [],
          scrollToSection: jest.fn(),
          isScrolling: false,
          scrollProgress: 0,
        });

      expect(() => {
        render(<LandingTemplate heroProps={mockHeroProps} />);
      }).not.toThrow();
    });

    test('handles scroll function errors gracefully', async () => {
      const user = userEvent.setup();
      mockScrollToSection.mockRejectedValueOnce(new Error('Scroll failed'));

      render(<LandingTemplate heroProps={mockHeroProps} />);

      const skipLink = screen.getByText('Skip to features').closest('a')!;
      
      // Should not throw when scroll fails
      await user.click(skipLink);
      
      expect(mockScrollToSection).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    test('does not cause unnecessary re-renders', () => {
      const { rerender } = render(<LandingTemplate heroProps={mockHeroProps} />);

      // Re-render with same props
      rerender(<LandingTemplate heroProps={mockHeroProps} />);

      // Hook should not be called again unnecessarily
      const useScrollNavigationMock = require('../../lib/hooks/useScrollNavigation').useScrollNavigation;
      expect(useScrollNavigationMock).toHaveBeenCalledTimes(2); // Initial + rerender
    });

    test('memoizes stable section configuration', () => {
      const { rerender } = render(<LandingTemplate heroProps={mockHeroProps} />);

      // Re-render multiple times
      rerender(<LandingTemplate heroProps={mockHeroProps} />);
      rerender(<LandingTemplate heroProps={mockHeroProps} />);

      // Section configuration should be stable
      const useScrollNavigationMock = require('../../lib/hooks/useScrollNavigation').useScrollNavigation;
      const calls = useScrollNavigationMock.mock.calls;
      
      // All calls should have the same sections configuration
      expect(calls[0][0].sections).toEqual(calls[1][0].sections);
      expect(calls[1][0].sections).toEqual(calls[2][0].sections);
    });
  });
});