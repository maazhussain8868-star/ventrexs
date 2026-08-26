export type PlatformAdminStatus = 'active' | 'suspended' | 'revoked';

export interface PlatformAdminRecord {
  id: string;
  userId?: string;
  email: string;
  role: 'PLATFORM_ADMIN';
  status: PlatformAdminStatus;
  mfaEnabled: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  lastLoginIp?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminLoginAuditParams {
  userId?: string;
  adminId?: string;
  email: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  mfaVerified?: boolean;
  authMethod?: string;
  failureReason?: string;
}

export interface AdminSession {
  adminId: string;
  userId: string;
  email: string;
  role: 'PLATFORM_ADMIN';
  mfaVerified: boolean;
  authenticatedAt: string;
  expiresAt: string;
}
