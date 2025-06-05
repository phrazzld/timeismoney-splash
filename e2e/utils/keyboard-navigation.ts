import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Options for keyboard navigation testing
 */
export interface KeyboardNavigationOptions {
  /** Whether to test skip links functionality */
  readonly skipLinks?: boolean;
  /** Whether to test Escape key handling */
  readonly testEscapeKey?: boolean;
  /** Whether to test arrow key navigation */
  readonly testArrowKeys?: boolean;
  /** Maximum number of tab stops to test (prevents infinite loops) */
  readonly maxTabStops?: number;
}

/**
 * Result of keyboard navigation testing
 */
export interface KeyboardNavigationResult {
  /** Total number of focusable elements found */
  readonly totalFocusableElements: number;
  /** Order of elements as they receive focus */
  readonly focusOrder: string[];
  /** Elements that couldn't be reached by keyboard */
  readonly unreachableElements: string[];
  /** Whether any keyboard traps were detected */
  readonly hasKeyboardTraps: boolean;
  /** Details of any issues found */
  readonly issues: string[];
}

/**
 * Information about a focusable element
 */
export interface FocusableElement {
  /** CSS selector for the element */
  readonly selector: string;
  /** Role of the element */
  readonly role: string | null;
  /** Visible text content */
  readonly text: string;
  /** Whether element has visible focus indicator */
  readonly hasFocusIndicator: boolean;
  /** Tab index value */
  readonly tabIndex: number;
}

/**
 * Tests comprehensive keyboard navigation on a page
 *
 * @param page - Playwright page instance
 * @param options - Configuration options for testing
 * @returns Detailed results of keyboard navigation testing
 */
export async function testKeyboardNavigation(
  page: Page,
  options: KeyboardNavigationOptions = {},
): Promise<KeyboardNavigationResult> {
  const maxTabStops = options.maxTabStops || 100;
  const focusOrder: string[] = [];
  const issues: string[] = [];

  // Get all potentially focusable elements
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    'audio[controls]',
    'video[controls]',
    '[contenteditable="true"]',
  ].join(', ');

  const allFocusableElements = await page.locator(focusableSelectors).all();
  const totalFocusableElements = allFocusableElements.length;

  // Start from the body
  await page.locator('body').focus();

  // Tab through all elements
  let previousActiveElement = '';
  let tabCount = 0;
  const visitedElements = new Set<string>();

  while (tabCount < maxTabStops) {
    await page.keyboard.press('Tab');
    tabCount++;

    // Get current focused element
    const activeElement = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;

      const text = (el as HTMLElement).innerText?.substring(0, 50) || '';
      const baseSelector = el.id
        ? `#${el.id}`
        : `${el.tagName.toLowerCase()}.${el.className.split(' ')[0]}`;

      return {
        tagName: el.tagName.toLowerCase(),
        id: el.id,
        className: el.className,
        text,
        selector: text ? `${baseSelector}:has-text("${text}")` : baseSelector,
      };
    });

    if (!activeElement) {
      break;
    }

    const elementKey = `${activeElement.tagName}#${activeElement.id}.${activeElement.className}`;

    // Check for keyboard trap
    if (visitedElements.has(elementKey) && visitedElements.size < totalFocusableElements) {
      issues.push(`Potential keyboard trap detected at ${activeElement.selector}`);
      break;
    }

    visitedElements.add(elementKey);
    focusOrder.push(activeElement.selector);

    // Check if we've cycled back to the beginning
    if (elementKey === previousActiveElement) {
      break;
    }

    previousActiveElement = elementKey;
  }

  // Identify unreachable elements
  const unreachableElements: string[] = [];
  for (const element of allFocusableElements) {
    const elementSelector = await element.evaluate((el) => {
      const text = (el as HTMLElement).innerText?.substring(0, 50) || '';
      const baseSelector = el.id
        ? `#${el.id}`
        : `${el.tagName.toLowerCase()}.${el.className.split(' ')[0]}`;
      return text ? `${baseSelector}:has-text("${text}")` : baseSelector;
    });

    if (!focusOrder.includes(elementSelector)) {
      unreachableElements.push(elementSelector);
    }
  }

  // Test skip links if requested
  if (options.skipLinks) {
    const skipLinkIssues = await testSkipLinks(page);
    issues.push(...skipLinkIssues);
  }

  // Test escape key if requested
  if (options.testEscapeKey) {
    const escapeKeyIssues = await testEscapeKeyHandling(page);
    issues.push(...escapeKeyIssues);
  }

  return {
    totalFocusableElements,
    focusOrder,
    unreachableElements,
    hasKeyboardTraps: issues.some((issue) => issue.includes('keyboard trap')),
    issues,
  };
}

/**
 * Asserts that no keyboard traps exist on the page
 *
 * @param page - Playwright page instance
 * @throws Error if keyboard traps are detected
 */
export async function assertNoKeyboardTraps(page: Page): Promise<void> {
  const result = await testKeyboardNavigation(page, { maxTabStops: 50 });

  expect(result.hasKeyboardTraps, 'Page should not contain keyboard traps').toBe(false);

  if (result.issues.length > 0) {
    throw new Error(`Keyboard navigation issues found:\n${result.issues.join('\n')}`);
  }
}

/**
 * Asserts that focus order matches expected order
 *
 * @param page - Playwright page instance
 * @param expectedOrder - Array of selectors in expected focus order
 * @throws Error if focus order doesn't match
 */
export async function assertFocusOrder(page: Page, expectedOrder: string[]): Promise<void> {
  await page.locator('body').focus();

  for (const expectedSelector of expectedOrder) {
    await page.keyboard.press('Tab');

    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      return el.id ? `#${el.id}` : el.tagName.toLowerCase();
    });

    expect(focusedElement, `Expected ${expectedSelector} to be focused`).toBe(expectedSelector);
  }
}

/**
 * Asserts that an element has a visible focus indicator
 *
 * @param page - Playwright page instance
 * @param element - Element to check
 * @throws Error if focus indicator is not visible
 */
export async function assertFocusIndicatorVisible(page: Page, element: Locator): Promise<void> {
  await element.focus();

  const hasVisibleFocusIndicator = await element.evaluate((el) => {
    const styles = window.getComputedStyle(el);
    const focusStyles = window.getComputedStyle(el, ':focus');

    // Check for common focus indicator styles
    const hasOutline = styles.outlineWidth !== '0px' && styles.outlineStyle !== 'none';
    const hasBoxShadow = styles.boxShadow !== 'none';
    const hasBorder = styles.borderWidth !== '0px' && styles.borderStyle !== 'none';
    const hasBackgroundChange = styles.backgroundColor !== focusStyles.backgroundColor;

    return hasOutline || hasBoxShadow || hasBorder || hasBackgroundChange;
  });

  expect(hasVisibleFocusIndicator, 'Element should have visible focus indicator').toBe(true);
}

/**
 * Tests skip link functionality
 *
 * @param page - Playwright page instance
 * @returns Array of issues found
 */
async function testSkipLinks(page: Page): Promise<string[]> {
  const issues: string[] = [];

  // Look for skip links (usually hidden until focused)
  const skipLinks = await page.locator('a[href^="#"]:has-text("skip")').all();

  for (const skipLink of skipLinks) {
    const href = await skipLink.getAttribute('href');
    if (!href) continue;

    const targetId = href.substring(1);
    const target = page.locator(`#${targetId}`);

    if (!(await target.count())) {
      issues.push(`Skip link target #${targetId} not found`);
      continue;
    }

    // Test that skip link works
    await skipLink.focus();
    await skipLink.press('Enter');

    // Verify focus moved to target
    const activeElementId = await page.evaluate(() => document.activeElement?.id);
    if (activeElementId !== targetId) {
      issues.push(`Skip link to #${targetId} did not move focus correctly`);
    }
  }

  return issues;
}

/**
 * Tests escape key handling for dismissible elements
 *
 * @param page - Playwright page instance
 * @returns Array of issues found
 */
async function testEscapeKeyHandling(page: Page): Promise<string[]> {
  const issues: string[] = [];

  // Find potentially dismissible elements (modals, popups, etc.)
  const dismissibleSelectors = [
    '[role="dialog"]',
    '[role="alertdialog"]',
    '[aria-modal="true"]',
    '.modal',
    '.popup',
    '.dropdown[aria-expanded="true"]',
  ];

  for (const selector of dismissibleSelectors) {
    const elements = await page.locator(selector).all();

    for (const element of elements) {
      if (await element.isVisible()) {
        // Test escape key
        await page.keyboard.press('Escape');

        // Check if element is still visible
        if (await element.isVisible()) {
          issues.push(`Dismissible element ${selector} did not close on Escape key`);
        }
      }
    }
  }

  return issues;
}

/**
 * Gets all focusable elements on the page with their properties
 *
 * @param page - Playwright page instance
 * @returns Array of focusable element information
 */
export async function getAllFocusableElements(page: Page): Promise<FocusableElement[]> {
  const focusableElements = await page.evaluate(() => {
    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      'audio[controls]',
      'video[controls]',
      '[contenteditable="true"]',
    ];

    const elements: FocusableElement[] = [];

    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        const htmlEl = el as HTMLElement;

        elements.push({
          selector: el.id ? `#${el.id}` : `${el.tagName.toLowerCase()}.${el.className}`,
          role: el.getAttribute('role'),
          text: htmlEl.innerText?.substring(0, 50) || '',
          hasFocusIndicator: false, // Will be tested separately
          tabIndex: htmlEl.tabIndex,
        });
      });
    });

    return elements;
  });

  return focusableElements;
}

/**
 * Tests that all interactive elements are reachable by keyboard
 *
 * @param page - Playwright page instance
 * @throws Error if any interactive elements are not keyboard accessible
 */
export async function assertAllInteractiveElementsAccessible(page: Page): Promise<void> {
  const result = await testKeyboardNavigation(page);

  if (result.unreachableElements.length > 0) {
    throw new Error(
      `The following elements are not keyboard accessible:\n${result.unreachableElements.join('\n')}`,
    );
  }

  expect(result.unreachableElements).toHaveLength(0);
}
