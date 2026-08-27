'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AgencyClient } from '@/data/agencyData';
import {
  Building2,
  Globe,
  Sliders,
  ShieldCheck,
  CreditCard,
  Bot,
  MessageSquare,
  FileText,
  Star,
  Sparkles,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface ManageClientModalProps {
  client: AgencyClient | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateClient: (updated: AgencyClient) => void;
  onSwitchContext: (client: AgencyClient) => void;
}

export const ManageClientModal: React.FC<ManageClientModalProps> = ({
  client,
  isOpen,
  onClose,
  onUpdateClient,
  onSwitchContext,
}) => {
  if (!client) return null;

  const [name, setName] = useState(client.name);
  const [ownerEmail, setOwnerEmail] = useState(client.ownerEmail);
  const [plan, setPlan] = useState<'Starter' | 'Professional' | 'Enterprise'>(client.plan);
  const [status, setStatus] = useState<'Active' | 'Trial' | 'Provisioning' | 'Suspended'>(client.status);
  const [health, setHealth] = useState<'Healthy' | 'Needs Attention' | 'At Risk'>(client.health);
  const [domain, setDomain] = useState(client.domain);
  const [saving, setSaving] = useState(false);

  // Feature flags
  const [flags, setFlags] = useState({
    aiReceptionist: true,
    smsDispatch: true,
    reputationReviews: true,
    invoiceAutomation: true,
    ownerAiRadar: client.plan === 'Enterprise',
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      const planPrices = { Starter: 19, Professional: 49, Enterprise: 199 };
      onUpdateClient({
        ...client,
        name,
        ownerEmail,
        plan,
        status,
        health,
        domain,
        mrr: planPrices[plan],
      });
      setSaving(false);
      onClose();
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Client: ${client.name}`}
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSwitchContext(client)}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="text-xs bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 font-bold"
          >
            Enter Customer Workspace
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-600">
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} isLoading={saving} className="text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white">
              Save Changes
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 text-xs text-slate-800">
        {/* Tenant Header Pill */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-2xs"
              style={{ backgroundColor: client.accentColor || '#6366f1' }}
            >
              {client.initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">{client.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 font-bold">
                  {client.businessId}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                {client.industry} &bull; Created {client.createdAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono">
              MRR: <span className="font-bold text-emerald-600">${client.mrr}/mo</span>
            </div>
          </div>
        </div>

        {/* Core Configuration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Business Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Primary Owner Email</label>
            <input
              type="email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 font-medium"
            />
          </div>
        </div>

        {/* Tier & Status Adjustments */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Plan Tier</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-violet-500 font-medium"
            >
              <option value="Starter">Starter ($19/mo)</option>
              <option value="Professional">Professional ($49/mo)</option>
              <option value="Enterprise">Enterprise ($199/mo)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Client Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-violet-500 font-medium"
            >
              <option value="Active">Active</option>
              <option value="Trial">Trial</option>
              <option value="Provisioning">Provisioning</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Health Category</label>
            <select
              value={health}
              onChange={(e) => setHealth(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-violet-500 font-medium"
            >
              <option value="Healthy">Healthy (Green)</option>
              <option value="Needs Attention">Needs Attention (Amber)</option>
              <option value="At Risk">At Risk (Red)</option>
            </select>
          </div>
        </div>

        {/* Custom Domain */}
        <div>
          <label className="block font-bold text-slate-800 mb-1">Custom Domain FQDN</label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs font-mono focus:outline-none focus:border-violet-500 font-medium"
          />
        </div>

        {/* Feature Flags Suite */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            Feature Flags & Entitlements
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors">
              <div className="flex items-center gap-2.5">
                <Bot className="w-4 h-4 text-violet-600" />
                <div>
                  <span className="font-bold text-slate-900 block">AI Receptionist</span>
                  <span className="text-[10px] text-slate-500">24/7 voice triage & booking</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={flags.aiReceptionist}
                onChange={(e) => setFlags({ ...flags, aiReceptionist: e.target.checked })}
                className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 accent-violet-600"
              />
            </label>

            <label className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <div>
                  <span className="font-bold text-slate-900 block">SMS & WhatsApp Dispatch</span>
                  <span className="text-[10px] text-slate-500">Automated job notifications</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={flags.smsDispatch}
                onChange={(e) => setFlags({ ...flags, smsDispatch: e.target.checked })}
                className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 accent-violet-600"
              />
            </label>

            <label className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors">
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-amber-500" />
                <div>
                  <span className="font-bold text-slate-900 block">Reputation & Reviews</span>
                  <span className="text-[10px] text-slate-500">Google Reviews automation</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={flags.reputationReviews}
                onChange={(e) => setFlags({ ...flags, reputationReviews: e.target.checked })}
                className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 accent-violet-600"
              />
            </label>

            <label className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="font-bold text-slate-900 block">Owner AI Opportunity Radar</span>
                  <span className="text-[10px] text-slate-500">Revenue expansion insights</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={flags.ownerAiRadar}
                onChange={(e) => setFlags({ ...flags, ownerAiRadar: e.target.checked })}
                className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 accent-violet-600"
              />
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
};
