'use client';

import { useEffect } from 'react';

/**
 * ServiceWorkerRegister
 *
 * Conservative PWA Service Worker Registration Component
 *
 * SAFETY GUARDS:
 * 1. Skips registration completely in development mode (process.env.NODE_ENV !== 'production')
 *    and on local hostnames ('localhost', '127.0.0.1', '[::1]', '.local') to avoid
 *    interfering with local debugging, Next.js fast-refresh, or test suites.
 * 2. Only registers in production environments where 'serviceWorker' is supported by the browser.
 * 3. Safely logs registration state and errors without disrupting UI rendering.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Skip registration in development mode or on local loopback hosts
    const isLocalhost = Boolean(
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]' ||
      window.location.hostname.endsWith('.local')
    );

    if (process.env.NODE_ENV !== 'production' || isLocalhost) {
      console.log('[PWA-SW] Service Worker registration skipped in development/localhost environment.');
      return;
    }

    const registerSW = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[PWA-SW] Conservative Service Worker registered successfully with scope:', registration.scope);
        })
        .catch((error) => {
          console.warn('[PWA-SW] Conservative Service Worker registration notice:', error);
        });
    };

    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
      return () => window.removeEventListener('load', registerSW);
    }
  }, []);

  return null;
}
