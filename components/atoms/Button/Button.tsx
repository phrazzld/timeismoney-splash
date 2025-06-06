import React from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The variant of the button
   */
  variant?: ButtonVariant;
  /**
   * The size of the button
   */
  size?: ButtonSize;
  /**
   * Button contents
   */
  children: React.ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether the button is in a loading state
   */
  isLoading?: boolean;
  /**
   * Tab index for keyboard navigation (defaults to 0 for accessibility)
   */
  tabIndex?: number;
}

/**
 * Button component for user interactions
 * Primary variant uses the green brand color from the Time is Money extension
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'default',
    isLoading = false,
    disabled,
    tabIndex = 0,
    children,
    ...props
  },
  ref,
) {
  const isDisabled = disabled || isLoading;

  // Map variants to appropriate Tailwind classes
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary',
    secondary:
      'bg-secondary text-secondary-foreground hover:bg-secondary/90 focus-visible:ring-secondary',
    destructive: 'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive',
    outline:
      'border border-input hover:bg-accent hover:text-accent-foreground focus-visible:ring-primary',
    ghost: 'hover:bg-accent hover:text-accent-foreground focus-visible:ring-accent',
    link: 'text-primary underline-offset-4 hover:underline focus-visible:ring-primary',
  };

  // Map sizes to appropriate Tailwind classes
  const sizeClasses = {
    default: 'h-10 px-4 py-2 text-sm',
    sm: 'h-9 rounded-md px-3 text-xs',
    lg: 'h-11 rounded-md px-8 text-base',
    icon: 'h-10 w-10 p-0',
  };

  // Loading indicator
  const LoadingSpinner = (): React.ReactElement => (
    <svg
      className="mr-2 h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    // Handle keyboard activation for Enter and Space keys
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!isDisabled && props.onClick) {
        // Convert keyboard event to mouse event for onClick compatibility
        const syntheticMouseEvent = event as unknown as React.MouseEvent<HTMLButtonElement>;
        props.onClick(syntheticMouseEvent);
      }
    }

    // Call any existing onKeyDown handler
    if (props.onKeyDown) {
      props.onKeyDown(event);
    }
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium ring-offset-background transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      ref={ref}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      tabIndex={isDisabled ? -1 : tabIndex}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {isLoading && <LoadingSpinner />}
      {children}
    </button>
  );
});
