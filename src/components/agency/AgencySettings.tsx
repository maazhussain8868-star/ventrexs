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
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-1">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
            Agency Settings & Organization
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 line-clamp-2">
            Manage agency branding, team member access, reseller tier limits, and API keys.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          leftIcon={<Save className="w-3.5 h-3.5" />}
          className="text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-xs shrink-0 min-h-[36px]"
        >
          Save Changes
        </Button>
      </div>

      {/* Navigation Tabs (Horizontal Scroll on Mobile) */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        {[
          { id: 'profile', label: 'Agency Profile', icon: Building2 },
          { id: 'team', label: 'Team Members', icon: Users },
          { id: 'billing', label: 'Reseller Quota', icon: CreditCard },
          { id: 'apikeys', label: 'API Keys', icon: Key },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap min-h-[36px] ${
              activeTab === tab.id
                ? 'bg-violet-50 text-violet-700 border border-violet-200/60 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'profile' && (
        <section className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 max-w-3xl min-w-0">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">Organization Profile</h3>
          <div className="space-y-3 sm:space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Agency Name</label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 min-h-[36px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Primary Agency Admin Email</label>
                <input
                  type="email"
                  value={agencyEmail}
                  onChange={(e) => setAgencyEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 min-h-[36px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Subdomain Slug</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-l-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 min-h-[36px]"
                  />
                  <span className="px-3 py-2 bg-slate-100 border border-l-0 border-slate-200 rounded-r-xl text-slate-500 font-mono text-xs min-h-[36px] flex items-center">
                    .ventrexs.com
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'team' && (
        <section className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 max-w-3xl min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">Agency Staff Team</h3>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="text-xs bg-slate-50 text-slate-800 border-slate-200 min-h-[32px]"
            >
              + Invite Member
            </Button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-xs shrink-0">
                    {member.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{member.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200">
                    {member.role}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'billing' && (
        <section className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 max-w-3xl min-w-0">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">Agency Tier & Allocation</h3>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-base font-extrabold text-slate-900">Partner Scale Tier</span>
                <p className="text-xs text-slate-500">25 client workspaces allowance</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-xs">
                ACTIVE
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-violet-600 rounded-full" style={{ width: '56%' }} />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>14 / 25 Workspaces provisioned</span>
              <span className="font-bold text-violet-700">11 Available</span>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'apikeys' && (
        <section className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 max-w-3xl min-w-0">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">Agency API Credentials</h3>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-slate-700">Production Public Key</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value="vtx_live_ag_pk_88392019485729103"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => showToast({ title: 'Key Copied', description: 'Public key copied to clipboard.', type: 'info' })}
                className="text-xs bg-white text-slate-700 border-slate-200 min-h-[36px]"
              >
                Copy
              </Button>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'notifications' && (
        <section className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 max-w-3xl min-w-0">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">Alert Preferences</h3>
          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-violet-600 accent-violet-600" />
              <span className="text-slate-800 font-medium">Email me when a new client completes onboarding</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-violet-600 accent-violet-600" />
              <span className="text-slate-800 font-medium">Send real-time alerts for custom domain SSL verification issues</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-violet-600 accent-violet-600" />
              <span className="text-slate-800 font-medium">Notify when client reaches 80% of voice receptionist quota</span>
            </label>
          </div>
        </section>
      )}
    </div>
  );
};
