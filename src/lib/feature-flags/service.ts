import { FeatureFlagKey, FeatureFlagRecord } from '../agency/types';

export class FeatureFlagService {
  private static defaultFlags: Record<FeatureFlagKey, boolean> = {
    AI_RECEPTIONIST: true,
    WHATSAPP: true,
    SMS: true,
    REVIEWS: true,
    ESTIMATES: true,
    JOBS: true,
    PAYMENTS: true,
    REPORTS: true,
    OWNER_AI: true,
    AGENCY: true,
    WHITE_LABEL: true,
    CUSTOM_DOMAINS: true,
  };

  /**
   * Evaluate feature flag with strict cascading precedence:
   * 1. Business Override
   * 2. Agency Override
   * 3. Global Default
   */
  static evaluate(
    flagKey: FeatureFlagKey,
    context?: {
      businessFlags?: Record<string, boolean>;
      agencyFlags?: Record<string, boolean>;
      globalFlags?: Record<string, boolean>;
    }
  ): boolean {
    // 1. Check Business Override
    if (context?.businessFlags && typeof context.businessFlags[flagKey] === 'boolean') {
      return context.businessFlags[flagKey];
    }

    // 2. Check Agency Override
    if (context?.agencyFlags && typeof context.agencyFlags[flagKey] === 'boolean') {
      return context.agencyFlags[flagKey];
    }

    // 3. Check Global Flag
    if (context?.globalFlags && typeof context.globalFlags[flagKey] === 'boolean') {
      return context.globalFlags[flagKey];
    }

    // 4. Fall back to Platform Default
    return this.defaultFlags[flagKey] ?? true;
  }
}
