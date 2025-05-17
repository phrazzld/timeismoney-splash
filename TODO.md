# TODO - Baseline SEO Configuration

This document outlines the tasks for implementing baseline SEO configuration for the "Time is Money" marketing site. Tasks are organized by priority and dependencies.

## High Priority (P0-P1)

### SEO Configuration Module

- [x] **T001 · Feature · P0: Create `lib/seo-config.ts` with SEO constants**
  - **Context:** Create centralized SEO configuration module
  - **Action:**
    1. Create `lib/seo-config.ts`
    2. Define and export constants:
       - `SITE_NAME` - The extension name
       - `SITE_URL` - Using `process.env.NEXT_PUBLIC_SITE_URL` with `http://localhost:3000` fallback
       - `SITE_DESCRIPTION` - Site description
       - `TITLE_TEMPLATE` - Page title template pattern
    3. Add build-time warning if `NEXT_PUBLIC_SITE_URL` is unset in production
    4. Add TSDoc comments for all exports
  - **Done‑when:**
    1. File exists with all constants properly typed and exported
    2. Fallback logic works correctly
    3. Build warning logs when appropriate
    4. All exports have TSDoc documentation
  - **Verification:**
    1. Run `pnpm build` with `NODE_ENV=production` and unset `NEXT_PUBLIC_SITE_URL` to verify warning
    2. Import constants in test file to verify values
  - **Depends‑on:** none

### Environment Configuration

- [x] **T002 · Chore · P0: Configure `NEXT_PUBLIC_SITE_URL` environment variable**
  - **Context:** Set up environment variable for site URL
  - **Action:**
    1. Add `NEXT_PUBLIC_SITE_URL=http://localhost:3000` to `.env.local`
    2. Document requirement in README.md for production deployments
    3. Configure in Vercel project environment variables:
       - Production: `NEXT_PUBLIC_SITE_URL=https://timeismoney.works`
       - Preview: Use appropriate preview URL
  - **Done‑when:**
    1. `.env.local` contains the variable
    2. README.md documents deployment requirements
    3. Vercel environments configured with correct URLs
  - **Verification:**
    1. Log `process.env.NEXT_PUBLIC_SITE_URL` in dev mode to confirm
  - **Depends‑on:** none

### Global Metadata

- [x] **T003 · Feature · P0: Implement global metadata in `app/layout.tsx`**
  - **Context:** Configure site-wide metadata defaults
  - **Action:**
    1. Import constants from `lib/seo-config.ts`
    2. Define and export `metadata: Metadata` object with:
       - `title: { default: SITE_NAME, template: TITLE_TEMPLATE }`
       - `description: SITE_DESCRIPTION`
       - `metadataBase: new URL(SITE_URL)`
       - Basic Open Graph tags (title, description, url, siteName, type, locale)
    3. Add TSDoc comment explaining `metadataBase` importance
  - **Done‑when:**
    1. Global metadata correctly uses SEO constants
    2. `metadataBase` is set for absolute URLs
    3. Open Graph tags are configured
    4. Code is documented
  - **Verification:**
    1. Inspect page `<head>` for correct default metadata
    2. Verify Open Graph URLs are absolute
  - **Depends‑on:** [T001]

### Page-Specific Metadata

- [x] **T004 · Feature · P1: Implement landing page metadata in `app/page.tsx`**
  - **Context:** Landing page specific metadata
  - **Action:**
    1. Import `Metadata` type from `next`
    2. Export static `metadata: Metadata` object with:
       - Specific `title` (e.g., "Convert Prices to Work Hours | Time is Money Extension")
       - Page-specific `description`
       - `alternates: { canonical: '/' }`
  - **Done‑when:**
    1. Landing page has specific metadata
    2. Title follows template pattern
    3. Canonical URL is set
  - **Verification:**
    1. Inspect landing page source for correct meta tags
    2. Verify canonical URL is absolute
  - **Depends‑on:** [T003]

### SEO Files Generation

- [ ] **T005 · Feature · P1: Create `app/robots.ts` for robots.txt generation**

  - **Context:** Generate robots.txt file
  - **Action:**
    1. Create `app/robots.ts`
    2. Import `SITE_URL` from `lib/seo-config.ts`
    3. Export default function `robots(): MetadataRoute.Robots`
    4. Return object with:
       - `rules: { userAgent: '*', allow: '/' }`
       - `sitemap: `${SITE_URL}/sitemap.xml``
    5. Add TSDoc comment explaining file purpose
  - **Done‑when:**
    1. `/robots.txt` returns correct content
    2. Sitemap URL is absolute
    3. File is documented
  - **Verification:**
    1. Navigate to `/robots.txt` in dev mode
    2. Verify content and sitemap URL
  - **Depends‑on:** [T001]
  - **Note:** [CL004 - Confirm disallow rules]

- [ ] **T006 · Feature · P1: Create `app/sitemap.ts` for sitemap.xml generation**
  - **Context:** Generate sitemap.xml file for single-page application
  - **Action:**
    1. Create `app/sitemap.ts`
    2. Import `SITE_URL` from `lib/seo-config.ts`
    3. Export default async function `sitemap(): Promise<MetadataRoute.Sitemap>`
    4. Return array with homepage entry only:
       ```typescript
       [
         {
           url: SITE_URL,
           lastModified: new Date().toISOString(),
           changeFrequency: 'monthly',
           priority: 1,
         },
       ];
       ```
    5. Add TSDoc comment noting this is for SPA with single route
  - **Done‑when:**
    1. `/sitemap.xml` returns valid XML
    2. URL is absolute (https://timeismoney.works)
    3. File is documented
  - **Verification:**
    1. Navigate to `/sitemap.xml` in dev mode
    2. Verify XML structure and URL
  - **Depends‑on:** [T001]

### CI/CD Integration

- [ ] **T007 · Chore · P1: Add CI check for `NEXT_PUBLIC_SITE_URL` presence and format**
  - **Context:** Prevent deployment without proper URL configuration
  - **Action:**
    1. Add CI script to validate `NEXT_PUBLIC_SITE_URL` presence
    2. Add basic URL format validation
    3. Fail build if variable is missing or invalid in production
  - **Done‑when:**
    1. CI pipeline includes validation step
    2. Production builds fail without proper URL
  - **Verification:**
    1. Test CI with missing/invalid URL to confirm failure
  - **Depends‑on:** [T002]

## Medium Priority (P2)

### Testing

- [ ] **T008 · Test · P2: Unit tests for `lib/seo-config.ts`**

  - **Context:** Test SEO configuration logic
  - **Action:**
    1. Write Jest tests for `SITE_URL` fallback logic
    2. Test build warning mechanism
    3. Mock `process.env` and `console.warn`
  - **Done‑when:**
    1. Tests cover fallback logic
    2. Warning behavior is verified
    3. All tests pass
  - **Depends‑on:** [T001]

- [ ] **T009 · Test · P2: Integration tests for SEO endpoints**

  - **Context:** Test robots.txt and sitemap.xml generation
  - **Action:**
    1. Test `/robots.txt` response:
       - Status 200, Content-Type: text/plain
       - Correct rules and sitemap URL
    2. Test `/sitemap.xml` response:
       - Status 200, Content-Type: application/xml
       - Valid XML structure
       - Correct URLs
  - **Done‑when:**
    1. Tests pass for both endpoints
    2. Content validation is comprehensive
  - **Depends‑on:** [T005, T006]

- [ ] **T010 · Test · P2: E2E tests for landing page metadata**
  - **Context:** Test metadata rendering on real pages
  - **Action:**
    1. Write Playwright tests for landing page
    2. Assert presence and correctness of:
       - `<title>` content
       - `<meta name="description">` content
       - `<link rel="canonical">` href
       - Open Graph tags (og:title, og:description, og:url, og:type)
  - **Done‑when:**
    1. Tests pass for all metadata elements
    2. Absolute URLs are verified
  - **Depends‑on:** [T003, T004]

### Documentation

- [ ] **T011 · Documentation · P2: Document SEO configuration**
  - **Context:** Provide clear documentation for SEO setup
  - **Action:**
    1. Update README.md or create `docs/seo.md` with:
       - Purpose of `lib/seo-config.ts`
       - Role of `NEXT_PUBLIC_SITE_URL`
       - How to set global/page metadata
       - How to add pages to sitemap
       - robots.txt and sitemap.xml generation
  - **Done‑when:**
    1. Documentation is comprehensive
    2. Examples are provided
    3. Update procedures are clear
  - **Depends‑on:** [T001, T003, T004, T005, T006]

### Verification

- [ ] **T012 · Chore · P2: Local development verification**

  - **Context:** Manual verification of SEO implementation
  - **Action:**
    1. Run `pnpm build && pnpm start`
    2. Verify all metadata in page source
    3. Check `/robots.txt` content
    4. Check `/sitemap.xml` content
  - **Done‑when:**
    1. All checks pass locally
    2. Issues documented if found
  - **Depends‑on:** [T001-T006]

- [ ] **T013 · Chore · P2: Production deployment verification**
  - **Context:** Verify SEO on live site
  - **Action:**
    1. Deploy to preview/production
    2. Check live `/robots.txt` and `/sitemap.xml`
    3. Inspect metadata on key pages
    4. Use social media debug tools (Facebook Sharing Debugger, Twitter Card Validator)
  - **Done‑when:**
    1. Live site serves correct SEO content
    2. Social media previews work correctly
  - **Depends‑on:** [T012]

## Clarifications & Assumptions

### Resolved Issues

- [x] **CL001: Production URL confirmed as `timeismoney.works`**

  - **Resolution:** Production URL is `https://timeismoney.works`
  - **Action:** Update T002 to use this URL in Vercel environment

- [x] **CL002: Core pages list confirmed**
  - **Resolution:** Single page application with only landing page for now
  - **Action:** T006 will include only homepage in sitemap

### Non-Blocking Issues

- [ ] **CL003: Default og:image not specified**

  - **Context:** No default Open Graph image provided
  - **Blocking:** No
  - **Impact:** [T003] - Can be added later when available

- [ ] **CL004: robots.txt disallow rules not specified**
  - **Context:** No specific paths to block
  - **Blocking:** No
  - **Impact:** [T005] - Will use default allow all

## Notes

- Follow strict TypeScript configuration (no `any` types)
- Ensure all code passes ESLint/Prettier checks
- Use conventional commits for git messages
- Test locally before deploying
- Document any deviations from the plan
