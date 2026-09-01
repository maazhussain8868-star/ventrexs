/**
 * VENTREXS AI — PRODUCTION GOOGLE ADS & GA4 CONVERSION TRACKER
 *
 * Provides typed, production-safe conversion dispatching across:
 * - Google Ads (AW-XXXXXXXXXX)
 * - Google Analytics 4 (GA4)
 *
 * Features:
 * - Strict SSR and hydration safety checks
 * - Deduplication for purchase and subscription conversions (idempotent firing)
 * - Dynamic configuration via NEXT_PUBLIC_GOOGLE_ADS_ID and optional conversion labels
 * - Non-blocking execution (never throws or interrupts user interactions)
 */

export type ConversionEventName =
  | 'landing_page_view'
  | 'cta_click'
  | 'demo_started'
  | 'signup_started'
  | 'signup_completed'
  | 'email_verified'
  | 'checkout_started'
  | 'purchase'
  | 'subscription_started';

export interface BaseEventParams {
  [key: string]: any;
}

export interface CtaClickParams extends BaseEventParams {
  cta_name: string;
  cta_location: string;
  destination_url?: string;
}

export interface DemoStartedParams extends BaseEventParams {
  source?: string;
}

export interface SignupCompletedParams extends BaseEventParams {
  account_type: string;
  plan?: string;
}

export interface EmailVerifiedParams extends BaseEventParams {
  email?: string;
  plan?: string;
}

export interface CheckoutStartedParams extends BaseEventParams {
  plan: string;
  billing_cycle: 'monthly' | 'annual';
  value: number;
  currency?: string;
}

export interface PurchaseParams extends BaseEventParams {
  transaction_id: string;
  plan: string;
  billing_cycle: 'monthly' | 'annual';
  value: number;
  currency?: string;
}

export interface SubscriptionStartedParams extends BaseEventParams {
  plan: string;
  billing_cycle: 'monthly' | 'annual';
  value?: number;
}

// Memory cache of fired event keys to prevent double-firing in single SPA session
const firedEventRegistry = new Set<string>();

/**
 * Checks if window.gtag is available in the current browser runtime
 */
function isGtagAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof (window as any).gtag === 'function'
  );
}

/**
 * Dispatches an event to gtag safely
 */
function dispatchGtag(eventName: string, params: Record<string, any> = {}) {
  if (!isGtagAvailable()) return;

  try {
    (window as any).gtag('event', eventName, params);

    // If Google Ads is configured, also route conversion
    const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
    if (googleAdsId) {
      let sendTo = googleAdsId;
      if (eventName === 'purchase' && process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL) {
        sendTo = `${googleAdsId}/${process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL}`;
      } else if (eventName === 'signup_completed' && process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL) {
        sendTo = `${googleAdsId}/${process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL}`;
      } else if (eventName === 'checkout_started' && process.env.NEXT_PUBLIC_GOOGLE_ADS_CHECKOUT_LABEL) {
        sendTo = `${googleAdsId}/${process.env.NEXT_PUBLIC_GOOGLE_ADS_CHECKOUT_LABEL}`;
      }

      (window as any).gtag('event', 'conversion', {
        ...params,
        send_to: sendTo,
      });
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[CONVERSION_TRACKER] Failed to dispatch event:', eventName, err);
    }
  }
}

/**
 * Public Conversion Tracker API
 */
export const ConversionTracker = {
  /**
   * 1. Landing Page View (Non-conversion baseline view)
   */
  trackLandingPageView: (pagePath = '/') => {
    dispatchGtag('landing_page_view', {
      page_path: pagePath,
    });
  },

  /**
   * 2. CTA Click (Intent event)
   */
  trackCtaClick: (params: CtaClickParams) => {
    dispatchGtag('cta_click', {
      cta_name: params.cta_name,
      cta_location: params.cta_location,
      destination_url: params.destination_url,
    });
  },

  /**
   * 3. Demo Started (High engagement)
   */
  trackDemoStarted: (params?: DemoStartedParams) => {
    const idempotencyKey = 'demo_started_session';
    if (firedEventRegistry.has(idempotencyKey)) return;
    firedEventRegistry.add(idempotencyKey);

    dispatchGtag('demo_started', {
      source: params?.source || 'web_landing',
    });
  },

  /**
   * 4. Signup Started
   */
  trackSignupStarted: () => {
    const idempotencyKey = 'signup_started_session';
    if (firedEventRegistry.has(idempotencyKey)) return;
    firedEventRegistry.add(idempotencyKey);

    dispatchGtag('signup_started', {
      step: 1,
    });
  },

  /**
   * 5. Signup Completed (Mid-funnel conversion)
   */
  trackSignupCompleted: (params: SignupCompletedParams) => {
    dispatchGtag('signup_completed', {
      account_type: params.account_type,
      plan: params.plan || 'Starter',
      method: 'email',
    });
  },

  /**
   * 6. Email Verified
   */
  trackEmailVerified: (params?: EmailVerifiedParams) => {
    dispatchGtag('email_verified', {
      plan: params?.plan || 'Starter',
    });
  },

  /**
   * 7. Checkout Started (High-intent commercial action)
   */
  trackCheckoutStarted: (params: CheckoutStartedParams) => {
    dispatchGtag('checkout_started', {
      plan: params.plan,
      billing_cycle: params.billing_cycle,
      value: params.value,
      currency: params.currency || 'USD',
    });
  },

  /**
   * 8. Purchase (PRIMARY CONVERSION)
   * Deduplicated across page reloads and refreshes via localStorage & session registry
   */
  trackPurchase: (params: PurchaseParams) => {
    if (!params.transaction_id) return;

    const storageKey = `vnx_conv_purch_${params.transaction_id}`;

    // Deduplication check: check in-memory set and storage
    if (firedEventRegistry.has(storageKey)) {
      return;
    }

    if (typeof window !== 'undefined') {
      try {
        if (localStorage.getItem(storageKey)) {
          return;
        }
        localStorage.setItem(storageKey, Date.now().toString());
      } catch {
        // LocalStorage blocked or full
      }
    }

    firedEventRegistry.add(storageKey);

    // Primary Purchase Conversion Event
    dispatchGtag('purchase', {
      transaction_id: params.transaction_id,
      value: params.value,
      currency: params.currency || 'USD',
      items: [
        {
          item_id: params.plan.toLowerCase(),
          item_name: `${params.plan} Plan`,
          item_category: 'SaaS Subscription',
          price: params.value,
          quantity: 1,
        },
      ],
    });
  },

  /**
   * 9. Subscription Started (Lifecycle activation)
   */
  trackSubscriptionStarted: (params: SubscriptionStartedParams) => {
    const storageKey = `vnx_conv_sub_${params.plan}_${params.billing_cycle}`;
    if (firedEventRegistry.has(storageKey)) return;
    firedEventRegistry.add(storageKey);

    dispatchGtag('subscription_started', {
      plan: params.plan,
      billing_cycle: params.billing_cycle,
      value: params.value || 0,
      currency: 'USD',
    });
  },
};
