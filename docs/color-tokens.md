# Color Tokens

This document provides an overview of the Time is Money brand color palette and how it's implemented as design tokens in the codebase.

## Brand Colors

The Time is Money brand uses a vibrant green as its primary color, which is extracted from the hourglass logo. The color palette is implemented in `design-tokens/colors.ts` and includes:

### Primary Colors

| Name          | OKLCH Value            | Hex (approximately) | Usage                                                                            |
| ------------- | ---------------------- | ------------------- | -------------------------------------------------------------------------------- |
| Primary       | `oklch(0.7 0.2 145)`   | #5CB85C             | The primary brand color, used for main CTAs, primary buttons, and brand elements |
| Primary Hover | `oklch(0.65 0.2 145)`  | #4CAE4C             | Used for hover states on primary elements                                        |
| Primary Light | `oklch(0.85 0.15 145)` | #A5D6A5             | Used for backgrounds, borders, and lighter UI elements                           |
| Primary Dark  | `oklch(0.5 0.2 145)`   | #388E3C             | Used for active states and darker UI elements                                    |

### Secondary Colors

| Name            | OKLCH Value            | Usage                                         |
| --------------- | ---------------------- | --------------------------------------------- |
| Secondary       | `oklch(0.6 0.15 130)`  | Teal-green color used for secondary elements  |
| Secondary Hover | `oklch(0.55 0.15 130)` | Used for hover states on secondary elements   |
| Secondary Light | `oklch(0.8 0.1 130)`   | Used for backgrounds and lighter UI elements  |
| Secondary Dark  | `oklch(0.4 0.15 130)`  | Used for active states and darker UI elements |

### Accent Colors

| Name         | OKLCH Value           | Usage                                                                           |
| ------------ | --------------------- | ------------------------------------------------------------------------------- |
| Accent       | `oklch(0.8 0.15 85)`  | Sand/gold color used for accent elements, representing the sand in an hourglass |
| Accent Hover | `oklch(0.75 0.15 85)` | Used for hover states on accent elements                                        |
| Accent Light | `oklch(0.9 0.1 85)`   | Used for backgrounds and lighter UI elements                                    |
| Accent Dark  | `oklch(0.6 0.15 85)`  | Used for active states and darker UI elements                                   |

### Neutral Scale

The neutral scale is used for text, backgrounds, and UI elements. It ranges from near-white (50) to near-black (900):

- Neutral 50: `oklch(0.98 0 0)` - Near white
- Neutral 100: `oklch(0.96 0 0)`
- Neutral 200: `oklch(0.9 0 0)`
- Neutral 300: `oklch(0.8 0 0)`
- Neutral 400: `oklch(0.6 0 0)`
- Neutral 500: `oklch(0.5 0 0)`
- Neutral 600: `oklch(0.4 0 0)`
- Neutral 700: `oklch(0.3 0 0)`
- Neutral 800: `oklch(0.2 0 0)`
- Neutral 900: `oklch(0.1 0 0)` - Near black

### Semantic Colors

| Category | Value               | Usage                                                |
| -------- | ------------------- | ---------------------------------------------------- |
| Success  | Same as Primary     | Used for success states and messages                 |
| Warning  | `oklch(0.8 0.2 85)` | Used for warning states and messages (yellow-orange) |
| Error    | `oklch(0.6 0.2 25)` | Used for error states and messages (red)             |

### Background Colors

| Name                 | Light Mode        | Dark Mode         | Usage                      |
| -------------------- | ----------------- | ----------------- | -------------------------- |
| Background           | `oklch(0.99 0 0)` | `oklch(0.1 0 0)`  | Main background color      |
| Background Secondary | `oklch(0.97 0 0)` | `oklch(0.15 0 0)` | Secondary background color |

## Implementation Details

### Color Format

We use the OKLCH color format for all color tokens. OKLCH is a perceptually uniform color space that provides better results for color manipulations and is more accessible.

### Usage in Code

The color tokens are defined in `design-tokens/colors.ts` and their types are defined in `design-tokens/types.ts`. They are then integrated into Tailwind CSS configuration in `tailwind.config.ts`.

To use these colors in your components:

```tsx
// Using Tailwind classes
<button className="bg-primary text-primary-foreground hover:bg-primary-hover">
  Primary Button
</button>

// Using CSS variables
<div style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
  Primary Element
</div>
```

### Dark Mode Support

All colors have dark mode variants defined in `app/globals.css` using CSS variables. The dark mode is implemented using the `class` strategy in Tailwind CSS, which means it can be toggled by adding the `dark` class to the `html` element.

## Best Practices

1. Always use the color tokens instead of hardcoding color values
2. Use semantic color names when possible (e.g., `primary` instead of `green`)
3. Ensure sufficient contrast ratios for accessibility (WCAG 2.1 AA)
4. Test colors in both light and dark modes
