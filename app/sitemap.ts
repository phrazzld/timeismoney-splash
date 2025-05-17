import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo-config';

/**
 * Generates the sitemap.xml for search engines.
 * Since this is a single-page application (SPA), only the homepage is included.
 *
 * @returns Sitemap configuration for the homepage
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: SITE_URL,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
