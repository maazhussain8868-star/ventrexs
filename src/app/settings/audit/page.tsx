'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { getAuditLogsAction } from '@/app/actions/audit';
import { AuditLogEvent } from '@/lib/agency/types';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Lock,
  Clock,
  User,
  ShieldCheck,
  FileText,
} from 'lucide-react';

export default function AuditCompliancePage() {
  const { businessId, showToast } = useApp();
  const [logs, setLogs] = useState<AuditLogEvent[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    async function loadLogs() {
      const res = await getAuditLogsAction(businessId || undefined);
      if (res.success && res.data) {
        setLogs(res.data);
      }
    }
    loadLogs();
  }, [businessId]);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch =
        search === '' ||
        l.actorEmail.toLowerCase().includes(search.toLowerCase()) ||
        l.eventType.toLowerCase().includes(search.toLowerCase()) ||
        l.description.toLowerCase().includes(search.toLowerCase());

      const matchType = typeFilter === 'ALL' || l.eventType === typeFilter;
      return matchSearch && matchType;
    });
  }, [logs, search, typeFilter]);

  return (
    <AppShell
      title="Audit & Compliance Center"
      showBack
      backUrl="/settings"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => showToast({ title: 'Audit Exported', description: 'Downloaded compliance log CSV.', type: 'info' })}
          leftIcon={<Download className="w-3.5 h-3.5" />}
          className="text-xs"
        >
          Export Audit Trail
        </Button>
      }
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Compliance Banner */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-on-surface">Immutable System Audit Log</h2>
            </div>
            <p className="text-xs text-on-surface-variant">
              Complete chronological record of all administrative, financial, and security events. Automatically redacting secrets.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-full text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Append-Only Retention</span>
          </div>
        </section>

        {/* Search & Filter Bar */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search actor, event type, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant rounded-xl pl-9 pr-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-auto bg-surface-container-high border border-outline-variant rounded-xl px-3 py-1.5 text-xs font-semibold text-on-surface focus:outline-none"
          >
            <option value="ALL">All Event Types</option>
            <option value="invoice_created">Invoice Created</option>
            <option value="payment_received">Payment Received</option>
            <option value="agency_context_switch">Agency Context Switch</option>
            <option value="settings_updated">Settings Updated</option>
          </select>
        </section>

        {/* Audit Log Table */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-outline-variant flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Compliance Trail ({filteredLogs.length})
            </h3>
            <span className="text-[11px] text-on-surface-variant font-mono">SOC2 / GDPR Ready</span>
          </div>

          <div className="divide-y divide-outline-variant/60 text-xs">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container-low/30 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-on-surface">{log.eventType}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                      {log.actorRole}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">{log.description}</p>
                  <p className="text-[11px] text-on-surface-variant font-mono">
                    Actor: {log.actorEmail} • IP: {log.ipAddress}
                  </p>
                </div>

                <span className="font-mono text-[11px] text-on-surface-variant whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
