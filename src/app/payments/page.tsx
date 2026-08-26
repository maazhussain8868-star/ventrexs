'use client';

import React, { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { RecordPaymentModal } from '@/components/invoices/RecordPaymentModal';
import { RefundPaymentModal } from '@/components/payments/RefundPaymentModal';
import { PaymentRecord, PaymentStatus } from '@/lib/payments/types';
import {
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  RotateCcw,
  Search,
  Filter,
  CreditCard,
  Building2,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Download,
  Calendar,
  FileText,
} from 'lucide-react';
import Link from 'next/link';

export default function PaymentsPage() {
  const { invoices, showToast } = useApp();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');

  // Modals
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [selectedPaymentForRefund, setSelectedPaymentForRefund] = useState<PaymentRecord | null>(null);

  // Mock & In-Memory Payments Ledger
  const mockPaymentsList: PaymentRecord[] = useMemo(() => {
    return [
      {
        id: 'pay-001',
        businessId: 'biz-1',
        invoiceId: 'inv-1',
        invoiceNumber: 'INV-2026-001',
        customerName: 'Michael Scott',
        amount: 3200.0,
        currency: 'USD',
        method: 'ACH Transfer',
        status: 'SUCCEEDED',
        provider: 'ach',
        providerTransactionId: 'ach_sec_882910',
        paymentDate: '2026-08-24T14:30:00Z',
        refundedAmount: 0,
        notes: 'Monthly HVAC preventative maintenance contract payment.',
        createdAt: '2026-08-24T14:30:00Z',
      },
      {
        id: 'pay-002',
        businessId: 'biz-1',
        invoiceId: 'inv-2',
        invoiceNumber: 'INV-2026-002',
        customerName: 'Sarah Connor',
        amount: 1850.0,
        currency: 'USD',
        method: 'Credit Card',
        status: 'SUCCEEDED',
        provider: 'stripe',
        providerTransactionId: 'pi_3Kj8829011',
        paymentDate: '2026-08-25T09:15:00Z',
        refundedAmount: 0,
        notes: 'Emergency commercial roof repair - Final balance.',
        createdAt: '2026-08-25T09:15:00Z',
      },
      {
        id: 'pay-003',
        businessId: 'biz-1',
        invoiceId: 'inv-3',
        invoiceNumber: 'INV-2026-003',
        customerName: 'Jim Halpert',
        amount: 750.0,
        currency: 'USD',
        method: 'Check',
        status: 'SUCCEEDED',
        provider: 'manual',
        reference: 'CHK #4492',
        paymentDate: '2026-08-25T11:45:00Z',
        refundedAmount: 0,
        notes: 'Partial payment on plumbing line replacement.',
        createdAt: '2026-08-25T11:45:00Z',
      },
      {
        id: 'pay-004',
        businessId: 'biz-1',
        invoiceId: 'inv-4',
        invoiceNumber: 'INV-2026-004',
        customerName: 'Dwight Schrute',
        amount: 2400.0,
        currency: 'USD',
        method: 'Credit Card',
        status: 'FAILED',
        provider: 'stripe',
        providerTransactionId: 'pi_fail_99812',
        failureReason: 'Card was declined due to insufficient funds.',
        paymentDate: '2026-08-23T16:20:00Z',
        refundedAmount: 0,
        createdAt: '2026-08-23T16:20:00Z',
      },
      {
        id: 'pay-005',
        businessId: 'biz-1',
        invoiceId: 'inv-5',
        invoiceNumber: 'INV-2026-005',
        customerName: 'Stanley Hudson',
        amount: 1200.0,
        currency: 'USD',
        method: 'Credit Card',
        status: 'REFUNDED',
        provider: 'stripe',
        providerTransactionId: 'pi_ref_00291',
        paymentDate: '2026-08-20T10:00:00Z',
        refundedAmount: 1200.0,
        notes: 'Full refund issued due to rescheduled project scope.',
        createdAt: '2026-08-20T10:00:00Z',
      },
    ];
  }, []);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return mockPaymentsList.filter((p) => {
      // Search
      const matchSearch =
        searchQuery === '' ||
        p.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.providerTransactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.notes?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status
      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;

      // Method
      const matchMethod = methodFilter === 'ALL' || p.method === methodFilter;

      return matchSearch && matchStatus && matchMethod;
    });
  }, [mockPaymentsList, searchQuery, statusFilter, methodFilter]);

  // Aggregate Metrics
  const summary = useMemo(() => {
    let totalCollected = 0;
    let collectionsToday = 0;
    let pending = 0;
    let failed = 0;
    let refunded = 0;

    const todayStr = new Date().toISOString().substring(0, 10);

    for (const p of mockPaymentsList) {
      if (p.status === 'SUCCEEDED' || p.status === 'PARTIALLY_REFUNDED') {
        const net = p.amount - p.refundedAmount;
        totalCollected += net;
        if (p.paymentDate.startsWith(todayStr)) {
          collectionsToday += net;
        }
      } else if (p.status === 'PENDING' || p.status === 'PROCESSING') {
        pending += p.amount;
      } else if (p.status === 'FAILED') {
        failed += p.amount;
      }
      refunded += p.refundedAmount;
    }

    return {
      totalCollected,
      collectionsToday,
      pending,
      failed,
      refunded,
      rate: '96.2%',
    };
  }, [mockPaymentsList]);

  return (
    <AppShell
      title="Revenue Operations & Payments"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => showToast({ title: 'Exporting Reconciliation', description: 'Generating reconciliation CSV...', type: 'info' })}
            leftIcon={<Download className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Export Ledger
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsRecordOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Record Payment
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Metric Cards Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/70 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Total Collected
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black font-mono text-on-surface">
                ${summary.totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <span className="text-[11px] text-tertiary font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +14.8% MTD
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/70 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Today's Collections
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-primary">
              ${summary.collectionsToday.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-on-surface-variant font-medium">3 Settled Transactions</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/70 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Collection Rate
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-600">
              {summary.rate}
            </span>
            <span className="text-[11px] text-on-surface-variant font-medium">Top Tier Velocity</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/70 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Failed Attempts
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-rose-600">
              ${summary.failed.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-rose-600 font-bold">1 Declined Card</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/70 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Refunds Issued
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-on-surface-variant">
              ${summary.refunded.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-on-surface-variant font-medium">100% Reconciled</span>
          </div>
        </section>

        {/* Filters & Search Toolbar */}
        <section className="bg-surface-container-lowest border border-outline-variant/70 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer, invoice #, ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface-container-high border border-outline-variant/60 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-on-surface focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCEEDED">Succeeded</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>

            {/* Method Filter */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-surface-container-high border border-outline-variant/60 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-on-surface focus:outline-none"
            >
              <option value="ALL">All Methods</option>
              <option value="Credit Card">Credit Card</option>
              <option value="ACH Transfer">Bank ACH</option>
              <option value="Check">Check</option>
            </select>
          </div>
        </section>

        {/* Payments Ledger Table */}
        <section className="bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-outline-variant/60 flex items-center justify-between">
            <h3 className="font-bold text-sm text-on-surface">Payment Transactions ({filteredPayments.length})</h3>
            <span className="text-xs text-on-surface-variant font-mono">Immutable Revenue Ledger</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/60 text-on-surface-variant font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Invoice</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40 text-on-surface">
                {filteredPayments.map((p) => {
                  const isSucceeded = p.status === 'SUCCEEDED';
                  const isFailed = p.status === 'FAILED';
                  const isRefunded = p.status === 'REFUNDED';

                  return (
                    <tr key={p.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-on-surface-variant">
                        {new Date(p.paymentDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        •{' '}
                        {new Date(p.paymentDate).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-on-surface block">{p.customerName}</span>
                        {p.notes && <span className="text-[11px] text-on-surface-variant truncate block max-w-xs">{p.notes}</span>}
                      </td>

                      <td className="py-3.5 px-4">
                        <Link
                          href={`/invoices/${p.invoiceId}`}
                          className="font-mono font-bold text-primary hover:underline flex items-center gap-1"
                        >
                          {p.invoiceNumber}
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          {p.method === 'Credit Card' ? (
                            <CreditCard className="w-3.5 h-3.5 text-primary" />
                          ) : (
                            <Building2 className="w-3.5 h-3.5 text-tertiary" />
                          )}
                          {p.method}
                        </span>
                        {p.providerTransactionId && (
                          <span className="text-[10px] text-on-surface-variant font-mono block">
                            {p.providerTransactionId}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-sm">
                        ${p.amount.toFixed(2)}
                        {p.refundedAmount > 0 && (
                          <span className="text-[10px] text-rose-600 block">
                            -${p.refundedAmount.toFixed(2)} Ref
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isSucceeded
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : isFailed
                              ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                              : 'bg-surface-container-high text-on-surface-variant border border-outline-variant'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isSucceeded && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedPaymentForRefund(p)}
                              className="text-[11px] h-7 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
                            >
                              Refund
                            </Button>
                          )}
                          <Link
                            href={`/invoices/${p.invoiceId}`}
                            className="p-1 rounded text-on-surface-variant hover:text-on-surface transition-colors"
                            title="View Invoice"
                          >
                            <FileText className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Record Payment Modal */}
      {invoices.length > 0 && (
        <RecordPaymentModal
          invoice={invoices[0]}
          isOpen={isRecordOpen}
          onClose={() => setIsRecordOpen(false)}
        />
      )}

      {/* Refund Modal */}
      {selectedPaymentForRefund && (
        <RefundPaymentModal
          payment={selectedPaymentForRefund}
          isOpen={Boolean(selectedPaymentForRefund)}
          onClose={() => setSelectedPaymentForRefund(null)}
          onSuccess={() => {
            showToast({ title: 'Refund Recorded', description: 'Ledger updated.', type: 'success' });
          }}
        />
      )}
    </AppShell>
  );
}
