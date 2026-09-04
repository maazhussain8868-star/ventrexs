'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface LogoProps {
  /**
   * 'icon': Logo mark only (e.g. for sidebar collapsed, mobile header)
   * 'full': Logo mark + "Ventrexs AI" wordmark
   */
  variant?: 'icon' | 'full';
  /**
   * Predefined size presets or custom pixel size
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Optional custom classes for the container
   */
  className?: string;
  /**
   * If true, wraps the logo in a Link to home ('/')
   */
  href?: string;
  /**
   * Optional subtitle/tagline under the wordmark (e.g. 'Service OS' or 'Business Platform')
   */
  subtitle?: string;
  /**
   * Light or dark wordmark text styling
   */
  theme?: 'dark' | 'light' | 'auto';
}

const SIZE_MAP = {
  xs: { box: 'w-6 h-6', px: 24, text: 'text-sm' },
  sm: { box: 'w-8 h-8', px: 32, text: 'text-base' },
  md: { box: 'w-10 h-10', px: 40, text: 'text-lg' },
  lg: { box: 'w-12 h-12', px: 48, text: 'text-xl' },
  xl: { box: 'w-16 h-16', px: 64, text: 'text-2xl' },
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  href,
  subtitle,
  theme = 'auto',
}) => {
  const [imgError, setImgError] = useState(false);
  const dims = SIZE_MAP[size] || SIZE_MAP.md;

  const textColor =
    theme === 'dark'
      ? 'text-white'
      : theme === 'light'
      ? 'text-slate-900 dark:text-white'
      : 'text-on-surface';

  const logoMark = (
    <div
      className={`relative ${dims.box} shrink-0 flex items-center justify-center rounded-xl overflow-hidden transition-transform duration-200 group-hover:scale-105 ${className}`}
    >
      {!imgError ? (
        <Image
          src="/logo.png"
          alt="Ventrexs AI Logo"
          width={dims.px}
          height={dims.px}
          className="w-full h-full object-contain"
          onError={() => setImgError(true)}
          priority
        />
      ) : (
        /* Fallback branded vector mark if logo image is unavailable */
        <div className="w-full h-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3/5 h-3/5">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
      )}
    </div>
  );

  const content = (
    <div className="flex items-center gap-2.5 group select-none">
      {logoMark}

      {variant === 'full' && (
        <div className="flex flex-col text-left leading-tight">
          <span className={`font-black ${dims.text} tracking-tight ${textColor} flex items-center gap-1`}>
            Ventrexs <span className="text-blue-500 font-extrabold">AI</span>
          </span>
          {subtitle && (
            <span className="text-[10px] uppercase font-mono tracking-wider text-outline font-semibold">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
};
