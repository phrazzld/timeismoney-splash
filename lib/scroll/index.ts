/**
 * Core scroll utilities for smooth scrolling and navigation
 */

import type { ScrollToOptions, ScrollTarget, ScrollPosition } from './types';
import { 
  isSmoothScrollSupported, 
  isIntersectionObserverSupported,
  smoothScrollPolyfill,
  calculateScrollPosition 
} from './utils';

/**
 * Default scroll options
 */
const DEFAULT_SCROLL_OPTIONS: Required<ScrollToOptions> = {
  behavior: 'smooth',
  block: 'start',
  inline: 'nearest',
};

/**
 * Scrolls to a specific element with cross-browser compatibility
 * 
 * @param target - Element selector string or HTMLElement reference
 * @param options - Scroll behavior options
 * @returns Promise that resolves when scroll is complete
 */
export async function scrollToElement(
  target: string | HTMLElement, 
  options: ScrollToOptions = {}
): Promise<void> {
  // Validate input
  if (target === null || target === undefined) {
    throw new Error('Invalid element: element cannot be null or undefined');
  }

  // Get element reference
  let element: HTMLElement;
  
  if (typeof target === 'string') {
    const found = document.querySelector(target) as HTMLElement;
    if (!found) {
      throw new Error(`Element with selector "${target}" not found`);
    }
    element = found;
  } else {
    element = target;
  }

  // Validate element has required methods
  if (!element.scrollIntoView) {
    throw new Error('scrollIntoView is not supported on this element');
  }

  if (!element.getBoundingClientRect) {
    throw new Error('getBoundingClientRect is not supported on this element');
  }

  // Merge options with defaults
  const scrollOptions = { ...DEFAULT_SCROLL_OPTIONS, ...options };

  try {
    // Try modern scrollIntoView with smooth behavior
    if (isSmoothScrollSupported() && scrollOptions.behavior === 'smooth') {
      element.scrollIntoView({
        behavior: scrollOptions.behavior,
        block: scrollOptions.block,
        inline: scrollOptions.inline,
      });
      
      // Return promise that resolves when smooth scroll likely completes
      return new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      // Fallback to polyfill for smooth scroll
      if (scrollOptions.behavior === 'smooth') {
        const targetY = calculateScrollPosition(element, scrollOptions.block);
        await smoothScrollPolyfill(element, targetY);
      } else {
        // Instant scroll
        element.scrollIntoView({
          behavior: 'auto',
          block: scrollOptions.block,
          inline: scrollOptions.inline,
        });
      }
    }
  } catch (error) {
    // Fallback to window.scrollTo
    const targetY = calculateScrollPosition(element, scrollOptions.block);
    window.scrollTo(0, targetY);
    throw new Error(`Smooth behavior not supported: ${error}`);
  }
}

/**
 * Scrolls to a specific section and manages focus for accessibility
 * 
 * @param sectionId - ID of the section to scroll to
 * @param options - Scroll behavior options
 * @returns Promise that resolves when scroll and focus are complete
 */
export async function scrollToSection(
  sectionId: string, 
  options: ScrollToOptions = {}
): Promise<void> {
  const element = document.getElementById(sectionId);
  
  if (!element) {
    throw new Error(`Section with ID "${sectionId}" not found`);
  }

  // Scroll to element
  await scrollToElement(element, options);

  // Set focus for accessibility
  try {
    // Make element focusable if it isn't already
    if (!element.hasAttribute('tabIndex')) {
      element.setAttribute('tabIndex', '-1');
    }
    
    // Focus the element after a brief delay to ensure scroll completes
    setTimeout(() => {
      element.focus();
    }, 100);
  } catch (error) {
    // Focus failed, but scroll succeeded - continue silently
    console.warn(`Failed to focus section ${sectionId}:`, error);
  }
}

/**
 * Gets the current scroll position with percentage calculation
 * 
 * @returns Current scroll position data
 */
export function getScrollPosition(): ScrollPosition {
  const x = window.scrollX || 0;
  const y = window.scrollY || 0;
  
  // Calculate scroll percentage
  const documentHeight = document.documentElement.scrollHeight;
  const windowHeight = window.innerHeight;
  const maxScroll = Math.max(0, documentHeight - windowHeight);
  
  let percentage = 0;
  if (maxScroll > 0) {
    percentage = Math.min(100, Math.max(0, (y / maxScroll) * 100));
  }

  return {
    x,
    y,
    percentage: Math.round(percentage),
  };
}

/**
 * Checks if an element is currently in the viewport
 * 
 * @param element - Element to check
 * @param threshold - Intersection threshold (0-1, default 0.1)
 * @returns Promise that resolves with visibility status
 */
export function isElementInView(
  element: HTMLElement, 
  threshold: number = 0.1
): Promise<boolean> {
  return new Promise((resolve) => {
    // Fallback for browsers without IntersectionObserver
    if (!isIntersectionObserverSupported()) {
      // Simple fallback using getBoundingClientRect
      try {
        const rect = element.getBoundingClientRect();
        const isVisible = (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= window.innerHeight &&
          rect.right <= window.innerWidth
        );
        resolve(isVisible);
      } catch {
        resolve(false);
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const isIntersecting = entry.isIntersecting && entry.intersectionRatio >= threshold;
        observer.disconnect();
        resolve(isIntersecting);
      },
      { threshold }
    );

    observer.observe(element);
  });
}

// Re-export types for convenience
export type { ScrollToOptions, ScrollTarget, ScrollPosition } from './types';