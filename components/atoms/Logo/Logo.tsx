import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export type LogoVariant = 'default' | 'square';

export interface LogoProps {
  /**
   * The variant of the logo
   * @default 'default'
   */
  variant?: LogoVariant;
  /**
   * The width of the logo in pixels
   * @default 200 for 'default', 64 for 'square'
   */
  width?: number;
  /**
   * The height of the logo in pixels
   * If not provided, it will be calculated based on the aspect ratio
   */
  height?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Alternative text for the logo
   * @default 'Time is Money'
   */
  alt?: string;
}

/**
 * Logo component for the Time is Money application
 * Uses optimized Next.js Image component to render the logo
 */
export const Logo: React.FC<LogoProps> = ({
  variant = 'default',
  width,
  height,
  className,
  alt = 'Time is Money',
}) => {
  // Default widths for different variants
  const defaultWidth = variant === 'default' ? 200 : 64;
  const logoWidth = width || defaultWidth;

  // Logo sources for different variants
  const logoSrc = variant === 'default' ? '/logo-01.png' : '/logo-02.png';

  return (
    <div className={cn('relative', className)}>
      <Image
        src={logoSrc}
        width={logoWidth}
        height={height || (variant === 'default' ? logoWidth * 0.25 : logoWidth)} // Maintain aspect ratio if height not specified
        alt={alt}
        className="object-contain"
        priority // Load with higher priority as it's part of the main UI
      />
    </div>
  );
};
