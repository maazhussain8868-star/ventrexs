'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AgencyDomainItem } from '@/data/agencyData';
import { Globe, Copy, Check, ShieldCheck, AlertCircle, RefreshCw, Server, ExternalLink } from 'lucide-react';

interface DnsInspectorModalProps {
  domainItem: AgencyDomainItem | null;
  isOpen: boolean;
  onClose: () => void;
  onVerify: (id: string) => void;
}

export const DnsInspectorModal: React.FC<DnsInspectorModalProps> = ({
  domainItem,
  isOpen,
  onClose,
  onVerify,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  if (!domainItem) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      onVerify(domainItem.id);
      setVerifying(false);
    }, 800);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`DNS Configuration: ${domainItem.domain}`}
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-[11px] text-on-surface-variant font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Ventrex Edge Anycast Routing
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleVerify}
              isLoading={verifying}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Check DNS Propagation
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 text-xs">
        {/* Status Header Banner */}
        <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/60 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <span className="font-bold text-sm text-on-surface font-mono">{domainItem.domain}</span>
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Tenant: <span className="font-semibold text-on-surface">{domainItem.clientName}</span> • Provider: {domainItem.dnsProvider}
            </p>
          </div>

          <div>
            {domainItem.status === 'Connected' ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" /> SECURE & ACTIVE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <AlertCircle className="w-3.5 h-3.5" /> {domainItem.status.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-on-surface-variant text-xs space-y-1">
          <p className="font-bold text-on-surface">DNS Records to Configure</p>
          <p>
            Add the following DNS records at your domain registrar or DNS management dashboard ({domainItem.dnsProvider}):
          </p>
        </div>

        {/* Records Table */}
        <div className="space-y-3">
          {/* CNAME Record */}
          <div className="p-3.5 bg-surface-container-high rounded-xl border border-outline-variant/80 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-primary/20 text-primary font-mono text-[10px] font-extrabold">
                  CNAME
                </span>
                Subdomain Alias Record
              </span>
              <span className="text-on-surface-variant font-mono">TTL: Auto / 300s</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-surface-container-lowest p-2 rounded-lg border border-outline-variant">
                <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Host / Name</span>
                <span className="font-mono font-semibold text-on-surface">
                  {domainItem.domain.split('.')[0] || 'portal'}
                </span>
              </div>
              <div className="bg-surface-container-lowest p-2 rounded-lg border border-outline-variant flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Value / Target</span>
                  <span className="font-mono font-semibold text-on-surface">{domainItem.cnameTarget}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(domainItem.cnameTarget, 'cname')}
                  className="p-1 rounded hover:bg-surface-container text-primary text-xs flex items-center gap-1"
                >
                  {copiedKey === 'cname' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* TXT Verification Record */}
          <div className="p-3.5 bg-surface-container-high rounded-xl border border-outline-variant/80 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-mono text-[10px] font-extrabold">
                  TXT
                </span>
                Ownership & SSL Validation Record
              </span>
              <span className="text-on-surface-variant font-mono">TTL: Auto</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-surface-container-lowest p-2 rounded-lg border border-outline-variant">
                <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Host / Name</span>
                <span className="font-mono font-semibold text-on-surface">_ventrexs-challenge</span>
              </div>
              <div className="bg-surface-container-lowest p-2 rounded-lg border border-outline-variant flex items-center justify-between">
                <div className="truncate pr-2">
                  <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Value / Text</span>
                  <span className="font-mono font-semibold text-on-surface truncate block">
                    {domainItem.txtRecord}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(domainItem.txtRecord, 'txt')}
                  className="p-1 rounded hover:bg-surface-container text-primary text-xs flex items-center gap-1 shrink-0"
                >
                  {copiedKey === 'txt' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Apex A Record (Optional fallback) */}
          <div className="p-3.5 bg-surface-container-high rounded-xl border border-outline-variant/80 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-extrabold">
                  A
                </span>
                Direct Anycast IPv4 (Apex Domain Option)
              </span>
              <span className="text-on-surface-variant font-mono">TTL: 300s</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-surface-container-lowest p-2 rounded-lg border border-outline-variant">
                <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Host / Name</span>
                <span className="font-mono font-semibold text-on-surface">@ (root)</span>
              </div>
              <div className="bg-surface-container-lowest p-2 rounded-lg border border-outline-variant flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-on-surface-variant block uppercase font-bold">IPv4 Address</span>
                  <span className="font-mono font-semibold text-on-surface">{domainItem.aRecord}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(domainItem.aRecord, 'a')}
                  className="p-1 rounded hover:bg-surface-container text-primary text-xs flex items-center gap-1"
                >
                  {copiedKey === 'a' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SSL Status Info */}
        <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-on-surface">
              SSL / TLS Status: <strong className="text-emerald-600 dark:text-emerald-400">{domainItem.sslStatus}</strong>
            </span>
          </div>
          <span className="text-on-surface-variant font-mono text-[11px]">
            Expires: {domainItem.sslExpires}
          </span>
        </div>
      </div>
    </Modal>
  );
};
