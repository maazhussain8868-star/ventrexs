import React from 'react';
import { InvoiceStatus, PriorityLevel, RiskLevel } from '@/types';

interface BadgeProps {
  status?: InvoiceStatus;
  priority?: PriorityLevel;
  risk?: RiskLevel;
  size?: 'sm' | 'md';
  className?: string;
  label?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  priority,
  risk,
  size = 'md',
  className = '',
  label
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px] gap-1' : 'px-2.5 py-1 text-xs gap-1.5';

  if (status) {
    const config = {
      paid: {
        bg: 'bg-tertiary-container/15 text-tertiary border-tertiary/20',
        dot: 'bg-tertiary',
        text: 'PAID'
      },
      due: {
        bg: 'bg-primary-container/15 text-primary border-primary/20',
        dot: 'bg-primary',
        text: 'DUE'
      },
      sent: {
        bg: 'bg-sky-500/10 text-sky-700 border-sky-500/20',
        dot: 'bg-sky-500',
        text: 'SENT'
      },
      overdue: {
        bg: 'bg-error-container/40 text-error border-error/30',
        dot: 'bg-error',
        text: 'OVERDUE'
      },
      partially_paid: {
        bg: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
        dot: 'bg-indigo-500',
        text: 'PARTIAL'
      },
      disputed: {
        bg: 'bg-amber-500/15 text-amber-800 border-amber-500/30',
        dot: 'bg-amber-600',
        text: 'DISPUTED'
      },
      draft: {
        bg: 'bg-surface-variant text-on-surface-variant border-outline-variant',
        dot: 'bg-outline',
        text: 'DRAFT'
      }
    }[status];

    return (
      <span className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider border select-none ${config.bg} ${sizeClasses} ${className}`}>
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
        <span>{label || config.text}</span>
      </span>
    );
  }

  if (priority) {
    const config = {
      high: {
        bg: 'bg-error-container/30 text-error border-error/25',
        dot: 'bg-error',
        text: 'High Priority'
      },
      medium: {
        bg: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
        dot: 'bg-amber-500',
        text: 'Medium'
      },
      low: {
        bg: 'bg-surface-variant text-on-surface-variant border-outline-variant',
        dot: 'bg-outline',
        text: 'Standard'
      }
    }[priority];

    return (
      <span className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider border select-none ${config.bg} ${sizeClasses} ${className}`}>
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
        <span>{label || config.text}</span>
      </span>
    );
  }

  if (risk) {
    const config = {
      low: {
        bg: 'bg-tertiary-container/15 text-tertiary border-tertiary/20',
        dot: 'bg-tertiary',
        text: 'Prompt Payer (Low Risk)'
      },
      medium: {
        bg: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
        dot: 'bg-amber-500',
        text: 'Follow-up Needed'
      },
      high: {
        bg: 'bg-error-container/30 text-error border-error/25',
        dot: 'bg-error',
        text: 'High Priority Attention'
      }
    }[risk];

    return (
      <span className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider border select-none ${config.bg} ${sizeClasses} ${className}`}>
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
        <span>{label || config.text}</span>
      </span>
    );
  }

  return null;
};
