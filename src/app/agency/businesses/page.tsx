'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { getAgencyBusinessesAction, switchBusinessContextAction } from '@/app/actions/agency';
import { AgencyBusinessItem } from '@/lib/agency/types';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Search,
  ExternalLink,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Ban,
  ArrowRight,
} from 'lucide-react';

export default function AgencyBusinessesPage() {
  const { showToast } = useApp();
  const router = useRouter();
  const [businesses, setBusinesses] = useState<AgencyBusinessItem[]>([]);
  const [search, setSearch] = useState('');
  const [switching, setSwitching] = useState<string | null>(null);

  useEffect(() => {
    async function loadBusinesses() {
      const res = await getAgencyBusinessesAction();
      if (res.success && res.data) {
        setBusinesses(res.data);
      }
    }
    loadBusinesses();
  }, []);

  const handleSwitch = async (biz: AgencyBusinessItem) => {
    setSwitching(biz.businessId);
    const res = await switchBusinessContextAction(biz.businessId);
    setSwitching(null);
    if (res.success) {
      showToast({
        title: 'Context Switched',
        description: `Now operating in "${biz.businessName}" environment.`,
        type: 'info',
      });
      router.push('/dashboard');
    }
  };

  const filtered = businesses.filter(
    (b) =>
      b.businessName.toLowerCase().includes(search.toLowerCase()) ||
      b.businessEmail.toLowerCase().includes(search.toLowerCase()) ||
      b.industry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell
      title="Client Business Accounts"
      showBack
      backUrl="/agency"
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => showToast({ title: 'New Business', description: 'Create business modal initialized.', type: 'info' })}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          className="text-xs"
        >
          Create Client Business
        </Button>
      }
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Search Bar */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by business name, email, or trade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant rounded-xl pl-9 pr-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <span className="text-xs text-on-surface-variant font-mono">
            {filtered.length} Client Businesses
          </span>
        </section>

        {/* Businesses Table */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xs overflow-hidden">
          <div className="divide-y divide-outline-variant/60">
            {filtered.map((biz) => (
              <div
                key={biz.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-container-low/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-on-surface">{biz.businessName}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                      {biz.industry}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {biz.plan}
                    </span>
                  </div>

                  <p className="text-xs text-on-surface-variant">{biz.businessEmail}</p>

                  <div className="flex items-center gap-4 text-[11px] text-on-surface-variant font-mono pt-1">
                    <span>MRR: ${biz.mrr}/mo</span>
                    <span>Jobs: {biz.jobsCount}</span>
                    <span>Invoices: {biz.invoicesCount}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={switching === biz.businessId}
                    onClick={() => handleSwitch(biz)}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    className="text-xs"
                  >
                    Open Business
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
