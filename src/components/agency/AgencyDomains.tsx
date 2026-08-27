'use client';

import React, { useState } from 'react';
import { AgencyDomainItem } from '@/data/agencyData';
import { Button } from '@/components/ui/Button';
import { DnsInspectorModal } from './modals/DnsInspectorModal';
import { useApp } from '@/context/AppContext';
import {
  Globe,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Copy,
  ExternalLink,
  Search,
  Check,
} from 'lucide-react';

interface AgencyDomainsProps {
  domains: AgencyDomainItem[];
  onAddDomain: (domainName: string, clientName: string) => void;
  onVerifyDomain: (domainId: string) => void;
}

export const AgencyDomains: React.FC<AgencyDomainsProps> = ({
  domains,
  onAddDomain,
  onVerifyDomain,
}) => {
  const { showToast } = useApp();
  const [selectedDomainForInspect, setSelectedDomainForInspect] = useState<AgencyDomainItem | null>(null);
  const [search, setSearch] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const filtered = domains.filter(
    (d) =>
      d.domain.toLowerCase().includes(search.toLowerCase()) ||
      d.clientName.toLowerCase().includes(search.toLowerCase()) ||
      d.dnsProvider.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    setIsAdding(true);
    setTimeout(() => {
      onAddDomain(newDomain.trim(), newClientName || 'Unassigned Tenant');
      setNewDomain('');
      setNewClientName('');
      setIsAdding(false);
      showToast({
        title: 'Custom Domain Registered',
        description: 'DNS TXT and CNAME verification records generated.',
        type: 'info',
      });
    }, 400);
  };

  const handleTriggerVerify = (id: string) => {
    setVerifyingId(id);
    setTimeout(() => {
      onVerifyDomain(id);
      setVerifyingId(null);
      showToast({
        title: 'Domain Verified & Active',
        description: 'TLS 1.3 certificate issued. Edge Anycast routing active.',
        type: 'info',
      });
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Custom Domain Center & Automated TLS
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
              Auto SSL Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Map custom fully qualified domain names (FQDNs) to client tenants with automatic Let's Encrypt TLS 1.3 cert issuance.
          </p>
        </div>
      </div>

      {/* Add New Custom Domain Box */}
      <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 space-y-3 shadow-xs">
        <span className="block text-xs font-bold text-white uppercase tracking-wider">
          Connect New Custom Tenant FQDN
        </span>

        <form onSubmit={handleAddNew} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <input
              type="text"
              required
              placeholder="e.g. portal.apexcomfort.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="w-full bg-[#070b14] border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-mono placeholder-slate-500"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Tenant Name (e.g. Apex Comfort HVAC)"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              className="w-full bg-[#070b14] border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary placeholder-slate-500"
            />
          </div>

          <div>
            <Button
              variant="primary"
              size="sm"
              isLoading={isAdding}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="w-full text-xs font-bold bg-primary text-white"
            >
              Add Custom Domain
            </Button>
          </div>
        </form>
      </div>

      {/* Domain List & Search */}
      <div className="space-y-4">
        {/* Search */}
        <div className="p-3 bg-[#0a0f1d] rounded-2xl border border-outline-variant/50 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search domains or clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#070b14] border border-outline-variant/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary placeholder-slate-500 font-mono"
            />
          </div>

          <span className="text-xs text-slate-400 font-mono">
            {filtered.length} Configured Domains
          </span>
        </div>

        {/* Domains Table */}
        <div className="rounded-2xl bg-[#0a0f1d] border border-outline-variant/50 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#070b14] border-b border-outline-variant/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Client Tenant</th>
                  <th className="py-3.5 px-4">Custom Domain</th>
                  <th className="py-3.5 px-4">SSL Status</th>
                  <th className="py-3.5 px-4">DNS Provider</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Last Checked</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {filtered.map((dom) => (
                  <tr key={dom.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{dom.clientName}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-400 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-sky-400" />
                      {dom.domain}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1 text-slate-300 font-mono text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        {dom.sslStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{dom.dnsProvider}</td>
                    <td className="py-3.5 px-4">
                      {dom.status === 'Connected' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Connected
                        </span>
                      )}
                      {dom.status === 'Pending DNS' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Pending DNS
                        </span>
                      )}
                      {dom.status === 'SSL Provisioning' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          SSL Provisioning
                        </span>
                      )}
                      {dom.status === 'Action Required' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                          Action Required
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {dom.lastChecked}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDomainForInspect(dom)}
                        className="text-xs text-slate-300 hover:text-white"
                      >
                        DNS Records
                      </Button>
                      {dom.status !== 'Connected' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTriggerVerify(dom.id)}
                          isLoading={verifyingId === dom.id}
                          leftIcon={<RefreshCw className="w-3 h-3" />}
                          className="text-xs text-primary border-primary/40"
                        >
                          Verify
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DNS Record Inspector Modal */}
      <DnsInspectorModal
        domainItem={selectedDomainForInspect}
        isOpen={Boolean(selectedDomainForInspect)}
        onClose={() => setSelectedDomainForInspect(null)}
        onVerify={handleTriggerVerify}
      />
    </div>
  );
};
