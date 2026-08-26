'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { AppShell } from '@/components/layout/AppShell';
import { 
  Sparkles, 
  Check, 
  X, 
  Mail, 
  MessageSquare, 
  PhoneCall, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  Send 
} from 'lucide-react';
import { CommunicationItem } from '@/types';

export default function ApprovalsPage() {
  const { communications, approveCommunication, rejectCommunication } = useApp();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingApprovals = communications.filter(
    c => c.approvalStatus === 'pending_approval'
  );

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    await approveCommunication(id);
    setIsProcessing(false);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId || !rejectReason.trim()) return;

    setIsProcessing(true);
    await rejectCommunication(rejectingId, rejectReason);
    setIsProcessing(false);
    setRejectingId(null);
    setRejectReason('');
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-5xl mx-auto pb-16">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/communications" className="p-1 rounded-lg text-outline hover:bg-surface-container-high transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-black tracking-tight text-on-surface">
                Human Approval Queue
              </h1>
              {pendingApprovals.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
                  {pendingApprovals.length} Pending
                </span>
              )}
            </div>
            <p className="text-sm text-outline pl-8">
              Review and authorize outbound AI drafts and policy-flagged communications before dispatch.
            </p>
          </div>
        </div>

        {/* Pending Items List */}
        {pendingApprovals.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-surface border border-outline-variant shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-on-surface">All caught up!</h3>
            <p className="text-xs text-outline max-w-md mx-auto">
              There are no messages currently waiting for supervisor authorization. All communications are flowing cleanly.
            </p>
            <div className="pt-2">
              <Link
                href="/communications"
                className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs font-bold text-on-surface inline-block"
              >
                Back to Communication Center
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingApprovals.map(comm => (
              <div
                key={comm.id}
                className="p-6 rounded-3xl bg-surface border border-amber-500/30 hover:border-amber-500/50 shadow-xs space-y-4 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-outline-variant">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                      {comm.channel === 'email' && <Mail className="w-5 h-5 text-blue-500" />}
                      {comm.channel === 'sms' && <MessageSquare className="w-5 h-5 text-emerald-500" />}
                      {comm.channel === 'whatsapp' && <PhoneCall className="w-5 h-5 text-green-600" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-on-surface">
                          {comm.customerName || comm.leadName || 'Customer Recipient'}
                        </span>
                        <span className="text-xs text-outline font-mono">
                          {comm.customerEmail || comm.customerPhone}
                        </span>
                      </div>
                      <span className="text-[11px] text-outline capitalize">
                        Channel: {comm.channel.toUpperCase()} &bull; Created {comm.createdAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Draft / Supervisor Gate
                    </span>
                  </div>
                </div>

                {comm.subject && (
                  <div>
                    <p className="text-[11px] text-outline uppercase font-bold tracking-wider mb-0.5">Subject</p>
                    <p className="text-xs font-bold text-on-surface">{comm.subject}</p>
                  </div>
                )}

                <div>
                  <p className="text-[11px] text-outline uppercase font-bold tracking-wider mb-1">Message Preview</p>
                  <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant text-xs text-on-surface whitespace-pre-line leading-relaxed">
                    {comm.message}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Ethical standards & balance verification verified server-side.</span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => setRejectingId(comm.id)}
                      disabled={isProcessing}
                      className="px-4 py-2 rounded-xl border border-rose-500/20 hover:bg-rose-500/10 text-rose-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors flex-1 sm:flex-initial"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject Draft</span>
                    </button>

                    <button
                      onClick={() => handleApprove(comm.id)}
                      disabled={isProcessing}
                      className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs flex-1 sm:flex-initial"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Dispatch</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rejection Reason Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl border border-outline-variant shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
              <h3 className="font-bold text-base text-on-surface">Reject Communication Draft</h3>
              <button onClick={() => setRejectingId(null)} className="p-1 rounded-lg text-outline hover:bg-surface-container-high">
                ✕
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="p-6 space-y-4">
              <p className="text-xs text-outline">
                Please provide a reason for rejecting this communication. It will be recorded in the audit log.
              </p>

              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Rejection Reason
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Tone too aggressive, inaccurate timing, or customer contacted via phone instead..."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-hidden focus:border-primary"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="px-4 py-2 rounded-xl border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container-high"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Confirm Rejection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
