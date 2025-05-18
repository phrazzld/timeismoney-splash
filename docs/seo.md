# SEO Configuration Guide

This guide explains how SEO is configured and managed in the Time is Money marketing site.

## Overview

The Time is Money marketing site uses Next.js 15's built-in metadata API along with a centralized configuration system to manage SEO. This approach ensures consistency across the site and makes it easy to update SEO settings.

### Key Components

1. **`lib/seo-config.ts`** - Central configuration file with SEO constants
2. **`app/layout.tsx`** - Global metadata configuration
3. **`app/page.tsx`** - Page-specific metadata
4. **`app/robots.ts`** - Generates robots.txt
5. **`app/sitemap.ts`** - Generates sitemap.xml

## Configuration

### Environment Variables

The site uses a single environment variable for SEO configuration:

```bash
NEXT_PUBLIC_SITE_URL=https://timeismoney.works
```

**Important**: This variable must be set correctly in each environment:

- Development: `http://localhost:3000` (in `.env.local`)
- Production: `https://timeismoney.works` (in deployment environment)

Without this variable set properly in production, the build will show a warning and SEO features may not work correctly.

### SEO Constants

All SEO constants are centralized in `lib/seo-config.ts`:

```typescript
export const SITE_NAME = 'Time is Money';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const SITE_DESCRIPTION = 'Convert online prices into hours of work...';
export const TITLE_TEMPLATE = '%s | Time is Money';
```

## Implementation Guide

### Setting Global Metadata

Global metadata is configured in `app/layout.tsx` using the constants from `seo-config.ts`:

```typescript
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION, TITLE_TEMPLATE } from '@/lib/seo-config';

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: TITLE_TEMPLATE,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: '/',
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
  },
};
```

**Key Points**:

- `metadataBase` is crucial for converting relative URLs to absolute URLs in metadata
- The title template applies to all pages that provide a string title
- Open Graph tags use the global defaults unless overridden by pages

### Setting Page-Specific Metadata

Individual pages can override global metadata by exporting their own `metadata` object:

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Convert Prices to Work Hours',
  description: 'Transform online prices into hours of work...',
  alternates: {
    canonical: '/',
  },
};
```

**Note**: When a page provides its own title as a string, it won't use the template from the layout. To use the template, provide the title separately.

### Adding Pages to Sitemap

To add new pages to the sitemap, modify `app/sitemap.ts`:

```typescript
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    // Add new pages here
    {
      url: `${SITE_URL}/features`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];
}
```

## Special Files

### robots.txt Generation

The `app/robots.ts` file generates the robots.txt:

```typescript
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

### sitemap.xml Generation

The `app/sitemap.ts` file generates the sitemap dynamically. The sitemap is automatically served at `/sitemap.xml`.

## Best Practices

1. **Always use absolute URLs** - The `metadataBase` in layout.tsx ensures relative URLs are converted to absolute URLs
2. **Test in production mode** - Run `NODE_ENV=production pnpm build` to test production behavior
3. **Verify with tools** - Use tools like Google's Rich Results Test and social media debuggers to verify metadata
4. **Keep descriptions concise** - Meta descriptions should be 150-160 characters
5. **Use semantic titles** - Page titles should be descriptive and include relevant keywords

## Common Tasks

### Updating Site Name or Description

1. Edit the constants in `lib/seo-config.ts`
2. The changes will automatically apply site-wide
3. Rebuild and deploy the application

### Adding Open Graph Images

To add Open Graph images, update the metadata in your page or layout:

```typescript
export const metadata: Metadata = {
  openGraph: {
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Time is Money - Convert Prices to Work Hours',
      },
    ],
  },
};
```

### Testing SEO Configuration

1. **Local Testing**:

   ```bash
   pnpm build && pnpm start
   ```

   Then check:

   - View page source for metadata
   - Visit `/robots.txt`
   - Visit `/sitemap.xml`

2. **Production Testing**:
   - Use Google Search Console
   - Facebook Sharing Debugger
   - Twitter Card Validator
   - LinkedIn Post Inspector

## Troubleshooting

### URLs Not Absolute

If metadata URLs aren't absolute:

1. Verify `NEXT_PUBLIC_SITE_URL` is set correctly
2. Ensure `metadataBase` is set in `app/layout.tsx`
3. Check that the environment variable is available during build

### Template Not Applied

If the title template isn't being applied:

- Page-specific metadata with a string title won't use the template
- Use the title object format if you need the template

### Production Warnings

If you see warnings about `NEXT_PUBLIC_SITE_URL` during production builds:

1. Ensure the environment variable is set in your deployment platform
2. The variable must be prefixed with `NEXT_PUBLIC_` to be available client-side
3. Rebuild after setting the variable

## References

- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js SEO Guide](https://nextjs.org/learn/seo/introduction-to-seo)
- [Open Graph Protocol](https://ogp.me/)
- [Google SEO Documentation](https://developers.google.com/search/docs)
