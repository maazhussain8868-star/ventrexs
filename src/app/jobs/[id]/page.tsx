'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useApp } from '@/context/AppContext';
import { JobStatus, JobPriority } from '@/types';
import {
  Wrench,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  ArrowLeft,
  Edit,
  Trash2,
  Share2,
  ExternalLink,
  Plus,
  Send,
  MessageSquare,
  FileCheck,
  Receipt,
  Navigation,
  Star
} from 'lucide-react';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const {
    jobs,
    estimates,
    invoices,
    communications,
    reviewRequests,
    customerFeedback,
    createReviewRequest,
    sendReviewRequest,
    updateJobStatus,
    assignJobTechnician,
    addJobActivity,
    deleteJob,
    showToast,
  } = useApp();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewChannel, setReviewChannel] = useState<'sms' | 'email' | 'whatsapp'>('sms');

  const [selectedTech, setSelectedTech] = useState('Leo Martinez');
  const [targetStatus, setTargetStatus] = useState<JobStatus>('IN_PROGRESS');
  const [statusNote, setStatusNote] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('Field Inspection Note');
  const [newNoteContent, setNewNoteContent] = useState('');

  const job = useMemo(() => {
    return jobs.find(j => j.id === jobId) || null;
  }, [jobs, jobId]);

  const linkedEstimate = useMemo(() => {
    if (!job) return null;
    return estimates.find(e => e.id === job.estimateId || e.jobId === job.id) || null;
  }, [estimates, job]);

  const linkedInvoice = useMemo(() => {
    if (!job) return null;
    return invoices.find(i => i.id === job.invoiceId) || null;
  }, [invoices, job]);

  const jobCommunications = useMemo(() => {
    if (!job) return [];
    return communications.filter(c => 
      c.jobId === job.id || 
      (job.customerId && c.customerId === job.customerId)
    );
  }, [communications, job]);

  const jobReviewRequest = useMemo(() => {
    if (!job) return null;
    return reviewRequests.find(r => r.jobId === job.id) || null;
  }, [reviewRequests, job]);

  const jobFeedback = useMemo(() => {
    if (!job) return null;
    return customerFeedback.find(f => f.jobId === job.id || (jobReviewRequest && f.reviewRequestId === jobReviewRequest.id)) || null;
  }, [customerFeedback, job, jobReviewRequest]);

  if (!job) {
    return (
      <AppShell>
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-on-surface mb-2">Work Order Not Found</h2>
          <p className="text-sm text-outline mb-4">The requested job does not exist or has been deleted.</p>
          <Link href="/jobs">
            <Button variant="primary">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Jobs
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const handleStatusChange = async (newStatus: JobStatus, note?: string) => {
    await updateJobStatus(job.id, newStatus, note);
    setIsStatusModalOpen(false);
    setStatusNote('');
  };

  const handleAssignTechnician = async () => {
    await assignJobTechnician(job.id, selectedTech);
    setIsAssignModalOpen(false);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    await addJobActivity(job.id, newNoteTitle, newNoteContent, 'TECHNICIAN_NOTE');
    setIsNoteModalOpen(false);
    setNewNoteContent('');
  };

  const handleDeleteJob = async () => {
    if (window.confirm('Are you sure you want to delete this work order?')) {
      await deleteJob(job.id);
      router.push('/jobs');
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Link 
              href="/jobs"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-outline hover:text-on-surface transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Work Orders
            </Link>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
                onClick={handleDeleteJob}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
              </Button>
            </div>
          </div>

          <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge jobStatus={job.status} size="sm" />
                  <Badge priority={job.priority as any} size="sm" />
                  <span className="text-xs text-outline font-mono">ID: {job.id}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">
                  {job.title}
                </h1>
                <p className="text-xs font-medium text-on-surface-variant mt-0.5">
                  {job.serviceType} • Created on {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Quick Status Progression Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {job.status !== 'IN_PROGRESS' && job.status !== 'COMPLETED' && (
                <Button 
                  variant="primary" 
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  onClick={() => handleStatusChange('IN_PROGRESS', 'Technician started work on site.')}
                >
                  <Play className="w-4 h-4" /> Start Job
                </Button>
              )}

              {job.status === 'IN_PROGRESS' && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-amber-600 border-amber-300 hover:bg-amber-50 gap-1.5"
                    onClick={() => handleStatusChange('ON_HOLD', 'Job paused awaiting parts or client access.')}
                  >
                    <Pause className="w-4 h-4" /> Hold
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                    onClick={() => handleStatusChange('COMPLETED', 'All repair tasks verified and completed.')}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Complete Work
                  </Button>
                </>
              )}

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsStatusModalOpen(true)}
              >
                Change Status...
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Quick Action Bar (Technician In-Field Convenience) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:hidden">
          {job.customerPhone && (
            <a 
              href={`tel:${job.customerPhone}`}
              className="p-3 bg-surface rounded-xl border border-outline-variant flex items-center justify-center gap-2 text-xs font-bold text-primary shadow-xs"
            >
              <Phone className="w-4 h-4" /> Call Client
            </a>
          )}

          {job.propertyAddress && (
            <a 
              href={`https://maps.google.com/?q=${encodeURIComponent(job.propertyAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-surface rounded-xl border border-outline-variant flex items-center justify-center gap-2 text-xs font-bold text-sky-600 shadow-xs"
            >
              <Navigation className="w-4 h-4" /> Maps GPS
            </a>
          )}

          <button
            onClick={() => setIsNoteModalOpen(true)}
            className="p-3 bg-surface rounded-xl border border-outline-variant flex items-center justify-center gap-2 text-xs font-bold text-on-surface shadow-xs"
          >
            <Plus className="w-4 h-4 text-primary" /> Add Log
          </button>

          <Link
            href={`/estimates?jobId=${job.id}`}
            className="p-3 bg-surface rounded-xl border border-outline-variant flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 shadow-xs"
          >
            <FileText className="w-4 h-4" /> Estimates
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Job Info, Financials, and Scope */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer & Location Card */}
            <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-xs">
              <h3 className="text-sm font-extrabold text-on-surface uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Customer & Job Site
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-outline block">Client Name</span>
                    <span className="text-sm font-bold text-on-surface">{job.customerName}</span>
                  </div>
                  {job.customerPhone && (
                    <div>
                      <span className="text-xs text-outline block">Contact Phone</span>
                      <a href={`tel:${job.customerPhone}`} className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> {job.customerPhone}
                      </a>
                    </div>
                  )}
                  {job.customerEmail && (
                    <div>
                      <span className="text-xs text-outline block">Email Address</span>
                      <a href={`mailto:${job.customerEmail}`} className="text-sm text-on-surface hover:underline flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-outline" /> {job.customerEmail}
                      </a>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-outline block">Service Property Address</span>
                    <div className="flex items-start gap-1.5 mt-0.5">
                      <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-on-surface">
                        {job.propertyAddress || 'No property address specified'}
                      </span>
                    </div>
                  </div>
                  {job.propertyAddress && (
                    <a 
                      href={`https://maps.google.com/?q=${encodeURIComponent(job.propertyAddress)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline mt-2"
                    >
                      Open in Google Maps <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Scope Description & Notes */}
            <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-xs">
              <h3 className="text-sm font-extrabold text-on-surface uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Scope of Work & Instructions
              </h3>

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-outline uppercase tracking-wider block mb-1">
                    Work Order Scope
                  </span>
                  <div className="p-3.5 bg-surface-container rounded-xl text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                    {job.description || 'No detailed scope description provided.'}
                  </div>
                </div>

                {job.internalNotes && (
                  <div>
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1">
                      Internal Field Notes (Private)
                    </span>
                    <div className="p-3.5 bg-amber-50/60 border border-amber-200/60 rounded-xl text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">
                      {job.internalNotes}
                    </div>
                  </div>
                )}

                {job.customerNotes && (
                  <div>
                    <span className="text-xs font-bold text-outline uppercase tracking-wider block mb-1">
                      Customer Requests & Gate Access
                    </span>
                    <div className="p-3.5 bg-surface-container rounded-xl text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                      {job.customerNotes}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Linked Estimates & Invoices */}
            <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-on-surface uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Financial Operations
                </h3>
                {!linkedEstimate && (
                  <Link href={`/estimates?action=create&jobId=${job.id}`}>
                    <Button size="sm" variant="outline" className="gap-1 text-xs">
                      <Plus className="w-3.5 h-3.5" /> Create Estimate
                    </Button>
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Estimate Card */}
                <div className="p-4 rounded-xl border border-outline-variant bg-surface-container/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-outline uppercase">Service Estimate</span>
                      {linkedEstimate && <Badge estimateStatus={linkedEstimate.status} size="sm" />}
                    </div>
                    {linkedEstimate ? (
                      <div>
                        <span className="text-sm font-bold text-on-surface block">
                          {linkedEstimate.estimateNumber}: {linkedEstimate.title}
                        </span>
                        <span className="text-lg font-extrabold text-on-surface mt-1 block">
                          ${linkedEstimate.totalAmount.toLocaleString()}
                        </span>
                        {linkedEstimate.approvedAt && (
                          <span className="text-xs text-emerald-600 block mt-1">
                            Approved by {linkedEstimate.approvedByCustomerName || 'Client'}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-outline py-2">
                        No estimate linked to this work order yet.
                      </p>
                    )}
                  </div>

                  {linkedEstimate && (
                    <div className="pt-3 mt-3 border-t border-outline-variant flex items-center justify-between">
                      <Link 
                        href={`/estimates/${linkedEstimate.id}`}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        View Estimate Details <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Invoice Card */}
                <div className="p-4 rounded-xl border border-outline-variant bg-surface-container/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-outline uppercase">Invoice & Settlement</span>
                      {linkedInvoice && <Badge status={linkedInvoice.status} size="sm" />}
                    </div>
                    {linkedInvoice ? (
                      <div>
                        <span className="text-sm font-bold text-on-surface block">
                          Invoice #{linkedInvoice.number}
                        </span>
                        <span className="text-lg font-extrabold text-on-surface mt-1 block">
                          ${linkedInvoice.totalAmount.toLocaleString()}
                        </span>
                        <div className="flex items-center justify-between text-xs text-outline mt-1">
                          <span>Paid: ${linkedInvoice.paymentsReceived.toLocaleString()}</span>
                          <span className="font-semibold text-on-surface">Balance: ${linkedInvoice.remainingBalance.toLocaleString()}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-outline py-2">
                        No invoice created yet. Convert an approved estimate or bill after completion.
                      </p>
                    )}
                  </div>

                  {linkedInvoice && (
                    <div className="pt-3 mt-3 border-t border-outline-variant flex items-center justify-between">
                      <Link 
                        href={`/invoices/${linkedInvoice.id}`}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        View Invoice <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Phase 6: Reputation & Customer Review Card */}
            <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-on-surface uppercase tracking-wider flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Customer Review & Satisfaction
                </h3>
                {jobReviewRequest && <Badge reviewStatus={jobReviewRequest.status} size="sm" />}
              </div>

              {jobFeedback ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container/60 border border-outline-variant">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        jobFeedback.rating >= 4 
                          ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30' 
                          : 'bg-rose-500/15 text-rose-700 border border-rose-500/30'
                      }`}>
                        {jobFeedback.rating} ★
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-on-surface">{jobFeedback.customerName}</span>
                          <Badge followUpStatus={jobFeedback.followUpStatus} size="sm" />
                        </div>
                        <span className="text-xs text-outline block mt-0.5">
                          Survey completed via {jobFeedback.channel.toUpperCase()} on {new Date(jobFeedback.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/reputation/feedback/${jobFeedback.id}`}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      View Ticket <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  {jobFeedback.feedbackText && (
                    <p className="text-xs text-on-surface leading-relaxed italic bg-surface-container p-3 rounded-xl border border-outline-variant">
                      &quot;{jobFeedback.feedbackText}&quot;
                    </p>
                  )}
                </div>
              ) : jobReviewRequest ? (
                <div className="p-4 rounded-xl border border-outline-variant bg-surface-container/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-on-surface block">
                      Review Survey Dispatched via {jobReviewRequest.channel.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-outline mt-0.5 block">
                      Status: {jobReviewRequest.status} • Sent {jobReviewRequest.sentAt ? new Date(jobReviewRequest.sentAt).toLocaleDateString() : 'Pending'}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await sendReviewRequest(jobReviewRequest.id, jobReviewRequest.channel as any);
                    }}
                    className="text-xs gap-1"
                  >
                    <Send className="w-3 h-3" /> Resend
                  </Button>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-outline-variant bg-surface-container/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-on-surface block">
                      No Review Request Sent Yet
                    </span>
                    <span className="text-[11px] text-outline mt-0.5 block">
                      {job.status === 'COMPLETED' || job.status === 'INVOICED'
                        ? 'Job is completed. Dispatch a satisfaction survey and Google review invitation.'
                        : 'Review request will become available once the job is completed.'}
                    </span>
                  </div>
                  {(job.status === 'COMPLETED' || job.status === 'INVOICED') && (
                    <Button
                      size="sm"
                      onClick={() => setIsReviewModalOpen(true)}
                      className="text-xs gap-1.5 shrink-0 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" /> Request Review
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Dispatch Info, Timeline & Communications */}
          <div className="space-y-6">
            {/* Technician & Schedule Card */}
            <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-on-surface uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Assigned Technician
                </h3>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-xs px-2"
                  onClick={() => setIsAssignModalOpen(true)}
                >
                  Reassign
                </Button>
              </div>

              <div className="p-3 bg-surface-container rounded-xl flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center shrink-0">
                  {(job.assignedTechName || job.technicianName || 'U').charAt(0)}
                </div>
                <div>
                  <span className="text-sm font-bold text-on-surface block">
                    {job.assignedTechName || job.technicianName || 'Unassigned'}
                  </span>
                  <span className="text-xs text-outline">Lead Certified Technician</span>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-outline-variant text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-outline flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Scheduled Date
                  </span>
                  <span className="font-semibold text-on-surface">
                    {job.scheduledDate || 'Not scheduled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-outline flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Estimated Duration
                  </span>
                  <span className="font-semibold text-on-surface">
                    {job.estimatedDurationMinutes || 60} minutes
                  </span>
                </div>
                {job.completedAt && (
                  <div className="flex items-center justify-between text-emerald-600 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed At
                    </span>
                    <span>{new Date(job.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Field Operations Timeline */}
            <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-on-surface uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> Activity Timeline
                </h3>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-xs px-2 gap-1"
                  onClick={() => setIsNoteModalOpen(true)}
                >
                  <Plus className="w-3 h-3" /> Log Note
                </Button>
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant">
                {(job.activities && job.activities.length > 0) ? (
                  job.activities.map((act) => (
                    <div key={act.id} className="relative">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-surface" />
                      <div>
                        <span className="text-xs font-bold text-on-surface block">
                          {act.title}
                        </span>
                        {act.description && (
                          <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                            {act.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-[10px] text-outline mt-1">
                          <span>{act.userName || 'System'}</span>
                          <span>•</span>
                          <span>{act.createdAt}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-outline py-2">No activity logged yet.</p>
                )}
              </div>
            </div>

            {/* Customer Communications Timeline */}
            {jobCommunications.length > 0 && (
              <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-xs">
                <h3 className="text-sm font-extrabold text-on-surface uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" /> Communication Log
                </h3>

                <div className="space-y-3">
                  {jobCommunications.slice(0, 3).map((comm) => (
                    <div key={comm.id} className="p-3 bg-surface-container rounded-xl text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-on-surface uppercase text-[10px] tracking-wider">
                          {comm.channel}
                        </span>
                        <span className="text-[10px] text-outline">{comm.createdAt}</span>
                      </div>
                      <p className="text-on-surface-variant line-clamp-2">{comm.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Assign Technician Modal */}
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title="Assign Field Technician"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1 uppercase tracking-wider">
                Select Technician
              </label>
              <select
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface-container rounded-lg border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
              >
                <option value="Leo Martinez">Leo Martinez (Master HVAC)</option>
                <option value="Sam Ortiz">Sam Ortiz (Senior Tech)</option>
                <option value="Sarah Jenkins">Sarah Jenkins (Estimator)</option>
                <option value="Carlos Rodriguez">Carlos Rodriguez (Plumbing)</option>
                <option value="Marcus Vance">Marcus Vance (Ops Lead)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAssignTechnician}>
                Assign to Work Order
              </Button>
            </div>
          </div>
        </Modal>

        {/* Status Transition Modal */}
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title="Update Job Status"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1 uppercase tracking-wider">
                New Status
              </label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as JobStatus)}
                className="w-full px-3 py-2 text-sm bg-surface-container rounded-lg border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
              >
                <option value="NEW">New</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="DISPATCHED">Dispatched</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1 uppercase tracking-wider">
                Status Change Note (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Reason for change, parts arrival, customer rescheduled..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="w-full p-2.5 text-sm bg-surface-container rounded-lg border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsStatusModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => handleStatusChange(targetStatus, statusNote)}>
                Apply Status
              </Button>
            </div>
          </div>
        </Modal>

        {/* Add Field Note Modal */}
        <Modal
          isOpen={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          title="Log Field Activity Note"
        >
          <form onSubmit={handleAddNote} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1 uppercase tracking-wider">
                Activity Title
              </label>
              <input
                type="text"
                required
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface-container rounded-lg border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1 uppercase tracking-wider">
                Note Content
              </label>
              <textarea
                rows={4}
                required
                placeholder="Observed refrigerant leak on suction service valve. Replaced Schrader core and pulled deep vacuum to 350 microns..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="w-full p-2.5 text-sm bg-surface-container rounded-lg border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsNoteModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save to Timeline
              </Button>
            </div>
          </form>
        </Modal>

        {/* Dispatch Review Request Modal */}
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          title="Dispatch Customer Review Request"
        >
          <div className="space-y-4">
            <p className="text-xs text-outline leading-relaxed">
              Send an automated satisfaction survey and Google review invitation to <strong className="text-on-surface">{job.customerName}</strong>.
            </p>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1 uppercase tracking-wider">
                Select Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['sms', 'email', 'whatsapp'] as const).map(ch => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setReviewChannel(ch)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase transition-all ${
                      reviewChannel === ch
                        ? 'bg-primary text-on-primary border-primary shadow-xs'
                        : 'bg-surface-container border-outline-variant text-on-surface'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-surface-container rounded-xl text-xs text-outline">
              Recipient: <strong className="text-on-surface">{job.customerPhone || job.customerEmail || 'Default Contact'}</strong>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsReviewModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={async () => {
                  const newReq = await createReviewRequest({
                    customerId: job.customerId,
                    customerName: job.customerName,
                    customerPhone: job.customerPhone,
                    customerEmail: job.customerEmail,
                    jobId: job.id,
                    technicianName: job.assignedTechName || job.technicianName,
                    channel: reviewChannel,
                  });
                  if (newReq) {
                    await sendReviewRequest(newReq.id, reviewChannel);
                    setIsReviewModalOpen(false);
                  }
                }}
              >
                <Send className="w-3.5 h-3.5 mr-1.5" /> Dispatch Now
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}
