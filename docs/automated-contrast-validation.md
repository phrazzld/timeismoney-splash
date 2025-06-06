# Automated Color Contrast Validation

This document describes the automated color contrast validation system that prevents WCAG AA violations from reaching CI.

## Overview

The system validates color contrast compliance at multiple levels:

1. **Pre-commit validation** - Runs on every commit
2. **Design token validation** - Runs when design tokens are modified
3. **Full browser validation** - Runs in CI with Playwright

## Quick Start

```bash
# Validate current design tokens
pnpm validate:contrast

# Run full accessibility tests
pnpm test:a11y
```

## Validation Levels

### 1. Pre-commit Validation

**Script**: `scripts/validate-contrast.ts`  
**Trigger**: Every git commit  
**Scope**: Design tokens and critical UI patterns

Validates:

- Primary button text (4.5:1 requirement)
- Secondary button text (4.5:1 requirement)
- Body text on backgrounds (4.5:1 requirement)
- UI component borders (3:1 requirement)
- Known problematic combinations

### 2. Design Token Validation

**Trigger**: Changes to `design-tokens/**/*.ts` or `tailwind.config.ts`  
**Tool**: lint-staged integration

Automatically runs contrast validation when design tokens are modified, preventing violations from being introduced.

### 3. Browser-based Validation

**Script**: `e2e/utils/color-contrast.ts`  
**Trigger**: CI accessibility tests  
**Scope**: Complete rendered application

Performs comprehensive validation of all visible elements in the browser, including:

- Dynamic content
- Hover states
- Focus states
- Complex color combinations

## WCAG AA Requirements

| Element Type  | Contrast Ratio | Examples                     |
| ------------- | -------------- | ---------------------------- |
| Normal Text   | 4.5:1          | Body text, button labels     |
| Large Text    | 3:1            | Headings ≥18pt or ≥14pt bold |
| UI Components | 3:1            | Button borders, form inputs  |

## Configuration

### Design Tokens Structure

```typescript
// design-tokens/colors.ts
export const brandColors = {
  primary: {
    DEFAULT: 'oklch(0.5 0.2 145)', // WCAG AA compliant
    hover: 'oklch(0.45 0.2 145)', // Darker for hover
  },
  neutral: {
    50: 'oklch(0.98 0 0)', // Near white
    900: 'oklch(0.1 0 0)', // Near black
  },
};
```

### lint-staged Integration

```json
{
  "lint-staged": {
    "design-tokens/**/*.ts": ["pnpm validate:contrast"],
    "tailwind.config.ts": ["pnpm validate:contrast"]
  }
}
```

## Common Issues and Fixes

### Issue: Button text contrast too low

**Error**: `Contrast: 3.78:1 (Required: 4.5:1)`

**Solutions**:

1. **Darken background**: Change from `oklch(0.5 0.2 145)` to `oklch(0.4 0.2 145)`
2. **Lighten text**: Use `oklch(1 0 0)` (pure white) instead of `oklch(0.98 0 0)`
3. **Add text shadow**: Use `text-shadow` for additional contrast

### Issue: UI component border too light

**Error**: `UI Component Border contrast: 1.68:1 (Required: 3:1)`

**Solutions**:

1. **Darken border**: Use `oklch(0.4 0 0)` instead of `oklch(0.9 0 0)`
2. **Use primary color**: Apply brand color for better contrast
3. **Increase border width**: Make thin borders more visible

## Testing

### Local Testing

```bash
# Quick validation
pnpm validate:contrast

# Full accessibility suite
pnpm test:a11y

# Interactive testing
pnpm test:e2e:ui
```

### CI Integration

The validation runs automatically in CI as part of the accessibility test suite. Failed validations will:

1. Block the CI build
2. Generate detailed contrast reports
3. Prevent deployment

## Troubleshooting

### Script fails with color parsing errors

**Cause**: Unsupported color format in design tokens

**Fix**: Ensure all colors use supported formats:

- `oklch(L C H)` - Recommended
- `rgb(r, g, b)` - Supported
- `#hexvalue` - Supported

### Pre-commit hook skipping validation

**Cause**: No design token files changed

**Behavior**: Validation only runs when relevant files are modified or on full commit validation.

### Browser tests pass but pre-commit fails

**Cause**: Different color parsing between tools

**Solution**: Check the simplified oklch-to-RGB conversion in the standalone script. For critical validations, rely on browser-based tests.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Developer     │    │   Pre-commit     │    │       CI        │
│   Changes       │───▶│   Validation     │───▶│   Full Tests    │
│   Design Tokens │    │   (Fast Check)   │    │   (Comprehensive)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
                               │
                               ▼
                       ┌──────────────────┐
                       │   Block Commit   │
                       │   if Violations  │
                       └──────────────────┘
```

## Best Practices

1. **Test early**: Run `pnpm validate:contrast` when modifying colors
2. **Use design tokens**: Avoid hardcoded colors in components
3. **Check focus states**: Ensure interactive elements maintain contrast when focused
4. **Test in context**: Use browser tests for complex scenarios
5. **Document decisions**: Add comments explaining color choices for accessibility

## Related Documentation

- [Color Design Tokens](./color-tokens.md)
- [Accessibility Testing](./accessibility-testing.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
