import React from 'react';
import { render, screen } from '@testing-library/react';
import { Icon } from './Icon';
import { axe, toHaveNoViolations } from 'jest-axe';

// Add jest-axe matcher
expect.extend(toHaveNoViolations);

// Mock console.error to avoid polluting test output
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = jest.fn();
});
afterEach(() => {
  console.error = originalConsoleError;
});

describe('Icon component', () => {
  it('renders the correct Lucide icon', () => {
    render(<Icon name="Clock" data-testid="clock-icon" />);
    const icon = screen.getByTestId('clock-icon');
    expect(icon).toBeInTheDocument();
    expect(icon.tagName).toBe('svg');
  });

  it('applies the correct default props', () => {
    render(<Icon name="Clock" data-testid="clock-icon" />);
    const icon = screen.getByTestId('clock-icon');

    expect(icon).toHaveAttribute('width', '24');
    expect(icon).toHaveAttribute('height', '24');
    expect(icon).toHaveAttribute('stroke-width', '2');
    expect(icon).toHaveClass('flex-shrink-0');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies custom size', () => {
    render(<Icon name="Clock" size={48} data-testid="clock-icon" />);
    const icon = screen.getByTestId('clock-icon');

    expect(icon).toHaveAttribute('width', '48');
    expect(icon).toHaveAttribute('height', '48');
  });

  it('applies custom color', () => {
    render(<Icon name="Clock" color="red" data-testid="clock-icon" />);
    const icon = screen.getByTestId('clock-icon');

    expect(icon).toHaveAttribute('stroke', 'red');
  });

  it('applies custom stroke width', () => {
    render(<Icon name="Clock" strokeWidth={3} data-testid="clock-icon" />);
    const icon = screen.getByTestId('clock-icon');

    expect(icon).toHaveAttribute('stroke-width', '3');
  });

  it('applies custom className', () => {
    render(<Icon name="Clock" className="custom-class" data-testid="clock-icon" />);
    const icon = screen.getByTestId('clock-icon');

    expect(icon).toHaveClass('custom-class');
    // Should still have the default class
    expect(icon).toHaveClass('flex-shrink-0');
  });

  it('handles invalid icon names gracefully', () => {
    // @ts-ignore - Testing with an invalid name
    render(<Icon name="InvalidIconName" data-testid="invalid-icon" />);

    expect(console.error).toHaveBeenCalledWith('Icon "InvalidIconName" not found in lucide-react');
    expect(screen.queryByTestId('invalid-icon')).not.toBeInTheDocument();
  });

  it('renders core Time is Money icons', () => {
    const { rerender } = render(<Icon name="Clock" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();

    rerender(<Icon name="DollarSign" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();

    rerender(<Icon name="Timer" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();

    rerender(<Icon name="Coins" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});

// Accessibility tests
describe('Icon component accessibility', () => {
  it('has no accessibility violations as a decorative icon', async () => {
    const { container } = render(<Icon name="Clock" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has aria-hidden attribute set to true by default', () => {
    render(<Icon name="Clock" data-testid="icon" />);
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('preserves custom aria attributes when provided', () => {
    render(
      <Icon
        name="Clock"
        data-testid="icon"
        aria-label="Clock icon"
        aria-hidden={false}
        role="img"
      />,
    );
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveAttribute('aria-label', 'Clock icon');
    expect(icon).toHaveAttribute('aria-hidden', 'false');
    expect(icon).toHaveAttribute('role', 'img');
  });

  it('has no accessibility violations when used with proper labeling', async () => {
    const { container } = render(
      <button aria-label="Settings">
        <Icon name="Settings" />
      </button>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with different icon colors', async () => {
    const { container } = render(
      <div style={{ color: 'black', backgroundColor: 'white' }}>
        <Icon name="Info" color="currentColor" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with different sizes', async () => {
    const { container } = render(
      <div>
        <Icon name="AlertTriangle" size={16} />
        <Icon name="AlertTriangle" size={24} />
        <Icon name="AlertTriangle" size={32} />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
