'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { BottomNav } from './BottomNav';
import { useApp } from '@/context/AppContext';
import { X, Sparkles } from 'lucide-react';

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
  const { profile, notifications } = useApp();
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const mobileNavItems = [
    { label: 'Dashboard', href: '/dashboard', mIcon: 'home' },
    { label: 'Invoices', href: '/invoices', mIcon: 'description' },
    { label: 'Customers', href: '/customers', mIcon: 'group' },
    { label: 'Collections', href: '/collections', mIcon: 'payments' },
    { label: 'AI Copilot', href: '/copilot', mIcon: 'smart_toy', isAi: true },
    { label: 'Reports', href: '/reports', mIcon: 'monitoring' },
    { label: 'Notifications', href: '/notifications', mIcon: 'notifications', badge: unreadNotifs > 0 ? unreadNotifs : undefined },
    { label: 'Pricing', href: '/pricing', mIcon: 'workspace_premium' },
    { label: 'Settings', href: '/settings', mIcon: 'settings' },
    { label: 'Admin Dashboard', href: '/admin', mIcon: 'admin_panel_settings' },
  ];

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-xs md:hidden"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface p-6 flex flex-col gap-4 border-r border-outline-variant shadow-2xl transition-transform duration-300 md:hidden ${
          mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-[18px] fill-icon">payments</span>
            </div>
            <span className="font-bold text-lg text-primary">PayPilot AI</span>
          </div>
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className="p-1.5 rounded-full hover:bg-surface-container-low text-on-surface-variant"
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
          <img src={profile.avatarUrl} alt={profile.name} className="w-9 h-9 rounded-full object-cover" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-on-surface truncate">{profile.businessName}</p>
            <p className="text-[11px] text-on-surface-variant">{profile.plan} Plan</p>
          </div>
        </Link>

        {/* Drawer Links */}
        <nav className="flex-1 overflow-y-auto flex flex-col gap-1 py-2">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileDrawerOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-surface-container-high text-primary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[20px] ${isActive ? 'fill-icon text-primary' : ''}`}>
                    {item.mIcon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-error text-on-error font-bold">
                    {item.badge}
                  </span>
                )}
                {item.isAi && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-bold">
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="pt-3 border-t border-outline-variant text-[11px] text-outline">
          PayPilot AI • v2.4.0
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopHeader onMenuClick={() => setMobileDrawerOpen(true)} title={title} />

        {/* Optional Page Subheader / Breadcrumbs */}
        {(showBack || actions) && (
          <div className="px-4 lg:px-8 py-3 bg-surface-container-low/50 border-b border-outline-variant flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {showBack && (
                <Link
                  href={backUrl}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-on-primary-fixed-variant px-2.5 py-1.5 rounded-lg hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Back
                </Link>
              )}
              {title && <span className="text-sm font-semibold text-on-surface md:hidden">{title}</span>}
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
