# Time is Money Logo Assets

This document provides information about the logo assets for the Time is Money Chrome extension marketing site.

## Logo Files

The Time is Money logo represents the concept of time as a valuable resource, visualized as an hourglass shape inside a circular background with the brand's signature green color.

### Available Logo Files

| Filename      | Location              | Format | Dimensions | Description                              |
| ------------- | --------------------- | ------ | ---------- | ---------------------------------------- |
| `logo-01.png` | `/public/logo-01.png` | PNG    | 1024×1024  | Primary logo (circle with hourglass)     |
| `logo-02.png` | `/public/logo-02.png` | PNG    | 1024×1024  | Alternative logo (circle with hourglass) |

## Logo Variants

The Logo component (`components/atoms/Logo/Logo.tsx`) supports two variants:

1. **Default** (`variant="default"`)

   - Uses `logo-01.png`
   - Default width: 200px
   - Aspect ratio: the height is calculated as 25% of the width
   - Standard usage in headers and marketing materials

2. **Square** (`variant="square"`)
   - Uses `logo-02.png`
   - Default width: 64px
   - 1:1 aspect ratio
   - Used in smaller spaces, favicons, and mobile layouts

## Technical Specifications

### Colors

The logo uses the brand's primary green color:

- Primary green: `oklch(0.7 0.2 145)` (equivalent to approximately #5CB85C in hex)

### Format Details

- File format: PNG with transparency
- Color depth: 8-bit
- Alpha channel: Yes (RGBA for logo-01.png)
- Resolution: High-resolution (1024×1024 pixels)

## Usage Guidelines

### Recommended Usage

- Use the **default** variant in headers, hero sections, and marketing materials where space allows
- Use the **square** variant for smaller UI elements, mobile layouts, and favicon
- Maintain the aspect ratio when resizing to preserve logo integrity
- Ensure adequate spacing around the logo (recommended: at least 25% of the logo width on all sides)

### Implementation Examples

```tsx
// Default usage
<Logo />

// Square variant (compact)
<Logo variant="square" />

// Custom width
<Logo width={300} />

// With custom class
<Logo className="my-8" />

// With custom alt text
<Logo alt="Time is Money Chrome Extension" />
```

### Accessibility Considerations

The Logo component:

- Includes appropriate `alt` text by default ("Time is Money")
- Uses Next.js Image component for optimization
- Sets `priority` for faster loading of above-the-fold logo instances

## Future Improvements

- Consider creating SVG versions for better scaling and smaller file size
- Add additional variants (e.g., logomark only, wordmark only, inverted for dark backgrounds)
- Create vector source files for easier editing and adaptation
