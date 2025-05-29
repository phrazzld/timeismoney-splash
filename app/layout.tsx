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
import './globals.css';

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

        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}
