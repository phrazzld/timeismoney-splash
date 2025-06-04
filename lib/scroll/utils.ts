/**
 * Browser compatibility and utility functions for scroll operations
 */

/**
 * Checks if smooth scroll behavior is supported
 */
export function isSmoothScrollSupported(): boolean {
  try {
    return 'scrollBehavior' in document.documentElement.style;
  } catch {
    return false;
  }
}

/**
 * Checks if IntersectionObserver is supported
 */
export function isIntersectionObserverSupported(): boolean {
  return typeof window !== 'undefined' && 'IntersectionObserver' in window;
}

/**
 * Polyfill for smooth scroll behavior using requestAnimationFrame
 */
export function smoothScrollPolyfill(
  element: HTMLElement,
  targetY: number,
  duration: number = 500,
): Promise<void> {
  return new Promise((resolve) => {
    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    function animation(currentTime: number): void {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      window.scrollTo(0, startY + distance * easeOut);

      if (progress < 1) {
        requestAnimationFrame(animation);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(animation);
  });
}

/**
 * Gets the Y position of an element relative to the document
 */
export function getElementTopPosition(element: HTMLElement): number {
  const rect = element.getBoundingClientRect();
  return rect.top + window.scrollY;
}

/**
 * Calculates the optimal scroll position for an element
 */
export function calculateScrollPosition(
  element: HTMLElement,
  block: 'start' | 'center' | 'end' = 'start',
): number {
  const elementTop = getElementTopPosition(element);
  const elementHeight = element.offsetHeight;
  const windowHeight = window.innerHeight;

  switch (block) {
    case 'center':
      return elementTop - windowHeight / 2 + elementHeight / 2;
    case 'end':
      return elementTop - windowHeight + elementHeight;
    case 'start':
    default:
      return elementTop;
  }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function for scroll event handling
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
