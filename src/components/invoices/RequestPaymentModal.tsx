'use client';

import React, { useState } from 'react';
import { Invoice } from '@/types';
import { useApp } from '@/context/AppContext';
import { requestInvoicePaymentAction } from '@/app/actions/payments';
import {
  X,
  Mail,
  MessageSquare,
  Share2,
  Copy,
  Check,
  Send,
  ShieldCheck,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RequestPaymentModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
}

export function RequestPaymentModal({
  invoice,
  isOpen,
  onClose,
}: RequestPaymentModalProps) {
  const { businessId, businessProfile, profile, showToast } = useApp();
  const [channel, setChannel] = useState<'email' | 'sms' | 'whatsapp' | 'direct_link'>('email');
  const [customNote, setCustomNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const businessName = businessProfile?.name || profile.businessName;
  const amountDueFormatted = `$${invoice.remainingBalance.toLocaleString(undefined, {
    minimumFractionDigits: 2,
  })}`;

  const defaultMessage = `Hello ${invoice.customerName}, your invoice #${invoice.number} from ${businessName} is ready. Remaining balance due: ${amountDueFormatted}. You can review and securely pay online here:`;

  const handleSend = async () => {
    setIsSubmitting(true);

    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      const mockToken = `pay_demo_${Math.random().toString(36).substring(2, 10)}`;
      const mockUrl = `${window.location.origin}/pay/${mockToken}`;
      setGeneratedLink(mockUrl);
      setIsSubmitting(false);

      showToast({
        title: 'Payment Request Sent (Demo)',
        description: `Dispatched payment request via ${channel.toUpperCase()} to ${invoice.customerName}.`,
        type: 'success',
      });
      return;
    }

    if (!businessId) {
      showToast({ title: 'Error', description: 'Business ID missing', type: 'error' });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await requestInvoicePaymentAction({
        businessId,
        invoiceId: invoice.id,
        channel,
        customMessage: customNote || defaultMessage,
      });

      if (!res.success) {
        showToast({ title: 'Request Failed', description: res.error, type: 'error' });
        setIsSubmitting(false);
        return;
      }

      setGeneratedLink(res.data?.paymentUrl || `${window.location.origin}/pay/demo`);
      showToast({
        title: 'Payment Request Dispatched',
        description: `Secure link delivered via ${channel.toUpperCase()}.`,
        type: 'success',
      });
    } catch (err: any) {
      showToast({ title: 'Dispatch Error', description: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    showToast({ title: 'Copied to Clipboard', description: 'Secure payment link ready to share.', type: 'info' });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/60">
          <div>
            <h3 className="text-lg font-bold text-on-surface tracking-tight flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" /> Request Payment for #{invoice.number}
            </h3>
            <p className="text-xs text-on-surface-variant">
              Recipient: {invoice.customerName} ({invoice.customerCompany})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Balance Callout */}
        <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Remaining Amount Due
            </span>
            <span className="text-xl font-extrabold font-mono text-primary">
              {amountDueFormatted}
            </span>
          </div>
          <span className="text-xs font-semibold text-tertiary flex items-center gap-1 bg-tertiary/10 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" /> 0% Hidden Fees
          </span>
        </div>

        {/* Delivery Channel Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-on-surface">Delivery Channel</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'email', label: 'Email', icon: Mail },
              { id: 'sms', label: 'SMS Text', icon: MessageSquare },
              { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
              { id: 'direct_link', label: 'Copy Link', icon: Copy },
            ].map((c) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setChannel(c.id as any);
                    setGeneratedLink(null);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    channel === c.id
                      ? 'border-primary bg-primary-container/20 text-primary shadow-xs'
                      : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Preview */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-on-surface">Message Content</label>
          <div className="p-3 bg-surface-container-high rounded-xl border border-outline-variant/60 text-xs text-on-surface font-mono whitespace-pre-wrap leading-relaxed">
            {customNote || defaultMessage}
            <span className="text-primary block mt-1 underline">
              {generatedLink || 'https://ventrexs.com/pay/pay_tok_secure_xxxxxx'}
            </span>
          </div>
        </div>

        {/* Generated Link Display (if available) */}
        {generatedLink && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600" /> Payment Link Ready
              </span>
              <span className="text-[11px] text-on-surface-variant font-mono">Valid for 30 days</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={generatedLink}
                className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-2.5 py-1 text-xs font-mono text-on-surface"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="text-xs h-7 px-2.5 gap-1 shrink-0"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-outline-variant/60 flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            disabled={isSubmitting}
            leftIcon={channel === 'direct_link' ? <Copy className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            {isSubmitting ? 'Generating...' : channel === 'direct_link' ? 'Generate Link' : `Send via ${channel.toUpperCase()}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
