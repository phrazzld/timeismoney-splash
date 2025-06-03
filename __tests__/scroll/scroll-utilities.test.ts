/**
 * @jest-environment jsdom
 */

import {
  scrollToElement,
  scrollToSection,
  getScrollPosition,
  isElementInView,
} from '../../lib/scroll';
import type { ScrollToOptions, ScrollPosition } from '../../lib/scroll/types';

// Mock requestAnimationFrame and Element.scrollIntoView
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}

global.IntersectionObserver = MockIntersectionObserver as any;

// Mock Element.scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

describe('Scroll Utilities', () => {
  let mockElement: HTMLElement;
  let mockSection: HTMLElement;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup DOM
    document.body.innerHTML = '';
    
    // Create mock elements
    mockElement = document.createElement('div');
    mockElement.id = 'test-element';
    document.body.appendChild(mockElement);
    
    mockSection = document.createElement('section');
    mockSection.id = 'test-section';
    mockSection.setAttribute('role', 'region');
    mockSection.setAttribute('aria-label', 'Test Section');
    document.body.appendChild(mockSection);
    
    // Mock getBoundingClientRect
    mockElement.getBoundingClientRect = jest.fn(() => ({
      top: 100,
      left: 0,
      right: 200,
      bottom: 200,
      width: 200,
      height: 100,
      x: 0,
      y: 100,
    }));
    
    // Mock window scroll properties
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    Object.defineProperty(window, 'scrollX', { value: 0, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 600, writable: true });
    Object.defineProperty(window, 'innerWidth', { value: 800, writable: true });
  });

  describe('scrollToElement', () => {
    test('scrolls to element by string selector', async () => {
      await scrollToElement('#test-element');
      
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    });

    test('scrolls to element by HTMLElement reference', async () => {
      await scrollToElement(mockElement);
      
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    });

    test('applies custom scroll options', async () => {
      const options: ScrollToOptions = {
        behavior: 'instant',
        block: 'center',
        inline: 'center',
      };
      
      await scrollToElement(mockElement, options);
      
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'instant',
        block: 'center',
        inline: 'center',
      });
    });

    test('throws error for non-existent element selector', async () => {
      await expect(scrollToElement('#non-existent')).rejects.toThrow(
        'Element with selector "#non-existent" not found'
      );
    });

    test('throws error for null element reference', async () => {
      await expect(scrollToElement(null as any)).rejects.toThrow(
        'Invalid element: element cannot be null or undefined'
      );
    });

    test('handles scrollIntoView not supported gracefully', async () => {
      const elementWithoutScroll = { scrollIntoView: undefined } as any;
      
      await expect(scrollToElement(elementWithoutScroll)).rejects.toThrow(
        'scrollIntoView is not supported on this element'
      );
    });
  });

  describe('scrollToSection', () => {
    test('scrolls to section by ID', async () => {
      await scrollToSection('test-section');
      
      expect(mockSection.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    });

    test('applies custom options to section scroll', async () => {
      const options: ScrollToOptions = {
        behavior: 'instant',
        block: 'center',
      };
      
      await scrollToSection('test-section', options);
      
      expect(mockSection.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'instant',
        block: 'center',
        inline: 'nearest',
      });
    });

    test('throws error for non-existent section', async () => {
      await expect(scrollToSection('non-existent-section')).rejects.toThrow(
        'Section with ID "non-existent-section" not found'
      );
    });

    test('automatically adds focus to section after scroll', async () => {
      const focusSpy = jest.spyOn(mockSection, 'focus');
      mockSection.tabIndex = -1; // Make it focusable
      
      await scrollToSection('test-section');
      
      // Wait for focus to be applied after scroll
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe('getScrollPosition', () => {
    test('returns current scroll position', () => {
      // Mock current scroll position
      (window as any).scrollY = 150;
      (window as any).scrollX = 25;
      
      // Mock document height for percentage calculation
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 1000,
        writable: true,
      });
      
      const position: ScrollPosition = getScrollPosition();
      
      expect(position).toEqual({
        x: 25,
        y: 150,
        percentage: 15, // 150 / 1000 = 0.15 = 15%
      });
    });

    test('handles edge case when scroll height equals viewport height', () => {
      (window as any).scrollY = 0;
      (window as any).scrollX = 0;
      
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 600, // Same as window.innerHeight
        writable: true,
      });
      
      const position: ScrollPosition = getScrollPosition();
      
      expect(position.percentage).toBe(0);
    });

    test('handles maximum scroll position', () => {
      (window as any).scrollY = 400; // 1000 - 600 = 400 max scroll
      
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 1000,
        writable: true,
      });
      
      const position: ScrollPosition = getScrollPosition();
      
      expect(position.percentage).toBe(100);
    });
  });

  describe('isElementInView', () => {
    let mockIntersectionObserver: MockIntersectionObserver;
    let observerCallback: IntersectionObserverCallback;

    beforeEach(() => {
      mockIntersectionObserver = new MockIntersectionObserver();
      
      // Mock IntersectionObserver constructor
      (global.IntersectionObserver as any) = jest.fn((callback) => {
        observerCallback = callback;
        return mockIntersectionObserver;
      });
    });

    test('detects element in view with default threshold', () => {
      let isInView: boolean | undefined;
      
      // Start observing
      isElementInView(mockElement, 0.1).then((result) => {
        isInView = result;
      });
      
      // Simulate intersection observer callback
      observerCallback([{
        target: mockElement,
        isIntersecting: true,
        intersectionRatio: 0.5,
      }] as IntersectionObserverEntry[], mockIntersectionObserver as any);
      
      return new Promise(resolve => setTimeout(resolve, 0)).then(() => {
        expect(isInView).toBe(true);
        expect(mockIntersectionObserver.observe).toHaveBeenCalledWith(mockElement);
      });
    });

    test('detects element not in view', () => {
      let isInView: boolean | undefined;
      
      isElementInView(mockElement, 0.5).then((result) => {
        isInView = result;
      });
      
      // Simulate element not intersecting enough
      observerCallback([{
        target: mockElement,
        isIntersecting: false,
        intersectionRatio: 0.2,
      }] as IntersectionObserverEntry[], mockIntersectionObserver as any);
      
      return new Promise(resolve => setTimeout(resolve, 0)).then(() => {
        expect(isInView).toBe(false);
      });
    });

    test('uses custom threshold correctly', () => {
      const customThreshold = 0.8;
      
      isElementInView(mockElement, customThreshold);
      
      expect(global.IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        { threshold: customThreshold }
      );
    });

    test('cleans up observer after detection', () => {
      isElementInView(mockElement, 0.1);
      
      // Simulate intersection
      observerCallback([{
        target: mockElement,
        isIntersecting: true,
        intersectionRatio: 0.5,
      }] as IntersectionObserverEntry[], mockIntersectionObserver as any);
      
      return new Promise(resolve => setTimeout(resolve, 0)).then(() => {
        expect(mockIntersectionObserver.disconnect).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles missing IntersectionObserver gracefully', () => {
      const originalIntersectionObserver = global.IntersectionObserver;
      (global as any).IntersectionObserver = undefined;
      
      expect(() => isElementInView(mockElement)).not.toThrow();
      
      // Restore
      global.IntersectionObserver = originalIntersectionObserver;
    });

    test('handles elements without getBoundingClientRect', async () => {
      const elementWithoutRect = { getBoundingClientRect: undefined } as any;
      
      await expect(scrollToElement(elementWithoutRect)).rejects.toThrow();
    });
  });

  describe('Cross-browser Compatibility', () => {
    test('falls back to manual scroll when smooth behavior not supported', async () => {
      // Mock scrollIntoView not supporting smooth behavior
      mockElement.scrollIntoView = jest.fn(() => {
        throw new Error('Smooth behavior not supported');
      });
      
      // Mock manual scroll fallback
      const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation();
      
      await scrollToElement(mockElement);
      
      expect(scrollToSpy).toHaveBeenCalled();
    });
  });
});