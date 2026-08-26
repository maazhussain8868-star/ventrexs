'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { requestDataExportAction, requestTenantAccountDeletionAction } from '@/app/actions/audit';
import {
  Download,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  FileJson,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

export default function DataRetentionPage() {
  const { businessId, showToast } = useApp();
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'zip'>('json');
  const [exporting, setExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState<string | null>(null);

  const [deleteReason, setDeleteReason] = useState('');
  const [deleteStep, setDeleteStep] = useState(1);
  const [requestingDelete, setRequestingDelete] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    const res = await requestDataExportAction(businessId || 'biz_01', exportFormat);
    setExporting(false);
    if (res.success && res.data) {
      setExportComplete(res.data.downloadUrl || '/api/export');
      showToast({ title: 'Export Generated', description: `Tenant archive ready in ${exportFormat.toUpperCase()} format.`, type: 'info' });
    }
  };

  const handleDelete = async () => {
    if (!deleteReason.trim()) {
      showToast({ title: 'Reason Required', description: 'Please explain why you wish to request deletion.', type: 'error' });
      return;
    }
    setRequestingDelete(true);
    const res = await requestTenantAccountDeletionAction(businessId || 'biz_01', deleteReason);
    setRequestingDelete(false);
    if (res.success) {
      setDeleteStep(2);
      showToast({ title: 'Deletion Requested', description: 'Request registered for administrative review.', type: 'info' });
    }
  };

  return (
    <AppShell title="Data Export & Privacy Center" showBack backUrl="/settings">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-on-surface">Data Portability & Account Controls</h2>
          </div>
          <p className="text-xs text-on-surface-variant">
            Full compliance with GDPR, CCPA, and statutory data portability standards. You retain 100% ownership of your business data.
          </p>
        </section>

        {/* 1. Data Export Box */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-on-surface">Export Business Archive</h3>
          </div>
          <p className="text-xs text-on-surface-variant">
            Download your complete tenant dataset including customers, leads, jobs, estimates, invoices, payments, reviews, and audit events.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setExportFormat('json')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                exportFormat === 'json'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-outline-variant text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <FileJson className="w-4 h-4" /> JSON Bundle
            </button>
            <button
              onClick={() => setExportFormat('csv')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                exportFormat === 'csv'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-outline-variant text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" /> CSV Spreadsheets
            </button>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={handleExport}
              isLoading={exporting}
              leftIcon={<Download className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Generate Export Archive
            </Button>
            {exportComplete && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Archive Ready for Download
              </span>
            )}
          </div>
        </section>

        {/* 2. Account Deletion Workflow */}
        <section className="bg-surface-container-lowest border border-rose-500/30 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-rose-600">
            <Trash2 className="w-5 h-5" />
            <h3 className="text-base font-bold text-on-surface">Request Account Deletion</h3>
          </div>
          <p className="text-xs text-on-surface-variant">
            4-step guarded deletion process (REQUESTED → REVIEWED → CONFIRMED → EXECUTED). Tax and financial records are legally retained as required by law while personal identity data is safely anonymized.
          </p>

          {deleteStep === 1 ? (
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-on-surface">Reason for Deletion Request</label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Please describe why you are closing this account..."
                className="w-full bg-surface-container-high border border-outline-variant rounded-xl p-3 text-xs text-on-surface focus:outline-none focus:border-rose-500"
                rows={3}
              />
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                isLoading={requestingDelete}
                leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Submit Deletion Request
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">Deletion Request Submitted</span>
              <p className="text-xs text-on-surface-variant">
                Your request is under review. Our administrative team will verify final ledger settlements and schedule safe data removal within 30 days.
              </p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
