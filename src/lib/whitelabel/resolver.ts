import { WhiteLabelBranding } from '../agency/types';
import { BRAND } from '@/config/brand';

export const DEFAULT_VENTREXS_BRANDING: WhiteLabelBranding = {
  brandName: BRAND.name,
  logoUrl: '/favicon.ico',
  faviconUrl: '/favicon.ico',
  primaryColor: '#0284c7',
  secondaryColor: '#0f172a',
  accentColor: '#059669',
  loginHeadline: 'AI-Powered Business Operations Platform',
  loginTagline: 'Automate reception, CRM, scheduling, invoicing, payments, and reputation with AI.',
  emailSenderName: `${BRAND.shortName} Notifications`,
  supportEmail: BRAND.supportEmail,
  supportPhone: '+1 (555) 019-2831',
  footerText: `Powered by ${BRAND.name} • Built for Modern Trade Contractors`,
  customPrivacyUrl: '/privacy',
  customTermsUrl: '/terms',
  isActive: true,
};

// Backward-compatible aliases
export const DEFAULT_FLOWVEXA_BRANDING = DEFAULT_VENTREXS_BRANDING;
export const DEFAULT_PAYPILOT_BRANDING = DEFAULT_VENTREXS_BRANDING;

export class WhiteLabelResolver {
  /**
   * Resolves branding with cascading priority:
   * 1. Business Custom Override
   * 2. Agency Branding
   * 3. Default Ventrexs AI
   */
  static resolve(
    businessBranding?: Partial<WhiteLabelBranding> | null,
    agencyBranding?: Partial<WhiteLabelBranding> | null
  ): WhiteLabelBranding {
    const base = { ...DEFAULT_VENTREXS_BRANDING };

    if (agencyBranding && agencyBranding.isActive !== false) {
      Object.assign(base, Object.fromEntries(Object.entries(agencyBranding).filter(([_, v]) => v !== undefined && v !== null && v !== '')));
    }

    if (businessBranding && businessBranding.isActive !== false) {
      Object.assign(base, Object.fromEntries(Object.entries(businessBranding).filter(([_, v]) => v !== undefined && v !== null && v !== '')));
    }

    return base;
  }
}

export function resolveWhitelabelBranding(options?: {
  businessBranding?: Partial<WhiteLabelBranding> | null;
  agencyBranding?: Partial<WhiteLabelBranding> | null;
  hostname?: string | null;
}): WhiteLabelBranding & { effectiveBrandName: string; effectiveSupportEmail: string } {
  const resolved = WhiteLabelResolver.resolve(options?.businessBranding, options?.agencyBranding);
  return {
    ...resolved,
    effectiveBrandName: resolved.brandName,
    effectiveSupportEmail: resolved.supportEmail || BRAND.supportEmail,
  };
}
