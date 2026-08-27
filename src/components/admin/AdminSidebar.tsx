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
  Globe,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  exact?: boolean;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  const sections: NavSection[] = [
    {
      title: 'PLATFORM',
      items: [
        { label: 'Overview', href: '/admin', icon: <LayoutDashboard className="w-4 h-4" />, exact: true },
        { label: 'Businesses', href: '/admin/businesses', icon: <Building2 className="w-4 h-4" /> },
        { label: 'Agencies', href: '/admin/agencies', icon: <Globe className="w-4 h-4" /> },
        { label: 'Users', href: '/admin/users', icon: <Users className="w-4 h-4" /> },
      ],
    },
    {
      title: 'BILLING',
      items: [
        { label: 'Subscriptions', href: '/admin/subscriptions', icon: <CreditCard className="w-4 h-4" /> },
        { label: 'Payments', href: '/admin/payments', icon: <CreditCard className="w-4 h-4" /> },
        { label: 'Reconciliation', href: '/admin/reconciliation', icon: <RefreshCw className="w-4 h-4" /> },
        { label: 'Revenue', href: '/admin/revenue', icon: <TrendingUp className="w-4 h-4" /> },
      ],
    },
    {
      title: 'INFRASTRUCTURE',
      items: [
        { label: 'Resource Usage', href: '/admin/usage', icon: <Layers className="w-4 h-4" /> },
        { label: 'System Health', href: '/admin/system-health', icon: <Activity className="w-4 h-4" /> },
        { label: 'AI Usage', href: '/admin/ai-usage', icon: <Bot className="w-4 h-4" /> },
      ],
    },
    {
      title: 'SECURITY',
      items: [
        { label: 'Audit Trail', href: '/admin/audit', icon: <ShieldCheck className="w-4 h-4" /> },
        { label: 'Security & Access', href: '/admin/security', icon: <Lock className="w-4 h-4" /> },
        { label: 'Demo Access', href: '/admin/demo-access', icon: <Key className="w-4 h-4" />, badge: 'Protected' },
      ],
    },
    {
      title: 'CONFIGURATION',
      items: [
        { label: 'Platform Settings', href: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-4.5rem)] sticky top-[4.5rem] overflow-y-auto select-none shadow-xs">
      <div className="space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 pb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {section.title}
              </span>
            </div>

            <nav className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-700">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Bottom Health Pill */}
      <div className="pt-4 border-t border-slate-200/80 space-y-2 mt-6">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              SLA 99.99%
            </span>
            <span className="font-mono text-emerald-600 font-bold text-[11px]">18ms</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            US-East Multi-Tenant Cluster &bull; Gemini 1.5
          </p>
        </div>

        <div className="text-[10px] text-slate-400 text-center font-mono">
          Ventrexs Platform Admin &bull; v13.4.2
        </div>
      </div>
    </aside>
  );
};
