import React from 'react';
import { render, screen } from '@testing-library/react';
import { Logo } from './Logo';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ComponentProps<'img'>): React.ReactElement => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

describe('Logo component', () => {
  it('renders with default props', () => {
    render(<Logo />);
    const logoImg = screen.getByAltText('Time is Money');

    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveAttribute('src', '/logo-01.png');
    expect(logoImg).toHaveAttribute('width', '200');
    expect(logoImg).toHaveAttribute('height', '50'); // 200 * 0.25 for aspect ratio
  });

  it('renders square variant', () => {
    render(<Logo variant="square" />);
    const logoImg = screen.getByAltText('Time is Money');

    expect(logoImg).toHaveAttribute('src', '/logo-02.png');
    expect(logoImg).toHaveAttribute('width', '64');
    expect(logoImg).toHaveAttribute('height', '64');
  });

  it('applies custom width', () => {
    render(<Logo width={300} />);
    const logoImg = screen.getByAltText('Time is Money');

    expect(logoImg).toHaveAttribute('width', '300');
    expect(logoImg).toHaveAttribute('height', '75'); // 300 * 0.25 for aspect ratio
  });

  it('applies custom height', () => {
    render(<Logo width={200} height={100} />);
    const logoImg = screen.getByAltText('Time is Money');

    expect(logoImg).toHaveAttribute('width', '200');
    expect(logoImg).toHaveAttribute('height', '100');
  });

  it('applies custom alt text', () => {
    render(<Logo alt="Custom alt text" />);
    const logoImg = screen.getByAltText('Custom alt text');

    expect(logoImg).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Logo className="custom-class" />);
    const logoContainer = screen.getByAltText('Time is Money').parentElement;

    expect(logoContainer).toHaveClass('custom-class');
    // Should still have the default class
    expect(logoContainer).toHaveClass('relative');
  });
});
