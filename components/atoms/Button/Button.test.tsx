/**
 * Tests for Button component
 *
 * Covers styling variants, sizes, interactions, loading states, and accessibility
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import { Button } from './Button';

describe('Button', () => {
  describe('Rendering', () => {
    it('should render with default variant and size', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeInTheDocument();
      // Should have primary variant classes
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
      // Should have default size classes
      expect(button).toHaveClass('h-10', 'px-4');
    });

    it('should render with different variants', () => {
      const { rerender } = render(<Button variant="secondary">Secondary</Button>);
      let button = screen.getByRole('button', { name: 'Secondary' });
      expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');

      rerender(<Button variant="destructive">Destructive</Button>);
      button = screen.getByRole('button', { name: 'Destructive' });
      expect(button).toHaveClass('bg-destructive');

      rerender(<Button variant="outline">Outline</Button>);
      button = screen.getByRole('button', { name: 'Outline' });
      expect(button).toHaveClass('border', 'border-input');

      rerender(<Button variant="ghost">Ghost</Button>);
      button = screen.getByRole('button', { name: 'Ghost' });
      expect(button).toHaveClass('hover:bg-accent');

      rerender(<Button variant="link">Link</Button>);
      button = screen.getByRole('button', { name: 'Link' });
      expect(button).toHaveClass('text-primary', 'underline-offset-4');
    });

    it('should render with different sizes', () => {
      const { rerender } = render(<Button size="sm">Small</Button>);
      let button = screen.getByRole('button', { name: 'Small' });
      expect(button).toHaveClass('h-9', 'px-3', 'text-xs');

      rerender(<Button size="default">Default</Button>);
      button = screen.getByRole('button', { name: 'Default' });
      expect(button).toHaveClass('h-10', 'px-4', 'text-sm');

      rerender(<Button size="lg">Large</Button>);
      button = screen.getByRole('button', { name: 'Large' });
      expect(button).toHaveClass('h-11', 'px-8', 'text-base');

      rerender(<Button size="icon">★</Button>);
      button = screen.getByRole('button', { name: '★' });
      expect(button).toHaveClass('h-10', 'w-10', 'p-0');
    });
  });

  describe('Interactions', () => {
    it('should handle click events', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button', { name: 'Click me' });

      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading State', () => {
    it('should display loading spinner and text', () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button', { name: /Loading/i });

      // Should have an SVG for the spinner
      const spinner = button.querySelector('svg');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');

      // Button should still contain the text
      expect(button).toHaveTextContent('Loading');
    });

    it('should disable button when loading', () => {
      const handleClick = jest.fn();
      render(
        <Button isLoading onClick={handleClick}>
          Loading
        </Button>,
      );
      const button = screen.getByRole('button', { name: /Loading/i });

      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should disable button when disabled prop is true', () => {
      const handleClick = jest.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>,
      );
      const button = screen.getByRole('button', { name: 'Disabled' });

      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should forward additional accessibility props', () => {
      render(
        <Button type="submit" aria-label="Submit form" data-testid="submit-button">
          Submit
        </Button>,
      );

      const button = screen.getByTestId('submit-button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('aria-label', 'Submit form');
    });
  });
});
