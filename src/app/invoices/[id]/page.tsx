'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RecordPaymentModal } from '@/components/invoices/RecordPaymentModal';
import { RequestPaymentModal } from '@/components/invoices/RequestPaymentModal';
import { useApp } from '@/context/AppContext';
import { 
  ArrowLeft, 
  Send, 
  CheckCircle, 
  Edit, 
  Trash2, 
  Download, 
  Calendar, 
  Building, 
  Mail, 
  Phone, 
  Clock, 
  Sparkles,
  ShieldCheck,
  Share2,
  CreditCard
} from 'lucide-react';

export default function InvoiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { invoices, deleteInvoice, showToast } = useApp();

  const invoiceId = params.id as string;
  const invoice = invoices.find(i => i.id === invoiceId || i.number === invoiceId) || invoices[0];

  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isRequestPaymentOpen, setIsRequestPaymentOpen] = useState(false);

  if (!invoice) {
    return (
      <AppShell title="Invoice Details" showBack backUrl="/invoices">
        <div className="p-8 text-center bg-surface rounded-2xl border border-outline-variant">
          <p className="text-sm text-on-surface-variant">Invoice not found.</p>
          <Link href="/invoices" className="text-xs font-bold text-primary underline mt-2 block">
            Return to Invoices
          </Link>
        </div>
      </AppShell>
    );
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete invoice ${invoice.number}?`)) {
      deleteInvoice(invoice.id);
      router.push('/invoices');
    }
  };

  return (
    <AppShell
      title={invoice.number}
      showBack
      backUrl="/invoices"
      actions={
        <div className="flex items-center gap-2">
          <Link
            href={`/invoices/${invoice.id}/edit`}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </Link>
          <button
            onClick={() => showToast({ title: 'PDF Exported', description: `Downloaded ${invoice.number}.pdf (Legitimate Balance Statement)`, type: 'info' })}
            className="p-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Financial Transparency Summary Header */}
        <section className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">
                Outstanding Balance Owed
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-on-surface tracking-tight font-mono">
                ${invoice.remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge status={invoice.status} />
              {invoice.status === 'overdue' && (
                <span className="text-xs font-bold text-error bg-error/10 px-3 py-1 rounded-full border border-error/20">
                  {invoice.daysOverdue} Days Overdue
                </span>
              )}
              {invoice.priority === 'high' && <Badge priority="high" />}
            </div>
          </div>

          {/* Core Financial Figures Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-surface-container-low rounded-xl border border-outline-variant/60 mb-6">
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase">Original Amount Due</p>
              <p className="text-base font-bold text-on-surface mt-0.5 font-mono">
                ${invoice.originalAmountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase">Payments Received</p>
              <p className="text-base font-bold text-tertiary mt-0.5 font-mono">
                ${invoice.paymentsReceived.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-error uppercase">Remaining Balance</p>
              <p className="text-base font-bold text-error mt-0.5 font-mono">
                ${invoice.remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase">Days Overdue</p>
              <p className={`text-base font-bold mt-0.5 font-mono ${invoice.daysOverdue > 0 ? 'text-error' : 'text-tertiary'}`}>
                {invoice.daysOverdue > 0 ? `${invoice.daysOverdue} Days` : '0 (On Schedule)'}
              </p>
            </div>
          </div>

          {/* Customer & Key Dates */}
          <div className="border-t border-outline-variant pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Customer Information
              </p>
              <p className="text-base font-bold text-on-surface mt-1">{invoice.customerCompany}</p>
              <p className="text-xs text-on-surface-variant">{invoice.customerName} • {invoice.customerEmail}</p>
              {invoice.customerPhone && (
                <p className="text-xs text-on-surface-variant mt-0.5">{invoice.customerPhone}</p>
              )}
            </div>

            <div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Terms & Deadlines
              </p>
              <div className="mt-1 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <Calendar className="w-3.5 h-3.5 text-outline" />
                  <span>Issue Date: <strong className="text-on-surface">{invoice.issueDate}</strong></span>
                </div>
                <div className={`flex items-center gap-2 ${invoice.status === 'overdue' ? 'text-error font-semibold' : 'text-on-surface-variant'}`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Payment Due Date: <strong className={invoice.status === 'overdue' ? 'text-error' : 'text-on-surface'}>{invoice.dueDate}</strong></span>
                </div>
                {invoice.paidDate && (
                  <div className="flex items-center gap-2 text-tertiary font-semibold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Settled Date: <strong>{invoice.paidDate}</strong></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* AI Insight Card (Ethical & Truthful Guidance) */}
        {invoice.aiSuggestion && (
          <section className="bg-surface-container-low border border-primary/25 rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-xs">
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-primary">Ventrexs AI Collection Recommendation</h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                {invoice.aiSuggestion.confidence}% Match
              </span>
            </div>

            <p className="text-xs sm:text-sm text-on-surface relative z-10 leading-relaxed mb-4">
              {invoice.aiSuggestion.insight}
            </p>

            <div className="flex flex-wrap gap-2.5 relative z-10">
              <Link
                href={`/follow-up?invoiceId=${invoice.id}`}
                className="inline-flex items-center gap-2 bg-primary text-on-primary font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl hover:bg-on-primary-fixed-variant transition-colors shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>Open Truthful Follow-up Generator</span>
              </Link>
            </div>
          </section>
        )}

        {/* Line Items Table */}
        <section className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-5 sm:p-6 shadow-xs">
          <h3 className="font-bold text-sm sm:text-base text-on-surface mb-4">Original Billed Deliverables</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  <th className="py-2.5 px-4">Item Description</th>
                  <th className="py-2.5 px-4 text-center">Qty</th>
                  <th className="py-2.5 px-4 text-right">Unit Price</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 px-4 font-medium text-on-surface">{item.description}</td>
                    <td className="py-3 px-4 text-center text-on-surface-variant">{item.quantity}</td>
                    <td className="py-3 px-4 text-right text-on-surface-variant font-mono">${item.unitPrice.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-bold text-on-surface font-mono">${item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t border-outline-variant flex flex-col items-end gap-1.5 text-xs sm:text-sm">
            <div className="flex justify-between w-full max-w-xs text-on-surface-variant">
              <span>Subtotal:</span>
              <span className="font-semibold text-on-surface font-mono">${invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.taxAmount > 0 && (
              <div className="flex justify-between w-full max-w-xs text-on-surface-variant">
                <span>Tax ({invoice.taxRate}%):</span>
                <span className="font-semibold text-on-surface font-mono">${invoice.taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between w-full max-w-xs text-sm font-bold text-on-surface border-t border-outline-variant/60 pt-2 mt-1">
              <span>Original Total Due:</span>
              <span className="font-mono">${invoice.originalAmountDue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-full max-w-xs text-sm font-semibold text-tertiary">
              <span>Payments Received:</span>
              <span className="font-mono">-${invoice.paymentsReceived.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-full max-w-xs text-base font-bold text-on-surface border-t border-outline-variant/80 pt-2 mt-1">
              <span>Remaining Balance:</span>
              <span className="text-primary font-mono">${invoice.remainingBalance.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-5 sm:p-6 shadow-xs">
          <h3 className="font-bold text-sm sm:text-base text-on-surface mb-4">Invoice Activity & Delivery Timeline</h3>
          <div className="relative pl-6 border-l border-outline-variant ml-3 space-y-6">
            {invoice.timeline.map((evt) => (
              <div key={evt.id} className="relative">
                <div className="absolute -left-[31px] top-0.5 bg-surface border border-outline-variant rounded-full p-1 shadow-xs">
                  <span className={`material-symbols-outlined text-[15px] ${
                    evt.type === 'payment_received' ? 'text-tertiary' :
                    evt.type === 'reminder_sent' ? 'text-primary' : 'text-on-surface-variant'
                  } fill-icon`}>
                    {evt.type === 'created' ? 'add_circle' :
                     evt.type === 'sent' ? 'send' :
                     evt.type === 'viewed' ? 'visibility' :
                     evt.type === 'payment_received' ? 'check_circle' : 'notifications'}
                  </span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-on-surface">{evt.title}</p>
                  {evt.description && (
                    <p className="text-xs text-on-surface-variant mt-0.5">{evt.description}</p>
                  )}
                  <span className="text-[10px] text-outline mt-1 block">{evt.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Fixed Bottom Action Bar */}
        <div className="sticky bottom-16 md:bottom-4 z-30 bg-surface/95 backdrop-blur-md border border-outline-variant p-4 rounded-2xl shadow-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
              leftIcon={<Edit className="w-4 h-4" />}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleDelete}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {invoice.remainingBalance > 0 && (
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsRequestPaymentOpen(true)}
                leftIcon={<Share2 className="w-4 h-4 text-primary" />}
              >
                Request Payment
              </Button>
            )}
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsRecordPaymentOpen(true)}
              leftIcon={<span className="material-symbols-outlined text-[18px]">payments</span>}
            >
              {invoice.status === 'paid' ? 'Record Additional' : 'Record Payment'}
            </Button>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        invoice={invoice}
      />

      {/* Request Payment Modal */}
      <RequestPaymentModal
        isOpen={isRequestPaymentOpen}
        onClose={() => setIsRequestPaymentOpen(false)}
        invoice={invoice}
      />
    </AppShell>
  );
}

