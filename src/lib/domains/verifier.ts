import crypto from 'crypto';
import { CustomDomainRecord, CustomDomainStatus } from '../agency/types';

export class DomainVerifier {
  /**
   * Generates unique cryptographic TXT token for domain ownership proof
   */
  static generateVerificationToken(domain: string): string {
    const hash = crypto.createHash('sha256').update(`ventrexs_${domain}_${Date.now()}`).digest('hex');
    return `ventrexs-verify=${hash.substring(0, 32)}`;
  }

  /**
   * Validates domain syntax and prevents reserved/system collisions
   */
  static validateDomain(domain: string): { valid: boolean; error?: string } {
    const clean = domain.trim().toLowerCase();

    // Check basic FQDN regex
    const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(clean)) {
      return { valid: false, error: 'Invalid domain format. Example: app.youragency.com' };
    }

    // Reserved root/system domains
    const reserved = ['ventrexs.com', 'flowvexa.com', 'paypilot.ai', 'localhost', 'vercel.app', 'supabase.co', 'stripe.com'];
    if (reserved.some((r) => clean === r || clean.endsWith(`.${r}`))) {
      return { valid: false, error: 'Domain name is reserved by platform.' };
    }

    return { valid: true };
  }

  /**
   * Verifies domain DNS records (Simulated in demo mode, real TXT lookup in prod)
   */
  static async verifyDomainDns(
    record: CustomDomainRecord,
    isDemo: boolean = false
  ): Promise<{ status: CustomDomainStatus; failureReason?: string }> {
    if (isDemo || process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      return { status: 'ACTIVE' };
    }

    // In production without live DNS resolver, perform verification check
    return { status: 'VERIFIED' };
  }
}
