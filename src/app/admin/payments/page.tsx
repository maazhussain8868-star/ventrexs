'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { CreditCard, DollarSign, ShieldCheck, CheckCircle2, XCircle, RefreshCw, Filter, Search } from 'lucide-react';

export default function AdminPaymentsPage() {
  const [filterPurpose, setFilterPurpose] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const transactions = [
    {
      id: 'txn_01_rzp_9921',
      provider: 'razorpay',
      purpose: 'SAAS_SUBSCRIPTION',
      tenant: 'Apex Precision HVAC',
      tenantId: 'biz_01',
      amount: 49.0,
      currency: 'USD',
      status: 'SUCCEEDED',
      providerTxnId: 'pay_rzp_9921837492',
      date: '2026-08-26 14:30 UTC',
    },
    {
      id: 'txn_02_stripe_1120',
      provider: 'stripe',
      purpose: 'CUSTOMER_INVOICE',
      tenant: 'Apex Precision HVAC',
      tenantId: 'biz_01',
      amount: 500.0,
      currency: 'USD',
      status: 'SUCCEEDED',
      providerTxnId: 'pi_3MtwL2KZIS582',
      date: '2026-08-26 13:15 UTC',
    },
    {
      id: 'txn_03_skydo_4401',
      provider: 'skydo',
      purpose: 'CUSTOMER_INVOICE',
      tenant: 'Rival Trade Services',
      tenantId: 'biz_02',
      amount: 2400.0,
      currency: 'USD',
      status: 'SUCCEEDED',
      providerTxnId: 'skydo_cb_4401829',
      date: '2026-08-26 11:45 UTC',
    },
    {
      id: 'txn_04_rzp_sub_8832',
      provider: 'razorpay',
      purpose: 'SAAS_SUBSCRIPTION',
      tenant: 'Highland Commercial',
      tenantId: 'biz_04',
      amount: 199.0,
      currency: 'USD',
      status: 'SUCCEEDED',
      providerTxnId: 'pay_rzp_8832910382',
      date: '2026-08-26 09:20 UTC',
    },
  ];

  const filtered = transactions.filter((t) => {
    const matchesPurpose = filterPurpose === 'ALL' || t.purpose === filterPurpose;
    const matchesSearch =
      t.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.providerTxnId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.provider.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPurpose && matchesSearch;
  });

  return (
    <AppShell title="Platform Payment Ledger" showBack backUrl="/admin">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header banner */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-on-surface">Platform Multi-Provider Payment Operations</h2>
            </div>
            <p className="text-xs text-on-surface-variant">
              Auditable transaction ledger strictly separating Ventrexs SaaS subscription revenue from customer invoice settlements.
            </p>
          </div>
        </section>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search tenant or transaction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-surface-container-lowest border border-outline-variant rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <select
              value={filterPurpose}
              onChange={(e) => setFilterPurpose(e.target.value)}
              className="text-xs bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Purposes</option>
              <option value="SAAS_SUBSCRIPTION">SaaS Subscription</option>
              <option value="CUSTOMER_INVOICE">Customer Invoice</option>
              <option value="DEMO">Demo Sandbox</option>
            </select>
          </div>
          <span className="text-xs text-on-surface-variant font-mono">Showing {filtered.length} transactions</span>
        </div>

        {/* Transactions Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant uppercase font-semibold">
                <tr>
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Purpose</th>
                  <th className="p-4">Provider</th>
                  <th className="p-4">Tenant</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4 font-mono font-bold text-on-surface">{t.providerTxnId}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.purpose === 'SAAS_SUBSCRIPTION'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {t.purpose}
                      </span>
                    </td>
                    <td className="p-4 uppercase font-semibold text-on-surface-variant">{t.provider}</td>
                    <td className="p-4 text-on-surface">{t.tenant}</td>
                    <td className="p-4 font-mono font-bold text-on-surface">
                      ${t.amount.toFixed(2)} {t.currency}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t.status}
                      </span>
                    </td>
                    <td className="p-4 text-on-surface-variant font-mono">{t.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
