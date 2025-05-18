/**
 * Integration tests for SEO endpoints (/robots.txt and /sitemap.xml)
 *
 * These tests verify the endpoint functions return correct data structures
 * that Next.js will serialize into proper HTTP responses.
 *
 * Note: These tests validate the endpoint behavior with current environment
 * settings. For production validation, ensure NEXT_PUBLIC_SITE_URL is set.
 */

import robots from '../../app/robots';
import sitemap from '../../app/sitemap';

describe('SEO Endpoints Integration Tests', () => {
  describe('/robots.txt endpoint', () => {
    it('returns correct structure for robots.txt', () => {
      const result = robots();

      expect(result).toHaveProperty('rules');
      expect(result.rules).toEqual({
        userAgent: '*',
        allow: '/',
      });
      expect(result).toHaveProperty('sitemap');
      expect(typeof result.sitemap).toBe('string');
      expect(result.sitemap).toMatch(/^https?:\/\/.+\/sitemap\.xml$/);
    });

    it('includes sitemap URL with correct format', () => {
      const result = robots();

      expect(result.sitemap).toContain('/sitemap.xml');
      expect(result.sitemap).toMatch(/^https?:\/\//);
    });

    it('allows all user agents to crawl', () => {
      const result = robots();

      expect(result.rules.userAgent).toBe('*');
      expect(result.rules.allow).toBe('/');
    });
  });

  describe('/sitemap.xml endpoint', () => {
    it('returns array of URL entries', async () => {
      const result = await sitemap();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns correct structure for sitemap entries', async () => {
      const result = await sitemap();
      const entry = result[0];

      expect(entry).toHaveProperty('url');
      expect(entry).toHaveProperty('lastModified');
      expect(entry).toHaveProperty('changeFrequency');
      expect(entry).toHaveProperty('priority');

      expect(typeof entry.url).toBe('string');
      expect(entry.url).toMatch(/^https?:\/\//);
      expect(entry.changeFrequency).toBe('monthly');
      expect(entry.priority).toBe(1);
    });

    it('returns valid ISO date for lastModified', async () => {
      const result = await sitemap();
      const entry = result[0];

      // Should be a valid ISO date string
      const date = new Date(entry.lastModified);
      expect(date.toISOString()).toBe(entry.lastModified);
      expect(date.toString()).not.toBe('Invalid Date');
    });

    it('includes all required sitemap fields', async () => {
      const result = await sitemap();

      result.forEach((entry) => {
        expect(entry.url).toBeDefined();
        expect(entry.lastModified).toBeDefined();
        expect(entry.changeFrequency).toBeDefined();
        expect(entry.priority).toBeDefined();
      });
    });
  });

  describe('Next.js serialization compatibility', () => {
    it('robots() returns Next.js MetadataRoute.Robots compatible structure', () => {
      const result = robots();

      // Check that the structure matches what Next.js expects
      expect(result).toHaveProperty('rules');
      expect(result).toHaveProperty('sitemap');
      expect(result.rules).toHaveProperty('userAgent');
      expect(result.rules).toHaveProperty('allow');
      expect(typeof result.sitemap).toBe('string');
    });

    it('sitemap() returns Next.js MetadataRoute.Sitemap compatible structure', async () => {
      const result = await sitemap();

      // Check that the structure matches what Next.js expects
      expect(Array.isArray(result)).toBe(true);
      result.forEach((entry) => {
        expect(entry).toHaveProperty('url');
        expect(entry).toHaveProperty('lastModified');
        expect(entry).toHaveProperty('changeFrequency');
        expect(entry).toHaveProperty('priority');
        expect(typeof entry.url).toBe('string');
        expect(typeof entry.lastModified).toBe('string');
        expect(typeof entry.changeFrequency).toBe('string');
        expect(typeof entry.priority).toBe('number');
      });
    });
  });

  describe('URL structure validation', () => {
    it('robots.txt sitemap URL is absolute', () => {
      const result = robots();

      // URL should be absolute (start with http:// or https://)
      expect(result.sitemap).toMatch(/^https?:\/\//);
    });

    it('sitemap.xml URLs are absolute', async () => {
      const result = await sitemap();

      result.forEach((entry) => {
        expect(entry.url).toMatch(/^https?:\/\//);
      });
    });

    it('sitemap.xml uses consistent domain', async () => {
      const result = await sitemap();
      const robots_result = robots();

      // Extract domain from sitemap URL in robots.txt
      const robotsSitemapDomain = new URL(robots_result.sitemap).origin;

      // All sitemap entries should use the same domain
      result.forEach((entry) => {
        const entryDomain = new URL(entry.url).origin;
        expect(entryDomain).toBe(robotsSitemapDomain);
      });
    });
  });
});
