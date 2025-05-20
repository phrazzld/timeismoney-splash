# Typography Tokens

This document outlines the typography design tokens used in the Time is Money marketing site. These tokens define our text styling and ensure consistent typography across the application.

## Font Families

The application uses two primary font families:

| Token  | Value                                 |
| ------ | ------------------------------------- |
| `sans` | Geist Sans with appropriate fallbacks |
| `mono` | Geist Mono with appropriate fallbacks |

## Font Sizes

Font sizes follow a consistent scale from extra small to extra large:

| Token  | Value    | Pixel Equivalent |
| ------ | -------- | ---------------- |
| `xs`   | 0.75rem  | 12px             |
| `sm`   | 0.875rem | 14px             |
| `base` | 1rem     | 16px             |
| `lg`   | 1.125rem | 18px             |
| `xl`   | 1.25rem  | 20px             |
| `2xl`  | 1.5rem   | 24px             |
| `3xl`  | 1.875rem | 30px             |
| `4xl`  | 2.25rem  | 36px             |
| `5xl`  | 3rem     | 48px             |
| `6xl`  | 3.75rem  | 60px             |
| `7xl`  | 4.5rem   | 72px             |
| `8xl`  | 6rem     | 96px             |
| `9xl`  | 8rem     | 128px            |

## Font Weights

| Token      | Value |
| ---------- | ----- |
| `light`    | 300   |
| `normal`   | 400   |
| `medium`   | 500   |
| `semibold` | 600   |
| `bold`     | 700   |

## Line Heights

| Token     | Value | Description           |
| --------- | ----- | --------------------- |
| `none`    | 1     | No line spacing       |
| `tight`   | 1.25  | Tight line spacing    |
| `snug`    | 1.375 | Snug line spacing     |
| `normal`  | 1.5   | Standard line spacing |
| `relaxed` | 1.625 | Relaxed line spacing  |
| `loose`   | 2     | Loose line spacing    |

## Letter Spacings

| Token     | Value    | Description               |
| --------- | -------- | ------------------------- |
| `tighter` | -0.05em  | Very tight letter spacing |
| `tight`   | -0.025em | Tight letter spacing      |
| `normal`  | 0em      | Standard letter spacing   |
| `wide`    | 0.025em  | Wide letter spacing       |
| `wider`   | 0.05em   | Wider letter spacing      |
| `widest`  | 0.1em    | Widest letter spacing     |

## Typography Presets

The application includes predefined typography presets for consistent text styling:

### Headings

| Preset | Font Size       | Font Weight    | Line Height  | Letter Spacing   |
| ------ | --------------- | -------------- | ------------ | ---------------- |
| `h1`   | 3rem (48px)     | 700 (bold)     | 1.25 (tight) | -0.025em (tight) |
| `h2`   | 2.25rem (36px)  | 700 (bold)     | 1.25 (tight) | -0.025em (tight) |
| `h3`   | 1.875rem (30px) | 600 (semibold) | 1.375 (snug) | 0em (normal)     |
| `h4`   | 1.5rem (24px)   | 600 (semibold) | 1.375 (snug) | 0em (normal)     |
| `h5`   | 1.25rem (20px)  | 600 (semibold) | 1.5 (normal) | 0em (normal)     |
| `h6`   | 1.125rem (18px) | 600 (semibold) | 1.5 (normal) | 0em (normal)     |

### Body Text

| Preset      | Font Size       | Font Weight  | Line Height     | Letter Spacing |
| ----------- | --------------- | ------------ | --------------- | -------------- |
| `bodyLarge` | 1.125rem (18px) | 400 (normal) | 1.625 (relaxed) | 0em (normal)   |
| `body`      | 1rem (16px)     | 400 (normal) | 1.5 (normal)    | 0em (normal)   |
| `bodySmall` | 0.875rem (14px) | 400 (normal) | 1.5 (normal)    | 0em (normal)   |

### Utility Text

| Preset     | Font Size       | Font Weight  | Line Height  | Letter Spacing | Special   |
| ---------- | --------------- | ------------ | ------------ | -------------- | --------- |
| `caption`  | 0.75rem (12px)  | 400 (normal) | 1.5 (normal) | 0em (normal)   | -         |
| `overline` | 0.75rem (12px)  | 500 (medium) | 1.5 (normal) | 0.05em (wider) | Uppercase |
| `label`    | 0.875rem (14px) | 500 (medium) | 1.5 (normal) | 0em (normal)   | -         |

### Code

| Preset      | Font Size       | Font Weight  | Line Height     | Letter Spacing | Font Family |
| ----------- | --------------- | ------------ | --------------- | -------------- | ----------- |
| `code`      | 0.875rem (14px) | 400 (normal) | 1.5 (normal)    | 0em (normal)   | Geist Mono  |
| `codeBlock` | 0.875rem (14px) | 400 (normal) | 1.625 (relaxed) | 0em (normal)   | Geist Mono  |

## Usage in the Codebase

These typography tokens are available through the `typography` and `typographyPresets` exports from the `design-tokens/typography.ts` file:

```typescript
import { typography, typographyPresets } from 'design-tokens/typography';

// Use individual token categories
const { fontFamilies, fontSizes, fontWeights, lineHeights, letterSpacings } = typography;

// Or use predefined combinations
const { h1, body, code } = typographyPresets;
```

## Integration with Tailwind CSS

These typography tokens are integrated into Tailwind CSS through the `tailwind.config.ts` file, making them available through Tailwind's utility classes:

```html
<!-- Example of using typography-based utility classes -->
<h1 class="font-sans text-5xl font-bold leading-tight tracking-tight">Heading 1</h1>
<p class="font-sans text-base font-normal leading-normal tracking-normal">Body text</p>
<code class="font-mono text-sm font-normal leading-normal">Code snippet</code>
```
