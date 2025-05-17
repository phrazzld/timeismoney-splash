import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo-config';

/**
 * Generates the robots.txt file for search engine crawlers.
 * Allows all user agents to crawl the entire site and references the sitemap.
 *
 * @returns Robots.txt configuration object
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
