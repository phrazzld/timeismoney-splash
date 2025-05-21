import * as React from 'react';
import { cn } from '../../../lib/utils';
import { typographyPresets } from '../../../design-tokens/typography';

/**
 * Props for the Typography component
 *
 * @interface TypographyProps
 * @extends {React.HTMLAttributes<HTMLElement>}
 */
export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Typography variant to apply
   */
  variant: keyof typeof typographyPresets;

  /**
   * Override the default HTML element
   */
  as?: React.ElementType;

  /**
   * Additional CSS classes to apply
   */
  className?: string;

  /**
   * Content to render
   */
  children: React.ReactNode;
}

/**
 * Mapping of typography variants to their default HTML elements
 */
const variantElementMap: Record<keyof typeof typographyPresets, React.ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  bodyLarge: 'p',
  body: 'p',
  bodySmall: 'p',
  caption: 'span',
  overline: 'span',
  label: 'label',
  code: 'code',
  codeBlock: 'pre',
};

/**
 * Mapping of typography variants to their corresponding Tailwind classes
 */
const variantClassMap: Record<keyof typeof typographyPresets, string> = {
  h1: 'text-5xl font-bold leading-tight tracking-tight',
  h2: 'text-4xl font-bold leading-tight tracking-tight',
  h3: 'text-3xl font-semibold leading-snug',
  h4: 'text-2xl font-semibold leading-snug',
  h5: 'text-xl font-semibold leading-normal',
  h6: 'text-lg font-semibold leading-normal',
  bodyLarge: 'text-lg font-normal leading-relaxed',
  body: 'text-base font-normal leading-normal',
  bodySmall: 'text-sm font-normal leading-normal',
  caption: 'text-xs font-normal leading-normal',
  overline: 'text-xs font-medium leading-normal tracking-wider uppercase',
  label: 'text-sm font-medium leading-normal',
  code: 'text-sm font-normal leading-normal font-mono',
  codeBlock: 'text-sm font-normal leading-relaxed font-mono',
};

/**
 * Typography component for consistent text styling across the application.
 * It provides a set of predefined typography variants that map to appropriate HTML elements
 * and Tailwind CSS classes.
 *
 * @example
 * ```tsx
 * <Typography variant="h1">Heading 1</Typography>
 * <Typography variant="body">Regular paragraph text</Typography>
 * <Typography variant="h2" as="h3">Heading 2 styled as h3 element</Typography>
 * ```
 *
 * @param {TypographyProps} props - Component props
 * @returns {React.ReactElement} Rendered element with appropriate styling
 */
export const Typography: React.FC<TypographyProps> = ({
  variant,
  as,
  className,
  children,
  ...props
}): React.ReactElement => {
  // Determine the element to render based on variant or override
  const Element = as || variantElementMap[variant];

  return (
    <Element className={cn(variantClassMap[variant], className)} {...props}>
      {children}
    </Element>
  );
};

export default Typography;
