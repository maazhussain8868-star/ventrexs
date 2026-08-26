import { PlatformAdminService } from '../admin/service';
import { AgencyTenantService } from '../agency/service';
import { DemoAccessService } from '../demo-access/service';
import { PlatformAdminRecord } from '../admin/types';
import { AgencyMemberRecord, AgencyRole } from '../agency/types';

export interface AuthenticatedContext {
  userId: string;
  email: string;
  role: string;
}

export { resolveHostContext, type HostContextType } from './hostname';

/**
 * Server-side guard to strictly assert Platform Admin privileges.
 * Throws a generic 'Unauthorized' error on any authorization failure.
 */
export async function requirePlatformAdmin(actorEmailOrUserId?: string | null): Promise<PlatformAdminRecord> {
  if (!actorEmailOrUserId || !PlatformAdminService.isAuthorizedAdmin(actorEmailOrUserId)) {
    throw new Error('Unauthorized');
  }

  return PlatformAdminService.validateAdminAccess(actorEmailOrUserId);
}

/**
 * Server-side guard to assert Agency Membership and role hierarchy.
 */
export async function requireAgencyMember(
  agencyId: string,
  actorEmailOrUserId: string,
  requiredRole?: AgencyRole
): Promise<AgencyMemberRecord> {
  if (!agencyId || !actorEmailOrUserId) {
    throw new Error('Unauthorized');
  }

  const result = AgencyTenantService.validateAgencyAccess(agencyId, actorEmailOrUserId, requiredRole);
  if (!result.isValid || !result.member) {
    throw new Error(result.error || 'Unauthorized');
  }

  return result.member;
}

/**
 * Server-side guard requiring Agency Owner status.
 */
export async function requireAgencyOwner(
  agencyId: string,
  actorEmailOrUserId: string
): Promise<AgencyMemberRecord> {
  return requireAgencyMember(agencyId, actorEmailOrUserId, 'AGENCY_OWNER');
}

/**
 * Server-side guard to assert Business membership for customer operations.
 */
export async function requireBusinessMember(
  businessId: string,
  actorUserId?: string
): Promise<{ businessId: string; userId: string; role: string }> {
  if (!businessId) {
    throw new Error('Unauthorized');
  }

  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return { businessId, userId: actorUserId || 'demo-user', role: 'owner' };
  }

  // Uses existing assertion from server-authorization
  const { assertUserBelongsToBusiness } = await import('./server-authorization');
  const membership = await assertUserBelongsToBusiness(actorUserId || 'demo-user', businessId);
  return { businessId: membership.business_id, userId: membership.user_id, role: membership.role };
}

/**
 * Server-side guard for active Demo Guest sessions.
 */
export function requireDemoSession(rawSessionToken: string) {
  const validation = DemoAccessService.validateDemoSession(rawSessionToken);
  if (!validation.isValid || !validation.session) {
    throw new Error(validation.error || 'Unauthorized Demo Session');
  }
  return validation.session;
}
