export type DemoTokenStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';
export type DemoRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ApprovalDecision = 'APPROVED' | 'REJECTED';

export interface DemoAccessToken {
  id: string;
  businessId: string;
  tokenHash: string;
  createdBy: string;
  label: string;
  status: DemoTokenStatus;
  expiresAt: string;
  createdAt: string;
  revokedAt?: string;
  revokedBy?: string;
  // Raw token is populated ONLY at creation time for display in "Copy Link"
  rawToken?: string;
}

export interface DemoAccessApproval {
  id: string;
  requestId: string;
  approverEmail: string;
  approverRole: string;
  decision: ApprovalDecision;
  notes?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface DemoAccessRequest {
  id: string;
  tokenId: string;
  requesterName: string;
  requesterEmail: string;
  requesterCompany?: string;
  requesterIp?: string;
  userAgent?: string;
  approvalStatus: DemoRequestStatus;
  approvalsCount: number;
  requiredApprovals: number;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  approvals?: DemoAccessApproval[];
}

export interface DemoSession {
  id: string;
  requestId: string;
  tokenId: string;
  sessionTokenHash: string;
  businessId: string;
  requesterEmail: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  expiresAt: string;
  lastActivityAt: string;
  createdAt: string;
  rawSessionToken?: string;
}

export interface DemoAccessOverview {
  activeTokensCount: number;
  pendingRequestsCount: number;
  activeSessionsCount: number;
  tokens: DemoAccessToken[];
  requests: DemoAccessRequest[];
  sessions: DemoSession[];
}

export interface CreateDemoTokenParams {
  businessId?: string;
  createdBy: string;
  label?: string;
}

export interface SubmitDemoRequestParams {
  rawToken: string;
  requesterName: string;
  requesterEmail: string;
  requesterCompany?: string;
  requesterIp?: string;
  userAgent?: string;
}

export interface SubmitApprovalParams {
  requestId: string;
  approverEmail: string;
  approverRole?: string;
  decision: ApprovalDecision;
  notes?: string;
  ipAddress?: string;
}
