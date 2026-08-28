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
  X,
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand & Reseller Tier Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open Agency Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link href="/agency" className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-600/20 shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 leading-none">
                  VENTREXS
                </span>
                <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-extrabold bg-violet-50 text-violet-700 border border-violet-200 tracking-wider uppercase hidden xs:inline">
                  AGENCY
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-tight mt-0.5 hidden md:block truncate">
                Reseller & Partner Operations • Apex Growth
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Global Search Bar (Desktop) */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-all font-medium"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search clients, domains, deployments...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-white text-[10px] font-mono text-slate-400 border border-slate-200 shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, Notifications & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile Search Icon Button */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Search"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-violet-600" />
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-auto sm:mt-2 w-[calc(100vw-1rem)] sm:w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 p-3 space-y-2 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                    <span className="text-xs font-bold text-slate-900">Agency Activity Alerts</span>
                    <span className="text-[10px] font-mono text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded font-bold">
                      2 Unread
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl border text-xs transition-colors ${
                          n.unread
                            ? 'bg-violet-50/50 border-violet-100 text-slate-900'
                            : 'bg-slate-50/50 border-slate-100 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{n.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Customer View Link */}
          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200 min-h-[36px]"
          >
            <span>Customer View</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </Link>

          {/* Primary CTA */}
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenAddClient}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-xs min-h-[36px]"
          >
            <span className="hidden sm:inline">+ Add Client</span>
            <span className="sm:hidden">+ Client</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
