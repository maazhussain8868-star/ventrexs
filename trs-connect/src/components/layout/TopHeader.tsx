import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n, SupportedLanguage } from '../../context/I18nContext';
import { Bell, ArrowLeft, Globe, Shield, Sparkles, UserCheck, Menu, X, HeartHandshake } from 'lucide-react';

export const TopHeader: React.FC = () => {
  const { currentScreen, navigateTo, unreadCount, membership, user } = useApp();
  const { language, setLanguage, t } = useI18n();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  const isSubScreen = [
    'youth_hub',
    'volunteer',
    'notifications'
  ].includes(currentScreen);

  const languages: { code: SupportedLanguage; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी' }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-800 text-white shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left section: Logo or Back */}
          <div className="flex items-center gap-2.5">
            {isSubScreen ? (
              <button
                onClick={() => navigateTo('home')}
                className="p-1.5 -ml-1.5 rounded-full hover:bg-white/15 active:scale-95 transition-all text-white flex items-center gap-1.5"
                aria-label="Go Back"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-xs font-semibold text-white/90">Back</span>
              </button>
            ) : (
              <div
                onClick={() => navigateTo('home')}
                className="flex items-center gap-2 cursor-pointer select-none group"
              >
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm p-1 border border-amber-300">
                  <div className="w-full h-full rounded-lg bg-emerald-700 flex items-center justify-center text-amber-400 font-extrabold text-sm tracking-wider">
                    TRS
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base tracking-tight leading-none text-white drop-shadow-sm">
                      TRS CONNECT
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-amber-400 text-emerald-950">
                      OFFICIAL
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-100/90 font-medium block leading-tight mt-0.5">
                    {t('appTagline')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right section: Language & Notification */}
          <div className="flex items-center gap-2">
            {/* Language Selector Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1 bg-white/10 hover:bg-white/20 active:scale-95 px-2.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-white/20 transition-all"
                title="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-amber-300" />
                <span>{language.toUpperCase()}</span>
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-2xl border border-emerald-100 py-1.5 z-50 text-slate-800">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    {t('changeLanguage')}
                  </div>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                        language === lang.code ? 'text-emerald-700 font-bold bg-emerald-50/70' : 'text-slate-700'
                      }`}
                    >
                      <span>{lang.native}</span>
                      {language === lang.code && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => navigateTo('notifications')}
              className="relative p-2 rounded-full hover:bg-white/15 active:scale-95 transition-all text-white"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5 text-white" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-400 text-emerald-950 font-bold text-[10px] rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Mobile Menu / Drawer */}
            <button
              onClick={() => setShowDrawer(true)}
              className="p-2 rounded-full hover:bg-white/15 active:scale-95 transition-all text-white"
              aria-label="Quick Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Quick Access Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowDrawer(false)}
          />
          <div className="relative w-72 max-w-full bg-white h-full shadow-2xl z-10 flex flex-col justify-between p-5 text-slate-800 animate-slide-left">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-amber-400 font-bold text-xs">
                    TRS
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-emerald-950 leading-tight">TRS Connect</h3>
                    <p className="text-[11px] text-slate-500">Official Civic Gateway</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Mini Card */}
              <div className="my-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm overflow-hidden">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    user?.fullName ? user.fullName.charAt(0) : 'C'
                  )}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-xs text-emerald-950 truncate">{user?.fullName || 'Active Citizen'}</h4>
                  <p className="text-[10px] text-emerald-700 font-medium truncate">{user?.constituency || 'Telangana'}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span className="text-[10px] font-semibold text-emerald-800">
                      {membership?.status === 'approved' ? 'Approved Member' : membership?.status === 'pending' ? 'Application Pending' : 'Citizen Access'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Nav Links */}
              <nav className="space-y-1">
                <button
                  onClick={() => {
                    navigateTo('membership');
                    setShowDrawer(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                >
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>{t('membershipCardTitle')}</span>
                </button>

                <button
                  onClick={() => {
                    navigateTo('youth_hub');
                    setShowDrawer(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>{t('youthHubTitle')}</span>
                </button>

                <button
                  onClick={() => {
                    navigateTo('volunteer');
                    setShowDrawer(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                >
                  <HeartHandshake className="w-4 h-4 text-rose-500" />
                  <span>{t('volunteerTitle')}</span>
                </button>

                <button
                  onClick={() => {
                    navigateTo('notifications');
                    setShowDrawer(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                >
                  <Bell className="w-4 h-4 text-blue-500" />
                  <span>{t('notifications')}</span>
                  {unreadCount > 0 && (
                    <span className="ml-auto bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </button>
              </nav>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
              <p className="font-semibold text-emerald-900">TRS Connect v1.0.0</p>
              <p>Official Platform • Non-profiling Protected</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
