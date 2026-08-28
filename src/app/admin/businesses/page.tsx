'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { getAdminBusinessesAction, toggleBusinessStatusAdminAction } from '@/app/actions/admin';
import {
  Building2,
  Search,
  ShieldCheck,
  CheckCircle2,
  Ban,
  Clock,
} from 'lucide-react';

export default function AdminBusinessesPage() {
  const { showToast } = useApp();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    const res = await getAdminBusinessesAction();
    if (res.success && res.data) {
      setBusinesses(res.data);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (biz: any) => {
    const nextStatus = biz.status === 'active' ? 'suspended' : 'active';
    const res = await toggleBusinessStatusAdminAction(biz.id, nextStatus);
    if (res.success) {
      showToast({
        title: 'Status Updated',
        description: `Business "${biz.name}" set to ${nextStatus}.`,
        type: 'info',
      });
      loadData();
    }
  };

  const filtered = businesses.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.email.toLowerCase().includes(search.toLowerCase()) ||
      b.industry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout
      title="Tenant Businesses Directory"
      subtitle="Comprehensive directory of registered small business tenants, assigned reseller agencies, and subscription tiers."
      showBack
      backUrl="/admin"
    >
      <div className="space-y-6 max-w-full overflow-hidden">
        {/* Search Bar */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 min-w-0">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search all businesses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder-slate-400 min-h-[36px]"
            />
          </div>
          <span className="text-xs text-slate-500 font-mono font-semibold pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            {filtered.length} Businesses Registered
          </span>
        </section>

        {/* Directory List */}
        <section className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden divide-y divide-slate-100 min-w-0">
          {filtered.map((biz) => {
            const isActive = biz.status === 'active';
            return (
              <div key={biz.id} className="p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-slate-50/70 transition-colors min-w-0">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{biz.name}</h3>
                    <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                      {biz.industry}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold px-2.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                      {biz.plan}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{biz.email}</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
                    MRR: ${biz.mrr}/mo • Joined: {biz.created}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggle(biz)}
                    className={`text-xs min-h-[32px] ${
                      isActive
                        ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {isActive ? 'Suspend' : 'Activate'}
                  </Button>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </AdminLayout>
  );
}
