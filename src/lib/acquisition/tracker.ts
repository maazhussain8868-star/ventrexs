'use client';

import { AcquisitionSource, AttributionData, UtmParams } from './types';

const FIRST_TOUCH_STORAGE_KEY = 'vtx_first_touch_attribution';
const LAST_TOUCH_STORAGE_KEY = 'vtx_last_touch_attribution';

export function determineAcquisitionSource(utmSource?: string, referrer?: string, currentHostname?: string): AcquisitionSource {
  const src = (utmSource || '').toLowerCase();
  const ref = (referrer || '').toLowerCase();
  const host = currentHostname || (typeof window !== 'undefined' ? window.location.hostname : 'ventrexs.com');

  if (src.includes('facebook') || src.includes('meta') || src.includes('instagram') || src.includes('fb')) {
    return 'META_AD';
  }
  if (src.includes('google') || src.includes('adwords') || src.includes('gads') || src.includes('cpc')) {
    return 'GOOGLE_AD';
  }
  if (src.includes('agency') || src.includes('reseller') || src.includes('partner')) {
    return 'AGENCY_REFERRAL';
  }
  if (src.includes('referral') || src.includes('invite') || ref.includes('ref=')) {
    return 'REFERRAL';
  }
  if (ref && !ref.includes(host)) {
    if (ref.includes('google.') || ref.includes('bing.') || ref.includes('duckduckgo.')) {
      return 'ORGANIC';
    }
    return 'REFERRAL';
  }
  if (!src && !ref) {
    return 'DIRECT';
  }
  return 'OTHER';
}

export function captureAcquisitionAttribution(): AttributionData | null {
  if (typeof window === 'undefined') return null;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const utm_source = urlParams.get('utm_source') || undefined;
    const utm_medium = urlParams.get('utm_medium') || undefined;
    const utm_campaign = urlParams.get('utm_campaign') || undefined;
    const utm_content = urlParams.get('utm_content') || undefined;
    const utm_term = urlParams.get('utm_term') || undefined;
    const ref = urlParams.get('ref') || undefined;
    const agency_ref = urlParams.get('agency_ref') || undefined;

    const referrer = document.referrer || '';
    const landing_page = window.location.pathname + window.location.search;
    const nowIso = new Date().toISOString();

    const currentSource = determineAcquisitionSource(utm_source, referrer, window.location.hostname);

    const currentTouch: AttributionData = {
      acquisition_source: currentSource,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      ref,
      agency_ref,
      landing_page,
      referrer,
      first_touch_at: nowIso,
      last_touch_at: nowIso,
    };

    // 1. First Touch Attribution (Preserved forever if already set)
    const existingFirstTouchRaw = localStorage.getItem(FIRST_TOUCH_STORAGE_KEY);
    if (!existingFirstTouchRaw) {
      localStorage.setItem(FIRST_TOUCH_STORAGE_KEY, JSON.stringify(currentTouch));
    }

    // 2. Last Touch Attribution (Always updated with current visit if UTM or referrer exists)
    const storedFirstTouch: AttributionData = existingFirstTouchRaw
      ? JSON.parse(existingFirstTouchRaw)
      : currentTouch;

    const mergedLastTouch: AttributionData = {
      ...currentTouch,
      first_touch_at: storedFirstTouch.first_touch_at,
      last_touch_at: nowIso,
    };

    localStorage.setItem(LAST_TOUCH_STORAGE_KEY, JSON.stringify(mergedLastTouch));

    return mergedLastTouch;
  } catch (err) {
    console.warn('Could not capture acquisition attribution:', err);
    return null;
  }
}

export function getStoredAttribution(): { firstTouch: AttributionData | null; lastTouch: AttributionData | null } {
  if (typeof window === 'undefined') return { firstTouch: null, lastTouch: null };

  try {
    const ftRaw = localStorage.getItem(FIRST_TOUCH_STORAGE_KEY);
    const ltRaw = localStorage.getItem(LAST_TOUCH_STORAGE_KEY);
    return {
      firstTouch: ftRaw ? JSON.parse(ftRaw) : null,
      lastTouch: ltRaw ? JSON.parse(ltRaw) : null,
    };
  } catch {
    return { firstTouch: null, lastTouch: null };
  }
}
