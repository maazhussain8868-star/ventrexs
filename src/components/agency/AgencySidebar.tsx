'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users2,
  GitBranch,
  Server,
  Palette,
  Globe,
  CreditCard,
  TrendingUp,
  HeartPulse,
  Activity,
  Settings,
  Building2,
  ShieldCheck,
  ChevronRight,
  UserCheck,
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
  | 'settings';

interface AgencySidebarProps {
  activeTab: AgencyNavTab;
  onSelectTab: (tab: AgencyNavTab) => void;
  totalClients: number;
  maxClients: number;
  totalMrr: number;
  atRiskCount?: number;
  pendingOnboardingCount?: number;
}

export const AgencySidebar: React.FC<AgencySidebarProps> = ({
  activeTab,
  onSelectTab,
  totalClients,
  maxClients,
  totalMrr,
  atRiskCount = 2,
  pendingOnboardingCount = 3,
}) => {
  const sections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'overview' as AgencyNavTab, label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      ],
    },
    {
      title: 'CLIENT MANAGEMENT',
      items: [
        { id: 'clients' as AgencyNavTab, label: 'Clients', icon: <Users2 className="w-4 h-4" />, badge: `${totalClients}` },
        {
          id: 'onboarding' as AgencyNavTab,
          label: 'Onboarding',
          icon: <GitBranch className="w-4 h-4" />,
          badge: pendingOnboardingCount > 0 ? `${pendingOnboardingCount}` : null,
          badgeColor: 'bg-amber-50 text-amber-700 border border-amber-200',
        },
      ],
    },
    {
      title: 'INFRASTRUCTURE',
      items: [
        {
          id: 'deployments' as AgencyNavTab,
          label: 'Deployments',
          icon: <Server className="w-4 h-4" />,
          badge: 'Live',
          badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        },
        { id: 'domains' as AgencyNavTab, label: 'Domains', icon: <Globe className="w-4 h-4" /> },
        {
          id: 'health' as AgencyNavTab,
          label: 'Usage & Health',
          icon: <HeartPulse className="w-4 h-4" />,
          badge: atRiskCount > 0 ? `${atRiskCount}` : null,
          badgeColor: 'bg-red-50 text-red-700 border border-red-200',
        },
      ],
    },
    {
      title: 'BRANDING',
      items: [
        { id: 'whitelabel' as AgencyNavTab, label: 'White-Label', icon: <Palette className="w-4 h-4" /> },
      ],
    },
    {
      title: 'COMMERCIAL',
      items: [
        { id: 'subscriptions' as AgencyNavTab, label: 'Subscriptions', icon: <CreditCard className="w-4 h-4" /> },
        {
          id: 'revenue' as AgencyNavTab,
          label: 'Revenue',
          icon: <TrendingUp className="w-4 h-4" />,
          badge: '+18.4%',
          badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'activity' as AgencyNavTab, label: 'Activity', icon: <Activity className="w-4 h-4" /> },
      ],
    },
    {
      title: 'ORGANIZATION',
      items: [
        { id: 'settings' as AgencyNavTab, label: 'Agency Settings', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  const quotaPercent = Math.min(100, Math.round((totalClients / maxClients) * 100));

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-4rem)] select-none shadow-2xs">
      {/* Navigation Groups */}
      <div className="space-y-5">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-3 pb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {section.title}
              </span>
            </div>

            <nav className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left ${
                      isActive
                        ? 'bg-violet-50 text-violet-700 font-bold border border-violet-200/60 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={isActive ? 'text-violet-600' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.badgeColor || (isActive ? 'bg-violet-200/60 text-violet-800' : 'bg-slate-100 text-slate-600')
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

      {/* Bottom Reseller Quota & Plan Card */}
      <div className="pt-4 border-t border-slate-200/80 space-y-2.5 mt-6">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-violet-600" />
              <span className="text-xs font-bold text-slate-900">Agency Growth</span>
            </div>
            <span className="text-[11px] font-bold font-mono text-emerald-600">
              ${totalMrr.toLocaleString()}/mo
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-600">
              <span>Client Quota</span>
              <span className="font-mono font-bold text-slate-900">
                {totalClients} / {maxClients}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
          </div>

          <div className="text-[10px] text-slate-500 flex items-center justify-between pt-0.5">
            <span>{maxClients - totalClients} slots available</span>
            <button
              onClick={() => onSelectTab('settings')}
              className="text-violet-600 font-bold hover:underline"
            >
              Upgrade
            </button>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 text-center font-mono">
          Ventrexs Agency OS • v13.4.2
        </div>
      </div>
    </aside>
  );
};
