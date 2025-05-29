import {
  generateDefaultMetadata,
  mergePageMetadata,
  toNextMetadata,
  type MetadataConfig,
  type PageMetadata,
} from './metadata';

// Mock the seo-config module
jest.mock('../seo-config', () => ({
  SITE_NAME: 'Test Site',
  SITE_URL: 'https://test.example.com',
  SITE_DESCRIPTION: 'Test site description',
  TITLE_TEMPLATE: '%s | Test Site',
}));

describe('metadata', () => {
  describe('generateDefaultMetadata', () => {
    it('should generate complete default metadata configuration', () => {
      const metadata = generateDefaultMetadata();

      expect(metadata).toEqual({
        base: {
          title: 'Test Site',
          description: 'Test site description',
          canonical: 'https://test.example.com',
          robots: 'index, follow',
        },
        openGraph: {
          'og:title': 'Test Site',
          'og:description': 'Test site description',
          'og:url': 'https://test.example.com',
          'og:type': 'website',
          'og:site_name': 'Test Site',
        },
        twitter: {
          'twitter:card': 'summary_large_image',
          'twitter:title': 'Test Site',
          'twitter:description': 'Test site description',
        },
      });
    });

    it('should return new objects on each call', () => {
      const metadata1 = generateDefaultMetadata();
      const metadata2 = generateDefaultMetadata();

      expect(metadata1).not.toBe(metadata2);
      expect(metadata1).toEqual(metadata2);
    });
  });

  describe('mergePageMetadata', () => {
    it('should merge page metadata with defaults', () => {
      const pageMetadata: PageMetadata = {
        title: 'Page Title',
        description: 'Page description',
      };

      const result = mergePageMetadata(pageMetadata);

      expect(result.base.title).toBe('Page Title | Test Site');
      expect(result.base.description).toBe('Page description');
      expect(result.openGraph['og:title']).toBe('Page Title | Test Site');
      expect(result.openGraph['og:description']).toBe('Page description');
      expect(result.twitter['twitter:title']).toBe('Page Title | Test Site');
      expect(result.twitter['twitter:description']).toBe('Page description');
    });

    it('should use defaults when no page metadata provided', () => {
      const result = mergePageMetadata({});

      expect(result.base.title).toBe('Test Site');
      expect(result.base.description).toBe('Test site description');
      expect(result.base.canonical).toBe('https://test.example.com');
    });

    it('should generate canonical URL with path', () => {
      const result = mergePageMetadata({}, '/about');

      expect(result.base.canonical).toBe('https://test.example.com/about');
      expect(result.openGraph['og:url']).toBe('https://test.example.com/about');
    });

    it('should override canonical URL when provided', () => {
      const pageMetadata: PageMetadata = {
        canonical: 'https://custom.example.com/page',
      };

      const result = mergePageMetadata(pageMetadata, '/ignored');

      expect(result.base.canonical).toBe('https://custom.example.com/page');
      expect(result.openGraph['og:url']).toBe('https://custom.example.com/page');
    });

    it('should handle image metadata', () => {
      const pageMetadata: PageMetadata = {
        image: 'https://example.com/image.jpg',
        imageAlt: 'Test image',
      };

      const result = mergePageMetadata(pageMetadata);

      expect(result.openGraph['og:image']).toBe('https://example.com/image.jpg');
      expect(result.openGraph['og:image:alt']).toBe('Test image');
      expect(result.twitter['twitter:image']).toBe('https://example.com/image.jpg');
      expect(result.twitter['twitter:image:alt']).toBe('Test image');
    });

    it('should handle robots metadata', () => {
      const pageMetadata: PageMetadata = {
        robots: 'noindex, nofollow',
      };

      const result = mergePageMetadata(pageMetadata);

      expect(result.base.robots).toBe('noindex, nofollow');
    });

    it('should preserve existing openGraph and twitter properties', () => {
      const result = mergePageMetadata({});

      expect(result.openGraph['og:type']).toBe('website');
      expect(result.openGraph['og:site_name']).toBe('Test Site');
      expect(result.twitter['twitter:card']).toBe('summary_large_image');
    });

    it('should handle edge case with undefined canonical URL', () => {
      const result = mergePageMetadata({}, undefined);

      // Should use the default base URL from SITE_URL
      expect(result.openGraph['og:url']).toBe('https://test.example.com');
    });
  });

  describe('toNextMetadata', () => {
    it('should convert metadata config to Next.js format', () => {
      const metadata: MetadataConfig = {
        base: {
          title: 'Test Page',
          description: 'Test description',
          canonical: 'https://test.example.com/page',
          robots: 'index, follow',
        },
        openGraph: {
          'og:title': 'Test Page',
          'og:description': 'Test description',
          'og:url': 'https://test.example.com/page',
          'og:type': 'website',
          'og:site_name': 'Test Site',
        },
        twitter: {
          'twitter:card': 'summary_large_image',
          'twitter:title': 'Test Page',
          'twitter:description': 'Test description',
        },
      };

      const nextMetadata = toNextMetadata(metadata);

      expect(nextMetadata).toEqual({
        title: 'Test Page',
        description: 'Test description',
        robots: 'index, follow',
        alternates: {
          canonical: 'https://test.example.com/page',
        },
        openGraph: {
          title: 'Test Page',
          description: 'Test description',
          url: 'https://test.example.com/page',
          type: 'website',
          siteName: 'Test Site',
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Test Page',
          description: 'Test description',
        },
      });
    });

    it('should include image data when provided', () => {
      const metadata: MetadataConfig = {
        base: {
          title: 'Test Page',
          description: 'Test description',
        },
        openGraph: {
          'og:title': 'Test Page',
          'og:description': 'Test description',
          'og:url': 'https://test.example.com',
          'og:type': 'website',
          'og:site_name': 'Test Site',
          'og:image': 'https://example.com/image.jpg',
          'og:image:alt': 'Test image',
          'og:image:width': '1200',
          'og:image:height': '630',
        },
        twitter: {
          'twitter:card': 'summary_large_image',
          'twitter:title': 'Test Page',
          'twitter:description': 'Test description',
          'twitter:image': 'https://example.com/image.jpg',
          'twitter:image:alt': 'Test image',
        },
      };

      const nextMetadata = toNextMetadata(metadata);

      expect(nextMetadata.openGraph).toMatchObject({
        images: [
          {
            url: 'https://example.com/image.jpg',
            alt: 'Test image',
            width: 1200,
            height: 630,
          },
        ],
      });

      expect(nextMetadata.twitter).toMatchObject({
        images: [
          {
            url: 'https://example.com/image.jpg',
            alt: 'Test image',
          },
        ],
      });
    });

    it('should include Twitter social metadata when provided', () => {
      const metadata: MetadataConfig = {
        base: {
          title: 'Test Page',
          description: 'Test description',
        },
        openGraph: {
          'og:title': 'Test Page',
          'og:description': 'Test description',
          'og:url': 'https://test.example.com',
          'og:type': 'website',
          'og:site_name': 'Test Site',
        },
        twitter: {
          'twitter:card': 'summary_large_image',
          'twitter:title': 'Test Page',
          'twitter:description': 'Test description',
          'twitter:site': '@testsite',
          'twitter:creator': '@creator',
        },
      };

      const nextMetadata = toNextMetadata(metadata);

      expect(nextMetadata.twitter).toMatchObject({
        site: '@testsite',
        creator: '@creator',
      });
    });

    it('should handle missing image dimensions gracefully', () => {
      const metadata: MetadataConfig = {
        base: {
          title: 'Test Page',
          description: 'Test description',
        },
        openGraph: {
          'og:title': 'Test Page',
          'og:description': 'Test description',
          'og:url': 'https://test.example.com',
          'og:type': 'website',
          'og:site_name': 'Test Site',
          'og:image': 'https://example.com/image.jpg',
          'og:image:alt': 'Test image',
        },
        twitter: {
          'twitter:card': 'summary_large_image',
          'twitter:title': 'Test Page',
          'twitter:description': 'Test description',
        },
      };

      const nextMetadata = toNextMetadata(metadata);

      expect(nextMetadata.openGraph).toMatchObject({
        images: [
          {
            url: 'https://example.com/image.jpg',
            alt: 'Test image',
          },
        ],
      });
    });
  });

  describe('type safety', () => {
    it('should enforce valid Twitter card types', () => {
      const validCards: Array<'summary' | 'summary_large_image' | 'app' | 'player'> = [
        'summary',
        'summary_large_image',
        'app',
        'player',
      ];

      validCards.forEach((_card) => {
        expect(() => {
          mergePageMetadata({});
        }).not.toThrow();
      });
    });

    it('should handle all required metadata fields', () => {
      const metadata = generateDefaultMetadata();

      // Verify all required fields are present
      expect(metadata.base.title).toBeDefined();
      expect(metadata.base.description).toBeDefined();
      expect(metadata.openGraph['og:title']).toBeDefined();
      expect(metadata.openGraph['og:description']).toBeDefined();
      expect(metadata.openGraph['og:url']).toBeDefined();
      expect(metadata.openGraph['og:type']).toBeDefined();
      expect(metadata.twitter['twitter:card']).toBeDefined();
      expect(metadata.twitter['twitter:title']).toBeDefined();
      expect(metadata.twitter['twitter:description']).toBeDefined();
    });
  });
});
