# Analytics Implementation

## Overview

This document details the implementation of basic analytics tracking for the Time is Money marketing site using Plausible Analytics.

## Implementation Details

### Platform Selection

**Plausible Analytics** was chosen for the following reasons:

- Privacy-first approach (no cookies, GDPR compliant)
- Lightweight script (< 1KB)
- Simple integration with Next.js
- Aligns with the brand values of mindful spending and user privacy

### Files Added/Modified

#### Core Analytics Module

1. **`lib/analytics/types.ts`**

   - TypeScript types for events and properties
   - Defines `CoreEvent` type for tracking consistency

2. **`lib/analytics/plausible.ts`**

   - Core implementation using plausible-tracker
   - Handles development vs production environments
   - Provides `trackEvent()` and `trackPageview()` functions

3. **`lib/analytics/index.ts`**

   - Public exports for the analytics module

4. **`lib/analytics/README.md`**
   - Comprehensive documentation for analytics usage

#### Integration Components

1. **`components/AnalyticsProvider.tsx`**

   - Client component for automatic page view tracking
   - Uses Next.js App Router navigation hooks

2. **`app/layout.tsx`**
   - Updated to include AnalyticsProvider
   - Script injection for Plausible analytics
   - Production-only script loading

#### Environment Configuration

1. **`scripts/validate-env.ts`**

   - Extended to validate `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
   - Ensures analytics configuration in production

2. **`.env.local`**
   - Added `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`

#### Package Manager Enforcement

1. **`.npmrc`**

   - Prevents npm/yarn lockfile creation
   - Enforces pnpm usage

2. **`scripts/enforce-pnpm.js`**

   - Custom preinstall script
   - Clear error messages for wrong package manager

3. **`.husky/pre-commit`**

   - Checks for unwanted lockfiles
   - Prevents accidental npm/yarn usage

4. **`.github/workflows/main.yml`**
   - CI checks for lockfile integrity
   - Corepack enforcement

#### Testing

1. **`lib/analytics/plausible.test.ts`**

   - Unit tests for analytics functions
   - Tests development vs production behavior

2. **`components/AnalyticsProvider.test.tsx`**

   - Tests page view tracking on route changes

3. **`e2e/specs/analytics.spec.ts`**

   - E2E tests for script loading
   - Privacy verification (no cookies)

4. **`scripts/validate-env.test.ts`**
   - Updated for Plausible domain validation

### Configuration

The implementation requires the following environment variables:

```
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com
```

### Usage

```typescript
import { trackEvent } from '@/lib/analytics';

// Track custom events
trackEvent('extension_install_click', {
  location: 'hero',
  source: 'landing_page',
});
```

### Privacy Features

- No cookies by default
- GDPR compliant without cookie banners
- Respects Do Not Track browser settings
- No personal data collection

## Testing

All tests have been written and pass:

- Unit tests for analytics functions
- Integration tests for React components
- E2E tests for production behavior
- Environment validation tests

## Next Steps

1. Create a Plausible account at plausible.io
2. Add your domain to get the tracking domain
3. Configure the environment variable in production
4. Deploy and verify analytics are tracking

## Compliance

The implementation follows all project standards:

- TypeScript strict mode (no `any` types)
- Full test coverage
- ESLint and Prettier compliance
- Documentation complete
- pnpm enforcement implemented
