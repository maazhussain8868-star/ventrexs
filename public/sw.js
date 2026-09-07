/**
 * Ventrexs PWA Conservative Service Worker
 *
 * CRITICAL ARCHITECTURAL CONSTRAINTS & HISTORICAL INCIDENT CONTEXT:
 * ------------------------------------------------------------------
 * In previous versions, aggressive or un-scoped service worker caching caused severe regressions:
 * 1. ICON FONTS BROKE: Cross-origin font requests to Google Fonts (fonts.googleapis.com)
 *    and Google Fonts Static (fonts.gstatic.com) were intercepted, causing Material Symbols
 *    to fail loading and render as raw text strings (e.g. "storefront", "shield", "workspace_premium").
 * 2. PAYMENT CHECKOUT BROKE: Cross-origin script loading from Razorpay (checkout.razorpay.com)
 *    and Stripe (js.stripe.com) was intercepted or blocked. In addition, API requests under /api/
 *    and requests with authentication cookies/headers were mishandled by the cache layer,
 *    triggering 401 "Authentication required to perform billing operations" errors.
 *
 * TO PREVENT ANY RECURRENCE, THIS SERVICE WORKER STRICTLY ENFORCES:
 * 1. ZERO CROSS-ORIGIN INTERCEPTION: Any request whose origin does not exactly match
 *    self.location.origin (including Razorpay, Stripe, Supabase, Google Fonts, Twilio, Omnidimension,
 *    and Analytics) is IMMEDIATELY bypassed via early return (never calling event.respondWith).
 * 2. ONLY HTTP GET: Non-GET requests (POST, PUT, DELETE, PATCH, OPTIONS) are never touched.
 * 3. NO API OR NEXT.JS INTERNAL ROUTES: Anything starting with /api/ or /_next/data/ is bypassed.
 * 4. NO AUTHENTICATED REQUESTS: Any request carrying an Authorization header is bypassed.
 * 5. NO HTML/NAVIGATION CACHING: Document navigations are never intercepted to avoid stale SSR pages or broken auth redirects.
 * 6. EXCLUSIVE WHITELIST: Only same-origin static images (png, jpg, jpeg, svg, webp, ico) and the web manifest
 *    are handled. Fonts, JavaScript bundles, and CSS are excluded.
 * 7. NETWORK-FIRST STRATEGY: For whitelisted static assets, network is ALWAYS tried first.
 *    Cache is strictly used as an offline fallback.
 */

const CACHE_NAME = 'ventrexs-static-v2';

// Whitelist of explicitly safe static asset extensions
const SAFE_STATIC_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.ico'];

// 1. Service Worker Installation
self.addEventListener('install', () => {
  // Immediately activate new service worker without waiting for existing tabs to close
  self.skipWaiting();
});

// 2. Service Worker Activation & Legacy Cache Cleanup
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              // Delete legacy or aggressive caches from previous iterations
              console.log('[SW-ACTIVATE] Purging legacy cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 3. Service Worker Fetch Interceptor
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // ----------------------------------------------------------------------------------
  // GUARD 1: Cross-Origin Requests MUST PASS THROUGH
  // Why: Third-party services (Razorpay checkout.js, Stripe.js, Google Fonts gstatic,
  // Supabase Auth/DB, Google Analytics) must never be intercepted or altered by our SW.
  // ----------------------------------------------------------------------------------
  if (url.origin !== self.location.origin) {
    return;
  }

  // ----------------------------------------------------------------------------------
  // GUARD 2: Non-GET HTTP Methods MUST PASS THROUGH
  // Why: POST, PUT, DELETE, PATCH, OPTIONS represent mutations, API calls, checkout
  // order creation (/api/checkout/razorpay), and payment verification. Never touch them.
  // ----------------------------------------------------------------------------------
  if (request.method !== 'GET') {
    return;
  }

  // ----------------------------------------------------------------------------------
  // GUARD 3: API Endpoints & Next.js Dynamic Data Routes MUST PASS THROUGH
  // Why: Backend API routes (/api/*) and Next.js SSR server state (/_next/data/*)
  // must always reach the live Next.js server with fresh cookies and session headers.
  // ----------------------------------------------------------------------------------
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/data/')) {
    return;
  }

  // ----------------------------------------------------------------------------------
  // GUARD 4: Authenticated Requests MUST PASS THROUGH
  // Why: Any request with an Authorization header belongs to an authenticated operation.
  // Caching or intercepting these risks exposing or breaking bearer tokens.
  // ----------------------------------------------------------------------------------
  if (request.headers.has('authorization') || request.headers.has('Authorization')) {
    return;
  }

  // ----------------------------------------------------------------------------------
  // GUARD 5: HTML Page Navigation Requests MUST PASS THROUGH
  // Why: Document navigation (loading/refreshing pages) must never be served from cache.
  // Next.js App Router relies on live server headers, middleware auth checks, and redirects.
  // ----------------------------------------------------------------------------------
  if (request.mode === 'navigate' || request.destination === 'document') {
    return;
  }

  // ----------------------------------------------------------------------------------
  // GUARD 6: Whitelist Verification (Images and Manifest ONLY)
  // Why: Do NOT cache scripts, CSS stylesheets, or fonts. Only cache same-origin static
  // images (icons, logos) and manifest.json required to satisfy PWA installability.
  // ----------------------------------------------------------------------------------
  const lowerPath = url.pathname.toLowerCase();
  const isManifest =
    lowerPath === '/manifest.json' ||
    lowerPath === '/manifest.webmanifest' ||
    lowerPath.endsWith('.webmanifest');
  const isSafeImage = SAFE_STATIC_EXTENSIONS.some((ext) => lowerPath.endsWith(ext));

  if (!isManifest && !isSafeImage) {
    // If it is not an explicitly whitelisted static asset, pass straight to network
    return;
  }

  // ----------------------------------------------------------------------------------
  // STRATEGY: Network-First with Offline Cache Fallback
  // Why: Network is ALWAYS executed first to guarantee users receive current versions.
  // Cache is only consulted if network fetch fails completely (offline).
  // ----------------------------------------------------------------------------------
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Cache only valid, complete 200 OK responses
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          }).catch((cacheErr) => {
            console.warn('[SW-CACHE-WARN] Failed to cache asset:', cacheErr);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed (offline) -> attempt to retrieve from cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If offline and not in cache, return an empty Response or let browser handle it
          return new Response('Resource unavailable offline', {
            status: 503,
            statusText: 'Service Unavailable (Offline)',
            headers: { 'Content-Type': 'text/plain' },
          });
        });
      })
  );
});
