'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Settings,
  Users,
  ShieldCheck,
  CreditCard,
  Key,
  Bell,
  Building2,
  Save,
  CheckCircle2,
  Plus,
  Mail,
  Copy,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const AgencySettings: React.FC = () => {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'billing' | 'apikeys' | 'notifications'>('profile');

  const [agencyName, setAgencyName] = useState('Apex Growth Marketing');
  const [agencyEmail, setAgencyEmail] = useState('admin@apexgrowth.io');
  const [subdomain, setSubdomain] = useState('apex');

  const [teamMembers] = useState([
    { name: 'David Miller', email: 'david@apexgrowth.io', role: 'Owner', status: 'Active' },
    { name: 'Sarah Connor', email: 'sarah@apexgrowth.io', role: 'Agency Admin', status: 'Active' },
    { name: 'Alex Rivera', email: 'alex@apexgrowth.io', role: 'Account Manager', status: 'Active' },
  ]);

  const handleSave = () => {
    showToast({
      title: 'Settings Saved',
      description: 'Agency organization profile updated.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Agency Settings & Organization</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage agency branding, team member access, reseller tier limits, and API keys.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          leftIcon={<Save className="w-3.5 h-3.5" />}
          className="text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-xs"
        >
          Save Changes
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'profile', label: 'Agency Profile', icon: Building2 },
          { id: 'team', label: 'Team Members', icon: Users },
          { id: 'billing', label: 'Reseller Plan & Quota', icon: CreditCard },
          { id: 'apikeys', label: 'API Keys', icon: Key },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-violet-50 text-violet-700 border border-violet-200/60 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'profile' && (
        <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4 max-w-3xl">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Organization Profile</h3>
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Agency Name</label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1">Support Email</label>
              <input
                type="email"
                value={agencyEmail}
                onChange={(e) => setAgencyEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1">Agency Subdomain Slug</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  className="w-48 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                />
                <span className="text-slate-400 font-mono text-xs">.agency.ventrexs.com</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'team' && (
        <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Agency Staff</h3>
              <p className="text-xs text-slate-500">Authorized operators who can manage your clients</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white"
            >
              + Invite Member
            </Button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {teamMembers.map((m, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900">{m.name}</span>
                  <p className="text-slate-500 font-mono text-[11px]">{m.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
                    {m.role}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600">Active</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'billing' && (
        <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4 max-w-3xl">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Reseller Tier & Quota</h3>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Growth Partner Plan ($490/mo)</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ACTIVE
              </span>
            </div>
            <p className="text-slate-600">Includes 25 client tenant workspaces, custom domain SSL provisioning, and white-label branding.</p>
            <div className="pt-2 font-mono font-bold text-slate-900">14 / 25 clients provisioned (11 remaining)</div>
          </div>
        </section>
      )}

      {activeTab === 'apikeys' && (
        <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4 max-w-3xl">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Agency API Credentials</h3>
          <div className="space-y-3 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Live Reseller Provisioning Key</span>
                <span className="text-[10px] font-bold text-emerald-600">Production</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value="vtx_live_ag_88491028472910"
                  readOnly
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs text-slate-700"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => showToast({ title: 'Key Copied', type: 'info' })}
                  className="text-xs bg-white text-slate-700 border-slate-200"
                >
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'notifications' && (
        <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4 max-w-3xl">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Alert Preferences</h3>
          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-violet-600" />
              <span className="font-bold text-slate-800">Email digest when client payments succeed or fail</span>
            </label>
            <label className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-violet-600" />
              <span className="font-bold text-slate-800">Alerts when client quota reaches 85% utilization</span>
            </label>
            <label className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-violet-600" />
              <span className="font-bold text-slate-800">SSL certificate and DNS verification updates</span>
            </label>
          </div>
        </section>
      )}
    </div>
  );
};
