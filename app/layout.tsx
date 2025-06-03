import type { Metadata } from 'next';
import Script from 'next/script';
import { Geist, Geist_Mono } from 'next/font/google';
import {
  generateDefaultMetadata,
  toNextMetadata,
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateJsonLdScript,
  createSearchAction,
} from '@/lib/seo';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import './globals.css';

// Initialize monitoring system
if (typeof window !== 'undefined') {
  import('@/lib/monitoring').then(({ initializeMonitoring }) => {
    initializeMonitoring().catch((error) => {
      console.warn('Failed to initialize monitoring:', error);
    });
  });
}

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

/**
 * Global metadata configuration for the application.
 * Uses our SEO metadata helpers for comprehensive meta tag support.
 */
export async function generateMetadata(): Promise<Metadata> {
  const metadataConfig = generateDefaultMetadata();
  const nextMetadata = toNextMetadata(metadataConfig) as Metadata;

  return {
    ...nextMetadata,
    metadataBase: new URL(metadataConfig.base.canonical || 'http://localhost:3000'),
    openGraph: {
      ...(nextMetadata.openGraph || {}),
      locale: 'en_US',
    },
    twitter: {
      ...(nextMetadata.twitter || {}),
    },
    robots: metadataConfig.base.robots,
    alternates: {
      canonical: metadataConfig.base.canonical,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactNode {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  // Generate structured data for Organization and WebSite
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema({
    potentialAction: createSearchAction(),
  });

  const organizationJsonLd = generateJsonLdScript(organizationSchema);
  const websiteJsonLd = generateJsonLdScript(websiteSchema);

  return (
    <html lang="en">
      <head>
        {/* JSON-LD Structured Data */}
        {organizationJsonLd && (
          <Script
            id="organization-schema"
            type="application/ld+json"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: organizationJsonLd.replace(/<\/?script[^>]*>/g, ''),
            }}
          />
        )}
        {websiteJsonLd && (
          <Script
            id="website-schema"
            type="application/ld+json"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: websiteJsonLd.replace(/<\/?script[^>]*>/g, ''),
            }}
          />
        )}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Google Analytics */}
        {process.env.NODE_ENV === 'production' && gaMeasurementId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}', {
                  send_page_view: false
                });
              `}
            </Script>
          </>
        )}

        <ErrorBoundary 
          enableRetry 
          showErrorDetails={process.env.NODE_ENV === 'development'}
          fallback={
            <div className="min-h-screen flex items-center justify-center p-4">
              <div className="max-w-md text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Application Error
                </h1>
                <p className="text-gray-600 mb-6">
                  We're sorry, but something went wrong. Please try refreshing the page.
                </p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          }
        >
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
