import { sanitizeMetadata, sanitizeHtml, isValidMetadata } from '../../lib/security/sanitization';

describe('Input Sanitization', () => {
  describe('sanitizeMetadata', () => {
    test('removes script tags from metadata', () => {
      const maliciousInput = 'Safe title<script>alert("xss")</script>';
      const result = sanitizeMetadata(maliciousInput);

      expect(result).toBe('Safe title');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    test('removes HTML tags from metadata', () => {
      const htmlInput = 'Title with <b>bold</b> and <i>italic</i> text';
      const result = sanitizeMetadata(htmlInput);

      expect(result).toBe('Title with bold and italic text');
      expect(result).not.toContain('<b>');
      expect(result).not.toContain('<i>');
    });

    test('preserves legitimate text content', () => {
      const legitimateInput = 'Time is Money - Convert Prices to Work Hours';
      const result = sanitizeMetadata(legitimateInput);

      expect(result).toBe(legitimateInput);
    });

    test('handles empty and null input', () => {
      expect(sanitizeMetadata('')).toBe('');
      expect(sanitizeMetadata(undefined)).toBe('');
      expect(sanitizeMetadata(null)).toBe('');
    });

    test('escapes special characters', () => {
      const specialChars = 'Title with "quotes" & ampersands';
      const result = sanitizeMetadata(specialChars);

      // Should escape ampersands but can preserve quotes for readability
      expect(result).toContain('&amp;');
      expect(result).toContain('Title with');
      expect(result).toContain('quotes');
    });

    test('removes javascript protocol links', () => {
      const maliciousInput = 'Click here: javascript:alert("xss")';
      const result = sanitizeMetadata(maliciousInput);

      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('alert');
      expect(result).toContain('Click here:');
    });

    test('handles data URLs safely', () => {
      const dataUrl = 'Image: data:image/svg+xml,<svg>test</svg>';
      const result = sanitizeMetadata(dataUrl);

      // Should remove the data URL completely for metadata
      expect(result).not.toContain('data:');
      expect(result).toBe('Image:');
    });
  });

  describe('sanitizeHtml', () => {
    test('allows safe HTML tags', () => {
      const safeHtml = '<p>Safe paragraph</p><strong>Bold text</strong>';
      const result = sanitizeHtml(safeHtml);

      expect(result).toContain('<p>');
      expect(result).toContain('<strong>');
      expect(result).toContain('Safe paragraph');
    });

    test('removes dangerous HTML tags', () => {
      const dangerousHtml = '<script>alert("xss")</script><iframe src="evil.com"></iframe>';
      const result = sanitizeHtml(dangerousHtml);

      expect(result).not.toContain('<script>');
      expect(result).not.toContain('<iframe>');
      expect(result).not.toContain('alert');
    });

    test('removes event handlers', () => {
      const eventHandlers = '<div onclick="alert(1)" onload="evil()">Content</div>';
      const result = sanitizeHtml(eventHandlers);

      expect(result).not.toContain('onclick');
      expect(result).not.toContain('onload');
      expect(result).toContain('Content');
    });

    test('handles malformed HTML gracefully', () => {
      const malformedHtml = '<div><p>Unclosed tags<span>More content';
      const result = sanitizeHtml(malformedHtml);

      // Should still return content without breaking
      expect(result).toContain('Unclosed tags');
      expect(result).toContain('More content');
    });
  });

  describe('isValidMetadata', () => {
    test('validates length constraints', () => {
      const shortText = 'Valid';
      const longText = 'x'.repeat(1000); // Very long text

      expect(isValidMetadata(shortText)).toBe(true);
      expect(isValidMetadata(longText)).toBe(false);
    });

    test('rejects metadata with HTML tags', () => {
      const htmlContent = 'Title with <script>code</script>';

      expect(isValidMetadata(htmlContent)).toBe(false);
    });

    test('rejects metadata with suspicious patterns', () => {
      const suspiciousPatterns = [
        'javascript:alert(1)',
        'data:text/html,<script>',
        'onclick="evil()"',
        'eval("code")',
      ];

      suspiciousPatterns.forEach((pattern) => {
        expect(isValidMetadata(pattern)).toBe(false);
      });
    });

    test('accepts clean metadata', () => {
      const cleanMetadata = [
        'Time is Money Chrome Extension',
        'Convert prices to work hours easily',
        'Price to time conversion tool',
      ];

      cleanMetadata.forEach((metadata) => {
        expect(isValidMetadata(metadata)).toBe(true);
      });
    });
  });

  describe('XSS Prevention', () => {
    test('prevents various XSS attack vectors', () => {
      const xssVectors = [
        '<script>alert("XSS")</script>',
        '<img src="x" onerror="alert(1)">',
        '<svg onload="alert(1)">',
        'javascript:alert("XSS")',
        '<iframe src="javascript:alert(1)"></iframe>',
        '<object data="javascript:alert(1)"></object>',
        '<embed src="javascript:alert(1)">',
        '<link rel="stylesheet" href="javascript:alert(1)">',
        '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">',
        '<base href="javascript:alert(1)">',
      ];

      xssVectors.forEach((vector) => {
        const sanitized = sanitizeMetadata(vector);

        // Should remove dangerous patterns
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized).not.toContain('<script');
        expect(sanitized).not.toContain('onerror');
        expect(sanitized).not.toContain('onload');
        // Most vectors should result in empty or minimal content
        expect(sanitized.length).toBeLessThan(vector.length);
      });
    });

    test('prevents encoded XSS attempts', () => {
      const encodedXss = [
        '&lt;script&gt;alert(1)&lt;/script&gt;',
        '%3Cscript%3Ealert(1)%3C/script%3E',
        '&#60;script&#62;alert(1)&#60;/script&#62;',
      ];

      encodedXss.forEach((encoded) => {
        const sanitized = sanitizeMetadata(encoded);

        // Should not contain script tags
        expect(sanitized).not.toContain('script');
        expect(sanitized).not.toContain('<');
        expect(sanitized).not.toContain('>');
        // Should be significantly reduced in size
        expect(sanitized.length).toBeLessThan(encoded.length / 2);
      });
    });
  });
});
