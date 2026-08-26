'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useApp } from '@/context/AppContext';
import { getAuditLogsAction } from '@/app/actions/audit';
import { AuditLogEvent } from '@/lib/agency/types';
import { ShieldCheck, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminAuditPage() {
  const { showToast } = useApp();
  const [logs, setLogs] = useState<AuditLogEvent[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      const res = await getAuditLogsAction();
      if (res.success && res.data) {
        setLogs(res.data);
      }
    }
    loadData();
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.actorEmail.toLowerCase().includes(search.toLowerCase()) ||
      l.eventType.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell
      title="Platform-Wide Compliance Audit"
      showBack
      backUrl="/admin"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => showToast({ title: 'Export Generated', description: 'Platform compliance log downloaded.', type: 'info' })}
          leftIcon={<Download className="w-3.5 h-3.5" />}
          className="text-xs"
        >
          Export Compliance Trail
        </Button>
      }
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search across all tenants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant rounded-xl pl-9 pr-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>
          <span className="text-xs text-on-surface-variant font-mono">{filtered.length} Audit Events</span>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xs overflow-hidden divide-y divide-outline-variant/60">
          {filtered.map((log) => (
            <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container-low/30 transition-colors text-xs">
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
        </section>
      </div>
    </AppShell>
  );
}
