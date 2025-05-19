'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageview } from '@/lib/analytics';

/**
 * Internal component that uses useSearchParams
 */
function AnalyticsTracker(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page view whenever pathname or search params change
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    trackPageview(url);
  }, [pathname, searchParams]);

  return null;
}

/**
 * Analytics provider component that tracks page views
 * on route changes in the Next.js App Router
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <>
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
      {children}
    </>
  );
}
