'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { BentoMetricCard } from '@/components/dashboard/BentoMetricCard';
import { AIInsightCard } from '@/components/dashboard/AIInsightCard';
import { RecordPaymentModal } from '@/components/invoices/RecordPaymentModal';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/context/AppContext';
import { Invoice } from '@/types';
import { ArrowRight, ChevronRight, Plus, Sparkles, CheckCircle2, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { 
    invoices, 
    totalOutstanding, 
    overdueAmount, 
    dueThisWeek, 
    collectedMtd,
    sendInvoiceReminder
  } = useApp();

  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);

  // Invoices requiring attention: overdue or due soon with high priority
  const attentionInvoices = invoices.filter(
    i => i.status === 'overdue' || (i.status === 'due' && i.priority === 'high')
  ).slice(0, 4);

  // Recent settled payments
  const paidInvoices = invoices.filter(i => i.status === 'paid').slice(0, 4);

  return (
    <AppShell title="Dashboard">
      <div className="flex flex-col gap-6">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-1 border-b border-outline-variant/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">Accounts Receivable Cockpit</h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-tertiary-container/15 text-tertiary">
                <ShieldCheck className="w-3.5 h-3.5" />
                Ethical AR Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant flex items-center gap-2">
              <span>Main Street Bakery & Cafe</span>
              <span className="text-outline">•</span>
              <span className="flex items-center gap-1 text-tertiary font-semibold">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                Real-time Sync Active
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/copilot"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface border border-outline-variant text-on-surface font-semibold text-xs hover:bg-surface-container-low transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>AI Copilot (3)</span>
            </Link>
            <Link
              href="/invoices/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary font-semibold text-xs sm:text-sm rounded-xl shadow-sm hover:bg-on-primary-fixed-variant transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              New Invoice
            </Link>
          </div>
        </div>

        {/* Bento Grid Metrics — Financial Clarity */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <BentoMetricCard
            label="Outstanding Receivables"
            amount={totalOutstanding}
            type="primary"
            changeText="Open Capital"
            subtext="Total unpaid client balance"
          />
          <BentoMetricCard
            label="Overdue Amount"
            amount={overdueAmount}
            type="error"
            changeText={`${attentionInvoices.filter(i => i.status === 'overdue').length} Delinquent`}
            subtext="Original legitimate balance"
          />
          <BentoMetricCard
            label="Due This Week"
            amount={dueThisWeek}
            type="surface"
            changeText="Upcoming"
            subtext="On-schedule collections"
          />
          <BentoMetricCard
            label="Payments Received (MTD)"
            amount={collectedMtd}
            type="tertiary"
            changeText="98% Recovered"
            subtext="Settled directly to bank"
          />
        </section>

        {/* AI Copilot Insights Banner matching Stitch */}
        <AIInsightCard
          title="AI Accounts Receivable Recommendation"
          insight="Acme Corp ($4,800.00) is 8 days past due. Historical payment behavior indicates their finance team processes scheduled batch checks on Thursdays. Sending a courteous disbursement confirmation today will expedite approval."
          actionLabel="Review & Send Follow-up"
          actionHref="/follow-up?invoiceId=inv-1"
          confidence={88}
        />

        {/* Invoices Requiring Attention */}
        <section className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-outline-variant">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-error/10 text-error">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-base sm:text-lg text-on-surface">Invoices Requiring Attention</h2>
                <p className="text-xs text-on-surface-variant">Overdue accounts sorted by aging days and original balance</p>
              </div>
            </div>
            <Link href="/invoices" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
              All Invoices ({invoices.length})
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col divide-y divide-outline-variant/60">
            {attentionInvoices.length === 0 ? (
              <p className="text-xs text-on-surface-variant py-6 text-center">
                Excellent! All customer accounts are up to date.
              </p>
            ) : (
              attentionInvoices.map((inv) => {
                const initials = inv.customerCompany
                  .split(' ')
                  .map(w => w[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={inv.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-4 px-2 hover:bg-surface-container-low rounded-xl transition-colors gap-3"
                  >
                    {/* Left: Customer & Details */}
                    <div 
                      onClick={() => router.push(`/invoices/${inv.id}`)}
                      className="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1"
                    >
                      <div className="w-11 h-11 rounded-xl bg-error-container/40 text-error flex items-center justify-center font-bold text-xs shrink-0 border border-error/20">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-on-surface truncate hover:text-primary transition-colors">
                            {inv.customerCompany}
                          </p>
                          <span className="text-[11px] font-bold text-error bg-error/10 px-2 py-0.5 rounded-full">
                            {inv.daysOverdue > 0 ? `${inv.daysOverdue}d Overdue` : 'Due Soon'}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {inv.number} • Contact: {inv.customerName} • Due {inv.dueDate}
                        </p>
                      </div>
                    </div>

                    {/* Right: Amounts & Quick Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="text-left sm:text-right">
                        <p className="text-sm sm:text-base font-bold text-on-surface font-mono">
                          ${inv.remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-outline">Original Due: ${inv.originalAmountDue.toLocaleString()}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => sendInvoiceReminder(inv.id)}
                          className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-semibold text-xs hover:bg-on-primary-fixed-variant transition-colors flex items-center gap-1 shadow-xs"
                          title="Send Truthful Reminder"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Remind</span>
                        </button>
                        <button
                          onClick={() => setSelectedInvoiceForPayment(inv)}
                          className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
                        >
                          Record Pay
                        </button>
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="p-1.5 text-outline-variant hover:text-primary rounded-lg"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Recent Payments Received */}
        <section className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-outline-variant">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-tertiary-container/15 text-tertiary">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-base sm:text-lg text-on-surface">Recent Payments Settled</h2>
                <p className="text-xs text-on-surface-variant">Cleared direct remittances credited to customer accounts</p>
              </div>
            </div>
            <Link href="/collections" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
              Collections Ledger
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col divide-y divide-outline-variant/60">
            {paidInvoices.map((inv) => (
              <div
                key={inv.id}
                onClick={() => router.push(`/invoices/${inv.id}`)}
                className="flex items-center justify-between py-3.5 px-2 hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-tertiary-container/15 text-tertiary flex items-center justify-center shrink-0 border border-tertiary/20">
                    <span className="material-symbols-outlined text-[20px] fill-icon">check_circle</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                      {inv.customerCompany}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {inv.number} • Paid on {inv.paidDate || 'Recently'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm sm:text-base font-bold text-tertiary font-mono">
                    +${inv.paymentsReceived.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[11px] text-on-surface-variant">100% Principal Settled</p>
                </div>
              </div>
            ))}
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
