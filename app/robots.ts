import { MetadataRoute } from 'next';

/**
 * Generates robots.txt configuration for search engine crawling
 *
 * @returns MetadataRoute.Robots configuration object
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://timeismoney-splash.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/', // Allow crawling of main content
        ],
        disallow: [
          '/api/', // Disallow API routes
          '/_next/', // Disallow Next.js internals
          '/admin/', // Disallow admin paths (if any)
          '/private/', // Disallow private paths (if any)
          '/.well-known/', // Disallow well-known paths
          '/temp/', // Disallow temporary paths
          '/staging/', // Disallow staging paths
        ],
        crawlDelay: 1, // Reasonable crawl delay to avoid overwhelming the server
      },
      // Specific rules for major search engines
      {
        userAgent: 'Googlebot',
        allow: ['/'],
        disallow: ['/api/', '/_next/'],
        // No crawl delay for Googlebot as it's well-behaved
      },
      {
        userAgent: 'Bingbot',
        allow: ['/'],
        disallow: ['/api/', '/_next/'],
        crawlDelay: 1,
      },
      // Block any potentially malicious or aggressive crawlers
      {
        userAgent: 'SemrushBot',
        disallow: ['/'],
      },
      {
        userAgent: 'AhrefsBot',
        disallow: ['/'],
      },
      {
        userAgent: 'MJ12bot',
        disallow: ['/'],
      },
      {
        userAgent: 'DotBot',
        disallow: ['/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
