import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../../middleware';

// Mock Next.js middleware components
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    next: jest.fn(() => ({
      headers: new Map(),
      url: 'http://localhost:3000',
      clone: jest.fn(),
    })),
  },
}));

describe('Security Middleware', () => {
  let mockRequest: Partial<NextRequest>;
  let mockResponse: {
    headers: Map<string, string>;
    url: string;
    clone: jest.Mock;
  };

  beforeEach(() => {
    mockRequest = {
      url: 'http://localhost:3000/',
      method: 'GET',
      headers: new Map(),
    };

    mockResponse = {
      headers: new Map(),
      url: 'http://localhost:3000',
      clone: jest.fn().mockReturnThis(),
    };

    (NextResponse.next as jest.Mock).mockReturnValue(mockResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Content Security Policy', () => {
    test('sets CSP header with proper directives', async () => {
      const response = await middleware(mockRequest as NextRequest);

      const cspHeader = response.headers.get('Content-Security-Policy');

      expect(cspHeader).toBeTruthy();
      expect(cspHeader).toContain("default-src 'self'");
      expect(cspHeader).toContain("script-src 'self'");
      expect(cspHeader).toContain("style-src 'self'");
      expect(cspHeader).toContain("img-src 'self' data: https:");
      expect(cspHeader).toContain("frame-ancestors 'none'");
    });

    test('allows Next.js specific script requirements', async () => {
      const response = await middleware(mockRequest as NextRequest);

      const cspHeader = response.headers.get('Content-Security-Policy');

      // Next.js needs unsafe-eval for development
      expect(cspHeader).toContain("'unsafe-eval'");
      // Next.js needs unsafe-inline for some styling
      expect(cspHeader).toContain("'unsafe-inline'");
    });

    test('restricts dangerous directives', async () => {
      const response = await middleware(mockRequest as NextRequest);

      const cspHeader = response.headers.get('Content-Security-Policy');

      expect(cspHeader).toContain("base-uri 'self'");
      expect(cspHeader).toContain("form-action 'self'");
      expect(cspHeader).toContain("frame-ancestors 'none'");
    });
  });

  describe('Security Headers', () => {
    test('sets X-Content-Type-Options header', async () => {
      const response = await middleware(mockRequest as NextRequest);

      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });

    test('sets X-Frame-Options header', async () => {
      const response = await middleware(mockRequest as NextRequest);

      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    });

    test('sets X-XSS-Protection header', async () => {
      const response = await middleware(mockRequest as NextRequest);

      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    });

    test('sets Referrer-Policy header', async () => {
      const response = await middleware(mockRequest as NextRequest);

      expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    });

    test('sets Permissions-Policy header', async () => {
      const response = await middleware(mockRequest as NextRequest);

      const permissionsPolicy = response.headers.get('Permissions-Policy');

      expect(permissionsPolicy).toBeTruthy();
      expect(permissionsPolicy).toContain('camera=()');
      expect(permissionsPolicy).toContain('microphone=()');
      expect(permissionsPolicy).toContain('geolocation=()');
    });
  });

  describe('Path-based Security', () => {
    test('applies security headers to all paths', async () => {
      const paths = ['/', '/about', '/api/test', '/_next/static/test.js'];

      for (const path of paths) {
        mockRequest.url = `http://localhost:3000${path}`;
        const response = await middleware(mockRequest as NextRequest);

        expect(response.headers.get('X-Frame-Options')).toBe('DENY');
        expect(response.headers.get('Content-Security-Policy')).toBeTruthy();
      }
    });

    test('does not interfere with API routes', async () => {
      mockRequest.url = 'http://localhost:3000/api/test';
      const response = await middleware(mockRequest as NextRequest);

      // Should still have security headers but not break API functionality
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('Content-Security-Policy')).toBeTruthy();
    });

    test('handles static assets appropriately', async () => {
      mockRequest.url = 'http://localhost:3000/_next/static/chunk.js';
      const response = await middleware(mockRequest as NextRequest);

      // Should have appropriate CSP for static assets
      const cspHeader = response.headers.get('Content-Security-Policy');
      expect(cspHeader).toContain("script-src 'self'");
    });
  });

  describe('Development vs Production', () => {
    test('applies stricter CSP in production', async () => {
      process.env.NODE_ENV = 'production';

      const response = await middleware(mockRequest as NextRequest);
      const cspHeader = response.headers.get('Content-Security-Policy');

      expect(cspHeader).toBeTruthy();
      // In production, we might want stricter policies
      expect(cspHeader).toContain("default-src 'self'");

      process.env.NODE_ENV = 'test';
    });

    test('allows development tools in dev mode', async () => {
      process.env.NODE_ENV = 'development';

      const response = await middleware(mockRequest as NextRequest);
      const cspHeader = response.headers.get('Content-Security-Policy');

      // Development needs more permissive policies for hot reload, etc.
      expect(cspHeader).toContain("'unsafe-eval'");

      process.env.NODE_ENV = 'test';
    });
  });

  describe('Error Handling', () => {
    test('continues processing even if header setting fails', () => {
      // Mock a scenario where setting headers might fail
      const mockResponseWithError = {
        ...mockResponse,
        headers: {
          set: jest.fn().mockImplementation(() => {
            throw new Error('Header setting failed');
          }),
          get: jest.fn(),
        },
      };

      (NextResponse.next as jest.Mock).mockReturnValue(mockResponseWithError);

      // Should not throw, should handle gracefully
      expect(() => middleware(mockRequest as NextRequest)).not.toThrow();
    });

    test('works with malformed URLs', () => {
      mockRequest.url = 'not-a-valid-url';

      // Should handle gracefully without throwing
      expect(() => middleware(mockRequest as NextRequest)).not.toThrow();
      const response = middleware(mockRequest as NextRequest);
      expect(response).toBeTruthy();
    });
  });

  describe('Header Validation', () => {
    test('CSP header is properly formatted', async () => {
      const response = await middleware(mockRequest as NextRequest);
      const cspHeader = response.headers.get('Content-Security-Policy');

      // Should not have syntax errors
      expect(cspHeader).not.toContain(';;');
      expect(cspHeader).not.toMatch(/;\s*;/);
      expect(cspHeader).not.toMatch(/^\s*;/);
      expect(cspHeader).not.toMatch(/;\s*$/);
    });

    test('all security headers have valid values', async () => {
      const response = await middleware(mockRequest as NextRequest);

      const securityHeaders = [
        'Content-Security-Policy',
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection',
        'Referrer-Policy',
        'Permissions-Policy',
      ];

      securityHeaders.forEach((headerName) => {
        const headerValue = response.headers.get(headerName);
        expect(headerValue).toBeTruthy();
        expect(headerValue?.trim()).toBeTruthy();
      });
    });
  });
});
