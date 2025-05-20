import React from 'react';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

// Create a type that includes all Lucide icon names
export type IconName = keyof typeof LucideIcons;

export interface IconProps extends Omit<LucideProps, 'ref'> {
  /**
   * Name of the icon from lucide-react
   */
  name: IconName;
  /**
   * Size of the icon in pixels
   * @default 24
   */
  size?: number | string;
  /**
   * Color of the icon
   * @default 'currentColor'
   */
  color?: string;
  /**
   * Stroke width of the icon
   * @default 2
   */
  strokeWidth?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Icon component that renders a Lucide icon
 * The primary icons for the Time is Money app are:
 * - Time-related: Clock, Timer, Hourglass
 * - Money-related: DollarSign, Coins, Wallet, PiggyBank
 *
 * See docs/icon-usage.md for complete icon usage guidelines
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  className,
  ...props
}) => {
  // Get the icon component from lucide-react
  const LucideIcon = LucideIcons[name];

  if (!LucideIcon) {
    console.error(`Icon "${name}" not found in lucide-react`);
    return null;
  }

  return (
    <LucideIcon
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={cn('flex-shrink-0', className)}
      aria-hidden="true"
      {...props}
    />
  );
};
