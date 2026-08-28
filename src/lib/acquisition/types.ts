export type AcquisitionSource =
  | 'ORGANIC'
  | 'META_AD'
  | 'GOOGLE_AD'
  | 'REFERRAL'
  | 'DIRECT'
  | 'AGENCY_REFERRAL'
  | 'OTHER';

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  ref?: string;
  agency_ref?: string;
}

export interface AttributionData extends UtmParams {
  acquisition_source: AcquisitionSource;
  landing_page: string;
  referrer: string;
  first_touch_at: string;
  last_touch_at: string;
}

export type SignupAccountType = 'BUSINESS_OWNER' | 'AGENCY_OWNER' | 'DEMO_GUEST';
export type TenantType = 'BUSINESS' | 'AGENCY' | 'DEMO';
export type OnboardingStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
