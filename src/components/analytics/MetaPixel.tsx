'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

interface MetaPixelProps {
  pixelId?: string;
}

/**
 * Inner component that listens to client-side route changes and dispatches Meta Pixel PageView events.
 * Wrapped in <Suspense> to comply with Next.js App Router useSearchParams boundary requirements.
 */
function MetaPixelTracker({ pixelId }: { pixelId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.fbq !== 'function') {
      return;
    }

    // Fire PageView on client-side route transitions
    window.fbq('track', 'PageView');
  }, [pathname, searchParams, pixelId]);

  return null;
}

/**
 * Global Meta (Facebook) Pixel Provider for Ventrexs AI.
 * Loads the Meta Pixel SDK asynchronously via next/script and handles SPA page-view tracking seamlessly.
 */
export function MetaPixel({
  pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID,
}: MetaPixelProps) {
  if (!pixelId) {
    return null;
  }

  return (
    <>
      {/* 1. Meta Pixel Base Initialization Script */}
      <Script
        id="meta-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />

      {/* 2. Noscript Fallback Image */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>

      {/* 3. SPA Route change listener */}
      <Suspense fallback={null}>
        <MetaPixelTracker pixelId={pixelId} />
      </Suspense>
    </>
  );
}

export default MetaPixel;
