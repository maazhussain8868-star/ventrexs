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
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 text-slate-900 shadow-2xs select-none">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Reseller Tier Indicator */}
        <div className="flex items-center gap-3 shrink-0">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link href="/agency" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-600/20">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 leading-none">
                  VENTREXS
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-violet-50 text-violet-700 border border-violet-200 tracking-wider uppercase">
                  AGENCY PLATFORM
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5 hidden sm:block">
                Reseller & Partner Operations • Apex Growth Marketing
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-500 hover:text-slate-800 flex items-center justify-between transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-violet-600" />
              <span>Search clients, domains, deployments...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-white text-[10px] font-mono text-slate-400 border border-slate-200 shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Actions: Notifications, Help, Profile, + Add Client */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 relative transition-colors"
              title="Agency Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-600" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 space-y-2 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Agency Alerts
                  </span>
                  <span className="text-[10px] font-bold text-violet-600 cursor-pointer hover:underline">
                    Mark all read
                  </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="py-2.5 px-1.5 space-y-0.5 text-xs hover:bg-slate-50 rounded-lg transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Switch to Customer Portal Link */}
          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            title="Open customer business workspace"
          >
            <span>Customer View</span>
            <ArrowRight className="w-3.5 h-3.5 text-violet-600" />
          </Link>

          {/* Primary CTA: + Add Client */}
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenAddClient}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-xs"
          >
            <span className="hidden sm:inline">+ Add Client</span>
            <span className="sm:hidden">+ Client</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
