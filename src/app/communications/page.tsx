'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { AppShell } from '@/components/layout/AppShell';
import { 
  Radio, 
  Mail, 
  MessageSquare, 
  PhoneCall, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Filter, 
  Search, 
  Plus, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  UserX,
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { CommChannel, CommStatus } from '@/types';

export default function CommunicationsPage() {
  const {
    user,
    isDemoMode,
    communications,
    communicationTemplates,
    communicationConsents,
    communicationStats,
    sendCommunication,
    leads,
    customers,
    businessProfile,
  } = useApp();

  const [channelFilter, setChannelFilter] = useState<'all' | CommChannel>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | CommStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedComm, setSelectedComm] = useState<any>(null);

  // Compose Modal Form State
  const [selectedChannel, setSelectedChannel] = useState<CommChannel>('sms');
  const [selectedRecipientType, setSelectedRecipientType] = useState<'lead' | 'customer' | 'manual'>('lead');
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualContact, setManualContact] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState<'gentle' | 'professional' | 'firm' | 'urgent'>('professional');
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const pendingApprovalsCount = communications.filter(c => c.approvalStatus === 'pending_approval').length;

  // Filtered List
  const filteredComms = communications.filter(c => {
    if (channelFilter !== 'all' && c.channel !== channelFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = (c.customerName || c.leadName || '').toLowerCase().includes(q);
      const msgMatch = (c.message || '').toLowerCase().includes(q);
      const subMatch = (c.subject || '').toLowerCase().includes(q);
      if (!nameMatch && !msgMatch && !subMatch) return false;
    }
    return true;
  });

  const handleTemplateSelect = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    if (!tmplId) return;
    const tmpl = communicationTemplates.find(t => t.id === tmplId);
    if (tmpl) {
      setSelectedChannel(tmpl.channel);
      if (tmpl.subjectTemplate) setSubject(tmpl.subjectTemplate);
      setMessage(tmpl.bodyTemplate);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    let recipientName = manualName;
    let recipientEmail: string | undefined;
    let recipientPhone: string | undefined;
    let customerId: string | undefined;
    let leadId: string | undefined;

    if (selectedRecipientType === 'lead') {
      const l = leads.find(item => item.id === selectedRecipientId);
      if (l) {
        leadId = l.id;
        recipientName = l.name;
        recipientEmail = l.email;
        recipientPhone = l.phone;
      }
    } else if (selectedRecipientType === 'customer') {
      const c = customers.find(item => item.id === selectedRecipientId);
      if (c) {
        customerId = c.id;
        recipientName = c.name;
        recipientEmail = c.email;
        recipientPhone = c.phone;
      }
    } else {
      if (selectedChannel === 'email') recipientEmail = manualContact;
      else recipientPhone = manualContact;
    }

    await sendCommunication({
      channel: selectedChannel,
      recipientName: recipientName || 'Customer',
      recipientEmail,
      recipientPhone,
      customerId,
      leadId,
      templateId: selectedTemplateId || undefined,
      subject: selectedChannel === 'email' ? subject : undefined,
      message,
      tone,
      requiresApproval,
      variables: {
        customer_name: recipientName,
        business_name: businessProfile?.name || 'Ventrexs Service',
        business_phone: businessProfile?.phone || '+1 (555) 019-2831',
        service_name: 'Scheduled Service',
      },
    });

    setIsSending(false);
    setIsComposeOpen(false);
    setMessage('');
    setSubject('');
    setSelectedTemplateId('');
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Radio className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-black tracking-tight text-on-surface">
                Communication Center
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Multi-Channel Active
              </span>
            </div>
            <p className="text-sm text-outline">
              Automated and operator-driven messaging across Email, SMS, and WhatsApp with safety compliance.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              href="/communications/approvals"
              className="relative px-4 py-2.5 rounded-xl border border-outline-variant bg-surface hover:bg-surface-container-high text-sm font-semibold text-on-surface flex items-center gap-2 transition-all shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Approvals Queue</span>
              {pendingApprovalsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                  {pendingApprovalsCount}
                </span>
              )}
            </Link>

            <Link
              href="/communications/templates"
              className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface hover:bg-surface-container-high text-sm font-semibold text-on-surface flex items-center gap-2 transition-all shadow-xs"
            >
              <FileText className="w-4 h-4 text-primary" />
              <span>Templates</span>
            </Link>

            <button
              onClick={() => setIsComposeOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-sm font-bold flex items-center gap-2 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Compose Message</span>
            </button>
          </div>
        </div>

        {/* Demo Mode Notice */}
        {!user && isDemoMode && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                <strong>Simulated Sandbox Mode Active:</strong> All outbound communications simulate delivery states deterministically without sending real carrier SMS or emails.
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-500/20 px-2 py-0.5 rounded">
              Zero External Cost
            </span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-surface border border-outline-variant shadow-xs">
            <p className="text-xs font-medium text-outline">Total Dispatches</p>
            <p className="text-2xl font-black text-on-surface mt-1">{communicationStats.totalMessages}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {communicationStats.delivered} Delivered
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-outline-variant shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-outline">Email Traffic</p>
              <Mail className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-black text-on-surface mt-1">{communicationStats.emailCount}</p>
            <p className="text-[11px] text-outline mt-1">Transactional & alerts</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-outline-variant shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-outline">SMS Activity</p>
              <MessageSquare className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-on-surface mt-1">{communicationStats.smsCount}</p>
            <p className="text-[11px] text-outline mt-1">100% TCPA Compliant</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-outline-variant shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-outline">WhatsApp</p>
              <PhoneCall className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-black text-on-surface mt-1">{communicationStats.whatsappCount}</p>
            <p className="text-[11px] text-outline mt-1">Meta Business Cloud</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-outline-variant shadow-xs">
            <p className="text-xs font-medium text-outline">Customer Replies</p>
            <p className="text-2xl font-black text-primary mt-1">{communicationStats.replies}</p>
            <p className="text-[11px] text-primary font-medium mt-1">AI Receptionist Routed</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-outline-variant shadow-xs">
            <p className="text-xs font-medium text-outline">Opt-Outs (STOP)</p>
            <p className="text-2xl font-black text-rose-500 mt-1">{communicationStats.optOuts}</p>
            <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
              <UserX className="w-3 h-3" />
              Enforced Globally
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-surface border border-outline-variant shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <span className="text-xs font-semibold text-outline uppercase tracking-wider shrink-0 mr-1">
              Channel:
            </span>
            {(['all', 'email', 'sms', 'whatsapp'] as const).map(ch => (
              <button
                key={ch}
                onClick={() => setChannelFilter(ch)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all shrink-0 ${
                  channelFilter === ch
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-hidden focus:border-primary"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-hidden focus:border-primary"
            >
              <option value="all">All Statuses</option>
              <option value="delivered">Delivered</option>
              <option value="sent">Sent</option>
              <option value="draft">Pending Approval</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Message Log & Feed */}
        <div className="bg-surface rounded-2xl border border-outline-variant shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
            <h2 className="text-base font-bold text-on-surface">Outbound & Inbound Activity</h2>
            <span className="text-xs text-outline">{filteredComms.length} messages listed</span>
          </div>

          <div className="divide-y divide-outline-variant">
            {filteredComms.length === 0 ? (
              <div className="py-12 text-center text-outline text-sm">
                No communications match your selected criteria.
              </div>
            ) : (
              filteredComms.map(comm => (
                <div
                  key={comm.id}
                  onClick={() => setSelectedComm(comm)}
                  className="p-4 hover:bg-surface-container-lowest transition-colors flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2.5 rounded-xl bg-surface-container-high shrink-0">
                      {comm.channel === 'email' && <Mail className="w-4 h-4 text-blue-500" />}
                      {comm.channel === 'sms' && <MessageSquare className="w-4 h-4 text-emerald-500" />}
                      {comm.channel === 'whatsapp' && <PhoneCall className="w-4 h-4 text-green-600" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-bold text-sm text-on-surface truncate">
                          {comm.customerName || comm.leadName || 'Customer'}
                        </span>
                        <span className="text-xs text-outline font-mono">
                          {comm.customerEmail || comm.customerPhone}
                        </span>
                        {comm.requiresApproval && comm.approvalStatus === 'pending_approval' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            Review Required
                          </span>
                        )}
                      </div>

                      {comm.subject && (
                        <p className="text-xs font-semibold text-on-surface truncate mb-0.5">
                          {comm.subject}
                        </p>
                      )}

                      <p className="text-xs text-on-surface-variant line-clamp-1">
                        {comm.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        comm.status === 'delivered'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : comm.status === 'failed'
                          ? 'bg-rose-500/10 text-rose-600'
                          : 'bg-surface-container-high text-outline'
                      }`}>
                        {comm.status}
                      </span>
                      <p className="text-[11px] text-outline mt-0.5">
                        {comm.sentAt || comm.createdAt}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-outline" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Compose Message Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl border border-outline-variant shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-on-surface">Compose Outbound Communication</h3>
              </div>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="p-1 rounded-lg text-outline hover:bg-surface-container-high"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Channel Selector */}
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                  Delivery Channel
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4 text-blue-500" /> },
                    { id: 'sms', label: 'SMS Text', icon: <MessageSquare className="w-4 h-4 text-emerald-500" /> },
                    { id: 'whatsapp', label: 'WhatsApp', icon: <PhoneCall className="w-4 h-4 text-green-600" /> },
                  ].map(ch => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setSelectedChannel(ch.id as CommChannel)}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        selectedChannel === ch.id
                          ? 'border-primary bg-primary/5 text-primary shadow-xs'
                          : 'border-outline-variant bg-surface text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      {ch.icon}
                      <span>{ch.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Picker */}
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Template (Optional)
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={e => handleTemplateSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-hidden focus:border-primary"
                >
                  <option value="">-- Start with Blank Message --</option>
                  {communicationTemplates
                    .filter(t => t.channel === selectedChannel)
                    .map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.category})
                      </option>
                    ))}
                </select>
              </div>

              {/* Recipient Source */}
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Recipient
                </label>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-1.5 text-xs text-on-surface cursor-pointer">
                    <input
                      type="radio"
                      name="recType"
                      checked={selectedRecipientType === 'lead'}
                      onChange={() => setSelectedRecipientType('lead')}
                    />
                    <span>From CRM Lead</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-on-surface cursor-pointer">
                    <input
                      type="radio"
                      name="recType"
                      checked={selectedRecipientType === 'customer'}
                      onChange={() => setSelectedRecipientType('customer')}
                    />
                    <span>From Contact/Customer</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-on-surface cursor-pointer">
                    <input
                      type="radio"
                      name="recType"
                      checked={selectedRecipientType === 'manual'}
                      onChange={() => setSelectedRecipientType('manual')}
                    />
                    <span>Manual Entry</span>
                  </label>
                </div>

                {selectedRecipientType === 'lead' && (
                  <select
                    value={selectedRecipientId}
                    onChange={e => setSelectedRecipientId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-hidden focus:border-primary"
                    required
                  >
                    <option value="">Select a lead...</option>
                    {leads.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.name} — {selectedChannel === 'email' ? l.email : l.phone} ({l.serviceRequested})
                      </option>
                    ))}
                  </select>
                )}

                {selectedRecipientType === 'customer' && (
                  <select
                    value={selectedRecipientId}
                    onChange={e => setSelectedRecipientId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-hidden focus:border-primary"
                    required
                  >
                    <option value="">Select a contact...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.company} ({selectedChannel === 'email' ? c.email : c.phone})
                      </option>
                    ))}
                  </select>
                )}

                {selectedRecipientType === 'manual' && (
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Recipient Full Name"
                      value={manualName}
                      onChange={e => setManualName(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-hidden focus:border-primary"
                      required
                    />
                    <input
                      type={selectedChannel === 'email' ? 'email' : 'tel'}
                      placeholder={selectedChannel === 'email' ? 'client@example.com' : '+1 (555) 000-0000'}
                      value={manualContact}
                      onChange={e => setManualContact(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-hidden focus:border-primary"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Email Subject */}
              {selectedChannel === 'email' && (
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    placeholder="Enter email subject..."
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-hidden focus:border-primary"
                    required
                  />
                </div>
              )}

              {/* Message Body */}
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Message Content
                </label>
                <textarea
                  rows={5}
                  placeholder="Type your message or use template variables like {{customer_name}}..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-hidden focus:border-primary"
                  required
                />
              </div>

              {/* Safety & Approval Option */}
              <div className="p-3.5 rounded-2xl bg-surface-container-high border border-outline-variant space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiresApproval}
                    onChange={e => setRequiresApproval(e.target.checked)}
                    className="rounded border-outline-variant text-primary focus:ring-primary"
                  />
                  <span className="text-xs font-bold text-on-surface flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Route to Human Approval Queue before dispatch
                  </span>
                </label>
                <p className="text-[11px] text-outline pl-6">
                  Recommended for AI drafts or non-standard communications requiring supervisor review.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 rounded-xl border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container-high"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold flex items-center gap-2 transition-all shadow-xs disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? 'Dispatching...' : requiresApproval ? 'Save for Approval' : 'Send Immediately'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedComm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl border border-outline-variant shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-on-surface">Message Details</h3>
              </div>
              <button
                onClick={() => setSelectedComm(null)}
                className="p-1 rounded-lg text-outline hover:bg-surface-container-high"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                <div>
                  <p className="text-xs text-outline">Recipient</p>
                  <p className="text-sm font-bold text-on-surface">
                    {selectedComm.customerName || selectedComm.leadName || 'Customer'}
                  </p>
                  <p className="text-xs text-outline font-mono">
                    {selectedComm.customerEmail || selectedComm.customerPhone}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-outline">Channel</p>
                  <p className="text-xs font-bold uppercase text-primary">{selectedComm.channel}</p>
                </div>
              </div>

              {selectedComm.subject && (
                <div>
                  <p className="text-xs text-outline mb-0.5">Subject</p>
                  <p className="text-xs font-bold text-on-surface">{selectedComm.subject}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-outline mb-1">Message Body</p>
                <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant text-xs text-on-surface whitespace-pre-line leading-relaxed">
                  {selectedComm.message}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                <div>
                  <span className="text-outline block">Status:</span>
                  <span className="font-bold text-emerald-600 capitalize">{selectedComm.status}</span>
                </div>
                <div>
                  <span className="text-outline block">Timestamp:</span>
                  <span className="font-medium text-on-surface">{selectedComm.sentAt || selectedComm.createdAt}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-surface-container-lowest border-t border-outline-variant flex justify-end">
              <button
                onClick={() => setSelectedComm(null)}
                className="px-4 py-1.5 rounded-xl bg-surface border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container-high"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
