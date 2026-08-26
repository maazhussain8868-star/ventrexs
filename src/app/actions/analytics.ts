'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createSupabaseServices } from '@/lib/supabase/services';
import { DateRangePreset } from '@/lib/analytics/types';

async function getServerServices() {
  const supabase = await createServerSupabaseClient();
  const services = createSupabaseServices(supabase);
  return { supabase, services };
}

/**
 * Security helper to enforce tenant isolation
 */
async function assertUserBelongsToBusiness(supabase: any, businessId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to access analytics data.');
  }

  const { data: member, error } = await supabase
    .from('business_members')
    .select('role')
    .eq('business_id', businessId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !member) {
    throw new Error('Unauthorized: Access to this business analytics is prohibited.');
  }

  return { user, role: member.role };
}

/**
 * 1. Get Executive Dashboard Metrics Server Action
 */
export async function getExecutiveDashboardAction(
  businessId: string,
  preset: DateRangePreset = '30d',
  customStart?: string,
  customEnd?: string
) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const metrics = await services.analytics.getExecutiveDashboardMetrics(
      businessId,
      preset,
      customStart,
      customEnd
    );
    const funnel = services.analytics.getConversionFunnel();
    const insights = services.analytics.generateOwnerInsights();
    const briefing = services.analytics.generateDailyBriefing();
    const anomalies = services.analytics.detectAnomalies(metrics);

    return {
      success: true,
      data: {
        metrics,
        funnel,
        insights,
        briefing,
        anomalies,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load executive dashboard' };
  }
}

/**
 * 2. Get Detailed Reports Analytics Action
 */
export async function getDetailedReportsAction(
  businessId: string,
  preset: DateRangePreset = '30d',
  customStart?: string,
  customEnd?: string
) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const metrics = await services.analytics.getExecutiveDashboardMetrics(
      businessId,
      preset,
      customStart,
      customEnd
    );
    const funnel = services.analytics.getConversionFunnel();
    const servicesBreakdown = services.analytics.getServicePerformance();
    const technicians = services.analytics.getTechnicianPerformance();
    const sources = services.analytics.getLeadSourceRoi();

    return {
      success: true,
      data: {
        metrics,
        funnel,
        servicesBreakdown,
        technicians,
        sources,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load detailed reports' };
  }
}

/**
 * 3. Get Technician Performance Reports Action
 */
export async function getTechnicianReportsAction(businessId: string) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const technicians = services.analytics.getTechnicianPerformance();
    return { success: true, data: technicians };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load technician reports' };
  }
}

/**
 * 4. Get Lead Source ROI Reports Action
 */
export async function getLeadSourceRoiAction(businessId: string) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const sources = services.analytics.getLeadSourceRoi();
    return { success: true, data: sources };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load lead source ROI reports' };
  }
}

/**
 * 5. Export Report CSV Action
 */
export async function exportReportCsvAction(
  businessId: string,
  reportType: 'revenue' | 'leads' | 'jobs' | 'technicians' | 'services' = 'revenue'
) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const { data: business } = await supabase
      .from('businesses')
      .select('name')
      .eq('id', businessId)
      .maybeSingle();

    const businessName = business?.name || 'Ventrexs Service Business';
    const csvContent = services.analytics.generateCsvExport(reportType, businessName);

    return {
      success: true,
      csvContent,
      filename: `${businessName.toLowerCase().replace(/\s+/g, '_')}_${reportType}_report.csv`,
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to generate CSV export' };
  }
}
