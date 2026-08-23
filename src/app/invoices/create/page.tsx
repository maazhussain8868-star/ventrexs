'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useApp } from '@/context/AppContext';
import { InvoiceItem } from '@/types';
import { Plus, Trash2, Eye, Send, Save, ArrowLeft } from 'lucide-react';

export default function CreateInvoicePage() {
  const router = useRouter();
  const { customers, invoices, addInvoice, showToast } = useApp();

  const nextNumber = `INV-2023-0${invoices.length + 90}`;

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState(nextNumber);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Consulting & Service Fee', quantity: 1, unitPrice: 1200, amount: 1200 }
  ]);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [notes, setNotes] = useState('Payment is due within 14 days of invoice date. Thank you for your business!');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCustomer = customers.find(c => c.id === customerId) || customers[0];

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = Math.max(0, subtotal + taxAmount - discountAmount);

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          const qty = field === 'quantity' ? Number(value) : item.quantity;
          const price = field === 'unitPrice' ? Number(value) : item.unitPrice;
          updated.amount = (isNaN(qty) ? 0 : qty) * (isNaN(price) ? 0 : price);
        }
        return updated;
      }
      return item;
    }));
  };

  const handleSave = (status: 'draft' | 'due') => {
    if (!selectedCustomer) {
      showToast({ title: 'Please select a customer', type: 'error' });
      return;
    }
    if (items.some(item => !item.description.trim() || item.amount <= 0)) {
      showToast({ title: 'Please complete all line item descriptions and prices', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const created = addInvoice({
        number: invoiceNumber,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerCompany: selectedCustomer.company,
        customerEmail: selectedCustomer.email,
        customerPhone: selectedCustomer.phone,
        issueDate,
        dueDate,
        status,
        priority: 'medium',
        items,
        subtotal,
        taxRate,
        taxAmount,
        discountAmount,
        totalAmount,
        notes,
        aiSuggestion: {
          actionType: 'gentle',
          insight: 'Invoice ready. AI automated 3-day reminder schedule initialized.',
          confidence: 90,
          recommendedSubject: `Invoice ${invoiceNumber} from Main Street Bakery`,
          recommendedBody: `Hi ${selectedCustomer.name}, please find attached invoice ${invoiceNumber} for $${totalAmount.toLocaleString()}.`
        }
      });

      setIsSubmitting(false);
      router.push(`/invoices/${created.id}`);
    }, 400);
  };

  return (
    <AppShell
      title="Create Invoice"
      showBack
      backUrl="/invoices"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
            leftIcon={<Eye className="w-4 h-4" />}
          >
            Preview
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleSave('draft')}
            disabled={isSubmitting}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Draft
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSave('due')}
            isLoading={isSubmitting}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Send Invoice
          </Button>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Customer & Dates Section */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 sm:p-6 shadow-xs">
          <h2 className="font-bold text-base sm:text-lg text-on-surface mb-4">Invoice Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Customer Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5" htmlFor="customer">
                Customer / Client
              </label>
              <div className="relative">
                <select
                  id="customer"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company} ({c.name})
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                  expand_more
                </span>
              </div>
              {selectedCustomer && (
                <p className="text-xs text-on-surface-variant mt-1">
                  Email: {selectedCustomer.email} • Phone: {selectedCustomer.phone}
                </p>
              )}
            </div>

            {/* Invoice Number */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5" htmlFor="invnum">
                Invoice Number
              </label>
              <input
                id="invnum"
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5" htmlFor="issuedate">
                Issue Date
              </label>
              <input
                id="issuedate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5" htmlFor="duedate">
                Due Date
              </label>
              <input
                id="duedate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>
        </section>

        {/* Dynamic Line Items Section */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-base sm:text-lg text-on-surface">Line Items</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={item.id} className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1">
                  <label className="block sm:hidden text-[11px] font-semibold text-on-surface-variant mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Item description / deliverables"
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="w-full sm:w-20">
                  <label className="block sm:hidden text-[11px] font-semibold text-on-surface-variant mb-1">
                    Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-sm text-on-surface text-center focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="w-full sm:w-28">
                  <label className="block sm:hidden text-[11px] font-semibold text-on-surface-variant mb-1">
                    Unit Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Price"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-sm text-on-surface text-right focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="w-full sm:w-28 text-right font-bold text-sm text-on-surface flex items-center justify-between sm:justify-end gap-2">
                  <span className="sm:hidden text-xs text-on-surface-variant">Amount:</span>
                  <span>${item.amount.toFixed(2)}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-outline-variant hover:text-error transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Calculations / Summary */}
          <div className="mt-6 pt-4 border-t border-outline-variant flex flex-col items-end gap-2 text-xs sm:text-sm">
            <div className="flex justify-between w-full max-w-xs text-on-surface-variant">
              <span>Subtotal:</span>
              <span className="font-semibold text-on-surface">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between w-full max-w-xs text-on-surface-variant">
              <span className="flex items-center gap-1">Tax Rate (%):</span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-20 bg-surface-container-lowest border border-outline-variant rounded-md p-1.5 text-right text-xs"
              />
            </div>

            <div className="flex items-center justify-between w-full max-w-xs text-on-surface-variant">
              <span>Discount ($):</span>
              <input
                type="number"
                min="0"
                step="1"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                className="w-20 bg-surface-container-lowest border border-outline-variant rounded-md p-1.5 text-right text-xs"
              />
            </div>

            <div className="flex justify-between w-full max-w-xs text-base font-bold text-on-surface border-t border-outline-variant/80 pt-2 mt-1">
              <span>Total Due:</span>
              <span className="text-primary">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Notes Section */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 sm:p-6 shadow-xs">
          <label className="block text-xs font-semibold text-on-surface mb-1.5" htmlFor="notes">
            Customer Notes & Payment Terms
          </label>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
          />
        </section>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-3">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => handleSave('draft')}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Save as Draft
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={() => handleSave('due')}
            isLoading={isSubmitting}
            leftIcon={<Send className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Create & Send Invoice
          </Button>
        </div>
      </div>

      {/* Live Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        maxWidth="lg"
        title="Live Invoice Preview"
        footer={
          <Button variant="primary" size="md" onClick={() => setIsPreviewOpen(false)}>
            Close Preview
          </Button>
        }
      >
        <div className="p-4 bg-surface rounded-xl border border-outline-variant space-y-4 text-xs sm:text-sm">
          <div className="flex justify-between items-start border-b border-outline-variant pb-4">
            <div>
              <h3 className="text-lg font-bold text-primary">Main Street Bakery</h3>
              <p className="text-on-surface-variant">742 Evergreen Terrace, Springfield, IL</p>
            </div>
            <div className="text-right">
              <h4 className="font-bold text-base text-on-surface">{invoiceNumber}</h4>
              <p className="text-on-surface-variant">Due: {dueDate}</p>
            </div>
          </div>

          <div>
            <p className="font-bold text-on-surface">Billed To:</p>
            <p className="font-semibold text-primary">{selectedCustomer?.company}</p>
            <p className="text-on-surface-variant">{selectedCustomer?.name} • {selectedCustomer?.email}</p>
          </div>

          <div className="divide-y divide-outline-variant border-y border-outline-variant py-2">
            {items.map((it, idx) => (
              <div key={idx} className="py-2 flex justify-between">
                <div>
                  <span className="font-medium text-on-surface">{it.description || 'Untitled Item'}</span>
                  <span className="text-xs text-on-surface-variant block">Qty: {it.quantity} × ${it.unitPrice.toFixed(2)}</span>
                </div>
                <span className="font-bold text-on-surface">${it.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="text-right font-bold text-base text-primary">
            Total Balance: ${totalAmount.toFixed(2)}
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
