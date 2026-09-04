import React from 'react';
import { useApp, BottomTab } from '../../context/AppContext';
import { useI18n } from '../../context/I18nContext';
import { Home, MapPin, Calendar, AlertCircle, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const { t } = useI18n();

  const navItems: { id: BottomTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'home',
      label: t('navHome'),
      icon: <Home className="w-5 h-5" />
    },
    {
      id: 'my_area',
      label: t('navMyArea'),
      icon: <MapPin className="w-5 h-5" />
    },
    {
      id: 'events',
      label: t('navEvents'),
      icon: <Calendar className="w-5 h-5" />
    },
    {
      id: 'issues',
      label: t('navIssues'),
      icon: <AlertCircle className="w-5 h-5" />
    },
    {
      id: 'profile',
      label: t('navProfile'),
      icon: <User className="w-5 h-5" />
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-emerald-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 py-1.5 px-1 flex flex-col items-center justify-center relative transition-all duration-200 active:scale-90 select-none ${
                isActive ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
              aria-label={item.label}
            >
              {/* Active top indicator pill */}
              {isActive && (
                <span className="absolute -top-1.5 w-7 h-1 bg-gradient-to-r from-emerald-600 to-amber-400 rounded-full" />
              )}

              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-emerald-50 text-emerald-700 shadow-xs scale-110' : ''
                }`}
              >
                {item.icon}
              </div>

              <span className="text-[11px] leading-tight mt-0.5 tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
