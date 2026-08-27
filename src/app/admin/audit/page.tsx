'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
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
    <AdminLayout
      title="Platform-Wide Compliance & Security Audit"
      subtitle="Immutable event stream recording administrator logins, agency creation, invitations, subscription changes, and payment captures."
      showBack
      backUrl="/admin"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => showToast({ title: 'Export Generated', description: 'Platform compliance audit log downloaded (JSON).', type: 'info' })}
          leftIcon={<Download className="w-3.5 h-3.5" />}
          className="text-xs border-outline-variant/60 text-slate-200"
        >
          Export Trail
        </Button>
      }
    >
      <div className="space-y-6">
        <section className="bg-[#0a0f1d] border border-outline-variant/40 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search across all tenants and events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#070b14] border border-outline-variant/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-primary placeholder-slate-500"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono">{filtered.length} Audit Events</span>
        </section>

        <section className="bg-[#0a0f1d] border border-outline-variant/40 rounded-2xl shadow-xl overflow-hidden divide-y divide-outline-variant/30">
          {filtered.map((log) => (
            <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container-low/40 transition-colors text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white">{log.eventType}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {log.actorRole}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{log.description}</p>
                <p className="text-[11px] text-slate-400 font-mono">
                  Actor: {log.actorEmail} • IP: {log.ipAddress}
                </p>
              </div>
              <span className="font-mono text-[11px] text-slate-400 whitespace-nowrap">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </section>
      </div>
    </AdminLayout>
  );
}
