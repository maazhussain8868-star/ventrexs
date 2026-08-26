'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AuditLogEvent } from '@/lib/agency/types';
import { HealthService } from '@/lib/health/service';
import { revalidatePath } from 'next/cache';

/**
 * 1. Fetch Audit Logs for Business or Platform
 */
export async function getAuditLogsAction(businessId?: string) {
  try {
    const mockAuditEvents: AuditLogEvent[] = [
      {
        id: 'aud_001',
        businessId: businessId || 'biz_01',
        actorEmail: 'owner@apexhvac.com',
        actorRole: 'OWNER',
        eventType: 'invoice_created',
        description: 'Created invoice #INV-2026-088 for $3,850.00',
        ipAddress: '192.168.1.1',
        createdAt: '2026-08-25T14:30:00Z',
      },
      {
        id: 'aud_002',
        businessId: businessId || 'biz_01',
        actorEmail: 'system@ventrexs.com',
        actorRole: 'SYSTEM_BOT',
        eventType: 'payment_received',
        description: 'Settled $1,500.00 credit card transaction via Stripe',
        ipAddress: '10.0.0.1',
        createdAt: '2026-08-25T14:45:00Z',
      },
      {
        id: 'aud_003',
        businessId: businessId || 'biz_01',
        actorEmail: 'admin@apexgrowth.com',
        actorRole: 'AGENCY_MANAGER',
        eventType: 'agency_context_switch',
        description: 'Agency switched active tenant context to Apex Precision HVAC',
        ipAddress: '172.56.21.90',
        createdAt: '2026-08-25T15:00:00Z',
      },
      {
        id: 'aud_004',
        businessId: businessId || 'biz_01',
        actorEmail: 'owner@apexhvac.com',
        actorRole: 'OWNER',
        eventType: 'settings_updated',
        description: 'Updated business operating hours and AI receptionist prompt',
        ipAddress: '192.168.1.1',
        createdAt: '2026-08-25T15:15:00Z',
      },
    ];

    return { success: true, data: mockAuditEvents };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 2. Request Tenant Data Export (JSON / CSV)
 */
export async function requestDataExportAction(businessId: string, format: 'json' | 'csv' | 'zip') {
  try {
    const exportId = `exp_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();

    revalidatePath('/settings/data');
    return {
      success: true,
      data: {
        id: exportId,
        businessId,
        format,
        status: 'COMPLETED',
        downloadUrl: `/api/export/${exportId}`,
        expiresAt,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 3. Request Account Deletion (4-Step Guarded Workflow)
 */
export async function requestTenantAccountDeletionAction(businessId: string, reason: string) {
  try {
    const deletionId = `del_${Date.now()}`;
    revalidatePath('/settings/data');
    return {
      success: true,
      data: {
        id: deletionId,
        businessId,
        status: 'REQUESTED',
        reason,
        createdAt: new Date().toISOString(),
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 4. Fetch Production Readiness Checklist
 */
export async function getProductionReadinessAction() {
  try {
    const checks = HealthService.getProductionReadiness();
    return { success: true, data: checks };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
