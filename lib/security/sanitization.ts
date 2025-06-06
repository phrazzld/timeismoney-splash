/**
 * Simple HTML tag removal using regex for server-side sanitization
 * This is a fallback when DOMPurify is not available
 */
function simpleStripTags(input: string): string {
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&lt;script[^&]*&gt;.*?&lt;\/script&gt;/gi, '') // Remove encoded script tags
    .trim();
}

/**
 * Simple HTML sanitization for allowed tags
 */
function simpleHtmlSanitize(input: string): string {
  // Remove dangerous tags first
  let sanitized = input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*.*?>/gi, '')
    .replace(/<link[^>]*.*?>/gi, '')
    .replace(/<meta[^>]*.*?>/gi, '')
    .replace(/<base[^>]*.*?>/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Keep only safe tags by removing all others except the allowed ones
  const allowedTags = [
    'p',
    'br',
    'strong',
    'em',
    'b',
    'i',
    'u',
    'span',
    'div',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'a',
    'img',
    'blockquote',
    'code',
    'pre',
  ];
  const tagPattern = /<(\/?)([\w]+)([^>]*)>/g;

  return sanitized.replace(tagPattern, (match, slash, tagName, attributes) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      // Keep allowed tags but sanitize attributes
      const cleanAttributes = attributes.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
      return `<${slash}${tagName}${cleanAttributes}>`;
    }
    return ''; // Remove disallowed tags
  });
}

interface SanitizeOptions {
  ALLOWED_TAGS?: string[];
  ALLOWED_ATTR?: string[];
  KEEP_CONTENT?: boolean;
  ALLOWED_URI_REGEXP?: RegExp;
  FORBID_TAGS?: string[];
  FORBID_ATTR?: string[];
}

interface PurifyInstance {
  sanitize: (input: string, options?: SanitizeOptions) => string;
}

// DOMPurify setup with fallback

// Use simple fallback for server-side since DOMPurify requires browser environment
const purify: PurifyInstance = {
  sanitize: (input: string, options?: SanitizeOptions): string => {
    if (options?.ALLOWED_TAGS?.length === 0) {
      return simpleStripTags(input);
    }
    return simpleHtmlSanitize(input);
  },
};

/**
 * Maximum length for metadata fields to prevent abuse
 */
const MAX_METADATA_LENGTH = 500;

/**
 * Patterns that indicate potentially malicious content
 */
const SUSPICIOUS_PATTERNS = [
  /javascript:/i,
  /data:text\/html/i,
  /vbscript:/i,
  /on\w+\s*=/i, // Event handlers like onclick, onload, etc.
  /<script/i,
  /<iframe/i,
  /<object/i,
  /<embed/i,
  /<link/i,
  /<meta\s+http-equiv/i,
  /<base/i,
  /eval\s*\(/i,
  /expression\s*\(/i,
];

/**
 * Sanitizes metadata content by removing all HTML tags and dangerous content
 *
 * @param input - The input string to sanitize
 * @returns Sanitized string safe for use in meta tags
 */
export function sanitizeMetadata(input: string | null | undefined): string {
  if (!input) {
    return '';
  }

  // Handle URL-encoded and HTML entity-encoded content first
  let sanitized = input;
  try {
    // Decode URL-encoded content to catch encoded XSS attempts
    if (sanitized.includes('%')) {
      sanitized = decodeURIComponent(sanitized);
    }

    // Decode HTML entities to catch entity-encoded XSS attempts
    if (sanitized.includes('&#')) {
      sanitized = sanitized
        .replace(/&#60;/g, '<')
        .replace(/&#62;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&#34;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x22;/g, '"')
        .replace(/&#x3C;/g, '<')
        .replace(/&#x3E;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
    }
  } catch {
    // If decoding fails, continue with original string
  }

  // First pass: Remove all HTML tags and get text content only
  sanitized = purify.sanitize(sanitized, {
    ALLOWED_TAGS: [], // No HTML tags allowed in metadata
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true, // Keep text content
  });

  // Remove data URLs completely from metadata (before other processing)
  sanitized = sanitized.replace(/data:[^,\s]*,?[^,\s]*/gi, '');

  // Remove any remaining suspicious patterns
  SUSPICIOUS_PATTERNS.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Remove common XSS function calls
  sanitized = sanitized
    .replace(/alert\s*\([^)]*\)/gi, '')
    .replace(/eval\s*\([^)]*\)/gi, '')
    .replace(/expression\s*\([^)]*\)/gi, '');

  // Handle encoded content
  sanitized = sanitized
    .replace(/&lt;script[^&]*&gt;.*?&lt;\/script&gt;/gi, '')
    .replace(/&lt;[^&]*&gt;/g, ''); // Remove any remaining encoded tags

  // Escape special characters for HTML context but preserve quotes for readability
  sanitized = sanitized.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Trim whitespace and handle spacing around removed content
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  if (sanitized.length > MAX_METADATA_LENGTH) {
    sanitized = sanitized.substring(0, MAX_METADATA_LENGTH).trim();
  }

  return sanitized;
}

/**
 * Sanitizes HTML content allowing safe tags while removing dangerous ones
 *
 * @param input - The HTML string to sanitize
 * @returns Sanitized HTML safe for rendering
 */
export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) {
    return '';
  }

  return purify.sanitize(input, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'b',
      'i',
      'u',
      'span',
      'div',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'a',
      'img',
      'blockquote',
      'code',
      'pre',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'link', 'meta', 'base', 'form', 'input'],
    FORBID_ATTR: [
      'onerror',
      'onload',
      'onclick',
      'onmouseover',
      'onfocus',
      'onblur',
      'onchange',
      'onsubmit',
    ],
    KEEP_CONTENT: true,
  });
}

/**
 * Validates if metadata content is safe and meets requirements
 *
 * @param input - The metadata string to validate
 * @returns true if metadata is valid, false otherwise
 */
export function isValidMetadata(input: string | null | undefined): boolean {
  if (!input) {
    return true; // Empty metadata is valid
  }

  // Check length
  if (input.length > MAX_METADATA_LENGTH) {
    return false;
  }

  // Check for HTML tags (not allowed in metadata)
  if (/<[^>]*>/g.test(input)) {
    return false;
  }

  // Check for suspicious patterns
  const hasSuspiciousPattern = SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(input));

  if (hasSuspiciousPattern) {
    return false;
  }

  return true;
}

/**
 * Validates and sanitizes metadata with additional safety checks
 *
 * @param input - The input metadata to process
 * @returns Object with sanitized content and validation status
 */
export function processMetadata(input: string | null | undefined): {
  sanitized: string;
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  let sanitized = '';

  if (!input) {
    return { sanitized: '', isValid: true, warnings: [] };
  }

  // Check original validity
  const originalValid = isValidMetadata(input);
  if (!originalValid) {
    warnings.push('Input contains potentially unsafe content');
  }

  // Sanitize regardless
  sanitized = sanitizeMetadata(input);

  // Check if sanitization removed significant content
  const contentReduction = (input.length - sanitized.length) / input.length;
  if (contentReduction > 0.3) {
    warnings.push('Significant content was removed during sanitization');
  }

  return {
    sanitized,
    isValid: originalValid && warnings.length === 0,
    warnings,
  };
}

/**
 * Creates a safe metadata object with sanitized fields
 *
 * @param metadata - Raw metadata object
 * @returns Sanitized metadata object
 */
export function createSafeMetadata(metadata: Record<string, unknown>): Record<string, string> {
  const safeMetadata: Record<string, string> = {};

  Object.entries(metadata).forEach(([key, value]) => {
    if (typeof value === 'string') {
      safeMetadata[key] = sanitizeMetadata(value);
    } else if (value != null) {
      safeMetadata[key] = sanitizeMetadata(String(value));
    }
  });

  return safeMetadata;
}
