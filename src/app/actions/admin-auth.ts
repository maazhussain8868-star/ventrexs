'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { PlatformAdminService } from '@/lib/admin/service';
import { AdminLoginAuditParams } from '@/lib/admin/types';

async function assertCallerIsPlatformAdmin() {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  if (isDemoMode) return true;

  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || !user.email) {
    throw new Error('Unauthorized: Authentication required.');
  }

  if (!PlatformAdminService.isAuthorizedAdmin(user.email)) {
    throw new Error('Unauthorized: Platform Administrator privileges required.');
  }

  return true;
}

export async function getPlatformAdminsAction() {
  try {
    await assertCallerIsPlatformAdmin();
    const admins = PlatformAdminService.getPlatformAdmins();
    return { success: true, data: admins };
  } catch (error: any) {
    return { success: false, error: error.message || 'Unauthorized' };
  }
}

export async function recordAdminLoginAction(params: AdminLoginAuditParams) {
  try {
    PlatformAdminService.recordAdminLogin(params);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function suspendAdminAction(adminId: string, actorEmail: string) {
  try {
    await assertCallerIsPlatformAdmin();
    const success = PlatformAdminService.suspendAdmin(adminId, actorEmail);
    return { success };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function reactivateAdminAction(adminId: string, actorEmail: string) {
  try {
    await assertCallerIsPlatformAdmin();
    const success = PlatformAdminService.reactivateAdmin(adminId, actorEmail);
    return { success };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
