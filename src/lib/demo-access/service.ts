import crypto from 'crypto';
import {
  DemoAccessToken,
  DemoAccessRequest,
  DemoAccessApproval,
  DemoSession,
  DemoAccessOverview,
  CreateDemoTokenParams,
  SubmitDemoRequestParams,
  SubmitApprovalParams,
  ApprovalDecision,
} from './types';
import { AuditService } from '../audit/service';

// Authorized Owner accounts eligible to provide dual approvals
export const AUTHORIZED_DEMO_OWNERS = [
  'owner1@ventrexs.com',
  'owner2@ventrexs.com',
  'platform@ventrexs.com',
  'owner1@flowvexa.com',
  'owner2@flowvexa.com',
  'platform@flowvexa.com',
  'owner1@paypilot.io',
  'owner2@paypilot.io',
  'admin@apexhvac.com',
  'platform@paypilot.io',
  'sarah.owner@paypilot.io',
  'marcus.admin@paypilot.io',
];

export class DemoAccessService {
  // In-memory backing store for testing / demo mode fallback
  private static tokensStore: Map<string, DemoAccessToken> = new Map();
  private static requestsStore: Map<string, DemoAccessRequest> = new Map();
  private static approvalsStore: Map<string, DemoAccessApproval[]> = new Map();
  private static sessionsStore: Map<string, DemoSession> = new Map();
  private static rateLimitMap: Map<string, { count: number; resetAt: number }> = new Map();

  /**
   * Hashes a raw token with SHA-256 for secure lookup and database storage
   */
  static hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken.trim()).digest('hex');
  }

  /**
   * Generates a 64-character cryptographically secure random hex token
   */
  static generateRawToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Simple rate limiter for token checks and approval submissions (max 30 requests per minute per IP/Key)
   */
  static checkRateLimit(key: string, limit: number = 30, windowMs: number = 60000): boolean {
    const now = Date.now();
    const entry = this.rateLimitMap.get(key);
    if (!entry || entry.resetAt < now) {
      this.rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    if (entry.count >= limit) {
      return false;
    }
    entry.count++;
    return true;
  }

  /**
   * Creates a new demo token with 24-hour expiration.
   * Enforces rotation invariant: Revokes all previously active tokens for this business.
   */
  static createDemoToken(params: CreateDemoTokenParams): DemoAccessToken {
    const rawToken = this.generateRawToken();
    const tokenHash = this.hashToken(rawToken);
    const businessId = params.businessId || 'biz_01';
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Strictly 24 hours

    // 1. Revoke existing active tokens for this business
    for (const [id, t] of this.tokensStore.entries()) {
      if (t.businessId === businessId && t.status === 'ACTIVE') {
        t.status = 'REVOKED';
        t.revokedAt = now.toISOString();
        t.revokedBy = params.createdBy;
        this.tokensStore.set(id, t);
      }
    }

    const tokenId = `demo_tok_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const tokenRecord: DemoAccessToken = {
      id: tokenId,
      businessId,
      tokenHash,
      createdBy: params.createdBy,
      label: params.label || 'Production Demo Invitation',
      status: 'ACTIVE',
      expiresAt: expiresAt.toISOString(),
      createdAt: now.toISOString(),
      rawToken, // Sent to caller once for display/copy
    };

    this.tokensStore.set(tokenId, tokenRecord);

    AuditService.logEvent({
      businessId,
      actorEmail: params.createdBy,
      actorRole: 'PLATFORM_ADMIN',
      eventType: 'demo_token_created',
      description: `Generated 24h demo token for ${businessId}`,
      metadata: {
        tokenId,
        expiresAt: tokenRecord.expiresAt,
        // Raw token and hash are never logged in full
        tokenPrefix: rawToken.substring(0, 8) + '...',
      },
    });

    return tokenRecord;
  }

  /**
   * Validates a raw token, returning active status and remaining time
   */
  static validateToken(rawToken: string): {
    isValid: boolean;
    token?: DemoAccessToken;
    error?: string;
  } {
    if (!rawToken || rawToken.trim() === '') {
      return { isValid: false, error: 'Token is required.' };
    }

    const tokenHash = this.hashToken(rawToken);
    let foundToken: DemoAccessToken | undefined;

    for (const t of this.tokensStore.values()) {
      if (t.tokenHash === tokenHash) {
        foundToken = t;
        break;
      }
    }

    if (!foundToken) {
      return { isValid: false, error: 'Invalid demo token.' };
    }

    const now = new Date();
    const expiresAt = new Date(foundToken.expiresAt);

    if (now > expiresAt) {
      foundToken.status = 'EXPIRED';
      return { isValid: false, token: foundToken, error: 'Demo token has expired (24-hour limit exceeded).' };
    }

    if (foundToken.status !== 'ACTIVE') {
      return { isValid: false, token: foundToken, error: `Demo token is ${foundToken.status.toLowerCase()}.` };
    }

    return { isValid: true, token: foundToken };
  }

  /**
   * Submits a demo access request for a verified token
   */
  static requestDemoAccess(params: SubmitDemoRequestParams): {
    success: boolean;
    request?: DemoAccessRequest;
    session?: DemoSession;
    error?: string;
  } {
    const val = this.validateToken(params.rawToken);
    if (!val.isValid || !val.token) {
      return { success: false, error: val.error || 'Invalid or expired demo token.' };
    }

    const token = val.token;
    const now = new Date();
    const requestId = `demo_req_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Instant approval: zero waiting, zero owner approval required
    const rawSessionToken = this.generateRawToken();
    const sessionTokenHash = this.hashToken(rawSessionToken);
    const sessionExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    const sessionId = `dsess_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const createdSession: DemoSession = {
      id: sessionId,
      requestId,
      tokenId: token.id,
      sessionTokenHash,
      businessId: 'biz_01', // Strictly isolated demo tenant
      requesterEmail: params.requesterEmail,
      status: 'ACTIVE',
      expiresAt: sessionExpiresAt.toISOString(),
      lastActivityAt: now.toISOString(),
      createdAt: now.toISOString(),
      rawSessionToken,
    };

    this.sessionsStore.set(sessionId, createdSession);

    const requestRecord: DemoAccessRequest = {
      id: requestId,
      tokenId: token.id,
      requesterName: params.requesterName,
      requesterEmail: params.requesterEmail.toLowerCase().trim(),
      requesterCompany: params.requesterCompany,
      requesterIp: params.requesterIp,
      userAgent: params.userAgent,
      approvalStatus: 'APPROVED',
      approvalsCount: 2,
      requiredApprovals: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      approvals: [],
    };

    this.requestsStore.set(requestId, requestRecord);

    AuditService.logEvent({
      businessId: token.businessId,
      actorEmail: params.requesterEmail,
      actorRole: 'GUEST',
      eventType: 'demo_access_instant_granted',
      description: `Public prospect ${params.requesterName} entered live demo instantly`,
      metadata: {
        requestId,
        tokenId: token.id,
        sessionId,
      },
    });

    return { success: true, request: requestRecord, session: createdSession };
  }

  /**
   * Submits an approval or rejection by an authorized owner
   */
  static submitApproval(params: SubmitApprovalParams): {
    success: boolean;
    request?: DemoAccessRequest;
    session?: DemoSession;
    error?: string;
  } {
    const approverEmail = params.approverEmail.toLowerCase().trim();

    // 1. Verify caller is an authorized owner
    const isAuthorized = AUTHORIZED_DEMO_OWNERS.map((e) => e.toLowerCase()).includes(approverEmail);
    if (!isAuthorized) {
      return {
        success: false,
        error: `Unauthorized: ${params.approverEmail} is not configured as an authorized dual-approval owner.`,
      };
    }

    const request = this.requestsStore.get(params.requestId);
    if (!request) {
      return { success: false, error: 'Demo access request not found.' };
    }

    if (request.approvalStatus === 'REJECTED') {
      return { success: false, error: 'Cannot approve a rejected demo request.' };
    }

    if (request.approvalStatus === 'APPROVED') {
      return { success: false, error: 'Demo request has already received full dual approval.' };
    }

    const existingApprovals = this.approvalsStore.get(params.requestId) || [];

    // 2. Prevent duplicate approval by the same owner
    const duplicateApproval = existingApprovals.find((a) => a.approverEmail.toLowerCase() === approverEmail);
    if (duplicateApproval) {
      return {
        success: false,
        error: `Duplicate approval rejected: ${params.approverEmail} has already submitted a decision for this request.`,
      };
    }

    const now = new Date();
    const approvalRecord: DemoAccessApproval = {
      id: `appr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      requestId: params.requestId,
      approverEmail,
      approverRole: params.approverRole || 'OWNER',
      decision: params.decision,
      notes: params.notes,
      ipAddress: params.ipAddress,
      createdAt: now.toISOString(),
    };

    existingApprovals.push(approvalRecord);
    this.approvalsStore.set(params.requestId, existingApprovals);

    if (params.decision === 'REJECTED') {
      request.approvalStatus = 'REJECTED';
      request.rejectionReason = params.notes || `Rejected by owner ${approverEmail}`;
      request.updatedAt = now.toISOString();
      request.approvals = existingApprovals;
      this.requestsStore.set(params.requestId, request);

      AuditService.logEvent({
        businessId: 'biz_01',
        actorEmail: approverEmail,
        actorRole: 'OWNER',
        eventType: 'demo_access_rejected',
        description: `Demo request ${params.requestId} rejected by ${approverEmail}`,
        metadata: { requestId: params.requestId, reason: request.rejectionReason },
      });

      return { success: true, request };
    }

    // 3. Count distinct approved owners
    const distinctApprovedOwners = new Set(
      existingApprovals.filter((a) => a.decision === 'APPROVED').map((a) => a.approverEmail.toLowerCase())
    );

    request.approvalsCount = distinctApprovedOwners.size;
    request.updatedAt = now.toISOString();
    request.approvals = existingApprovals;

    let createdSession: DemoSession | undefined;

    // 4. Two-Person Gate Verification: Exactly 2 distinct approvals needed
    if (distinctApprovedOwners.size >= 2) {
      request.approvalStatus = 'APPROVED';

      // Create Short-Lived Demo Session (2 hours duration)
      const rawSessionToken = this.generateRawToken();
      const sessionTokenHash = this.hashToken(rawSessionToken);
      const sessionExpiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours

      const sessionId = `dsess_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      createdSession = {
        id: sessionId,
        requestId: request.id,
        tokenId: request.tokenId,
        sessionTokenHash,
        businessId: 'biz_01', // Strictly demo tenant
        requesterEmail: request.requesterEmail,
        status: 'ACTIVE',
        expiresAt: sessionExpiresAt.toISOString(),
        lastActivityAt: now.toISOString(),
        createdAt: now.toISOString(),
        rawSessionToken,
      };

      this.sessionsStore.set(sessionId, createdSession);

      AuditService.logEvent({
        businessId: 'biz_01',
        actorEmail: approverEmail,
        actorRole: 'OWNER',
        eventType: 'demo_access_dual_approved',
        description: `Demo access for ${request.requesterEmail} received 2/2 approvals and active session created`,
        metadata: {
          requestId: request.id,
          sessionId,
          approvers: Array.from(distinctApprovedOwners),
        },
      });
    } else {
      request.approvalStatus = 'PENDING';
      AuditService.logEvent({
        businessId: 'biz_01',
        actorEmail: approverEmail,
        actorRole: 'OWNER',
        eventType: 'demo_access_partial_approval',
        description: `Demo request ${request.id} received 1/2 approvals (Pending 2nd owner)`,
        metadata: {
          requestId: request.id,
          firstApprover: approverEmail,
        },
      });
    }

    this.requestsStore.set(params.requestId, request);

    return {
      success: true,
      request,
      session: createdSession,
    };
  }

  /**
   * Revokes a demo token and all associated active demo sessions
   */
  static revokeToken(tokenId: string, revokedBy: string = 'admin@ventrexs.com'): boolean {
    const token = this.tokensStore.get(tokenId);
    if (!token) return false;

    const now = new Date().toISOString();
    token.status = 'REVOKED';
    token.revokedAt = now;
    token.revokedBy = revokedBy;
    this.tokensStore.set(tokenId, token);

    // Revoke any active sessions from this token
    for (const [sId, s] of this.sessionsStore.entries()) {
      if (s.tokenId === tokenId && s.status === 'ACTIVE') {
        s.status = 'REVOKED';
        this.sessionsStore.set(sId, s);
      }
    }

    AuditService.logEvent({
      businessId: token.businessId,
      actorEmail: revokedBy,
      actorRole: 'PLATFORM_ADMIN',
      eventType: 'demo_token_revoked',
      description: `Revoked demo token ${tokenId}`,
      metadata: { tokenId },
    });

    return true;
  }

  /**
   * Retrieves full overview for Admin Console
   */
  static getOverview(): DemoAccessOverview {
    const tokens = Array.from(this.tokensStore.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const requests = Array.from(this.requestsStore.values())
      .map((r) => ({
        ...r,
        approvals: this.approvalsStore.get(r.id) || [],
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const sessions = Array.from(this.sessionsStore.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const activeTokensCount = tokens.filter((t) => t.status === 'ACTIVE' && new Date(t.expiresAt) > new Date()).length;
    const pendingRequestsCount = requests.filter((r) => r.approvalStatus === 'PENDING').length;
    const activeSessionsCount = sessions.filter((s) => s.status === 'ACTIVE' && new Date(s.expiresAt) > new Date()).length;

    return {
      activeTokensCount,
      pendingRequestsCount,
      activeSessionsCount,
      tokens,
      requests,
      sessions,
    };
  }

  /**
   * Validates an active demo session by token hash
   */
  static validateDemoSession(rawSessionToken: string): {
    isValid: boolean;
    session?: DemoSession;
    error?: string;
  } {
    if (!rawSessionToken) return { isValid: false, error: 'Session token required.' };
    const hash = this.hashToken(rawSessionToken);

    let session: DemoSession | undefined;
    for (const s of this.sessionsStore.values()) {
      if (s.sessionTokenHash === hash) {
        session = s;
        break;
      }
    }

    if (!session) return { isValid: false, error: 'Demo session not found or invalid.' };
    if (session.status !== 'ACTIVE') return { isValid: false, error: `Demo session is ${session.status.toLowerCase()}.` };
    if (new Date() > new Date(session.expiresAt)) {
      session.status = 'EXPIRED';
      return { isValid: false, error: 'Demo session has expired.' };
    }

    session.lastActivityAt = new Date().toISOString();
    return { isValid: true, session };
  }

  /**
   * Retrieves the currently active demo token or automatically generates a 24h default invitation token
   */
  static getActiveDemoToken(businessId: string = 'biz_01'): DemoAccessToken {
    const now = new Date();
    for (const t of this.tokensStore.values()) {
      if (t.businessId === businessId && t.status === 'ACTIVE' && new Date(t.expiresAt) > now && t.rawToken) {
        return t;
      }
    }

    // If no active token exists, provision a fresh 24h token
    return this.createDemoToken({
      businessId,
      createdBy: 'platform@ventrexs.com',
      label: 'Public Website Live Demo Invitation',
    });
  }

  /**
   * Reset store (for testing purposes)
   */
  static resetStore() {
    this.tokensStore.clear();
    this.requestsStore.clear();
    this.approvalsStore.clear();
    this.sessionsStore.clear();
    this.rateLimitMap.clear();
  }
}
