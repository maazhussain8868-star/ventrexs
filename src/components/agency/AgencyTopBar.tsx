'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Search,
  Bell,
  HelpCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Globe,
  Sparkles,
  User,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AgencyTopBarProps {
  onOpenSearch: () => void;
  onOpenAddClient: () => void;
  onToggleMobileMenu?: () => void;
}

export const AgencyTopBar: React.FC<AgencyTopBarProps> = ({
  onOpenSearch,
  onOpenAddClient,
  onToggleMobileMenu,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    {
      id: '1',
      title: 'Payment Received',
      desc: '$299.00 from Precision Roofing (Enterprise)',
      time: '18m ago',
      unread: true,
      type: 'success',
    },
    {
      id: '2',
      title: 'Custom Domain Live',
      desc: 'portal.apexcomfort.com SSL active',
      time: '1h ago',
      unread: true,
      type: 'info',
    },
    {
      id: '3',
      title: 'Action Required: DNS Mismatch',
      desc: 'ClearFlow Drain & Septic TXT record failed',
      time: '2h ago',
      unread: false,
      type: 'warning',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#070b14]/90 backdrop-blur-md border-b border-outline-variant/40 text-on-surface select-none">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Reseller Tier Indicator */}
        <div className="flex items-center gap-3">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link href="/agency" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-bold shadow-md shadow-primary/20">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">
                  VENTREX
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-primary/20 text-primary border border-primary/30 tracking-wider uppercase">
                  AGENCY OS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Apex Growth Marketing • Reseller Center
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Global Search Bar / Command Palette Trigger */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-full bg-surface-container-low/80 hover:bg-surface-container-high border border-outline-variant/60 rounded-xl px-3.5 py-2 text-xs text-on-surface-variant flex items-center justify-between transition-colors shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-primary" />
              <span>Search clients, domains, telemetry, commands...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container text-[10px] font-mono text-on-surface-variant border border-outline-variant/40">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Actions: Mobile search, Notifications, Switch view, Profile, + Add Client */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-white relative transition-colors"
              title="Agency Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl p-3 space-y-2 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/60 px-1">
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Agency Alerts
                  </span>
                  <span className="text-[10px] font-bold text-primary cursor-pointer hover:underline">
                    Mark all read
                  </span>
                </div>
                <div className="divide-y divide-outline-variant/40 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="py-2.5 px-1 space-y-0.5 text-xs hover:bg-surface-container-low rounded-lg transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-on-surface">{n.title}</span>
                        <span className="text-[10px] text-on-surface-variant font-mono">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Switch to Customer Portal Link */}
          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/60 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            title="Open customer business workspace"
          >
            <span>Customer View</span>
            <ArrowRight className="w-3.5 h-3.5 text-primary" />
          </Link>

          {/* Primary CTA: + Add Client */}
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenAddClient}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs font-bold shadow-md shadow-primary/20 bg-primary text-on-primary hover:bg-primary/90"
          >
            <span className="hidden sm:inline">+ Add Client</span>
            <span className="sm:hidden">+ Client</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
