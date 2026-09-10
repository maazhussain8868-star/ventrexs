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
 * Helper to fetch real business workspace records for calculations (never returning fake demo data)
 */
async function getWorkspaceData(supabase: any, businessId: string) {
  const [
    { data: invoices },
    { data: leads },
    { data: appointments },
    { data: jobs },
    { data: estimates },
    { data: receptionistConversations },
  ] = await Promise.all([
    supabase.from('invoices').select('*').eq('business_id', businessId),
    supabase.from('leads').select('*').eq('business_id', businessId),
    supabase.from('appointments').select('*').eq('business_id', businessId),
    supabase.from('jobs').select('*').eq('business_id', businessId),
    supabase.from('estimates').select('*').eq('business_id', businessId),
    supabase.from('receptionist_conversations').select('*').eq('business_id', businessId),
  ]);

  return {
    invoices: (invoices || []).map((i: any) => ({
      ...i,
      totalAmount: Number(i.original_amount || 0),
      originalAmount: Number(i.original_amount || 0),
      remainingBalance: Number(i.remaining_balance || 0),
      amountPaid: Number(i.amount_paid || 0),
      paymentsReceived: Number(i.amount_paid || 0),
    })),
    leads: (leads || []).map((l: any) => ({
      ...l,
      estimatedValue: Number(l.estimated_value || 0),
      serviceRequested: l.service_requested,
    })),
    appointments: appointments || [],
    jobs: (jobs || []).map((j: any) => ({
      ...j,
      estimatedTotal: Number(j.estimated_total || 0),
      actualTotal: Number(j.actual_total || 0),
      technicianName: j.technician_name || j.assigned_tech_name,
      assignedTechName: j.assigned_tech_name || j.technician_name,
    })),
    estimates: (estimates || []).map((e: any) => ({
      ...e,
      totalAmount: Number(e.total_amount || 0),
    })),
    receptionistConversations: receptionistConversations || [],
    isDemo: false,
  };
}

/**
 * 1. Get Executive Dashboard Metrics Server Action (Computed from Real Data)
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

    const workspaceData = await getWorkspaceData(supabase, businessId);

    const metrics = services.analytics.getExecutiveDashboardMetricsFromData(
      workspaceData,
      preset,
      customStart,
      customEnd
    );
    const funnel = services.analytics.getConversionFunnelFromData(workspaceData);
    const insights = services.analytics.generateOwnerInsightsFromData(workspaceData);
    const briefing = services.analytics.generateDailyBriefingFromData(workspaceData);
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
 * 2. Get Detailed Reports Analytics Action (Computed from Real Data)
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

    const workspaceData = await getWorkspaceData(supabase, businessId);

    const metrics = services.analytics.getExecutiveDashboardMetricsFromData(
      workspaceData,
      preset,
      customStart,
      customEnd
    );
    const funnel = services.analytics.getConversionFunnelFromData(workspaceData);
    const servicesBreakdown = services.analytics.getServicePerformanceFromData(workspaceData);
    const technicians = services.analytics.getTechnicianPerformanceFromData(workspaceData);
    const sources = services.analytics.getLeadSourceRoiFromData(workspaceData);

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
 * 3. Get Technician Performance Reports Action (Computed from Real Jobs)
 */
export async function getTechnicianReportsAction(businessId: string) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const workspaceData = await getWorkspaceData(supabase, businessId);
    const technicians = services.analytics.getTechnicianPerformanceFromData(workspaceData);

    return { success: true, data: technicians };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load technician reports' };
  }
}

/**
 * 4. Get Lead Source ROI Reports Action (Computed from Real Leads & Invoices)
 */
export async function getLeadSourceRoiAction(businessId: string) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const workspaceData = await getWorkspaceData(supabase, businessId);
    const sources = services.analytics.getLeadSourceRoiFromData(workspaceData);

    return { success: true, data: sources };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load lead source ROI reports' };
  }
}

/**
 * 5. Export Report CSV Action (Generated from Real Data)
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
    const workspaceData = await getWorkspaceData(supabase, businessId);
    const csvContent = services.analytics.generateCsvExport(reportType, businessName, workspaceData);

    return {
      success: true,
      csvContent,
      filename: `${businessName.toLowerCase().replace(/\s+/g, '_')}_${reportType}_report.csv`,
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to generate CSV export' };
  }
}
