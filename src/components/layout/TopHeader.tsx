'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Menu, Bell, User, Plus, X, Search, Sparkles } from 'lucide-react';

interface TopHeaderProps {
  onMenuClick?: () => void;
  title?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onMenuClick, title }) => {
  const { profile, notifications, markNotificationAsRead } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between w-full px-4 lg:px-8 py-3.5 bg-surface/95 backdrop-blur-md border-b border-outline-variant">
      {/* Left: Mobile Drawer Button & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low transition-colors"
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        <div className="flex items-center gap-2 md:hidden">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-xs">
            <span className="material-symbols-outlined text-[16px] fill-icon">payments</span>
          </div>
          <span className="font-bold text-lg text-primary tracking-tight">PayPilot AI</span>
        </div>

        {title && (
          <h1 className="hidden md:block text-xl font-bold text-on-surface">
            {title}
          </h1>
        )}
      </div>

      {/* Right: Quick Actions, Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/invoices/create"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-semibold text-xs shadow-xs hover:bg-on-primary-fixed-variant transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          New Invoice
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
            aria-label="View notifications"
          >
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full ring-2 ring-surface animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowNotifications(false)} 
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface rounded-2xl border border-outline-variant shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between p-4 border-b border-outline-variant bg-surface-container-low">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-on-surface">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-error/10 text-error">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <Link 
                    href="/notifications" 
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    View All
                  </Link>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-on-surface-variant">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 4).map((n) => (
                      <div 
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-3.5 hover:bg-surface-container-low transition-colors cursor-pointer flex gap-3 items-start ${
                          !n.read ? 'bg-primary-fixed/20' : ''
                        }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 ${
                          n.type === 'payment' ? 'bg-tertiary-container/20 text-tertiary' :
                          n.type === 'overdue' ? 'bg-error-container/40 text-error' :
                          n.type === 'copilot' ? 'bg-primary-container/20 text-primary' : 'bg-surface-variant text-on-surface-variant'
                        }`}>
                          <span className="material-symbols-outlined text-[18px]">
                            {n.type === 'payment' ? 'payments' :
                             n.type === 'overdue' ? 'warning' :
                             n.type === 'copilot' ? 'smart_toy' : 'notifications'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-on-surface leading-snug">{n.title}</p>
                          <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-outline mt-1 block">{n.timestamp}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Avatar Pill */}
        <Link 
          href="/profile" 
          className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-surface-container-low border border-outline-variant/60 transition-all"
        >
          <img 
            src={profile.avatarUrl} 
            alt={profile.name} 
            className="w-7 h-7 rounded-full object-cover shrink-0" 
          />
          <span className="hidden sm:block text-xs font-semibold text-on-surface truncate max-w-[100px]">
            {profile.name}
          </span>
        </Link>
      </div>
    </header>
  );
};
