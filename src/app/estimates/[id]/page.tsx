'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useApp } from '@/context/AppContext';
import { EstimateStatus, CommChannel } from '@/types';
import {
  FileText,
  ArrowLeft,
  Send,
  CheckCircle2,
  XCircle,
  Receipt,
  Printer,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Percent,
  Clock,
  Sparkles,
  Radio
} from 'lucide-react';

export default function EstimateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const estimateId = params.id as string;

  const {
    estimates,
    jobs,
    invoices,
    businessProfile,
    profile,
    sendEstimate,
    approveEstimate,
    rejectEstimate,
    convertEstimateToInvoice,
    deleteEstimate,
  } = useApp();

  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const [sendChannel, setSendChannel] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [approverName, setApproverName] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const estimate = useMemo(() => {
    return estimates.find(e => e.id === estimateId) || null;
  }, [estimates, estimateId]);

  const linkedJob = useMemo(() => {
    if (!estimate || !estimate.jobId) return null;
    return jobs.find(j => j.id === estimate.jobId) || null;
  }, [jobs, estimate]);

  const linkedInvoice = useMemo(() => {
    if (!estimate || !estimate.invoiceId) return null;
    return invoices.find(i => i.id === estimate.invoiceId) || null;
  }, [invoices, estimate]);

  if (!estimate) {
    return (
      <AppShell>
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-on-surface mb-2">Estimate Not Found</h2>
          <p className="text-sm text-outline mb-4">The requested estimate does not exist or has been deleted.</p>
          <Link href="/estimates">
            <Button variant="primary">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Estimates
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const handleSend = async () => {
    setIsProcessing(true);
    await sendEstimate(estimate.id, sendChannel);
    setIsProcessing(false);
    setIsSendModalOpen(false);
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    await approveEstimate(estimate.id, approverName.trim() || estimate.customerName);
    setIsProcessing(false);
    setIsApproveModalOpen(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    setIsProcessing(true);
    await rejectEstimate(estimate.id, rejectionReason.trim());
    setIsProcessing(false);
    setIsRejectModalOpen(false);
  };

  const handleConvertToInvoice = async () => {
    setIsProcessing(true);
    const inv = await convertEstimateToInvoice(estimate.id);
    setIsProcessing(false);
    if (inv) {
      router.push(`/invoices/${inv.id}`);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this estimate?')) {
      await deleteEstimate(estimate.id);
      router.push('/estimates');
    }
  };

  const companyName = businessProfile?.name || profile.businessName || 'Apex Comfort HVAC & Mechanical';
  const companyPhone = businessProfile?.phone || profile.phone || '+1 (555) 382-9912';
  const companyEmail = businessProfile?.email || profile.email || 'service@apexcomfort.com';
  const companyAddress = businessProfile?.address || profile.address || '742 Industrial Parkway, Austin, TX';

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Link 
              href="/estimates"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-outline hover:text-on-surface transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Estimates
            </Link>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print / PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
                onClick={handleDelete}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
              </Button>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="bg-surface p-4 sm:p-5 rounded-2xl border border-outline-variant shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-outline">{estimate.estimateNumber}</span>
                  <Badge estimateStatus={estimate.status} size="sm" />
                </div>
                <h1 className="text-lg sm:text-xl font-extrabold text-on-surface tracking-tight">
                  {estimate.title}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Send Button */}
              <Button 
                variant="outline" 
                size="sm"
                className="gap-1.5"
                onClick={() => setIsSendModalOpen(true)}
              >
                <Send className="w-3.5 h-3.5 text-primary" /> Send Estimate
              </Button>

              {/* Approve / Reject Controls */}
              {estimate.status !== 'APPROVED' && estimate.status !== 'REJECTED' && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-rose-600 border-rose-200 hover:bg-rose-50 gap-1.5"
                    onClick={() => setIsRejectModalOpen(true)}
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
                    onClick={() => setIsApproveModalOpen(true)}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Client Approve
                  </Button>
                </>
              )}

              {/* Convert to Invoice */}
              {estimate.status === 'APPROVED' && !estimate.invoiceId && (
                <Button 
                  variant="primary" 
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
                  onClick={handleConvertToInvoice}
                  disabled={isProcessing}
                >
                  <Receipt className="w-4 h-4" /> Convert to Invoice
                </Button>
              )}

              {linkedInvoice && (
                <Link href={`/invoices/${linkedInvoice.id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5 text-emerald-700 bg-emerald-50 border-emerald-200">
                    <Receipt className="w-3.5 h-3.5" /> View Invoice #{linkedInvoice.number}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Professional Estimate Document Preview */}
        <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm p-6 sm:p-10 space-y-8 print:border-none print:shadow-none">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-outline-variant pb-6">
            <div>
              <span className="text-xl font-black text-primary tracking-tight block">{companyName}</span>
              <p className="text-xs text-outline mt-1 leading-relaxed max-w-sm">
                {companyAddress}<br />
                Phone: {companyPhone} • Email: {companyEmail}
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-2xl font-black text-on-surface tracking-tight uppercase block">
                PROPOSAL / ESTIMATE
              </span>
              <span className="text-sm font-bold text-primary font-mono block mt-0.5">
                {estimate.estimateNumber}
              </span>
              <div className="text-xs text-outline mt-2 space-y-0.5">
                <div>Date: {new Date(estimate.createdAt).toLocaleDateString()}</div>
                <div>Valid Until: {estimate.validUntil || '30 Days from Issue'}</div>
              </div>
            </div>
          </div>

          {/* Customer & Job Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-surface-container/50 p-4 rounded-xl border border-outline-variant">
            <div>
              <span className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-1">
                Prepared For
              </span>
              <span className="text-sm font-bold text-on-surface block">
                {estimate.customerName || 'Direct Client'}
              </span>
              {estimate.customerEmail && (
                <span className="text-xs text-on-surface-variant block mt-0.5">
                  {estimate.customerEmail}
                </span>
              )}
              {estimate.customerPhone && (
                <span className="text-xs text-on-surface-variant block">
                  {estimate.customerPhone}
                </span>
              )}
            </div>

            <div>
              <span className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-1">
                Linked Work Order
              </span>
              {linkedJob ? (
                <div>
                  <Link href={`/jobs/${linkedJob.id}`} className="text-sm font-bold text-primary hover:underline block">
                    {linkedJob.title}
                  </Link>
                  <span className="text-xs text-outline block mt-0.5">
                    Service: {linkedJob.serviceType}
                  </span>
                  {linkedJob.propertyAddress && (
                    <span className="text-xs text-outline block">
                      Site: {linkedJob.propertyAddress}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs text-outline">Standalone Proposal</span>
              )}
            </div>
          </div>

          {/* Scope Description */}
          {estimate.description && (
            <div>
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider block mb-2">
                Scope & Specifications
              </span>
              <div className="p-4 bg-surface-container rounded-xl text-xs sm:text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                {estimate.description}
              </div>
            </div>
          )}

          {/* Line Items Table */}
          <div>
            <span className="text-xs font-bold text-on-surface uppercase tracking-wider block mb-3">
              Itemized Pricing Breakdown
            </span>
            <div className="overflow-x-auto border border-outline-variant rounded-xl">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-surface-container border-b border-outline-variant text-[11px] font-bold text-outline uppercase">
                  <tr>
                    <th className="py-2.5 px-4">Item & Description</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Unit Price</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {estimate.items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-surface-container/30">
                      <td className="py-3 px-4 font-medium text-on-surface">
                        {item.description}
                      </td>
                      <td className="py-3 px-4 text-center text-on-surface-variant font-medium">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-right text-on-surface-variant font-mono">
                        ${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-on-surface font-mono">
                        ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Summary & Totals */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-outline-variant">
            <div className="text-xs text-outline max-w-sm space-y-2">
              <span className="font-bold text-on-surface uppercase text-[11px] block">Proposal Terms</span>
              <p className="leading-relaxed whitespace-pre-wrap">
                {estimate.notes || 'All labor and materials are guaranteed as specified. All work to be completed in a substantial workmanlike manner according to standard practices.'}
              </p>
            </div>

            <div className="w-full sm:w-72 bg-surface-container/60 p-4 rounded-xl border border-outline-variant space-y-2 text-xs">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal:</span>
                <span className="font-semibold font-mono">${estimate.subtotal.toFixed(2)}</span>
              </div>
              {estimate.taxRate > 0 && (
                <div className="flex justify-between text-on-surface-variant">
                  <span>Tax ({estimate.taxRate}%):</span>
                  <span className="font-semibold font-mono">${estimate.taxAmount.toFixed(2)}</span>
                </div>
              )}
              {estimate.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span className="font-semibold font-mono">-${estimate.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-on-surface pt-2 border-t border-outline-variant">
                <span>Total Quote:</span>
                <span className="text-primary font-mono">${estimate.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Status & Approval Audit Banner */}
          {estimate.status === 'APPROVED' && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-emerald-900 block">
                  Proposal Formally Approved
                </span>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Approved by {estimate.approvedByCustomerName || 'Authorized Customer'} on {estimate.approvedAt ? new Date(estimate.approvedAt).toLocaleString() : 'Recent'}. Ready to execute and convert to invoice.
                </p>
              </div>
            </div>
          )}

          {estimate.status === 'REJECTED' && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-rose-900 block">
                  Proposal Rejected by Client
                </span>
                <p className="text-xs text-rose-700 mt-0.5">
                  Rejection Reason: {estimate.rejectionReason || 'Client did not proceed.'} (Recorded {estimate.rejectedAt ? new Date(estimate.rejectedAt).toLocaleDateString() : ''})
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Send Estimate Modal */}
        <Modal
          isOpen={isSendModalOpen}
          onClose={() => setIsSendModalOpen(false)}
          title={`Dispatch Estimate ${estimate.estimateNumber}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-outline">
              Deliver a secure, interactive quote link to your customer via the automated Phase 4 communication engine.
            </p>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5 uppercase tracking-wider">
                Select Delivery Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSendChannel('email')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    sendChannel === 'email'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-outline-variant bg-surface text-on-surface'
                  }`}
                >
                  <Mail className="w-4 h-4" /> Email
                </button>
                <button
                  type="button"
                  onClick={() => setSendChannel('sms')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    sendChannel === 'sms'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-outline-variant bg-surface text-on-surface'
                  }`}
                >
                  <Send className="w-4 h-4" /> SMS
                </button>
                <button
                  type="button"
                  onClick={() => setSendChannel('whatsapp')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    sendChannel === 'whatsapp'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-outline-variant bg-surface text-on-surface'
                  }`}
                >
                  <Radio className="w-4 h-4 text-emerald-600" /> WhatsApp
                </button>
              </div>
            </div>

            <div className="p-3 bg-surface-container rounded-xl text-xs space-y-1">
              <span className="text-outline block">Recipient:</span>
              <span className="font-bold text-on-surface block">{estimate.customerName || 'Customer'}</span>
              <span className="text-outline block">
                {sendChannel === 'email' ? estimate.customerEmail || 'No email on file' : estimate.customerPhone || 'No phone on file'}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsSendModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSend} disabled={isProcessing}>
                {isProcessing ? 'Sending...' : 'Send Estimate Now'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Approve Estimate Modal */}
        <Modal
          isOpen={isApproveModalOpen}
          onClose={() => setIsApproveModalOpen(false)}
          title="Authorize / Approve Proposal"
        >
          <div className="space-y-4">
            <p className="text-xs text-outline">
              Record formal customer acceptance of Proposal #{estimate.estimateNumber} for the agreed total of ${estimate.totalAmount.toFixed(2)}.
            </p>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1 uppercase tracking-wider">
                Approver Full Name / Authorized Representative
              </label>
              <Input
                placeholder={estimate.customerName || 'Client Name'}
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsApproveModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleApprove}
                disabled={isProcessing}
              >
                Record Client Approval
              </Button>
            </div>
          </div>
        </Modal>

        {/* Reject Estimate Modal */}
        <Modal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          title="Decline / Reject Proposal"
        >
          <div className="space-y-4">
            <p className="text-xs text-outline">
              Please specify the client's reason for declining this proposal for audit and CRM analytics.
            </p>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1 uppercase tracking-wider">
                Rejection Reason *
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g., Client opted for budget competitor, project postponed to next year, scope changed..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2.5 text-xs bg-surface-container rounded-lg border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={handleReject}
                disabled={!rejectionReason.trim() || isProcessing}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}
