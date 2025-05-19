# Analytics Module

This module provides privacy-friendly analytics tracking using Plausible Analytics.

## Overview

Plausible is a lightweight, open-source analytics service that respects user privacy:

- No cookies by default
- GDPR compliant without cookie banners
- < 1KB script size
- Simple, focused API

## Configuration

The analytics module requires the following environment variable:

```
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=your-domain.com
```

## Architecture

```
lib/analytics/
├── types.ts       # TypeScript types and event definitions
├── plausible.ts   # Core analytics implementation
├── index.ts       # Public exports
└── README.md      # This file
```

## Usage

### Page View Tracking

Page views are automatically tracked by the `AnalyticsProvider` component in the app layout.

### Custom Event Tracking

```typescript
import { trackEvent } from '@/lib/analytics';

// Track a CTA click
trackEvent('cta_click', {
  location: 'hero',
  variant: 'primary',
});

// Track Chrome extension install
trackEvent('extension_install_click', {
  source: 'landing_page',
});

// Track FAQ interaction
trackEvent('faq_expanded', {
  question_id: 'how-it-works',
});
```

## Available Event Types

The following event types are defined in `types.ts`:

- `cta_click` - General call-to-action clicks
- `extension_install_click` - Chrome Web Store link clicks
- `feature_demo_used` - Interactive demo usage
- `faq_expanded` - FAQ section interactions
- `contact_form_submit` - Contact form submissions

## Development vs Production

### Development Mode

- Events are logged to console
- No network requests to Plausible
- Format: `[Analytics Dev] Event: event_name { props }`

### Production Mode

- Events are sent to Plausible when `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set
- Script loads asynchronously via Next.js Script component
- Page views tracked automatically on route changes

## Testing

### Unit Tests

```bash
pnpm test lib/analytics/plausible.test.ts
```

### Integration Tests

```bash
pnpm test components/AnalyticsProvider.test.tsx
```

### E2E Tests

```bash
pnpm test:e2e e2e/specs/analytics.spec.ts
```

## Extending Analytics

### Adding New Event Types

1. Add the event name to `CoreEvent` type in `types.ts`
2. Document the event purpose in this README
3. Use `trackEvent()` with the new event name

### Switching Analytics Providers

The analytics module is designed for easy provider switching:

1. Keep the same public API (`trackEvent`, `trackPageview`)
2. Update implementation in `plausible.ts`
3. Adjust script loading in `app/layout.tsx`
4. Update tests accordingly

## Privacy Considerations

- Never include personally identifiable information (PII) in event properties
- Plausible respects Do Not Track (DNT) browser settings
- No cookies are set by default
- Users can opt out via localStorage: `localStorage.plausible_ignore=true`

## Troubleshooting

### Events Not Tracking

1. Check `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set correctly
2. Verify you're in production mode (`NODE_ENV=production`)
3. Check browser console for errors
4. Ensure Plausible script is loading (Network tab)

### Development Issues

1. Events should log to console in development
2. Check for TypeScript errors in event names
3. Verify imports are from `@/lib/analytics`

## Resources

- [Plausible Documentation](https://plausible.io/docs)
- [Plausible JavaScript API](https://plausible.io/docs/custom-event-goals)
- [Next.js Script Component](https://nextjs.org/docs/app/api-reference/components/script)
