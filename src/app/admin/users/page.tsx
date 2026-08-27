'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Users, Search, ShieldCheck, CheckCircle2, Lock, Mail, Key } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const usersList = [
    { id: 'usr_01', name: 'Alexander Vance', email: 'owner1@ventrexs.com', role: 'PLATFORM_ADMIN', mfa: true, lastLogin: '10m ago', tenant: 'Platform Superadmin' },
    { id: 'usr_02', name: 'Marcus Sterling', email: 'owner2@ventrexs.com', role: 'PLATFORM_ADMIN', mfa: true, lastLogin: '1h ago', tenant: 'Platform Superadmin' },
    { id: 'usr_03', name: 'David Miller', email: 'david@apexmarketing.io', role: 'AGENCY_OWNER', mfa: true, lastLogin: '2h ago', tenant: 'Apex Growth Marketing' },
    { id: 'usr_04', name: 'Elena Rostova', email: 'elena@tradescale.com', role: 'AGENCY_ADMIN', mfa: true, lastLogin: '5h ago', tenant: 'TradeScale Reseller' },
    { id: 'usr_05', name: 'John Doe', email: 'service@apexhvac.com', role: 'BUSINESS_OWNER', mfa: false, lastLogin: '1d ago', tenant: 'Apex Precision HVAC' },
    { id: 'usr_06', name: 'Sarah Jenkins', email: 'contact@precisionroofing.com', role: 'BUSINESS_ADMIN', mfa: true, lastLogin: '3d ago', tenant: 'Precision Roofing & Siding' },
  ];

  const filtered = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.tenant.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <AdminLayout
      title="Platform User Accounts & Identity Directory"
      subtitle="Complete registry of platform administrators, agency resellers, and business operators."
      showBack
      backUrl="/admin"
    >
      <div className="space-y-6">
        {/* Filter Bar */}
        <section className="bg-[#0a0f1d] border border-outline-variant/40 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, or tenant..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#070b14] border border-outline-variant/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-primary placeholder-slate-500"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs bg-[#070b14] border border-outline-variant/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Roles</option>
              <option value="PLATFORM_ADMIN">Platform Admin</option>
              <option value="AGENCY_OWNER">Agency Owner</option>
              <option value="AGENCY_ADMIN">Agency Admin</option>
              <option value="BUSINESS_OWNER">Business Owner</option>
            </select>
          </div>

          <span className="text-xs text-slate-400 font-mono">{filtered.length} Users Listed</span>
        </section>

        {/* User Table */}
        <section className="bg-[#0a0f1d] border border-outline-variant/40 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#070b14] border-b border-outline-variant/40 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">User Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Assigned Tenant</th>
                  <th className="p-4">MFA Status</th>
                  <th className="p-4">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 text-slate-200">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                        {u.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="p-4 font-mono text-slate-300">{u.email}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'PLATFORM_ADMIN'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : u.role.startsWith('AGENCY')
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">{u.tenant}</td>
                    <td className="p-4">
                      {u.mfa ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Enforced
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Optional</span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-slate-400">{u.lastLogin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
