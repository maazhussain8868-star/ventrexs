'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createSupabaseServices } from '@/lib/supabase/services';
import { WhiteLabelBranding, CustomDomainRecord, AgencyBusinessItem } from '@/lib/agency/types';
import { DomainVerifier } from '@/lib/domains/verifier';
import { AuditService } from '@/lib/audit/service';
import { revalidatePath } from 'next/cache';

async function getAuthAgencyUser(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required for agency operations.');
  return user;
}

/**
 * 1. Fetch Agency Overview Metrics
 */
export async function getAgencyDashboardAction(agencyId?: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const user = await getAuthAgencyUser(supabase);

    return {
      success: true,
      data: {
        totalBusinesses: 12,
        activeBusinesses: 10,
        trialBusinesses: 2,
        suspendedBusinesses: 0,
        totalMrr: 1840,
        activeSubscriptions: 12,
        recentActivity: [
          { event: 'Created client business "Valley Heating & Air"', date: '2 hours ago' },
          { event: 'Custom domain "portal.apexagency.com" verified', date: '1 day ago' },
          { event: 'Updated white-label theme colors', date: '3 days ago' },
        ],
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 2. Fetch Agency Managed Businesses
 */
export async function getAgencyBusinessesAction(agencyId?: string) {
  try {
    const supabase = await createServerSupabaseClient();
    await getAuthAgencyUser(supabase);

    const mockBusinesses: AgencyBusinessItem[] = [
      {
        id: 'ab_1',
        agencyId: agencyId || 'ag_1',
        businessId: 'biz_01',
        businessName: 'Apex Precision HVAC',
        businessEmail: 'service@apexhvac.com',
        industry: 'HVAC',
        plan: 'Professional',
        status: 'active',
        mrr: 49,
        jobsCount: 142,
        invoicesCount: 128,
        assignedAt: '2026-06-01T00:00:00Z',
      },
      {
        id: 'ab_2',
        agencyId: agencyId || 'ag_1',
        businessId: 'biz_02',
        businessName: 'Precision Roofing & Siding',
        businessEmail: 'contact@precisionroofing.com',
        industry: 'Roofing',
        plan: 'Enterprise',
        status: 'active',
        mrr: 199,
        jobsCount: 88,
        invoicesCount: 79,
        assignedAt: '2026-07-15T00:00:00Z',
      },
      {
        id: 'ab_3',
        agencyId: agencyId || 'ag_1',
        businessId: 'biz_03',
        businessName: 'Metro Pro Plumbing',
        businessEmail: 'office@metroplumbing.io',
        industry: 'Plumbing',
        plan: 'Starter',
        status: 'trial',
        mrr: 19,
        jobsCount: 24,
        invoicesCount: 19,
        assignedAt: '2026-08-10T00:00:00Z',
      },
    ];

    return { success: true, data: mockBusinesses };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 3. Switch Business Context (with audit logging)
 */
export async function switchBusinessContextAction(targetBusinessId: string, agencyId?: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const user = await getAuthAgencyUser(supabase);

    // Audit context switch
    const auditPayload = AuditService.formatAuditEvent({
      actorEmail: user.email || 'agency@ventrexs.com',
      actorRole: 'AGENCY_MANAGER',
      eventType: 'agency_context_switch',
      description: `Agency switched active tenant context to business "${targetBusinessId}"`,
      businessId: targetBusinessId,
      agencyId,
      userId: user.id,
    });

    try {
      await (supabase as any).from('audit_events').insert(auditPayload as any);
    } catch {
      // Non-blocking
    }

    revalidatePath('/dashboard');
    return { success: true, activeBusinessId: targetBusinessId };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 4. Get White-Label Branding
 */
export async function getAgencyBrandingAction(agencyId?: string) {
  try {
    return {
      success: true,
      data: {
        brandName: 'Apex Trade OS',
        logoUrl: '/favicon.ico',
        primaryColor: '#0284c7',
        secondaryColor: '#0f172a',
        accentColor: '#059669',
        loginHeadline: 'Client Portal Login',
        loginTagline: 'Professional service management powered by modern AI.',
        supportEmail: 'help@apextradeos.com',
        supportPhone: '+1 (555) 901-2800',
        footerText: 'Powered by Apex Trade Cloud',
        customPrivacyUrl: 'https://apextradeos.com/privacy',
        customTermsUrl: 'https://apextradeos.com/terms',
        isActive: true,
      } as WhiteLabelBranding,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 5. Update White-Label Branding
 */
export async function updateAgencyBrandingAction(branding: WhiteLabelBranding, agencyId?: string) {
  try {
    const supabase = await createServerSupabaseClient();
    await getAuthAgencyUser(supabase);

    revalidatePath('/agency/branding');
    return { success: true, data: branding };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 6. Get Custom Domains
 */
export async function getAgencyDomainsAction(agencyId?: string) {
  try {
    const mockDomains: CustomDomainRecord[] = [
      {
        id: 'dom_1',
        agencyId: agencyId || 'ag_1',
        domain: 'portal.apexservices.com',
        status: 'ACTIVE',
        txtVerificationToken: 'ventrexs-verify=8a9b2c3d4e5f60718293a4b5c6d7e8f9',
        sslStatus: 'active',
        verifiedAt: '2026-08-01T12:00:00Z',
        createdAt: '2026-08-01T10:00:00Z',
      },
    ];
    return { success: true, data: mockDomains };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 7. Add Custom Domain
 */
export async function addCustomDomainAction(domain: string, agencyId?: string) {
  try {
    const validation = DomainVerifier.validateDomain(domain);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const token = DomainVerifier.generateVerificationToken(domain);
    const newDomain: CustomDomainRecord = {
      id: `dom_${Date.now()}`,
      agencyId: agencyId || 'ag_1',
      domain: domain.trim().toLowerCase(),
      status: 'PENDING',
      txtVerificationToken: token,
      sslStatus: 'pending',
      createdAt: new Date().toISOString(),
    };

    revalidatePath('/agency/domains');
    return { success: true, data: newDomain };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 8. Verify Custom Domain
 */
export async function verifyCustomDomainAction(domainId: string, domainName: string) {
  try {
    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    const mockRecord: CustomDomainRecord = {
      id: domainId,
      domain: domainName,
      status: 'VERIFYING',
      txtVerificationToken: 'ventrexs-verify=mock',
      sslStatus: 'pending',
      createdAt: new Date().toISOString(),
    };

    const res = await DomainVerifier.verifyDomainDns(mockRecord, isDemo);
    revalidatePath('/agency/domains');
    return { success: true, status: res.status };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
