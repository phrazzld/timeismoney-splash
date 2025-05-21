import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import Typography from './Typography';

describe('Typography', () => {
  it('should render with the correct variant styling', () => {
    render(<Typography variant="h1">Heading 1</Typography>);
    const heading = screen.getByText('Heading 1');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');
    expect(heading).toHaveClass('text-5xl font-bold leading-tight tracking-tight');
  });

  it('should allow overriding the HTML element with the "as" prop', () => {
    render(
      <Typography variant="h1" as="div">
        Heading as div
      </Typography>,
    );
    const heading = screen.getByText('Heading as div');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('DIV');
    expect(heading).toHaveClass('text-5xl font-bold leading-tight tracking-tight');
  });

  it('should merge additional className with variant classes', () => {
    render(
      <Typography variant="body" className="text-primary">
        Body text
      </Typography>,
    );
    const text = screen.getByText('Body text');
    expect(text).toBeInTheDocument();
    expect(text).toHaveClass('text-base font-normal leading-normal text-primary');
  });

  it('should apply different styles based on variant', () => {
    const { rerender } = render(<Typography variant="body">Body text</Typography>);
    expect(screen.getByText('Body text')).toHaveClass('text-base font-normal leading-normal');
    expect(screen.getByText('Body text').tagName).toBe('P');

    rerender(<Typography variant="caption">Caption text</Typography>);
    expect(screen.getByText('Caption text')).toHaveClass('text-xs font-normal leading-normal');
    expect(screen.getByText('Caption text').tagName).toBe('SPAN');
  });

  it('should pass additional props to the rendered element', () => {
    render(
      <Typography variant="body" data-testid="test-typography">
        Body text
      </Typography>,
    );
    expect(screen.getByTestId('test-typography')).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <>
        <Typography variant="h1">Heading 1</Typography>
        <Typography variant="body">
          Body text with some <strong>bold</strong> content.
        </Typography>
        <Typography variant="caption">Caption text</Typography>
      </>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
