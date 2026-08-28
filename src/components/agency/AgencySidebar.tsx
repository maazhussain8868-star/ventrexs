'use client';

import React from 'react';
import {
  LayoutDashboard,
  Building2,
  GitBranch,
  Server,
  Palette,
  Globe,
  CreditCard,
  TrendingUp,
  HeartPulse,
  Activity,
  Users2,
  Settings,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export type AgencyNavTab =
  | 'overview'
  | 'clients'
  | 'onboarding'
  | 'deployments'
  | 'whitelabel'
  | 'domains'
  | 'subscriptions'
  | 'revenue'
  | 'health'
  | 'activity'
  | 'team'
  | 'settings';

interface AgencySidebarProps {
  activeTab: AgencyNavTab;
  onSelectTab: (tab: AgencyNavTab) => void;
  totalClients: number;
  maxClients: number;
  totalMrr: number;
  atRiskCount: number;
  pendingOnboardingCount: number;
}

interface NavSection {
  title: string;
  items: {
    id: AgencyNavTab;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    badgeColor?: string;
  }[];
}

export const AgencySidebar: React.FC<AgencySidebarProps> = ({
  activeTab,
  onSelectTab,
  totalClients,
  maxClients,
  totalMrr,
  atRiskCount,
  pendingOnboardingCount,
}) => {
  const sections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      ],
    },
    {
      title: 'CLIENT MANAGEMENT',
      items: [
        {
          id: 'clients',
          label: 'Client Portfolio',
          icon: <Building2 className="w-4 h-4" />,
          badge: totalClients,
          badgeColor: 'bg-slate-100 text-slate-700 font-mono',
        },
        {
          id: 'onboarding',
          label: 'Onboarding Pipeline',
          icon: <GitBranch className="w-4 h-4" />,
          badge: pendingOnboardingCount > 0 ? pendingOnboardingCount : undefined,
          badgeColor: 'bg-amber-100 text-amber-800 font-mono',
        },
      ],
    },
    {
      title: 'INFRASTRUCTURE',
      items: [
        { id: 'deployments', label: 'Deployments', icon: <Server className="w-4 h-4" /> },
        { id: 'domains', label: 'Custom Domains', icon: <Globe className="w-4 h-4" /> },
        {
          id: 'health',
          label: 'Usage & Health',
          icon: <HeartPulse className="w-4 h-4" />,
          badge: atRiskCount > 0 ? `${atRiskCount} alert` : undefined,
          badgeColor: 'bg-red-100 text-red-700',
        },
      ],
    },
    {
      title: 'BRANDING',
      items: [
        { id: 'whitelabel', label: 'White-Label Studio', icon: <Palette className="w-4 h-4" /> },
      ],
    },
    {
      title: 'COMMERCIAL',
      items: [
        { id: 'subscriptions', label: 'Subscriptions', icon: <CreditCard className="w-4 h-4" /> },
        { id: 'revenue', label: 'SaaS Revenue', icon: <TrendingUp className="w-4 h-4" /> },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'activity', label: 'Audit Activity', icon: <Activity className="w-4 h-4" /> },
      ],
    },
    {
      title: 'ORGANIZATION',
      items: [
        { id: 'team', label: 'Staff Team', icon: <Users2 className="w-4 h-4" /> },
        { id: 'settings', label: 'Agency Settings', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  const quotaPercent = Math.min(100, Math.round((totalClients / maxClients) * 100));

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between p-4 shrink-0 min-h-full overflow-y-auto select-none shadow-xs">
      <div className="space-y-5">
        {sections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 pb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {sec.title}
              </span>
            </div>

            <nav className="space-y-0.5">
              {sec.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all text-left min-h-[40px] ${
                      isActive
                        ? 'bg-violet-50 text-violet-700 font-bold border border-violet-200/60 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 truncate">
                      <span className={isActive ? 'text-violet-600 shrink-0' : 'text-slate-400 shrink-0'}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          item.badgeColor || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Bottom Reseller Quota Progress Card */}
      <div className="pt-4 border-t border-slate-200/80 space-y-3 mt-6 pb-safe">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">Client Quota</span>
            <span className="font-mono text-violet-700 font-bold">
              {totalClients} / {maxClients}
            </span>
          </div>

          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${quotaPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
            <span>MRR: ${totalMrr.toLocaleString()}</span>
            <button
              onClick={() => onSelectTab('settings')}
              className="font-bold text-violet-600 hover:underline"
            >
              Upgrade &rarr;
            </button>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 text-center font-mono">
          Ventrexs Agency &bull; v13.4.2
        </div>
      </div>
    </aside>
  );
};
