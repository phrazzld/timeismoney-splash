import type { Metadata } from 'next';
import Script from 'next/script';
import { Geist, Geist_Mono } from 'next/font/google';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION, TITLE_TEMPLATE } from '@/lib/seo-config';
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
 * metadataBase is crucial for converting relative URLs to absolute URLs in metadata.
 */
export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: TITLE_TEMPLATE,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: '/',
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactNode {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en">
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
