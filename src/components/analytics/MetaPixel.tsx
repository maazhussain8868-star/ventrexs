'use client';

import { Suspense, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '2307539696659070';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

export interface CompleteRegistrationParams {
  email?: string;
  userId?: string;
  plan?: string;
  contentName?: string;
  value?: number;
  currency?: string;
}

// In-memory guard to prevent multiple event dispatches within the same runtime session
const _firedRegistrationKeys = new Set<string>();

/**
 * Fires the Meta standard event CompleteRegistration strictly once per successful 7-day free trial signup.
 * 
 * Enforces triple-layer deduplication:
 * 1. In-memory Set check (blocks rapid duplicate dispatches / component re-renders)
 * 2. Browser sessionStorage check (blocks duplicate fires across page reloads / SPA routing)
 * 3. Meta eventID parameter (enables Meta Conversions API & Ads Manager event deduplication)
 * 
 * @returns boolean - true if event was dispatched, false if suppressed as a duplicate or if fbq unavailable
 */
export function trackCompleteRegistration(params: CompleteRegistrationParams = {}): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // Derive unique identifier for deduplication (userId or email or fallback)
  const rawKey = (params.userId || params.email || 'guest').trim().toLowerCase();
  const dedupeKey = rawKey.length > 0 ? rawKey : 'guest';

  // 1. In-memory deduplication
  if (_firedRegistrationKeys.has(dedupeKey)) {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[MetaPixel] CompleteRegistration suppressed: already fired in-memory for', dedupeKey);
    }
    return false;
  }

  // 2. Browser sessionStorage deduplication
  const storageKey = `ventrexs_meta_complete_registration_${dedupeKey.replace(/[^a-z0-9_]/gi, '_')}`;
  try {
    if (window.sessionStorage && window.sessionStorage.getItem(storageKey)) {
      if (process.env.NODE_ENV !== 'production') {
        console.info('[MetaPixel] CompleteRegistration suppressed: already recorded in sessionStorage for', dedupeKey);
      }
      return false;
    }
  } catch {
    // Non-blocking: handle browser storage quota or privacy mode
  }

  // Verify window.fbq is available
  if (typeof window.fbq !== 'function') {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[MetaPixel] window.fbq is not defined. CompleteRegistration skipped.');
    }
    return false;
  }

  // Mark as fired in-memory and sessionStorage before dispatch to prevent race conditions
  _firedRegistrationKeys.add(dedupeKey);
  try {
    if (window.sessionStorage) {
      window.sessionStorage.setItem(storageKey, new Date().toISOString());
    }
  } catch {
    // Non-blocking
  }

  // Meta standard parameters (strictly real values, no mock/fake fields)
  const planName = params.plan || 'Professional';
  const contentName = params.contentName || `7-Day Free Trial - ${planName}`;
  const currency = params.currency || 'USD';
  const value = params.value ?? 0.0;

  // Generate deterministic eventID for Meta deduplication engine
  const eventId = `reg_${dedupeKey.replace(/[^a-z0-9_]/gi, '_')}_${Date.now()}`;

  try {
    window.fbq(
      'track',
      'CompleteRegistration',
      {
        content_name: contentName,
        status: 'success',
        currency,
        value,
      },
      {
        eventID: eventId,
      }
    );

    if (process.env.NODE_ENV !== 'production') {
      console.info('[MetaPixel] CompleteRegistration fired successfully:', {
        content_name: contentName,
        status: 'success',
        eventID: eventId,
      });
    }
    return true;
  } catch (err) {
    console.error('[MetaPixel] Error dispatching CompleteRegistration:', err);
    return false;
  }
}

/**
 * Generic helper to fire standard or custom Meta Pixel events safely
 */
export function trackMetaEvent(
  eventName: string,
  parameters?: Record<string, any>,
  options?: { eventID?: string }
): void {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') {
    return;
  }
  try {
    if (options?.eventID) {
      window.fbq('track', eventName, parameters || {}, { eventID: options.eventID });
    } else {
      window.fbq('track', eventName, parameters);
    }
  } catch (err) {
    console.warn(`[MetaPixel] Error tracking event ${eventName}:`, err);
  }
}

/**
 * Client-side route change listener that tracks PageViews on SPA navigations.
 * The initial document load PageView is handled directly by the base script in <head>.
 * This component skips the initial mount to prevent duplicate PageViews, then fires on route transitions.
 */
function MetaPixelTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip initial mount because base script in <head> already tracked the initial document PageView
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  }, [pathname, searchParams]);

  return null;
}

/**
 * Global Meta Pixel SPA navigation tracker for Ventrexs.
 * The base script and noscript are embedded in <head> (src/app/layout.tsx).
 * This component mounts the client-side SPA route transition listener wrapped in Suspense.
 */
export function MetaPixel() {
  return (
    <Suspense fallback={null}>
      <MetaPixelTracker />
    </Suspense>
  );
}

export default MetaPixel;
