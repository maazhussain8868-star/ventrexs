'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import {
  ShieldCheck,
  Key,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  RotateCw,
  Trash2,
  Users,
  AlertTriangle,
  UserCheck,
  Building2,
  Sparkles,
  RefreshCw,
  Lock,
} from 'lucide-react';
import {
  generateDemoLinkAction,
  revokeDemoTokenAction,
  regenerateDemoTokenAction,
  getDemoAccessOverviewAction,
  submitOwnerApprovalAction,
} from '@/app/actions/demo-access';
import { DemoAccessToken, DemoAccessRequest, DemoSession } from '@/lib/demo-access/types';

export default function AdminDemoAccessPage() {
  const { showToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [activeTokensCount, setActiveTokensCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [activeSessionsCount, setActiveSessionsCount] = useState(0);

  const [tokens, setTokens] = useState<DemoAccessToken[]>([]);
  const [requests, setRequests] = useState<DemoAccessRequest[]>([]);
  const [sessions, setSessions] = useState<DemoSession[]>([]);

  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [tokenLabel, setTokenLabel] = useState('');
  const [activeApprover, setActiveApprover] = useState('owner1@ventrexs.com');

  const loadData = async () => {
    setLoading(true);
    const res = await getDemoAccessOverviewAction();
    setLoading(false);
    if (res.success && res.data) {
      setActiveTokensCount(res.data.activeTokensCount);
      setPendingRequestsCount(res.data.pendingRequestsCount);
      setActiveSessionsCount(res.data.activeSessionsCount);
      setTokens(res.data.tokens);
      setRequests(res.data.requests);
      setSessions(res.data.sessions);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateLink = async () => {
    setGenerating(true);
    const res = await generateDemoLinkAction(tokenLabel.trim() || 'Production Demo Invitation');
    setGenerating(false);

    if (res.success && res.data) {
      setGeneratedUrl(res.data.demoUrl);
      showToast({
        title: 'Demo Link Generated',
        description: 'New 24-hour token created. Previous active tokens rotated.',
        type: 'info',
      });
      loadData();
    } else {
      showToast({
        title: 'Generation Failed',
        description: res.error || 'Could not generate demo link.',
        type: 'error',
      });
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast({
      title: 'Link Copied',
      description: 'Demo invitation URL copied to clipboard.',
      type: 'info',
    });
  };

  const handleRevokeToken = async (tokenId: string) => {
    setActionLoadingId(tokenId);
    const res = await revokeDemoTokenAction(tokenId);
    setActionLoadingId(null);

    if (res.success) {
      showToast({ title: 'Token Revoked', description: 'Demo token and sessions deactivated.', type: 'info' });
      loadData();
    }
  };

  const handleRegenerateToken = async (oldTokenId: string) => {
    setActionLoadingId(oldTokenId);
    const res = await regenerateDemoTokenAction(oldTokenId);
    setActionLoadingId(null);

    if (res.success && res.data) {
      setGeneratedUrl(res.data.demoUrl);
      showToast({ title: 'Token Rotated', description: 'Fresh 24h demo token generated.', type: 'info' });
      loadData();
    }
  };

  const handleApprovalDecision = async (requestId: string, decision: 'APPROVED' | 'REJECTED') => {
    setActionLoadingId(requestId);
    const res = await submitOwnerApprovalAction({
      requestId,
      approverEmail: activeApprover,
      decision,
      notes: `Decision by ${activeApprover}`,
    });
    setActionLoadingId(null);

    if (res.success) {
      showToast({
        title: decision === 'APPROVED' ? 'Approval Registered' : 'Request Rejected',
        description: `Decision by ${activeApprover} recorded.`,
        type: 'info',
      });
      loadData();
    } else {
      showToast({
        title: 'Decision Error',
        description: res.error || 'Failed to submit approval.',
        type: 'error',
      });
    }
  };

  return (
    <AppShell title="Demo Access & Dual-Approval Center">
      <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Two-Person Approval Gate
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">Demo Access & Dual-Approval Center</h1>
            <p className="text-xs text-on-surface-variant">
              Manage 24-hour cryptographic demo links, enforce two distinct owner approvals, and monitor isolated demo sessions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              isLoading={loading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
              <Key className="w-4 h-4 text-primary" /> Active 24h Tokens
            </span>
            <div className="text-2xl font-black text-on-surface">{activeTokensCount}</div>
            <p className="text-[11px] text-on-surface-variant">Auto-rotates on new token creation</p>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" /> Pending Dual-Approvals
            </span>
            <div className="text-2xl font-black text-amber-500">{pendingRequestsCount}</div>
            <p className="text-[11px] text-on-surface-variant">Requires 2/2 distinct owner signatures</p>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" /> Active Demo Sessions
            </span>
            <div className="text-2xl font-black text-emerald-600">{activeSessionsCount}</div>
            <p className="text-[11px] text-on-surface-variant">Isolated demo tenant (2-hour TTL)</p>
          </div>
        </div>

        {/* 1. Generate Demo Link Tool */}
        <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-on-surface">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold">Generate Cryptographic Demo Link</h2>
          </div>
          <p className="text-xs text-on-surface-variant">
            Generates a high-entropy 24-hour invitation link. The token is hashed with SHA-256 before storage. Issuing a new token automatically revokes any previous active tokens for the demo environment.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="text"
              placeholder="Invitation Label (e.g. Acme Services Demo)"
              value={tokenLabel}
              onChange={(e) => setTokenLabel(e.target.value)}
              className="flex-1 bg-surface-container-high border border-outline-variant/40 rounded-xl px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleGenerateLink}
              isLoading={generating}
              leftIcon={<Key className="w-3.5 h-3.5" />}
              className="text-xs font-bold"
            >
              Generate Demo Link
            </Button>
          </div>

          {generatedUrl && (
            <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Live Demo URL (Expires in 24 Hours)
                </span>
                <button
                  onClick={() => handleCopyLink(generatedUrl)}
                  className="px-2.5 py-1 bg-primary text-on-primary rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-primary/90 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Link
                </button>
              </div>
              <div className="p-2.5 bg-surface-container-high rounded-lg text-xs font-mono break-all text-on-surface select-all">
                {generatedUrl}
              </div>
            </div>
          )}
        </section>

        {/* 2. Owner Approval Gate Section */}
        <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-500" /> Pending Demo Requests & Dual Approval Gate
              </h2>
              <p className="text-xs text-on-surface-variant">
                Both distinct authorized owner signatures are mandatory before prospect demo access is unlocked.
              </p>
            </div>

            {/* Approver Switcher for Demo/Testing */}
            <div className="flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-xl text-xs">
              <span className="text-on-surface-variant font-medium">Simulate Approver:</span>
              <select
                value={activeApprover}
                onChange={(e) => setActiveApprover(e.target.value)}
                className="bg-transparent text-on-surface font-bold focus:outline-none cursor-pointer"
              >
                <option value="owner1@ventrexs.com">Owner 1 (owner1@ventrexs.com)</option>
                <option value="owner2@ventrexs.com">Owner 2 (owner2@ventrexs.com)</option>
                <option value="admin@apexhvac.com">Owner 3 (admin@apexhvac.com)</option>
                <option value="unauthorized@guest.com">Unauthorized Guest (unauthorized@guest.com)</option>
              </select>
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="p-8 text-center bg-surface-container-low rounded-xl border border-dashed border-outline-variant/30 space-y-2">
              <Lock className="w-8 h-8 mx-auto text-on-surface-variant" />
              <div className="text-xs font-bold text-on-surface">No Pending Demo Requests</div>
              <p className="text-[11px] text-on-surface-variant">Generate a demo link and visit the URL to initiate an access request.</p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/20">
              {requests.map((req) => {
                const isApproved = req.approvalStatus === 'APPROVED';
                const isRejected = req.approvalStatus === 'REJECTED';
                const hasApproverVoted = req.approvals?.some(
                  (a) => a.approverEmail.toLowerCase() === activeApprover.toLowerCase()
                );

                return (
                  <div key={req.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-on-surface">{req.requesterName}</span>
                        <span className="text-xs text-on-surface-variant">({req.requesterEmail})</span>
                        {req.requesterCompany && (
                          <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-[11px] text-on-surface font-medium">
                            {req.requesterCompany}
                          </span>
                        )}
                      </div>

                      {/* Approval status badge */}
                      <div className="flex items-center gap-2 pt-1 text-xs">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                            isApproved
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : isRejected
                              ? 'bg-rose-500/10 text-rose-600'
                              : 'bg-amber-500/10 text-amber-600'
                          }`}
                        >
                          {isApproved
                            ? '2 / 2 Approvals Confirmed (Access Granted)'
                            : isRejected
                            ? 'Request Declined'
                            : `${req.approvalsCount} / 2 Approvals (Pending)`}
                        </span>

                        <span className="text-on-surface-variant text-[11px]">
                          Requested {new Date(req.createdAt).toLocaleTimeString()}
                        </span>
                      </div>

                      {/* Approver history pills */}
                      {req.approvals && req.approvals.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {req.approvals.map((appr) => (
                            <span
                              key={appr.id}
                              className="px-2 py-0.5 rounded bg-surface-container-high text-[10px] text-on-surface-variant font-mono"
                            >
                              ✓ {appr.approverEmail} ({appr.decision})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {!isApproved && !isRejected && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprovalDecision(req.id, 'APPROVED')}
                            isLoading={actionLoadingId === req.id}
                            disabled={hasApproverVoted}
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                            className="text-xs"
                          >
                            {hasApproverVoted ? 'Already Approved' : 'Approve (as Current Owner)'}
                          </Button>

                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleApprovalDecision(req.id, 'REJECTED')}
                            isLoading={actionLoadingId === req.id}
                            disabled={hasApproverVoted}
                            leftIcon={<XCircle className="w-3.5 h-3.5" />}
                            className="text-xs"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 3. Active & Historical Tokens Table */}
        <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" /> Active & Rotated Demo Tokens
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-outline-variant/30 text-on-surface-variant">
                <tr>
                  <th className="py-2.5 font-bold">Token ID / Label</th>
                  <th className="py-2.5 font-bold">Status</th>
                  <th className="py-2.5 font-bold">Created</th>
                  <th className="py-2.5 font-bold">Expires (24h)</th>
                  <th className="py-2.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {tokens.map((t) => {
                  const isExpired = new Date() > new Date(t.expiresAt);
                  const status = isExpired ? 'EXPIRED' : t.status;

                  return (
                    <tr key={t.id} className="hover:bg-surface-container-high/40">
                      <td className="py-3">
                        <div className="font-bold text-on-surface">{t.label}</div>
                        <div className="font-mono text-[10px] text-on-surface-variant">{t.id}</div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : status === 'REVOKED'
                              ? 'bg-rose-500/10 text-rose-600'
                              : 'bg-amber-500/10 text-amber-600'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-3 text-on-surface-variant">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 text-on-surface-variant">
                        {new Date(t.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 text-right space-x-2">
                        {status === 'ACTIVE' && (
                          <>
                            <button
                              onClick={() => handleRegenerateToken(t.id)}
                              disabled={actionLoadingId === t.id}
                              className="px-2 py-1 text-primary hover:bg-primary/10 rounded font-bold transition-colors"
                              title="Rotate Token"
                            >
                              <RotateCw className="w-3.5 h-3.5 inline mr-1" /> Rotate
                            </button>
                            <button
                              onClick={() => handleRevokeToken(t.id)}
                              disabled={actionLoadingId === t.id}
                              className="px-2 py-1 text-rose-600 hover:bg-rose-500/10 rounded font-bold transition-colors"
                              title="Revoke Token"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Revoke
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
