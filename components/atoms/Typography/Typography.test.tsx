import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Typography from './Typography';
import { typographyPresets } from '../../../design-tokens/typography';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { variantElementMap, variantClassMap } from './Typography'; // Import maps for testing

// Add jest-axe matcher
expect.extend(toHaveNoViolations);

describe('Typography', () => {
  it('should render with the correct variant styling', () => {
    render(<Typography variant="h1">Heading 1</Typography>);
    const heading = screen.getByText('Heading 1');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');
    expect(heading).toHaveClass(
      'text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight',
    );
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
    expect(heading).toHaveClass(
      'text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight',
    );
  });

  it('should merge additional className with variant classes', () => {
    render(
      <Typography variant="body" className="text-primary">
        Body text
      </Typography>,
    );
    const text = screen.getByText('Body text');
    expect(text).toBeInTheDocument();
    expect(text).toHaveClass(
      'text-sm sm:text-base md:text-lg font-normal leading-normal text-primary',
    );
  });

  it('should apply different styles based on variant', () => {
    const { rerender } = render(<Typography variant="body">Body text</Typography>);
    expect(screen.getByText('Body text')).toHaveClass(
      'text-sm sm:text-base md:text-lg font-normal leading-normal',
    );
    expect(screen.getByText('body text', { exact: false }).tagName).toBe('P');

    rerender(<Typography variant="caption">Caption text</Typography>);
    expect(screen.getByText('Caption text')).toHaveClass('text-xs font-normal leading-normal');
    expect(screen.getByText('caption text', { exact: false }).tagName).toBe('SPAN');
  });

  it('should pass additional props to the rendered element', () => {
    render(
      <Typography variant="body" data-testid="test-typography">
        Body text
      </Typography>,
    );
    expect(screen.getByTestId('test-typography')).toBeInTheDocument();
  });

  describe('All variants', () => {
    // Test all heading variants (h1-h6)
    it.each(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])(
      'should render %s with correct element and styling',
      (variant) => {
        render(
          <Typography variant={variant as keyof typeof typographyPresets}>
            {variant} Text
          </Typography>,
        );
        const element = screen.getByText(`${variant} Text`);
        expect(element).toBeInTheDocument();
        expect(element.tagName).toBe(variant.toUpperCase());
        expect(element).toHaveClass(variantClassMap[variant as keyof typeof typographyPresets]);
      },
    );

    // Test body text variants
    it.each(['bodyLarge', 'body', 'bodySmall'])(
      'should render %s with paragraph element and styling',
      (variant) => {
        render(
          <Typography variant={variant as keyof typeof typographyPresets}>
            {variant} Text
          </Typography>,
        );
        const element = screen.getByText(`${variant} Text`);
        expect(element).toBeInTheDocument();
        expect(element.tagName).toBe('P');
        expect(element).toHaveClass(variantClassMap[variant as keyof typeof typographyPresets]);
      },
    );

    // Test utility text variants
    it.each(['caption', 'overline'])(
      'should render %s with span element and styling',
      (variant) => {
        render(
          <Typography variant={variant as keyof typeof typographyPresets}>
            {variant} Text
          </Typography>,
        );
        const element = screen.getByText(`${variant} Text`);
        expect(element).toBeInTheDocument();
        expect(element.tagName).toBe('SPAN');
        expect(element).toHaveClass(variantClassMap[variant as keyof typeof typographyPresets]);
      },
    );

    // Test label variant
    it('should render label with label element and styling', () => {
      render(<Typography variant="label">Label Text</Typography>);
      const element = screen.getByText('Label Text');
      expect(element).toBeInTheDocument();
      expect(element.tagName).toBe('LABEL');
      expect(element).toHaveClass(variantClassMap.label);
    });

    // Test code variants
    it('should render code with code element and styling', () => {
      render(<Typography variant="code">const x = 5;</Typography>);
      const element = screen.getByText('const x = 5;');
      expect(element).toBeInTheDocument();
      expect(element.tagName).toBe('CODE');
      expect(element).toHaveClass(variantClassMap.code);
    });

    it('should render codeBlock with pre element and styling', () => {
      render(<Typography variant="codeBlock">{'function example() { return true; }'}</Typography>);
      const element = screen.getByText('function example() { return true; }');
      expect(element).toBeInTheDocument();
      expect(element.tagName).toBe('PRE');
      expect(element).toHaveClass(variantClassMap.codeBlock);
    });
  });

  describe('Edge cases', () => {
    it('should handle nested children correctly', () => {
      render(
        <Typography variant="body">
          Text with <strong>bold</strong> and <em>italic</em> content
        </Typography>,
      );

      const paragraph = screen.getByText(/Text with/);
      expect(paragraph).toBeInTheDocument();
      expect(paragraph.tagName).toBe('P');

      const bold = screen.getByText('bold');
      expect(bold).toBeInTheDocument();
      expect(bold.tagName).toBe('STRONG');

      const italic = screen.getByText('italic');
      expect(italic).toBeInTheDocument();
      expect(italic.tagName).toBe('EM');
    });

    it('should handle event handlers passed as props', () => {
      const handleClick = jest.fn();

      render(
        <Typography variant="body" onClick={handleClick}>
          Clickable Text
        </Typography>,
      );

      const element = screen.getByText('Clickable Text');
      element.click();

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations for individual variants', async () => {
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

    it('should maintain semantic accessibility when using as prop', async () => {
      const { container } = render(
        <div role="region" aria-label="Test Region">
          <Typography variant="h2" as="h3">
            This looks like an h2 but is semantically an h3
          </Typography>
          <Typography variant="body" as="div" role="paragraph">
            This is a paragraph styled text but in a div with proper ARIA role
          </Typography>
        </div>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with proper heading structure', async () => {
      const { container } = render(
        <article>
          <Typography variant="h1">Main Heading</Typography>
          <Typography variant="body">Introduction paragraph</Typography>

          <section>
            <Typography variant="h2">Section Heading</Typography>
            <Typography variant="body">Section content</Typography>

            <div>
              <Typography variant="h3">Subsection Heading</Typography>
              <Typography variant="bodySmall">Smaller text in subsection</Typography>
              <Typography variant="caption">Caption text</Typography>
            </div>
          </section>
        </article>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
