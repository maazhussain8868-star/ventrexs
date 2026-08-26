import { BRAND } from '@/config/brand';

export type HostContextType = 'ADMIN' | 'AGENCY' | 'CUSTOMER';

/**
 * Resolves the operational boundary from the incoming request hostname (Edge Runtime compatible)
 */
export function resolveHostContext(hostname?: string | null): HostContextType {
  if (!hostname) return 'CUSTOMER';
  const cleanHost = hostname.toLowerCase().split(':')[0];

  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || '';
  const agencyUrl = process.env.NEXT_PUBLIC_AGENCY_URL || '';

  // 1. Explicit Canonical Admin Hostnames (PayPilot, Ventrexs & Subdomains)
  if (
    cleanHost === 'admin.paypilot.com' ||
    cleanHost === 'admin.ventrexs.com' ||
    cleanHost.startsWith('admin.') ||
    (adminUrl && (cleanHost === new URL(adminUrl).hostname || cleanHost === adminUrl.replace(/^https?:\/\//, '')))
  ) {
    return 'ADMIN';
  }

  // 2. Explicit Canonical Agency Hostnames & Custom Agency Domains
  if (
    cleanHost === 'agency.paypilot.com' ||
    cleanHost === 'agency.ventrexs.com' ||
    cleanHost.startsWith('agency.') ||
    (agencyUrl && (cleanHost === new URL(agencyUrl).hostname || cleanHost === agencyUrl.replace(/^https?:\/\//, ''))) ||
    (!cleanHost.includes('ventrexs.com') && !cleanHost.includes('paypilot') && !cleanHost.includes('flowvexa') && !cleanHost.includes('localhost') && !cleanHost.includes('127.0.0.1') && cleanHost.includes('.'))
  ) {
    return 'AGENCY';
  }

  // 3. Explicit Customer / Marketing Hostnames
  if (
    cleanHost === 'paypilot.com' ||
    cleanHost === 'www.paypilot.com' ||
    cleanHost === 'app.paypilot.com' ||
    cleanHost === 'ventrexs.com' ||
    cleanHost === 'www.ventrexs.com' ||
    cleanHost === 'app.ventrexs.com' ||
    cleanHost === 'localhost' ||
    cleanHost === '127.0.0.1' ||
    cleanHost === BRAND.rawDomain ||
    cleanHost === `www.${BRAND.rawDomain}`
  ) {
    return 'CUSTOMER';
  }

  return 'CUSTOMER';
}

export function isPlatformAdminHost(hostname?: string | null): boolean {
  return resolveHostContext(hostname) === 'ADMIN';
}

export function isAgencyHost(hostname?: string | null): boolean {
  return resolveHostContext(hostname) === 'AGENCY';
}

export function isCustomerAppHost(hostname?: string | null): boolean {
  return resolveHostContext(hostname) === 'CUSTOMER';
}
