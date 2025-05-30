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
export const variantElementMap: Record<keyof typeof typographyPresets, React.ElementType> = {
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
 * Mapping of typography variants to their corresponding responsive Tailwind classes
 * Following mobile-first approach with progressive enhancement
 */
export const variantClassMap: Record<keyof typeof typographyPresets, string> = {
  h1: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight',
  h2: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight tracking-tight',
  h3: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold leading-snug',
  h4: 'text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold leading-snug',
  h5: 'text-base sm:text-lg md:text-xl lg:text-2xl font-semibold leading-normal',
  h6: 'text-sm sm:text-base md:text-lg lg:text-xl font-semibold leading-normal',
  bodyLarge: 'text-base sm:text-lg md:text-xl font-normal leading-relaxed',
  body: 'text-sm sm:text-base md:text-lg font-normal leading-normal',
  bodySmall: 'text-xs sm:text-sm md:text-base font-normal leading-normal',
  caption: 'text-xs sm:text-xs md:text-sm font-normal leading-normal',
  overline: 'text-xs sm:text-xs md:text-sm font-medium leading-normal tracking-wider uppercase',
  label: 'text-xs sm:text-sm md:text-base font-medium leading-normal',
  code: 'text-xs sm:text-sm md:text-base font-normal leading-normal font-mono',
  codeBlock: 'text-xs sm:text-sm md:text-base font-normal leading-relaxed font-mono',
};

/**
 * Typography component for consistent text styling across the application.
 * It provides a set of predefined typography variants that map to appropriate HTML elements
 * and responsive Tailwind CSS classes.
 *
 * Responsive behavior follows mobile-first approach:
 * - Base: 320px+ (mobile)
 * - sm: 640px+ (small tablets)
 * - md: 768px+ (tablets)
 * - lg: 1024px+ (desktop)
 * - xl: 1280px+ (large desktop)
 *
 * Typography scales progressively larger at each breakpoint for optimal readability.
 *
 * @example
 * ```tsx
 * <Typography variant="h1">Responsive Heading 1</Typography>
 * <Typography variant="body">Responsive paragraph text</Typography>
 * <Typography variant="h2" as="h3">Responsive heading with custom element</Typography>
 * ```
 *
 * @param {TypographyProps} props - Component props
 * @returns {React.ReactElement} Rendered element with responsive styling
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
