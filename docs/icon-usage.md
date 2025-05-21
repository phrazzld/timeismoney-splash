# Icon Usage Guidelines for Time is Money

This document defines the official Lucide React icon names used in the Time is Money application.

## Core Icons

### Time-Related Icons

| Name        | Icon       | Description                    | Usage                                          |
| ----------- | ---------- | ------------------------------ | ---------------------------------------------- |
| `Clock`     | Clock face | Represents time                | Primary time indicator, used throughout the UI |
| `Timer`     | Stopwatch  | Represents timed activities    | Used for tracking time-related features        |
| `Hourglass` | Hourglass  | Represents the passage of time | Used for loading states and brand imagery      |

### Money-Related Icons

| Name         | Icon          | Description                  | Usage                                    |
| ------------ | ------------- | ---------------------------- | ---------------------------------------- |
| `DollarSign` | $ symbol      | Represents currency/money    | Primary currency indicator               |
| `Coins`      | Stacked coins | Represents physical money    | Used for savings or coin-related imagery |
| `Wallet`     | Wallet        | Represents personal finances | Used for user financial information      |
| `PiggyBank`  | Piggy bank    | Represents savings           | Used for savings-related features        |

### Additional Utility Icons

| Name         | Icon              | Description                   | Usage                                 |
| ------------ | ----------------- | ----------------------------- | ------------------------------------- |
| `TrendingUp` | Upward trend line | Represents positive growth    | Used for positive financial metrics   |
| `BarChart`   | Bar chart         | Represents data visualization | Used for financial reports/statistics |
| `LineChart`  | Line chart        | Represents data trends        | Used for trend visualization          |
| `Settings`   | Gear/cog          | Represents configuration      | Used for user settings                |

## Implementation

Icons are implemented using the `Icon` component:

```tsx
import { Icon } from '@/components/atoms';

// Basic usage
<Icon name="Clock" />

// With custom size
<Icon name="DollarSign" size={32} />

// With custom color and stroke width
<Icon name="Timer" color="var(--primary)" strokeWidth={1.5} />
```

## Accessibility

When using icons, follow these guidelines:

1. Decorative icons should have `aria-hidden="true"` (handled automatically by the Icon component)
2. Icons that convey meaning should include appropriate aria labels
3. Interactive icons should be accompanied by visible text or have proper screen reader text

## Icon Grid

For a visual reference of all icons, see the Storybook "IconGrid" story in the Icon component documentation.
