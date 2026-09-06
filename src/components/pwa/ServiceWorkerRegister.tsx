'use client';

import { useEffect } from 'react';

/**
 * ServiceWorkerRegister
 * Automatically registers /sw.js in supported browser environments.
 * Enables PWA installation, Android TWA packaging, and offline fallback.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          });
          if (registration.installing) {
            console.log('[PWA] Service worker installing');
          } else if (registration.waiting) {
            console.log('[PWA] Service worker installed & waiting');
          } else if (registration.active) {
            console.log('[PWA] Service worker active');
          }
        } catch (error) {
          console.warn('[PWA] Service worker registration notice:', error);
        }
      };

      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
        return () => window.removeEventListener('load', registerSW);
      }
    }
  }, []);

  return null;
}
