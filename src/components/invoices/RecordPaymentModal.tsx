'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Invoice, PaymentMethod } from '@/types';
import { useApp } from '@/context/AppContext';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: Invoice | null;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  invoice
}) => {
  const { recordPayment } = useApp();
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ACH Transfer');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize amount when invoice changes
  React.useEffect(() => {
    if (invoice) {
      setAmount(invoice.remainingBalance.toString());
      setNotes('');
    }
  }, [invoice]);

  if (!invoice) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      recordPayment(invoice.id, numAmount, paymentMethod, notes);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const paymentOptions = [
    { value: 'ACH Transfer', label: 'ACH Direct Bank Transfer' },
    { value: 'Credit Card', label: 'Credit / Debit Card (Stripe)' },
    { value: 'Bank Wire', label: 'Direct Bank Wire' },
    { value: 'Check', label: 'Paper Check / Cashier Check' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary fill-icon">payments</span>
          <span className="font-bold text-lg text-on-surface">Record Customer Payment</span>
        </div>
      }
      description={`Record incoming settlement for Invoice ${invoice.number} (${invoice.customerCompany})`}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            size="md" 
            onClick={handleSubmit} 
            isLoading={isSubmitting}
            leftIcon={<span className="material-symbols-outlined text-[18px]">check</span>}
          >
            Confirm Payment
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Financial Transparency Pill */}
        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/60 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase">Original Due</p>
            <p className="text-sm font-bold text-on-surface font-mono">${invoice.originalAmountDue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase">Paid to Date</p>
            <p className="text-sm font-bold text-tertiary font-mono">${invoice.paymentsReceived.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-error uppercase">Remaining</p>
            <p className="text-sm font-bold text-error font-mono">${invoice.remainingBalance.toLocaleString()}</p>
          </div>
        </div>

        {/* Amount Input */}
        <Input
          label="Payment Amount ($)"
          type="number"
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          helperText="Payments directly reduce original invoice balance with 0% penalty fees."
        />

        {/* Payment Method */}
        <Select
          label="Payment Channel / Method"
          options={paymentOptions}
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
        />

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5">
            Internal Note / Reference (Optional)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Check #5021 deposited at Chase Bank, or ACH trace confirmation number."
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
          />
        </div>
      </form>
    </Modal>
  );
};
