'use client';

import { useEffect } from 'react';

/**
 * ServiceWorkerUnregister (Rollback)
 * Proactively unregisters any previously installed service worker
 * and clears legacy PWA caches from users' browsers.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister().then((ok) => {
              console.log('[PWA-ROLLBACK] Unregistered residual service worker:', ok);
            });
          }
        });
      }
      if ('caches' in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key);
          }
        });
      }
    }
  }, []);

  return null;
}
