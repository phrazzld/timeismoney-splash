# Icon Component Documentation

## Overview

The Icon component provides a unified way to display and style Lucide icons throughout the Time is Money application. It wraps the `lucide-react` library, providing a consistent interface and additional features for accessibility and styling.

## Features

- Dynamic rendering of any Lucide icon
- TypeScript support with type-safe icon names
- Consistent default styling
- Customizable size, color, and stroke width
- Accessibility built-in
- Integration with the application's design tokens

## Installation

The Icon component is built into the application and depends on the following packages:

- `lucide-react`: Icon library
- `clsx` and `tailwind-merge`: For class name composition via the `cn` utility

## Usage

### Basic Usage

```tsx
import { Icon } from '@/components/atoms';

// Basic usage with default size (24px)
<Icon name="Clock" />

// With custom size
<Icon name="DollarSign" size={32} />

// With custom color (using CSS variable)
<Icon name="Coins" color="var(--primary)" />

// With custom stroke width
<Icon name="Wallet" strokeWidth={1.5} />

// With additional className using Tailwind
<Icon name="PiggyBank" className="text-accent hover:text-accent-dark" />
```

### Core Icons

The Time is Money application uses the following core icons:

#### Time-Related Icons

- `Clock`: Primary time indicator
- `Timer`: For timed activities
- `Hourglass`: For loading states and brand imagery

#### Money-Related Icons

- `DollarSign`: Primary currency indicator
- `Coins`: For physical money representations
- `Wallet`: For personal finances
- `PiggyBank`: For savings-related features

#### Additional Utility Icons

- `TrendingUp`: For positive financial growth
- `BarChart`: For financial reports/statistics
- `LineChart`: For trend visualization
- `Settings`: For user configuration

For a complete list of available icons, refer to the [Lucide React documentation](https://lucide.dev/icons/).

## Props

| Prop          | Type                 | Default        | Description                                                 |
| ------------- | -------------------- | -------------- | ----------------------------------------------------------- |
| `name`        | `IconName`           | (required)     | Name of the icon from lucide-react                          |
| `size`        | `number` or `string` | `24`           | Size of the icon in pixels                                  |
| `color`       | `string`             | `currentColor` | Color of the icon (hex, RGB, CSS variable)                  |
| `strokeWidth` | `number`             | `2`            | Stroke width of the icon                                    |
| `className`   | `string`             | -              | Additional CSS classes                                      |
| `...props`    | `LucideProps`        | -              | Any other props supported by lucide-react (excluding 'ref') |

## Accessibility

The Icon component automatically sets `aria-hidden="true"` for all icons, making them invisible to screen readers. This follows the best practice for decorative icons.

If an icon conveys meaning:

```tsx
// For interactive icons
<button aria-label="Settings">
  <Icon name="Settings" />
</button>

// For informational icons
<div className="flex items-center">
  <Icon name="Clock" />
  <span className="ml-2">Time remaining: 2 hours</span>
</div>
```

## Customization with Design Tokens

The Icon component works seamlessly with the application's design tokens:

```tsx
// Using color tokens
<Icon name="DollarSign" color="var(--primary)" />
<Icon name="Clock" color="var(--secondary)" />
<Icon name="PiggyBank" color="var(--accent)" />

// Using semantic colors for states
<Icon name="TrendingUp" color="var(--success)" />
<Icon name="BarChart" color="var(--warning)" />
<Icon name="LineChart" color="var(--error)" />
```

## Examples

### Loading Indicator

```tsx
<div className="flex items-center justify-center">
  <Icon name="Hourglass" className="animate-spin text-primary" size={32} />
  <span className="ml-2">Loading...</span>
</div>
```

### Icon with Badge

```tsx
<div className="relative">
  <Icon name="Wallet" size={24} />
  <span className="absolute -top-1 -right-1 bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
    3
  </span>
</div>
```

### Icon Button

```tsx
<button
  className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
  aria-label="Settings"
>
  <Icon name="Settings" />
</button>
```

## Best Practices

1. **Consistency**: Use the standard core icons for common actions and concepts
2. **Accessibility**: Ensure interactive icons have proper ARIA labels
3. **Sizing**: Use consistent sizing (16px for small, 24px for medium, 32px for large)
4. **Color**: Use the application's color tokens for icon colors
5. **Text Accompaniment**: When possible, include text alongside icons to improve clarity
