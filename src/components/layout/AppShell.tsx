'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { BottomNav } from './BottomNav';
import { useApp } from '@/context/AppContext';
import { 
  X, 
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
  ArrowLeft 
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  backUrl?: string;
  actions?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  title,
  showBack = false,
  backUrl = '/dashboard',
  actions
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const pathname = usePathname();
  const { user, isDemoMode, exitDemoMode, profile, businessProfile, notifications, leads } = useApp();
  
  const unreadNotifs = notifications.filter(n => !n.read).length;
  const newLeadsCount = leads?.filter(l => l.status === 'NEW').length || 0;
  const currentBusinessName = businessProfile?.name || profile.businessName || 'Ventrexs Workspace';

  const mobileNavItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <Home className="w-4 h-4" /> },
    { label: 'Leads', href: '/leads', icon: <UserCheck className="w-4 h-4" />, badge: newLeadsCount > 0 ? `${newLeadsCount}` : undefined },
    { label: 'Pipeline', href: '/pipeline', icon: <Kanban className="w-4 h-4" /> },
    { label: 'Contacts', href: '/contacts', icon: <Users className="w-4 h-4" /> },
    { label: 'Appointments', href: '/appointments', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Jobs', href: '/jobs', icon: <Wrench className="w-4 h-4" /> },
    { label: 'Invoices', href: '/invoices', icon: <FileText className="w-4 h-4" /> },
    { label: 'Payments', href: '/collections', icon: <DollarSign className="w-4 h-4" /> },
    { label: 'Follow-ups', href: '/follow-up', icon: <span className="material-symbols-outlined text-[18px]">phone_in_talk</span> },
    { label: 'AI Copilot', href: '/copilot', icon: <Sparkles className="w-4 h-4 text-primary" />, isAi: true },
    { label: 'Reports', href: '/reports', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Notifications', href: '/notifications', icon: <Bell className="w-4 h-4" />, badge: unreadNotifs > 0 ? `${unreadNotifs}` : undefined },
    { label: 'Settings', href: '/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-xs md:hidden animate-in fade-in"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface p-5 flex flex-col gap-4 border-r border-outline-variant shadow-2xl transition-transform duration-300 md:hidden ${
          mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
          <Logo href="/dashboard" variant="full" size="sm" subtitle="Service OS" />
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(false)}
            className="p-1.5 rounded-xl hover:bg-surface-container-low text-on-surface-variant min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Business Profile in drawer */}
        <Link
          href="/profile"
          onClick={() => setMobileDrawerOpen(false)}
          className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/60"
        >
          <img src={profile.avatarUrl} alt={profile.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-on-surface truncate">{currentBusinessName}</p>
            <p className="text-[11px] text-on-surface-variant">{profile.plan} Plan</p>
          </div>
        </Link>

        {/* Drawer Links */}
        <nav className="flex-1 overflow-y-auto flex flex-col gap-1 py-1">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileDrawerOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={isActive ? 'text-primary' : 'text-on-surface-variant'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary text-on-primary font-bold">
                      {item.badge}
                    </span>
                  )}
                  {item.isAi && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-primary/10 text-primary font-extrabold">
                      AI
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="pt-3 border-t border-outline-variant text-[10px] text-outline flex items-center justify-between">
          <span>Ventrexs Service OS</span>
          <span>v13.0.0</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Live Demo Status Banner: ONLY shown for unauthenticated explore demo visitors */}
        {!user && isDemoMode && (
          <div className="bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-blue-900/30 border-b border-blue-500/30 px-4 py-1.5 text-xs text-on-surface flex items-center justify-between z-30">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-700 dark:text-blue-300 font-extrabold text-[10px] tracking-wider uppercase border border-blue-500/40">
                DEMO MODE
              </span>
              <span className="font-medium text-on-surface-variant text-[11px]">
                You&apos;re viewing the Ventrexs demo. Data shown here is fictional.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                onClick={() => exitDemoMode()}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                Exit Demo
              </Link>
            </div>
          </div>
        )}

        <TopHeader onMenuClick={() => setMobileDrawerOpen(true)} title={title} />

        {/* Optional Page Subheader / Breadcrumbs */}
        {(showBack || actions) && (
          <div className="px-4 lg:px-8 py-2.5 bg-surface-container-low/40 border-b border-outline-variant flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {showBack && (
                <Link
                  href={backUrl}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-on-primary-fixed-variant px-2.5 py-1.5 rounded-lg hover:bg-surface-container-high transition-colors min-h-[36px]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Link>
              )}
              {title && <span className="text-xs font-semibold text-on-surface md:hidden">{title}</span>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}

        {/* Dynamic Canvas */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};
