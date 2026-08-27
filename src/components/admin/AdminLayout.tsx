'use client';

import React from 'react';
import Link from 'next/link';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { ArrowLeft } from 'lucide-react';

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
  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-900 flex flex-col font-sans antialiased">
      <AdminHeader userEmail={userEmail} />

      <div className="flex-1 flex min-w-0">
        <AdminSidebar />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0 overflow-y-auto space-y-6">
          {(title || showBack || actions) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
              <div className="flex items-center gap-3">
                {showBack && (
                  <Link
                    href={backUrl}
                    className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors border border-slate-200 shadow-2xs"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                )}
                <div>
                  {title && (
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
                  )}
                </div>
              </div>

              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
};
