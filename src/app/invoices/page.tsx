'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { RecordPaymentModal } from '@/components/invoices/RecordPaymentModal';
import { useApp } from '@/context/AppContext';
import { Invoice, InvoiceStatus } from '@/types';
import { Search, Plus, ArrowUpDown, Eye, CheckCircle, Send, Edit, Trash2, Clock } from 'lucide-react';

export default function InvoicesPage() {
  const router = useRouter();
  const { invoices, deleteInvoice } = useApp();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'overdue-desc'>('date-desc');
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: invoices.length,
      due: invoices.filter(i => i.status === 'due').length,
      overdue: invoices.filter(i => i.status === 'overdue').length,
      paid: invoices.filter(i => i.status === 'paid').length,
      draft: invoices.filter(i => i.status === 'draft').length,
    };
  }, [invoices]);

  const tabs = [
    { id: 'all', label: 'All Invoices', count: tabCounts.all },
    { id: 'due', label: 'Due (On Schedule)', count: tabCounts.due },
    { id: 'overdue', label: 'Overdue Receivables', count: tabCounts.overdue },
    { id: 'paid', label: 'Paid & Settled', count: tabCounts.paid },
    { id: 'draft', label: 'Drafts', count: tabCounts.draft },
  ];

  // Filter & Sort
  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((inv) => {
        if (activeTab !== 'all' && inv.status !== activeTab) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            inv.number.toLowerCase().includes(q) ||
            inv.customerCompany.toLowerCase().includes(q) ||
            inv.customerName.toLowerCase().includes(q) ||
            inv.customerEmail.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
        if (sortBy === 'date-asc') return new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
        if (sortBy === 'amount-desc') return b.remainingBalance - a.remainingBalance;
        if (sortBy === 'overdue-desc') return b.daysOverdue - a.daysOverdue;
        return 0;
      });
  }, [invoices, activeTab, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredInvoices.length / pageSize) || 1;
  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <AppShell
      title="Invoices"
      actions={
        <Link
          href="/invoices/create"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary font-semibold text-xs sm:text-sm rounded-xl shadow-xs hover:bg-on-primary-fixed-variant transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </Link>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Header Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mb-1">Invoices & Receivables</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Track original amounts due, client payments received, and open receivables.
          </p>
        </div>

        {/* Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by invoice #, company, or contact..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant/80 rounded-xl text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface text-xs font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex items-center bg-surface-container-lowest border border-outline-variant/80 rounded-xl px-3 py-2 text-xs font-semibold text-on-surface shadow-xs">
              <ArrowUpDown className="w-3.5 h-3.5 mr-2 text-outline" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent appearance-none pr-4 focus:outline-none cursor-pointer"
              >
                <option value="date-desc">Newest Issue Date</option>
                <option value="date-asc">Oldest Issue Date</option>
                <option value="amount-desc">Highest Balance</option>
                <option value="overdue-desc">Most Days Overdue</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            setCurrentPage(1);
          }}
        />

        {/* Invoice Data Display */}
        {filteredInvoices.length === 0 ? (
          <EmptyState
            title="No Invoices Found"
            description={searchQuery ? `No invoices matched "${searchQuery}".` : "There are no invoices under this status filter."}
            actionLabel="Create Invoice"
            onAction={() => router.push('/invoices/create')}
          />
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl overflow-hidden shadow-xs">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    <th className="py-3.5 px-5">Invoice #</th>
                    <th className="py-3.5 px-5">Customer / Company</th>
                    <th className="py-3.5 px-5">Due Date</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Original Due</th>
                    <th className="py-3.5 px-5 text-right">Remaining Balance</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/60">
                  {paginatedInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => router.push(`/invoices/${inv.id}`)}
                      className="hover:bg-surface-container-low transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-5 font-bold text-primary font-mono">
                        {inv.number}
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-bold text-on-surface group-hover:text-primary transition-colors">
                          {inv.customerCompany}
                        </div>
                        <div className="text-xs text-on-surface-variant">{inv.customerName} • {inv.customerEmail}</div>
                      </td>
                      <td className="py-4 px-5 text-xs">
                        <div className="font-semibold text-on-surface">{inv.dueDate}</div>
                        {inv.status === 'overdue' && (
                          <span className="text-[11px] text-error font-bold block mt-0.5">
                            {inv.daysOverdue} days past due
                          </span>
                        )}
                        {inv.status === 'paid' && (
                          <span className="text-[11px] text-tertiary font-bold block mt-0.5">
                            Paid {inv.paidDate}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <Badge status={inv.status} />
                      </td>
                      <td className="py-4 px-5 text-right font-medium text-on-surface-variant font-mono">
                        ${inv.originalAmountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-5 text-right font-bold text-on-surface font-mono">
                        <span className={inv.remainingBalance > 0 ? (inv.status === 'overdue' ? 'text-error' : 'text-primary') : 'text-tertiary'}>
                          ${inv.remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {inv.status !== 'paid' && (
                            <button
                              onClick={() => setSelectedInvoiceForPayment(inv)}
                              title="Record Payment"
                              className="p-1.5 rounded-lg text-tertiary hover:bg-tertiary-container/15 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <Link
                            href={`/follow-up?invoiceId=${inv.id}`}
                            title="AI Truthful Reminder"
                            className="p-1.5 rounded-lg text-primary hover:bg-primary-container/15 transition-colors"
                          >
                            <Send className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/invoices/${inv.id}/edit`}
                            title="Edit Invoice"
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View matching Stitch */}
            <div className="md:hidden flex flex-col divide-y divide-outline-variant">
              {paginatedInvoices.map((inv) => (
                <article
                  key={inv.id}
                  onClick={() => router.push(`/invoices/${inv.id}`)}
                  className="p-4 flex flex-col gap-2.5 hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-base text-on-surface">{inv.customerCompany}</h3>
                      <p className="text-xs text-outline font-mono">{inv.number}</p>
                    </div>
                    <Badge status={inv.status} size="sm" />
                  </div>

                  <div className="flex justify-between items-end mt-1 pt-2 border-t border-outline-variant/50">
                    <div>
                      <p className="text-[10px] font-bold text-outline uppercase mb-0.5">
                        {inv.status === 'paid' ? 'Settled Date' : 'Due Date'}
                      </p>
                      <p className={`text-xs font-semibold flex items-center gap-1 ${
                        inv.status === 'overdue' ? 'text-error' : 'text-on-surface'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        {inv.status === 'paid' ? inv.paidDate || inv.dueDate : `${inv.dueDate}${inv.daysOverdue > 0 ? ` (${inv.daysOverdue}d ago)` : ''}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-outline uppercase">Remaining Balance</p>
                      <p className={`text-base font-bold font-mono ${
                        inv.status === 'paid' ? 'text-tertiary' : inv.status === 'overdue' ? 'text-error' : 'text-primary'
                      }`}>
                        ${inv.remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredInvoices.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Mobile Floating Action Button (FAB) */}
        <Link
          href="/invoices/create"
          aria-label="Create Invoice"
          className="md:hidden fixed bottom-20 right-5 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-xl flex items-center justify-center z-40 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" />
        </Link>
      </div>

      {/* Record Payment Modal */}
      {selectedInvoiceForPayment && (
        <RecordPaymentModal
          isOpen={!!selectedInvoiceForPayment}
          onClose={() => setSelectedInvoiceForPayment(null)}
          invoice={selectedInvoiceForPayment}
        />
      )}
    </AppShell>
  );
}
