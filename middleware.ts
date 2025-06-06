import { NextRequest, NextResponse } from 'next/server';

/**
 * Content Security Policy configuration
 */
function getCSPHeader(isDevelopment: boolean): string {
  const baseDirectives = [
    "default-src 'self'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  if (isDevelopment) {
    // Development needs more permissive policies for Next.js hot reload
    baseDirectives.push(
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' ws: wss:",
    );
  } else {
    // Production policies are more restrictive
    baseDirectives.push(
      "script-src 'self' 'unsafe-eval'", // Next.js still needs unsafe-eval for chunks
      "style-src 'self' 'unsafe-inline'", // Styled-components and CSS-in-JS need unsafe-inline
    );
  }

  return baseDirectives.join('; ');
}

/**
 * Security headers configuration
 */
function getSecurityHeaders(isDevelopment: boolean): Record<string, string> {
  return {
    'Content-Security-Policy': getCSPHeader(isDevelopment),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy':
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=()',
  };
}

/**
 * Checks if the request path should have security headers applied
 */
function shouldApplySecurityHeaders(pathname: string): boolean {
  // Apply to all paths except specific exclusions
  const excludedPaths = ['/robots.txt', '/sitemap.xml', '/favicon.ico'];

  return !excludedPaths.some((excluded) => pathname === excluded);
}

/**
 * Main middleware function that applies security headers
 */
export function middleware(request: NextRequest): NextResponse {
  try {
    const response = NextResponse.next();
    const pathname = new URL(request.url).pathname;
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Apply security headers to appropriate paths
    if (shouldApplySecurityHeaders(pathname)) {
      const securityHeaders = getSecurityHeaders(isDevelopment);

      Object.entries(securityHeaders).forEach(([key, value]) => {
        try {
          response.headers.set(key, value);
        } catch (error) {
          // Log error in development, fail silently in production
          if (isDevelopment) {
            console.warn(`Failed to set security header ${key}:`, error);
          }
        }
      });
    }

    return response;
  } catch (error) {
    // If middleware fails, continue without security headers rather than breaking the site
    if (process.env.NODE_ENV === 'development') {
      console.error('Security middleware error:', error);
    }
    return NextResponse.next();
  }
}

/**
 * Middleware configuration
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt (robots file)
     * - sitemap.xml (sitemap file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
