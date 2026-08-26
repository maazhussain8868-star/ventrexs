'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
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
    <AppShell title="Platform Businesses Directory" showBack backUrl="/admin">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Search Bar */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search all businesses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant rounded-xl pl-9 pr-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>
          <span className="text-xs text-on-surface-variant font-mono">{filtered.length} Businesses Registered</span>
        </section>

        {/* Directory List */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xs overflow-hidden divide-y divide-outline-variant/60">
          {filtered.map((biz) => {
            const isActive = biz.status === 'active';
            return (
              <div key={biz.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-container-low/30 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-on-surface">{biz.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                      {biz.industry}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {biz.plan}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">{biz.email}</p>
                  <p className="text-[11px] text-on-surface-variant font-mono">
                    MRR: ${biz.mrr}/mo • Joined: {biz.created}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={isActive ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => handleToggle(biz)}
                    className="text-xs"
                    leftIcon={isActive ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    {isActive ? 'Suspend Business' : 'Reactivate Business'}
                  </Button>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}
