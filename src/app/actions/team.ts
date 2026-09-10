'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createSupabaseServices } from '@/lib/supabase/services';
import { TechnicianInsert, TechnicianUpdate } from '@/lib/supabase/services/technicians';
import { assertUserBelongsToBusiness } from '@/lib/auth/server-authorization';
import { revalidatePath } from 'next/cache';

async function getServerServices() {
  const supabase = await createServerSupabaseClient();
  const services = createSupabaseServices(supabase);
  return { supabase, services };
}

/**
 * 1. Fetch Technicians for a Business
 */
export async function getTechniciansAction(
  businessId: string,
  statusFilter?: 'all' | 'active' | 'inactive' | 'deactivated'
) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const technicians = await services.technicians.getTechnicians(businessId, statusFilter);
    return { success: true, data: technicians };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch team members' };
  }
}

/**
 * 2. Add Employee / Technician
 */
export async function createTechnicianAction(data: TechnicianInsert) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, data.business_id);

    const technician = await services.technicians.createTechnician(data);

    await services.audit.logAction({
      business_id: data.business_id,
      action: 'CREATE_TECHNICIAN',
      entity: 'technician',
      entity_id: technician.id,
      metadata: { name: technician.name, role: technician.role },
    });

    revalidatePath('/settings/team');
    revalidatePath('/leads');
    revalidatePath('/jobs');
    return { success: true, data: technician };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to add team member' };
  }
}

/**
 * 3. Update Employee / Technician Details
 */
export async function updateTechnicianAction(
  id: string,
  businessId: string,
  updates: TechnicianUpdate
) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const existing = await services.technicians.getTechnicianById(id);
    if (!existing || existing.business_id !== businessId) {
      return { success: false, error: 'Technician not found in this business organization' };
    }

    const updated = await services.technicians.updateTechnician(id, updates);

    await services.audit.logAction({
      business_id: businessId,
      action: 'UPDATE_TECHNICIAN',
      entity: 'technician',
      entity_id: id,
      metadata: { name: updated.name, role: updated.role, status: updated.status },
    });

    revalidatePath('/settings/team');
    revalidatePath('/leads');
    revalidatePath('/jobs');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update team member' };
  }
}

/**
 * 4. Deactivate / Activate Technician
 */
export async function setTechnicianStatusAction(
  id: string,
  businessId: string,
  status: 'active' | 'inactive' | 'deactivated'
) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const existing = await services.technicians.getTechnicianById(id);
    if (!existing || existing.business_id !== businessId) {
      return { success: false, error: 'Technician not found in this business organization' };
    }

    const updated = await services.technicians.setTechnicianStatus(id, status);

    await services.audit.logAction({
      business_id: businessId,
      action: 'SET_TECHNICIAN_STATUS',
      entity: 'technician',
      entity_id: id,
      metadata: { name: updated.name, newStatus: status },
    });

    revalidatePath('/settings/team');
    revalidatePath('/leads');
    revalidatePath('/jobs');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to change team member status' };
  }
}

/**
 * 5. Delete Technician
 */
export async function deleteTechnicianAction(id: string, businessId: string) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const existing = await services.technicians.getTechnicianById(id);
    if (!existing || existing.business_id !== businessId) {
      return { success: false, error: 'Technician not found in this business organization' };
    }

    await services.technicians.deleteTechnician(id);

    await services.audit.logAction({
      business_id: businessId,
      action: 'DELETE_TECHNICIAN',
      entity: 'technician',
      entity_id: id,
      metadata: { name: existing.name },
    });

    revalidatePath('/settings/team');
    revalidatePath('/leads');
    revalidatePath('/jobs');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to remove team member' };
  }
}
