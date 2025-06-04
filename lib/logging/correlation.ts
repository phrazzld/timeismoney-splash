/**
 * Correlation ID management for request tracing
 */

import type { CorrelationIdGenerator } from './types';

/**
 * Current correlation ID storage (thread-local equivalent)
 */
let currentCorrelationId: string | null = null;

/**
 * Validates if a string is a valid UUID v4 format
 */
export function validateCorrelationId(id: unknown): boolean {
  if (typeof id !== 'string') {
    return false;
  }

  // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Generates a cryptographically secure UUID v4 correlation ID
 */
export function generateCorrelationId(): string {
  // Try modern crypto.randomUUID first
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback to crypto.getRandomValues
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buffer = new Uint8Array(16);
    crypto.getRandomValues(buffer);

    // Set version (4) and variant bits according to RFC 4122
    buffer[6] = (buffer[6] & 0x0f) | 0x40; // Version 4
    buffer[8] = (buffer[8] & 0x3f) | 0x80; // Variant 10

    // Convert to hex string with dashes
    const hex = Array.from(buffer)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20, 32),
    ].join('-');
  }

  // Final fallback using Math.random (not cryptographically secure)
  console.warn('Using non-cryptographic random for correlation ID generation');

  const s4 = (): string =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return `${s4()}${s4()}-${s4()}-4${s4().substring(1)}-${(8 + Math.floor(Math.random() * 4)).toString(16)}${s4().substring(1)}-${s4()}${s4()}${s4()}`;
}

/**
 * Gets the current correlation ID
 */
export function getCurrentCorrelationId(): string | null {
  return currentCorrelationId;
}

/**
 * Sets the current correlation ID
 */
export function setCorrelationId(id: string): void {
  if (!validateCorrelationId(id)) {
    throw new Error('Invalid correlation ID format');
  }
  currentCorrelationId = id;
}

/**
 * Clears the current correlation ID
 */
export function clearCorrelationId(): void {
  currentCorrelationId = null;
}

/**
 * Executes a function with a temporary correlation ID
 */
export async function withCorrelationId<T>(id: string, fn: () => T | Promise<T>): Promise<T> {
  const previousId = currentCorrelationId;

  try {
    setCorrelationId(id);
    return await fn();
  } finally {
    if (previousId) {
      setCorrelationId(previousId);
    } else {
      clearCorrelationId();
    }
  }
}

/**
 * Correlation ID manager class for advanced use cases
 */
export class CorrelationIdManager implements CorrelationIdGenerator {
  private id: string;

  constructor(initialId?: string) {
    this.id = initialId || this.generate();
  }

  /**
   * Generates a new correlation ID
   */
  generate(): string {
    return generateCorrelationId();
  }

  /**
   * Validates a correlation ID format
   */
  validate(id: string): boolean {
    return validateCorrelationId(id);
  }

  /**
   * Gets the current ID for this manager instance
   */
  getCurrentId(): string {
    return this.id;
  }

  /**
   * Sets a new ID for this manager instance
   */
  setId(id: string): void {
    if (!this.validate(id)) {
      throw new Error('Invalid correlation ID format');
    }
    this.id = id;
  }

  /**
   * Regenerates the correlation ID
   */
  regenerate(): void {
    this.id = this.generate();
  }

  /**
   * Creates a child correlation ID (shares prefix with parent)
   */
  createChild(): string {
    const parentPrefix = this.id.split('-')[0];
    const childSuffix = this.generate().split('-').slice(1).join('-');
    return `${parentPrefix}-${childSuffix}`;
  }

  /**
   * Creates middleware-style function for executing with this correlation ID
   */
  middleware<T>(id?: string): (_fn: () => T | Promise<T>) => Promise<T> {
    const correlationId = id || this.id;
    return (fn: () => T | Promise<T>) => withCorrelationId(correlationId, fn);
  }
}
