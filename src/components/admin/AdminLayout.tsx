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
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      <AdminHeader userEmail={userEmail} />

      <div className="flex-1 flex">
        <AdminSidebar />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto space-y-6">
          {(title || showBack || actions) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/40">
              <div className="flex items-center gap-3">
                {showBack && (
                  <Link
                    href={backUrl}
                    className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-slate-300 hover:text-white transition-colors border border-outline-variant/40"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                )}
                <div>
                  {title && (
                    <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
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
