import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from '../seo-config';

/**
 * Contact point for organization schema
 */
export interface ContactPoint {
  readonly '@type': 'ContactPoint';
  readonly telephone?: string;
  readonly contactType?: string;
  readonly email?: string;
  readonly url?: string;
}

/**
 * Postal address for organization schema
 */
export interface PostalAddress {
  readonly '@type': 'PostalAddress';
  readonly streetAddress?: string;
  readonly addressLocality?: string;
  readonly addressRegion?: string;
  readonly postalCode?: string;
  readonly addressCountry?: string;
}

/**
 * Organization data for schema.org structured data
 */
export interface OrganizationData {
  readonly name?: string;
  readonly url?: string;
  readonly description?: string;
  readonly logo?: string;
  readonly foundingDate?: string;
  readonly contactPoint?: ContactPoint;
  readonly address?: PostalAddress;
  readonly sameAs?: readonly string[];
}

/**
 * Search action for website schema
 */
export interface SearchAction {
  readonly '@type': 'SearchAction';
  readonly target: string;
  readonly 'query-input': string;
}

/**
 * Website data for schema.org structured data
 */
export interface WebSiteData {
  readonly name?: string;
  readonly url?: string;
  readonly description?: string;
  readonly potentialAction?: SearchAction;
}

/**
 * Organization schema.org JSON-LD structure
 */
export interface OrganizationSchema {
  readonly '@context': 'https://schema.org';
  readonly '@type': 'Organization';
  readonly '@id'?: string;
  readonly name: string;
  readonly url: string;
  readonly description?: string;
  readonly logo?: string;
  readonly foundingDate?: string;
  readonly contactPoint?: ContactPoint;
  readonly address?: PostalAddress;
  readonly sameAs?: readonly string[];
}

/**
 * Website schema.org JSON-LD structure
 */
export interface WebSiteSchema {
  readonly '@context': 'https://schema.org';
  readonly '@type': 'WebSite';
  readonly '@id'?: string;
  readonly name: string;
  readonly url: string;
  readonly description?: string;
  readonly potentialAction?: SearchAction;
}

/**
 * Generates schema.org compliant Organization JSON-LD
 * @param data - Organization data overrides
 * @returns Organization schema object
 */
export function generateOrganizationSchema(data: OrganizationData = {}): OrganizationSchema {
  const baseUrl = SITE_URL;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}#organization`,
    name: data.name ?? SITE_NAME,
    url: data.url ?? baseUrl,
    description: data.description ?? SITE_DESCRIPTION,
    ...(data.logo && { logo: data.logo }),
    ...(data.foundingDate && { foundingDate: data.foundingDate }),
    ...(data.contactPoint && { contactPoint: data.contactPoint }),
    ...(data.address && { address: data.address }),
    ...(data.sameAs && data.sameAs.length > 0 && { sameAs: data.sameAs }),
  };
}

/**
 * Generates schema.org compliant WebSite JSON-LD
 * @param data - Website data overrides
 * @returns Website schema object
 */
export function generateWebSiteSchema(data: WebSiteData = {}): WebSiteSchema {
  const baseUrl = SITE_URL;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}#website`,
    name: data.name ?? SITE_NAME,
    url: data.url ?? baseUrl,
    description: data.description ?? SITE_DESCRIPTION,
    ...(data.potentialAction && { potentialAction: data.potentialAction }),
  };
}

/**
 * Validates that a schema object has required properties
 * @param schema - Schema object to validate
 * @param requiredProps - Array of required property names
 * @returns True if all required properties are present
 */
export function validateSchema(
  schema: Record<string, unknown>,
  requiredProps: readonly string[] = ['@context', '@type'],
): boolean {
  return requiredProps.every((prop) => {
    const value = schema[prop];
    return value !== undefined && value !== null && value !== '';
  });
}

/**
 * Safely serializes schema data to JSON-LD string
 * @param schema - Schema object to serialize
 * @returns JSON-LD string safe for HTML injection
 */
export function serializeJsonLd(schema: Record<string, unknown>): string {
  try {
    return JSON.stringify(schema, null, 2);
  } catch (error) {
    console.error('Failed to serialize JSON-LD schema:', error);
    return '{}';
  }
}

/**
 * Generates a complete JSON-LD script tag string
 * @param schema - Schema object to include in script
 * @returns Complete script tag as string
 */
export function generateJsonLdScript(schema: Record<string, unknown>): string {
  if (!validateSchema(schema)) {
    console.warn('Schema validation failed for JSON-LD generation');
    return '';
  }

  const jsonLd = serializeJsonLd(schema);
  return `<script type="application/ld+json">${jsonLd}</script>`;
}

/**
 * Creates a search action for website schema
 * @param searchUrl - Base search URL (e.g., "/search")
 * @param queryParam - Query parameter name (default: "q")
 * @returns SearchAction object
 */
export function createSearchAction(
  searchUrl: string = '/search',
  queryParam: string = 'q',
): SearchAction {
  const baseUrl = SITE_URL.replace(/\/$/, ''); // Remove trailing slash
  const target = `${baseUrl}${searchUrl}?${queryParam}={search_term_string}`;

  return {
    '@type': 'SearchAction',
    target,
    'query-input': `required name=${queryParam}`,
  };
}
