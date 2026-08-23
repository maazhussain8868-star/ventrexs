'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { InvoiceItem, InvoiceStatus } from '@/types';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { invoices, customers, updateInvoice, showToast } = useApp();

  const invoiceId = params.id as string;
  const invoice = invoices.find(i => i.id === invoiceId || i.number === invoiceId);

  const [customerId, setCustomerId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<InvoiceStatus>('due');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (invoice) {
      setCustomerId(invoice.customerId);
      setInvoiceNumber(invoice.number);
      setIssueDate(invoice.issueDate);
      setDueDate(invoice.dueDate);
      setStatus(invoice.status);
      setItems(invoice.items);
      setTaxRate(invoice.taxRate);
      setDiscountAmount(invoice.discountAmount);
      setNotes(invoice.notes || '');
    }
  }, [invoice]);

  if (!invoice) {
    return (
      <AppShell title="Edit Invoice" showBack backUrl="/invoices">
        <div className="p-8 text-center bg-surface rounded-2xl border border-outline-variant">
          <p className="text-sm text-on-surface-variant">Invoice not found.</p>
        </div>
      </AppShell>
    );
  }

  const selectedCustomer = customers.find(c => c.id === customerId) || customers[0];

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = Math.max(0, subtotal + taxAmount - discountAmount);

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, amount: 0 }
    ]);
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

  const handleSave = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      updateInvoice({
        ...invoice,
        number: invoiceNumber,
        customerId: selectedCustomer?.id || invoice.customerId,
        customerName: selectedCustomer?.name || invoice.customerName,
        customerCompany: selectedCustomer?.company || invoice.customerCompany,
        customerEmail: selectedCustomer?.email || invoice.customerEmail,
        customerPhone: selectedCustomer?.phone || invoice.customerPhone,
        issueDate,
        dueDate,
        status,
        items,
        subtotal,
        taxRate,
        taxAmount,
        discountAmount,
        totalAmount,
        notes,
      });

      setIsSubmitting(false);
      router.push(`/invoices/${invoice.id}`);
    }, 400);
  };

  return (
    <AppShell
      title={`Edit ${invoice.number}`}
      showBack
      backUrl={`/invoices/${invoice.id}`}
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          isLoading={isSubmitting}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save Changes
        </Button>
      }
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 sm:p-6 shadow-xs">
          <h2 className="font-bold text-base sm:text-lg text-on-surface mb-4">Edit Invoice Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Customer
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm text-on-surface focus:outline-none focus:border-primary"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Invoice Number
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm text-on-surface focus:outline-none focus:border-primary uppercase font-bold"
              >
                <option value="due">DUE</option>
                <option value="overdue">OVERDUE</option>
                <option value="paid">PAID</option>
                <option value="draft">DRAFT</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Issue Date
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </section>

        {/* Items */}
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
            {items.map((item) => (
              <div key={item.id} className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                  className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-sm"
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                  className="w-20 bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-sm text-center"
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Price"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                  className="w-28 bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-sm text-right"
                />
                <div className="w-28 text-right font-bold text-sm flex items-center justify-end gap-2">
                  <span>${item.amount.toFixed(2)}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-outline-variant hover:text-error"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-outline-variant flex flex-col items-end gap-2 text-sm">
            <div className="flex justify-between w-full max-w-xs text-on-surface-variant">
              <span>Subtotal:</span>
              <span className="font-semibold text-on-surface">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-full max-w-xs text-base font-bold text-on-surface border-t pt-2">
              <span>Total Due:</span>
              <span className="text-primary">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Notes */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 sm:p-6 shadow-xs">
          <label className="block text-xs font-semibold text-on-surface mb-1.5">
            Customer Notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm"
          />
        </section>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="lg" onClick={() => router.push(`/invoices/${invoice.id}`)}>
            Cancel
          </Button>
          <Button variant="primary" size="lg" onClick={handleSave} isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
