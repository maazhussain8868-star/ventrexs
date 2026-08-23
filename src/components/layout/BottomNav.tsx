'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/dashboard', mIcon: 'home' },
    { label: 'Invoices', href: '/invoices', mIcon: 'description' },
    { label: 'Collections', href: '/collections', mIcon: 'payments' },
    { label: 'AI', href: '/copilot', mIcon: 'smart_toy' },
    { label: 'Profile', href: '/profile', mIcon: 'person' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 bg-surface/95 backdrop-blur-md border-t border-outline-variant shadow-lg">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center px-3 py-1 transition-all ${
              isActive
                ? 'bg-secondary-container text-on-secondary-container rounded-full scale-95 duration-100'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span 
              className={`material-symbols-outlined text-[22px] ${isActive ? 'fill-icon' : ''}`}
            >
              {item.mIcon}
            </span>
            <span className="text-[11px] font-semibold mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
