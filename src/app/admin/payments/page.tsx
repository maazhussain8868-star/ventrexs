'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CreditCard, DollarSign, ShieldCheck, CheckCircle2, XCircle, RefreshCw, Filter, Search, Smartphone, Globe } from 'lucide-react';

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

  const getPurposeBadge = (purpose: string) => {
    switch (purpose) {
      case 'SAAS_SUBSCRIPTION':
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            SAAS SUBSCRIPTION
          </span>
        );
      case 'CUSTOMER_INVOICE':
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            CUSTOMER INVOICE
          </span>
        );
      default:
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {purpose}
          </span>
        );
    }
  };

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case 'google_play':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
            <Smartphone className="w-3.5 h-3.5" /> Google Play
          </span>
        );
      case 'stripe':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700">
            <CreditCard className="w-3.5 h-3.5" /> Stripe
          </span>
        );
      case 'razorpay':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700">
            <Globe className="w-3.5 h-3.5" /> Razorpay
          </span>
        );
      default:
        return <span className="text-[11px] font-bold text-slate-700 uppercase">{provider}</span>;
    }
  };

  return (
    <AdminLayout
      title="Payment Operations Ledger"
      subtitle="Auditable platform ledger separating Ventrexs SaaS subscription revenues from contractor invoice settlements."
      showBack
      backUrl="/admin"
    >
      <div className="space-y-6 max-w-full overflow-hidden">
        {/* Filters */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tenant, agency, transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[36px]"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <select
                value={filterPurpose}
                onChange={(e) => setFilterPurpose(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 font-medium min-h-[36px]"
              >
                <option value="ALL">All Purposes</option>
                <option value="SAAS_SUBSCRIPTION">SaaS Subscription</option>
                <option value="CUSTOMER_INVOICE">Customer Invoice</option>
                <option value="DEMO">Demo Sandbox</option>
              </select>

              <select
                value={filterProvider}
                onChange={(e) => setFilterProvider(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 font-medium min-h-[36px]"
              >
                <option value="ALL">All Providers</option>
                <option value="razorpay">Razorpay</option>
                <option value="stripe">Stripe</option>
                <option value="skydo">Skydo</option>
                <option value="google_play">Google Play</option>
              </select>
            </div>
          </div>

          <span className="text-xs text-slate-500 font-mono font-semibold pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            Showing {filtered.length} transactions
          </span>
        </div>

        {/* Transactions Table */}
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[720px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Customer Business</th>
                  <th className="py-3 px-4">Agency Reseller</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{t.providerTxnId}</td>
                    <td className="py-3.5 px-4 text-slate-900 font-semibold">{t.tenant}</td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">{t.agency}</td>
                    <td className="py-3.5 px-4">{getPurposeBadge(t.purpose)}</td>
                    <td className="py-3.5 px-4">{getProviderBadge(t.provider)}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      ${t.amount.toFixed(2)} {t.currency}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        SUCCESS
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-right">{t.date}</td>
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
