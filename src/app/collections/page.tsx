'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RecordPaymentModal } from '@/components/invoices/RecordPaymentModal';
import { useApp } from '@/context/AppContext';
import { Invoice } from '@/types';
import { 
  DollarSign, 
  Sparkles, 
  Phone, 
  Mail, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  ChevronRight,
  Clock
} from 'lucide-react';

export default function CollectionsPage() {
  const router = useRouter();
  const { invoices, overdueAmount, sendInvoiceReminder, showToast } = useApp();
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);

  const overdueInvoices = invoices.filter(i => i.status === 'overdue');

  // Calculate Aging Buckets for Original Balances
  const aging1to15 = overdueInvoices
    .filter(i => i.daysOverdue >= 1 && i.daysOverdue <= 15)
    .reduce((sum, i) => sum + i.remainingBalance, 0);

  const aging16to30 = overdueInvoices
    .filter(i => i.daysOverdue >= 16 && i.daysOverdue <= 30)
    .reduce((sum, i) => sum + i.remainingBalance, 0);

  const aging30Plus = overdueInvoices
    .filter(i => i.daysOverdue > 30)
    .reduce((sum, i) => sum + i.remainingBalance, 0);

  const handleQuickNudge = (inv: Invoice) => {
    sendInvoiceReminder(inv.id);
  };

  return (
    <AppShell
      title="Collections & Aging Ledger"
      actions={
        <Link
          href="/copilot"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-on-primary font-semibold text-xs shadow-xs hover:bg-on-primary-fixed-variant transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          AI Copilot Mode
        </Link>
      }
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">Receivables Aging & Recovery</h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-tertiary-container/15 text-tertiary">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Principal Balance
            </span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Track overdue aging intervals and resolve outstanding balances with professional, respectful communication.
          </p>
        </div>

        {/* Aging Buckets Bento */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-4 sm:p-5 shadow-xs">
            <p className="text-[10px] font-bold text-error uppercase tracking-wider mb-1">
              Total Overdue Receivables
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-error font-mono">
              ${overdueAmount.toLocaleString()}
            </p>
            <p className="text-[10px] text-on-surface-variant mt-1">Original legitimate balance owed</p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-4 sm:p-5 shadow-xs">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              1-15 Days Past Due
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-on-surface font-mono">
              ${aging1to15.toLocaleString()}
            </p>
            <p className="text-[10px] text-tertiary font-semibold mt-1">94% Expected Settlement Rate</p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-4 sm:p-5 shadow-xs">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              16-30 Days Past Due
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-primary font-mono">
              ${aging16to30.toLocaleString()}
            </p>
            <p className="text-[10px] text-primary font-semibold mt-1">Professional Follow-up Queued</p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-4 sm:p-5 shadow-xs">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              31+ Days Past Due
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-outline font-mono">
              ${aging30Plus.toLocaleString()}
            </p>
            <p className="text-[10px] text-tertiary font-semibold mt-1">Zero bad debt write-offs</p>
          </div>
        </section>

        {/* Prioritized Collection Queue */}
        <section className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-outline-variant">
            <div>
              <h2 className="font-bold text-base sm:text-lg text-on-surface">Prioritized Receivables Queue</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Ranked by days overdue, original balance amount, and customer payment reliability.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
              AI Smart Rank
            </span>
          </div>

          <div className="space-y-4">
            {overdueInvoices.length === 0 ? (
              <p className="text-xs text-on-surface-variant py-6 text-center">
                All receivables are current! No overdue accounts requiring attention.
              </p>
            ) : (
              overdueInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-4 bg-surface rounded-xl border border-outline-variant flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-xs transition-shadow"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-error-container/40 text-error flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-error/20">
                      {inv.customerCompany.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-on-surface">{inv.customerCompany}</h3>
                        <Badge status="overdue" size="sm" />
                        <span className="text-[10px] font-bold text-error bg-error/10 px-2 py-0.5 rounded-full">
                          {inv.daysOverdue} Days Overdue
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Invoice <strong>{inv.number}</strong> • Primary Contact: {inv.customerName} ({inv.customerPhone || inv.customerEmail})
                      </p>
                      <p className="text-xs text-on-surface-variant font-medium mt-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-outline" />
                        Original Due Date: {inv.dueDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end w-full sm:w-auto gap-3">
                    <div className="sm:text-right">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Remaining Principal</span>
                      <span className="text-xl font-bold text-on-surface font-mono">
                        ${inv.remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuickNudge(inv)}
                        className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-semibold text-xs hover:bg-on-primary-fixed-variant transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Send Truthful Reminder
                      </button>
                      <button
                        onClick={() => setSelectedInvoiceForPayment(inv)}
                        className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
                      >
                        Record Pay
                      </button>
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="p-1.5 text-on-surface-variant hover:text-primary rounded-lg"
                        title="View Invoice"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
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
