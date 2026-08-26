'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { getAgencyDomainsAction, addCustomDomainAction, verifyCustomDomainAction } from '@/app/actions/agency';
import { CustomDomainRecord } from '@/lib/agency/types';
import {
  Globe,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  Copy,
  RefreshCw,
} from 'lucide-react';

export default function AgencyDomainsPage() {
  const { showToast } = useApp();
  const [domains, setDomains] = useState<CustomDomainRecord[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [adding, setAdding] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);

  const loadDomains = async () => {
    const res = await getAgencyDomainsAction();
    if (res.success && res.data) {
      setDomains(res.data);
    }
  };

  useEffect(() => {
    loadDomains();
  }, []);

  const handleAdd = async () => {
    if (!newDomain.trim()) return;
    setAdding(true);
    const res = await addCustomDomainAction(newDomain);
    setAdding(false);
    if (res.success && res.data) {
      setDomains([...domains, res.data]);
      setNewDomain('');
      showToast({ title: 'Domain Registered', description: 'Add DNS TXT record to complete verification.', type: 'info' });
    } else {
      showToast({ title: 'Invalid Domain', description: res.error || 'Failed to add domain', type: 'error' });
    }
  };

  const handleVerify = async (dom: CustomDomainRecord) => {
    setVerifying(dom.id);
    const res = await verifyCustomDomainAction(dom.id, dom.domain);
    setVerifying(null);
    if (res.success) {
      showToast({ title: 'Domain Verified', description: `Status: ${res.status}. SSL certificate active.`, type: 'info' });
      loadDomains();
    }
  };

  const copyToken = (tok: string) => {
    navigator.clipboard.writeText(tok);
    showToast({ title: 'Copied', description: 'DNS TXT verification token copied to clipboard.', type: 'info' });
  };

  return (
    <AppShell title="Custom Domains & SSL" showBack backUrl="/agency">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Banner */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-on-surface">Custom White-Label Domains</h2>
            </div>
            <p className="text-xs text-on-surface-variant">
              Host your agency workspace under your own FQDN (e.g. app.youragency.com) with automatic TLS certificate provisioning.
            </p>
          </div>
        </section>

        {/* Add Domain Input Box */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs space-y-3">
          <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">Connect New Custom Domain</label>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              placeholder="e.g. portal.myagency.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleAdd}
              isLoading={adding}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="w-full sm:w-auto text-xs shrink-0"
            >
              Add Domain
            </Button>
          </div>
        </section>

        {/* Domains List */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xs overflow-hidden divide-y divide-outline-variant/60">
          <div className="p-4 bg-surface-container-low flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Configured Domains ({domains.length})
            </h3>
            <span className="text-[11px] text-on-surface-variant font-mono">Automatic SSL Issuance</span>
          </div>

          {domains.map((dom) => {
            const isActive = dom.status === 'ACTIVE';
            return (
              <div key={dom.id} className="p-5 space-y-4 hover:bg-surface-container-low/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-on-surface font-mono">{dom.domain}</span>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> ACTIVE & SECURED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        <Clock className="w-3 h-3" /> {dom.status}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        isLoading={verifying === dom.id}
                        onClick={() => handleVerify(dom)}
                        leftIcon={<RefreshCw className="w-3 h-3" />}
                        className="text-xs"
                      >
                        Verify DNS Records
                      </Button>
                    )}
                  </div>
                </div>

                {/* Verification instructions */}
                {!isActive && (
                  <div className="p-4 bg-surface-container-high rounded-xl text-xs space-y-2 border border-outline-variant">
                    <span className="font-bold text-on-surface block">DNS Configuration Required</span>
                    <p className="text-on-surface-variant text-[11px]">
                      Add the following TXT record to your DNS provider (Cloudflare, GoDaddy, Route53):
                    </p>
                    <div className="flex items-center justify-between bg-surface-container-lowest p-2 rounded-lg font-mono text-[11px] text-on-surface border border-outline-variant">
                      <span>{dom.txtVerificationToken}</span>
                      <button
                        onClick={() => copyToken(dom.txtVerificationToken)}
                        className="text-primary hover:text-primary/80 flex items-center gap-1 text-[10px] font-bold"
                      >
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}
