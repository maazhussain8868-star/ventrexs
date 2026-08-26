'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { refundPaymentAction } from '@/app/actions/payments';
import { PaymentRecord } from '@/lib/payments/types';
import { X, RotateCcw, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RefundPaymentModalProps {
  payment: PaymentRecord;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RefundPaymentModal({
  payment,
  isOpen,
  onClose,
  onSuccess,
}: RefundPaymentModalProps) {
  const { businessId, showToast } = useApp();
  const maxRefundable = Math.max(0, payment.amount - (payment.refundedAmount || 0));

  const [amount, setAmount] = useState(maxRefundable.toString());
  const [reason, setReason] = useState('Customer requested adjustment or cancellation.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      showToast({ title: 'Invalid Amount', description: 'Please enter a positive refund amount.', type: 'error' });
      return;
    }

    if (numAmount > maxRefundable + 0.001) {
      showToast({
        title: 'Exceeds Eligible Amount',
        description: `Max refundable amount is $${maxRefundable.toFixed(2)}.`,
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      setIsSubmitting(false);
      showToast({
        title: 'Refund Processed (Demo)',
        description: `Simulated refund of $${numAmount.toFixed(2)} recorded to ledger.`,
        type: 'success',
      });
      if (onSuccess) onSuccess();
      onClose();
      return;
    }

    if (!businessId) {
      showToast({ title: 'Error', description: 'Missing business organization ID.', type: 'error' });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await refundPaymentAction({
        businessId,
        paymentId: payment.id,
        invoiceId: payment.invoiceId,
        amount: numAmount,
        reason,
      });

      if (!res.success) {
        showToast({ title: 'Refund Failed', description: res.error, type: 'error' });
        setIsSubmitting(false);
        return;
      }

      showToast({
        title: 'Refund Recorded Successfully',
        description: `$${numAmount.toFixed(2)} refunded and invoice balance restored.`,
        type: 'success',
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      showToast({ title: 'Error', description: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/60">
          <h3 className="text-base font-bold text-on-surface tracking-tight flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-rose-600" /> Issue Refund for Payment
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleRefund} className="space-y-4">
          <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/60 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">Original Payment:</span>
              <span className="font-mono font-bold text-on-surface">${payment.amount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">Already Refunded:</span>
              <span className="font-mono text-on-surface-variant">${(payment.refundedAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-outline-variant/40">
              <span className="font-bold text-on-surface">Available to Refund:</span>
              <span className="font-mono font-bold text-emerald-600">${maxRefundable.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface">Refund Amount ($)</label>
            <input
              type="number"
              step="0.01"
              max={maxRefundable}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant rounded-xl px-3 py-2 text-sm font-mono font-bold text-on-surface focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface">Reason for Refund</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-3 text-xs text-on-surface focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isSubmitting}
              className="text-xs bg-rose-600 hover:bg-rose-700"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Refund'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
