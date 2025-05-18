import { test, expect } from '@playwright/test';
import { LandingPage } from '../page-objects/landing-page.po';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '../../lib/seo-config';

// Specific title content for the landing page from app/page.tsx
const LANDING_PAGE_TITLE_CONTENT = 'Convert Prices to Work Hours';
// Next.js only uses the template when the title is a string, not when it's part of the title object
const EXPECTED_DOCUMENT_TITLE = LANDING_PAGE_TITLE_CONTENT;

// Landing page has its own specific description in metadata
const LANDING_PAGE_DESCRIPTION =
  'Transform online prices into hours of work with the Time is Money Chrome extension. See the true cost of purchases in the time it takes to earn them.';

test.describe('Landing Page Metadata (T010)', () => {
  let landingPage: LandingPage;

  test.beforeEach(async ({ page }) => {
    landingPage = new LandingPage(page);
    await landingPage.navigate();
    // Wait for the head to be fully populated
    await page.waitForLoadState('domcontentloaded');
  });

  test('should have the correct <title> content', async () => {
    const actualTitle = await landingPage.title();
    expect(actualTitle).toBe(EXPECTED_DOCUMENT_TITLE);
  });

  test('should have the correct <meta name="description"> content', async () => {
    const actualDescription = await landingPage.getMetaDescriptionContent();
    expect(actualDescription).toBe(LANDING_PAGE_DESCRIPTION);
  });

  test('should have the correct <link rel="canonical"> href (absolute URL)', async () => {
    const actualCanonicalHref = await landingPage.getCanonicalHref();
    // Next.js doesn't add trailing slash to the root URL
    const expectedCanonicalUrl = SITE_URL;
    expect(actualCanonicalHref).toBe(expectedCanonicalUrl);
  });

  test('should have the correct Open Graph title (og:title)', async () => {
    const actualOgTitle = await landingPage.getOpenGraphContent('og:title');
    // Open Graph title uses the global SITE_NAME from layout.tsx
    expect(actualOgTitle).toBe(SITE_NAME);
  });

  test('should have the correct Open Graph description (og:description)', async () => {
    const actualOgDescription = await landingPage.getOpenGraphContent('og:description');
    // Open Graph description uses the global SITE_DESCRIPTION from layout.tsx
    expect(actualOgDescription).toBe(SITE_DESCRIPTION);
  });

  test('should have the correct Open Graph URL (og:url) (absolute URL)', async () => {
    const actualOgUrl = await landingPage.getOpenGraphContent('og:url');
    // Next.js doesn't add trailing slash to the root URL
    const expectedOgUrl = SITE_URL;
    expect(actualOgUrl).toBe(expectedOgUrl);
  });

  test('should have the correct Open Graph type (og:type)', async () => {
    const actualOgType = await landingPage.getOpenGraphContent('og:type');
    expect(actualOgType).toBe('website');
  });

  test('all URLs should be absolute', async () => {
    // Verify canonical URL is absolute
    const canonicalUrl = await landingPage.getCanonicalHref();
    expect(canonicalUrl).toMatch(/^https?:\/\//);

    // Verify OG URL is absolute
    const ogUrl = await landingPage.getOpenGraphContent('og:url');
    expect(ogUrl).toMatch(/^https?:\/\//);
  });
});
