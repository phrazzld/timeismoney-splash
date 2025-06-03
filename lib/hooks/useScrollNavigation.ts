/**
 * React hook for managing scroll-based navigation state
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { scrollToSection, getScrollPosition } from '../scroll';
import type { ScrollTarget } from '../scroll/types';
import { debounce, isIntersectionObserverSupported } from '../scroll/utils';

/**
 * Configuration options for the scroll navigation hook
 */
export interface UseScrollNavigationOptions {
  /**
   * Section configurations with IDs and labels
   */
  readonly sections: ReadonlyArray<{ readonly id: string; readonly label: string }>;
  
  /**
   * Intersection threshold for section detection (0-1)
   * @default 0.5
   */
  readonly threshold?: number;
  
  /**
   * Debounce delay for scroll events in milliseconds
   * @default 300
   */
  readonly debounceMs?: number;
  
  /**
   * Whether to automatically focus sections when scrolling to them
   * @default true
   */
  readonly focusOnScroll?: boolean;
}

/**
 * Return type for the scroll navigation hook
 */
export interface UseScrollNavigationReturn {
  /**
   * Currently active section ID
   */
  readonly activeSection: string | null;
  
  /**
   * Array of available sections with their elements
   */
  readonly sections: ReadonlyArray<ScrollTarget>;
  
  /**
   * Function to scroll to a specific section
   */
  readonly scrollToSection: (sectionId: string) => Promise<void>;
  
  /**
   * Whether a scroll operation is currently in progress
   */
  readonly isScrolling: boolean;
  
  /**
   * Current scroll progress as percentage (0-100)
   */
  readonly scrollProgress: number;
}

/**
 * Custom hook for managing scroll-based navigation
 * 
 * @param options - Configuration options
 * @returns Navigation state and control functions
 */
export function useScrollNavigation(options: UseScrollNavigationOptions): UseScrollNavigationReturn {
  const {
    sections: sectionConfigs,
    threshold = 0.5,
    debounceMs = 300,
    focusOnScroll = true,
  } = options;

  // State
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Refs
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionsMapRef = useRef<Map<HTMLElement, string>>(new Map());

  // Memoized sections array with DOM elements
  const sections = useMemo(() => {
    const result: ScrollTarget[] = [];
    
    sectionConfigs.forEach(config => {
      const element = document.getElementById(config.id);
      if (element) {
        result.push({
          id: config.id,
          label: config.label,
          element,
        });
      }
    });
    
    return result;
  }, [sectionConfigs]);

  // Update sections map when sections change
  useEffect(() => {
    const newMap = new Map<HTMLElement, string>();
    sections.forEach(section => {
      newMap.set(section.element, section.id);
    });
    sectionsMapRef.current = newMap;
  }, [sections]);

  // Debounced scroll handler
  const handleScroll = useMemo(
    () =>
      debounce(() => {
        const position = getScrollPosition();
        setScrollProgress(position.percentage);
      }, debounceMs),
    [debounceMs]
  );

  // Intersection observer callback
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    let bestEntry: IntersectionObserverEntry | null = null;
    let highestRatio = 0;

    // Find the section with the highest intersection ratio
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > highestRatio) {
        highestRatio = entry.intersectionRatio;
        bestEntry = entry;
      }
    });

    // Update active section
    if (bestEntry) {
      const sectionId = sectionsMapRef.current.get(bestEntry.target as HTMLElement);
      if (sectionId) {
        setActiveSection(sectionId);
      }
    } else {
      // No sections intersecting above threshold
      const anyIntersecting = entries.some(entry => entry.isIntersecting);
      if (!anyIntersecting) {
        setActiveSection(null);
      }
    }
  }, []);

  // Set up intersection observer
  useEffect(() => {
    if (!isIntersectionObserverSupported() || sections.length === 0) {
      return;
    }

    // Clean up existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold,
    });

    // Observe all sections
    sections.forEach(section => {
      observerRef.current?.observe(section.element);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [sections, threshold, handleIntersection]);

  // Set up scroll listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial scroll position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll, { passive: true } as any);
    };
  }, [handleScroll]);

  // Scroll to section function
  const scrollToSectionHandler = useCallback(
    async (sectionId: string): Promise<void> => {
      // Check if section exists
      const section = sections.find(s => s.id === sectionId);
      if (!section) {
        throw new Error(`Section with ID "${sectionId}" not found`);
      }

      try {
        setIsScrolling(true);
        
        // Perform scroll
        await scrollToSection(sectionId);
        
        // Handle focus if enabled
        if (focusOnScroll) {
          // Focus is handled by scrollToSection function
        }
      } catch (error) {
        console.error(`Failed to scroll to section ${sectionId}:`, error);
        throw error;
      } finally {
        setIsScrolling(false);
      }
    },
    [sections, focusOnScroll]
  );

  return {
    activeSection,
    sections,
    scrollToSection: scrollToSectionHandler,
    isScrolling,
    scrollProgress,
  };
}