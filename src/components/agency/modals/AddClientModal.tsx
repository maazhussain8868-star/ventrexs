'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AgencyClient } from '@/data/agencyData';
import { Building2, Mail, Phone, User, Globe, Sparkles, Check, ShieldCheck } from 'lucide-react';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClient: (newClient: Partial<AgencyClient>) => void;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onAddClient,
}) => {
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('HVAC & Climate');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState<'Starter' | 'Professional' | 'Enterprise'>('Professional');
  const [customDomain, setCustomDomain] = useState('');
  const [environment, setEnvironment] = useState<'Production US-East' | 'Production US-West' | 'Staging Pod-02'>('Production US-East');
  const [sendInvite, setSendInvite] = useState(true);
  const [loading, setLoading] = useState(false);

  const industries = [
    'HVAC & Climate',
    'Plumbing & Drains',
    'Roofing & Siding',
    'Electrical Contracting',
    'Landscaping & Tree',
    'Pest Control',
    'Garage Doors & Gates',
    'Septic & Environmental',
    'Solar & Renewable',
    'Locksmith & Security',
    'Painting & Finishing',
    'General Contracting',
  ];

  const planPrices = {
    Starter: 79,
    Professional: 149,
    Enterprise: 299,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !ownerEmail.trim()) return;

    setLoading(true);
    setTimeout(() => {
      const initials = businessName
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase() || 'CL';

      const slug = businessName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const domain = customDomain.trim() || `portal.${slug}.com`;

      onAddClient({
        name: businessName,
        slug,
        initials,
        accentColor: plan === 'Enterprise' ? '#8b5cf6' : plan === 'Professional' ? '#0284c7' : '#10b981',
        industry,
        plan,
        status: 'Provisioning',
        mrr: planPrices[plan],
        seats: plan === 'Enterprise' ? 15 : plan === 'Professional' ? 6 : 3,
        onboardingStage: 'Setup',
        onboardingProgress: 25,
        domain,
        domainStatus: 'Action Required',
        sslActive: false,
        health: 'Healthy',
        healthScore: 90,
        lastActivity: 'Client tenant provisioned. Onboarding email sent.',
        lastActivityTime: 'Just now',
        ownerName: ownerName || 'Business Owner',
        ownerEmail,
        phone: phone || '+1 (555) 000-0000',
        createdAt: new Date().toISOString().split('T')[0],
        environment,
        aiUsageCalls: 0,
        monthlyInvoices: 0,
        jobsCompleted: 0,
        storageUsedMb: 10,
      });

      setLoading(false);
      onClose();
      // Reset form
      setBusinessName('');
      setOwnerName('');
      setOwnerEmail('');
      setPhone('');
      setCustomDomain('');
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Provision New Client Tenant"
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-on-surface-variant font-mono">
            Plan MRR: <span className="font-bold text-emerald-600 dark:text-emerald-400">${planPrices[plan]}/mo</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              isLoading={loading}
              leftIcon={<Building2 className="w-3.5 h-3.5" />}
              className="text-xs bg-primary text-on-primary font-bold shadow-sm"
            >
              Provision Client
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-on-surface text-xs">Multi-Tenant Business Workspace</p>
            <p className="text-[11px] text-on-surface-variant">
              Provisions an isolated customer environment, database schema, AI receptionist instance, and billing ledger.
            </p>
          </div>
        </div>

        {/* Business Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-on-surface mb-1">Business Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Comfort HVAC"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant rounded-xl px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-on-surface mb-1">Industry / Trade</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant rounded-xl px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-xs"
            >
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Owner Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-on-surface mb-1">Owner Full Name</label>
            <input
              type="text"
              placeholder="e.g. Marcus Sterling"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant rounded-xl px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-on-surface mb-1">Owner Email *</label>
            <input
              type="email"
              required
              placeholder="marcus@apexcomfort.com"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant rounded-xl px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-on-surface mb-1">Phone Number</label>
            <input
              type="text"
              placeholder="+1 (555) 234-5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant rounded-xl px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-xs"
            />
          </div>
        </div>

        {/* Subscription Plan Tier Selector */}
        <div>
          <label className="block font-bold text-on-surface mb-1.5">Reseller Plan Tier</label>
          <div className="grid grid-cols-3 gap-2">
            {(['Starter', 'Professional', 'Enterprise'] as const).map((tier) => {
              const isSelected = plan === tier;
              return (
                <button
                  type="button"
                  key={tier}
                  onClick={() => setPlan(tier)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-xs'
                      : 'border-outline-variant bg-surface-container-low hover:bg-surface-container-high'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-on-surface">{tier}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                  </div>
                  <div className="mt-1 text-base font-extrabold font-mono text-on-surface">
                    ${planPrices[tier]}
                    <span className="text-[10px] text-on-surface-variant font-normal">/mo</span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">
                    {tier === 'Enterprise'
                      ? '15 seats • Unlimited AI'
                      : tier === 'Professional'
                      ? '6 seats • 1000 AI calls'
                      : '3 seats • Core tools'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Domain & Deployment Cluster */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-on-surface mb-1">Custom Domain FQDN (Optional)</label>
            <input
              type="text"
              placeholder="e.g. portal.clientdomain.com"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant rounded-xl px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-xs font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-on-surface mb-1">Deployment Cluster</label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as any)}
              className="w-full bg-surface-container-high border border-outline-variant rounded-xl px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-xs"
            >
              <option value="Production US-East">Production Multi-Tenant Pod (US-East)</option>
              <option value="Production US-West">Production Multi-Tenant Pod (US-West)</option>
              <option value="Staging Pod-02">Staging Sandboxed Pod-02</option>
            </select>
          </div>
        </div>

        {/* Auto Send Invite Checkbox */}
        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-on-surface">
            <input
              type="checkbox"
              checked={sendInvite}
              onChange={(e) => setSendInvite(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
            />
            <span>Send automated onboarding welcome email & magic login token to owner</span>
          </label>
        </div>
      </form>
    </Modal>
  );
};
