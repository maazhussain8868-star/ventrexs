'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  Home, 
  UserCheck, 
  Kanban, 
  Users, 
  Calendar, 
  Wrench, 
  FileText, 
  DollarSign, 
  Sparkles, 
  BarChart3, 
  Bell, 
  Settings, 
  User, 
  ChevronDown, 
  Check, 
  Plus, 
  Building2,
  PhoneCall,
  CreditCard,
  Radio,
  Star,
  ShieldCheck
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { profile, businessProfile, notifications, leads, activeConversationsCount, communications } = useApp();
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const newLeadsCount = leads?.filter(l => l.status === 'NEW').length || 0;
  const pendingApprovalsCount = communications?.filter(c => c.approvalStatus === 'pending_approval').length || 0;

  const currentBusinessName = businessProfile?.name || profile.businessName || 'Ventrexs Workspace';
  const currentIndustry = businessProfile?.industry || 'HVAC & Service';

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <Home className="w-4 h-4" /> },
    { 
      label: 'AI Receptionist', 
      href: '/receptionist', 
      icon: <Sparkles className="w-4 h-4 text-primary" />,
      badge: activeConversationsCount > 0 ? `${activeConversationsCount} active` : undefined,
      badgeColor: 'bg-primary text-on-primary',
      isAi: true
    },
    { 
      label: 'Leads', 
      href: '/leads', 
      icon: <UserCheck className="w-4 h-4" />,
      badge: newLeadsCount > 0 ? `${newLeadsCount} new` : undefined,
      badgeColor: 'bg-primary text-on-primary'
    },
    { label: 'Pipeline', href: '/pipeline', icon: <Kanban className="w-4 h-4" /> },
    { label: 'Contacts', href: '/contacts', icon: <Users className="w-4 h-4" /> },
    { label: 'Appointments', href: '/appointments', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Jobs', href: '/jobs', icon: <Wrench className="w-4 h-4" /> },
    { label: 'Estimates', href: '/estimates', icon: <FileText className="w-4 h-4 text-primary" /> },
    { label: 'Invoices', href: '/invoices', icon: <FileText className="w-4 h-4" /> },
    { label: 'Payments', href: '/payments', icon: <DollarSign className="w-4 h-4 text-emerald-500" /> },
    { label: 'Follow-ups', href: '/follow-up', icon: <PhoneCall className="w-4 h-4" /> },
    { 
      label: 'Communications', 
      href: '/communications', 
      icon: <Radio className="w-4 h-4 text-emerald-500" />,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} review` : undefined,
      badgeColor: 'bg-amber-500 text-white'
    },
    { 
      label: 'Reputation', 
      href: '/reputation', 
      icon: <Star className="w-4 h-4 text-amber-500" /> 
    },
    { 
      label: 'AI Copilot', 
      href: '/copilot', 
      icon: <Sparkles className="w-4 h-4 text-amber-500" />, 
      isAi: true 
    },
    { label: 'Reports', href: '/reports', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 lg:w-72 bg-surface border-r border-outline-variant p-4 gap-3 shrink-0 z-40 sticky top-0 overflow-y-auto">
      {/* Brand & Workspace Switcher */}
      <div className="relative mb-1">
        <div className="flex items-center justify-between px-2 mb-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-xs group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px] fill-icon">payments</span>
            </div>
            <div>
              <span className="font-extrabold text-base text-primary tracking-tight block leading-none">Ventrexs</span>
              <span className="text-[10px] font-semibold text-outline tracking-wider uppercase block mt-0.5">Service OS</span>
            </div>
          </Link>
        </div>

        {/* Workspace Switcher Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-surface-container-low/70 border border-outline-variant/60 hover:bg-surface-container-low transition-all text-left group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-surface-container-high text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-outline-variant/40">
                {currentBusinessName.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-on-surface truncate leading-tight group-hover:text-primary transition-colors">
                  {currentBusinessName}
                </p>
                <p className="text-[10px] text-on-surface-variant font-medium truncate">
                  {currentIndustry}
                </p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-outline shrink-0 ml-1" />
          </button>

          {/* Switcher Dropdown */}
          {workspaceDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setWorkspaceDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-1.5 p-1.5 bg-surface border border-outline-variant rounded-xl shadow-xl z-40 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-outline">
                  Workspaces
                </div>
                <button
                  type="button"
                  onClick={() => setWorkspaceDropdownOpen(false)}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-surface-container-high text-xs font-bold text-primary"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span className="truncate">{currentBusinessName}</span>
                  </div>
                  <Check className="w-3.5 h-3.5 shrink-0" />
                </button>
                <Link
                  href="/onboarding"
                  onClick={() => setWorkspaceDropdownOpen(false)}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
                >
                  <Plus className="w-4 h-4 text-outline" />
                  <span>Add / Configure Business</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col gap-1 py-1 overflow-y-auto">
        <div className="text-[10px] font-bold tracking-wider text-outline uppercase px-2.5 py-1">
          Operations
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all min-h-[40px] ${
                isActive
                  ? 'bg-surface-container-high text-primary font-bold shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor || 'bg-error text-on-error'}`}>
                    {item.badge}
                  </span>
                )}
                {item.isAi && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-primary/10 text-primary font-extrabold uppercase">
                    AI
                  </span>
                )}
              </div>
            </Link>
          );
        })}

        {/* Bottom Section */}
        <div className="mt-auto pt-3 border-t border-outline-variant flex flex-col gap-0.5">
          <Link
            href="/notifications"
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              pathname === '/notifications'
                ? 'bg-surface-container-high text-primary font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-on-surface-variant" />
              <span>Notifications</span>
            </div>
            {unreadNotifs > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-error text-on-error">
                {unreadNotifs}
              </span>
            )}
          </Link>

          <Link
            href="/settings"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              pathname === '/settings'
                ? 'bg-surface-container-high text-primary font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
            }`}
          >
            <Settings className="w-4 h-4 text-on-surface-variant" />
            <span>Settings</span>
          </Link>

          <Link
            href="/settings/billing"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              pathname === '/settings/billing'
                ? 'bg-surface-container-high text-primary font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
            }`}
          >
            <CreditCard className="w-4 h-4 text-primary" />
            <span>SaaS Billing</span>
          </Link>

          <Link
            href="/profile"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              pathname === '/profile'
                ? 'bg-surface-container-high text-primary font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
            }`}
          >
            <User className="w-4 h-4 text-on-surface-variant" />
            <span>Profile & Account</span>
          </Link>
        </div>
      </nav>

      {/* Version Tag */}
      <div className="pt-2 border-t border-outline-variant/60 text-[10px] font-medium text-outline px-2 flex items-center justify-between">
        <span>Ventrexs Service OS</span>
        <span>v13.0.0</span>
      </div>
    </aside>
  );
};
