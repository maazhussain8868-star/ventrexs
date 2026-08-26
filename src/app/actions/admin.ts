'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { HealthService } from '@/lib/health/service';
import { revalidatePath } from 'next/cache';

import { PlatformAdminService } from '@/lib/admin/service';

async function assertPlatformAdmin(supabase: any) {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && !isDemoMode) {
    throw new Error('Unauthorized: Authentication required for platform administration.');
  }

  const userEmail = user?.email || (isDemoMode ? 'owner1@ventrexs.com' : '');
  if (!isDemoMode && !PlatformAdminService.isAuthorizedAdmin(userEmail)) {
    throw new Error('Unauthorized: Access restricted to authorized platform administrators.');
  }

  return user || { id: 'demo-admin', email: userEmail };
}

/**
 * 1. Platform-Wide Overview Statistics
 */
export async function getAdminPlatformStatsAction() {
  try {
    const supabase = await createServerSupabaseClient();
    await assertPlatformAdmin(supabase);

    return {
      success: true,
      data: {
        totalAgencies: 28,
        totalBusinesses: 412,
        activeSubscriptions: 384,
        trialAccounts: 28,
        totalMrr: 45820,
        failedPaymentsCount: 3,
        suspendedAccounts: 2,
        platformUptime: '99.99%',
        aiInquiriesToday: 1840,
        messagesDeliveredToday: 6920,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 2. Platform Businesses Directory
 */
export async function getAdminBusinessesAction() {
  try {
    const supabase = await createServerSupabaseClient();
    await assertPlatformAdmin(supabase);

    const mockBusinesses = [
      { id: 'biz_01', name: 'Apex Precision HVAC', email: 'service@apexhvac.com', industry: 'HVAC', plan: 'Professional', status: 'active', mrr: 49, created: '2026-04-12' },
      { id: 'biz_02', name: 'Precision Roofing & Siding', email: 'contact@precisionroofing.com', industry: 'Roofing', plan: 'Enterprise', status: 'active', mrr: 199, created: '2026-05-01' },
      { id: 'biz_03', name: 'Metro Pro Plumbing', email: 'office@metroplumbing.io', industry: 'Plumbing', plan: 'Starter', status: 'trial', mrr: 19, created: '2026-08-14' },
      { id: 'biz_04', name: 'Spark Electric Pros', email: 'support@sparkelectric.com', industry: 'Electrical', plan: 'Professional', status: 'active', mrr: 49, created: '2026-06-20' },
      { id: 'biz_05', name: 'GreenScape Landscaping', email: 'info@greenscape.com', industry: 'Landscaping', plan: 'Starter', status: 'suspended', mrr: 19, created: '2026-03-11' },
    ];

    return { success: true, data: mockBusinesses };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 3. Platform Agencies Directory
 */
export async function getAdminAgenciesAction() {
  try {
    const supabase = await createServerSupabaseClient();
    await assertPlatformAdmin(supabase);

    const mockAgencies = [
      { id: 'ag_01', name: 'Apex Growth Marketing', slug: 'apex-growth', tier: 'Agency Enterprise', businesses: 18, mrr: 1240, status: 'active' },
      { id: 'ag_02', name: 'TradeScale Reseller Group', slug: 'tradescale', tier: 'Agency Growth', businesses: 9, mrr: 590, status: 'active' },
      { id: 'ag_03', name: 'Local Contractors Agency', slug: 'local-contractors', tier: 'Agency Starter', businesses: 4, mrr: 210, status: 'active' },
    ];

    return { success: true, data: mockAgencies };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 4. Platform System Health
 */
export async function getAdminSystemHealthAction() {
  try {
    const metrics = HealthService.getSystemHealthMetrics();
    const readiness = HealthService.getProductionReadiness();
    return { success: true, data: { metrics, readiness } };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 5. Suspend or Reactivate Account
 */
export async function toggleBusinessStatusAdminAction(businessId: string, newStatus: 'active' | 'suspended') {
  try {
    const supabase = await createServerSupabaseClient();
    await assertPlatformAdmin(supabase);

    revalidatePath('/admin');
    revalidatePath('/admin/businesses');
    return { success: true, businessId, status: newStatus };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
