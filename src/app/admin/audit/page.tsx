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
      title="Compliance & Security Audit"
      subtitle="Immutable event stream recording administrator logins, agency creation, invitations, subscription changes, and payment captures."
      showBack
      backUrl="/admin"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => showToast({ title: 'Export Generated', description: 'Platform compliance audit log downloaded (JSON).', type: 'info' })}
          leftIcon={<Download className="w-3.5 h-3.5" />}
          className="text-xs bg-white text-slate-700 border-slate-200 hover:bg-slate-50 min-h-[36px]"
        >
          Export Trail
        </Button>
      }
    >
      <div className="space-y-6 max-w-full overflow-hidden">
        <section className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 min-w-0">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search across all events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder-slate-400 min-h-[36px]"
            />
          </div>
          <span className="text-xs text-slate-500 font-mono font-semibold pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            {filtered.length} Events
          </span>
        </section>

        <section className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden divide-y divide-slate-100 min-w-0">
          {filtered.map((log) => (
            <div key={log.id} className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 hover:bg-slate-50/70 transition-colors text-xs min-w-0">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-slate-900 truncate">{log.eventType}</span>
                  <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                    {log.actorRole}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{log.description}</p>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate">
                  Actor: {log.actorEmail} • IP: {log.ipAddress}
                </p>
              </div>
              <span className="font-mono text-[10px] sm:text-[11px] text-slate-500 shrink-0 self-start sm:self-auto">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </section>
      </div>
    </AdminLayout>
  );
}
