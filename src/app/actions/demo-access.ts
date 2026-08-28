'use server';

import { revalidatePath } from 'next/cache';
import { DemoAccessService } from '@/lib/demo-access/service';
import { SubmitDemoRequestParams, SubmitApprovalParams } from '@/lib/demo-access/types';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { PlatformAdminService } from '@/lib/admin/service';

async function assertCallerIsAdmin() {
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

/**
 * Retrieves the currently active demo link for the public marketing website "View Live Demo" button.
 */
export async function getActiveDemoLinkAction() {
  try {
    const tokenRecord = DemoAccessService.getActiveDemoToken('biz_01');
    const host = process.env.NEXT_PUBLIC_APP_URL || '';
    const demoUrl = `${host}/demo/${tokenRecord.rawToken}`;

    return {
      success: true,
      data: {
        rawToken: tokenRecord.rawToken,
        demoUrl,
        expiresAt: tokenRecord.expiresAt,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to retrieve active demo link.',
    };
  }
}

/**
 * Generates a new 24-hour cryptographically secure demo invitation link.
 * Rotates all previously active tokens for the demo environment.
 */
export async function generateDemoLinkAction(label?: string) {
  try {
    await assertCallerIsAdmin();
    const tokenRecord = DemoAccessService.createDemoToken({
      createdBy: 'admin@ventrexs.com',
      label: label || 'Production Demo Invitation',
    });

    const host = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const demoUrl = `${host}/demo/${tokenRecord.rawToken}`;

    revalidatePath('/admin/demo-access');

    return {
      success: true,
      data: {
        token: tokenRecord,
        demoUrl,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to generate demo link.',
    };
  }
}

/**
 * Revokes an active demo token and associated demo sessions
 */
export async function revokeDemoTokenAction(tokenId: string) {
  try {
    await assertCallerIsAdmin();
    const success = DemoAccessService.revokeToken(tokenId, 'admin@ventrexs.com');
    revalidatePath('/admin/demo-access');
    return { success };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to revoke token.' };
  }
}

/**
 * Regenerates a demo token (revoking the old token and issuing a fresh 24h token)
 */
export async function regenerateDemoTokenAction(oldTokenId: string, label?: string) {
  try {
    await assertCallerIsAdmin();
    DemoAccessService.revokeToken(oldTokenId, 'admin@ventrexs.com');
    const tokenRecord = DemoAccessService.createDemoToken({
      createdBy: 'admin@ventrexs.com',
      label: label || 'Rotated Demo Invitation',
    });

    const host = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const demoUrl = `${host}/demo/${tokenRecord.rawToken}`;

    revalidatePath('/admin/demo-access');

    return {
      success: true,
      data: {
        token: tokenRecord,
        demoUrl,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to rotate demo token.' };
  }
}

/**
 * Retrieves full Demo Access Overview for Admin Console
 */
export async function getDemoAccessOverviewAction() {
  try {
    await assertCallerIsAdmin();
    const overview = DemoAccessService.getOverview();
    return { success: true, data: overview };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load demo overview.' };
  }
}

/**
 * Initiates a demo access request from the public /demo/[token] route
 */
export async function initiateDemoAccessRequestAction(params: SubmitDemoRequestParams) {
  try {
    // Rate limit public requests
    const ipKey = params.requesterIp || params.requesterEmail;
    const allowed = DemoAccessService.checkRateLimit(`req_${ipKey}`, 10, 60000);
    if (!allowed) {
      return { success: false, error: 'Too many requests. Please wait a minute and try again.' };
    }

    const result = DemoAccessService.requestDemoAccess(params);
    if (!result.success || !result.request) {
      return { success: false, error: result.error || 'Failed to initiate demo request.' };
    }

    revalidatePath('/admin/demo-access');

    return {
      success: true,
      data: {
        request: result.request,
        session: result.session,
        sessionToken: result.session?.rawSessionToken,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to submit demo access request.' };
  }
}

/**
 * Polls or retrieves request status for /demo/[token]
 */
export async function getDemoRequestStatusAction(requestId: string, rawToken: string) {
  try {
    // Validate token first
    const tokenVal = DemoAccessService.validateToken(rawToken);
    if (!tokenVal.isValid) {
      return { success: false, error: tokenVal.error || 'Token invalid or expired.' };
    }

    const overview = DemoAccessService.getOverview();
    const req = overview.requests.find((r) => r.id === requestId);
    if (!req) {
      return { success: false, error: 'Request not found.' };
    }

    const session = overview.sessions.find((s) => s.requestId === requestId && s.status === 'ACTIVE');

    return {
      success: true,
      data: {
        request: req,
        sessionToken: session?.rawSessionToken,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to check status.' };
  }
}

/**
 * Submits an owner approval or rejection with dual-approval enforcement
 */
export async function submitOwnerApprovalAction(params: SubmitApprovalParams) {
  try {
    // Rate limit approval submissions
    const allowed = DemoAccessService.checkRateLimit(`appr_${params.approverEmail}`, 20, 60000);
    if (!allowed) {
      return { success: false, error: 'Rate limit exceeded. Please wait a moment.' };
    }

    const result = DemoAccessService.submitApproval(params);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath('/admin/demo-access');
    revalidatePath(`/demo`);

    return {
      success: true,
      data: {
        request: result.request,
        session: result.session,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to process approval.' };
  }
}
