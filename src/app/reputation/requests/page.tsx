'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { 
  Send, 
  Search, 
  Filter, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  RotateCw, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Copy,
  Plus,
  ArrowLeft
} from 'lucide-react';

export default function ReviewRequestsHistoryPage() {
  const { 
    reviewRequests, 
    customerFeedback, 
    jobs,
    sendReviewRequest, 
    createReviewRequest,
    showToast 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [manualChannel, setManualChannel] = useState<'sms' | 'email' | 'whatsapp'>('sms');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completedJobs = jobs.filter(j => j.status === 'COMPLETED' || j.status === 'INVOICED');

  const filteredRequests = useMemo(() => {
    return reviewRequests.filter(req => {
      const matchSearch = 
        req.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (req.customerEmail && req.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (req.customerPhone && req.customerPhone.includes(searchTerm)) ||
        (req.technicianName && req.technicianName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (req.jobTitle && req.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchChannel = selectedChannel === 'ALL' || req.channel === selectedChannel;
      const matchStatus = selectedStatus === 'ALL' || req.status === selectedStatus;

      return matchSearch && matchChannel && matchStatus;
    });
  }, [reviewRequests, searchTerm, selectedChannel, selectedStatus]);

  const handleResend = async (requestId: string, channel: 'email' | 'sms' | 'whatsapp') => {
    try {
      await sendReviewRequest(requestId, channel);
    } catch (err: any) {
      showToast({ title: 'Resend failed', description: err.message, type: 'error' });
    }
  };

  const copySurveyLink = (url?: string) => {
    const fullUrl = url ? `${window.location.origin}${url}` : window.location.origin;
    navigator.clipboard.writeText(fullUrl);
    showToast({ title: 'Feedback survey link copied to clipboard', type: 'success' });
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) {
      showToast({ title: 'Please select a completed job', type: 'error' });
      return;
    }

    const job = jobs.find(j => j.id === selectedJobId);
    if (!job) return;

    setIsSubmitting(true);
    try {
      const newReq = await createReviewRequest({
        customerId: job.customerId,
        customerName: job.customerName,
        customerPhone: (job as any).customerPhone || '+1 (555) 019-2831',
        customerEmail: (job as any).customerEmail || 'client@example.com',
        jobId: job.id,
        technicianName: job.assignedTechName || job.technicianName,
        channel: manualChannel,
      });

      if (newReq) {
        await sendReviewRequest(newReq.id, manualChannel);
        setIsSendModalOpen(false);
        setSelectedJobId('');
      }
    } catch (err: any) {
      showToast({ title: 'Failed to create request', description: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell
      title="Review Requests History"
      showBack
      backUrl="/reputation"
      actions={
        <Button
          onClick={() => setIsSendModalOpen(true)}
          className="gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Send Review Request
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Search & Filter Bar */}
        <div className="bg-surface rounded-2xl border border-outline-variant p-4 shadow-2xs">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by customer, technician, job, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-surface-variant/40 border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary text-on-surface"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-surface-variant/40 border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary text-on-surface"
              >
                <option value="ALL">All Channels</option>
                <option value="sms">SMS Direct</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-surface-variant/40 border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary text-on-surface"
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="DELIVERED">Delivered</option>
                <option value="SENT">Sent</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests Table / Card List */}
        <div className="bg-surface rounded-2xl border border-outline-variant overflow-hidden shadow-2xs">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-variant/40 text-on-surface-variant font-bold uppercase tracking-wider border-b border-outline-variant">
                <tr>
                  <th className="py-3 px-4">Customer & Contact</th>
                  <th className="py-3 px-4">Service & Tech</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timeline</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                      <Send className="w-8 h-8 mx-auto text-on-surface-variant/40 mb-2" />
                      <p className="font-semibold">No review requests found</p>
                      <p className="text-[11px] mt-0.5">Try modifying your filters or dispatch a new review request.</p>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map(req => {
                    const feedback = customerFeedback.find(f => f.reviewRequestId === req.id);
                    return (
                      <tr key={req.id} className="hover:bg-surface-variant/20 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-on-surface">{req.customerName}</div>
                          <div className="text-[11px] text-on-surface-variant">
                            {req.customerPhone || req.customerEmail || 'No contact provided'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-on-surface">{req.jobTitle || 'Standard Service'}</div>
                          <div className="text-[11px] text-on-surface-variant">
                            Tech: <strong className="text-on-surface">{req.technicianName || 'Team'}</strong>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 font-bold text-on-surface uppercase">
                            {req.channel === 'sms' && <Smartphone className="w-3.5 h-3.5 text-teal-600" />}
                            {req.channel === 'email' && <Mail className="w-3.5 h-3.5 text-primary" />}
                            {req.channel === 'whatsapp' && <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}
                            {req.channel}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge reviewStatus={req.status} size="sm" />
                          {feedback && (
                            <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-amber-600">
                              ★ {feedback.rating} rating
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-on-surface-variant text-[11px]">
                          {req.completedAt ? (
                            <span>Completed {new Date(req.completedAt).toLocaleDateString()}</span>
                          ) : req.sentAt ? (
                            <span>Sent {new Date(req.sentAt).toLocaleDateString()}</span>
                          ) : req.scheduledFor ? (
                            <span>Scheduled for {new Date(req.scheduledFor).toLocaleDateString()}</span>
                          ) : (
                            <span>Created {new Date(req.createdAt).toLocaleDateString()}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {req.feedbackUrl && (
                              <button
                                onClick={() => copySurveyLink(req.feedbackUrl)}
                                title="Copy Survey Link"
                                className="p-1.5 rounded-lg border border-outline-variant hover:bg-surface-variant text-on-surface-variant hover:text-on-surface transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleResend(req.id, req.channel as any)}
                              title="Resend Request"
                              className="p-1.5 rounded-lg border border-outline-variant hover:bg-surface-variant text-on-surface-variant hover:text-on-surface transition-colors"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden divide-y divide-outline-variant/60">
            {filteredRequests.length === 0 ? (
              <div className="py-12 text-center text-on-surface-variant">
                <Send className="w-8 h-8 mx-auto text-on-surface-variant/40 mb-2" />
                <p className="font-semibold text-sm">No review requests found</p>
              </div>
            ) : (
              filteredRequests.map(req => {
                const feedback = customerFeedback.find(f => f.reviewRequestId === req.id);
                return (
                  <div key={req.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-on-surface">{req.customerName}</h4>
                        <p className="text-xs text-on-surface-variant">{req.jobTitle || 'Standard Service'}</p>
                      </div>
                      <Badge reviewStatus={req.status} size="sm" />
                    </div>

                    <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1">
                      <span className="flex items-center gap-1 uppercase font-semibold">
                        {req.channel === 'sms' && <Smartphone className="w-3.5 h-3.5 text-teal-600" />}
                        {req.channel === 'email' && <Mail className="w-3.5 h-3.5 text-primary" />}
                        {req.channel === 'whatsapp' && <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}
                        {req.channel}
                      </span>
                      <span>Tech: <strong className="text-on-surface">{req.technicianName || 'Team'}</strong></span>
                    </div>

                    {feedback && (
                      <div className="text-xs font-bold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                        Feedback logged: ★ {feedback.rating} / 5
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/40">
                      {req.feedbackUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copySurveyLink(req.feedbackUrl)}
                          className="gap-1 text-xs"
                        >
                          <Copy className="w-3 h-3" /> Link
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleResend(req.id, req.channel as any)}
                        className="gap-1 text-xs"
                      >
                        <RotateCw className="w-3 h-3" /> Resend
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* New Request Modal */}
      {isSendModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-outline-variant shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-on-surface mb-1 flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Dispatch Review Request
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Select a completed work order to dispatch an automated survey invitation.
            </p>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  Select Completed Work Order <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-surface-variant/40 border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary text-on-surface"
                >
                  <option value="">-- Select Completed Job --</option>
                  {completedJobs.map(j => (
                    <option key={j.id} value={j.id}>
                      {(j as any).jobNumber || j.id} — {j.customerName} ({j.title})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  Delivery Channel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['sms', 'email', 'whatsapp'] as const).map(ch => (
                    <button
                      type="button"
                      key={ch}
                      onClick={() => setManualChannel(ch)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${
                        manualChannel === ch
                          ? 'bg-primary text-on-primary border-primary shadow-xs'
                          : 'bg-surface-variant/40 border-outline-variant text-on-surface-variant hover:bg-surface-variant'
                      }`}
                    >
                      {ch === 'sms' && <Smartphone className="w-3.5 h-3.5" />}
                      {ch === 'email' && <Mail className="w-3.5 h-3.5" />}
                      {ch === 'whatsapp' && <MessageSquare className="w-3.5 h-3.5" />}
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSendModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Dispatching...' : 'Dispatch Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
