'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { AgencyClient, AgencyDomainItem, AgencyDeployment } from '@/data/agencyData';
import { AgencyNavTab } from '../AgencySidebar';
import {
  Search,
  Building2,
  Globe,
  Server,
  Layers,
  ArrowRight,
  Plus,
  Palette,
  CreditCard,
  HeartPulse,
  Settings,
  Sparkles,
} from 'lucide-react';

interface AgencySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: AgencyClient[];
  domains: AgencyDomainItem[];
  deployments: AgencyDeployment[];
  onSelectTab: (tab: AgencyNavTab) => void;
  onSelectClient: (client: AgencyClient) => void;
  onOpenAddClient: () => void;
}

export const AgencySearchModal: React.FC<AgencySearchModalProps> = ({
  isOpen,
  onClose,
  clients,
  domains,
  deployments,
  onSelectTab,
  onSelectClient,
  onOpenAddClient,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle from parent or open
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.industry.toLowerCase().includes(query.toLowerCase()) ||
      c.ownerEmail.toLowerCase().includes(query.toLowerCase()) ||
      c.domain.toLowerCase().includes(query.toLowerCase())
  );

  const filteredDomains = domains.filter((d) =>
    d.domain.toLowerCase().includes(query.toLowerCase()) ||
    d.clientName.toLowerCase().includes(query.toLowerCase())
  );

  const quickActions = [
    { label: '+ Add New Client Tenant', icon: <Plus className="w-4 h-4 text-primary" />, action: () => { onClose(); onOpenAddClient(); } },
    { label: 'White-Label Branding Suite', icon: <Palette className="w-4 h-4 text-purple-500" />, action: () => { onClose(); onSelectTab('whitelabel'); } },
    { label: 'Domain Management & DNS', icon: <Globe className="w-4 h-4 text-sky-500" />, action: () => { onClose(); onSelectTab('domains'); } },
    { label: 'SaaS Revenue & MRR Growth', icon: <CreditCard className="w-4 h-4 text-emerald-500" />, action: () => { onClose(); onSelectTab('revenue'); } },
    { label: 'Client Usage & Health Radar', icon: <HeartPulse className="w-4 h-4 text-amber-500" />, action: () => { onClose(); onSelectTab('health'); } },
    { label: 'Deployment Center Telemetry', icon: <Server className="w-4 h-4 text-indigo-500" />, action: () => { onClose(); onSelectTab('deployments'); } },
    { label: 'Agency Settings & Team', icon: <Settings className="w-4 h-4 text-slate-400" />, action: () => { onClose(); onSelectTab('settings'); } },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="space-y-4">
        {/* Search Input Box */}
        <div className="relative">
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            autoFocus
            placeholder="Search clients, domains, deployments, or commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-surface-container-high border border-outline-variant rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary font-medium"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
            ESC to close
          </span>
        </div>

        {/* Results Stream */}
        <div className="max-h-96 overflow-y-auto space-y-4 pr-1 text-xs">
          {/* Quick Commands */}
          {!query && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-2 block">
                Quick Command Navigation
              </span>
              <div className="space-y-0.5">
                {quickActions.map((qa, i) => (
                  <button
                    key={i}
                    onClick={qa.action}
                    className="w-full p-2.5 rounded-xl hover:bg-surface-container-low flex items-center justify-between text-on-surface font-medium transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      {qa.icon}
                      <span>{qa.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-on-surface-variant" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Client Businesses Results */}
          {filteredClients.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-2 block">
                Client Tenants ({filteredClients.length})
              </span>
              <div className="space-y-1">
                {filteredClients.slice(0, 5).map((client) => (
                  <button
                    key={client.id}
                    onClick={() => {
                      onClose();
                      onSelectClient(client);
                    }}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-high border border-outline-variant/40 flex items-center justify-between transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] text-white"
                        style={{ backgroundColor: client.accentColor }}
                      >
                        {client.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-on-surface">{client.name}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary">
                            {client.plan}
                          </span>
                        </div>
                        <span className="text-[10px] text-on-surface-variant font-mono">
                          {client.domain} • ${client.mrr}/mo
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          client.health === 'Healthy'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : client.health === 'Needs Attention'
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-red-500/10 text-red-600'
                        }`}
                      >
                        {client.health}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-on-surface-variant" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Domains Results */}
          {filteredDomains.length > 0 && query && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-2 block">
                Custom Domains ({filteredDomains.length})
              </span>
              <div className="space-y-1">
                {filteredDomains.slice(0, 4).map((dom) => (
                  <button
                    key={dom.id}
                    onClick={() => {
                      onClose();
                      onSelectTab('domains');
                    }}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-high border border-outline-variant/40 flex items-center justify-between transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-sky-500" />
                      <div>
                        <span className="font-bold text-on-surface font-mono">{dom.domain}</span>
                        <span className="text-[10px] text-on-surface-variant block">{dom.clientName}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold font-mono text-on-surface-variant">{dom.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && filteredClients.length === 0 && filteredDomains.length === 0 && (
            <div className="text-center py-6 text-on-surface-variant text-xs">
              No matching client businesses or domains found for "{query}".
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
