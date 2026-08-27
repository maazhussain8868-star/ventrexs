'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CreditCard, DollarSign, ShieldCheck, CheckCircle2, XCircle, RefreshCw, Filter, Search, Smartphone } from 'lucide-react';

export default function AdminPaymentsPage() {
  const [filterPurpose, setFilterPurpose] = useState<string>('ALL');
  const [filterProvider, setFilterProvider] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const transactions = [
    {
      id: 'txn_01_rzp_9921',
      provider: 'razorpay',
      purpose: 'SAAS_SUBSCRIPTION',
      tenant: 'Apex Precision HVAC',
      agency: 'Apex Growth Marketing',
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
      agency: 'Apex Growth Marketing',
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
      agency: 'TradeScale Reseller',
      tenantId: 'biz_02',
      amount: 2400.0,
      currency: 'USD',
      status: 'SUCCEEDED',
      providerTxnId: 'skydo_cb_4401829',
      date: '2026-08-26 11:45 UTC',
    },
    {
      id: 'txn_04_gplay_3391',
      provider: 'google_play',
      purpose: 'SAAS_SUBSCRIPTION',
      tenant: 'Metro Pro Plumbing',
      agency: 'Apex Growth Marketing',
      tenantId: 'biz_03',
      amount: 19.0,
      currency: 'USD',
      status: 'SUCCEEDED',
      providerTxnId: 'GPA.3391-4820-9182',
      date: '2026-08-26 10:30 UTC',
    },
    {
      id: 'txn_05_rzp_sub_8832',
      provider: 'razorpay',
      purpose: 'SAAS_SUBSCRIPTION',
      tenant: 'Highland Commercial',
      agency: 'Local Contractors Agency',
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
    const matchesProvider = filterProvider === 'ALL' || t.provider === filterProvider;
    const matchesSearch =
      t.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.providerTxnId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.agency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.provider.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPurpose && matchesProvider && matchesSearch;
  });

  return (
    <AdminLayout
      title="Platform Payment Operations"
      subtitle="Auditable transaction ledger strictly separating SaaS subscription revenue from customer invoice settlements."
      showBack
      backUrl="/admin"
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tenant, agency, or transaction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-[#0b101f] border border-outline-variant/60 rounded-xl text-white focus:outline-none focus:border-primary placeholder-slate-500"
              />
            </div>

            <select
              value={filterPurpose}
              onChange={(e) => setFilterPurpose(e.target.value)}
              className="text-xs bg-[#0b101f] border border-outline-variant/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Purposes</option>
              <option value="SAAS_SUBSCRIPTION">SaaS Subscription</option>
              <option value="CUSTOMER_INVOICE">Customer Invoice</option>
              <option value="DEMO">Demo Sandbox</option>
            </select>

            <select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              className="text-xs bg-[#0b101f] border border-outline-variant/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Providers</option>
              <option value="razorpay">Razorpay</option>
              <option value="stripe">Stripe</option>
              <option value="skydo">Skydo</option>
              <option value="google_play">Google Play</option>
            </select>
          </div>

          <span className="text-xs text-slate-400 font-mono">Showing {filtered.length} transactions</span>
        </div>

        {/* Transactions Table */}
        <div className="bg-[#0a0f1d] border border-outline-variant/40 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#070b14] border-b border-outline-variant/40 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Purpose</th>
                  <th className="p-4">Provider</th>
                  <th className="p-4">Tenant / Business</th>
                  <th className="p-4">Agency Reseller</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 text-slate-200">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-white">{t.providerTxnId}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.purpose === 'SAAS_SUBSCRIPTION'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {t.purpose}
                      </span>
                    </td>
                    <td className="p-4 uppercase font-semibold text-slate-300 flex items-center gap-1.5 pt-4">
                      {t.provider === 'google_play' && <Smartphone className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>{t.provider}</span>
                    </td>
                    <td className="p-4 text-white font-medium">{t.tenant}</td>
                    <td className="p-4 text-slate-400 text-[11px]">{t.agency}</td>
                    <td className="p-4 font-mono font-bold text-white">
                      ${t.amount.toFixed(2)} {t.currency}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-mono">{t.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
