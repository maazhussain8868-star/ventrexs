'use client';

import React from 'react';
import { PlanKey, SubscriptionStatus } from '@/types';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface PlanBadgeProps {
  plan: PlanKey;
  status?: SubscriptionStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function PlanBadge({
  plan,
  status = 'active',
  size = 'md',
  showIcon = true,
}: PlanBadgeProps) {
  const getPlanStyles = () => {
    switch (plan) {
      case 'Enterprise':
        return {
          bg: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
          icon: <Zap className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          label: 'Enterprise',
        };
      case 'Professional':
        return {
          bg: 'bg-primary/10 text-primary border-primary/20',
          icon: <Sparkles className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          label: 'Professional',
        };
      case 'Starter':
      default:
        return {
          bg: 'bg-surface-container-high text-on-surface-variant border-outline-variant',
          icon: <ShieldCheck className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          label: 'Starter',
        };
    }
  };

  const planStyle = getPlanStyles();

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  const isInactive = status !== 'active' && status !== 'trialing';

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border ${planStyle.bg} ${sizeClasses} ${
        isInactive ? 'opacity-60 saturate-50' : ''
      }`}
    >
      {showIcon && planStyle.icon}
      <span>{planStyle.label}</span>
      {status === 'trialing' && (
        <span className="text-[10px] uppercase tracking-wider bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.2 rounded font-bold ml-1">
          Trial
        </span>
      )}
      {isInactive && (
        <span className="text-[10px] uppercase tracking-wider bg-error/20 text-error px-1.5 py-0.2 rounded font-bold ml-1">
          {status}
        </span>
      )}
    </span>
  );
}
