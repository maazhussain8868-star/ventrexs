'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { FollowUpStatus } from '@/types';
import { 
  Star, 
  User, 
  Phone, 
  Mail, 
  Wrench, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  ShieldAlert, 
  Save, 
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Sparkles
} from 'lucide-react';

export default function CustomerFeedbackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { customerFeedback, updateFeedbackFollowUp, jobs, showToast } = useApp();

  const feedbackId = params.id as string;
  const feedback = customerFeedback.find(f => f.id === feedbackId) || customerFeedback[0];

  const [status, setStatus] = useState<FollowUpStatus>(feedback?.followUpStatus || 'NEW');
  const [notes, setNotes] = useState(feedback?.followUpNotes || '');
  const [assignedTo, setAssignedTo] = useState(feedback?.assignedTo || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!feedback) {
    return (
      <AppShell title="Feedback Record" showBack backUrl="/reputation">
        <div className="p-8 text-center bg-surface rounded-2xl border border-outline-variant">
          <p className="text-sm text-on-surface-variant">Feedback record not found.</p>
        </div>
      </AppShell>
    );
  }

  const job = jobs.find(j => j.id === feedback.jobId);

  const handleSaveFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateFeedbackFollowUp(feedback.id, status, notes, assignedTo);
    } catch (err: any) {
      showToast({ title: 'Failed to update follow-up', description: err.message, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickStatus = async (newStatus: FollowUpStatus) => {
    setStatus(newStatus);
    try {
      await updateFeedbackFollowUp(feedback.id, newStatus, notes, assignedTo);
    } catch (err: any) {
      showToast({ title: 'Status update failed', description: err.message, type: 'error' });
    }
  };

  return (
    <AppShell
      title={`Feedback: ${feedback.customerName}`}
      showBack
      backUrl="/reputation"
      actions={
        <div className="flex items-center gap-2">
          {feedback.customerPhone && (
            <a
              href={`tel:${feedback.customerPhone}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-outline-variant text-on-surface hover:bg-surface-variant font-semibold text-xs transition-colors shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5 text-primary" />
              Call Client
            </a>
          )}
          {feedback.customerEmail && (
            <a
              href={`mailto:${feedback.customerEmail}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-outline-variant text-on-surface hover:bg-surface-variant font-semibold text-xs transition-colors shadow-2xs"
            >
              <Mail className="w-3.5 h-3.5 text-primary" />
              Email Client
            </a>
          )}
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Rating, Comments, and Service Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Feedback Hero Card */}
          <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-2xs">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl ${
                  feedback.rating >= 4 
                    ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30' 
                    : feedback.rating === 3 
                    ? 'bg-amber-500/15 text-amber-700 border border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-700 border border-rose-500/30'
                }`}>
                  {feedback.rating} ★
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface">{feedback.customerName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge followUpStatus={feedback.followUpStatus} />
                    <span className="text-xs font-semibold text-on-surface-variant uppercase">
                      Channel: {feedback.channel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= feedback.rating
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-outline-variant'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Customer Quote / Statement */}
            <div className="p-4 rounded-xl bg-surface-variant/40 border border-outline-variant/60 my-4">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                Customer Feedback Transcript
              </span>
              <p className="text-sm text-on-surface leading-relaxed italic">
                &quot;{feedback.feedbackText || 'No written comment submitted with rating.'}&quot;
              </p>
            </div>

            {/* Highlighted Service Aspects */}
            {feedback.serviceAspects && feedback.serviceAspects.length > 0 && (
              <div>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                  Tagged Quality Aspects
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {feedback.serviceAspects.map((aspect, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-variant border border-outline-variant text-on-surface"
                    >
                      ✓ {aspect.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Linked Service Job Details */}
          <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-2xs">
            <h3 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" />
              Completed Service Work Order
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-surface-variant/30 border border-outline-variant/60">
                <span className="text-on-surface-variant font-medium block">Job Title:</span>
                <span className="font-bold text-on-surface text-sm">{feedback.jobTitle || job?.title || 'HVAC Maintenance Call'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-variant/30 border border-outline-variant/60">
                <span className="text-on-surface-variant font-medium block">Assigned Technician:</span>
                <span className="font-bold text-on-surface text-sm">{feedback.technicianName || job?.assignedTechName || 'Field Team'}</span>
              </div>
            </div>

            {job && (
              <div className="mt-4 pt-3 border-t border-outline-variant/60 flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">Work Order Reference: #{(job as any).jobNumber || job.id}</span>
                <Link
                  href={`/jobs/${job.id}`}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  View Full Job Record →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Internal Management Escalation & Follow-up */}
        <div className="space-y-6">
          <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-2xs">
            <h3 className="text-sm font-bold text-on-surface mb-1 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Management Follow-Up Ticket
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Track customer resolution, manager outreach, and service recovery.
            </p>

            <form onSubmit={handleSaveFollowUp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  Follow-Up Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as FollowUpStatus)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-surface-variant/40 border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary text-on-surface font-semibold"
                >
                  <option value="NEW">ACTION NEEDED (New Ticket)</option>
                  <option value="IN_REVIEW">IN REVIEW</option>
                  <option value="CONTACTED">CONTACTED (Client reached)</option>
                  <option value="RESOLVED">RESOLVED (Resolved with client)</option>
                  <option value="CLOSED">CLOSED (Archived)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  Assigned Manager / Specialist
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe (Operations)"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-surface-variant/40 border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary text-on-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  Internal Resolution Notes
                </label>
                <textarea
                  rows={4}
                  placeholder="Log details of phone call, resolution offer, or preventative measures..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-surface-variant/40 border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary text-on-surface leading-relaxed"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-full gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Ticket Details'}
                </Button>
              </div>
            </form>

            <div className="mt-4 pt-4 border-t border-outline-variant/60">
              <span className="text-xs font-bold text-on-surface-variant block mb-2">
                Quick Actions
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickStatus('CONTACTED')}
                  className="py-1.5 px-2 rounded-lg bg-surface-variant/60 hover:bg-surface-variant text-on-surface text-xs font-semibold text-center transition-colors"
                >
                  Mark Contacted
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickStatus('RESOLVED')}
                  className="py-1.5 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 text-xs font-bold text-center border border-emerald-500/20 transition-colors"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
