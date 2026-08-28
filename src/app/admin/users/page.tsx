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
      title="Platform User Accounts"
      subtitle="Complete directory of platform superadministrators, agency operators, and small business owners."
      showBack
      backUrl="/admin"
    >
      <div className="space-y-6 max-w-full overflow-hidden">
        {/* Filter Bar */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, or tenant..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder-slate-400 min-h-[36px]"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 font-medium min-h-[36px]"
            >
              <option value="ALL">All Roles</option>
              <option value="PLATFORM_ADMIN">Platform Admin</option>
              <option value="AGENCY_OWNER">Agency Owner</option>
              <option value="AGENCY_ADMIN">Agency Admin</option>
              <option value="BUSINESS_OWNER">Business Owner</option>
            </select>
          </div>

          <span className="text-xs text-slate-500 font-mono font-semibold pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            {filtered.length} Users Listed
          </span>
        </section>

        {/* User Table */}
        <section className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[650px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Assigned Tenant</th>
                  <th className="py-3 px-4">MFA Status</th>
                  <th className="py-3 px-4 text-right">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5 whitespace-nowrap">
                      <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-100 shrink-0">
                        {u.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">{u.email}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'PLATFORM_ADMIN'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : u.role.startsWith('AGENCY')
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{u.tenant}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {u.mfa ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> ENABLED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          DISABLED
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-right whitespace-nowrap">{u.lastLogin}</td>
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
