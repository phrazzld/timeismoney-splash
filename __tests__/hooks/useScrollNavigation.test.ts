/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useScrollNavigation } from '../../lib/hooks/useScrollNavigation';
import * as scrollUtils from '../../lib/scroll';

// Mock scroll utilities
jest.mock('../../lib/scroll', () => ({
  scrollToSection: jest.fn(() => Promise.resolve()),
  getScrollPosition: jest.fn(() => ({ x: 0, y: 0, percentage: 0 })),
  isElementInView: jest.fn(() => Promise.resolve(true)),
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();

  constructor(private _callback: IntersectionObserverCallback) {}

  trigger(entries: Partial<IntersectionObserverEntry>[]): void {
    this._callback(entries as IntersectionObserverEntry[], this as unknown);
  }
}

global.IntersectionObserver = MockIntersectionObserver as unknown;

describe('useScrollNavigation', () => {
  let mockElements: HTMLElement[];
  let mockObserver: MockIntersectionObserver;

  const defaultSections = [
    { id: 'hero', label: 'Hero' },
    { id: 'features', label: 'Features' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'cta', label: 'Call to Action' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup DOM
    document.body.innerHTML = '';
    mockElements = [];

    // Create mock sections
    defaultSections.forEach((section) => {
      const element = document.createElement('section');
      element.id = section.id;
      element.setAttribute('role', 'region');
      element.setAttribute('aria-label', section.label);
      document.body.appendChild(element);
      mockElements.push(element);
    });

    // Mock IntersectionObserver
    (global.IntersectionObserver as unknown) = jest.fn((callback) => {
      mockObserver = new MockIntersectionObserver(callback);
      return mockObserver;
    });
  });

  describe('Initialization', () => {
    test('initializes with correct default state', () => {
      const { result } = renderHook(() => useScrollNavigation({ sections: defaultSections }));

      expect(result.current.activeSection).toBeNull();
      expect(result.current.sections).toHaveLength(4);
      expect(result.current.isScrolling).toBe(false);
      expect(result.current.scrollProgress).toBe(0);
    });

    test('finds and maps sections correctly', () => {
      const { result } = renderHook(() => useScrollNavigation({ sections: defaultSections }));

      const sections = result.current.sections;

      expect(sections[0]).toEqual({
        id: 'hero',
        label: 'Hero',
        element: mockElements[0],
      });

      expect(sections[1]).toEqual({
        id: 'features',
        label: 'Features',
        element: mockElements[1],
      });
    });

    test('handles missing sections gracefully', () => {
      const sectionsWithMissing = [
        { id: 'hero', label: 'Hero' },
        { id: 'non-existent', label: 'Missing' },
        { id: 'features', label: 'Features' },
      ];

      const { result } = renderHook(() => useScrollNavigation({ sections: sectionsWithMissing }));

      // Should only include existing sections
      expect(result.current.sections).toHaveLength(2);
      expect(result.current.sections.map((s) => s.id)).toEqual(['hero', 'features']);
    });
  });

  describe('Section Detection', () => {
    test('detects active section when element is in view', () => {
      const { result } = renderHook(() => useScrollNavigation({ sections: defaultSections }));

      act(() => {
        // Simulate hero section coming into view
        mockObserver.trigger([
          {
            target: mockElements[0], // hero
            isIntersecting: true,
            intersectionRatio: 0.8,
          },
        ]);
      });

      expect(result.current.activeSection).toBe('hero');
    });

    test('updates active section when different section comes into view', () => {
      const { result } = renderHook(() => useScrollNavigation({ sections: defaultSections }));

      // First, hero section is active
      act(() => {
        mockObserver.trigger([
          {
            target: mockElements[0], // hero
            isIntersecting: true,
            intersectionRatio: 0.8,
          },
        ]);
      });

      expect(result.current.activeSection).toBe('hero');

      // Then features section becomes active
      act(() => {
        mockObserver.trigger([
          {
            target: mockElements[0], // hero
            isIntersecting: false,
            intersectionRatio: 0.1,
          },
          {
            target: mockElements[1], // features
            isIntersecting: true,
            intersectionRatio: 0.9,
          },
        ]);
      });

      expect(result.current.activeSection).toBe('features');
    });

    test('chooses section with highest intersection ratio when multiple in view', () => {
      const { result } = renderHook(() => useScrollNavigation({ sections: defaultSections }));

      act(() => {
        mockObserver.trigger([
          {
            target: mockElements[0], // hero
            isIntersecting: true,
            intersectionRatio: 0.3,
          },
          {
            target: mockElements[1], // features
            isIntersecting: true,
            intersectionRatio: 0.7, // Higher ratio
          },
        ]);
      });

      expect(result.current.activeSection).toBe('features');
    });

    test('respects custom threshold', () => {
      const customThreshold = 0.8;

      renderHook(() =>
        useScrollNavigation({
          sections: defaultSections,
          threshold: customThreshold,
        }),
      );

      expect(global.IntersectionObserver).toHaveBeenCalledWith(expect.any(Function), {
        threshold: customThreshold,
      });
    });
  });

  describe('scrollToSection Function', () => {
    test('calls scroll utility with correct section', async () => {
      const mockScrollToSection = scrollUtils.scrollToSection as jest.Mock;

      const { result } = renderHook(() => useScrollNavigation({ sections: defaultSections }));

      await act(async () => {
        await result.current.scrollToSection('features');
      });

      expect(mockScrollToSection).toHaveBeenCalledWith('features', undefined);
    });

    test('handles invalid section ID gracefully', async () => {
      const { result } = renderHook(() => useScrollNavigation({ sections: defaultSections }));

      await act(async () => {
        await expect(result.current.scrollToSection('invalid')).rejects.toThrow();
      });
    });

    test('sets isScrolling state during scroll operation', async () => {
      const mockScrollToSection = scrollUtils.scrollToSection as jest.Mock;
      mockScrollToSection.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      const { result } = renderHook(() => useScrollNavigation({ sections: defaultSections }));

      let scrollingPromise: Promise<void>;

      act(() => {
        scrollingPromise = result.current.scrollToSection('features');
      });

      // Should be scrolling immediately
      expect(result.current.isScrolling).toBe(true);

      // Wait for scroll to complete
      await act(async () => {
        await scrollingPromise!;
      });

      // Should not be scrolling anymore
      expect(result.current.isScrolling).toBe(false);
    });
  });

  describe('Focus Management', () => {
    test('applies focus to section when focusOnScroll is enabled', async () => {
      const focusSpy = jest.spyOn(mockElements[1], 'focus');
      mockElements[1].tabIndex = -1; // Make focusable

      const { result } = renderHook(() =>
        useScrollNavigation({
          sections: defaultSections,
          focusOnScroll: true,
        }),
      );

      await act(async () => {
        await result.current.scrollToSection('features');
      });

      expect(focusSpy).toHaveBeenCalled();
    });

    test('does not focus when focusOnScroll is disabled', async () => {
      const focusSpy = jest.spyOn(mockElements[1], 'focus');

      const { result } = renderHook(() =>
        useScrollNavigation({
          sections: defaultSections,
          focusOnScroll: false,
        }),
      );

      await act(async () => {
        await result.current.scrollToSection('features');
      });

      expect(focusSpy).not.toHaveBeenCalled();
    });
  });

  describe('Scroll Progress Tracking', () => {
    test('updates scroll progress based on position', () => {
      const mockGetScrollPosition = scrollUtils.getScrollPosition as jest.Mock;
      mockGetScrollPosition.mockReturnValue({ x: 0, y: 300, percentage: 50 });

      const { result } = renderHook(() => useScrollNavigation({ sections: defaultSections }));

      // Trigger scroll event
      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.scrollProgress).toBe(50);
    });
  });

  describe('Performance Optimizations', () => {
    test('debounces scroll events with default timing', () => {
      jest.useFakeTimers();

      const mockGetScrollPosition = scrollUtils.getScrollPosition as jest.Mock;
      let callCount = 0;
      mockGetScrollPosition.mockImplementation(() => {
        callCount++;
        return { x: 0, y: 0, percentage: 0 };
      });

      renderHook(() => useScrollNavigation({ sections: defaultSections }));

      // Fire multiple scroll events rapidly
      act(() => {
        window.dispatchEvent(new Event('scroll'));
        window.dispatchEvent(new Event('scroll'));
        window.dispatchEvent(new Event('scroll'));
      });

      // Should not have called getScrollPosition yet
      expect(callCount).toBe(0);

      // Fast-forward past debounce delay
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should have called only once due to debouncing
      expect(callCount).toBe(1);

      jest.useRealTimers();
    });

    test('uses custom debounce timing when provided', () => {
      jest.useFakeTimers();

      const mockGetScrollPosition = scrollUtils.getScrollPosition as jest.Mock;
      let callCount = 0;
      mockGetScrollPosition.mockImplementation(() => {
        callCount++;
        return { x: 0, y: 0, percentage: 0 };
      });

      renderHook(() =>
        useScrollNavigation({
          sections: defaultSections,
          debounceMs: 500,
        }),
      );

      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });

      // Fast-forward to just before custom debounce time
      act(() => {
        jest.advanceTimersByTime(400);
      });
      expect(callCount).toBe(0);

      // Fast-forward past custom debounce time
      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(callCount).toBe(1);

      jest.useRealTimers();
    });
  });

  describe('Cleanup', () => {
    test('disconnects intersection observer on unmount', () => {
      const { unmount } = renderHook(() => useScrollNavigation({ sections: defaultSections }));

      unmount();

      expect(mockObserver.disconnect).toHaveBeenCalled();
    });

    test('removes scroll event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useScrollNavigation({ sections: defaultSections }));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), {
        passive: true,
      });
    });
  });

  describe('Error Handling', () => {
    test('handles missing IntersectionObserver gracefully', () => {
      const originalIntersectionObserver = global.IntersectionObserver;
      (global as unknown).IntersectionObserver = undefined;

      expect(() => {
        renderHook(() => useScrollNavigation({ sections: defaultSections }));
      }).not.toThrow();

      // Restore
      global.IntersectionObserver = originalIntersectionObserver;
    });

    test('handles sections without corresponding DOM elements', () => {
      const sectionsWithMissing = [
        { id: 'hero', label: 'Hero' },
        { id: 'missing-section', label: 'Missing' },
      ];

      const { result } = renderHook(() => useScrollNavigation({ sections: sectionsWithMissing }));

      // Should only find existing sections
      expect(result.current.sections).toHaveLength(1);
      expect(result.current.sections[0].id).toBe('hero');
    });
  });
});
