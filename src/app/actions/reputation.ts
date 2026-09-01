'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createSupabaseServices } from '@/lib/supabase/services';
import { assertUserBelongsToBusiness } from '@/lib/auth/server-authorization';
import { sendCommunicationAction } from './communications';
import { ReviewSettings, ReviewChannel, FollowUpStatus } from '@/types';
import { revalidatePath } from 'next/cache';

async function getServerServices() {
  const supabase = await createServerSupabaseClient();
  const services = createSupabaseServices(supabase);
  return { supabase, services };
}

/**
 * 1. Get Reputation Settings for Business
 */
export async function getReviewSettingsAction(businessId: string) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    let settings = await services.reputation.getSettings(businessId);
    if (!settings) {
      // Create sensible production defaults if none exist
      settings = await services.reputation.upsertSettings({
        business_id: businessId,
        automation_enabled: true,
        request_delay_hours: 24,
        primary_platform: 'google',
        default_channel: 'sms',
        max_requests_per_job: 2,
        positive_threshold: 4,
      });
    }

    return { success: true, data: settings };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch review settings' };
  }
}

/**
 * 2. Update Reputation Settings
 */
export async function updateReviewSettingsAction(businessId: string, updates: Partial<ReviewSettings>) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const data = await services.reputation.upsertSettings({
      business_id: businessId,
      automation_enabled: updates.automationEnabled,
      request_delay_hours: updates.requestDelayHours,
      primary_platform: updates.primaryPlatform,
      google_review_url: updates.googleReviewUrl || null,
      direct_feedback_url: updates.directFeedbackUrl || null,
      default_channel: updates.defaultChannel,
      max_requests_per_job: updates.maxRequestsPerJob,
      positive_threshold: updates.positiveThreshold,
      email_subject_template: updates.emailSubjectTemplate || null,
      email_body_template: updates.emailBodyTemplate || null,
      sms_body_template: updates.smsBodyTemplate || null,
      whatsapp_body_template: updates.whatsappBodyTemplate || null,
    });

    revalidatePath('/settings/reputation');
    revalidatePath('/reputation');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update review settings' };
  }
}

/**
 * 3. Get Review Requests List
 */
export async function getReviewRequestsAction(businessId: string, filters?: {
  status?: string;
  channel?: string;
  customerId?: string;
  jobId?: string;
}) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const requests = await services.reputation.getReviewRequests(businessId, filters);
    return { success: true, data: requests };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch review requests' };
  }
}

/**
 * 4. Get Review Request By ID
 */
export async function getReviewRequestByIdAction(id: string, businessId: string) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const req = await services.reputation.getReviewRequestById(id);
    if (!req || req.business_id !== businessId) {
      return { success: false, error: 'Review request not found or inaccessible' };
    }

    return { success: true, data: req };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch review request' };
  }
}

/**
 * 5. Create Review Request (Enforces duplicate prevention and idempotency)
 */
export async function createReviewRequestAction(params: {
  businessId: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  jobId?: string;
  technicianName?: string;
  channel?: 'email' | 'sms' | 'whatsapp';
  scheduledFor?: string;
  idempotencyKey?: string;
}) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, params.businessId);

    const channel = params.channel || 'sms';
    const idemKey = params.idempotencyKey || `req-${params.businessId}-${params.jobId || params.customerId || Date.now()}-${channel}`;

    // Prevent duplicate requests if idempotency key already exists
    const existing = await services.reputation.getReviewRequestByIdempotencyKey(idemKey);
    if (existing) {
      return { success: true, data: existing, duplicate: true };
    }

    const settings = await services.reputation.getSettings(params.businessId);
    const feedbackBaseUrl = settings?.direct_feedback_url || `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.ventrexs.com'}/feedback`;
    const tempId = `req-${Date.now()}`;
    const feedbackUrl = `${feedbackBaseUrl}/${tempId}`;

    const request = await services.reputation.createReviewRequest({
      business_id: params.businessId,
      customer_id: params.customerId || null,
      customer_name: params.customerName,
      customer_phone: params.customerPhone || null,
      customer_email: params.customerEmail || null,
      job_id: params.jobId || null,
      technician_name: params.technicianName || null,
      channel,
      status: params.scheduledFor ? 'SCHEDULED' : 'PENDING',
      scheduled_for: params.scheduledFor || null,
      feedback_url: feedbackUrl,
      review_url: settings?.google_review_url || null,
      idempotency_key: idemKey,
    });

    revalidatePath('/reputation');
    revalidatePath('/reputation/requests');
    return { success: true, data: request };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create review request' };
  }
}

/**
 * 6. Send Review Request via Phase 4 Multi-Channel Communication Engine
 */
export async function sendReviewRequestAction(params: {
  requestId: string;
  businessId: string;
  overrideChannel?: 'email' | 'sms' | 'whatsapp';
}) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, params.businessId);

    const req = await services.reputation.getReviewRequestById(params.requestId);
    if (!req || req.business_id !== params.businessId) {
      return { success: false, error: 'Review request not found or inaccessible' };
    }

    const channel = (params.overrideChannel || req.channel || 'sms') as 'email' | 'sms' | 'whatsapp';
    const settings = await services.reputation.getSettings(params.businessId);

    const business = await services.business.getBusiness(params.businessId);
    const businessName = business?.name || 'Ventrexs Service';

    const feedbackUrl = req.feedback_url || `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.ventrexs.com'}/feedback/${req.id}`;

    // Format message
    let messageText = `Hi ${req.customer_name}, thank you for choosing ${businessName}! How was your service with ${req.technician_name || 'our team'}? Please let us know: ${feedbackUrl}`;
    if (channel === 'sms' && settings?.sms_body_template) {
      messageText = settings.sms_body_template
        .replace(/{{customer_name}}/g, req.customer_name)
        .replace(/{{business_name}}/g, businessName)
        .replace(/{{technician_name}}/g, req.technician_name || 'our team')
        .replace(/{{feedback_url}}/g, feedbackUrl);
    } else if (channel === 'whatsapp' && settings?.whatsapp_body_template) {
      messageText = settings.whatsapp_body_template
        .replace(/{{customer_name}}/g, req.customer_name)
        .replace(/{{business_name}}/g, businessName)
        .replace(/{{technician_name}}/g, req.technician_name || 'our team')
        .replace(/{{feedback_url}}/g, feedbackUrl);
    }

    const subject = settings?.email_subject_template
      ? settings.email_subject_template.replace(/{{business_name}}/g, businessName)
      : `How was your service with ${businessName}?`;

    // Dispatch through Phase 4 Communication Engine (respects consent, opt-out, rate limits)
    const commRes = await sendCommunicationAction({
      businessId: params.businessId,
      customerId: req.customer_id || undefined,
      jobId: req.job_id || undefined,
      channel,
      recipientName: req.customer_name,
      recipientEmail: req.customer_email || undefined,
      recipientPhone: req.customer_phone || undefined,
      subject,
      message: messageText,
      tone: 'gentle',
      triggerType: 'FOLLOW_UP_DUE',
    });

    if (!commRes.success) {
      await services.reputation.updateReviewRequest(req.id, {
        status: 'FAILED',
        error_message: commRes.error,
      });
      return { success: false, error: commRes.error || 'Failed to dispatch review request via communication engine' };
    }

    // Update request state
    const updated = await services.reputation.updateReviewRequest(req.id, {
      status: 'SENT',
      sent_at: new Date().toISOString(),
      delivered_at: new Date().toISOString(),
      channel,
    });

    await services.reputation.logEvent(req.id, params.businessId, 'REQUEST_SENT', {
      channel,
      recipient: channel === 'email' ? req.customer_email : req.customer_phone,
    });

    revalidatePath('/reputation');
    revalidatePath('/reputation/requests');
    if (req.job_id) revalidatePath(`/jobs/${req.job_id}`);

    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to send review request' };
  }
}

/**
 * 7. Schedule Review Request on Job Completion
 */
export async function scheduleJobCompletionReviewAction(jobId: string, businessId: string) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const job = await services.operations.getJobById(jobId);
    if (!job || job.business_id !== businessId) {
      return { success: false, error: 'Job not found' };
    }

    const settings = await services.reputation.getSettings(businessId);
    if (!settings || !settings.automation_enabled) {
      return { success: true, skipped: true, reason: 'Automation disabled in settings' };
    }

    const channel = settings.default_channel || 'sms';
    const delayHours = settings.request_delay_hours || 0;

    let scheduledFor: string | undefined;
    if (delayHours > 0) {
      const date = new Date();
      date.setHours(date.getHours() + delayHours);
      scheduledFor = date.toISOString();
    }

    const reqRes = await createReviewRequestAction({
      businessId,
      customerId: job.customer_id || undefined,
      customerName: (job as any).customer_name || 'Valued Client',
      customerPhone: (job as any).customer_phone || undefined,
      customerEmail: (job as any).customer_email || undefined,
      jobId: job.id,
      technicianName: job.assigned_tech_name || job.technician_name || undefined,
      channel,
      scheduledFor,
    });

    if (reqRes.success && reqRes.data && !scheduledFor) {
      // If immediate delay (0 hours), send right away
      await sendReviewRequestAction({
        requestId: reqRes.data.id,
        businessId,
      });
    }

    return { success: true, data: reqRes.data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to schedule job completion review' };
  }
}

/**
 * 8. Submit Customer Feedback (Public endpoint called by customer survey page)
 */
export async function submitCustomerFeedbackAction(params: {
  reviewRequestId?: string;
  businessId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  jobId?: string;
  rating: number;
  feedbackText?: string;
  serviceAspects?: string[];
  channel?: 'web' | 'sms' | 'email' | 'whatsapp';
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const services = createSupabaseServices(supabase);

    let activeBusinessId = params.businessId;
    let technicianName: string | undefined;
    let jobTitle: string | undefined;
    let customerId: string | undefined;

    if (params.reviewRequestId) {
      const req = await services.reputation.getReviewRequestById(params.reviewRequestId);
      if (req) {
        activeBusinessId = req.business_id;
        technicianName = req.technician_name || undefined;
        customerId = req.customer_id || undefined;
      }
    }

    if (!activeBusinessId) {
      activeBusinessId = '11111111-1111-1111-1111-111111111111'; // Default demo tenant if standalone
    }

    const rating = Math.min(5, Math.max(1, Number(params.rating) || 5));
    const sentiment: 'positive' | 'neutral' | 'negative' =
      rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative';

    const feedback = await services.reputation.createFeedback({
      business_id: activeBusinessId,
      review_request_id: params.reviewRequestId || null,
      customer_id: customerId || null,
      customer_name: params.customerName || 'Customer',
      customer_phone: params.customerPhone || null,
      customer_email: params.customerEmail || null,
      job_id: params.jobId || null,
      technician_name: technicianName || null,
      rating,
      sentiment,
      feedback_text: params.feedbackText || null,
      service_aspects: params.serviceAspects || [],
      channel: params.channel || 'web',
      follow_up_status: sentiment === 'negative' ? 'NEW' : 'CLOSED',
      follow_up_notes: sentiment === 'negative' ? 'Automated ticket created from low customer rating for management resolution.' : null,
    });

    return {
      success: true,
      data: feedback,
      sentiment,
      isPositive: rating >= 4,
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to submit customer feedback' };
  }
}

/**
 * 9. Get Customer Feedback List
 */
export async function getCustomerFeedbackAction(businessId: string, filters?: {
  rating?: number;
  sentiment?: string;
  followUpStatus?: string;
  customerId?: string;
}) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const feedback = await services.reputation.getCustomerFeedback(businessId, filters);
    return { success: true, data: feedback };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch customer feedback' };
  }
}

/**
 * 10. Get Feedback by ID
 */
export async function getFeedbackByIdAction(id: string, businessId: string) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const fb = await services.reputation.getFeedbackById(id);
    if (!fb || fb.business_id !== businessId) {
      return { success: false, error: 'Feedback record not found or inaccessible' };
    }

    return { success: true, data: fb };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch feedback details' };
  }
}

/**
 * 11. Update Feedback Follow-Up Status (For internal team escalation)
 */
export async function updateFeedbackFollowUpAction(params: {
  feedbackId: string;
  businessId: string;
  followUpStatus: FollowUpStatus;
  followUpNotes?: string;
  assignedTo?: string;
}) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, params.businessId);

    const updated = await services.reputation.updateFeedbackFollowUp(params.feedbackId, {
      follow_up_status: params.followUpStatus,
      follow_up_notes: params.followUpNotes || null,
      assigned_to: params.assignedTo || null,
    });

    revalidatePath('/reputation');
    revalidatePath(`/reputation/feedback/${params.feedbackId}`);
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update follow-up status' };
  }
}

/**
 * 12. Get Aggregated Reputation & Technician Metrics
 */
export async function getReputationStatsAction(businessId: string) {
  try {
    const { supabase, services } = await getServerServices();
    await assertUserBelongsToBusiness(supabase, businessId);

    const [requests, feedbacks] = await Promise.all([
      services.reputation.getReviewRequests(businessId),
      services.reputation.getCustomerFeedback(businessId),
    ]);

    const totalRequests = requests.length;
    const sent = requests.filter(r => r.status === 'SENT' || r.status === 'DELIVERED' || r.status === 'OPENED' || r.status === 'COMPLETED').length;
    const delivered = requests.filter(r => r.status === 'DELIVERED' || r.status === 'OPENED' || r.status === 'COMPLETED').length;
    const completed = feedbacks.length;

    const deliveryRate = sent > 0 ? Math.round((delivered / sent) * 100) : 0;
    const responseRate = sent > 0 ? Math.round((completed / sent) * 100) : 0;

    const totalRatingSum = feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0);
    const averageRating = feedbacks.length > 0 ? Math.round((totalRatingSum / feedbacks.length) * 10) / 10 : 0;

    const positiveCount = feedbacks.filter(f => f.rating >= 4).length;
    const neutralCount = feedbacks.filter(f => f.rating === 3).length;
    const negativeCount = feedbacks.filter(f => f.rating <= 2).length;

    const pendingFollowUps = feedbacks.filter(f => f.follow_up_status === 'NEW' || f.follow_up_status === 'IN_REVIEW' || f.follow_up_status === 'CONTACTED').length;
    const resolvedFollowUps = feedbacks.filter(f => f.follow_up_status === 'RESOLVED' || f.follow_up_status === 'CLOSED').length;

    const ratingDistribution = {
      5: feedbacks.filter(f => f.rating === 5).length,
      4: feedbacks.filter(f => f.rating === 4).length,
      3: feedbacks.filter(f => f.rating === 3).length,
      2: feedbacks.filter(f => f.rating === 2).length,
      1: feedbacks.filter(f => f.rating === 1).length,
    };

    const channelBreakdown = {
      email: {
        sent: requests.filter(r => r.channel === 'email' && r.status !== 'PENDING').length,
        completed: feedbacks.filter(f => f.channel === 'email').length,
      },
      sms: {
        sent: requests.filter(r => r.channel === 'sms' && r.status !== 'PENDING').length,
        completed: feedbacks.filter(f => f.channel === 'sms').length,
      },
      whatsapp: {
        sent: requests.filter(r => r.channel === 'whatsapp' && r.status !== 'PENDING').length,
        completed: feedbacks.filter(f => f.channel === 'whatsapp').length,
      },
    };

    return {
      success: true,
      data: {
        totalRequests,
        sent,
        delivered,
        completed,
        deliveryRate,
        responseRate,
        averageRating,
        positiveCount,
        neutralCount,
        negativeCount,
        pendingFollowUps,
        resolvedFollowUps,
        ratingDistribution,
        channelBreakdown,
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to calculate reputation stats' };
  }
}
