'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { ArrowLeft, X } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backUrl?: string;
  actions?: React.ReactNode;
  userEmail?: string | null;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  subtitle,
  showBack,
  backUrl = '/admin',
  actions,
  userEmail,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-900 flex flex-col font-sans antialiased">
      <AdminHeader
        userEmail={userEmail}
        onToggleMobileMenu={() => setMobileDrawerOpen(true)}
      />

      <div className="flex-1 flex min-w-0">
        {/* Desktop Persistent Sidebar */}
        <div className="hidden lg:block shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
          <AdminSidebar />
        </div>

        {/* Mobile Slide-Out Drawer */}
        {mobileDrawerOpen && (
          <div
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs lg:hidden animate-in fade-in"
            onClick={() => setMobileDrawerOpen(false)}
          >
            <div
              className="w-72 h-full bg-white border-r border-slate-200 p-4 flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-2">
                <span className="font-extrabold text-sm text-slate-900">Admin Navigation</span>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto -mx-2 px-2">
                <AdminSidebar onNavigate={() => setMobileDrawerOpen(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0 overflow-y-auto space-y-6">
          {(title || showBack || actions) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-slate-200/80">
              <div className="flex items-center gap-3 min-w-0">
                {showBack && (
                  <Link
                    href={backUrl}
                    className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors border border-slate-200 shadow-2xs min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
                    aria-label="Go back"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                )}
                <div className="min-w-0">
                  {title && (
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{subtitle}</p>
                  )}
                </div>
              </div>

              {actions && (
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                  {actions}
                </div>
              )}
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
};
