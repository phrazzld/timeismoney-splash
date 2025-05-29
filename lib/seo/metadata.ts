import { SITE_NAME, SITE_URL, SITE_DESCRIPTION, TITLE_TEMPLATE } from '../seo-config';

/**
 * Base metadata structure for SEO
 */
export interface BaseMetadata {
  readonly title: string;
  readonly description: string;
  readonly canonical?: string;
  readonly robots?: string;
}

/**
 * Open Graph metadata structure
 */
export interface OpenGraphMetadata {
  readonly 'og:title': string;
  readonly 'og:description': string;
  readonly 'og:url': string;
  readonly 'og:type': string;
  readonly 'og:site_name': string;
  readonly 'og:image'?: string;
  readonly 'og:image:alt'?: string;
  readonly 'og:image:width'?: string;
  readonly 'og:image:height'?: string;
}

/**
 * Twitter Card metadata structure
 */
export interface TwitterCardMetadata {
  readonly 'twitter:card': 'summary' | 'summary_large_image' | 'app' | 'player';
  readonly 'twitter:title': string;
  readonly 'twitter:description': string;
  readonly 'twitter:image'?: string;
  readonly 'twitter:image:alt'?: string;
  readonly 'twitter:site'?: string;
  readonly 'twitter:creator'?: string;
}

/**
 * Complete metadata configuration
 */
export interface MetadataConfig {
  readonly base: BaseMetadata;
  readonly openGraph: OpenGraphMetadata;
  readonly twitter: TwitterCardMetadata;
}

/**
 * Page-specific metadata overrides
 */
export interface PageMetadata {
  readonly title?: string;
  readonly description?: string;
  readonly canonical?: string;
  readonly robots?: string;
  readonly image?: string;
  readonly imageAlt?: string;
}

/**
 * Generates default metadata configuration for the site
 * @returns Complete default metadata configuration
 */
export function generateDefaultMetadata(): MetadataConfig {
  const baseUrl = SITE_URL;

  return {
    base: {
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      canonical: baseUrl,
      robots: 'index, follow',
    },
    openGraph: {
      'og:title': SITE_NAME,
      'og:description': SITE_DESCRIPTION,
      'og:url': baseUrl,
      'og:type': 'website',
      'og:site_name': SITE_NAME,
    },
    twitter: {
      'twitter:card': 'summary_large_image',
      'twitter:title': SITE_NAME,
      'twitter:description': SITE_DESCRIPTION,
    },
  };
}

/**
 * Merges page-specific metadata with default metadata
 * @param pageMetadata - Page-specific metadata overrides
 * @param path - Optional page path for canonical URL generation
 * @returns Merged metadata configuration
 */
export function mergePageMetadata(pageMetadata: PageMetadata, path?: string): MetadataConfig {
  const defaults = generateDefaultMetadata();
  const baseUrl = SITE_URL;
  const canonicalUrl = path ? `${baseUrl}${path}` : defaults.base.canonical;

  // Format title using template if page title provided
  const pageTitle = pageMetadata.title
    ? TITLE_TEMPLATE.replace('%s', pageMetadata.title)
    : defaults.base.title;

  return {
    base: {
      title: pageTitle,
      description: pageMetadata.description ?? defaults.base.description,
      canonical: pageMetadata.canonical ?? canonicalUrl,
      robots: pageMetadata.robots ?? defaults.base.robots,
    },
    openGraph: {
      ...defaults.openGraph,
      'og:title': pageTitle,
      'og:description': pageMetadata.description ?? defaults.openGraph['og:description'],
      'og:url': pageMetadata.canonical ?? canonicalUrl ?? defaults.openGraph['og:url'],
      'og:image': pageMetadata.image,
      'og:image:alt': pageMetadata.imageAlt,
    },
    twitter: {
      ...defaults.twitter,
      'twitter:title': pageTitle,
      'twitter:description': pageMetadata.description ?? defaults.twitter['twitter:description'],
      'twitter:image': pageMetadata.image,
      'twitter:image:alt': pageMetadata.imageAlt,
    },
  };
}

/**
 * Converts metadata config to Next.js metadata format
 * @param metadata - Metadata configuration
 * @returns Next.js compatible metadata object
 */
export function toNextMetadata(metadata: MetadataConfig): Record<string, unknown> {
  return {
    title: metadata.base.title,
    description: metadata.base.description,
    robots: metadata.base.robots,
    alternates: {
      canonical: metadata.base.canonical,
    },
    openGraph: {
      title: metadata.openGraph['og:title'],
      description: metadata.openGraph['og:description'],
      url: metadata.openGraph['og:url'],
      type: metadata.openGraph['og:type'],
      siteName: metadata.openGraph['og:site_name'],
      ...(metadata.openGraph['og:image'] && {
        images: [
          {
            url: metadata.openGraph['og:image'],
            alt: metadata.openGraph['og:image:alt'],
            ...(metadata.openGraph['og:image:width'] && {
              width: parseInt(metadata.openGraph['og:image:width'], 10),
            }),
            ...(metadata.openGraph['og:image:height'] && {
              height: parseInt(metadata.openGraph['og:image:height'], 10),
            }),
          },
        ],
      }),
    },
    twitter: {
      card: metadata.twitter['twitter:card'],
      title: metadata.twitter['twitter:title'],
      description: metadata.twitter['twitter:description'],
      ...(metadata.twitter['twitter:image'] && {
        images: [
          {
            url: metadata.twitter['twitter:image'],
            alt: metadata.twitter['twitter:image:alt'],
          },
        ],
      }),
      ...(metadata.twitter['twitter:site'] && { site: metadata.twitter['twitter:site'] }),
      ...(metadata.twitter['twitter:creator'] && { creator: metadata.twitter['twitter:creator'] }),
    },
  };
}
