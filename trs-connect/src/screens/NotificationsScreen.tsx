import React, { useState } from 'react';
import { useApp, AppScreen } from '../context/AppContext';
import { useI18n } from '../context/I18nContext';
import {
  Bell,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCheck
} from 'lucide-react';

export const NotificationsScreen: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    navigateTo
  } = useApp();
  const { t } = useI18n();

  const [filter, setFilter] = useState<'all' | 'membership' | 'issue' | 'event'>('all');

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'membership':
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      case 'issue':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'event':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-green-600" />;
    }
  };

  const handleNotificationClick = (item: (typeof notifications)[0]) => {
    markNotificationRead(item.id);
    if (item.targetScreen) {
      navigateTo(item.targetScreen as AppScreen);
    }
  };

  return (
    <div className="pb-24 pt-2 px-4 space-y-4 max-w-md mx-auto select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 leading-tight">
            {t('notifications')}
          </h2>
          <p className="text-xs text-slate-500">
            {unreadCount > 0 ? `${unreadCount} unread announcements & updates` : 'All caught up'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {(['all', 'membership', 'issue', 'event'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
              filter === type
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {type === 'all' ? 'All Alerts' : `${type}s`}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs space-y-2">
            <Bell className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-sm text-slate-700">No Notifications</h4>
            <p className="text-xs text-slate-500">
              You are completely up to date with ward alerts and party announcements.
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative shadow-xs ${
                n.read
                  ? 'bg-white border-slate-200 opacity-80'
                  : 'bg-emerald-50/40 border-emerald-300 shadow-sm'
              }`}
            >
              {!n.read && (
                <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-600" />
              )}

              <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-100 flex items-center justify-center flex-shrink-0">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 overflow-hidden space-y-1 pr-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 leading-snug">
                    {n.title}
                  </h4>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {n.message}
                </p>

                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                  <span>{n.timeAgo}</span>
                  {n.targetScreen && (
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                      <span>View</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
