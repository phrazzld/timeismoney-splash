/**
 * SEO metadata configuration and utilities
 *
 * This module provides comprehensive SEO metadata generation and management
 * for the Time is Money marketing site, including support for:
 * - Base HTML meta tags
 * - Open Graph metadata for social sharing
 * - Twitter Card metadata
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
