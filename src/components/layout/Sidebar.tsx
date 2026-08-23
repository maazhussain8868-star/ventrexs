'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  Home, 
  FileText, 
  Users, 
  DollarSign, 
  Sparkles, 
  BarChart3, 
  Bell, 
  CreditCard, 
  Settings, 
  ShieldCheck, 
  User 
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { profile, notifications } = useApp();
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <Home className="w-5 h-5" />, mIcon: 'home' },
    { label: 'Invoices', href: '/invoices', icon: <FileText className="w-5 h-5" />, mIcon: 'description' },
    { label: 'Customers', href: '/customers', icon: <Users className="w-5 h-5" />, mIcon: 'group' },
    { label: 'Collections', href: '/collections', icon: <DollarSign className="w-5 h-5" />, mIcon: 'payments' },
    { label: 'AI Copilot', href: '/copilot', icon: <Sparkles className="w-5 h-5 text-primary" />, mIcon: 'smart_toy', isAi: true },
    { label: 'Reports', href: '/reports', icon: <BarChart3 className="w-5 h-5" />, mIcon: 'monitoring' },
    { 
      label: 'Notifications', 
      href: '/notifications', 
      icon: <Bell className="w-5 h-5" />, 
      mIcon: 'notifications',
      badge: unreadNotifs > 0 ? unreadNotifs : undefined 
    },
    { label: 'Pricing', href: '/pricing', icon: <CreditCard className="w-5 h-5" />, mIcon: 'workspace_premium' },
    { label: 'Admin', href: '/admin', icon: <ShieldCheck className="w-5 h-5" />, mIcon: 'admin_panel_settings' },
  ];

  return (
    <aside className="hidden md:flex flex-col h-screen w-72 lg:w-80 bg-surface border-r border-outline-variant p-6 gap-4 shrink-0 z-40 sticky top-0 overflow-y-auto">
      {/* Brand Logo & Business Header */}
      <div className="mb-2">
        <Link href="/dashboard" className="flex items-center gap-2.5 mb-6 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[22px] fill-icon">payments</span>
          </div>
          <span className="font-bold text-xl text-primary tracking-tight">PayPilot AI</span>
        </Link>

        {/* Business Profile Card */}
        <Link 
          href="/profile" 
          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-container-low transition-all cursor-pointer border border-transparent hover:border-outline-variant group"
        >
          <img 
            src={profile.avatarUrl} 
            alt={profile.businessName} 
            className="w-10 h-10 rounded-full object-cover border border-outline-variant shrink-0" 
          />
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-sm text-on-surface truncate group-hover:text-primary transition-colors">
              {profile.businessName}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-tertiary"></span>
              <p className="text-xs text-on-surface-variant font-medium truncate">{profile.plan} Plan</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col gap-1.5">
        <div className="text-[11px] font-semibold tracking-wider text-outline uppercase px-3 py-1">
          Menu
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-surface-container-high text-primary font-bold shadow-xs translate-x-1'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-[20px] ${isActive ? 'fill-icon text-primary' : 'text-on-surface-variant'}`}>
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

        {/* Bottom Section */}
        <div className="mt-auto pt-4 border-t border-outline-variant flex flex-col gap-1">
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              pathname === '/settings'
                ? 'bg-surface-container-high text-primary font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span>Settings</span>
          </Link>
          <Link
            href="/profile"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              pathname === '/profile'
                ? 'bg-surface-container-high text-primary font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
            <span>My Profile</span>
          </Link>
        </div>
      </nav>

      {/* Version Tag */}
      <div className="text-[11px] font-medium text-outline px-3">
        PayPilot AI • v2.4.0
      </div>
    </aside>
  );
};
