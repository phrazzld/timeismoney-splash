/**
 * SEO metadata configuration and utilities
 *
 * This module provides comprehensive SEO metadata generation and management
 * for the Time is Money marketing site, including support for:
 * - Base HTML meta tags
 * - Open Graph metadata for social sharing
 * - Twitter Card metadata
 * - JSON-LD structured data (schema.org)
 * - Next.js metadata API integration
 */

export {
  generateDefaultMetadata,
  mergePageMetadata,
  toNextMetadata,
  type BaseMetadata,
  type OpenGraphMetadata,
  type TwitterCardMetadata,
  type MetadataConfig,
  type PageMetadata,
} from './metadata';

export {
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
  type OrganizationSchema,
  type WebSiteSchema,
} from './structured-data';
