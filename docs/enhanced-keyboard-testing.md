# Enhanced Keyboard Accessibility Testing

This document describes the comprehensive keyboard accessibility testing system that goes beyond basic compliance to ensure excellent keyboard user experiences.

## Overview

The enhanced keyboard testing system provides detailed validation of:

1. **Component-specific keyboard behaviors** (Enter, Space, Arrow keys)
2. **ARIA compliance and semantic correctness**
3. **Advanced keyboard patterns** (roving tabindex, skip links, modals)
4. **Navigation performance and efficiency**
5. **Cross-component integration**

## Test Architecture

### Core Testing Utilities

**`e2e/utils/enhanced-keyboard-testing.ts`**

- `testEnhancedKeyboardAccessibility()` - Main testing function
- Component-specific behavior validation
- ARIA compliance checking
- Keyboard shortcut validation
- Focus indicator testing

**`e2e/specs/accessibility-compliance.spec.ts`**

- Integration with existing accessibility tests
- Basic enhanced keyboard validation

**`e2e/specs/keyboard-navigation-comprehensive.spec.ts`**

- Comprehensive component-specific testing
- Advanced keyboard patterns
- Performance testing
- Cross-component integration

## Test Categories

### 1. Component-Specific Behaviors

Tests that each interactive component responds correctly to keyboard input:

```typescript
// Button components
test('button components handle Enter and Space keys correctly', async ({ page }) => {
  const result = await testEnhancedKeyboardAccessibility(page);

  const buttonTests = result.componentTests.filter((test) => test.component.startsWith('Button'));

  for (const buttonTest of buttonTests) {
    expect(buttonTest.tests.enterKey).toBe(true);
    expect(buttonTest.tests.spaceKey).toBe(true);
    expect(buttonTest.tests.focusIndicator).toBe(true);
  }
});
```

**Validates:**

- Enter key activation for buttons
- Space key activation for buttons
- Focus indicator visibility
- Tab accessibility
- Component-specific requirements

### 2. ARIA Compliance Testing

Ensures all interactive elements have proper ARIA attributes:

```typescript
test('all interactive elements have proper ARIA attributes', async ({ page }) => {
  const result = await testEnhancedKeyboardAccessibility(page, {
    testAriaCompliance: true,
  });

  const ariaFailures = result.ariaCompliance.filter((test) => !test.passes);
  expect(ariaFailures).toHaveLength(0);
});
```

**Validates:**

- Accessible names (aria-label, aria-labelledby, or text content)
- Valid href attributes for links
- Proper button states (aria-pressed, aria-expanded)
- Required ARIA attributes for component types

### 3. Advanced Keyboard Patterns

Tests complex keyboard interaction patterns:

**Skip Links:**

```typescript
test('skip links provide efficient navigation', async ({ page }) => {
  const skipLinks = await page.locator('a[href^="#"]').all();

  for (const skipLink of skipLinks) {
    await skipLink.focus();
    await skipLink.press('Enter');

    // Verify focus moved to target
    const activeElementId = await page.evaluate(() => document.activeElement?.id);
    expect(activeElementId).toBeTruthy();
  }
});
```

**Roving Tabindex:**

```typescript
test('roving tab index patterns work correctly', async ({ page }) => {
  const componentGroups = await page.locator('[role="toolbar"], [role="menubar"]').all();

  for (const group of componentGroups) {
    // Test that only one child has tabindex="0" initially
    // Test arrow key navigation within group
  }
});
```

**Modal Keyboard Handling:**

```typescript
test('modal and popup keyboard handling', async ({ page }) => {
  const modals = await page.locator('[role="dialog"], [aria-modal="true"]').all();

  for (const modal of modals) {
    // Test focus trapping
    // Test Escape key dismissal
  }
});
```

### 4. Navigation Performance

Ensures keyboard navigation is performant:

```typescript
test('tab navigation is efficient', async ({ page }) => {
  const startTime = Date.now();

  // Navigate through all focusable elements
  const focusableCount = await page.locator('a[href], button:not([disabled])').count();

  for (let i = 0; i < focusableCount && i < 20; i++) {
    await page.keyboard.press('Tab');
  }

  const duration = Date.now() - startTime;
  expect(duration).toBeLessThan(5000);
  expect(focusableCount).toBeLessThan(50);
});
```

**Validates:**

- Tab navigation speed
- Reasonable number of focusable elements
- Focus indicator rendering performance

### 5. Cross-Component Integration

Tests navigation between different component types:

```typescript
test('keyboard navigation between different component types', async ({ page }) => {
  const ctaButton = await landingPage.getHeroCTA();
  await ctaButton.focus();

  // Test forward navigation
  await page.keyboard.press('Tab');
  let activeElement = await page.evaluate(() => document.activeElement?.tagName);
  expect(activeElement).toBeTruthy();

  // Test backward navigation
  await page.keyboard.press('Shift+Tab');
  activeElement = await page.evaluate(() => document.activeElement?.id);
  expect(activeElement).toBe('hero-cta-button');
});
```

## Configuration Options

The enhanced testing system accepts configuration options:

```typescript
interface EnhancedKeyboardTestOptions {
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
```

### Usage Examples

**Basic Enhanced Testing:**

```bash
# Run enhanced keyboard tests
pnpm test:e2e --grep "Enhanced Keyboard Accessibility"
```

**Comprehensive Testing:**

```bash
# Run all keyboard accessibility tests
pnpm test:e2e --grep "@accessibility"
```

**Component-Specific Testing:**

```bash
# Run comprehensive keyboard navigation tests
pnpm test:e2e keyboard-navigation-comprehensive.spec.ts
```

## Test Results Structure

### Component Test Results

```typescript
interface ComponentKeyboardTestResult {
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
```

### ARIA Compliance Results

```typescript
interface AriaComplianceResult {
  readonly element: string;
  readonly selector: string;
  readonly requiredAttributes: string[];
  readonly missingAttributes: string[];
  readonly incorrectAttributes: { attribute: string; expected: string; actual: string }[];
  readonly passes: boolean;
}
```

### Keyboard Shortcut Results

```typescript
interface KeyboardShortcutResult {
  readonly shortcut: string;
  readonly expectedBehavior: string;
  readonly actualBehavior: string;
  readonly passes: boolean;
}
```

## Best Practices

### 1. Component Development

**Buttons:**

```tsx
// ✅ Good: Proper keyboard support
<button
  type="button"
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  aria-label="Clear descriptive action"
  className="focus-visible:ring-2 focus-visible:ring-offset-2"
>
  Action Text
</button>

// ❌ Bad: Missing keyboard support
<div onClick={handleClick}>Click me</div>
```

**Links:**

```tsx
// ✅ Good: Proper link with external indicator
<a
  href="https://example.com"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Visit example site (opens in new tab)"
>
  External Link
</a>

// ❌ Bad: Empty href or missing external indicator
<a href="#" onClick={handleClick}>Link</a>
```

### 2. Focus Management

**Visible Focus Indicators:**

```css
/* ✅ Good: Clear focus indicators */
.button:focus-visible {
  outline: 2px solid var(--focus-color);
  outline-offset: 2px;
}

/* ❌ Bad: No focus indicator */
.button:focus {
  outline: none;
}
```

**Focus Trapping (for modals):**

```typescript
// ✅ Good: Proper focus management
const Modal = ({ isOpen, onClose }) => {
  const firstFocusableRef = useRef<HTMLElement>(null);
  const lastFocusableRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isOpen) {
      firstFocusableRef.current?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }

    if (e.key === 'Tab') {
      // Handle focus trapping
    }
  };

  return (
    <div role="dialog" aria-modal="true" onKeyDown={handleKeyDown}>
      <button ref={firstFocusableRef}>First</button>
      {/* Content */}
      <button ref={lastFocusableRef} onClick={onClose}>Close</button>
    </div>
  );
};
```

### 3. ARIA Usage

**Accessible Names:**

```tsx
// ✅ Good: Clear accessible names
<button aria-label="Add item to cart">+</button>
<button>Add to Cart</button>
<button aria-labelledby="cart-label">Add</button>

// ❌ Bad: No accessible name
<button>+</button>
<button aria-label="">Action</button>
```

**State Communication:**

```tsx
// ✅ Good: Proper state communication
<button
  aria-pressed={isPressed}
  aria-expanded={isExpanded}
>
  Toggle Button
</button>

// ❌ Bad: Missing state information
<button className={isPressed ? 'pressed' : ''}>
  Toggle Button
</button>
```

## Integration with CI

The enhanced keyboard tests are integrated into the accessibility test suite:

```yaml
# .github/workflows/accessibility.yml
- name: Run Enhanced Keyboard Tests
  run: |
    pnpm test:e2e --grep "@accessibility"
    pnpm test:e2e keyboard-navigation-comprehensive.spec.ts
```

### Failure Handling

Tests provide detailed failure information:

```
Enhanced keyboard accessibility tests failed:
  - Button[hero-cta-button]: Enter key does not activate button
  - Link[external-link]: Missing accessible name

Component Test Results:
  Button[hero-cta-button]: enterKey, spaceKey No visible focus indicator
  Link[nav-link]: ✓

ARIA Compliance failures:
  Button[submit]: Missing accessible name (aria-label, aria-labelledby, or text content)
```

## Troubleshooting

### Common Issues

**Focus indicators not visible:**

```css
/* Fix: Add proper focus styling */
.component:focus-visible {
  outline: 2px solid var(--focus-color);
  outline-offset: 2px;
}
```

**Button not responding to keyboard:**

```tsx
// Fix: Add proper keyboard event handling
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleClick();
  }
};
```

**Missing accessible names:**

```tsx
// Fix: Add aria-label or ensure text content
<button aria-label="Clear descriptive action">Icon Button</button>
```

### Debugging Tips

1. **Use browser dev tools** to inspect focus states
2. **Test with keyboard only** - unplug your mouse
3. **Use screen reader** to verify accessible names
4. **Check console** for focus-related warnings

## Related Documentation

- [Basic Keyboard Navigation Testing](./keyboard-navigation.md)
- [ARIA Implementation Guide](./aria-guide.md)
- [Focus Management Patterns](./focus-management.md)
- [Accessibility Testing Standards](./accessibility-testing.md)
