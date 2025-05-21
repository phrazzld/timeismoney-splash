# Atom Components

This directory contains the most basic, reusable UI building blocks for the Time is Money marketing site.

## Components

### Typography

`Typography` is a versatile text component that ensures consistent styling across the application. It supports multiple variants (h1-h6, paragraph, small, blockquote, code) and can be customized with additional classes.

```tsx
import { Typography } from '@/components/atoms';

<Typography variant="h1">Main Heading</Typography>
<Typography variant="p">This is a paragraph of text.</Typography>
<Typography variant="blockquote">This is a quote.</Typography>
```

### Button

`Button` is a versatile interactive component for user actions. It supports multiple variants (primary, secondary, destructive, outline, ghost, link) and sizes (default, small, large, icon). The primary variant uses the green brand color from the Time is Money extension.

```tsx
import { Button } from '@/components/atoms';

<Button>Default Button</Button>
<Button variant="primary" size="lg">Large Primary Button</Button>
<Button variant="outline" isLoading>Loading Button</Button>
```

### Icon

`Icon` is a component that renders icons from the lucide-react library. The primary icons for the Time is Money app are Clock and DollarSign.

```tsx
import { Icon } from '@/components/atoms';

<Icon name="Clock" />
<Icon name="DollarSign" size={32} color="#5CB85C" />
<Icon name="Timer" strokeWidth={1.5} className="my-custom-class" />
```

### Logo

`Logo` is a component that renders the Time is Money logo. It supports two variants: default (horizontal) and square (compact).

```tsx
import { Logo } from '@/components/atoms';

<Logo />
<Logo variant="square" width={80} />
<Logo className="my-custom-class" alt="Time is Money logo" />
```

## Design System

All components are built using the Time is Money design tokens located in the `design-tokens` directory:

- Colors: Primary green (#5CB85C), accent sand/gold, and supporting colors
- Typography: Using Geist Sans and Geist Mono with defined scales
- Spacing: Consistent spacing system
- Variants: Light and dark mode support

## Documentation

View detailed component documentation, props, and examples in Storybook:

```bash
pnpm storybook
```
