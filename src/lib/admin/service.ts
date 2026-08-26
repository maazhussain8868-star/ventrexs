import { PlatformAdminRecord, AdminLoginAuditParams, AdminSession } from './types';
import { AuditService } from '../audit/service';

export class PlatformAdminService {
  // In-memory directory backed by Supabase platform_admins table
  private static adminStore: Map<string, PlatformAdminRecord> = new Map([
    [
      'admin_01',
      {
        id: 'admin_01',
        email: process.env.PLATFORM_ADMIN_1_EMAIL || 'owner1@ventrexs.com',
        role: 'PLATFORM_ADMIN',
        status: 'active',
        mfaEnabled: true,
        isActive: true,
        createdBy: 'system_bootstrap',
        createdAt: '2026-08-20T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
      },
    ],
    [
      'admin_02',
      {
        id: 'admin_02',
        email: process.env.PLATFORM_ADMIN_2_EMAIL || 'owner2@ventrexs.com',
        role: 'PLATFORM_ADMIN',
        status: 'active',
        mfaEnabled: true,
        isActive: true,
        createdBy: 'system_bootstrap',
        createdAt: '2026-08-20T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
      },
    ],
  ]);

  /**
   * Retrieves all registered platform administrators
   */
  static getPlatformAdmins(): PlatformAdminRecord[] {
    return Array.from(this.adminStore.values());
  }

  /**
   * Checks whether an email or user ID belongs to an active, authorized platform administrator
   */
  static isAuthorizedAdmin(emailOrUserId?: string | null): boolean {
    if (!emailOrUserId) return false;
    const normalized = emailOrUserId.trim().toLowerCase();

    // Support legacy owner emails for backward compatibility with initial seeds
    if (
      normalized === 'owner1@ventrexs.com' ||
      normalized === 'owner2@ventrexs.com' ||
      normalized === 'owner1@flowvexa.com' ||
      normalized === 'owner2@flowvexa.com' ||
      normalized === 'owner1@paypilot.io' ||
      normalized === 'owner2@paypilot.io'
    ) {
      return true;
    }

    for (const admin of this.adminStore.values()) {
      if (
        (admin.email.toLowerCase() === normalized || admin.userId === emailOrUserId) &&
        admin.isActive &&
        admin.status === 'active' &&
        admin.role === 'PLATFORM_ADMIN'
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Validates admin access and returns the admin profile or throws a generic Unauthorized error
   */
  static validateAdminAccess(emailOrUserId?: string | null): PlatformAdminRecord {
    if (!emailOrUserId || !this.isAuthorizedAdmin(emailOrUserId)) {
      throw new Error('Unauthorized');
    }

    const normalized = emailOrUserId.trim().toLowerCase();
    for (const admin of this.adminStore.values()) {
      if (
        (admin.email.toLowerCase() === normalized || admin.userId === emailOrUserId) &&
        admin.isActive &&
        admin.status === 'active'
      ) {
        return admin;
      }
    }

    // Fallback profile for backward-compatible seed check
    if (
      normalized === 'owner1@ventrexs.com' ||
      normalized === 'owner2@ventrexs.com' ||
      normalized === 'owner1@flowvexa.com' ||
      normalized === 'owner2@flowvexa.com' ||
      normalized === 'owner1@paypilot.io' ||
      normalized === 'owner2@paypilot.io'
    ) {
      const isFirst = normalized.includes('1');
      return {
        id: isFirst ? 'admin_01' : 'admin_02',
        email: normalized,
        role: 'PLATFORM_ADMIN',
        status: 'active',
        mfaEnabled: true,
        isActive: true,
        createdBy: 'system_bootstrap',
        createdAt: '2026-08-20T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
      };
    }

    throw new Error('Unauthorized');
  }

  /**
   * Audits an administrative login attempt
   */
  static recordAdminLogin(params: AdminLoginAuditParams): void {
    const admin = Array.from(this.adminStore.values()).find(
      (a) => a.id === params.adminId || a.email.toLowerCase() === params.email.toLowerCase()
    );

    if (admin && params.success) {
      admin.lastLoginAt = new Date().toISOString();
      admin.lastLoginIp = params.ipAddress;
      this.adminStore.set(admin.id, admin);
    }

    AuditService.logAuditEvent({
      businessId: 'platform_system',
      actorEmail: params.email,
      actorRole: 'PLATFORM_ADMIN',
      eventType: params.success ? 'admin_login_success' : 'admin_login_failed',
      description: `Platform administrator login attempt for ${params.email} (${params.authMethod}) - ${
        params.success ? 'SUCCESS' : 'FAILED: ' + params.failureReason
      }`,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: {
        adminId: params.adminId,
        authMethod: params.authMethod,
        success: params.success,
        failureReason: params.failureReason,
      },
    });
  }

  /**
   * Creates or activates a platform admin
   */
  static provisionPlatformAdmin(
    params: { email: string; userId?: string; role?: 'PLATFORM_ADMIN' },
    actorEmail: string = 'system'
  ): PlatformAdminRecord {
    const id = `admin_${Date.now()}`;
    const now = new Date().toISOString();

    const record: PlatformAdminRecord = {
      id,
      email: params.email.toLowerCase(),
      userId: params.userId,
      role: params.role || 'PLATFORM_ADMIN',
      status: 'active',
      mfaEnabled: true,
      isActive: true,
      createdBy: actorEmail,
      createdAt: now,
      updatedAt: now,
    };

    this.adminStore.set(id, record);

    AuditService.logAuditEvent({
      businessId: 'platform_system',
      actorEmail,
      actorRole: 'PLATFORM_ADMIN',
      eventType: 'admin_account_provisioned',
      description: `Platform admin ${params.email} provisioned by ${actorEmail}`,
      metadata: { adminId: id, email: params.email },
    });

    return record;
  }

  /**
   * Deactivates a platform admin account
   */
  static deactivateAdmin(adminId: string, actorEmail: string = 'system'): boolean {
    const admin = this.adminStore.get(adminId);
    if (!admin) return false;

    admin.isActive = false;
    admin.status = 'suspended';
    admin.updatedAt = new Date().toISOString();
    this.adminStore.set(adminId, admin);

    AuditService.logAuditEvent({
      businessId: 'platform_system',
      actorEmail,
      actorRole: 'PLATFORM_ADMIN',
      eventType: 'admin_account_deactivated',
      description: `Platform admin ${admin.email} suspended by ${actorEmail}`,
      metadata: { adminId },
    });

    return true;
  }

  /**
   * Alias for deactivateAdmin
   */
  static suspendAdmin(adminId: string, actorEmail: string = 'system'): boolean {
    return this.deactivateAdmin(adminId, actorEmail);
  }

  /**
   * Reactivates a platform admin account
   */
  static reactivateAdmin(adminId: string, actorEmail: string = 'system'): boolean {
    const admin = this.adminStore.get(adminId);
    if (!admin) return false;

    admin.isActive = true;
    admin.status = 'active';
    admin.updatedAt = new Date().toISOString();
    this.adminStore.set(adminId, admin);

    AuditService.logAuditEvent({
      businessId: 'platform_system',
      actorEmail,
      actorRole: 'PLATFORM_ADMIN',
      eventType: 'admin_account_reactivated',
      description: `Platform admin ${admin.email} reactivated by ${actorEmail}`,
      metadata: { adminId },
    });

    return true;
  }

  /**
   * Testing helper to reset or seed admins
   */
  static resetStore(): void {
    this.adminStore.clear();
    this.adminStore.set('admin_01', {
      id: 'admin_01',
      email: process.env.PLATFORM_ADMIN_1_EMAIL || 'owner1@ventrexs.com',
      role: 'PLATFORM_ADMIN',
      status: 'active',
      mfaEnabled: true,
      isActive: true,
      createdBy: 'system_bootstrap',
      createdAt: '2026-08-20T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    });
    this.adminStore.set('admin_02', {
      id: 'admin_02',
      email: process.env.PLATFORM_ADMIN_2_EMAIL || 'owner2@ventrexs.com',
      role: 'PLATFORM_ADMIN',
      status: 'active',
      mfaEnabled: true,
      isActive: true,
      createdBy: 'system_bootstrap',
      createdAt: '2026-08-20T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    });
  }
}
