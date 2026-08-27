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
  Sparkles,
  ShieldCheck,
  ChevronRight,
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
  const navItems = [
    {
      id: 'overview' as AgencyNavTab,
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: null,
    },
    {
      id: 'clients' as AgencyNavTab,
      label: 'Clients',
      icon: <Users2 className="w-4 h-4" />,
      badge: `${totalClients}`,
    },
    {
      id: 'onboarding' as AgencyNavTab,
      label: 'Onboarding',
      icon: <GitBranch className="w-4 h-4" />,
      badge: pendingOnboardingCount > 0 ? `${pendingOnboardingCount}` : null,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    },
    {
      id: 'deployments' as AgencyNavTab,
      label: 'Deployments',
      icon: <Server className="w-4 h-4" />,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      id: 'whitelabel' as AgencyNavTab,
      label: 'White-Label',
      icon: <Palette className="w-4 h-4" />,
      badge: null,
    },
    {
      id: 'domains' as AgencyNavTab,
      label: 'Domains',
      icon: <Globe className="w-4 h-4" />,
      badge: null,
    },
    {
      id: 'subscriptions' as AgencyNavTab,
      label: 'Subscriptions',
      icon: <CreditCard className="w-4 h-4" />,
      badge: null,
    },
    {
      id: 'revenue' as AgencyNavTab,
      label: 'Revenue',
      icon: <TrendingUp className="w-4 h-4" />,
      badge: '+18.4%',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      id: 'health' as AgencyNavTab,
      label: 'Usage & Health',
      icon: <HeartPulse className="w-4 h-4" />,
      badge: atRiskCount > 0 ? `${atRiskCount} alert` : null,
      badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30',
    },
    {
      id: 'activity' as AgencyNavTab,
      label: 'Activity',
      icon: <Activity className="w-4 h-4" />,
      badge: null,
    },
    {
      id: 'settings' as AgencyNavTab,
      label: 'Agency Settings',
      icon: <Settings className="w-4 h-4" />,
      badge: null,
    },
  ];

  const quotaPercent = Math.min(100, Math.round((totalClients / maxClients) * 100));

  return (
    <aside className="w-64 bg-[#0a0f1d] border-r border-outline-variant/40 flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-4rem)] select-none">
      {/* Navigation Group */}
      <div className="space-y-6">
        <div className="px-3">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Control Center
          </span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-primary text-white font-bold shadow-md shadow-primary/20'
                    : 'text-slate-300 hover:text-white hover:bg-surface-container-low/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-surface-container text-slate-300')
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

      {/* Bottom Reseller Quota & Plan Card */}
      <div className="pt-4 border-t border-outline-variant/40 space-y-3">
        <div className="p-3.5 rounded-2xl bg-surface-container-lowest/60 border border-outline-variant/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-white">Agency Growth</span>
            </div>
            <span className="text-[10px] font-bold font-mono text-emerald-400">
              ${totalMrr.toLocaleString()}/mo
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>Client Quota</span>
              <span className="font-mono font-bold text-white">
                {totalClients} / {maxClients}
              </span>
            </div>
            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-500"
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
          </div>

          <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
            <span>{maxClients - totalClients} seats available</span>
            <button
              onClick={() => onSelectTab('settings')}
              className="text-primary font-bold hover:underline"
            >
              Upgrade
            </button>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 text-center font-mono">
          Ventrex Reseller OS • v13.4.2
        </div>
      </div>
    </aside>
  );
};
