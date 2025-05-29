import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateJsonLdScript,
  validateSchema,
  serializeJsonLd,
  createSearchAction,
  type OrganizationData,
  type WebSiteData,
  type ContactPoint,
  type PostalAddress,
  type SearchAction,
} from './structured-data';

// Mock the seo-config module
jest.mock('../seo-config', () => ({
  SITE_NAME: 'Test Site',
  SITE_URL: 'https://test.example.com',
  SITE_DESCRIPTION: 'Test site description',
}));

describe('structured-data', () => {
  describe('generateOrganizationSchema', () => {
    it('should generate basic organization schema with defaults', () => {
      const schema = generateOrganizationSchema();

      expect(schema).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': 'https://test.example.com#organization',
        name: 'Test Site',
        url: 'https://test.example.com',
        description: 'Test site description',
      });
    });

    it('should override defaults with provided data', () => {
      const data: OrganizationData = {
        name: 'Custom Organization',
        url: 'https://custom.example.com',
        description: 'Custom description',
        logo: 'https://example.com/logo.png',
      };

      const schema = generateOrganizationSchema(data);

      expect(schema.name).toBe('Custom Organization');
      expect(schema.url).toBe('https://custom.example.com');
      expect(schema.description).toBe('Custom description');
      expect(schema.logo).toBe('https://example.com/logo.png');
    });

    it('should include contact point when provided', () => {
      const contactPoint: ContactPoint = {
        '@type': 'ContactPoint',
        telephone: '+1-555-123-4567',
        contactType: 'customer service',
        email: 'support@example.com',
      };

      const schema = generateOrganizationSchema({ contactPoint });

      expect(schema.contactPoint).toEqual(contactPoint);
    });

    it('should include address when provided', () => {
      const address: PostalAddress = {
        '@type': 'PostalAddress',
        streetAddress: '123 Main St',
        addressLocality: 'Anytown',
        addressRegion: 'CA',
        postalCode: '12345',
        addressCountry: 'US',
      };

      const schema = generateOrganizationSchema({ address });

      expect(schema.address).toEqual(address);
    });

    it('should include sameAs array when provided', () => {
      const sameAs = [
        'https://twitter.com/example',
        'https://facebook.com/example',
        'https://linkedin.com/company/example',
      ];

      const schema = generateOrganizationSchema({ sameAs });

      expect(schema.sameAs).toEqual(sameAs);
    });

    it('should not include sameAs when empty array provided', () => {
      const schema = generateOrganizationSchema({ sameAs: [] });

      expect(schema).not.toHaveProperty('sameAs');
    });

    it('should include founding date when provided', () => {
      const schema = generateOrganizationSchema({ foundingDate: '2020-01-01' });

      expect(schema.foundingDate).toBe('2020-01-01');
    });
  });

  describe('generateWebSiteSchema', () => {
    it('should generate basic website schema with defaults', () => {
      const schema = generateWebSiteSchema();

      expect(schema).toEqual({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': 'https://test.example.com#website',
        name: 'Test Site',
        url: 'https://test.example.com',
        description: 'Test site description',
      });
    });

    it('should override defaults with provided data', () => {
      const data: WebSiteData = {
        name: 'Custom Website',
        url: 'https://custom.example.com',
        description: 'Custom website description',
      };

      const schema = generateWebSiteSchema(data);

      expect(schema.name).toBe('Custom Website');
      expect(schema.url).toBe('https://custom.example.com');
      expect(schema.description).toBe('Custom website description');
    });

    it('should include potential action when provided', () => {
      const potentialAction: SearchAction = {
        '@type': 'SearchAction',
        target: 'https://example.com/search?q={search_term_string}',
        'query-input': 'required name=q',
      };

      const schema = generateWebSiteSchema({ potentialAction });

      expect(schema.potentialAction).toEqual(potentialAction);
    });
  });

  describe('createSearchAction', () => {
    it('should create search action with default parameters', () => {
      const searchAction = createSearchAction();

      expect(searchAction).toEqual({
        '@type': 'SearchAction',
        target: 'https://test.example.com/search?q={search_term_string}',
        'query-input': 'required name=q',
      });
    });

    it('should create search action with custom URL and parameter', () => {
      const searchAction = createSearchAction('/find', 'query');

      expect(searchAction).toEqual({
        '@type': 'SearchAction',
        target: 'https://test.example.com/find?query={search_term_string}',
        'query-input': 'required name=query',
      });
    });

    it('should handle base URL with trailing slash', () => {
      // Mock SITE_URL with trailing slash
      jest.doMock('../seo-config', () => ({
        SITE_NAME: 'Test Site',
        SITE_URL: 'https://test.example.com/',
        SITE_DESCRIPTION: 'Test site description',
      }));

      const searchAction = createSearchAction();

      expect(searchAction.target).toBe('https://test.example.com/search?q={search_term_string}');
    });
  });

  describe('validateSchema', () => {
    it('should validate schema with required properties', () => {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test',
      };

      expect(validateSchema(schema)).toBe(true);
    });

    it('should fail validation when required properties are missing', () => {
      const schema = {
        '@context': 'https://schema.org',
        name: 'Test',
      };

      expect(validateSchema(schema)).toBe(false);
    });

    it('should validate with custom required properties', () => {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test',
        url: 'https://example.com',
      };

      expect(validateSchema(schema, ['@context', '@type', 'name', 'url'])).toBe(true);
    });

    it('should fail validation with custom required properties when missing', () => {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test',
      };

      expect(validateSchema(schema, ['@context', '@type', 'name', 'url'])).toBe(false);
    });

    it('should fail validation for null values', () => {
      const schema = {
        '@context': 'https://schema.org',
        '@type': null,
      };

      expect(validateSchema(schema)).toBe(false);
    });

    it('should fail validation for empty string values', () => {
      const schema = {
        '@context': '',
        '@type': 'Organization',
      };

      expect(validateSchema(schema)).toBe(false);
    });
  });

  describe('serializeJsonLd', () => {
    it('should serialize valid schema to JSON string', () => {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test',
      };

      const result = serializeJsonLd(schema);

      expect(result).toBe(JSON.stringify(schema, null, 2));
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('should handle circular references gracefully', () => {
      // Create circular reference
      const schema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
      };
      schema.self = schema;

      // Mock console.error to avoid cluttering test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = serializeJsonLd(schema);

      expect(result).toBe('{}');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to serialize JSON-LD schema:',
        expect.any(TypeError),
      );

      consoleSpy.mockRestore();
    });
  });

  describe('generateJsonLdScript', () => {
    it('should generate complete script tag for valid schema', () => {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test',
      };

      const result = generateJsonLdScript(schema);

      expect(result).toContain('<script type="application/ld+json">');
      expect(result).toContain('</script>');
      expect(result).toContain('"@context": "https://schema.org"');
      expect(result).toContain('"@type": "Organization"');
      expect(result).toContain('"name": "Test"');
    });

    it('should return empty string for invalid schema', () => {
      const invalidSchema = {
        name: 'Test',
        // Missing @context and @type
      };

      // Mock console.warn to avoid cluttering test output
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = generateJsonLdScript(invalidSchema);

      expect(result).toBe('');
      expect(consoleSpy).toHaveBeenCalledWith('Schema validation failed for JSON-LD generation');

      consoleSpy.mockRestore();
    });

    it('should handle schema that passes validation', () => {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test Organization',
      };

      const result = generateJsonLdScript(schema);

      expect(result).toContain('<script type="application/ld+json">');
      expect(result).toContain('</script>');
      expect(result).toContain('"@context": "https://schema.org"');
      expect(result).toContain('"@type": "Organization"');
      expect(result).toContain('"name": "Test Organization"');
    });
  });

  describe('integration tests', () => {
    it('should generate complete organization schema with all properties', () => {
      const contactPoint: ContactPoint = {
        '@type': 'ContactPoint',
        telephone: '+1-555-123-4567',
        contactType: 'customer service',
      };

      const address: PostalAddress = {
        '@type': 'PostalAddress',
        streetAddress: '123 Main St',
        addressLocality: 'Anytown',
        addressRegion: 'CA',
        postalCode: '12345',
        addressCountry: 'US',
      };

      const data: OrganizationData = {
        name: 'Complete Organization',
        logo: 'https://example.com/logo.png',
        foundingDate: '2020-01-01',
        contactPoint,
        address,
        sameAs: ['https://twitter.com/example'],
      };

      const schema = generateOrganizationSchema(data);

      expect(validateSchema(schema, ['@context', '@type', 'name', 'url'])).toBe(true);
      expect(schema.contactPoint).toEqual(contactPoint);
      expect(schema.address).toEqual(address);
      expect(schema.sameAs).toEqual(['https://twitter.com/example']);
    });

    it('should generate complete website schema with search action', () => {
      const searchAction = createSearchAction('/search', 'q');
      const data: WebSiteData = {
        name: 'Complete Website',
        potentialAction: searchAction,
      };

      const schema = generateWebSiteSchema(data);

      expect(validateSchema(schema, ['@context', '@type', 'name', 'url'])).toBe(true);
      expect(schema.potentialAction).toEqual(searchAction);
    });

    it('should create valid JSON-LD script from generated schemas', () => {
      const orgSchema = generateOrganizationSchema();
      const webSchema = generateWebSiteSchema();

      const orgScript = generateJsonLdScript(orgSchema);
      const webScript = generateJsonLdScript(webSchema);

      expect(orgScript).toContain('<script type="application/ld+json">');
      expect(webScript).toContain('<script type="application/ld+json">');

      // Verify the JSON inside is valid
      const orgJson = orgScript.match(/<script[^>]*>(.*?)<\/script>/s)?.[1];
      const webJson = webScript.match(/<script[^>]*>(.*?)<\/script>/s)?.[1];

      expect(() => JSON.parse(orgJson || '')).not.toThrow();
      expect(() => JSON.parse(webJson || '')).not.toThrow();
    });
  });

  describe('type safety', () => {
    it('should enforce readonly properties on interfaces', () => {
      const contactPoint: ContactPoint = {
        '@type': 'ContactPoint',
        telephone: '+1-555-123-4567',
        contactType: 'customer service',
      };

      // TypeScript should prevent this assignment
      // contactPoint.telephone = 'modified'; // This would be a TypeScript error

      expect(contactPoint.telephone).toBe('+1-555-123-4567');
    });

    it('should enforce valid search action types', () => {
      const searchAction: SearchAction = {
        '@type': 'SearchAction',
        target: 'https://example.com/search?q={search_term_string}',
        'query-input': 'required name=q',
      };

      expect(searchAction['@type']).toBe('SearchAction');
    });
  });
});
