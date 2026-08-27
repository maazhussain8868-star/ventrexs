'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  RefreshCw,
  TrendingUp,
  Activity,
  Layers,
  Bot,
  ShieldCheck,
  Lock,
  Settings,
  Key,
  Database,
  Globe,
  Radio,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Overview & Telemetry',
      href: '/admin',
      icon: <LayoutDashboard className="w-4 h-4" />,
      exact: true,
    },
    {
      label: 'Tenant Businesses',
      href: '/admin/businesses',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      label: 'Agencies & Resellers',
      href: '/admin/agencies',
      icon: <Globe className="w-4 h-4 text-primary" />,
    },
    {
      label: 'Platform Users',
      href: '/admin/users',
      icon: <Users className="w-4 h-4" />,
    },
    {
      label: 'SaaS Subscriptions',
      href: '/admin/subscriptions',
      icon: <CreditCard className="w-4 h-4 text-emerald-400" />,
    },
    {
      label: 'Payment Ledger',
      href: '/admin/payments',
      icon: <CreditCard className="w-4 h-4 text-blue-400" />,
    },
    {
      label: 'Reconciliation Engine',
      href: '/admin/reconciliation',
      icon: <RefreshCw className="w-4 h-4 text-purple-400" />,
    },
    {
      label: 'Platform Revenue',
      href: '/admin/revenue',
      icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
    },
    {
      label: 'Resource Metering',
      href: '/admin/usage',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      label: 'System Health & SLA',
      href: '/admin/system-health',
      icon: <Activity className="w-4 h-4 text-emerald-400" />,
    },
    {
      label: 'AI Inference Usage',
      href: '/admin/ai-usage',
      icon: <Bot className="w-4 h-4 text-amber-400" />,
    },
    {
      label: 'Compliance Audit Trail',
      href: '/admin/audit',
      icon: <ShieldCheck className="w-4 h-4 text-purple-400" />,
    },
    {
      label: 'Security & Access',
      href: '/admin/security',
      icon: <Lock className="w-4 h-4 text-red-400" />,
    },
    {
      label: 'Platform Settings',
      href: '/admin/settings',
      icon: <Settings className="w-4 h-4" />,
    },
    {
      label: 'Demo 2-Person Gate',
      href: '/admin/demo-access',
      icon: <Key className="w-4 h-4 text-primary" />,
      badge: 'Protected',
    },
  ];

  return (
    <aside className="w-64 bg-[#080d1a] border-r border-outline-variant/40 flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto select-none">
      <div className="space-y-5">
        <div className="px-3 pt-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Platform Operations
          </span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-200 border border-purple-500/30 font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-surface-container-low/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-purple-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-primary/20 text-primary border border-primary/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-outline-variant/40 space-y-3">
        <div className="p-3 rounded-2xl bg-[#0b101f] border border-outline-variant/60 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SLA 99.99%
            </span>
            <span className="font-mono text-emerald-400 font-bold">18ms</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            US-East Primary Cluster • Gemini 1.5 Pro Flash Verified
          </p>
        </div>

        <div className="text-[10px] text-slate-500 text-center font-mono">
          Ventrexs Platform Admin • Private Edition
        </div>
      </div>
    </aside>
  );
};
