'use client';

import React, { useState } from 'react';
import { AgencyDomainItem } from '@/data/agencyData';
import { Button } from '@/components/ui/Button';
import {
  Globe,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Lock,
  ExternalLink,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface AgencyDomainsProps {
  domains: AgencyDomainItem[];
  onAddDomain?: (domainName: string, clientName: string) => void;
  onVerifyDomain?: (domainId: string) => void;
}

export const AgencyDomains: React.FC<AgencyDomainsProps> = ({
  domains,
  onAddDomain,
  onVerifyDomain,
}) => {
  const { showToast } = useApp();
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const handleVerify = (id: string, domainName: string) => {
    setVerifyingId(id);
    if (onVerifyDomain) onVerifyDomain(id);
    setTimeout(() => {
      setVerifyingId(null);
      showToast({
        title: 'DNS Verified',
        description: `SSL certificate and CNAME records verified for ${domainName}.`,
        type: 'success',
      });
    }, 800);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
      case 'Connected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> SSL ACTIVE
          </span>
        );
      case 'Pending DNS':
      case 'Action Required':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            <Clock className="w-3 h-3" /> DNS REQUIRED
          </span>
        );
      case 'SSL Provisioning':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            <RefreshCw className="w-3 h-3 animate-spin" /> VERIFYING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
            <AlertTriangle className="w-3 h-3" /> ERROR
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Custom Domains & SSL Provisioning</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage branded customer domains, automatic TLS certificate renewals, and DNS verification records.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            if (onAddDomain) onAddDomain('portal.newclient.com', 'New Client');
            showToast({ title: 'Add Domain', description: 'Enter custom CNAME target.', type: 'info' });
          }}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          className="text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-xs"
        >
          + Add Domain
        </Button>
      </div>

      {/* Domain Registry Table */}
      <section className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Domain Verification Registry ({domains.length})
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">CNAME: cname.ventrexs.com</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Custom Domain</th>
                <th className="py-3 px-4">Client Tenant</th>
                <th className="py-3 px-4">SSL Status</th>
                <th className="py-3 px-4">DNS Record</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Checked</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {domains.map((dom) => (
                <tr key={dom.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-violet-600" />
                    <span>{dom.domain}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{dom.clientName}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                      <Lock className="w-3 h-3 text-emerald-600" /> {dom.sslStatus || 'Active (TLS 1.3)'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                    CNAME &rarr; {dom.cnameTarget || 'cname.ventrexs.com'}
                  </td>
                  <td className="py-3.5 px-4">{getStatusBadge(dom.status)}</td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono">{dom.lastChecked || 'Today, 12:40 UTC'}</td>
                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerify(dom.id, dom.domain)}
                      disabled={verifyingId === dom.id}
                      leftIcon={<RefreshCw className={`w-3 h-3 ${verifyingId === dom.id ? 'animate-spin' : ''}`} />}
                      className="text-xs bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
                    >
                      {verifyingId === dom.id ? 'Verifying...' : 'Check DNS'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
