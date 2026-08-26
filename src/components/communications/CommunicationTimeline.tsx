'use client';

import React from 'react';
import { CommunicationItem, CommChannel } from '@/types';
import { Mail, MessageSquare, PhoneCall, CheckCircle2, Clock, AlertCircle, Sparkles, UserX, ShieldCheck } from 'lucide-react';

interface CommunicationTimelineProps {
  communications: CommunicationItem[];
  customerId?: string;
  leadId?: string;
  invoiceId?: string;
  emptyMessage?: string;
}

export const CommunicationTimeline: React.FC<CommunicationTimelineProps> = ({
  communications,
  customerId,
  leadId,
  invoiceId,
  emptyMessage = 'No communication history recorded yet.',
}) => {
  // Filter relevant communications if targeted to a specific customer/lead/invoice
  const filtered = communications.filter(c => {
    if (customerId && c.customerId === customerId) return true;
    if (leadId && c.leadId === leadId) return true;
    if (invoiceId && c.invoiceId === invoiceId) return true;
    if (!customerId && !leadId && !invoiceId) return true;
    return false;
  });

  if (filtered.length === 0) {
    return (
      <div className="py-8 text-center border border-dashed border-outline-variant rounded-2xl bg-surface-container-lowest">
        <Clock className="w-8 h-8 text-outline mx-auto mb-2 opacity-50" />
        <p className="text-sm text-outline">{emptyMessage}</p>
      </div>
    );
  }

  const getChannelIcon = (channel: CommChannel) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'sms':
        return <MessageSquare className="w-4 h-4 text-emerald-500" />;
      case 'whatsapp':
        return <PhoneCall className="w-4 h-4 text-green-600" />;
    }
  };

  const getStatusBadge = (comm: CommunicationItem) => {
    if (comm.approvalStatus === 'pending_approval') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
          <Sparkles className="w-3 h-3" />
          Pending Approval
        </span>
      );
    }
    if (comm.approvalStatus === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20">
          <AlertCircle className="w-3 h-3" />
          Rejected
        </span>
      );
    }
    if (comm.status === 'delivered') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" />
          Delivered
        </span>
      );
    }
    if (comm.status === 'sent') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
          <CheckCircle2 className="w-3 h-3" />
          Sent
        </span>
      );
    }
    if (comm.status === 'failed') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20">
          <AlertCircle className="w-3 h-3" />
          Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-container text-outline">
        <Clock className="w-3 h-3" />
        {comm.status}
      </span>
    );
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant">
      {filtered.map((item) => (
        <div key={item.id} className="relative group">
          {/* Node Dot */}
          <div className="absolute -left-6 mt-1 w-5 h-5 rounded-full bg-surface border-2 border-outline-variant group-hover:border-primary flex items-center justify-center transition-colors shadow-xs">
            <div className="w-2 h-2 rounded-full bg-primary" />
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-outline-variant hover:border-primary/40 transition-all shadow-xs space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-surface-container-high">
                  {getChannelIcon(item.channel)}
                </div>
                <span className="font-semibold text-sm capitalize text-on-surface">
                  {item.channel} Communication
                </span>
                {item.triggerType && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-surface-container text-outline">
                    {item.triggerType}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(item)}
                <span className="text-xs text-outline font-medium">
                  {item.sentAt || item.createdAt}
                </span>
              </div>
            </div>

            {item.subject && (
              <p className="text-xs font-bold text-on-surface tracking-tight">
                {item.subject}
              </p>
            )}

            <p className="text-xs text-on-surface-variant whitespace-pre-line line-clamp-3 leading-relaxed">
              {item.message}
            </p>

            {item.errorMessage && (
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{item.errorMessage}</span>
              </div>
            )}

            {item.providerMessageId && (
              <div className="text-[10px] text-outline font-mono flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>Ref: {item.providerMessageId}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
