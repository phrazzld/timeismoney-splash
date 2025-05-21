# Spacing Tokens Documentation

This document outlines the spacing tokens used in the Time is Money design system. These spacing tokens provide a consistent set of measurements for padding, margins, gaps, and other spatial relationships in the UI.

## Base System

Our spacing system is built on an **8px base unit** with additional values for fine-tuning. This system provides a consistent rhythm throughout the interface while allowing flexibility for specific design needs.

## Token Structure

Spacing tokens are defined in `design-tokens/spacing.ts` and follow a numeric key pattern representing multiples of the base unit.

### Core Scale

| Token | Value | Description                                    |
| ----- | ----- | ---------------------------------------------- |
| `0`   | 0px   | Zero spacing                                   |
| `px`  | 1px   | Hairline borders and pixel-perfect adjustments |
| `0.5` | 2px   | Tiny spacing (quarter base)                    |
| `1`   | 4px   | Very small spacing (half base)                 |
| `2`   | 8px   | Base unit                                      |
| `3`   | 12px  | 1.5× base                                      |
| `4`   | 16px  | 2× base                                        |
| `5`   | 20px  | 2.5× base                                      |
| `6`   | 24px  | 3× base                                        |
| `8`   | 32px  | 4× base                                        |
| `10`  | 40px  | 5× base                                        |
| `12`  | 48px  | 6× base                                        |
| `14`  | 56px  | 7× base                                        |
| `16`  | 64px  | 8× base                                        |
| `18`  | 72px  | 9× base                                        |
| `20`  | 80px  | 10× base                                       |

### Layout Scale (Larger Values)

| Token | Value | Description |
| ----- | ----- | ----------- |
| `24`  | 96px  | 12× base    |
| `28`  | 112px | 14× base    |
| `32`  | 128px | 16× base    |
| `36`  | 144px | 18× base    |
| `40`  | 160px | 20× base    |
| `48`  | 192px | 24× base    |
| `56`  | 224px | 28× base    |
| `64`  | 256px | 32× base    |
| `72`  | 288px | 36× base    |
| `80`  | 320px | 40× base    |
| `96`  | 384px | 48× base    |

## Semantic Spacing

In addition to the numeric scale, we provide semantic aliases for common spacing values:

| Semantic Token | Value | Usage                  |
| -------------- | ----- | ---------------------- |
| `none`         | 0px   | No spacing             |
| `hairline`     | 1px   | Thin borders           |
| `tiny`         | 2px   | Minimal separation     |
| `xs`           | 4px   | Extra small spacing    |
| `sm`           | 8px   | Small spacing          |
| `md`           | 16px  | Medium spacing         |
| `lg`           | 24px  | Large spacing          |
| `xl`           | 32px  | Extra large spacing    |
| `2xl`          | 48px  | 2× extra large spacing |
| `3xl`          | 64px  | 3× extra large spacing |
| `4xl`          | 96px  | 4× extra large spacing |
| `5xl`          | 128px | 5× extra large spacing |
| `6xl`          | 192px | 6× extra large spacing |
| `7xl`          | 256px | 7× extra large spacing |
| `8xl`          | 384px | 8× extra large spacing |

### Component-Specific Spacing

| Semantic Token   | Value | Usage                              |
| ---------------- | ----- | ---------------------------------- |
| `buttonPadding`  | 12px  | Standard padding for buttons       |
| `inputPadding`   | 8px   | Standard padding for input fields  |
| `cardPadding`    | 16px  | Standard padding for cards         |
| `sectionPadding` | 32px  | Standard padding for page sections |
| `pagePadding`    | 24px  | Standard padding for page edges    |

## Usage in Components

### With Tailwind CSS

Our spacing tokens are integrated with Tailwind CSS, allowing you to use them in your component classes:

```jsx
// Button component example
const Button = ({ children }) => (
  <button className="px-3 py-2">
    {' '}
    {/* Using spacing-3 (12px) */}
    {children}
  </button>
);

// Card component example
const Card = ({ children }) => (
  <div className="p-4 m-2">
    {' '}
    {/* p-4 uses spacing-4 (16px) */}
    {children}
  </div>
);
```

### With CSS Variables

The spacing tokens are also available as CSS custom properties:

```css
.custom-element {
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-8);
}
```

## Best Practices

1. **Consistency**: Use the spacing tokens consistently throughout the application to maintain visual harmony.
2. **Appropriate Scale**: Choose the appropriate scale for the context:
   - Use smaller values (0.5-2) for tight spaces within components
   - Use medium values (3-8) for component padding and gaps
   - Use larger values (10-20) for section spacing
   - Use the layout scale (24+) for major layout divisions
3. **Semantic Usage**: Prefer semantic tokens when the meaning is clear (e.g., `buttonPadding` for buttons)
4. **Avoid Magic Numbers**: Don't use arbitrary pixel values in your styles; always reference the spacing tokens

## Implementation Details

The spacing tokens are defined in `design-tokens/spacing.ts` and follow the `SpacingTokens` interface defined in `design-tokens/types.ts`.

```typescript
// Example implementation
import type { SpacingTokens } from './types';

export const spacingTokens: SpacingTokens = {
  '0': '0px',
  px: '1px',
  '0.5': '2px',
  '1': '4px',
  '2': '8px',
  // ...and so on
};
```
