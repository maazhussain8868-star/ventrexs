'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { Sparkles, Send, Copy, Mail, MessageSquare, Check, RefreshCw, ShieldCheck } from 'lucide-react';

type ToneType = 'gentle' | 'professional' | 'firm' | 'urgent';
type ChannelType = 'email' | 'sms' | 'whatsapp';

function FollowUpGeneratorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { invoices, generateFollowUpContent, sendInvoiceReminder, showToast, businessId } = useApp();

  const preselectedInvoiceId = searchParams.get('invoiceId') || invoices[0]?.id;
  const rawTone = searchParams.get('tone');
  const preselectedTone: ToneType =
    rawTone === 'gentle' || rawTone === 'professional' || rawTone === 'firm' || rawTone === 'urgent'
      ? rawTone
      : 'firm';

  const [selectedInvoiceId, setSelectedInvoiceId] = useState(preselectedInvoiceId);
  const [tone, setTone] = useState<ToneType>(preselectedTone);
  const [channel, setChannel] = useState<ChannelType>('email');

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeInvoice = invoices.find(i => i.id === selectedInvoiceId) || invoices[0];

  // Refresh generated content when invoice, tone, or channel changes
  useEffect(() => {
    if (activeInvoice) {
      const content = generateFollowUpContent(activeInvoice.id, tone, channel);
      setSubject(content.subject);
      setBody(content.body);
    }
  }, [selectedInvoiceId, tone, channel, activeInvoice, generateFollowUpContent]);

  const handleSend = async () => {
    if (!activeInvoice) return;
    setIsSending(true);

    sendInvoiceReminder(activeInvoice.id, subject, body);

    try {
      const invoiceRecord = activeInvoice as {
        id: string;
        business_id?: string;
        customerId?: string;
        customer_id?: string;
      };
      const activeBizId = businessId || invoiceRecord.business_id;
      if (!activeBizId) {
        throw new Error('No active authenticated business session found.');
      }

      const { createCommunicationDraftAction } = await import('@/app/actions');
      await createCommunicationDraftAction({
        business_id: activeBizId,
        invoice_id: activeInvoice.id,
        customer_id: invoiceRecord.customerId || invoiceRecord.customer_id || '',
        channel: channel,
        subject: subject,
        message: body,
        tone: tone,
        status: 'draft',
      });
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.warn('Communication draft persistence notice:', errMsg);
    }

    setIsSending(false);
    showToast({
      title: `Draft Saved (${channel.toUpperCase()})`,
      description: `Follow-up draft ready for ${activeInvoice.customerCompany}`,
      type: 'ai'
    });
    router.push(`/invoices/${activeInvoice.id}`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${subject ? `Subject: ${subject}\n\n` : ''}${body}`);
    setCopied(true);
    showToast({ title: 'Copied to clipboard!', type: 'info' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            AI Truthful Follow-Up Engine
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-tertiary-container/15 text-tertiary">
            <ShieldCheck className="w-3.5 h-3.5" />
            Halal-First Certified
          </span>
        </div>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Generate multi-channel payment reminders respecting Islamic finance principles — zero late fee pressure, accurate balances only.
        </p>
      </div>

      {/* Control Strip */}
      <section className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        {/* Step 1: Select Invoice */}
        <div>
          <label className="block text-xs font-semibold text-on-surface mb-1.5">
            Select Invoice / Debtor
          </label>
          <select
            value={selectedInvoiceId}
            onChange={(e) => setSelectedInvoiceId(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm text-on-surface font-medium focus:outline-none focus:border-primary"
          >
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.number} — {inv.customerCompany} (Remaining: ${inv.remainingBalance.toLocaleString()}) • Status: {inv.status.toUpperCase()}{inv.daysOverdue > 0 ? ` (${inv.daysOverdue}d overdue)` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Channel Selection */}
        <div>
          <label className="block text-xs font-semibold text-on-surface mb-1.5">
            Delivery Channel
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'email' as const, label: 'Email', icon: <Mail className="w-4 h-4" /> },
              { id: 'sms' as const, label: 'SMS Text', icon: <MessageSquare className="w-4 h-4" /> },
              { id: 'whatsapp' as const, label: 'WhatsApp', icon: <span className="material-symbols-outlined text-[16px]">chat</span> },
            ].map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setChannel(ch.id)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                  channel === ch.id
                    ? 'bg-primary text-on-primary border-primary shadow-xs'
                    : 'bg-surface border-outline-variant text-on-surface hover:bg-surface-container-low'
                }`}
              >
                {ch.icon}
                <span>{ch.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Tone Selection */}
        <div>
          <label className="block text-xs font-semibold text-on-surface mb-1.5">
            Communication Tone (Ethical & Truthful)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'gentle' as const, label: 'Gentle Check-in', desc: 'Courteous courtesy note' },
              { id: 'professional' as const, label: 'Professional Statement', desc: 'Standard business terms' },
              { id: 'firm' as const, label: 'Firm Follow-up', desc: 'Highlight aging days' },
              { id: 'urgent' as const, label: 'Account Notice', desc: 'Clear statement of past due' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTone(t.id)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  tone === t.id
                    ? 'bg-secondary-container text-on-secondary-container border-primary shadow-xs font-bold'
                    : 'bg-surface border-outline-variant text-on-surface hover:bg-surface-container-low'
                }`}
              >
                <span className="block text-xs font-bold">{t.label}</span>
                <span className="text-[10px] text-on-surface-variant font-normal">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Editor & Live Preview Box */}
      <section className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-sm sm:text-base text-on-surface">AI Generated Draft</h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        {channel === 'email' && (
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">Subject Line</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm text-on-surface font-semibold focus:outline-none focus:border-primary"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-on-surface mb-1">
            Message Body {channel !== 'email' && `(${body.length} chars)`}
          </label>
          <textarea
            rows={channel === 'email' ? 11 : 5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 text-xs sm:text-sm text-on-surface leading-relaxed focus:outline-none focus:border-primary font-mono whitespace-pre-wrap"
          />
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={handleSend}
            isLoading={isSending}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Dispatch Truthful Reminder ({channel.toUpperCase()})
          </Button>
        </div>
      </section>
    </div>
  );
}

export default function FollowUpPage() {
  return (
    <AppShell title="Follow-up Generator" showBack backUrl="/dashboard">
      <Suspense fallback={<div className="p-8 text-center">Loading AI Generator...</div>}>
        <FollowUpGeneratorContent />
      </Suspense>
    </AppShell>
  );
}
