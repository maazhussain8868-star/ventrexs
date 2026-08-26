'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createSupabaseServices } from '@/lib/supabase/services';
import { JobInsert, JobUpdate } from '@/lib/supabase/services/operations';
import { assertUserBelongsToBusiness } from '@/lib/auth/server-authorization';
import { revalidatePath } from 'next/cache';

async function getServerServices() {
  const supabase = await createServerSupabaseClient();
  const services = createSupabaseServices(supabase);
  return { supabase, services };
}

/**
 * 1. Get Jobs List for Business
 */
export async function getJobsAction(businessId: string) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const jobs = await services.operations.getJobs(businessId);
    return { success: true, data: jobs };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch jobs' };
  }
}

/**
 * 2. Get Job with Full Relation Details
 */
export async function getJobWithDetailsAction(id: string, businessId: string) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const job = await services.operations.getJobWithDetails(id);
    if (!job || job.business_id !== businessId) {
      return { success: false, error: 'Job not found or inaccessible' };
    }

    const activities = await services.operations.getJobActivities(id);

    return { success: true, data: { ...job, activities } };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch job details' };
  }
}

/**
 * 3. Create Job (Supports linking from Lead, Customer, Appointment)
 */
export async function createJobAction(data: JobInsert) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, data.business_id);

    const { data: { user } } = await supabase.auth.getUser();

    // If customer_id is not provided but lead_id is present, check if lead is linked to existing customer
    if (!data.customer_id && data.lead_id) {
      const lead = await services.leads.getLeadById(data.lead_id);
      if (lead?.customer_id) {
        data.customer_id = lead.customer_id;
      }
    }

    const job = await services.operations.createJob(data);

    // Record initial job activity
    await services.operations.addJobActivity({
      business_id: data.business_id,
      job_id: job.id,
      activity_type: 'JOB_CREATED',
      title: 'Work Order Created',
      description: `Job "${job.title}" created for service: ${job.service_type}`,
      user_id: user?.id || null,
      user_name: (user?.user_metadata?.name as string) || 'System Dispatcher',
      metadata: { priority: job.priority, status: job.status },
    });

    // If linked to a lead, log lead activity
    if (data.lead_id) {
      await services.leads.addActivity({
        business_id: data.business_id,
        lead_id: data.lead_id,
        activity_type: 'job_created',
        title: 'Work Order Dispatched',
        description: `Linked to Job: ${job.title}`,
        metadata: { job_id: job.id },
      });
    }

    await services.audit.logAction({
      business_id: data.business_id,
      action: 'CREATE_JOB',
      entity: 'job',
      entity_id: job.id,
      metadata: { title: job.title, service: job.service_type },
    });

    revalidatePath('/jobs');
    revalidatePath('/dashboard');
    return { success: true, data: job };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create job' };
  }
}

/**
 * 4. Update Job
 */
export async function updateJobAction(id: string, businessId: string, updates: JobUpdate) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const existing = await services.operations.getJobById(id);
    if (!existing || existing.business_id !== businessId) {
      return { success: false, error: 'Job not found' };
    }

    const updated = await services.operations.updateJob(id, updates);

    revalidatePath('/jobs');
    revalidatePath(`/jobs/${id}`);
    revalidatePath('/dashboard');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update job' };
  }
}

/**
 * 5. Assign / Reassign Technician
 */
export async function assignJobTechnicianAction(params: {
  jobId: string;
  businessId: string;
  techId?: string | null;
  techName: string | null;
}) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, params.businessId);

    const existing = await services.operations.getJobById(params.jobId);
    if (!existing || existing.business_id !== params.businessId) {
      return { success: false, error: 'Job not found' };
    }

    const { data: { user } } = await supabase.auth.getUser();

    const updated = await services.operations.updateJob(params.jobId, {
      assigned_tech_id: params.techId || null,
      assigned_tech_name: params.techName || null,
      technician_name: params.techName || 'Unassigned',
      status: existing.status === 'NEW' && params.techName ? 'SCHEDULED' : existing.status,
    });

    await services.operations.addJobActivity({
      business_id: params.businessId,
      job_id: params.jobId,
      activity_type: 'TECHNICIAN_ASSIGNED',
      title: params.techName ? `Technician Assigned: ${params.techName}` : 'Technician Unassigned',
      description: params.techName ? `Assigned to ${params.techName}` : 'Work order unassigned',
      user_id: user?.id || null,
      user_name: (user?.user_metadata?.name as string) || 'Dispatcher',
      metadata: { techName: params.techName, techId: params.techId },
    });

    revalidatePath('/jobs');
    revalidatePath(`/jobs/${params.jobId}`);
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to assign technician' };
  }
}

/**
 * 6. Update Job Status & Transition
 */
export async function updateJobStatusAction(params: {
  jobId: string;
  businessId: string;
  status: string;
  notes?: string;
}) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, params.businessId);

    const existing = await services.operations.getJobById(params.jobId);
    if (!existing || existing.business_id !== params.businessId) {
      return { success: false, error: 'Job not found' };
    }

    const { data: { user } } = await supabase.auth.getUser();
    const isCompleting = params.status === 'COMPLETED';

    const updated = await services.operations.updateJob(params.jobId, {
      status: params.status,
      completed_at: isCompleting ? new Date().toISOString() : existing.completed_at,
      completed_by: isCompleting ? user?.id || null : existing.completed_by,
      notes: params.notes ? `${existing.notes || ''}\n[Status: ${params.status}] ${params.notes}`.trim() : existing.notes,
    });

    await services.operations.addJobActivity({
      business_id: params.businessId,
      job_id: params.jobId,
      activity_type: isCompleting ? 'JOB_COMPLETED' : 'STATUS_CHANGED',
      title: `Job Status: ${params.status.replace('_', ' ')}`,
      description: params.notes || `Moved from ${existing.status} to ${params.status}`,
      user_id: user?.id || null,
      user_name: (user?.user_metadata?.name as string) || 'Operator',
      metadata: { previousStatus: existing.status, newStatus: params.status },
    });

    revalidatePath('/jobs');
    revalidatePath(`/jobs/${params.jobId}`);
    revalidatePath('/dashboard');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update job status' };
  }
}

/**
 * 7. Add Job Activity Note / Log
 */
export async function addJobActivityAction(params: {
  jobId: string;
  businessId: string;
  activityType: string;
  title: string;
  description?: string;
  metadata?: any;
}) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, params.businessId);

    const { data: { user } } = await supabase.auth.getUser();

    const activity = await services.operations.addJobActivity({
      business_id: params.businessId,
      job_id: params.jobId,
      activity_type: params.activityType,
      title: params.title,
      description: params.description || null,
      metadata: params.metadata || {},
      user_id: user?.id || null,
      user_name: (user?.user_metadata?.name as string) || 'Field Technician',
    });

    revalidatePath(`/jobs/${params.jobId}`);
    return { success: true, data: activity };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to add job activity' };
  }
}

/**
 * 8. Delete Job
 */
export async function deleteJobAction(id: string, businessId: string) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const existing = await services.operations.getJobById(id);
    if (!existing || existing.business_id !== businessId) {
      return { success: false, error: 'Job not found' };
    }

    await services.operations.deleteJob(id);

    revalidatePath('/jobs');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete job' };
  }
}
