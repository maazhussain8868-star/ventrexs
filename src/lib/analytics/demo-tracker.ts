/**
 * ==============================================================================
 * VENTREXS AI — PUBLIC RECEPTIONIST DEMO ANALYTICS TRACKER
 * Dispatches GA4 conversion events and analytics tracking for the AI receptionist test
 * ==============================================================================
 */

export type DemoAnalyticsEvent =
  | 'demo_page_viewed'
  | 'business_setup_completed'
  | 'ai_demo_started'
  | 'ai_demo_completed'
  | 'cta_clicked'
  | 'signup_started';

export interface DemoEventParams {
  business_type?: string;
  business_name?: string;
  conversation_duration_seconds?: number;
  message_count?: number;
  detected_intent?: string;
  lead_captured?: boolean;
  cta_label?: string;
  target_url?: string;
  [key: string]: any;
}

/**
 * Tracks a receptionist demo event to GA4/gtag and console in dev mode
 */
export function trackDemoEvent(
  eventName: DemoAnalyticsEvent,
  params?: DemoEventParams
): void {
  if (typeof window === 'undefined') return;

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        event_category: 'AI_Receptionist_Demo',
        event_label: params?.business_type || 'General',
        ...params,
      });
    }

    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: eventName,
        ...params,
      });
    }
  } catch (err) {
    // Non-blocking telemetry
    console.debug(`[Analytics] Event dispatch error (${eventName}):`, err);
  }
}
