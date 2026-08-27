'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Settings, Sliders, ToggleLeft, ToggleRight, CheckCircle2, ShieldCheck, Database, Bell } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';

export default function AdminSettingsPage() {
  const { showToast } = useApp();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowPublicSignup, setAllowPublicSignup] = useState(true);
  const [allowAgencySelfServe, setAllowAgencySelfServe] = useState(true);
  const [googlePlaySyncActive, setGooglePlaySyncActive] = useState(true);

  return (
    <AdminLayout
      title="Platform Settings & Configuration"
      subtitle="Global runtime configuration, feature gates, and subscription provider routing controls."
      showBack
      backUrl="/admin"
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => showToast({ title: 'Settings Saved', description: 'Platform configuration updated.', type: 'success' })}
          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
        >
          Save Configuration
        </Button>
      }
    >
      <div className="space-y-6">
        <section className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden divide-y divide-slate-100 text-xs">
          {/* Setting 1 */}
          <div className="p-5 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-900 text-sm">Customer Self-Serve Signup</span>
              <p className="text-slate-500">Allow small business contractors to register directly on the customer domain.</p>
            </div>
            <button
              type="button"
              onClick={() => setAllowPublicSignup(!allowPublicSignup)}
              className="text-indigo-600 p-1"
            >
              {allowPublicSignup ? <ToggleRight className="w-8 h-8 text-emerald-600" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
            </button>
          </div>

          {/* Setting 2 */}
          <div className="p-5 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-900 text-sm">Google Play In-App Billing Sync</span>
              <p className="text-slate-500">Accept and verify Android mobile subscription tokens server-side.</p>
            </div>
            <button
              type="button"
              onClick={() => setGooglePlaySyncActive(!googlePlaySyncActive)}
              className="text-indigo-600 p-1"
            >
              {googlePlaySyncActive ? <ToggleRight className="w-8 h-8 text-emerald-600" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
            </button>
          </div>

          {/* Setting 3 */}
          <div className="p-5 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-900 text-sm">Agency Reseller Provisioning</span>
              <p className="text-slate-500">Allow verified marketing agencies to create white-labeled client workspaces.</p>
            </div>
            <button
              type="button"
              onClick={() => setAllowAgencySelfServe(!allowAgencySelfServe)}
              className="text-indigo-600 p-1"
            >
              {allowAgencySelfServe ? <ToggleRight className="w-8 h-8 text-emerald-600" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
            </button>
          </div>

          {/* Setting 4 */}
          <div className="p-5 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-900 text-sm">Global Maintenance Mode</span>
              <p className="text-slate-500">Pause background batch jobs and display maintenance banners across customer portals.</p>
            </div>
            <button
              type="button"
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className="text-indigo-600 p-1"
            >
              {maintenanceMode ? <ToggleRight className="w-8 h-8 text-red-600" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
            </button>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
