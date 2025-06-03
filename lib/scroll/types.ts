/**
 * TypeScript interfaces for scroll utilities
 */

/**
 * Options for scroll behavior configuration
 */
export interface ScrollToOptions {
  /**
   * Scroll behavior - smooth for animated scrolling, instant for immediate
   */
  readonly behavior?: 'smooth' | 'instant';
  
  /**
   * Vertical alignment of the element
   */
  readonly block?: 'start' | 'center' | 'end';
  
  /**
   * Horizontal alignment of the element
   */
  readonly inline?: 'start' | 'center' | 'end' | 'nearest';
}

/**
 * Represents a scroll target with metadata
 */
export interface ScrollTarget {
  /**
   * Unique identifier for the target
   */
  readonly id: string;
  
  /**
   * DOM element reference
   */
  readonly element: HTMLElement;
  
  /**
   * Human-readable label for accessibility
   */
  readonly label: string;
}

/**
 * Current scroll position information
 */
export interface ScrollPosition {
  /**
   * Horizontal scroll position in pixels
   */
  readonly x: number;
  
  /**
   * Vertical scroll position in pixels
   */
  readonly y: number;
  
  /**
   * Scroll progress as percentage (0-100)
   */
  readonly percentage: number;
}