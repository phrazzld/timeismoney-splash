# Test Style Guide

This document establishes standardized patterns for test files across the project to ensure consistency, maintainability, and clarity.

## File Organization and Location

### Location Strategy

Tests should be organized based on their type and scope:

#### 1. **Co-located Unit Tests** (Preferred for most cases)

Place test files next to the source file they're testing:

```
components/atoms/Button/
  ├── Button.tsx
  ├── Button.test.tsx          # Unit tests
  ├── Button.stories.tsx       # Storybook stories
  └── index.ts

lib/analytics/
  ├── google-analytics.ts
  ├── google-analytics.test.ts # Unit tests
  └── index.ts
```

**Use for:**

- Component unit tests
- Library function unit tests
- Utility function tests
- Service/hook tests

#### 2. **Centralized Integration Tests**

Place in `__tests__/` directory organized by feature area:

```
__tests__/
  ├── integration/
  │   ├── analytics-flow.test.tsx
  │   ├── performance-monitoring.test.tsx
  │   └── user-journey.test.tsx
  ├── monitoring/
  │   └── error-tracking.test.ts
  └── security/
      └── sanitization.test.ts
```

**Use for:**

- Multi-component integration tests
- Cross-service integration tests
- System-level tests
- Infrastructure tests

#### 3. **E2E Tests**

Keep in dedicated `e2e/` directory:

```
e2e/
  ├── specs/
  │   ├── landing-page.spec.ts
  │   ├── accessibility.spec.ts
  │   └── performance.spec.ts
  ├── page-objects/
  └── utils/
```

**Use for:**

- Full user workflow tests
- Cross-browser tests
- Performance tests
- Accessibility tests

## Naming Conventions

### File Extensions

- **Unit & Integration Tests**: `.test.ts` or `.test.tsx`
- **E2E Tests**: `.spec.ts` (Playwright convention)

### File Naming Patterns

- **Component tests**: `ComponentName.test.tsx`
- **Integration tests**: `feature-area.test.tsx`
- **Service tests**: `service-name.test.ts`
- **E2E tests**: `feature-area.spec.ts`

### Special Test Types

- **Integration tests**: `ComponentName.integration.test.tsx` (when co-located)
- **Performance tests**: Include in filename: `performance-monitoring.test.tsx`

## File Structure Standards

### File Header Pattern

Every test file should start with a descriptive header:

```typescript
/**
 * Tests for [Component/Service/Feature] ([Ticket ID if applicable])
 *
 * [Brief description of what this test file covers]
 */
```

**Examples:**

```typescript
/**
 * Tests for Button component
 *
 * Covers styling variants, interactions, accessibility, and props handling
 */

/**
 * Tests for error tracking service (T018)
 *
 * Tests error capture, sanitization, remote logging, and circuit breaker logic
 */
```

### Import Organization

Organize imports in this order:

```typescript
// 1. React (if applicable)
import React from 'react';

// 2. Testing libraries
import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';

// 3. Component/module under test
import { Button } from './Button';

// 4. Test utilities and types
import type { MockAnalyticsModule } from '@/lib/test-types';

// 5. Other project imports
import { someUtility } from '@/lib/utils';
```

### Test Structure Pattern

Use consistent `describe` block organization:

```typescript
describe('ComponentName', () => {
  // Setup variables
  let mockFn: jest.MockedFunction<typeof someFunction>;

  beforeEach(() => {
    // Common setup
  });

  afterEach(() => {
    // Common cleanup
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      // Test basic rendering
    });

    it('should render with custom props', () => {
      // Test prop variations
    });
  });

  describe('Interactions', () => {
    it('should handle click events', () => {
      // Test user interactions
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid input gracefully', () => {
      // Test error conditions
    });
  });
});
```

## Mock Patterns

### Mock Organization

Place mocks at the top of the file after imports:

```typescript
// Mock external dependencies
jest.mock('@/lib/analytics', () => ({
  analytics: {
    track: jest.fn(),
    identify: jest.fn(),
  },
}));

// Type the mocked modules
const mockAnalytics = analytics as unknown as MockAnalyticsModule;
```

### Mock Naming Convention

- **Mock variables**: Prefix with `mock`: `mockAnalytics`, `mockFunction`
- **Mock functions**: Use `jest.MockedFunction<typeof originalFunction>`
- **Mock objects**: Use interfaces from `@/lib/test-types`

### Setup and Teardown Pattern

```typescript
describe('ComponentName', () => {
  let mockTrack: jest.MockedFunction<typeof analytics.track>;

  beforeEach(() => {
    // Reset mocks
    mockTrack = mockAnalytics.track.mockClear();

    // Setup common test state
  });

  afterEach(() => {
    // Clean up side effects
    jest.clearAllMocks();
  });
});
```

## Test Type Guidelines

### Unit Tests

- **Focus**: Single component/function in isolation
- **Mocks**: Mock all external dependencies
- **Scope**: Props, rendering, basic interactions, edge cases

```typescript
describe('Button', () => {
  it('should render with correct variant classes', () => {
    render(<Button variant="secondary">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-secondary');
  });
});
```

### Integration Tests

- **Focus**: Multiple components/services working together
- **Mocks**: Mock only external services (APIs, browser APIs)
- **Scope**: Feature workflows, data flow, component interaction

```typescript
describe('Analytics Integration', () => {
  it('should track user interactions end-to-end', () => {
    render(
      <AnalyticsProvider>
        <Button onClick={handleClick}>Track Me</Button>
      </AnalyticsProvider>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(mockAnalytics.track).toHaveBeenCalledWith('button_click', {
      buttonId: expect.any(String)
    });
  });
});
```

### E2E Tests

- **Focus**: Full user workflows in real browser
- **Mocks**: None (test against real/staging environment)
- **Scope**: User journeys, cross-browser, performance, accessibility

```typescript
test.describe('Landing Page Flow', () => {
  test('should complete signup flow', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="signup-button"]');
    // ... complete user workflow
  });
});
```

## Testing Best Practices

### Test Naming

- Use descriptive test names that explain the expected behavior
- Start with "should" for clarity: `it('should render error state when loading fails')`
- Be specific about conditions: `it('should disable submit button when form is invalid')`

### Assertions

- Use specific matchers: `toHaveClass()` instead of generic `toMatch()`
- Test user-visible behavior, not implementation details
- Use `screen` queries that match how users interact with the UI

### Test Data

- Use meaningful test data that represents real usage
- Create test utilities for common data structures
- Keep test data close to where it's used

## Migration Strategy

To migrate existing tests to this standard:

1. **Start with new tests** - Use this guide for all new test files
2. **Update tests during maintenance** - Apply standards when modifying existing tests
3. **Gradual migration** - Update high-touch test files first
4. **Documentation updates** - Keep this guide updated as patterns evolve

## Enforcement

This style guide is enforced through:

- **Code reviews** - Check adherence during PR reviews
- **ESLint rules** - Automated checking where possible
- **Documentation** - Reference this guide in PR templates

## Examples

See these exemplary test files that follow this style guide:

- `components/atoms/Button/Button.test.tsx` - Component unit test
- `__tests__/integration/performance-monitoring.test.tsx` - Integration test
- `e2e/specs/accessibility-compliance.spec.ts` - E2E test
