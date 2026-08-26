'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UserCheck, Kanban, Calendar, FileText } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/dashboard', icon: <Home className="w-5 h-5" /> },
    { label: 'Leads', href: '/leads', icon: <UserCheck className="w-5 h-5" /> },
    { label: 'Pipeline', href: '/pipeline', icon: <Kanban className="w-5 h-5" /> },
    { label: 'Schedule', href: '/appointments', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Invoices', href: '/invoices', icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-1.5 bg-surface/95 backdrop-blur-md border-t border-outline-variant shadow-lg">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all min-h-[44px] min-w-[44px] ${
              isActive
                ? 'bg-primary-fixed/40 text-primary font-bold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className={isActive ? 'text-primary' : 'text-on-surface-variant'}>
              {item.icon}
            </span>
            <span className="text-[10px] font-semibold mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
