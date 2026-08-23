'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/shared/EmptyState';
import { useApp } from '@/context/AppContext';
import { Bell, CheckCheck, Trash2, ChevronRight, Sparkles, DollarSign, AlertCircle } from 'lucide-react';

export default function NotificationsPage() {
  const router = useRouter();
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    clearNotifications 
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>('all');

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.read;
    return n.type === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const tabs = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'payment', label: 'Payments' },
    { id: 'copilot', label: 'AI Copilot' },
    { id: 'overdue', label: 'Overdue' },
  ];

  return (
    <AppShell
      title="Notifications"
      actions={
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllNotificationsAsRead}
              leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
            >
              Mark all as read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearNotifications}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Clear
            </Button>
          )}
        </div>
      }
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface mb-1">Notifications & Activity Feed</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Stay on top of settled transfers, delinquent accounts, and automated follow-ups.
          </p>
        </div>

        {/* Filter Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Notification List */}
        {filteredNotifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-8 h-8 text-primary" />}
            title="No Notifications"
            description="You are all caught up! When invoices are paid or AI drafts are generated, you will see alerts here."
            actionLabel="Go to Dashboard"
            onAction={() => router.push('/dashboard')}
          />
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl divide-y divide-outline-variant overflow-hidden shadow-xs">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  markNotificationAsRead(notif.id);
                  if (notif.linkUrl) router.push(notif.linkUrl);
                }}
                className={`p-4 sm:p-5 flex items-start gap-4 hover:bg-surface-container-low transition-colors cursor-pointer ${
                  !notif.read ? 'bg-primary-fixed/15' : ''
                }`}
              >
                {/* Icon */}
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  notif.type === 'payment' ? 'bg-tertiary-container/20 text-tertiary' :
                  notif.type === 'overdue' ? 'bg-error-container/40 text-error' :
                  notif.type === 'copilot' ? 'bg-primary-container/20 text-primary' : 'bg-surface-variant text-on-surface-variant'
                }`}>
                  <span className="material-symbols-outlined text-[20px]">
                    {notif.type === 'payment' ? 'payments' :
                     notif.type === 'overdue' ? 'warning' :
                     notif.type === 'copilot' ? 'smart_toy' : 'notifications'}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-sm font-bold ${!notif.read ? 'text-primary' : 'text-on-surface'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[11px] text-outline shrink-0">{notif.timestamp}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                {notif.linkUrl && (
                  <ChevronRight className="w-5 h-5 text-outline-variant shrink-0 self-center" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
