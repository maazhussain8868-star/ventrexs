'use server';

import { AgencyTenantService } from '@/lib/agency/service';
import { AgencyTenantCreationParams, AgencyRole } from '@/lib/agency/types';

export async function provisionAgencyTenantAction(params: AgencyTenantCreationParams) {
  try {
    const result = AgencyTenantService.provisionAgencyTenant(params);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function inviteAgencyMemberAction(params: {
  agencyId: string;
  email: string;
  role: AgencyRole;
  invitedBy: string;
}) {
  try {
    const invitation = AgencyTenantService.createMemberInvitation(params);
    return { success: true, data: invitation };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function acceptAgencyInvitationAction(rawToken: string, userId: string) {
  try {
    const member = AgencyTenantService.acceptInvitation(rawToken, userId);
    return { success: true, data: member };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUserAgenciesAction(userIdOrEmail: string) {
  try {
    const agencies = AgencyTenantService.getUserAgencies(userIdOrEmail);
    return { success: true, data: agencies };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAgencyAssignedBusinessesAction(agencyId: string, userIdOrEmail: string) {
  try {
    const businesses = AgencyTenantService.getAgencyBusinesses(agencyId, userIdOrEmail);
    return { success: true, data: businesses };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function removeAgencyMemberAction(agencyId: string, memberId: string, actorEmail: string) {
  try {
    const success = AgencyTenantService.removeAgencyMember(agencyId, memberId, actorEmail);
    return { success };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function suspendAgencyAction(agencyId: string, actorEmail: string) {
  try {
    const success = AgencyTenantService.suspendAgency(agencyId, actorEmail);
    return { success };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function reactivateAgencyAction(agencyId: string, actorEmail: string) {
  try {
    const success = AgencyTenantService.reactivateAgency(agencyId, actorEmail);
    return { success };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
