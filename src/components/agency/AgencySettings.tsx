'use client';

import React, { useState } from 'react';
import { initialAgencyTeam, AgencyTeamMember } from '@/data/agencyData';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useApp } from '@/context/AppContext';
import {
  Settings,
  Users,
  ShieldCheck,
  Key,
  Webhook,
  Plus,
  Save,
  Check,
  Building2,
  Mail,
  Copy,
  ExternalLink,
} from 'lucide-react';

export const AgencySettings: React.FC = () => {
  const { showToast } = useApp();

  const [team, setTeam] = useState<AgencyTeamMember[]>(initialAgencyTeam);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Account Manager' | 'Support Specialist'>('Account Manager');
  const [saving, setSaving] = useState(false);

  const [agencyProfile, setAgencyProfile] = useState({
    name: 'Apex Growth Marketing',
    ownerName: 'Sarah Jenkins',
    email: 'owner@apexgrowth.agency',
    phone: '+1 (555) 019-2834',
    website: 'https://apexgrowth.agency',
    timezone: 'America/New_York (EST)',
    currency: 'USD ($)',
  });

  const [apiKey, setApiKey] = useState('vntrx_live_9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d');
  const [copiedKey, setCopiedKey] = useState(false);

  const handleSaveProfile = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast({ title: 'Agency Settings Saved', description: 'Organization metadata updated.', type: 'info' });
    }, 400);
  };

  const handleInviteTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const newMember: AgencyTeamMember = {
      id: `team_${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail.trim(),
      role: inviteRole,
      status: 'Invited',
      lastActive: 'Invitation sent',
      assignedClientsCount: 0,
    };

    setTeam([...team, newMember]);
    setIsInviteModalOpen(false);
    setInviteEmail('');
    showToast({ title: 'Team Member Invited', description: `Invitation sent to ${inviteEmail}`, type: 'info' });
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
    showToast({ title: 'Copied API Key', type: 'info' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Agency Settings & Reseller Administration
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/30 font-mono">
              Partner Hub
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure your reseller organization, manage team access privileges, review tenant quotas, and manage API keys.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSaveProfile}
          isLoading={saving}
          leftIcon={<Save className="w-3.5 h-3.5" />}
          className="text-xs font-bold bg-primary text-white"
        >
          Save Settings
        </Button>
      </div>

      {/* 2-Column: Agency Profile & Reseller Tier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Organization Profile */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0a0f1d] border border-outline-variant/50 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Agency Organization Profile
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Agency Name</label>
              <input
                type="text"
                value={agencyProfile.name}
                onChange={(e) => setAgencyProfile({ ...agencyProfile, name: e.target.value })}
                className="w-full bg-[#070b14] border border-outline-variant/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Owner Contact Name</label>
              <input
                type="text"
                value={agencyProfile.ownerName}
                onChange={(e) => setAgencyProfile({ ...agencyProfile, ownerName: e.target.value })}
                className="w-full bg-[#070b14] border border-outline-variant/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Agency Contact Email</label>
              <input
                type="email"
                value={agencyProfile.email}
                onChange={(e) => setAgencyProfile({ ...agencyProfile, email: e.target.value })}
                className="w-full bg-[#070b14] border border-outline-variant/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Contact Phone</label>
              <input
                type="text"
                value={agencyProfile.phone}
                onChange={(e) => setAgencyProfile({ ...agencyProfile, phone: e.target.value })}
                className="w-full bg-[#070b14] border border-outline-variant/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Agency Website</label>
              <input
                type="text"
                value={agencyProfile.website}
                onChange={(e) => setAgencyProfile({ ...agencyProfile, website: e.target.value })}
                className="w-full bg-[#070b14] border border-outline-variant/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Timezone</label>
              <input
                type="text"
                value={agencyProfile.timezone}
                onChange={(e) => setAgencyProfile({ ...agencyProfile, timezone: e.target.value })}
                className="w-full bg-[#070b14] border border-outline-variant/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right: Reseller Plan & Quota Tier */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0a0f1d] border border-outline-variant/50 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Current Reseller Tier
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/30">
                Agency Growth
              </span>
            </div>

            <div className="p-4 bg-[#070b14] rounded-2xl border border-outline-variant/40 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Total Client Tenant Limit</span>
                <span className="font-bold text-white">25 Tenants</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Active Used Seats</span>
                <span className="font-bold text-emerald-400">14 / 25</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">White-Label Branding</span>
                <span className="font-bold text-primary">Full White-Label</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Custom Domains</span>
                <span className="font-bold text-primary">Unlimited FQDNs</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-primary/20 to-purple-500/10 rounded-2xl border border-primary/30 flex items-center justify-between">
            <div>
              <span className="font-bold text-xs text-white block">Upgrade to Enterprise Reseller</span>
              <span className="text-[11px] text-slate-300">100 client tenants • Dedicated VPS pod</span>
            </div>
            <Button variant="primary" size="sm" className="text-xs shrink-0 font-bold">
              Upgrade
            </Button>
          </div>
        </div>
      </div>

      {/* Agency Team Members */}
      <div className="rounded-3xl bg-[#0a0f1d] border border-outline-variant/50 overflow-hidden shadow-xs">
        <div className="p-5 bg-[#070b14] border-b border-outline-variant/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Agency Team & Role-Based Access ({team.length})
            </h3>
            <p className="text-xs text-slate-400">
              Manage account managers, administrators, and support specialists.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsInviteModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs border-outline-variant/60 text-slate-300 hover:text-white"
          >
            Invite Team Member
          </Button>
        </div>

        <div className="divide-y divide-outline-variant/40">
          {team.map((member) => (
            <div
              key={member.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-surface-container-low/30 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{member.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 font-mono">
                      {member.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{member.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-slate-400 font-mono text-xs">
                <span>{member.assignedClientsCount} Clients Assigned</span>
                <span className="text-slate-300">{member.lastActive}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Keys & Webhooks */}
      <div className="p-6 rounded-3xl bg-[#0a0f1d] border border-outline-variant/50 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Agency API Key & CRM Webhook Secrets
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          <p className="text-slate-400">
            Use your agency bearer token to automate client provisioning via Zapier, Make, or custom REST webhooks.
          </p>

          <div className="p-3 bg-[#070b14] rounded-xl border border-outline-variant/60 flex items-center justify-between font-mono text-xs">
            <span className="text-slate-300 truncate pr-2">{apiKey}</span>
            <button
              onClick={copyApiKey}
              className="p-1.5 rounded-lg bg-surface-container text-primary font-bold hover:bg-surface-container-high flex items-center gap-1 shrink-0 text-[11px]"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Agency Team Member"
        maxWidth="md"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleInviteTeam} className="text-xs">
              Send Invitation
            </Button>
          </div>
        }
      >
        <form onSubmit={handleInviteTeam} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Team Member Email *</label>
            <input
              type="email"
              required
              placeholder="colleague@apexgrowth.agency"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full bg-[#070b14] border border-outline-variant/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Agency Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="w-full bg-[#070b14] border border-outline-variant/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary"
            >
              <option value="Admin">Agency Admin (Full access to all clients & settings)</option>
              <option value="Account Manager">Account Manager (Manage assigned client businesses)</option>
              <option value="Support Specialist">Support Specialist (Read-only / Tier-1 support)</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};
