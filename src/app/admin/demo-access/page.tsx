'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
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

  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenLabel.trim()) return;

    setGenerating(true);
    const res = await generateDemoLinkAction(tokenLabel.trim());
    setGenerating(false);

    if (res.success && res.data) {
      setGeneratedUrl(res.data.demoUrl);
      setTokenLabel('');
      showToast({
        title: 'Demo Link Generated',
        description: '24-hour cryptographic demo token created.',
        type: 'success',
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
      showToast({
        title: 'Token Revoked',
        description: 'Demo access immediately terminated.',
        type: 'info',
      });
      loadData();
    } else {
      showToast({
        title: 'Revocation Failed',
        description: res.error || 'Failed to revoke demo token.',
        type: 'error',
      });
    }
  };

  const handleRegenerateToken = async (tokenId: string) => {
    setActionLoadingId(tokenId);
    const res = await regenerateDemoTokenAction(tokenId);
    setActionLoadingId(null);

    if (res.success && res.data) {
      setGeneratedUrl(res.data.demoUrl);
      showToast({
        title: 'Token Rotated',
        description: 'New 24-hour secret generated.',
        type: 'success',
      });
      loadData();
    } else {
      showToast({
        title: 'Rotation Failed',
        description: res.error || 'Failed to rotate demo token.',
        type: 'error',
      });
    }
  };

  const handleApprovalDecision = async (requestId: string, decision: 'APPROVED' | 'REJECTED') => {
    setActionLoadingId(requestId);
    const res = await submitOwnerApprovalAction({
      requestId,
      approverEmail: activeApprover,
      decision,
    });
    setActionLoadingId(null);

    if (res.success) {
      showToast({
        title: decision === 'APPROVED' ? 'Approval Signed' : 'Request Rejected',
        description: res.data?.request?.approvalStatus === 'APPROVED' ? 'Quorum achieved! Dual approval granted.' : 'Decision registered.',
        type: 'success',
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
    <AdminLayout
      title="Demo Access & Dual-Approval Center"
      subtitle="Manage 24-hour cryptographic demo links, enforce two distinct owner approvals, and monitor isolated demo sessions."
      showBack
      backUrl="/admin"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          isLoading={loading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="text-xs bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
        >
          Refresh
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-indigo-600" /> Active 24h Tokens
            </span>
            <p className="text-3xl font-extrabold text-slate-900 font-mono">{activeTokensCount}</p>
            <p className="text-[11px] text-slate-400">Cryptographically signed links</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-500" /> Pending Dual Approvals
            </span>
            <p className="text-3xl font-extrabold text-amber-600 font-mono">{pendingRequestsCount}</p>
            <p className="text-[11px] text-slate-400">Requires 2 separate owner sign-offs</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-500" /> Live Demo Sessions
            </span>
            <p className="text-3xl font-extrabold text-emerald-600 font-mono">{activeSessionsCount}</p>
            <p className="text-[11px] text-slate-400">Isolated sandbox guest access</p>
          </div>
        </div>

        {/* Generator Form */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Generate Signed Demo Invitation Link</h2>
            <p className="text-xs text-slate-500">Creates an ephemeral 24-hour guest pass requiring zero password creation.</p>
          </div>

          <form onSubmit={handleGenerateLink} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g., Prospect: Enterprise Contractor Triage Demo"
              value={tokenLabel}
              onChange={(e) => setTokenLabel(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              required
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={generating}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Generate Demo Link
            </Button>
          </form>

          {generatedUrl && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Demo URL Ready (Valid for 24 hours)
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyLink(generatedUrl)}
                  leftIcon={<Copy className="w-3 h-3" />}
                  className="text-xs bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                >
                  Copy Link
                </Button>
              </div>
              <p className="text-xs font-mono text-emerald-900 bg-white p-2.5 rounded-lg border border-emerald-200 break-all select-all">
                {generatedUrl}
              </p>
            </div>
          )}
        </section>

        {/* Tokens Table */}
        <section className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Active Demo Tokens</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Label</th>
                  <th className="p-4">Created By</th>
                  <th className="p-4">Expires At</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {tokens.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      No active demo tokens. Generate one above.
                    </td>
                  </tr>
                ) : (
                  tokens.map((tok) => {
                    const isRevoked = tok.status === 'REVOKED';
                    const isExpired = new Date(tok.expiresAt).getTime() < Date.now();
                    return (
                      <tr key={tok.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{tok.label}</td>
                        <td className="p-4 font-mono text-slate-500">{tok.createdBy}</td>
                        <td className="p-4 font-mono text-slate-500">{new Date(tok.expiresAt).toLocaleString()}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isRevoked || isExpired
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {isRevoked ? 'REVOKED' : isExpired ? 'EXPIRED' : 'ACTIVE'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {!isRevoked && !isExpired && (
                            <>
                              <button
                                onClick={() => handleRegenerateToken(tok.id)}
                                disabled={actionLoadingId === tok.id}
                                className="text-indigo-600 hover:text-indigo-800 font-bold p-1"
                                title="Rotate Secret"
                              >
                                Rotate
                              </button>
                              <button
                                onClick={() => handleRevokeToken(tok.id)}
                                disabled={actionLoadingId === tok.id}
                                className="text-red-600 hover:text-red-800 font-bold p-1"
                                title="Revoke Immediately"
                              >
                                Revoke
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
