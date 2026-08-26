import React from 'react';
import { 
  InvoiceStatus, 
  PriorityLevel, 
  RiskLevel, 
  LeadStatus, 
  LeadPriority, 
  AppointmentStatus, 
  JobStatus, 
  EstimateStatus,
  ReviewRequestStatus,
  FollowUpStatus
} from '@/types';

interface BadgeProps {
  status?: InvoiceStatus;
  leadStatus?: LeadStatus;
  priority?: PriorityLevel | LeadPriority;
  risk?: RiskLevel;
  appointmentStatus?: AppointmentStatus;
  jobStatus?: JobStatus;
  estimateStatus?: EstimateStatus;
  reviewStatus?: ReviewRequestStatus;
  followUpStatus?: FollowUpStatus;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  leadStatus,
  priority,
  risk,
  appointmentStatus,
  jobStatus,
  estimateStatus,
  reviewStatus,
  followUpStatus,
  variant,
  size = 'md',
  className = '',
  label,
  dot = true,
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  }[size];

  // 1. Lead Statuses
  if (leadStatus) {
    const config: Record<LeadStatus, { bg: string; dot: string; text: string }> = {
      NEW: {
        bg: 'bg-primary-container/15 text-primary border-primary/20',
        dot: 'bg-primary',
        text: 'NEW LEAD'
      },
      CONTACTED: {
        bg: 'bg-sky-500/10 text-sky-700 border-sky-500/20',
        dot: 'bg-sky-500',
        text: 'CONTACTED'
      },
      QUALIFIED: {
        bg: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
        dot: 'bg-indigo-500',
        text: 'QUALIFIED'
      },
      ESTIMATE_SENT: {
        bg: 'bg-amber-500/15 text-amber-800 border-amber-500/30',
        dot: 'bg-amber-600',
        text: 'ESTIMATE SENT'
      },
      BOOKED: {
        bg: 'bg-teal-500/15 text-teal-800 border-teal-500/30',
        dot: 'bg-teal-600',
        text: 'BOOKED'
      },
      WON: {
        bg: 'bg-tertiary-container/15 text-tertiary border-tertiary/20',
        dot: 'bg-tertiary',
        text: 'WON'
      },
      LOST: {
        bg: 'bg-surface-variant text-on-surface-variant border-outline-variant',
        dot: 'bg-outline',
        text: 'LOST'
      }
    };

    const cfg = config[leadStatus] || config.NEW;
    return (
      <span className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider border select-none ${cfg.bg} ${sizeClasses} ${className}`}>
        {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />}
        <span>{label || cfg.text}</span>
      </span>
    );
  }

  // 2. Appointment Statuses
  if (appointmentStatus) {
    const config: Record<AppointmentStatus, { bg: string; dot: string; text: string }> = {
      SCHEDULED: {
        bg: 'bg-primary-container/15 text-primary border-primary/20',
        dot: 'bg-primary',
        text: 'SCHEDULED'
      },
      CONFIRMED: {
        bg: 'bg-tertiary-container/15 text-tertiary border-tertiary/20',
        dot: 'bg-tertiary',
        text: 'CONFIRMED'
      },
      IN_PROGRESS: {
        bg: 'bg-amber-500/15 text-amber-800 border-amber-500/30',
        dot: 'bg-amber-600',
        text: 'IN PROGRESS'
      },
      COMPLETED: {
        bg: 'bg-tertiary-container/20 text-tertiary border-tertiary/30',
        dot: 'bg-tertiary',
        text: 'COMPLETED'
      },
      CANCELLED: {
        bg: 'bg-error-container/30 text-error border-error/20',
        dot: 'bg-error',
        text: 'CANCELLED'
      }
    };

    const cfg = config[appointmentStatus] || config.SCHEDULED;
    return (
      <span className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider border select-none ${cfg.bg} ${sizeClasses} ${className}`}>
        {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />}
        <span>{label || cfg.text}</span>
      </span>
    );
  }

  // 3. Job Statuses
  if (jobStatus) {
    const config: Record<JobStatus, { bg: string; dot: string; text: string }> = {
      NEW: {
        bg: 'bg-primary-container/15 text-primary border-primary/20',
        dot: 'bg-primary',
        text: 'NEW'
      },
      SCHEDULED: {
        bg: 'bg-sky-500/15 text-sky-800 border-sky-500/30',
        dot: 'bg-sky-600',
        text: 'SCHEDULED'
      },
      DISPATCHED: {
        bg: 'bg-indigo-500/15 text-indigo-800 border-indigo-500/30',
        dot: 'bg-indigo-600',
        text: 'DISPATCHED'
      },
      IN_PROGRESS: {
        bg: 'bg-amber-500/15 text-amber-800 border-amber-500/30',
        dot: 'bg-amber-600',
        text: 'IN PROGRESS'
      },
      ON_HOLD: {
        bg: 'bg-surface-variant text-on-surface-variant border-outline-variant',
        dot: 'bg-outline',
        text: 'ON HOLD'
      },
      COMPLETED: {
        bg: 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30',
        dot: 'bg-emerald-600',
        text: 'COMPLETED'
      },
      INVOICED: {
        bg: 'bg-primary-container/15 text-primary border-primary/20',
        dot: 'bg-primary',
        text: 'INVOICED'
      },
      CANCELLED: {
        bg: 'bg-error-container/30 text-error border-error/20',
        dot: 'bg-error',
        text: 'CANCELLED'
      },
      PENDING: {
        bg: 'bg-surface-variant text-on-surface-variant border-outline-variant',
        dot: 'bg-outline',
        text: 'PENDING'
      }
    };

    const cfg = config[jobStatus] || config.NEW;
    return (
      <span className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider border select-none ${cfg.bg} ${sizeClasses} ${className}`}>
        {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />}
        <span>{label || cfg.text}</span>
      </span>
    );
  }

  // 4. Estimate Statuses
  if (estimateStatus) {
    const config: Record<EstimateStatus, { bg: string; dot: string; text: string }> = {
      DRAFT: {
        bg: 'bg-surface-variant text-on-surface-variant border-outline-variant',
        dot: 'bg-outline',
        text: 'DRAFT'
      },
      SENT: {
        bg: 'bg-sky-500/15 text-sky-800 border-sky-500/30',
        dot: 'bg-sky-600',
        text: 'SENT'
      },
      VIEWED: {
        bg: 'bg-indigo-500/15 text-indigo-800 border-indigo-500/30',
        dot: 'bg-indigo-600',
        text: 'VIEWED'
      },
      APPROVED: {
        bg: 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30',
        dot: 'bg-emerald-600',
        text: 'APPROVED'
      },
      REJECTED: {
        bg: 'bg-rose-500/15 text-rose-800 border-rose-500/30',
        dot: 'bg-rose-600',
        text: 'REJECTED'
      },
      EXPIRED: {
        bg: 'bg-surface-variant text-outline border-outline-variant',
        dot: 'bg-outline',
        text: 'EXPIRED'
      },
      CANCELLED: {
        bg: 'bg-error-container/30 text-error border-error/20',
        dot: 'bg-error',
        text: 'CANCELLED'
      }
    };

    const cfg = config[estimateStatus] || config.DRAFT;
    return (
      <span className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider border select-none ${cfg.bg} ${sizeClasses} ${className}`}>
        {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />}
        <span>{label || cfg.text}</span>
      </span>
    );
  }

  // 5. Review Request Statuses
  if (reviewStatus) {
    const config: Record<ReviewRequestStatus, { bg: string; dot: string; text: string }> = {
      PENDING: {
        bg: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
        dot: 'bg-amber-500',
        text: 'PENDING'
      },
      SCHEDULED: {
        bg: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
        dot: 'bg-indigo-500',
        text: 'SCHEDULED'
      },
      SENT: {
        bg: 'bg-sky-500/10 text-sky-700 border-sky-500/20',
        dot: 'bg-sky-500',
        text: 'SENT'
      },
      DELIVERED: {
        bg: 'bg-teal-500/15 text-teal-800 border-teal-500/30',
        dot: 'bg-teal-600',
        text: 'DELIVERED'
      },
      OPENED: {
        bg: 'bg-primary-container/15 text-primary border-primary/20',
        dot: 'bg-primary',
        text: 'OPENED'
      },
      COMPLETED: {
        bg: 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30',
        dot: 'bg-emerald-600',
        text: 'COMPLETED'
      },
      FAILED: {
        bg: 'bg-rose-500/15 text-rose-800 border-rose-500/30',
        dot: 'bg-rose-600',
        text: 'FAILED'
      },
      CANCELLED: {
        bg: 'bg-surface-variant text-outline border-outline-variant',
        dot: 'bg-outline',
        text: 'CANCELLED'
      }
    };

    const cfg = config[reviewStatus] || config.PENDING;
    return (
      <span className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider border select-none ${cfg.bg} ${sizeClasses} ${className}`}>
        {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />}
        <span>{label || cfg.text}</span>
      </span>
    );
  }

  // 6. Feedback Follow-Up Statuses
  if (followUpStatus) {
    const config: Record<FollowUpStatus, { bg: string; dot: string; text: string }> = {
      NEW: {
        bg: 'bg-rose-500/15 text-rose-800 border-rose-500/30 font-bold',
        dot: 'bg-rose-600',
        text: 'ACTION NEEDED'
      },
      IN_REVIEW: {
        bg: 'bg-amber-500/15 text-amber-800 border-amber-500/30',
        dot: 'bg-amber-600',
        text: 'IN REVIEW'
      },
      CONTACTED: {
        bg: 'bg-sky-500/10 text-sky-700 border-sky-500/20',
        dot: 'bg-sky-500',
        text: 'CONTACTED'
      },
      RESOLVED: {
        bg: 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30',
        dot: 'bg-emerald-600',
        text: 'RESOLVED'
      },
      CLOSED: {
        bg: 'bg-surface-variant text-on-surface-variant border-outline-variant',
        dot: 'bg-outline',
        text: 'CLOSED'
      }
    };

    const cfg = config[followUpStatus] || config.NEW;
    return (
      <span className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider border select-none ${cfg.bg} ${sizeClasses} ${className}`}>
        {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />}
        <span>{label || cfg.text}</span>
      </span>
    );
  }

  // 5. Invoice Statuses
  if (status) {
    const normalizedStatus = String(status).toLowerCase();
    const configMap: Record<string, { bg: string; dot: string; text: string }> = {
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
    };

    const cfg = configMap[normalizedStatus] || {
      bg: 'bg-surface-variant text-on-surface-variant border-outline-variant',
      dot: 'bg-outline',
      text: String(status).toUpperCase()
    };

    return (
      <span className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider border select-none ${cfg.bg} ${sizeClasses} ${className}`}>
        {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />}
        <span>{label || cfg.text}</span>
      </span>
    );
  }

  // 6. Priorities
  if (priority) {
    const normalizedPriority = String(priority).toLowerCase();
    const configMap: Record<string, { bg: string; dot: string; text: string }> = {
      urgent: {
        bg: 'bg-error text-on-error border-error shadow-xs',
        dot: 'bg-white',
        text: 'Urgent'
      },
      high: {
        bg: 'bg-error-container/30 text-error border-error/25',
        dot: 'bg-error',
        text: 'High'
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
    };

    const cfg = configMap[normalizedPriority] || {
      bg: 'bg-surface-variant text-on-surface-variant border-outline-variant',
      dot: 'bg-outline',
      text: String(priority)
    };

    return (
      <span className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider border select-none ${cfg.bg} ${sizeClasses} ${className}`}>
        {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />}
        <span>{label || cfg.text}</span>
      </span>
    );
  }

  // 7. Customer Risk
  if (risk) {
    const normalizedRisk = String(risk).toLowerCase();
    const configMap: Record<string, { bg: string; dot: string; text: string }> = {
      low: {
        bg: 'bg-tertiary-container/15 text-tertiary border-tertiary/20',
        dot: 'bg-tertiary',
        text: 'Low Risk'
      },
      medium: {
        bg: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
        dot: 'bg-amber-500',
        text: 'Medium Risk'
      },
      high: {
        bg: 'bg-error-container/30 text-error border-error/25',
        dot: 'bg-error',
        text: 'High Risk'
      }
    };

    const cfg = configMap[normalizedRisk] || {
      bg: 'bg-surface-variant text-on-surface-variant border-outline-variant',
      dot: 'bg-outline',
      text: String(risk)
    };

    return (
      <span className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider border select-none ${cfg.bg} ${sizeClasses} ${className}`}>
        {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />}
        <span>{label || cfg.text}</span>
      </span>
    );
  }

  // 8. Generic Variant
  if (variant) {
    const configMap: Record<string, string> = {
      primary: 'bg-primary-container/15 text-primary border-primary/20',
      secondary: 'bg-surface-variant text-on-surface-variant border-outline-variant',
      success: 'bg-tertiary-container/15 text-tertiary border-tertiary/20',
      warning: 'bg-amber-500/15 text-amber-800 border-amber-500/30',
      error: 'bg-error-container/40 text-error border-error/30',
      info: 'bg-sky-500/10 text-sky-700 border-sky-500/20',
      neutral: 'bg-surface-container-high text-on-surface-variant border-outline-variant/60'
    };

    const cfg = configMap[variant] || configMap.neutral;

    return (
      <span className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider border select-none ${cfg} ${sizeClasses} ${className}`}>
        <span>{label}</span>
      </span>
    );
  }

  return null;
};
