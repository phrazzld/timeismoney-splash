/**
 * Site name for the Time is Money extension
 */
export const SITE_NAME = 'Time is Money';

/**
 * Site URL with environment-based configuration
 * Falls back to localhost for development
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Build-time warning if NEXT_PUBLIC_SITE_URL is not set in production
if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SITE_URL) {
  console.warn(
    'WARNING: NEXT_PUBLIC_SITE_URL is not set in production environment. Using fallback URL.',
  );
}

/**
 * Site description for SEO purposes
 */
export const SITE_DESCRIPTION =
  'Convert online prices into hours of work with the Time is Money Chrome extension. Make informed purchasing decisions by seeing the true cost in your time.';

/**
 * Title template for page titles
 * %s will be replaced with the page-specific title
 */
export const TITLE_TEMPLATE = '%s | Time is Money';
