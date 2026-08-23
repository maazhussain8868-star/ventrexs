'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Plus, 
  Sparkles, 
  Calendar, 
  CheckCircle, 
  Clock, 
  ChevronRight, 
  CreditCard,
  MessageSquarePlus
} from 'lucide-react';

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { customers, invoices, showToast } = useApp();

  const customerId = params.id as string;
  const customer = customers.find(c => c.id === customerId) || customers[0];

  const customerInvoices = invoices.filter(
    i => i.customerId === customer?.id || i.customerCompany.toLowerCase() === customer?.company.toLowerCase()
  );

  const [notes, setNotes] = useState(customer?.notes || '');
  const [newNote, setNewNote] = useState('');

  if (!customer) {
    return (
      <AppShell title="Customer Profile" showBack backUrl="/customers">
        <div className="p-8 text-center bg-surface rounded-2xl border border-outline-variant">
          <p className="text-sm text-on-surface-variant">Customer not found.</p>
        </div>
      </AppShell>
    );
  }

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes(prev => `[${new Date().toLocaleDateString()}] ${newNote}\n` + prev);
    setNewNote('');
    showToast({ title: 'Note Logged', type: 'success' });
  };

  return (
    <AppShell
      title={customer.company}
      showBack
      backUrl="/customers"
      actions={
        <div className="flex items-center gap-2">
          <Link
            href={`/follow-up?customerName=${encodeURIComponent(customer.company)}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary font-semibold text-xs shadow-xs hover:bg-on-primary-fixed-variant transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Follow-up
          </Link>
          <Link
            href="/invoices/create"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Invoice
          </Link>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Customer Header Card */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-surface-container-high text-primary flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
                {customer.company.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-on-surface">{customer.company}</h1>
                  <Badge risk={customer.riskLevel} />
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
                  Primary Contact: <strong className="text-on-surface">{customer.name}</strong>
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-outline" /> {customer.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-outline" /> {customer.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-outline" /> {customer.address}
                  </span>
                </div>
              </div>
            </div>

            <div className="sm:text-right bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/60">
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Credit Rating
              </p>
              <p className="text-xl font-bold text-primary">{customer.creditScore} / 850</p>
              <p className="text-[11px] text-tertiary font-semibold mt-0.5">Commercial Grade A</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-outline-variant">
            <div className="p-3 bg-surface-container-low rounded-xl">
              <p className="text-[11px] text-on-surface-variant font-medium">Total Outstanding</p>
              <p className={`text-lg font-bold mt-0.5 ${customer.totalOutstanding > 0 ? 'text-error' : 'text-on-surface'}`}>
                ${customer.totalOutstanding.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-surface-container-low rounded-xl">
              <p className="text-[11px] text-on-surface-variant font-medium">Total Paid</p>
              <p className="text-lg font-bold text-tertiary mt-0.5">
                ${customer.totalPaid.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-surface-container-low rounded-xl">
              <p className="text-[11px] text-on-surface-variant font-medium">Active Invoices</p>
              <p className="text-lg font-bold text-on-surface mt-0.5">
                {customerInvoices.length} Invoices
              </p>
            </div>
            <div className="p-3 bg-surface-container-low rounded-xl">
              <p className="text-[11px] text-on-surface-variant font-medium">Avg Payment Delay</p>
              <p className="text-lg font-bold text-on-surface mt-0.5">
                +4.2 Days
              </p>
            </div>
          </div>
        </section>

        {/* Customer Invoices */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-base text-on-surface">Invoice History</h2>
            <Link
              href="/invoices/create"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Invoice
            </Link>
          </div>

          <div className="flex flex-col divide-y divide-outline-variant">
            {customerInvoices.length === 0 ? (
              <p className="text-xs text-on-surface-variant py-4 text-center">
                No invoices found for this customer.
              </p>
            ) : (
              customerInvoices.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => router.push(`/invoices/${inv.id}`)}
                  className="py-3 px-2 flex items-center justify-between hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-primary">{inv.number}</span>
                      <Badge status={inv.status} size="sm" />
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Issued {inv.issueDate} • Due {inv.dueDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-on-surface">
                      ${inv.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <ChevronRight className="w-4 h-4 text-outline-variant" />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Notes & Activity Log */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 sm:p-6 shadow-xs">
          <h2 className="font-bold text-base text-on-surface mb-3">Communication & Account Notes</h2>
          <form onSubmit={handleAddNote} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Log a call, payment commitment, or accounts note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
              <Button type="submit" variant="secondary" size="sm">
                Add Note
              </Button>
            </div>
          </form>

          <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/60 text-xs text-on-surface-variant whitespace-pre-line font-mono">
            {notes || 'No activity notes logged yet.'}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
