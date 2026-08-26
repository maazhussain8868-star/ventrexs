import crypto from 'crypto';
import {
  AgencyRecord,
  AgencyMemberRecord,
  AgencyInvitationRecord,
  AgencyTenantCreationParams,
  AgencyRole,
  AgencyBusinessItem,
} from './types';
import { AuditService } from '../audit/service';

export class AgencyTenantService {
  // In-memory repositories backed by Supabase tables
  private static agenciesStore: Map<string, AgencyRecord> = new Map([
    [
      'agy_001',
      {
        id: 'agy_001',
        name: 'Apex Growth Marketing',
        slug: 'apex-growth',
        planTier: 'Agency Growth',
        maxBusinesses: 25,
        status: 'active',
        contactEmail: 'owner@apexgrowth.agency',
        contactPhone: '+1 (555) 019-2834',
        billingStatus: 'active',
        businessCount: 2,
        totalMrr: 5800,
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ],
    [
      'agy_002',
      {
        id: 'agy_002',
        name: 'BlueSky Digital Agency',
        slug: 'bluesky-digital',
        planTier: 'Agency Starter',
        maxBusinesses: 10,
        status: 'active',
        contactEmail: 'hello@blueskydigital.io',
        contactPhone: '+1 (555) 018-9281',
        billingStatus: 'active',
        businessCount: 1,
        totalMrr: 2400,
        createdAt: '2026-08-10T00:00:00.000Z',
      },
    ],
  ]);

  private static membersStore: Map<string, AgencyMemberRecord> = new Map([
    [
      'mem_001',
      {
        id: 'mem_001',
        agencyId: 'agy_001',
        userId: 'usr_apex_owner',
        email: 'owner@apexgrowth.agency',
        role: 'AGENCY_OWNER',
        status: 'active',
        invitedAt: '2026-08-01T00:00:00.000Z',
        acceptedAt: '2026-08-01T00:05:00.000Z',
        createdAt: '2026-08-01T00:00:00.000Z',
        updatedAt: '2026-08-01T00:05:00.000Z',
      },
    ],
    [
      'mem_002',
      {
        id: 'mem_002',
        agencyId: 'agy_002',
        userId: 'usr_bluesky_owner',
        email: 'hello@blueskydigital.io',
        role: 'AGENCY_OWNER',
        status: 'active',
        invitedAt: '2026-08-10T00:00:00.000Z',
        acceptedAt: '2026-08-10T00:05:00.000Z',
        createdAt: '2026-08-10T00:00:00.000Z',
        updatedAt: '2026-08-10T00:05:00.000Z',
      },
    ],
  ]);

  private static invitationsStore: Map<string, AgencyInvitationRecord> = new Map();

  private static agencyBusinessesStore: Map<string, AgencyBusinessItem> = new Map([
    [
      'ab_001',
      {
        id: 'ab_001',
        agencyId: 'agy_001',
        businessId: 'biz_01',
        businessName: 'Apex Heating & Air',
        businessEmail: 'service@apexhvac.com',
        industry: 'HVAC & Refrigeration',
        plan: 'Professional',
        status: 'active',
        mrr: 3200,
        jobsCount: 142,
        invoicesCount: 98,
        assignedAt: '2026-08-05T00:00:00.000Z',
      },
    ],
    [
      'ab_002',
      {
        id: 'ab_002',
        agencyId: 'agy_001',
        businessId: 'biz_02',
        businessName: 'Apex Plumbing Pros',
        businessEmail: 'dispatch@apexplumbing.com',
        industry: 'Plumbing & Drains',
        plan: 'Professional',
        status: 'active',
        mrr: 2600,
        jobsCount: 88,
        invoicesCount: 64,
        assignedAt: '2026-08-06T00:00:00.000Z',
      },
    ],
    [
      'ab_003',
      {
        id: 'ab_003',
        agencyId: 'agy_002',
        businessId: 'biz_03',
        businessName: 'BlueSky Electric',
        businessEmail: 'contact@blueskyelectric.io',
        industry: 'Electrical Contracting',
        plan: 'Starter',
        status: 'active',
        mrr: 2400,
        jobsCount: 45,
        invoicesCount: 30,
        assignedAt: '2026-08-12T00:00:00.000Z',
      },
    ],
  ]);

  /**
   * Hashes a raw token with SHA-256
   */
  static hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  /**
   * Generates a 64-character high-entropy cryptographic token
   */
  static generateRawToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Provisions a new Agency Tenant upon verified subscription payment
   */
  static provisionAgencyTenant(params: AgencyTenantCreationParams): {
    agency: AgencyRecord;
    invitation: AgencyInvitationRecord;
  } {
    const agencyId = `agy_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();

    const maxBusinesses = params.maxBusinesses || (params.planTier === 'Agency Enterprise' ? 100 : params.planTier === 'Agency Growth' ? 25 : 10);

    const agency: AgencyRecord = {
      id: agencyId,
      name: params.name,
      slug: params.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      planTier: params.planTier,
      maxBusinesses,
      status: 'active',
      contactEmail: params.ownerEmail,
      contactPhone: params.contactPhone,
      subscriptionId: params.subscriptionId || `sub_agy_${Date.now()}`,
      billingStatus: 'active',
      businessCount: 0,
      totalMrr: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.agenciesStore.set(agencyId, agency);

    // Create Owner Onboarding Invitation
    const rawToken = this.generateRawToken();
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const invitationId = `inv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const invitation: AgencyInvitationRecord = {
      id: invitationId,
      agencyId,
      email: params.ownerEmail,
      role: 'AGENCY_OWNER',
      tokenHash,
      status: 'PENDING',
      expiresAt,
      createdAt: now,
      updatedAt: now,
      rawToken,
    };

    this.invitationsStore.set(invitationId, invitation);

    AuditService.logEvent({
      businessId: 'platform_system',
      agencyId,
      actorEmail: params.ownerEmail,
      actorRole: 'PLATFORM_ADMIN',
      eventType: 'agency_tenant_provisioned',
      description: `Provisioned agency tenant ${params.name} (${agencyId}) on plan ${params.planTier}`,
      metadata: { agencyId, planTier: params.planTier },
    });

    return { agency, invitation };
  }

  /**
   * Invites a new team member to an agency
   */
  static createMemberInvitation(params: {
    agencyId: string;
    email: string;
    role: AgencyRole;
    invitedBy: string;
  }): AgencyInvitationRecord {
    const agency = this.agenciesStore.get(params.agencyId);
    if (!agency || agency.status !== 'active') {
      throw new Error('Agency not found or inactive.');
    }

    const rawToken = this.generateRawToken();
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    const invitationId = `inv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const invitation: AgencyInvitationRecord = {
      id: invitationId,
      agencyId: params.agencyId,
      email: params.email.toLowerCase(),
      role: params.role,
      tokenHash,
      status: 'PENDING',
      expiresAt,
      createdBy: params.invitedBy,
      createdAt: now,
      updatedAt: now,
      rawToken,
    };

    this.invitationsStore.set(invitationId, invitation);

    AuditService.logEvent({
      businessId: 'agency_system',
      agencyId: params.agencyId,
      actorEmail: params.invitedBy,
      actorRole: 'AGENCY_OWNER',
      eventType: 'agency_member_invited',
      description: `Invited ${params.email} as ${params.role} to ${agency.name}`,
      metadata: { invitationId, role: params.role },
    });

    return invitation;
  }

  /**
   * Accepts a team invitation using the raw token
   */
  static acceptInvitation(rawToken: string, userId: string): AgencyMemberRecord {
    const tokenHash = this.hashToken(rawToken);
    let invitation: AgencyInvitationRecord | undefined;

    for (const inv of this.invitationsStore.values()) {
      if (inv.tokenHash === tokenHash) {
        invitation = inv;
        break;
      }
    }

    if (!invitation) {
      throw new Error('Invalid invitation token.');
    }

    if (invitation.status !== 'PENDING') {
      throw new Error(`Invitation is already ${invitation.status.toLowerCase()}.`);
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      invitation.status = 'EXPIRED';
      throw new Error('Invitation has expired.');
    }

    const now = new Date().toISOString();
    invitation.status = 'ACCEPTED';
    invitation.acceptedAt = now;
    invitation.updatedAt = now;

    const memberId = `mem_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const member: AgencyMemberRecord = {
      id: memberId,
      agencyId: invitation.agencyId,
      userId,
      email: invitation.email,
      role: invitation.role,
      status: 'active',
      invitedAt: invitation.createdAt,
      acceptedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    this.membersStore.set(memberId, member);

    AuditService.logEvent({
      businessId: 'agency_system',
      agencyId: invitation.agencyId,
      actorEmail: invitation.email,
      actorRole: invitation.role,
      eventType: 'agency_invitation_accepted',
      description: `${invitation.email} accepted invitation and joined agency`,
      metadata: { memberId, role: invitation.role },
    });

    return member;
  }

  /**
   * Validates whether a user belongs to an agency and has the required role
   */
  static validateAgencyAccess(agencyId: string, userIdOrEmail: string, minimumRole?: AgencyRole): {
    isValid: boolean;
    member?: AgencyMemberRecord;
    agency?: AgencyRecord;
    error?: string;
  } {
    const agency = this.agenciesStore.get(agencyId);
    if (!agency) {
      return { isValid: false, error: 'Agency not found.' };
    }

    if (agency.status === 'suspended') {
      return { isValid: false, error: 'Agency account is suspended.' };
    }

    const normalized = userIdOrEmail.toLowerCase();
    let member: AgencyMemberRecord | undefined;

    for (const m of this.membersStore.values()) {
      if (
        m.agencyId === agencyId &&
        (m.userId === userIdOrEmail || m.email.toLowerCase() === normalized) &&
        m.status === 'active'
      ) {
        member = m;
        break;
      }
    }

    if (!member) {
      return { isValid: false, error: 'Unauthorized: User is not an active member of this agency.' };
    }

    if (minimumRole === 'AGENCY_OWNER' && member.role !== 'AGENCY_OWNER') {
      return { isValid: false, error: 'Unauthorized: Action requires Agency Owner privileges.' };
    }

    return { isValid: true, member, agency };
  }

  /**
   * Retrieves all agencies a user belongs to (multi-agency support)
   */
  static getUserAgencies(userIdOrEmail: string): Array<{ agency: AgencyRecord; member: AgencyMemberRecord }> {
    const normalized = userIdOrEmail.toLowerCase();
    const results: Array<{ agency: AgencyRecord; member: AgencyMemberRecord }> = [];

    for (const member of this.membersStore.values()) {
      if (
        (member.userId === userIdOrEmail || member.email.toLowerCase() === normalized) &&
        member.status === 'active'
      ) {
        const agency = this.agenciesStore.get(member.agencyId);
        if (agency && agency.status === 'active') {
          results.push({ agency, member });
        }
      }
    }

    return results;
  }

  /**
   * Retrieves businesses assigned to an agency with strict tenant isolation
   */
  static getAgencyBusinesses(agencyId: string, userIdOrEmail: string): AgencyBusinessItem[] {
    const auth = this.validateAgencyAccess(agencyId, userIdOrEmail);
    if (!auth.isValid) {
      throw new Error(auth.error || 'Unauthorized');
    }

    return Array.from(this.agencyBusinessesStore.values()).filter(
      (b) => b.agencyId === agencyId && b.status === 'active'
    );
  }

  /**
   * Removes a member from an agency
   */
  static removeAgencyMember(agencyId: string, memberId: string, actorEmail: string): boolean {
    const auth = this.validateAgencyAccess(agencyId, actorEmail, 'AGENCY_OWNER');
    if (!auth.isValid) {
      throw new Error('Only agency owners can remove members.');
    }

    const member = this.membersStore.get(memberId);
    if (!member || member.agencyId !== agencyId) {
      return false;
    }

    member.status = 'removed';
    member.updatedAt = new Date().toISOString();

    AuditService.logEvent({
      businessId: 'agency_system',
      agencyId,
      actorEmail,
      actorRole: 'AGENCY_OWNER',
      eventType: 'agency_member_removed',
      description: `Removed member ${member.email} from agency`,
      metadata: { memberId },
    });

    return true;
  }

  /**
   * Suspends an agency tenant (e.g., billing lapse)
   */
  static suspendAgency(agencyId: string, actorEmail: string): boolean {
    const agency = this.agenciesStore.get(agencyId);
    if (!agency) return false;

    agency.status = 'suspended';
    agency.billingStatus = 'suspended';

    AuditService.logEvent({
      businessId: 'platform_system',
      agencyId,
      actorEmail,
      actorRole: 'PLATFORM_ADMIN',
      eventType: 'agency_suspended',
      description: `Agency ${agency.name} suspended by ${actorEmail}`,
      metadata: { agencyId },
    });

    return true;
  }

  /**
   * Reactivates a suspended agency tenant
   */
  static reactivateAgency(agencyId: string, actorEmail: string): boolean {
    const agency = this.agenciesStore.get(agencyId);
    if (!agency) return false;

    agency.status = 'active';
    agency.billingStatus = 'active';

    AuditService.logEvent({
      businessId: 'platform_system',
      agencyId,
      actorEmail,
      actorRole: 'PLATFORM_ADMIN',
      eventType: 'agency_reactivated',
      description: `Agency ${agency.name} reactivated by ${actorEmail}`,
      metadata: { agencyId },
    });

    return true;
  }

  /**
   * Assigns a business to an agency
   */
  static assignBusinessToAgency(agencyId: string, businessItem: Omit<AgencyBusinessItem, 'id' | 'assignedAt'>, actorEmail: string): AgencyBusinessItem {
    const auth = this.validateAgencyAccess(agencyId, actorEmail);
    if (!auth.isValid) {
      throw new Error(auth.error || 'Unauthorized');
    }

    const id = `ab_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const record: AgencyBusinessItem = {
      ...businessItem,
      id,
      agencyId,
      assignedAt: new Date().toISOString(),
    };

    this.agencyBusinessesStore.set(id, record);

    AuditService.logEvent({
      businessId: businessItem.businessId,
      agencyId,
      actorEmail,
      actorRole: 'AGENCY_MEMBER',
      eventType: 'business_assigned_to_agency',
      description: `Assigned ${businessItem.businessName} to agency ${agencyId}`,
      metadata: { businessId: businessItem.businessId, agencyId },
    });

    return record;
  }

  /**
   * Testing reset helper
   */
  static resetStore(): void {
    this.agenciesStore.clear();
    this.membersStore.clear();
    this.invitationsStore.clear();
    this.agencyBusinessesStore.clear();

    // Re-seed defaults
    this.agenciesStore.set('agy_001', {
      id: 'agy_001',
      name: 'Apex Growth Marketing',
      slug: 'apex-growth',
      planTier: 'Agency Growth',
      maxBusinesses: 25,
      status: 'active',
      contactEmail: 'owner@apexgrowth.agency',
      contactPhone: '+1 (555) 019-2834',
      billingStatus: 'active',
      businessCount: 2,
      totalMrr: 5800,
      createdAt: '2026-08-01T00:00:00.000Z',
    });
    this.agenciesStore.set('agy_002', {
      id: 'agy_002',
      name: 'BlueSky Digital Agency',
      slug: 'bluesky-digital',
      planTier: 'Agency Starter',
      maxBusinesses: 10,
      status: 'active',
      contactEmail: 'hello@blueskydigital.io',
      contactPhone: '+1 (555) 018-9281',
      billingStatus: 'active',
      businessCount: 1,
      totalMrr: 2400,
      createdAt: '2026-08-10T00:00:00.000Z',
    });

    this.membersStore.set('mem_001', {
      id: 'mem_001',
      agencyId: 'agy_001',
      userId: 'usr_apex_owner',
      email: 'owner@apexgrowth.agency',
      role: 'AGENCY_OWNER',
      status: 'active',
      invitedAt: '2026-08-01T00:00:00.000Z',
      acceptedAt: '2026-08-01T00:05:00.000Z',
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:05:00.000Z',
    });
    this.membersStore.set('mem_002', {
      id: 'mem_002',
      agencyId: 'agy_002',
      userId: 'usr_bluesky_owner',
      email: 'hello@blueskydigital.io',
      role: 'AGENCY_OWNER',
      status: 'active',
      invitedAt: '2026-08-10T00:00:00.000Z',
      acceptedAt: '2026-08-10T00:05:00.000Z',
      createdAt: '2026-08-10T00:00:00.000Z',
      updatedAt: '2026-08-10T00:05:00.000Z',
    });

    this.agencyBusinessesStore.set('ab_001', {
      id: 'ab_001',
      agencyId: 'agy_001',
      businessId: 'biz_01',
      businessName: 'Apex Heating & Air',
      businessEmail: 'service@apexhvac.com',
      industry: 'HVAC & Refrigeration',
      plan: 'Professional',
      status: 'active',
      mrr: 3200,
      jobsCount: 142,
      invoicesCount: 98,
      assignedAt: '2026-08-05T00:00:00.000Z',
    });
    this.agencyBusinessesStore.set('ab_003', {
      id: 'ab_003',
      agencyId: 'agy_002',
      businessId: 'biz_03',
      businessName: 'BlueSky Electric',
      businessEmail: 'contact@blueskyelectric.io',
      industry: 'Electrical Contracting',
      plan: 'Starter',
      status: 'active',
      mrr: 2400,
      jobsCount: 45,
      invoicesCount: 30,
      assignedAt: '2026-08-12T00:00:00.000Z',
    });
  }
}
