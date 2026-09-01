'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

interface GoogleAnalyticsProps {
  gaId?: string;
  googleAdsId?: string;
}

/**
 * Inner component that listens to client-side route changes and dispatches GA page views.
 * Wrapped in <Suspense> to comply with Next.js App Router useSearchParams boundary requirements.
 */
function GoogleAnalyticsTracker({ gaId, googleAdsId }: { gaId?: string; googleAdsId?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
      return;
    }

    const url = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    if (gaId) {
      window.gtag('config', gaId, {
        page_path: url,
        page_location: window.location.href,
        page_title: document.title,
      });
    }

    if (googleAdsId) {
      window.gtag('config', googleAdsId, {
        page_path: url,
      });
    }
  }, [pathname, searchParams, gaId, googleAdsId]);

  return null;
}

/**
 * Global Google Tag (gtag.js) / GA4 Analytics & Google Ads Provider for Ventrexs AI.
 * Loads the tag asynchronously via next/script and handles SPA page-view tracking seamlessly.
 */
export function GoogleAnalytics({
  gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-CSXL6SMYTC',
  googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID,
}: GoogleAnalyticsProps) {
  const primaryId = gaId || googleAdsId;

  if (!primaryId) {
    return null;
  }

  return (
    <>
      {/* 1. Official Google tag manager library */}
      <Script
        id="google-tag-manager"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`}
      />

      {/* 2. Global gtag initialization */}
      <Script
        id="google-tag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            ${gaId ? `gtag('config', '${gaId}', { page_path: window.location.pathname, send_page_view: true });` : ''}
            ${googleAdsId ? `gtag('config', '${googleAdsId}');` : ''}
          `,
        }}
      />

      {/* 3. SPA Route change listener */}
      <Suspense fallback={null}>
        <GoogleAnalyticsTracker gaId={gaId} googleAdsId={googleAdsId} />
      </Suspense>
    </>
  );
}

export default GoogleAnalytics;
