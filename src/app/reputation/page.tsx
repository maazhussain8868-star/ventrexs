'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { 
  Star, 
  Send, 
  Settings, 
  ThumbsUp, 
  ThumbsDown, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  ChevronRight, 
  ExternalLink,
  Smartphone,
  Mail,
  Filter,
  Plus
} from 'lucide-react';

export default function ReputationDashboardPage() {
  const { 
    reputationStats, 
    customerFeedback, 
    reviewRequests, 
    technicianMetrics, 
    reviewSettings,
    jobs,
    customers,
    createReviewRequest,
    sendReviewRequest,
    showToast 
  } = useApp();

  const [filterSentiment, setFilterSentiment] = useState<'all' | 'positive' | 'negative' | 'action_needed'>('all');
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'sms' | 'email' | 'whatsapp'>('sms');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completedJobs = jobs.filter(j => j.status === 'COMPLETED' || j.status === 'INVOICED');

  const filteredFeedback = customerFeedback.filter(f => {
    if (filterSentiment === 'positive') return f.rating >= 4;
    if (filterSentiment === 'negative') return f.rating <= 2;
    if (filterSentiment === 'action_needed') return f.followUpStatus === 'NEW' || f.followUpStatus === 'IN_REVIEW';
    return true;
  });

  const handleManualSend = async (e: React.FormEvent) => {
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
        channel: selectedChannel,
      });

      if (newReq) {
        await sendReviewRequest(newReq.id, selectedChannel);
        setIsSendModalOpen(false);
        setSelectedJobId('');
      }
    } catch (err: any) {
      showToast({ title: 'Failed to send request', description: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell
      title="Reputation & Reviews"
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/settings/reputation"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-outline-variant text-on-surface hover:bg-surface-variant font-semibold text-xs transition-colors shadow-2xs"
          >
            <Settings className="w-3.5 h-3.5 text-on-surface-variant" />
            Settings
          </Link>
          <Link
            href="/reputation/requests"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-outline-variant text-on-surface hover:bg-surface-variant font-semibold text-xs transition-colors shadow-2xs"
          >
            <Send className="w-3.5 h-3.5 text-on-surface-variant" />
            Request History
          </Link>
          <Button
            onClick={() => setIsSendModalOpen(true)}
            className="gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Send Review Request
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <StatCard
            label="Total Sent"
            value={reputationStats.sent}
            subtext={`${reputationStats.deliveryRate}% delivered`}
            icon={<Send className="w-5 h-5 text-primary" />}
          />
          <StatCard
            label="Response Rate"
            value={`${reputationStats.responseRate}%`}
            subtext={`${reputationStats.completed} reviews logged`}
            icon={<TrendingUp className="w-5 h-5 text-teal-600" />}
          />
          <StatCard
            label="Average Rating"
            value={`${reputationStats.averageRating} ★`}
            subtext="Across all platforms"
            icon={<Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
          />
          <StatCard
            label="Positive"
            value={reputationStats.positiveCount}
            subtext="4-5 star satisfaction"
            icon={<ThumbsUp className="w-5 h-5 text-emerald-600" />}
          />
          <StatCard
            label="Negative"
            value={reputationStats.negativeCount}
            subtext="1-2 star alerts"
            icon={<ThumbsDown className="w-5 h-5 text-rose-600" />}
          />
          <StatCard
            label="Action Needed"
            value={reputationStats.pendingFollowUps}
            subtext="Open follow-up tickets"
            icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
          />
        </div>

        {/* Middle Section: Ratings Breakdown & Channel Response Rates */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rating Distribution Bar */}
          <div className="bg-surface rounded-2xl border border-outline-variant p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                Rating Distribution
              </h3>
              <span className="text-xs font-semibold text-on-surface-variant">
                {customerFeedback.length} total responses
              </span>
            </div>

            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map(stars => {
                const count = (reputationStats.ratingDistribution as any)[stars] || 0;
                const pct = customerFeedback.length > 0 ? Math.round((count / customerFeedback.length) * 100) : 0;
                return (
                  <div key={stars} className="flex items-center gap-3 text-xs">
                    <span className="w-12 font-bold text-on-surface flex items-center gap-1">
                      {stars} <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    </span>
                    <div className="flex-1 h-2.5 bg-surface-variant rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          stars >= 4 ? 'bg-emerald-500' : stars === 3 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-12 text-right font-medium text-on-surface-variant">
                      {count} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>

            {reviewSettings.googleReviewUrl && (
              <div className="mt-5 pt-4 border-t border-outline-variant/60 flex items-center justify-between">
                <span className="text-xs text-on-surface-variant font-medium">Google Review Link</span>
                <a
                  href={reviewSettings.googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  View Public Page <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Channel Response Performance */}
          <div className="bg-surface rounded-2xl border border-outline-variant p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Send className="w-4 h-4 text-primary" />
                Channel Response Rates
              </h3>
              <span className="text-xs text-on-surface-variant font-semibold">Live Metrics</span>
            </div>

            <div className="space-y-4">
              {/* SMS */}
              <div className="p-3.5 rounded-xl bg-surface-variant/40 border border-outline-variant/60">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-on-surface flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                    SMS Direct
                  </span>
                  <span className="font-semibold text-teal-700">
                    {reputationStats.channelBreakdown.sms.sent > 0 
                      ? Math.round((reputationStats.channelBreakdown.sms.completed / reputationStats.channelBreakdown.sms.sent) * 100) 
                      : 0}% conversion
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                  <span>{reputationStats.channelBreakdown.sms.sent} dispatches</span>
                  <span>{reputationStats.channelBreakdown.sms.completed} surveys completed</span>
                </div>
              </div>

              {/* Email */}
              <div className="p-3.5 rounded-xl bg-surface-variant/40 border border-outline-variant/60">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-on-surface flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    Email Invitations
                  </span>
                  <span className="font-semibold text-primary">
                    {reputationStats.channelBreakdown.email.sent > 0 
                      ? Math.round((reputationStats.channelBreakdown.email.completed / reputationStats.channelBreakdown.email.sent) * 100) 
                      : 0}% conversion
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                  <span>{reputationStats.channelBreakdown.email.sent} dispatches</span>
                  <span>{reputationStats.channelBreakdown.email.completed} surveys completed</span>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="p-3.5 rounded-xl bg-surface-variant/40 border border-outline-variant/60">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-on-surface flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    WhatsApp Business
                  </span>
                  <span className="font-semibold text-emerald-700">
                    {reputationStats.channelBreakdown.whatsapp.sent > 0 
                      ? Math.round((reputationStats.channelBreakdown.whatsapp.completed / reputationStats.channelBreakdown.whatsapp.sent) * 100) 
                      : 0}% conversion
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                  <span>{reputationStats.channelBreakdown.whatsapp.sent} dispatches</span>
                  <span>{reputationStats.channelBreakdown.whatsapp.completed} surveys completed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Review Automation Status Banner */}
          <div className="bg-surface rounded-2xl border border-outline-variant p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Auto-Pilot Dispatch
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  reviewSettings.automationEnabled 
                    ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30' 
                    : 'bg-surface-variant text-on-surface-variant'
                }`}>
                  {reviewSettings.automationEnabled ? 'ACTIVE' : 'PAUSED'}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                When a technician completes a work order, an automated review survey is dispatched via <strong className="text-on-surface uppercase">{reviewSettings.defaultChannel}</strong> with a <strong className="text-on-surface">{reviewSettings.requestDelayHours} hour</strong> grace delay.
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-outline-variant/60">
              <Link
                href="/settings/reputation"
                className="w-full py-2 px-3 rounded-xl bg-surface-variant/60 hover:bg-surface-variant text-on-surface font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                Configure Grace Delays & Templates
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Technician Satisfaction Scorecard */}
        <div className="bg-surface rounded-2xl border border-outline-variant p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Field Technician Quality Scorecard
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Client satisfaction and review generation metrics per service specialist.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {technicianMetrics.map((tech) => (
              <div 
                key={tech.technicianName} 
                className="p-4 rounded-xl border border-outline-variant bg-surface-variant/20 hover:bg-surface-variant/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-on-surface">{tech.technicianName}</h4>
                  <span className="flex items-center gap-1 font-bold text-xs text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <Star className="w-3 h-3 fill-amber-500" />
                    {tech.averageRating}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-on-surface-variant">
                  <div className="flex justify-between">
                    <span>Jobs Completed:</span>
                    <span className="font-bold text-on-surface">{tech.completedJobs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Review Responses:</span>
                    <span className="font-bold text-on-surface">{tech.responses} / {tech.reviewRequests} ({tech.responseRate}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Positive / Negative:</span>
                    <span className="font-bold text-on-surface">
                      <span className="text-emerald-600 font-bold">{tech.positiveCount}</span> / <span className="text-rose-600 font-bold">{tech.negativeCount}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Feedback Feed & Follow-up Queue */}
        <div className="bg-surface rounded-2xl border border-outline-variant overflow-hidden shadow-2xs">
          <div className="p-5 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Customer Feedback & Management Escalation Feed
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Real-time feedback collected directly from completed work orders.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              {(['all', 'positive', 'negative', 'action_needed'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilterSentiment(f)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    filterSentiment === f
                      ? 'bg-primary text-on-primary shadow-2xs'
                      : 'bg-surface-variant text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'positive' ? '★ 4-5' : f === 'negative' ? '★ 1-2' : 'Action Needed'}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-outline-variant/60">
            {filteredFeedback.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/60 mb-2" />
                <p className="font-semibold text-sm">No feedback matching current filter.</p>
                <p className="text-xs mt-1">All service reviews are processed and updated.</p>
              </div>
            ) : (
              filteredFeedback.map(fb => (
                <div key={fb.id} className="p-5 hover:bg-surface-variant/20 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        fb.rating >= 4 
                          ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30' 
                          : fb.rating === 3 
                          ? 'bg-amber-500/15 text-amber-700 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-700 border border-rose-500/30'
                      }`}>
                        {fb.rating} ★
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-on-surface">{fb.customerName}</span>
                          <Badge followUpStatus={fb.followUpStatus} size="sm" />
                        </div>
                        <div className="text-xs text-on-surface-variant flex items-center gap-2 mt-0.5">
                          {fb.jobTitle && <span>{fb.jobTitle}</span>}
                          {fb.technicianName && <span>• Tech: <strong className="text-on-surface">{fb.technicianName}</strong></span>}
                          <span>• Channel: <strong className="uppercase">{fb.channel}</strong></span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/reputation/feedback/${fb.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface border border-outline-variant hover:bg-surface-variant text-on-surface font-semibold text-xs transition-colors shrink-0 shadow-2xs"
                    >
                      Manage Ticket <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {fb.feedbackText && (
                    <p className="text-xs text-on-surface leading-relaxed pl-13 mt-1 bg-surface-variant/30 p-2.5 rounded-xl border border-outline-variant/40">
                      &quot;{fb.feedbackText}&quot;
                    </p>
                  )}

                  {fb.followUpNotes && (
                    <div className="mt-2 pl-13 flex items-center gap-2 text-xs text-amber-800 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{fb.followUpNotes}</span>
                      {fb.assignedTo && <span className="ml-auto font-bold">Assigned: {fb.assignedTo}</span>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Manual Send Review Request Modal */}
      {isSendModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-outline-variant shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-on-surface mb-1 flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Dispatch Review Request
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Manually trigger a satisfaction survey and review invitation for a completed job.
            </p>

            <form onSubmit={handleManualSend} className="space-y-4">
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
                      onClick={() => setSelectedChannel(ch)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${
                        selectedChannel === ch
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

              <div className="p-3 bg-surface-variant/40 rounded-xl border border-outline-variant/60 text-xs text-on-surface-variant">
                <span className="font-bold text-on-surface">Ethical Review Policy:</span> Customers with high satisfaction (4-5 stars) will be directed to your Google Review page. Customers with constructive feedback (1-3 stars) will be logged to your management queue.
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
