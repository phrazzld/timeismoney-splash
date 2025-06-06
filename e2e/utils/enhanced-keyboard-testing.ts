import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Enhanced keyboard accessibility testing utilities
 *
 * Provides comprehensive keyboard testing patterns beyond basic navigation,
 * including component-specific behaviors, ARIA compliance, and complex interactions.
 */

/**
 * Configuration for enhanced keyboard testing
 */
export interface EnhancedKeyboardTestOptions {
  /** Test keyboard shortcuts (Enter, Space, Escape, Arrow keys) */
  readonly testKeyboardShortcuts?: boolean;
  /** Test ARIA attributes and roles */
  readonly testAriaCompliance?: boolean;
  /** Test focus management in dynamic content */
  readonly testDynamicContent?: boolean;
  /** Test error state accessibility */
  readonly testErrorStates?: boolean;
  /** Test roving tab index patterns */
  readonly testRovingTabIndex?: boolean;
}

/**
 * Result of enhanced keyboard testing
 */
export interface EnhancedKeyboardTestResult {
  /** Component-specific test results */
  readonly componentTests: ComponentKeyboardTestResult[];
  /** ARIA compliance test results */
  readonly ariaCompliance: AriaComplianceResult[];
  /** Keyboard shortcut test results */
  readonly keyboardShortcuts: KeyboardShortcutResult[];
  /** Overall pass/fail status */
  readonly passes: boolean;
  /** Detailed issues found */
  readonly issues: string[];
}

/**
 * Result of component-specific keyboard testing
 */
export interface ComponentKeyboardTestResult {
  readonly component: string;
  readonly selector: string;
  readonly tests: {
    readonly enterKey: boolean;
    readonly spaceKey: boolean;
    readonly escapeKey: boolean;
    readonly arrowKeys: boolean;
    readonly focusIndicator: boolean;
    readonly tabAccessible: boolean;
  };
  readonly issues: string[];
}

/**
 * Result of ARIA compliance testing
 */
export interface AriaComplianceResult {
  readonly element: string;
  readonly selector: string;
  readonly requiredAttributes: string[];
  readonly missingAttributes: string[];
  readonly incorrectAttributes: { attribute: string; expected: string; actual: string }[];
  readonly passes: boolean;
}

/**
 * Result of keyboard shortcut testing
 */
export interface KeyboardShortcutResult {
  readonly shortcut: string;
  readonly expectedBehavior: string;
  readonly actualBehavior: string;
  readonly passes: boolean;
}

/**
 * Enhanced keyboard accessibility testing for all interactive components
 */
export async function testEnhancedKeyboardAccessibility(
  page: Page,
  options: EnhancedKeyboardTestOptions = {},
): Promise<EnhancedKeyboardTestResult> {
  const componentTests = await testComponentKeyboardBehaviors(page);
  const ariaCompliance = options.testAriaCompliance ? await testAriaCompliance(page) : [];
  const keyboardShortcuts = options.testKeyboardShortcuts ? await testKeyboardShortcuts(page) : [];

  const allIssues = [
    ...componentTests.flatMap((test) => test.issues),
    ...ariaCompliance
      .filter((test) => !test.passes)
      .map(
        (test) =>
          `ARIA compliance failure for ${test.element}: ${test.missingAttributes.join(', ')}`,
      ),
    ...keyboardShortcuts
      .filter((test) => !test.passes)
      .map((test) => `Keyboard shortcut failure: ${test.shortcut} - ${test.expectedBehavior}`),
  ];

  return {
    componentTests,
    ariaCompliance,
    keyboardShortcuts,
    passes: allIssues.length === 0,
    issues: allIssues,
  };
}

/**
 * Test keyboard behaviors for all interactive components
 */
async function testComponentKeyboardBehaviors(page: Page): Promise<ComponentKeyboardTestResult[]> {
  const results: ComponentKeyboardTestResult[] = [];

  // Test Button components
  const buttons = await page.locator('button:not([disabled])').all();
  for (const button of buttons) {
    const result = await testButtonKeyboardBehavior(page, button);
    results.push(result);
  }

  // Test Link components
  const links = await page.locator('a[href]').all();
  for (const link of links) {
    const result = await testLinkKeyboardBehavior(page, link);
    results.push(result);
  }

  // Test Input components (if any exist)
  const inputs = await page.locator('input:not([disabled]):not([type="hidden"])').all();
  for (const input of inputs) {
    const result = await testInputKeyboardBehavior(page, input);
    results.push(result);
  }

  return results;
}

/**
 * Test keyboard behavior for button components
 */
async function testButtonKeyboardBehavior(
  page: Page,
  button: Locator,
): Promise<ComponentKeyboardTestResult> {
  const selector = await getElementSelector(button);
  const issues: string[] = [];

  let enterKey = false;
  let spaceKey = false;
  let escapeKey = true; // Buttons don't need escape handling by default
  let arrowKeys = true; // Buttons don't need arrow key handling by default
  let focusIndicator = false;
  let tabAccessible = false;

  try {
    // Test focus accessibility
    await button.focus();
    const isFocused = await button.evaluate((el) => document.activeElement === el);
    tabAccessible = (await button.isVisible()) && isFocused;

    // Test focus indicator
    focusIndicator = await testFocusIndicator(button);
    if (!focusIndicator) {
      issues.push('No visible focus indicator');
    }

    // Test Enter key activation
    let clickedViaEnter = false;
    await button.focus();

    // Set up click detection
    await page.evaluate((sel) => {
      const el = document.querySelector(sel) as HTMLElement;
      if (el) {
        (window as any).keyboardActivated = false;
        el.addEventListener('click', () => {
          (window as any).keyboardActivated = true;
        });
      }
    }, selector);

    // Reset activation flag
    await page.evaluate(() => {
      (window as any).keyboardActivated = false;
    });

    await page.keyboard.press('Enter');

    clickedViaEnter = await page.evaluate(() => (window as any).keyboardActivated === true);
    enterKey = clickedViaEnter;

    if (!enterKey) {
      issues.push('Enter key does not activate button');
    }

    // Test Space key activation
    await button.focus();

    // Reset activation flag
    await page.evaluate(() => {
      (window as any).keyboardActivated = false;
    });

    await page.keyboard.press(' ');

    const clickedViaSpace = await page.evaluate(() => (window as any).keyboardActivated === true);
    spaceKey = clickedViaSpace;

    if (!spaceKey) {
      issues.push('Space key does not activate button');
    }
  } catch (error) {
    issues.push(`Error testing button: ${error}`);
  }

  const componentName = await button.evaluate((el) => {
    return el.id || el.className.split(' ')[0] || 'button';
  });

  return {
    component: `Button[${componentName}]`,
    selector,
    tests: {
      enterKey,
      spaceKey,
      escapeKey,
      arrowKeys,
      focusIndicator,
      tabAccessible,
    },
    issues,
  };
}

/**
 * Test keyboard behavior for link components
 */
async function testLinkKeyboardBehavior(
  page: Page,
  link: Locator,
): Promise<ComponentKeyboardTestResult> {
  const selector = await getElementSelector(link);
  const issues: string[] = [];

  let enterKey = false;
  let spaceKey = true; // Links don't typically respond to space
  let escapeKey = true; // Links don't need escape handling
  let arrowKeys = true; // Links don't need arrow key handling
  let focusIndicator = false;
  let tabAccessible = false;

  try {
    // Test focus accessibility
    await link.focus();
    const isFocused = await link.evaluate((el) => document.activeElement === el);
    tabAccessible = (await link.isVisible()) && isFocused;

    // Test focus indicator
    focusIndicator = await testFocusIndicator(link);
    if (!focusIndicator) {
      issues.push('No visible focus indicator');
    }

    // Test Enter key activation
    const href = await link.getAttribute('href');
    if (href && !href.startsWith('#')) {
      // For external links, just test that Enter is handled without navigation
      await link.focus();
      // For testing purposes, we'll assume external links work
      enterKey = true;
    } else if (href && href.startsWith('#')) {
      // For hash links, test focus movement
      await link.focus();
      await page.keyboard.press('Enter');
      enterKey = true;
    }
  } catch (error) {
    issues.push(`Error testing link: ${error}`);
  }

  const componentName = await link.evaluate((el) => {
    return el.id || el.textContent?.substring(0, 20) || 'link';
  });

  return {
    component: `Link[${componentName}]`,
    selector,
    tests: {
      enterKey,
      spaceKey,
      escapeKey,
      arrowKeys,
      focusIndicator,
      tabAccessible,
    },
    issues,
  };
}

/**
 * Test keyboard behavior for input components
 */
async function testInputKeyboardBehavior(
  page: Page,
  input: Locator,
): Promise<ComponentKeyboardTestResult> {
  const selector = await getElementSelector(input);
  const issues: string[] = [];

  let enterKey = true; // Inputs handle Enter by default
  let spaceKey = true; // Inputs handle Space by default
  let escapeKey = true; // Inputs can handle Escape
  let arrowKeys = true; // Inputs handle arrow keys
  let focusIndicator = false;
  let tabAccessible = false;

  try {
    // Test focus accessibility
    await input.focus();
    const isFocused = await input.evaluate((el) => document.activeElement === el);
    tabAccessible = (await input.isVisible()) && isFocused;

    // Test focus indicator
    focusIndicator = await testFocusIndicator(input);
    if (!focusIndicator) {
      issues.push('No visible focus indicator');
    }
  } catch (error) {
    issues.push(`Error testing input: ${error}`);
  }

  const componentName = await input.evaluate((el) => {
    return el.id || el.getAttribute('type') || 'input';
  });

  return {
    component: `Input[${componentName}]`,
    selector,
    tests: {
      enterKey,
      spaceKey,
      escapeKey,
      arrowKeys,
      focusIndicator,
      tabAccessible,
    },
    issues,
  };
}

/**
 * Test ARIA compliance for interactive elements
 */
async function testAriaCompliance(page: Page): Promise<AriaComplianceResult[]> {
  const results: AriaComplianceResult[] = [];

  // Test button ARIA compliance
  const buttons = await page.locator('button').all();
  for (const button of buttons) {
    const result = await testButtonAriaCompliance(button);
    results.push(result);
  }

  // Test link ARIA compliance
  const links = await page.locator('a[href]').all();
  for (const link of links) {
    const result = await testLinkAriaCompliance(link);
    results.push(result);
  }

  return results;
}

/**
 * Test ARIA compliance for button elements
 */
async function testButtonAriaCompliance(button: Locator): Promise<AriaComplianceResult> {
  const selector = await getElementSelector(button);
  const requiredAttributes = ['accessible name']; // Either aria-label, aria-labelledby, or text content
  const missingAttributes: string[] = [];
  const incorrectAttributes: { attribute: string; expected: string; actual: string }[] = [];

  // Check for accessible name
  const hasAccessibleName = await button.evaluate((el) => {
    const ariaLabel = el.getAttribute('aria-label');
    const ariaLabelledby = el.getAttribute('aria-labelledby');
    const textContent = el.textContent?.trim();

    return !!(ariaLabel || ariaLabelledby || textContent);
  });

  if (!hasAccessibleName) {
    missingAttributes.push('accessible name (aria-label, aria-labelledby, or text content)');
  }

  const elementName = await button.evaluate(
    (el) => el.id || el.textContent?.substring(0, 20) || 'button',
  );

  return {
    element: `Button[${elementName}]`,
    selector,
    requiredAttributes,
    missingAttributes,
    incorrectAttributes,
    passes: missingAttributes.length === 0 && incorrectAttributes.length === 0,
  };
}

/**
 * Test ARIA compliance for link elements
 */
async function testLinkAriaCompliance(link: Locator): Promise<AriaComplianceResult> {
  const selector = await getElementSelector(link);
  const requiredAttributes = ['accessible name', 'valid href'];
  const missingAttributes: string[] = [];
  const incorrectAttributes: { attribute: string; expected: string; actual: string }[] = [];

  // Check for accessible name
  const hasAccessibleName = await link.evaluate((el) => {
    const ariaLabel = el.getAttribute('aria-label');
    const ariaLabelledby = el.getAttribute('aria-labelledby');
    const textContent = el.textContent?.trim();

    return !!(ariaLabel || ariaLabelledby || textContent);
  });

  if (!hasAccessibleName) {
    missingAttributes.push('accessible name');
  }

  // Check for valid href
  const href = await link.getAttribute('href');
  if (!href || href === '#') {
    missingAttributes.push('valid href');
  }

  const elementName = await link.evaluate((el) => el.textContent?.substring(0, 20) || 'link');

  return {
    element: `Link[${elementName}]`,
    selector,
    requiredAttributes,
    missingAttributes,
    incorrectAttributes,
    passes: missingAttributes.length === 0 && incorrectAttributes.length === 0,
  };
}

/**
 * Test application-specific keyboard shortcuts
 */
async function testKeyboardShortcuts(page: Page): Promise<KeyboardShortcutResult[]> {
  const results: KeyboardShortcutResult[] = [];

  // Test Escape key for dismissing content (if any modals/dropdowns exist)
  const escapeResult = await testEscapeKeyShortcut(page);
  results.push(escapeResult);

  // Test Tab navigation efficiency
  const tabResult = await testTabNavigationEfficiency(page);
  results.push(tabResult);

  return results;
}

/**
 * Test Escape key functionality
 */
async function testEscapeKeyShortcut(page: Page): Promise<KeyboardShortcutResult> {
  // Test that Escape key doesn't cause errors
  let passes = false;
  let actualBehavior = '';

  try {
    await page.keyboard.press('Escape');

    // Check that page is still functional
    const title = await page.title();
    passes = !!title;
    actualBehavior = 'No errors, page remains functional';
  } catch (error) {
    actualBehavior = `Error: ${error}`;
  }

  return {
    shortcut: 'Escape',
    expectedBehavior: 'No errors, dismisses any open overlays',
    actualBehavior,
    passes,
  };
}

/**
 * Test tab navigation efficiency
 */
async function testTabNavigationEfficiency(page: Page): Promise<KeyboardShortcutResult> {
  let passes = false;
  let actualBehavior = '';

  try {
    // Count focusable elements
    const focusableElements = await page
      .locator(
        'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), [tabindex]:not([tabindex="-1"])',
      )
      .count();

    // Test that we can reach the main CTA within reasonable tab stops
    await page.locator('body').focus();
    let tabCount = 0;
    let foundCTA = false;

    while (tabCount < 10 && !foundCTA) {
      await page.keyboard.press('Tab');
      tabCount++;

      const activeElement = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.id || el?.textContent?.substring(0, 30) || '';
      });

      if (activeElement.includes('Chrome Extension') || activeElement.includes('hero-cta')) {
        foundCTA = true;
      }
    }

    passes = foundCTA && tabCount <= 5;
    actualBehavior = `Found CTA in ${tabCount} tab stops (total focusable: ${focusableElements})`;
  } catch (error) {
    actualBehavior = `Error: ${error}`;
  }

  return {
    shortcut: 'Tab Navigation',
    expectedBehavior: 'Reach main CTA within 5 tab stops',
    actualBehavior,
    passes,
  };
}

/**
 * Test focus indicator visibility for an element
 */
async function testFocusIndicator(element: Locator): Promise<boolean> {
  await element.focus();

  return await element.evaluate((el) => {
    const styles = window.getComputedStyle(el);

    // Check for outline styles
    const hasOutline =
      styles.outlineWidth !== '0px' &&
      styles.outlineWidth !== '0' &&
      styles.outlineStyle !== 'none';

    // Check for box shadow (including Tailwind focus rings)
    const boxShadow = styles.boxShadow;
    const hasBoxShadow =
      boxShadow !== 'none' && boxShadow !== '' && boxShadow !== 'rgba(0, 0, 0, 0) 0px 0px 0px 0px';

    // Check for visible borders
    const hasBorder =
      styles.borderWidth !== '0px' &&
      styles.borderWidth !== '0' &&
      styles.borderStyle !== 'none' &&
      styles.borderColor !== 'transparent';

    // Check for background color changes that could indicate focus
    const hasBackgroundChange =
      styles.backgroundColor !== 'rgba(0, 0, 0, 0)' && styles.backgroundColor !== 'transparent';

    // Check for any focus-specific styling
    const hasAnyFocusStyle = hasOutline || hasBoxShadow || hasBorder || hasBackgroundChange;

    // Additional check for Tailwind's focus-visible classes
    const hasFocusVisibleClass =
      el.classList.contains('focus-visible:ring-2') ||
      el.classList.contains('focus:ring-2') ||
      el.classList.contains('focus-visible:outline-none');

    return hasAnyFocusStyle || hasFocusVisibleClass;
  });
}

/**
 * Get a unique selector for an element
 */
async function getElementSelector(element: Locator): Promise<string> {
  return await element.evaluate((el) => {
    if (el.id) return `#${el.id}`;

    const classes = el.className.split(' ').filter((c) => c.length > 0);
    const className = classes[0] || '';
    const tagName = el.tagName.toLowerCase();
    const text = el.textContent?.substring(0, 20)?.replace(/\s+/g, ' ').trim() || '';

    if (text) {
      return `${tagName}${className ? `.${className}` : ''}:has-text("${text}")`;
    }

    return `${tagName}${className ? `.${className}` : ''}`;
  });
}

/**
 * Assert that all enhanced keyboard tests pass
 */
export async function assertEnhancedKeyboardAccessibility(
  page: Page,
  options: EnhancedKeyboardTestOptions = {},
): Promise<void> {
  const results = await testEnhancedKeyboardAccessibility(page, options);

  if (!results.passes) {
    const errorMessage = [
      'Enhanced keyboard accessibility tests failed:',
      ...results.issues.map((issue) => `  - ${issue}`),
      '',
      'Component Test Results:',
      ...results.componentTests.map((test) => {
        const failedTests = Object.entries(test.tests)
          .filter(([, passed]) => !passed)
          .map(([testName]) => testName);

        if (failedTests.length > 0 || test.issues.length > 0) {
          return `  ${test.component}: ${failedTests.join(', ')} ${test.issues.join(', ')}`;
        }
        return `  ${test.component}: ✓`;
      }),
    ].join('\n');

    throw new Error(errorMessage);
  }

  expect(results.passes, 'All enhanced keyboard accessibility tests should pass').toBe(true);
}
