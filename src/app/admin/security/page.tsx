'use client';

import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Lock, ShieldCheck, Key, Eye, AlertTriangle, CheckCircle2, UserCheck } from 'lucide-react';

export default function AdminSecurityPage() {
  const securityPolicies = [
    { title: 'Mandatory Platform MFA', status: 'Enforced', desc: 'Hardware security keys (WebAuthn) and TOTP authenticator required for superadmin logins.' },
    { title: 'Two-Person Owner Approval Gate', status: 'Active', desc: 'Cryptographic demo links and sensitive platform overrides require 2 distinct owner sign-offs.' },
    { title: 'Server-Side RLS Isolation', status: 'Enforced', desc: 'Strict database Row-Level Security ensuring tenant boundaries cannot be breached via API client injection.' },
    { title: 'Google Play Purchase Token Hashing', status: 'Active', desc: 'Tokens hashed via SHA-256 (google_purchase_token_hash) to guarantee zero plain-text storage.' },
    { title: 'Zero Secret Exposure Guarantee', status: 'Compliant', desc: 'Environment diagnostics and audit logs never print or return raw credentials.' },
  ];

  return (
    <AdminLayout
      title="Platform Security Posture & Access Controls"
      subtitle="Cryptographic enforcement policies, MFA requirements, and tenant boundary invariant monitors."
      showBack
      backUrl="/admin"
    >
      <div className="space-y-6">
        <section className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden divide-y divide-slate-100">
          {securityPolicies.map((p, idx) => (
            <div key={idx} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">{p.title}</h3>
                </div>
                <p className="text-xs text-slate-500 max-w-2xl">{p.desc}</p>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" /> {p.status}
              </span>
            </div>
          ))}
        </section>
      </div>
    </AdminLayout>
  );
}
